# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Commands

### Development & Build
```bash
# Build the TypeScript application
npm run build

# Watch for changes during development
npm run watch

# Start HTTP server (recommended - supports multiple clients)
npm run start:http

# Start traditional MCP server (STDIO)
npm run start:mcp
```

### Docker Deployment (REQUIRED for HTTP Server)
```bash
# Build and start HTTP server (ONLY supported deployment method)
docker compose up -d

# Check container logs
docker compose logs

# Stop and remove containers
docker compose down

# Rebuild after code changes
docker compose up -d --build
```

**⚠️ CRITICAL**: The HTTP server (`start:http`) must ONLY be deployed through Docker. Local `npm run start:http` is for development testing only and will not work correctly due to hardcoded container paths (`/app/workflows`). The WorkflowEngine expects workflows to be mounted at `/app/workflows` which only happens in the Docker container.

### Testing with MCP Inspector
```bash
# Test STDIO mode
npm run inspector

# Test HTTP mode (server must be running on localhost:3000)
npm run inspector:http
```

### CI/CD & Documentation
```bash
# Install git hooks for automatic documentation generation
npm run install-hooks

# Generate tool documentation manually
npm run generate-docs
```

## Architecture Overview

This is a **Model Context Protocol (MCP) server** that provides workflow navigation through markdown-based workflow definitions. The system has two main operational modes and supports both tools and prompts.

**Deployment Note**: The HTTP server is designed to run in a Docker container with workflows mounted at `/app/workflows`. Local development testing can use `npm run start:http`, but production deployment should always use Docker to ensure correct file paths and environment setup.

### Core Components

**WorkflowEngine** (`src/services/workflow-engine.ts`)
- Central workflow processing engine with file watching and caching
- Parses markdown files with frontmatter to extract workflow steps
- Maintains in-memory cache of workflows with hot-reload capability
- Generates prompts dynamically from workflow entrypoints
- Handles workflow CRUD operations and diagnostics

**Server Implementations**
- `src/server/streamable-http-server.ts`: HTTP transport for multi-client support (recommended)
- `src/index.ts`: Traditional STDIO MCP server

**Tool System**
- Tool definitions in `src/tools/definitions/workflow.ts` 
- Tool handlers in `src/tools/handlers/workflow.ts`
- Tool registry in `src/utils/tool-registry.ts`

### Workflow File Format

Workflows are markdown files in the `workflows/` directory with frontmatter:

```markdown
---
entrypoint: true           # Makes this workflow a selectable entrypoint
title: "Workflow Title"
description: "Description"
---

# Workflow Content

Step references use @step-id@ syntax for navigation:
- If condition A → Continue to @next-step@
- If condition B → Continue to @other-step@
```

### MCP Tools Provided

1. **workflow_list_entrypoints**: Lists available workflow starting points
2. **workflow_get_step**: Retrieves specific workflow step content and next steps
3. **workflow_create_or_update**: Creates or modifies workflow files
4. **workflow_delete**: Removes workflow files
5. **workflow_find_orphans**: Identifies unreferenced workflows
6. **workflow_find_invalid_links**: Finds broken step references

### MCP Prompts System

Each workflow file marked with `entrypoint: true` automatically becomes a selectable prompt in MCP-compatible agents. Prompts include:
- Full workflow content with navigation instructions
- Available tools and usage guidance
- Support for additional_instructions parameter

### Stateless Design

The server maintains **no execution state** - agents are responsible for tracking their current position in workflows through their own context/todos. This enables:
- Multiple concurrent users without interference
- Horizontal scaling without session management
- Simple restart/recovery scenarios

### File Watching & Hot Reload

The system uses `chokidar` to watch the workflows directory and automatically:
- Reloads workflow cache when files change
- Updates prompt definitions when entrypoints are added/removed
- Rebuilds navigation graphs when step references change

### Docker Architecture

- Multi-stage build with distroless final image for security
- Volume mapping for workflows directory (`./workflows:/app/workflows`)
- Health checks for container monitoring
- Resource limits for production deployment
- Port 3002 (host) → 3000 (container) mapping

## Key Environment Variables

- `WORKFLOWS_PATH`: Path to workflow markdown files (default: `/app/workflows`)
- `PORT`: HTTP server port (default: `3000`)
- `NODE_ENV`: Environment mode (affects logging and optimization)

## Development Notes

The codebase uses **ES modules** (Node16 module resolution) and requires Node.js 20+. The TypeScript configuration targets ES2022 with strict mode enabled.

When adding new tools:
1. Add tool definition to `src/tools/definitions/workflow.ts`
2. Implement handler in `src/tools/handlers/workflow.ts`
3. Register in `src/utils/tool-registry.ts`
4. Export from `src/tools/handlers/index.ts`

The workflow engine automatically handles prompt generation - no manual prompt registration needed for new entrypoints.

## CI/CD Pipeline

### GitHub Actions Workflows

The project includes automated CI/CD pipelines using GitHub Actions:

#### Docker Build & Publish (`.github/workflows/docker-publish.yml`)
- **Triggers**: Push to `main` branch, release publication
- **Features**:
  - Multi-platform builds (linux/amd64, linux/arm64)
  - Publishes to GitHub Container Registry (ghcr.io)
  - Build caching for performance
  - Artifact attestations for security
  - Automatic tagging (branch, PR, semver, latest)

#### CI Pipeline (`.github/workflows/ci.yml`)
- **Triggers**: Push to `main`/`develop`, pull requests
- **Features**:
  - Multi-version Node.js testing (20, 22)
  - TypeScript compilation and type checking
  - Build validation
  - HTTP server startup testing
  - Docker container testing
  - Workflow directory validation

### Git Hooks & Documentation

#### Pre-commit Hook (`git-hooks/pre-commit`)
- Automatically regenerates `TOOLS.md` when tool definitions change
- Monitors changes to `src/tools/definitions/` and `src/utils/tool-registry.ts`
- Runs build process to ensure latest compiled definitions
- Adds updated documentation to the commit

#### Documentation Generation (`scripts/generate-tools-md.js`)
- Generates comprehensive tool documentation from TypeScript definitions
- Categorizes tools by function (Navigation, Management, Analysis)
- Creates formatted markdown with parameter tables and examples
- Maintains table of contents with GitHub-compatible anchors

### Setup Commands
```bash
# Install git hooks for automatic documentation
npm run install-hooks

# Generate documentation manually
npm run generate-docs

# Complete build and documentation workflow
npm run build && npm run generate-docs
```

### Memories
- Build and deploy using docker compose
- Use GitHub Actions for CI/CD automation