/**
 * Common types and interfaces for workflow tool handlers
 */

import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";

/**
 * Function signature for tool handlers
 */
export type ToolHandler = (
  params: CallToolRequest['params']
) => Promise<any>;

/**
 * Definition for tool registry
 */
export interface ToolRegistry {
  [toolName: string]: ToolHandler;
} 