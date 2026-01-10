# Todo Full-Stack Web Application

A modern, full-stack Todo application built with Next.js and FastAPI, featuring user authentication, task management, and cloud deployment.

## Live Demo

| Component | URL |
|-----------|-----|
| Frontend | https://frontend-murex-eta-83.vercel.app |
| Backend API | https://zaraa7-todo-api-backend.hf.space |
| API Docs | https://zaraa7-todo-api-backend.hf.space/docs |

## Features

- **User Authentication**: Secure signup/login with Better Auth
- **Task Management**: Create, read, update, and delete tasks
- **Task Filtering**: Filter by status (pending, in progress, completed) and priority
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Instant UI updates on task changes
- **Cloud Deployed**: Frontend on Vercel, Backend on Hugging Face Spaces

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Better Auth
- **Database**: Prisma ORM with PostgreSQL
- **Deployment**: Vercel

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11
- **ORM**: SQLModel
- **Database**: Neon PostgreSQL (Serverless)
- **Authentication**: JWT Bearer Tokens
- **Deployment**: Hugging Face Spaces (Docker)

## Project Structure

```
Phase II/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── (auth)/      # Auth pages (login, signup)
│   │   │   ├── (protected)/ # Protected pages (dashboard)
│   │   │   └── api/         # API routes
│   │   ├── components/      # React components
│   │   │   ├── auth/        # Auth components
│   │   │   ├── tasks/       # Task components
│   │   │   └── ui/          # UI primitives
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and configurations
│   │   ├── contexts/        # React contexts
│   │   └── types/           # TypeScript types
│   ├── prisma/              # Prisma schema
│   └── package.json
│
├── backend/                  # FastAPI backend application
│   ├── app/
│   │   ├── auth/            # JWT authentication
│   │   ├── models/          # SQLModel models
│   │   ├── routers/         # API endpoints
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── config.py        # Environment config
│   │   ├── database.py      # Database connection
│   │   └── main.py          # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
│
└── README.md
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | No |
| POST | `/api/tasks` | Create a new task | Yes |
| GET | `/api/tasks` | List user's tasks | Yes |
| GET | `/api/tasks/{id}` | Get task by ID | Yes |
| PUT | `/api/tasks/{id}` | Update task | Yes |
| DELETE | `/api/tasks/{id}` | Delete task | Yes |

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL database (or Neon account)

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and BETTER_AUTH_SECRET

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Run development server
npm run dev
```

Frontend runs at: http://localhost:3000

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Run development server
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API Docs at: http://localhost:8000/docs

## Environment Variables

### Frontend (.env.local)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Auth secret (must match backend JWT_SECRET) |
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `BETTER_AUTH_URL` | Frontend URL for auth callbacks |

### Backend (.env)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret (must match frontend) |
| `JWT_ALGORITHM` | JWT algorithm (default: HS256) |
| `CORS_ORIGINS` | Allowed frontend origins |
| `DEBUG` | Enable debug logging |

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Backend (Hugging Face Spaces)
1. Create a new Space with Docker SDK
2. Push backend files to the Space
3. Configure secrets in Space settings
4. Deploy

## Screenshots

### Dashboard
- View all tasks with status indicators
- Filter by status and priority
- Quick status toggle

### Task Management
- Create new tasks with title, description, priority, and due date
- Edit existing tasks
- Delete with confirmation

## Author

**Zara Khan**

## License

MIT License
