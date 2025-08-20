#!/usr/bin/env node
import { randomUUID } from 'crypto';
import { IncomingMessage, ServerResponse } from 'http';
import { toolRegistry } from "../utils/tool-registry.js";
import { allTools } from "../tools/definitions/index.js";
import { promptDefinitions, promptTemplates } from "../utils/prompts-data.js";
import { WorkflowEngine } from "../services/workflow-engine.js";
import { StaticFileHandler } from "./static-handler.js";
import { NotificationService } from "../services/notification-service.js";

interface SessionData {
  sessionId?: string;
  lastUsed: Date;
  initialized: boolean;
  initializationCount: number;
  clientInfo?: any;
}

class WorkflowStreamableHttpServer {
  private httpServer?: any;
  private sessions = new Map<string, SessionData>();
  private cleanupInterval?: NodeJS.Timeout;
  private port: number;
  private workflowEngine: WorkflowEngine;
  private staticHandler: StaticFileHandler;

  constructor(port: number = 3000) {
    this.port = port;
    
    // Initialize workflow engine (using singleton)
    this.workflowEngine = WorkflowEngine.getInstance();
    
    // Initialize static file handler
    this.staticHandler = new StaticFileHandler();
  }

  /**
   * Get or create session data
   */
  private getSessionData(sessionKey: string = 'default'): SessionData {
    if (this.sessions.has(sessionKey)) {
      const session = this.sessions.get(sessionKey)!;
      session.lastUsed = new Date();
      return session;
    }

    // Create new session
    const sessionData: SessionData = {
      sessionId: undefined,
      lastUsed: new Date(),
      initialized: false,
      initializationCount: 0,
      clientInfo: undefined,
    };

    this.sessions.set(sessionKey, sessionData);
    return sessionData;
  }

