# Pokemon Team Builder & Type Coverage Analyzer

A web application for building Pokemon teams and analyzing type coverage.

## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- dnd-kit

**Backend:**
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

**Infrastructure:**
- Docker & Docker Compose
- Railway (Production DB)
- AWS (Planned: ECR, App Runner, S3, CloudFront)

## Getting Started

### Prerequisites

- Node.js 20.x LTS
- Docker Desktop
- Git

### Quick Start with Docker (Recommended)
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/pokemon-team-builder.git
cd pokemon-team-builder

# Start all services
docker-compose up -d --build

# Run database migration
docker-compose exec backend npx prisma migrate dev --name init

# View logs
docker-compose logs -f
```

### Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Prisma Studio**: http://localhost:5555 (run `docker-compose exec backend npx prisma studio`)

### Stopping the Application
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## Development

### Using Docker (Recommended for consistency)
```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Access backend container
docker-compose exec backend sh

# Access frontend container
docker-compose exec frontend sh

# Run Prisma Studio
docker-compose exec backend npx prisma studio
```

### Local Development (Alternative)
```bash
# Install dependencies
npm install
npm install --workspace=frontend
npm install --workspace=backend

# Setup environment variables
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Run database migration (requires local PostgreSQL)
cd backend
npx prisma migrate dev

# Start development servers (separate terminals)
cd backend && npm run start:dev
cd frontend && npm run dev
```

## Project Structure
```
pokemon-team-builder/
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/          # App Router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utility functions
│   │   └── types/        # TypeScript types
│   ├── Dockerfile        # Production Dockerfile
│   └── Dockerfile.dev    # Development Dockerfile
├── backend/              # NestJS application
│   ├── src/
│   │   ├── prisma/       # Prisma module
│   │   └── main.ts       # Application entry
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   ├── Dockerfile        # Production Dockerfile
│   └── Dockerfile.dev    # Development Dockerfile
├── docker-compose.yml    # Docker Compose config
└── package.json          # Root workspace config
```

## Why Docker?

This project uses Docker for development to ensure:

- **Consistency**: Same environment across all developers
- **Quick onboarding**: New team members ready in minutes  
- **Production parity**: Minimize "works on my machine" issues
- **Isolation**: No conflicts with other projects or system dependencies

## Useful Commands
```bash
# Docker Compose
docker-compose up -d          # Start all services
docker-compose down           # Stop all services
docker-compose logs -f        # View logs
docker-compose ps             # Check service status
docker-compose exec backend sh  # Access backend container

# Prisma
docker-compose exec backend npx prisma studio        # Open Prisma Studio
docker-compose exec backend npx prisma migrate dev   # Run migrations
docker-compose exec backend npx prisma generate      # Generate client

# Cleanup
docker-compose down -v        # Remove volumes
docker system prune -a        # Clean up Docker
```

## License

MIT
