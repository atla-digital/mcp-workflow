# MCP Workflow Server

A Model Context Protocol (MCP) server that provides workflow navigation through markdown-based workflow definitions with branching logic and loops.

## Features

- **Stateless Design**: Server maintains no state - agents track execution context
- **Streamable HTTP Transport**: Uses modern MCP transport for multi-client support
- **Minimal Tools**: Just 2 tools for maximum simplicity
- **Hot Reload**: Automatically reloads workflows when markdown files change
- **Docker Ready**: Containerized with volume mapping for workflow storage

## 🚀 Perfect Match: MCP-GitLab Integration

**MCP-Workflow + MCP-GitLab = GitLab Development Superpowers!**

This MCP server is designed to work seamlessly with [MCP-GitLab](https://github.com/atla-digital/mcp-gitlab) for the ultimate GitLab development experience. Together, they provide:

### 🔄 **Structured GitLab Workflows**
- **Code Review Excellence**: Follow systematic code review processes with line-specific feedback
- **Merge Request Mastery**: Guided workflows for creating, analyzing, and managing merge requests
- **Issue Resolution**: Step-by-step issue analysis and resolution procedures

### 🎯 **Workflow-Driven Development**
- **Consistent Process**: Every GitLab action follows proven, repeatable workflows
- **Context Preservation**: Never lose your place in complex multi-step operations
- **Quality Assurance**: Built-in quality gates and validation steps

### 💡 **Real-World Example**
```bash
# 1. Agent uses MCP-Workflow to get "GitLab Code Review" workflow
workflow_get_step("gitlab-code-review")

# 2. Workflow guides agent to fetch MR details using MCP-GitLab
gitlab_get_merge_request(project_id="123", merge_request_iid=45)

# 3. Workflow directs systematic review of each file
gitlab_get_merge_request_changes(project_id="123", merge_request_iid=45)

# 4. Agent follows workflow steps to provide line-specific feedback
gitlab_create_merge_request_discussion(
  project_id="123", 
  merge_request_iid=45,
  body="Consider extracting this logic into a helper method",
  position={...} // Line-specific positioning from diff_refs
)

# 5. Workflow guides through systematic review completion
workflow_get_step("review-finalization")
```

### 🏆 **Why This Combination Rocks**
- **🧭 Navigation**: MCP-Workflow provides the roadmap, MCP-GitLab provides the tools
- **🔒 Consistency**: Same high-quality process every time, regardless of complexity
- **⚡ Efficiency**: No more wondering "what's next?" - the workflow knows
- **🎨 Flexibility**: 29+ interconnected workflows covering every GitLab scenario
- **🔄 Continuity**: Context compaction instructions ensure seamless long conversations
- **🎯 Precision**: Line-specific code comments with full GitLab discussion threading
- **🛡️ Quality**: Built-in review gates, security analysis, and performance checks

**Get Started**: Install both MCPs and experience GitLab development like never before!

### 🔧 **MCP-GitLab Features Available**
- **70+ Tools**: Complete GitLab API coverage including merge requests, issues, CI/CD, webhooks
- **Line-Level Comments**: Precise code review with `gitlab_create_merge_request_discussion`
- **Project Management**: Full repository, branch, and user management capabilities
- **CI/CD Control**: Pipeline triggers, variables, and monitoring tools
- **Integrations**: Slack, webhooks, and third-party service configuration

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