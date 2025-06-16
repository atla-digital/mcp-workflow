#!/usr/bin/env node

/**
 * Workflow MCP Server
 * 
 * This server provides tools for navigating through markdown-based workflows
 * with branching logic and loops.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

// Import utility modules
import { toolRegistry } from "./utils/tool-registry.js";
import { allTools } from "./tools/definitions/index.js";

/**
 * Workflow MCP Server class
 */
class WorkflowServer {
  private server: Server;

  constructor() {
    // Initialize server with metadata and capabilities
    this.server = new Server(
      {
        name: "mcp-workflow",
        version: "0.1.0",
      },
      {
        capabilities: {
          canListTools: true,
          canCallTools: true,
          tools: { listChanged: false }
        }
      }
    );

    // Setup request handlers
    this.setupRequestHandlers();
  }

  /**
   * Set up MCP request handlers
   */
  private setupRequestHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: allTools
      };
    });

    // Call workflow tools
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const toolName = request.params.name;
        const handler = toolRegistry[toolName];
        
        if (!handler) {
          throw new McpError(ErrorCode.InvalidRequest, `Unknown tool: ${toolName}`);
        }
        
        return await handler(request.params);
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(ErrorCode.InternalError, `Error executing workflow operation: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
  }

  /**
   * Start the Workflow MCP server
   */
  public async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Create and start the server
const server = new WorkflowServer();
server.start().catch(error => {
  console.error("Failed to start server:", error);
  process.exit(1);
}); 