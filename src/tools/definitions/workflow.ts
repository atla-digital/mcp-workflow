import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const workflowTools: Tool[] = [
  {
    name: 'workflow_list_entrypoints',
    description: 'List available workflow entrypoints',
    inputSchema: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: 'Optional search term to filter entrypoints'
        }
      },
      additionalProperties: false
    }
  },
  {
    name: 'workflow_get_step',
    description: 'Get step content and next step IDs (works for both entrypoints and regular steps)',
    inputSchema: {
      type: 'object',
      properties: {
        step_id: {
          type: 'string',
          description: 'The ID of the step to retrieve'
        }
      },
      required: ['step_id'],
      additionalProperties: false
    }
  },
  {
    name: 'workflow_create_or_update',
    description: 'Create a new workflow or update an existing one',
    inputSchema: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'Workflow filename (with .md extension)'
        },
        title: {
          type: 'string',
          description: 'Workflow title'
        },
        description: {
          type: 'string',
          description: 'Workflow description'
        },
        content: {
          type: 'string',
          description: 'Workflow content in Markdown format'
        },
        is_entrypoint: {
          type: 'boolean',
          description: 'Whether this workflow is an entrypoint',
          default: false
        }
      },
      required: ['filename', 'title', 'content'],
      additionalProperties: false
    }
  },
  {
    name: 'workflow_delete',
    description: 'Delete a workflow file',
    inputSchema: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'Workflow filename to delete (with or without .md extension)'
        }
      },
      required: ['filename'],
      additionalProperties: false
    }
  },
  {
    name: 'workflow_find_orphans',
    description: 'Find orphaned workflows (non-entrypoints that are not referenced by any other workflow)',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false
    }
  },
  {
    name: 'workflow_find_invalid_links',
    description: 'Find invalid references to non-existent workflow steps',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false
    }
  }
];