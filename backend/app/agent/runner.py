"""
AI Agent runner with Groq SDK integration (OpenAI-compatible).
Orchestrates tool calls and generates responses.
"""
import json
from typing import AsyncGenerator, List, Dict, Any, Optional
from openai import AsyncOpenAI

from app.config import get_settings
from app.mcp.server import mcp_server
from app.agent.prompts import get_system_prompt
from app.schemas.chat import ToolInvocation


class AgentRunner:
    """
    AI Agent that interprets user messages and invokes MCP tools.

    Uses Groq's function calling to select and execute tools,
    then generates natural language responses.
    """

    def __init__(self):
        settings = get_settings()
        # Use Groq's OpenAI-compatible API (free tier)
        self.client = AsyncOpenAI(
            api_key=settings.groq_api_key,
            base_url="https://api.groq.com/openai/v1"
        )
        self.model = "llama-3.3-70b-versatile"  # Groq's best model with tool calling

    async def run(
        self,
        user_message: str,
        user_id: str,
        conversation_history: List[Dict[str, str]] = None
    ) -> tuple[str, List[ToolInvocation]]:
        """
        Process a user message and return response with tool invocations.

        Args:
            user_message: The user's natural language message
            user_id: User ID for tool isolation
            conversation_history: Previous messages for context

        Returns:
            Tuple of (response_message, list_of_tool_invocations)
        """
        tools_invoked: List[ToolInvocation] = []

        # Build messages array
        messages = self._build_messages(user_message, conversation_history)

        # Get tool definitions
        tools = mcp_server.get_tool_definitions()

        # Call OpenAI with tools
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            tools=tools if tools else None,
            tool_choice="auto" if tools else None,
        )

        assistant_message = response.choices[0].message

        # Handle tool calls if any
        while assistant_message.tool_calls:
            # Execute each tool call
            tool_results = []
            for tool_call in assistant_message.tool_calls:
                tool_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)

                # Inject user_id into tool arguments for isolation
                arguments["user_id"] = user_id

                # Execute the tool
                result = await mcp_server.execute_tool(tool_name, arguments)

                # Record the invocation
                tools_invoked.append(ToolInvocation(
                    tool_name=tool_name,
                    success=result.get("success", False),
                    result=result.get("data"),
                    error=result.get("error")
                ))

                tool_results.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "content": json.dumps(result)
                })

            # Add assistant message with tool calls and tool results to conversation
            # Convert to dict format for Groq compatibility
            messages.append({
                "role": "assistant",
                "content": assistant_message.content or "",
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments
                        }
                    }
                    for tc in assistant_message.tool_calls
                ]
            })
            messages.extend(tool_results)

            # Get next response
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=tools if tools else None,
                tool_choice="auto" if tools else None,
            )
            assistant_message = response.choices[0].message

        return assistant_message.content or "", tools_invoked

    async def run_stream(
        self,
        user_message: str,
        user_id: str,
        conversation_history: List[Dict[str, str]] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Process a user message and stream the response.

        Yields chunks of the response as they become available.
        Tool invocations are yielded first, then response text.
        """
        tools_invoked: List[ToolInvocation] = []

        # Build messages array
        messages = self._build_messages(user_message, conversation_history)

        # Get tool definitions
        tools = mcp_server.get_tool_definitions()

        # First, handle any tool calls (non-streaming for tool execution)
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            tools=tools if tools else None,
            tool_choice="auto" if tools else None,
        )

        assistant_message = response.choices[0].message

        # Handle tool calls
        while assistant_message.tool_calls:
            tool_results = []
            for tool_call in assistant_message.tool_calls:
                tool_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)
                arguments["user_id"] = user_id

                result = await mcp_server.execute_tool(tool_name, arguments)

                invocation = ToolInvocation(
                    tool_name=tool_name,
                    success=result.get("success", False),
                    result=result.get("data"),
                    error=result.get("error")
                )
                tools_invoked.append(invocation)

                # Yield tool invocation
                yield {"type": "tool_invocation", "data": invocation.model_dump()}

                tool_results.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "content": json.dumps(result)
                })

            messages.append(assistant_message)
            messages.extend(tool_results)

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=tools if tools else None,
                tool_choice="auto" if tools else None,
            )
            assistant_message = response.choices[0].message

        # Now stream the final response
        messages.append({"role": "assistant", "content": assistant_message.content or ""})

        # Stream the actual response content
        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=messages[:-1],  # Remove the assistant message we added
            stream=True,
        )

        full_content = ""
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                full_content += content
                yield {"type": "content", "data": content}

        # Yield completion marker
        yield {"type": "done", "data": {"tools_invoked": [t.model_dump() for t in tools_invoked]}}

    def _build_messages(
        self,
        user_message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> List[Dict[str, str]]:
        """Build the messages array for OpenAI API."""
        messages = [{"role": "system", "content": get_system_prompt()}]

        if conversation_history:
            messages.extend(conversation_history)

        messages.append({"role": "user", "content": user_message})

        return messages


# Global agent instance
agent_runner = AgentRunner()
