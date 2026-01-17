# Phase III: AI-Native Todo Chatbot

A modern, AI-powered task management chatbot built with natural language processing capabilities. Users can manage their tasks through conversational interactions instead of traditional CRUD interfaces.

## Live Demo

| Component | URL |
|-----------|-----|
| Frontend | https://frontend-murex-eta-83.vercel.app |
| Backend API | https://zaraa7-todo-api-backend.hf.space |
| API Docs | https://zaraa7-todo-api-backend.hf.space/docs |

## What's New in Phase III

Phase III transforms the Phase II Todo application into an **AI-native chatbot experience**:

- **Natural Language Interface** - Chat with an AI to manage tasks
- **MCP Tool Architecture** - Model Context Protocol for AI-tool interactions
- **Conversation Memory** - Persistent chat history per user
- **Smooth Animations** - 60fps GPU-accelerated UI transitions

## Features

### Core Features (Phase II)
- User Authentication with Better Auth
- Task CRUD operations
- Task filtering by status and priority
- Responsive design

### AI Chatbot Features (Phase III)
- **Natural Language Task Management** - "Add a task to buy groceries tomorrow"
- **Conversational Interface** - Chat-based UI with smooth animations
- **AI-Powered Intent Detection** - Understands user intent automatically
- **5 MCP Tools** - add_task, list_tasks, complete_task, update_task, delete_task
- **Conversation Persistence** - Chat history stored in PostgreSQL
- **Context Window** - Last 20 messages loaded for context

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16+ (App Router) |
| Backend | Python FastAPI |
| AI/LLM | Groq API (Llama 3.3 70B) - FREE |
| Database | Neon Serverless PostgreSQL |
| ORM | SQLModel |
| Authentication | Better Auth (JWT) |
| Styling | Tailwind CSS |

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Next.js Chat   │────▶│  FastAPI + AI   │────▶│  PostgreSQL     │
│  Interface      │     │  Agent          │     │  (Neon)         │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   MCP Tools     │
                        │  ─────────────  │
                        │  • add_task     │
                        │  • list_tasks   │
                        │  • complete_task│
                        │  • update_task  │
                        │  • delete_task  │
                        └─────────────────┘
```

## Project Structure

```
Phase III/
├── backend/                     # Python FastAPI Backend
│   ├── app/
│   │   ├── agent/               # AI Agent (Groq/LLM integration)
│   │   │   ├── prompts.py       # System prompts
│   │   │   └── runner.py        # Agent orchestration
│   │   ├── mcp/                 # MCP Server & Tools
│   │   │   ├── server.py        # MCP server initialization
│   │   │   └── tools/           # Task management tools
│   │   │       ├── add_task.py
│   │   │       ├── list_tasks.py
│   │   │       ├── complete_task.py
│   │   │       ├── update_task.py
│   │   │       └── delete_task.py
│   │   ├── models/              # SQLModel database models
│   │   │   ├── task.py
│   │   │   ├── conversation.py
│   │   │   └── message.py
│   │   ├── routers/
│   │   │   ├── tasks.py         # REST API (Phase II)
│   │   │   └── chat.py          # Chat endpoint (Phase III)
│   │   ├── schemas/
│   │   │   ├── task.py
│   │   │   └── chat.py
│   │   └── main.py
│   └── requirements.txt
│
├── frontend/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/          # Login/Signup
│   │   │   └── (protected)/
│   │   │       ├── dashboard/   # Task dashboard
│   │   │       └── chat/        # AI Chat interface
│   │   ├── components/
│   │   │   ├── chat/            # Chat components
│   │   │   │   ├── chat-container.tsx
│   │   │   │   ├── chat-message.tsx
│   │   │   │   └── chat-input.tsx
│   │   │   └── tasks/
│   │   └── lib/
│   │       ├── api/chat.ts      # Chat API client
│   │       └── animations.ts    # Animation utilities
│   └── package.json
│
└── specs/                       # Feature specifications
    └── 004-ai-chatbot-mcp/
        ├── spec.md
        ├── plan.md
        └── tasks.md
```

## API Endpoints

### Phase II Endpoints (REST)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks` | List tasks |
| GET | `/api/tasks/{id}` | Get task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |

### Phase III Endpoint (Chat)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/{user_id}/chat` | Send chat message |

**Chat Request:**
```json
{
  "message": "Add a task to buy groceries tomorrow",
  "stream": false
}
```

**Chat Response:**
```json
{
  "message": "I've created a task 'buy groceries' due tomorrow.",
  "tools_invoked": [
    {
      "tool_name": "add_task",
      "success": true,
      "result": { "id": "...", "title": "buy groceries" }
    }
  ],
  "conversation_id": "uuid"
}
```

## Example Conversations

```
User: "Add a task to finish the report by Friday"
AI: "I've created a task 'finish the report' with a due date of this Friday."

User: "Show me my pending tasks"
AI: "Here are your pending tasks:
     1. finish the report (High Priority) - due Friday
     2. buy groceries - due tomorrow"

User: "Mark the groceries task as done"
AI: "Done! I've marked 'buy groceries' as completed."

User: "Delete the report task"
AI: "I've deleted the task 'finish the report'."
```

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (or Neon account)
- Groq API key (free at https://console.groq.com)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env:
# - DATABASE_URL=your-neon-url
# - JWT_SECRET=your-secret
# - GROQ_API_KEY=gsk_your-key

# Run server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
# Edit .env.local:
# - NEXT_PUBLIC_API_URL=http://localhost:8000

# Run server
npm run dev
```

Open http://localhost:3000

## Environment Variables

### Backend (.env)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `GROQ_API_KEY` | Groq API key (free) |
| `CORS_ORIGINS` | Allowed frontend origins |

### Frontend (.env.local)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Auth secret |
| `NEXT_PUBLIC_API_URL` | Backend API URL |

## UI Animations

The chat interface includes smooth, 60fps animations:

- **Message animations** - Slide in from left (AI) / right (user)
- **Typing indicator** - Bouncing dots animation
- **Button feedback** - Hover glow + press scale
- **Header** - Slide-down entrance
- **Empty state** - Staggered fade-in

All animations respect `prefers-reduced-motion` for accessibility.

## Database Models

### Task
- id, title, description, status, priority, due_date, user_id, created_at, updated_at

### Conversation
- id, user_id (unique), created_at, updated_at

### Message
- id, conversation_id, role (user/assistant), content, tool_calls, created_at

## Security

- JWT-based authentication
- User isolation at MCP tool level
- CORS configuration
- Input validation with Pydantic

## Development Workflow

This project uses **Spec-Driven Development (SDD)**:

1. **Specify** - Define requirements in spec.md
2. **Plan** - Create architecture in plan.md
3. **Tasks** - Break down into tasks.md
4. **Implement** - Execute with Claude Code

## Author

**Zara** - Hackathon 2

## License

MIT License

---

**Project Evolution:**
- Phase I: Console Todo App
- Phase II: Full-Stack Web Application
- **Phase III: AI-Native Chatbot** (Current)
