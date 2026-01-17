<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 2.0.0 (MAJOR - Phase III architectural transformation)
Modified principles:
  - "Spec-Driven Development" → "Deterministic & Reviewable Development" (evolved)
  - "Security-First Design" → "Security & User Isolation" (MCP-focused)
  - "Separation of Concerns" → REMOVED (replaced by AI-first single endpoint)
  - "API-First Design" → REMOVED (replaced by MCP Tool Standards)
  - "Quality and Type Safety" → Merged into technology requirements
  - "Technology Stack Compliance" → Updated for Phase III stack
Added sections:
  - AI-First Architecture (new core principle)
  - Statelessness by Design (new core principle)
  - Tool-Driven Execution (new core principle)
  - MCP Tool Standards (new section)
  - Agent Behavior Standards (new section)
  - Conversation Management Rules (new section)
Removed sections:
  - Separation of Concerns principle
  - API-First Design principle
  - Authentication Flow (now part of Security & User Isolation)
Templates requiring updates:
  - .specify/templates/plan-template.md ⚠ pending (Constitution Check needs MCP alignment)
  - .specify/templates/spec-template.md ✅ (compatible - user stories format unchanged)
  - .specify/templates/tasks-template.md ✅ (compatible - phase structure unchanged)
Follow-up TODOs:
  - Update plan-template.md Constitution Check section for MCP tool requirements
-->

# AI-Native Todo Chatbot Constitution (Phase III)

## Core Principles

### I. AI-First Architecture

The AI agent MUST be the primary decision-maker for all business logic routing.

- Business logic routing MUST be handled by the AI agent via MCP tools, NOT by conditional backend code
- The AI agent MUST interpret natural language and map it to appropriate MCP tools
- The AI agent MUST chain tools when necessary to complete complex operations
- The AI agent MUST generate friendly, human-like confirmations for all operations
- The AI agent MUST handle errors gracefully and explain them clearly to users
- Direct database manipulation by the agent is FORBIDDEN; only MCP tools may access data

**Rationale**: Enables natural language interaction, centralizes business logic in the AI layer, and ensures consistent user experience across all operations.

### II. Statelessness by Design

No server-side memory SHALL be used; all state MUST be persisted in PostgreSQL.

- All application state MUST be persisted in the database and reconstructed per request
- All conversation state MUST be persisted in the database and reconstructed per request
- No in-memory caches SHALL be used for session or conversation data
- No background workers SHALL be used for state management
- The system MUST resume correctly after server restarts
- Each request MUST be self-contained and independently processable

**Rationale**: Ensures horizontal scalability, restart-safety, and eliminates race conditions from shared mutable state.

### III. Tool-Driven Execution

AI agents MUST perform all task operations exclusively through MCP tools.

- All task CRUD operations MUST be executed through MCP tools
- MCP tools MUST be stateless and accept `user_id` explicitly
- MCP tools MUST enforce user isolation at the tool level
- MCP tools MUST return structured JSON responses
- MCP tools MUST NEVER infer or assume state
- Direct database queries outside MCP tools are FORBIDDEN for task operations

**Rationale**: Ensures auditability, enforces security boundaries, and provides clear separation between AI reasoning and data operations.

### IV. Deterministic & Reviewable Development

Every development phase MUST follow the Agentic Dev Stack workflow without deviation.

- Every feature MUST follow: spec → plan → tasks → implementation
- Skipping workflow steps is FORBIDDEN
- No manual coding is allowed; all code MUST be generated via Claude Code
- Every feature MUST trace back to a written specification requirement
- All API behavior MUST be explicitly defined before implementation begins
- Database schema changes MUST be reflected in ORM models and specs

**Rationale**: Ensures traceability, prevents scope creep, maintains alignment between requirements and implementation, and enables reproducible development.

### V. Security & User Isolation

All operations MUST be scoped strictly to the authenticated user.

