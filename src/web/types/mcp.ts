// MCP Protocol Types for Web Client

export interface McpRequest {
  jsonrpc: '2.0';
  id: string;
  method: string;
  params?: Record<string, any>;
}

export interface McpResponse<T = any> {
  jsonrpc: '2.0';
  id: string;
  result?: T;
  error?: McpError;
}

export interface McpError {
  code: number;
  message: string;
  data?: any;
}

export interface McpNotification {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, any>;
}

// Tool call types
export interface ToolCallRequest {
  name: string;
  arguments?: Record<string, any>;
}

export interface ToolCallResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

// Notification types
export interface LoggingNotification {
  method: 'notifications/message';
  params: {
    level: 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'critical' | 'alert' | 'emergency';
    data?: any;
    logger?: string;
  };
}

export interface ResourceUpdatedNotification {
  method: 'resources/updated';
  params: {
    uri: string;
  };
}

export interface ResourceListChangedNotification {
  method: 'resources/list_changed';
  params?: {};
}