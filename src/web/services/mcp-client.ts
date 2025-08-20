import { McpRequest, McpResponse, McpError as McpErrorType, ToolCallRequest, ToolCallResponse } from '../types/mcp.js';

export class McpClient {
  private baseUrl: string;
  private requestId: number = 0;

  constructor(baseUrl: string = '/mcp') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate a unique request ID
   */
  private generateId(): string {
    return `web-client-${++this.requestId}-${Date.now()}`;
  }

  /**
   * Make a generic MCP request
   */
  private async makeRequest<T>(method: string, params?: any): Promise<T> {
    const request: McpRequest = {
      jsonrpc: '2.0',
      id: this.generateId(),
      method,
      params
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`MCP HTTP Error ${response.status}:`, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const mcpResponse: McpResponse<T> = await response.json();

      if (mcpResponse.error) {
        throw new McpError(mcpResponse.error);
      }

      if (mcpResponse.result === undefined) {
        throw new Error('No result in MCP response');
      }

      return mcpResponse.result;
    } catch (error) {
      console.error('MCP request failed:', error);
      throw error;
    }
  }

  /**
   * Call an MCP tool
   */
  async callTool<T = ToolCallResponse>(name: string, args?: Record<string, any>): Promise<T> {
    const toolRequest: ToolCallRequest = {
      name,
      arguments: args
    };

    return this.makeRequest<T>('tools/call', toolRequest);
  }

  /**
   * List available tools
   */
  async listTools(): Promise<any> {
    return this.makeRequest('tools/list');
  }

  /**
   * List available prompts
   */
  async listPrompts(): Promise<any> {
    return this.makeRequest('prompts/list');
  }

  /**
   * Get a specific prompt
   */
  async getPrompt(name: string, args?: Record<string, any>): Promise<any> {
    return this.makeRequest('prompts/get', { name, arguments: args });
  }
}

export class McpError extends Error {
  public code: number;
  public data?: any;

  constructor(error: McpErrorType) {
    super(error.message);
    this.name = 'McpError';
    this.code = error.code;
    this.data = error.data;
  }
}