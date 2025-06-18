import { listEntrypoints, getStep, createOrUpdateWorkflow, deleteWorkflow, findOrphans, findInvalidLinks, getWorkflowRawContent } from './workflow.js';

export const workflowHandlers = {
  listEntrypoints,
  getStep,
  createOrUpdateWorkflow,
  deleteWorkflow,
  findOrphans,
  findInvalidLinks,
  getWorkflowRawContent
};