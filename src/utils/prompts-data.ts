/**
 * Workflow MCP Prompts Definitions
 * 
 * This file contains prompt templates for workflow entrypoints.
 * These prompts provide direct access to workflow steps for users.
 */

export interface PromptDefinition {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}

/**
 * Prompt templates with actual content
 * Will be populated dynamically based on workflow entrypoints
 */
export const promptTemplates: Record<string, string> = {};

/**
 * Available workflow prompts
 * Will be populated dynamically based on workflow entrypoints
 */
export const promptDefinitions: PromptDefinition[] = [];