- JWT authentication MUST be required for all chat endpoints
- User ID MUST be derived from JWT payload, NEVER trusted from client input
- MCP tools MUST enforce user isolation by requiring `user_id` parameter
- Each user MUST only access their own tasks and conversations
- Unauthorized requests MUST return HTTP 401 (Unauthorized)
- Forbidden cross-user access attempts MUST return HTTP 403 (Forbidden)
- Secrets and tokens MUST NEVER be hardcoded; use `.env` files exclusively
- CORS MUST be configured to allow only the frontend origin

**Rationale**: Prevents data leaks, ensures compliance with security best practices, and protects user privacy in a multi-tenant environment.

## Technology Stack Requirements

### Hard Rules (No Deviation Allowed)

| Layer          | Required Technology           |
|----------------|-------------------------------|
| Frontend       | OpenAI ChatKit                |
| Backend        | Python FastAPI                |
| AI Logic       | OpenAI Agents SDK             |
| MCP Server     | Official MCP SDK              |
| ORM            | SQLModel                      |
| Database       | Neon Serverless PostgreSQL    |
| Authentication | Better Auth (JWT-based)       |
| Spec-Driven    | Claude Code + Spec-Kit Plus   |

- No alternative frameworks SHALL be substituted without ADR approval
- No in-memory caches SHALL be used
- No background workers SHALL be used
- No manual code edits are allowed
- All dependencies MUST be explicitly declared in package.json / requirements.txt
- Version constraints MUST be specified for all dependencies

### Backend (Python FastAPI + SQLModel)

- Single stateless chat endpoint at `POST /api/{user_id}/chat`
- Entry point at `app/main.py`
- Models in `app/models/` using SQLModel
- Route handlers in `app/routers/`
- Pydantic schemas in `app/schemas/`
- JWT verification middleware in `app/auth/`
- MCP server integration in `app/mcp/`
- Database connection in `app/database.py`
- Environment variables in `.env` (never committed)

### MCP Server (Official MCP SDK)

- MCP server MUST expose task operations as stateless tools
- All state MUST be persisted in PostgreSQL via SQLModel
- Required tools: `add_task`, `list_tasks`, `complete_task`, `delete_task`, `update_task`
- Each tool MUST accept `user_id` as explicit parameter
- Each tool MUST return structured JSON response

### Database (Neon Serverless PostgreSQL)

- Use connection pooling for serverless environment
- PostgreSQL is the ONLY system of record for tasks, conversations, and messages
- All migrations MUST be versioned and reversible
- Indexes MUST be created for frequently queried columns
- Foreign key constraints MUST be enforced at database level

### Frontend (OpenAI ChatKit)

- Chat interface using OpenAI ChatKit components
- JWT token attachment for all API requests
- Streaming response handling for real-time chat
- Domain allowlist configuration for security

### Authentication (Better Auth + JWT)

- Better Auth configured for session management and JWT issuance
- Shared secret between Better Auth and FastAPI backend
- Token expiration and refresh strategy MUST be defined

## MCP Tool Standards

All MCP tools MUST adhere to these requirements:

### Tool Input/Output Contract

```
Input: { user_id: string, ...tool_specific_params }
Output: { success: boolean, data: any, error?: string }
```

### Required Tools Specification

| Tool | Parameters | Returns |
|------|------------|---------|
| `add_task` | `user_id`, `title`, `description?`, `priority?`, `due_date?` | Created task object |
| `list_tasks` | `user_id`, `status?`, `priority?` | Array of task objects |
| `complete_task` | `user_id`, `task_id` | Updated task object |
| `delete_task` | `user_id`, `task_id` | Deletion confirmation |
| `update_task` | `user_id`, `task_id`, `updates` | Updated task object |

### Tool Behavior Requirements

- Tools MUST be idempotent where applicable
- Tools MUST validate user ownership before any operation
- Tools MUST return meaningful error messages
- Tools MUST NOT maintain any internal state
- Tools MUST log all operations for auditability

## Agent Behavior Standards

### Intent-Driven Actions

- The agent MUST infer intent strictly from user natural language
- The agent MUST map inferred intent to appropriate MCP tools
- The agent MUST NOT execute operations without clear user intent

### Confirmation Requirements

- Every successful mutation (add, update, complete, delete) MUST be confirmed in natural language
- Confirmations MUST include what action was taken and on which resource
- Confirmations MUST be friendly and human-like

