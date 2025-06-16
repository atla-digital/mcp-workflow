# MCP Workflow Server

A Model Context Protocol (MCP) server that provides workflow navigation through markdown-based workflow definitions with branching logic and loops.

## Features

- **Stateless Design**: Server maintains no state - agents track execution context
- **Streamable HTTP Transport**: Uses modern MCP transport for multi-client support
- **Minimal Tools**: Just 2 tools for maximum simplicity
- **Hot Reload**: Automatically reloads workflows when markdown files change
- **Docker Ready**: Containerized with volume mapping for workflow storage

## Tools

### `workflow_list_entrypoints`
Lists available workflow entrypoints with optional search filtering.

**Parameters:**
- `search` (optional): Filter entrypoints by search term

### `workflow_get_step`
Gets step content and next step IDs for any step (entrypoints or regular steps).

**Parameters:**
- `step_id` (required): The ID of the step to retrieve

## Workflow Format

Workflows are markdown files with frontmatter:

```markdown
---
entrypoint: true
title: "CI/CD Pipeline"
description: "Main build and deployment workflow"
---

# CI/CD Pipeline

## Step 1: Check Prerequisites
- If Makefile exists → Continue to @compile-using-makefile@
- Otherwise → Continue to @npm-build@

## Next Steps
- @compile-using-makefile@
- @npm-build@
```

## Usage

### Docker Compose (Recommended)

```bash
# Start HTTP server
docker-compose up mcp-workflow-http

# Start MCP server (for traditional MCP clients)
docker-compose --profile mcp up mcp-workflow-mcp
```

### Local Development

```bash
npm install
npm run build

# HTTP server
npm run start:http

# MCP server
npm run start:mcp
```

### MCP Inspector

```bash
# STDIO mode
npm run inspector

# HTTP mode
npm run inspector:http
```

## Workflow Directory

Place your workflow `.md` files in the `workflows/` directory. The server will:
- Auto-detect entrypoints (files with `entrypoint: true` in frontmatter)
- Parse step references (`@step-id@`) to build navigation graphs
- Hot-reload changes without restart

## Environment Variables

- `WORKFLOWS_PATH`: Path to workflow files (default: `/app/workflows`)
- `PORT`: HTTP server port (default: `3000`)
- `NODE_ENV`: Environment mode (default: `development`)

## Architecture

```
Agent calls workflow_list_entrypoints
  ↓
Agent calls workflow_get_step with entrypoint ID
  ↓
Agent receives step content + next step IDs
  ↓
Agent decides which next step to follow
  ↓
Agent calls workflow_get_step with chosen step ID
  ↓
Process repeats until reaching endpoint
```

The server is completely stateless - agents maintain all execution state in their context/todos.