# Workflow MCP Server Tools

This document provides details on all available tools in the Workflow MCP server.

Each tool is designed to interact with markdown-based workflow definitions, allowing AI assistants to navigate, create, and manage workflow processes.

## Table of Contents

- [Workflow Navigation](#workflow-navigation)
- [Workflow Management](#workflow-management)
- [Workflow Analysis & Diagnostics](#workflow-analysis-diagnostics)

## Workflow Navigation

### workflow_list_entrypoints

List available workflow entrypoints

**Parameters:**

| Name | Type | Required | Description | Default |
| ---- | ---- | -------- | ----------- | ------- |
| `search` | `string` | No | Optional search term to filter entrypoints | - |

### workflow_get_step

Get step content and next step IDs (works for both entrypoints and regular steps)

**Parameters:**

| Name | Type | Required | Description | Default |
| ---- | ---- | -------- | ----------- | ------- |
| `step_id` | `string` | Yes | The ID of the step to retrieve | - |

### workflow_get_raw_content

Get the raw content of a workflow file including frontmatter

**Parameters:**

| Name | Type | Required | Description | Default |
| ---- | ---- | -------- | ----------- | ------- |
| `filename` | `string` | Yes | Workflow filename (with or without .md extension) | - |

## Workflow Management

### workflow_create_or_update

Create a new workflow or update an existing one

**Parameters:**

| Name | Type | Required | Description | Default |
| ---- | ---- | -------- | ----------- | ------- |
| `filename` | `string` | Yes | Workflow filename (with .md extension) | - |
| `title` | `string` | Yes | Workflow title | - |
| `description` | `string` | No | Workflow description | - |
| `content` | `string` | Yes | Workflow content in Markdown format | - |
| `is_entrypoint` | `boolean` | No | Whether this workflow is an entrypoint | `false` |

### workflow_delete

Delete a workflow file

**Parameters:**

| Name | Type | Required | Description | Default |
| ---- | ---- | -------- | ----------- | ------- |
| `filename` | `string` | Yes | Workflow filename to delete (with or without .md extension) | - |

## Workflow Analysis & Diagnostics

### workflow_find_orphans

Find orphaned workflows (non-entrypoints that are not referenced by any other workflow)

This tool does not require any parameters.

### workflow_find_invalid_links

Find invalid references to non-existent workflow steps

This tool does not require any parameters.

---

Generated automatically from `src/tools/definitions/`