### Error Handling

- Errors such as "task not found" MUST be handled gracefully
- Error messages MUST be explained clearly to the user
- The agent MUST suggest corrective actions when possible

### Tool Transparency

- The response MUST include which MCP tools were invoked during the turn
- Tool invocation details SHOULD be available for debugging purposes

## Conversation Management Rules

### Stateless Request Cycle

Each request MUST follow this sequence:
1. Load conversation history from database
2. Append new user message to context
3. Run AI agent with conversation context
4. Execute MCP tools as determined by agent
5. Store assistant response in database
6. Return response to user

### Conversation Continuity

- Conversations MUST resume correctly after server restarts
- Conversation history MUST be persisted per user
- Context window management MUST be implemented for long conversations

### Data Model

- **Conversation**: Belongs to user, contains multiple messages
- **Message**: Belongs to conversation, has role (user/assistant), content, timestamp
- **Task**: Belongs to user, has title, description, status, priority, due_date

## Security Standards

### Security Checklist (Constitution Check)

- [ ] Single chat endpoint requires JWT authentication
- [ ] User ID extracted from JWT, not from request body/params
- [ ] All MCP tools enforce user isolation via `user_id` parameter
- [ ] All database queries filter by authenticated user
- [ ] CORS configured to allow only ChatKit frontend origin
- [ ] Input validation on chat endpoint
- [ ] No secrets in source code or logs
- [ ] Error messages do not leak sensitive information
- [ ] Tool invocations are logged for audit trail

## Development Workflow

### Agentic Dev Stack Process

1. **Specify** (`/sp.specify`): Define feature requirements in spec.md
2. **Plan** (`/sp.plan`): Create architectural design in plan.md
3. **Tasks** (`/sp.tasks`): Break down into actionable tasks in tasks.md
4. **Implement** (`/sp.implement`): Execute tasks via Claude Code

### Agent Dispatch Rules

| Task Domain | Specialized Agent | Example Tasks |
|-------------|-------------------|---------------|
| MCP Tool Implementation | `mcp-tool-engineer` | Create MCP tools, JWT validation in tools |
| MCP Tool Orchestration | `mcp-tool-orchestrator` | Intent detection, tool chaining, confirmations |
| Conversation Management | `conversation-state-manager` | Load/store history, context building |
| Chat UI Integration | `chat-ui-integrator` | ChatKit setup, JWT attachment, streaming |
| Authentication | `auth-security-specialist` | Better Auth setup, JWT issuance |
| Database Operations | `neon-postgres-manager` | Schema design, SQLModel ORM, migrations |
| Best Practices | `best-practices-advisor` | Architecture guidance, code reviews |

### Mandatory Checkpoints

- **Pre-Implementation**: Spec approved, plan reviewed, tasks generated
- **Post-MCP-Server**: All required tools functional and tested
- **Post-Agent-Integration**: AI agent correctly routes to MCP tools
- **Post-Conversation**: Stateless conversation cycle working
- **Post-Frontend**: ChatKit connected, JWT flowing, streaming working
- **Pre-Deployment**: Security checklist passed, all features working

## Governance

### Amendment Process

1. Proposed changes MUST be documented with rationale
2. Changes affecting security principles require explicit approval
3. Technology stack changes require an ADR
4. All amendments MUST include migration plan for existing code

### Versioning Policy

- **MAJOR**: Backward-incompatible changes to principles or required technologies
- **MINOR**: New principles, sections, or expanded guidance
- **PATCH**: Clarifications, typo fixes, non-breaking refinements

### Compliance Review

- All PRs MUST be verified against Constitution Check
- Security standards MUST be validated before deployment
- Spec traceability MUST be maintained throughout development
- Violations MUST be documented and justified in Complexity Tracking

### Guidance Reference

For runtime development guidance, refer to:
- `CLAUDE.md` - Agent-specific instructions and technology mappings
- `specs/<feature>/` - Feature specifications and plans
- `history/adr/` - Architectural Decision Records

**Version**: 2.0.0 | **Ratified**: 2026-01-09 | **Last Amended**: 2026-01-16
