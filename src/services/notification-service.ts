import { Server } from '@modelcontextprotocol/sdk/server/index.js';

export type NotificationSender = (notification: {
  method: string;
  params?: any;
}) => Promise<void>;

export class NotificationService {
  private static instance: NotificationService;
  private notificationSender: NotificationSender | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Set the notification sender (usually from MCP server)
   */
  setNotificationSender(sender: NotificationSender): void {
    this.notificationSender = sender;
  }

  /**
   * Send a workflow updated notification
   */
  async notifyWorkflowUpdated(workflowId: string, action: 'created' | 'updated' | 'deleted'): Promise<void> {
    if (!this.notificationSender) {
      console.debug(`No notification sender available for workflow ${action}: ${workflowId}`);
      return; // No notification sender available
    }

    try {
      // Send resource updated notification
      await this.notificationSender({
        method: 'resources/updated',
        params: {
          uri: `workflow://${workflowId}`
        }
      });

      console.debug(`Workflow ${action}: ${workflowId}`);

    } catch (error) {
      console.debug(`Failed to send workflow notification (${action}): ${workflowId}`, error instanceof Error ? error.message : String(error));
      // Don't throw - continue operation even if notifications fail
    }
  }

  /**
   * Send a workflow list changed notification
   */
  async notifyWorkflowListChanged(): Promise<void> {
    if (!this.notificationSender) {
      console.debug('No notification sender available for workflow list change');
      return;
    }

    try {
      await this.notificationSender({
        method: 'resources/list_changed',
        params: {}
      });

      console.debug('Workflow list updated');

    } catch (error) {
      console.debug('Failed to send workflow list notification:', error instanceof Error ? error.message : String(error));
      // Don't throw - continue operation even if notifications fail
    }
  }

  /**
   * Send a diagnostic message notification
   */
  async notifyDiagnostic(message: string, level: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    if (!this.notificationSender) {
      console.debug('No notification sender available for diagnostic:', message);
      return;
    }

    try {
      await this.notificationSender({
        method: 'notifications/message',
        params: {
          level,
          data: message,
          logger: 'workflow-diagnostics'
        }
      });

    } catch (error) {
      console.debug('Failed to send diagnostic notification:', error instanceof Error ? error.message : String(error));
      // Don't throw - continue operation even if notifications fail
    }
  }

  /**
   * Send a file watcher event notification
   */
  async notifyFileWatcherEvent(event: string, filename: string): Promise<void> {
    if (!this.notificationSender) {
      console.debug(`No notification sender available for file ${event}: ${filename}`);
      return;
    }

    // Skip debug notifications to reduce noise
    console.debug(`File ${event}: ${filename}`);
    
    // Don't send notifications for file watcher events to reduce noise
    // These were causing most of the errors
  }
}