  /**
   * Handle incoming HTTP requests
   */
  private async handleRequest(req: IncomingMessage, res: ServerResponse) {
    const timestamp = new Date().toISOString();
    const requestId = Math.random().toString(36).substring(2, 8);
    
    try {
      console.log(`[${requestId}] ${req.method} ${req.url} - ${timestamp}`);

      // Handle CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
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

      // Session heartbeat endpoint
      if (req.url === '/heartbeat' && req.method === 'POST') {
        const sessionData = this.getSessionData();
        sessionData.lastUsed = new Date();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'ok',
          sessionActive: true,
          timestamp: new Date().toISOString(),
        }));
        return;
      }

      // Session management endpoints
      if (req.url === '/sessions' && req.method === 'GET') {
        const stats = this.getDetailedSessionStats();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(stats));
        return;
      }

      if (req.url === '/sessions/cleanup' && req.method === 'POST') {
        try {
          const body = await this.readRequestBody(req);
          const { sessionKey } = JSON.parse(body || '{}');
          
          if (!sessionKey) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'sessionKey required' }));
            return;
          }

          const success = this.cleanupSession(sessionKey);
          res.writeHead(success ? 200 : 404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success, 
            message: success ? 'Session cleaned up' : 'Session not found' 
          }));
          return;
        } catch (error: any) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
          return;
        }
      }

      if (req.url === '/sessions/reset' && req.method === 'POST') {
        try {
          const body = await this.readRequestBody(req);
          const { sessionKey } = JSON.parse(body || '{}');
          
          if (!sessionKey) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'sessionKey required' }));
            return;
          }

          const success = this.resetSessionInitialization(sessionKey);
          res.writeHead(success ? 200 : 404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success, 
            message: success ? 'Session initialization reset' : 'Session not found' 
          }));
          return;
        } catch (error: any) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
          return;
        }
      }

      // Notifications endpoint for web UI (SSE)
      if (req.url === '/notifications' && req.method === 'GET') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        });

        // Send initial connection event
        res.write(`event: connected\ndata: {"type":"connected","timestamp":"${new Date().toISOString()}"}\n\n`);
        
        console.log(`[${requestId}] Notifications SSE connection established`);

        // Keep connection alive with periodic heartbeat
        const heartbeatInterval = setInterval(() => {
          if (!res.destroyed) {
            res.write(`event: heartbeat\ndata: {"type":"heartbeat","timestamp":"${new Date().toISOString()}"}\n\n`);
          } else {
            clearInterval(heartbeatInterval);
          }
        }, 30000); // 30 seconds

        // Clean up on client disconnect
        req.on('close', () => {
          console.log(`[${requestId}] Notifications SSE connection closed`);
          clearInterval(heartbeatInterval);
        });

        req.on('error', () => {
          console.log(`[${requestId}] Notifications SSE connection error`);
          clearInterval(heartbeatInterval);
        });

        return;
      }

      // MCP endpoint - only handle POST requests as per MCP specification
      if (req.url === '/mcp' && req.method === 'POST') {
        const body = await this.readRequestBody(req);
        const parsedBody = body ? JSON.parse(body) : undefined;

        console.log(`[${requestId}] MCP ${parsedBody?.method || 'unknown'} request`);

        const customHandledMethods = [
          'initialize', 'notifications/initialized', 'tools/list', 'prompts/list', 
          'tools/call', 'prompts/get'
        ];
        
        if (customHandledMethods.includes(parsedBody?.method)) {
          try {
            if (parsedBody.method === 'initialize') {
              const initResult = await this.handleInitialization(parsedBody.params || {});
              const responseData = {
                jsonrpc: '2.0',
                id: parsedBody.id,
                result: initResult
              };

              // Set session ID header
              res.setHeader('Mcp-Session-Id', initResult.sessionId);
              this.sendResponse(req, res, responseData);
            } else if (parsedBody.method === 'notifications/initialized') {
              res.writeHead(204);
              res.end();
            } else if (parsedBody.method === 'tools/list') {
              const responseData = {
                jsonrpc: '2.0',
                id: parsedBody.id,
                result: { tools: allTools }
              };
              this.sendResponse(req, res, responseData);
            } else if (parsedBody.method === 'prompts/list') {
              const responseData = {
                jsonrpc: '2.0',
                id: parsedBody.id,
                result: { prompts: promptDefinitions }
              };
              this.sendResponse(req, res, responseData);
            } else if (parsedBody.method === 'tools/call') {
              const toolName = parsedBody.params?.name;
              const toolArgs = parsedBody.params?.arguments || {};

              if (!toolName || typeof toolName !== 'string') {
                throw new Error('Tool name is required');
              }

              const handler = toolRegistry[toolName];
              if (!handler) {
                throw new Error(`Unknown tool: ${toolName}`);
              }

              const result = await handler({ name: toolName, arguments: toolArgs });
              const responseData = {
                jsonrpc: '2.0',
                id: parsedBody.id,
                result: result
              };
              this.sendResponse(req, res, responseData);
            } else if (parsedBody.method === 'prompts/get') {
              const promptName = parsedBody.params?.name;
              if (!promptName || typeof promptName !== 'string') {
                throw new Error('Prompt name is required');
              }

              const template = promptTemplates[promptName];
              if (!template) {
                throw new Error(`Unknown prompt: ${promptName}`);
              }

              let content = template;
              
              if (parsedBody.params?.arguments) {
                for (const [key, value] of Object.entries(parsedBody.params.arguments)) {
                  const placeholder = `{{${key}}}`;
                  content = content.replace(new RegExp(placeholder, 'g'), String(value));
                }
              }
              
              content = content.replace(/\{\{additional_instructions\}\}\s*/g, '');

              const responseData = {
                jsonrpc: '2.0',
                id: parsedBody.id,
                result: {
                  description: promptDefinitions.find(p => p.name === promptName)?.description || '',
                  messages: [
                    {
                      role: 'user' as const,
                      content: {
                        type: 'text' as const,
                        text: content,
                      },
                    },
                  ],
                }
              };
              this.sendResponse(req, res, responseData);
            }
            return;
          } catch (error: any) {
            console.error(`[${requestId}] Custom request handler failed:`, error.message);
            
            const errorResponse = {
              jsonrpc: '2.0',
              id: parsedBody?.id || null,
              error: {
                code: -32603,
                message: error.message || 'Internal error'
              }
            };
            this.sendResponse(req, res, errorResponse, 500);
            return;
          }
        }

        // Method not found
        const errorResponse = {
          jsonrpc: '2.0',
          id: parsedBody?.id || null,
          error: {
            code: -32601,
            message: `Method not found: ${parsedBody?.method || 'unknown'}`
          }
        };
        this.sendResponse(req, res, errorResponse, 404);
        return;
      }

      // Handle static files (web UI)
      if (StaticFileHandler.shouldHandle(req.url || '')) {
        const handled = await this.staticHandler.handleRequest(req, res);
        if (!handled) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('File not found');
        }
        return;
      }

      // 404 for other paths
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    } catch (error: any) {
      console.error(`[${requestId}] Request handling error:`, error.message);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    }
  }

  /**
   * Send response in appropriate format (always JSON for POST requests)
   */
  private sendResponse(req: IncomingMessage, res: ServerResponse, data: any, statusCode: number = 200) {
    // Always send JSON for POST requests (MCP protocol operations)
    // SSE is only for GET requests (EventSource connections)
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  /**
   * Read request body
   */
  private async readRequestBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      req.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        resolve(body);
      });
      req.on('error', reject);
    });
  }

  /**
   * Handle initialization request
   */
  private async handleInitialization(initParams: any): Promise<any> {
    const sessionData = this.getSessionData();
    
    // Generate new session ID
    const newSessionId = randomUUID();
    sessionData.sessionId = newSessionId;
    sessionData.initialized = true;
    sessionData.initializationCount += 1;
    sessionData.clientInfo = initParams.clientInfo;
    sessionData.lastUsed = new Date();

    console.log('Session initialized:', {
      sessionId: newSessionId,
      initCount: sessionData.initializationCount,
      clientName: initParams.clientInfo?.name || 'unknown'
    });

    return {
      protocolVersion: initParams.protocolVersion || '1.0.0',
      capabilities: {
        tools: { listChanged: false },
        prompts: { listChanged: false },
        resources: { listChanged: false, subscribe: false },
        experimental: {},
      },
      serverInfo: {
        name: 'mcp-workflow',
        version: '0.1.0',
      },
      sessionId: newSessionId,
    };
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

    // Set up cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveSessions();
    }, 300000); // 5 minutes

    // Start HTTP server
    const { createServer } = await import('http');
    this.httpServer = createServer((req, res) => this.handleRequest(req, res));

    return new Promise((resolve, reject) => {
      this.httpServer!.listen(this.port, () => {
        console.log(`🚀 Workflow MCP Server running on http://localhost:${this.port}`);
        console.log(`📊 Web UI available at: http://localhost:${this.port}/`);
        console.log(`🔗 MCP endpoint at: http://localhost:${this.port}/mcp`);
        console.log(`❤️  Health check at: http://localhost:${this.port}/health`);
        resolve();
      });

      this.httpServer!.on('error', reject);
    });
  }

  /**
   * Clean up inactive sessions
   */
  private cleanupInactiveSessions(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    let cleanedCount = 0;

    const sessionsSnapshot = Array.from(this.sessions.entries());
    for (const [sessionKey, session] of sessionsSnapshot) {
      if (now.getTime() - session.lastUsed.getTime() > maxAge) {
        this.sessions.delete(sessionKey);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} inactive sessions`);
    }
  }

  /**
   * Get session statistics
   */
  private getSessionStats(): { totalSessions: number; oldestSession: string | null } {
    if (this.sessions.size === 0) {
      return { totalSessions: 0, oldestSession: null };
    }

    let oldestTime = new Date();
    let oldestSessionKey = '';

    for (const [sessionKey, session] of this.sessions) {
      if (session.lastUsed < oldestTime) {
        oldestTime = session.lastUsed;
        oldestSessionKey = sessionKey.substring(0, 8) + '...';
      }
    }

    const ageInHours = Math.floor((new Date().getTime() - oldestTime.getTime()) / (1000 * 60 * 60));
    return {
      totalSessions: this.sessions.size,
      oldestSession: `${oldestSessionKey} (${ageInHours}h ago)`,
    };
  }

  /**
   * Clean up a specific session by session key
   */
  cleanupSession(sessionKey: string): boolean {
    const session = this.sessions.get(sessionKey);
    if (session) {
      this.sessions.delete(sessionKey);
      console.log('Session cleaned up:', {
        sessionKey: sessionKey.substring(0, 8) + '...',
        sessionId: session.sessionId,
      });
      return true;
    }
    return false;
  }

  /**
   * Reset initialization state for a specific session
   */
  resetSessionInitialization(sessionKey: string): boolean {
    const session = this.sessions.get(sessionKey);
    if (session) {
      session.initialized = false;
      session.initializationCount = 0;
      session.sessionId = undefined;
      session.clientInfo = undefined;
      session.lastUsed = new Date();
      console.log('Session initialization reset:', {
        sessionKey: sessionKey.substring(0, 8) + '...',
      });
      return true;
    }
    return false;
  }

  /**
   * Get detailed session information
   */
  getDetailedSessionStats(): any {
    const sessions = Array.from(this.sessions.entries()).map(([key, session]) => ({
      key: key.substring(0, 8) + '...',
      sessionId: session.sessionId,
      initialized: session.initialized,
      initializationCount: session.initializationCount,
      lastUsed: session.lastUsed.toISOString(),
      clientInfo: session.clientInfo?.name || 'unknown',
    }));

    return {
      totalSessions: this.sessions.size,
      sessions,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Stop the HTTP server
   */
  async stop(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Clear all sessions
    this.sessions.clear();

    if (this.httpServer) {
      return new Promise(resolve => {
        this.httpServer!.close(resolve);
        console.log('Workflow MCP Server stopped');
      });
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