import { listEntrypoints, getStep, createOrUpdateWorkflow, deleteWorkflow, findOrphans, findInvalidLinks } from './workflow.js';

export const workflowHandlers = {
  listEntrypoints,
  getStep,
  createOrUpdateWorkflow,
  deleteWorkflow,
  findOrphans,
  findInvalidLinks
};