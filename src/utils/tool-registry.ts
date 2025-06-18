/**
 * Tool registry - maps tool names to handler functions
 */

import { ToolRegistry } from "./handler-types.js";

// Import workflow handlers
import { workflowHandlers } from "../tools/handlers/index.js";

/**
 * Registry of all available tools mapped to their handler functions
 */
export const toolRegistry: ToolRegistry = {
  // Workflow tools
  workflow_list_entrypoints: workflowHandlers.listEntrypoints,
  workflow_get_step: workflowHandlers.getStep,
  workflow_create_or_update: workflowHandlers.createOrUpdateWorkflow,
  workflow_delete: workflowHandlers.deleteWorkflow,
  workflow_find_orphans: workflowHandlers.findOrphans,
  workflow_find_invalid_links: workflowHandlers.findInvalidLinks,
  workflow_get_raw_content: workflowHandlers.getWorkflowRawContent
}; 