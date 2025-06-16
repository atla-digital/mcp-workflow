#!/usr/bin/env node
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

import { toolRegistry } from "../utils/tool-registry.js";
import { allTools } from "../tools/definitions/index.js";
import { promptDefinitions, promptTemplates } from "../utils/prompts-data.js";
import { WorkflowEngine } from "../services/workflow-engine.js";

class WorkflowStreamableHttpServer {
  private server: Server;
  private transport: StreamableHTTPServerTransport;
  private httpServer?: any;
  private port: number;
  private workflowEngine: WorkflowEngine;

  constructor(port: number = 3000) {
    this.port = port;
    
    // Initialize workflow engine
    this.workflowEngine = new WorkflowEngine();
    
    // Create server instance
    this.server = new Server(
      {
        name: "mcp-workflow",
        version: "0.1.0",
      },
      {
        capabilities: {
          canListTools: true,
          canCallTools: true,
          canListPrompts: true,
          canGetPrompts: true,
          tools: { listChanged: false },
          prompts: { listChanged: false }
        }
      }
    );

    // Create transport instance with stateless mode
    this.transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // Stateless
      enableJsonResponse: false
    });

    this.setupMCPHandlers();
  }

  /**
   * Set up MCP request handlers for the server instance
   */
  private setupMCPHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: allTools
      };
    });

    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: promptDefinitions
      };
    });

    // Get specific prompt content
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const promptName = request.params.name;
      const template = promptTemplates[promptName];
      
      if (!template) {
        throw new McpError(ErrorCode.InvalidRequest, `Unknown prompt: ${promptName}`);
      }

      let content = template;
      
      // Replace argument placeholders if arguments are provided
      if (request.params.arguments) {
        for (const [key, value] of Object.entries(request.params.arguments)) {
          const placeholder = `{{${key}}}`;
          content = content.replace(new RegExp(placeholder, 'g'), String(value));
        }
      }
      
      // Remove any remaining unused placeholders (especially for optional parameters)
      content = content.replace(/\{\{additional_instructions\}\}\s*/g, '');

      return {
        description: promptDefinitions.find(p => p.name === promptName)?.description || "",
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: content
            }
          }
        ]
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
   * Initialize prompts by loading workflows
   */
  private async initializePrompts(): Promise<void> {
    // Trigger workflow loading which will populate prompts
    await this.workflowEngine.listEntrypoints();
  }

  /**
   * Start the HTTP server
   */
  async start(): Promise<void> {
    // Initialize prompts
    await this.initializePrompts();
    
    // Connect server to transport
    await this.server.connect(this.transport);

    // Start HTTP server manually
    const { createServer } = await import('http');
    this.httpServer = createServer((req, res) => {
      // Handle CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Mcp-Session-Id');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      // Health check endpoint
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
        return;
      }

      // Forward MCP requests to transport
      if (req.url === '/mcp') {
        (this.transport as any).handleRequest(req, res);
        return;
      }

      // 404 for other paths
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
    });

    return new Promise((resolve, reject) => {
      this.httpServer!.listen(this.port, () => {
        console.log(`Workflow MCP Server running on http://localhost:${this.port}/mcp`);
        resolve();
      });

      this.httpServer!.on('error', reject);
    });
  }

  /**
   * Stop the HTTP server
   */
  async stop(): Promise<void> {
    if (this.httpServer) {
      await this.httpServer.close();
      console.log('Workflow MCP Server stopped');
    }
  }
}

// Start the server
const port = parseInt(process.env.PORT || '3000');
const server = new WorkflowStreamableHttpServer(port);

server.start().catch(error => {
  console.error("Failed to start HTTP server:", error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await server.stop();
  process.exit(0);
});