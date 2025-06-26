# AI Engineer Dock

**Terminal-free development platform powered by AI engineers**

> *"Empower anyone to keep an AI engineer on their laptop and build production‑grade websites using chat only—no terminal, no IDE."*

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Redis (via Docker)

### 5-Command Setup

```bash
git clone <repository-url>
cd ai-engineer-dock
make quick-start
make dev
```

Open [http://localhost:3000](http://localhost:3000) and start building!

## 🏗️ Architecture

```
ai-engineer-dock/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── api/          # Fastify TypeScript backend
├── packages/         # Shared packages (future)
├── docker/          # Docker configs & runner scripts
│   ├── docker-compose.yml
│   ├── Dockerfile.runner
│   └── runner/      # Shell scripts for CI/CD
└── docs/           # Documentation
```

## 🎯 PoC Scope (July 2025)

- **F-01**: Wizard requirement intake (3 Q&A)
- **F-02**: Engineer Card (Seat = 1, ETA ring)
- **F-03**: Chat interface with history
- **F-04**: Docker Runner & GitHub draft PR
- **F-05**: Vercel preview iframe
- **F-06**: Live File-Tree & Activity Feed
- **F-07**: Ask-Change loop

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14, shadcn/ui, Framer Motion | App Router + SSR, rapid UI |
| Backend | Fastify, TypeScript, Redis Streams | Lightweight, typed queues |
| AI | Claude Code API | High-quality planning & patching |
| Runner | Docker + devcontainer | VS Code compatible |
| Hosting | Vercel (FE) / Render (BE) | Push-to-deploy |

## 🚀 Development Commands

```bash
# Quick start
make quick-start     # Setup everything
make dev            # Start development servers

# Development
make install        # Install dependencies
make build          # Build all applications  
make start          # Start production servers

# Code Quality
make lint           # Run linting
make typecheck      # TypeScript checking
make format         # Format code

# Docker
make docker-up      # Start Redis + Runner
make docker-down    # Stop services
make docker-logs    # View logs

# Utilities
make clean          # Clean build artifacts
make reset          # Clean + reinstall
make health         # System health check
```

## 🌐 URLs (Development)

- **Web App**: http://localhost:3000
- **API Server**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health
- **Redis**: localhost:6379
- **Runner Health**: http://localhost:3002/health

## 📊 Key Features

### 🎨 Terminal-Free Experience
- **Visual File Operations**: No CLI commands visible to users
- **Progress Visualization**: ETA rings, progress bars, activity feeds
- **One-Click Actions**: Hire engineer, create project, preview deployment

### 🤖 AI Engineer Management
- **Seat-Based Scaling**: Fixed capacity per plan (PoC = 1 seat)
- **Real-time Status**: Idle, Planning, Building, Error states
- **Task Assignment**: Drag-and-drop task management

### 🏗️ Build Pipeline
- **Auto-Scaffolding**: `npx create-next-app` via Docker runner
- **Live File Watching**: chokidar → WebSocket → React Tree
- **GitHub Integration**: Auto PR creation with draft status
- **Vercel Deployment**: One-click preview URLs

## 🎯 User Flow

1. **Dashboard** → Hire Engineer (animated card drop)
2. **Wizard** → 3 Q&A for project requirements  
3. **Engineer Dock** → Watch progress (ETA ring + activity feed)
4. **Mission Control** → File tree, diffs, preview iframe
5. **Ask-Change** → Chat → Auto-rebuild → New preview

## 🔧 Configuration

### Environment Variables

```bash
# API Configuration
PORT=3001
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:3000

# Optional (for production features)
CLAUDE_API_KEY=your_key_here
GITHUB_TOKEN=your_token_here  
VERCEL_TOKEN=your_token_here

# Resource Limits
MAX_SEATS=1
RUNNER_TIMEOUT_MS=1200000
CLAUDE_MAX_TOKENS=2500
```

### Redis Streams

- `activity:{projectId}` - Real-time activity feed
- `engineer:{id}` - Engineer state (24h TTL)
- `project:{id}` - Project metadata (7d TTL)
- `project:{id}:tasks` - Task queue (Redis List)

## 🚦 Quality Targets

- **Happy Path Demo**: ≤ 5 min unedited
- **Setup Time**: ≤ 5 commands (`make dev`)  
- **Preview Access**: Public URL, 48h+ uptime
- **Cost**: ≤ ¥100 per landing page
- **Reliability**: Zero fatal crashes

## 📅 Milestones

| Date | Deliverable | Owner |
|------|-------------|-------|
| **01 Jul** | Wizard & Claude integration | FE/BE |
| **05 Jul** | Engineer Card + Chat UX | FE |
| **09 Jul** | Runner & PR pipeline | BE |
| **12 Jul** | File-Tree + Activity Feed | FE |
| **15 Jul** | Ask-Change → rebuild loop | FE/BE |
| **18 Jul** | Animation polish | UI |
| **22 Jul** | End-to-end testing | ALL |
| **24 Jul** | Beta launch | PM |

## 🔮 Future Roadmap

### MVP (Q4 2025)
- Multi-seat support (up to 5 engineers)
- Stripe billing integration
- Template marketplace
- Advanced task management

### V1.0 (Q2 2026)  
- Voice control interface
- Blueprint Store ecosystem
- Automated testing & deployment
- Enterprise SSO

## 🤝 Contributing

This is an internal project for the Vietnam development team. Please follow:

- **Git Flow**: `feat/<ticket-id>`, `bug/<ticket-id>`
- **PR Process**: dev → staging → main
- **Code Style**: ESLint + Prettier (automatic)
- **Commits**: Conventional Commits format

## 📞 Support

- **Slack**: `#dock-build`
- **Daily Scrum**: 11:00 JST / 09:00 ICT
- **Issues**: Create tickets in project board

---

**🤖 Generated with AI Engineer Dock**  
*Build anything, deploy instantly, terminal-free.*