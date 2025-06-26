.PHONY: help dev build start stop clean install lint typecheck format test docker-up docker-down docker-logs

# Default target
help: ## Show this help message
	@echo "AI Engineer Dock - Development Commands"
	@echo "======================================"
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\nTargets:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# Development
dev: ## Start development servers (web + api)
	@echo "🚀 Starting development environment..."
	@npm install
	@npm run dev

install: ## Install all dependencies
	@echo "📦 Installing dependencies..."
	@npm install

# Build
build: ## Build all applications
	@echo "🔨 Building applications..."
	@npm run build

start: ## Start production servers
	@echo "▶️  Starting production servers..."
	@npm run start

# Code Quality
lint: ## Run linting on all packages
	@echo "🔍 Running linters..."
	@npm run lint

typecheck: ## Run TypeScript type checking
	@echo "🔍 Running type check..."
	@npm run typecheck

format: ## Format code with Prettier
	@echo "✨ Formatting code..."
	@npm run format

test: ## Run tests (when implemented)
	@echo "🧪 Running tests..."
	@echo "Tests not implemented yet"

# Docker
docker-up: ## Start Docker services (Redis + Runner)
	@echo "🐳 Starting Docker services..."
	@docker-compose -f docker/docker-compose.yml up -d

docker-down: ## Stop Docker services
	@echo "🛑 Stopping Docker services..."
	@docker-compose -f docker/docker-compose.yml down

docker-logs: ## View Docker service logs
	@docker-compose -f docker/docker-compose.yml logs -f

docker-build: ## Build Docker images
	@echo "🔨 Building Docker images..."
	@docker-compose -f docker/docker-compose.yml build

# Environment
env-setup: ## Set up environment files
	@echo "⚙️  Setting up environment..."
	@if [ ! -f .env ]; then cp .env.example .env; echo "Created .env from .env.example"; fi
	@if [ ! -f apps/api/.env ]; then cp apps/api/.env.example apps/api/.env; echo "Created apps/api/.env from .env.example"; fi

# Cleanup
clean: ## Clean build artifacts and node_modules
	@echo "🧹 Cleaning up..."
	@rm -rf node_modules
	@rm -rf apps/*/node_modules
	@rm -rf apps/*/dist
	@rm -rf apps/*/.next
	@rm -rf apps/*/.turbo
	@rm -rf .turbo

# Reset
reset: clean install ## Reset environment (clean + install)
	@echo "🔄 Environment reset complete"

# Production Deploy (Future)
deploy-staging: ## Deploy to staging environment
	@echo "🚀 Deploying to staging..."
	@echo "Staging deployment not implemented yet"

deploy-prod: ## Deploy to production environment
	@echo "🚀 Deploying to production..."
	@echo "Production deployment not implemented yet"

# Health Check
health: ## Check system health
	@echo "🏥 System Health Check"
	@echo "====================="
	@echo -n "Node.js: "; node --version 2>/dev/null || echo "❌ Not installed"
	@echo -n "npm: "; npm --version 2>/dev/null || echo "❌ Not installed"
	@echo -n "Docker: "; docker --version 2>/dev/null || echo "❌ Not installed"
	@echo -n "Redis: "; redis-cli ping 2>/dev/null || echo "❌ Not running"
	@echo ""
	@echo "🔧 Quick Setup: make env-setup && make install && make docker-up"

# Quick Start
quick-start: env-setup install docker-up ## Quick start: setup env, install deps, start Docker
	@echo ""
	@echo "🎉 Quick start complete!"
	@echo "💡 Run 'make dev' to start development servers"
	@echo "🌐 Web: http://localhost:3000"
	@echo "🔌 API: http://localhost:3001"
	@echo "📊 Redis: localhost:6379"