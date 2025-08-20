import { McpNotification, LoggingNotification, ResourceUpdatedNotification } from '../types/mcp.js';

export type NotificationHandler = (notification: McpNotification) => void;

export class NotificationListener {
  private eventSource: EventSource | null = null;
  private handlers: Map<string, NotificationHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(private mcpEndpoint: string = '/notifications') {
    this.connect();
  }

  /**
   * Connect to MCP notification stream
   */
  private connect(): void {
    try {
      // Create EventSource connection to MCP endpoint
      // The StreamableHTTPServerTransport will handle SSE for notifications
      this.eventSource = new EventSource(this.mcpEndpoint);

      this.eventSource.onopen = () => {
        console.log('Connected to MCP notification stream');
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const notification: McpNotification = JSON.parse(event.data);
          this.handleNotification(notification);
        } catch (error) {
          console.error('Failed to parse notification:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('MCP notification stream error:', error);
        this.handleReconnect();
      };

    } catch (error) {
      console.error('Failed to connect to MCP notification stream:', error);
      this.handleReconnect();
    }
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.disconnect();
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  /**
   * Handle incoming notifications
   */
  private handleNotification(notification: McpNotification): void {
    // Only log non-routine notifications to reduce console spam
    if (!['resources/updated', 'resources/list_changed'].includes(notification.method)) {
      console.log('Received MCP notification:', notification);
    }

    // Call handlers for this specific method
    const methodHandlers = this.handlers.get(notification.method) || [];
    methodHandlers.forEach(handler => {
      try {
        handler(notification);
      } catch (error) {
        console.error('Notification handler error:', error);
      }
    });

    // Call handlers for 'all' notifications
    const allHandlers = this.handlers.get('*') || [];
    allHandlers.forEach(handler => {
      try {
        handler(notification);
      } catch (error) {
        console.error('Notification handler error:', error);
      }
    });
  }

  /**
   * Subscribe to notifications of a specific method
   */
  on(method: string, handler: NotificationHandler): void {
    if (!this.handlers.has(method)) {
      this.handlers.set(method, []);
    }
    this.handlers.get(method)!.push(handler);
  }

  /**
   * Subscribe to all notifications
   */
  onAll(handler: NotificationHandler): void {
    this.on('*', handler);
  }

  /**
   * Unsubscribe from notifications
   */
  off(method: string, handler: NotificationHandler): void {
    const handlers = this.handlers.get(method);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Disconnect from notification stream
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}