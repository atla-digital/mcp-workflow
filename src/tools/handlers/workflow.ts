import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { ToolHandler } from '../../utils/handler-types.js';
import { WorkflowEngine } from '../../services/workflow-engine.js';

export const listEntrypoints: ToolHandler = async (params: CallToolRequest['params']) => {
  const { search } = (params.arguments as any) || {};
  
  const workflowEngine = new WorkflowEngine();
  const entrypoints = await workflowEngine.listEntrypoints(search as string);
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(entrypoints, null, 2)
      }
    ]
  };
};

export const getStep: ToolHandler = async (params: CallToolRequest['params']) => {
  const { step_id } = (params.arguments as any) || {};
  
  if (!step_id) {
    throw new Error('step_id parameter is required');
  }
  
  const workflowEngine = new WorkflowEngine();
  const step = await workflowEngine.getStep(step_id as string);
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(step, null, 2)
      }
    ]
  };
};

export const createOrUpdateWorkflow: ToolHandler = async (params: CallToolRequest['params']) => {
  const { filename, title, description, content, is_entrypoint } = (params.arguments as any) || {};
  
  if (!filename || !title || !content) {
    throw new Error('filename, title, and content parameters are required');
  }
  
  const workflowEngine = new WorkflowEngine();
  const result = await workflowEngine.createOrUpdateWorkflow({
    filename: filename as string,
    title: title as string,
    description: description as string,
    content: content as string,
    isEntrypoint: is_entrypoint as boolean || false
  });
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }
    ]
  };
};

export const deleteWorkflow: ToolHandler = async (params: CallToolRequest['params']) => {
  const { filename } = (params.arguments as any) || {};
  
  if (!filename) {
    throw new Error('filename parameter is required');
  }
  
  const workflowEngine = new WorkflowEngine();
  const result = await workflowEngine.deleteWorkflow(filename as string);
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }
    ]
  };
};

export const findOrphans: ToolHandler = async (params: CallToolRequest['params']) => {
  const workflowEngine = new WorkflowEngine();
  const orphans = await workflowEngine.findOrphanedWorkflows();
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(orphans, null, 2)
      }
    ]
  };
};

export const findInvalidLinks: ToolHandler = async (params: CallToolRequest['params']) => {
  const workflowEngine = new WorkflowEngine();
  const invalidLinks = await workflowEngine.findInvalidLinks();
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(invalidLinks, null, 2)
      }
    ]
  };
};

export const getWorkflowRawContent: ToolHandler = async (params: CallToolRequest['params']) => {
  const { filename } = (params.arguments as any) || {};
  
  if (!filename) {
    throw new Error('filename parameter is required');
  }
  
  const workflowEngine = new WorkflowEngine();
  const content = await workflowEngine.getRawFileContent(filename as string);
  
  return {
    content: [
      {
        type: 'text',
        text: content
      }
    ]
  };
};