import { McpClient } from '../services/mcp-client.js';
import { NotificationListener } from '../services/notification-listener.js';
import { GraphBuilder } from '../services/graph-builder.js';
import { WorkflowGraph } from './workflow-graph.js';
import { DiagnosticsPanel } from './diagnostics-panel.js';
import { TextEditor } from './text-editor.js';
import { WorkflowEntrypoint, WorkflowStep, WorkflowDiagnostics, OrphanedWorkflow, ToolCallResponse } from '../types/workflow.js';

export class UIController {
  private mcpClient: McpClient;
  private notificationListener: NotificationListener;
  private graphBuilder: GraphBuilder;
  private workflowGraph: WorkflowGraph;
  private diagnosticsPanel: DiagnosticsPanel;
  private textEditor: TextEditor;
  private isLoading = false;
  private refreshDebounceTimer: number | null = null;
  private readonly DEBOUNCE_DELAY = 500; // 500ms debounce

  constructor() {
    this.mcpClient = new McpClient();
    this.notificationListener = new NotificationListener();
    this.graphBuilder = new GraphBuilder();
    this.workflowGraph = new WorkflowGraph('graph-container');
    this.diagnosticsPanel = new DiagnosticsPanel('diagnostics-container');
    this.textEditor = new TextEditor('text-editor-container');

    this.setupEventHandlers();
    this.setupTextEditor();
  }

  /**
   * Initialize the UI
   */
  async initialize(): Promise<void> {
    // Only log in development mode  
    if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'production') {
      console.log('Initializing workflow visualization UI...');
    }
    
    // Add component styles
    DiagnosticsPanel.addStyles();
    TextEditor.addStyles();
    
    // Setup notification handlers
    this.setupNotificationHandlers();
    
    // Initial data load
    await this.loadWorkflowData();
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Handle node clicks from graph
    const graphContainer = document.getElementById('graph-container');
    if (graphContainer) {
      graphContainer.addEventListener('nodeClick', (event: any) => {
        const nodeId = event.detail.nodeId;
        this.onNodeClick(nodeId);
      });

      graphContainer.addEventListener('nodeDoubleClick', (event: any) => {
        const nodeId = event.detail.nodeId;
        this.onNodeDoubleClick(nodeId);
      });
    }

    // Handle refresh button
    const refreshButton = document.getElementById('refresh-button');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        this.loadWorkflowData();
      });
    }

    // Handle fit button
    const fitButton = document.getElementById('fit-button');
    if (fitButton) {
      fitButton.addEventListener('click', () => {
        this.workflowGraph.fit();
      });
    }
  }

  /**
   * Setup notification handlers for real-time updates
   */
  private setupNotificationHandlers(): void {
    // Listen for resource updates (workflow file changes)
    this.notificationListener.on('resources/updated', (notification) => {
      this.debouncedRefresh('Workflow updated');
    });

    // Listen for resource list changes (workflows added/removed)
    this.notificationListener.on('resources/list_changed', (notification) => {
      this.debouncedRefresh('Workflow list changed');
    });

    // Listen for general messages
    this.notificationListener.on('notifications/message', (notification) => {
      console.log('Workflow message:', notification);
      this.showStatus(`📝 ${notification.params?.data || 'Workflow operation completed'}`);
    });
  }

  /**
   * Debounced refresh to prevent spam from multiple notifications
   */
  private debouncedRefresh(reason: string): void {
    if (this.refreshDebounceTimer) {
      clearTimeout(this.refreshDebounceTimer);
    }

    this.refreshDebounceTimer = window.setTimeout(() => {
      this.loadWorkflowData();
      this.refreshDebounceTimer = null;
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * Load workflow data and update UI
   */
  async loadWorkflowData(): Promise<void> {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.showStatus('🔄 Loading workflow data...');
    this.diagnosticsPanel.showLoading();

    try {
      // Load entrypoints
      const entrypointsResponse = await this.mcpClient.callTool<ToolCallResponse>('workflow_list_entrypoints');
      const entrypoints: WorkflowEntrypoint[] = JSON.parse(entrypointsResponse.content[0].text);

      // Build graph
      const graphData = await this.graphBuilder.buildWorkflowGraph(
        entrypoints,
        (stepId) => this.getWorkflowStep(stepId)
      );

      // Update graph visualization
      this.workflowGraph.updateGraph(graphData);

      // Load diagnostics
      await this.loadDiagnostics();

      // Update final stats
      const stats = this.workflowGraph.getStats();
      this.showStatus(`✅ Loaded ${stats.nodeCount} workflow steps with ${stats.edgeCount} connections`);

    } catch (error) {
      console.error('Failed to load workflow data:', error);
      this.showStatus('❌ Failed to load workflow data');
      this.diagnosticsPanel.showError('Failed to load workflow data');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load diagnostics data
   */
  private async loadDiagnostics(): Promise<void> {
    try {
      // Load orphans
      const orphansResponse = await this.mcpClient.callTool<ToolCallResponse>('workflow_find_orphans');
      const orphans: OrphanedWorkflow[] = JSON.parse(orphansResponse.content[0].text);

      // Load invalid links
      const invalidLinksResponse = await this.mcpClient.callTool<ToolCallResponse>('workflow_find_invalid_links');
      const invalidLinks: Array<{ sourceWorkflow: string; sourceTitle: string; invalidReference: string; line: number }> = JSON.parse(invalidLinksResponse.content[0].text);

      const diagnostics: WorkflowDiagnostics = {
        orphans,
        invalidLinks
      };

      const stats = this.workflowGraph.getStats();
      this.diagnosticsPanel.updateDiagnostics(diagnostics, stats);

    } catch (error) {
      console.error('Failed to load diagnostics:', error);
      this.diagnosticsPanel.showError('Failed to load diagnostics');
    }
  }

  /**
   * Get a specific workflow step
   */
  private async getWorkflowStep(stepId: string): Promise<WorkflowStep | null> {
    const response = await this.mcpClient.callTool<ToolCallResponse>('workflow_get_step', { step_id: stepId });
    return JSON.parse(response.content[0].text);
  }

  /**
   * Handle node click events
   */
  private onNodeClick(nodeId: string): void {
    console.log('Node clicked:', nodeId);
    this.workflowGraph.highlightNode(nodeId);
    this.showStatus(`🎯 Selected step: ${nodeId}`);
  }

  /**
   * Handle node double-click events
   */
  private async onNodeDoubleClick(nodeId: string): Promise<void> {
    console.log('Node double-clicked:', nodeId);
    
    try {
      // Try to get the workflow step to see if it exists
      const step = await this.getWorkflowStep(nodeId);
      
      if (!step) {
        throw new Error(`Workflow ${nodeId} does not exist`);
      }
      
      // If we get here, the workflow exists - open for editing
      const filename = `${nodeId}.md`;
      this.editWorkflow(filename);
      this.showStatus(`📝 Opening ${nodeId} for editing...`);
      
    } catch (error) {
      // Workflow doesn't exist - this is an error node, trigger create workflow
      console.log(`Workflow ${nodeId} doesn't exist, opening create form`);
      this.createMissingWorkflow(nodeId);
      this.showStatus(`➕ Creating missing workflow: ${nodeId}`);
    }
  }

  /**
   * Highlight a specific node (called from diagnostics panel)
   */
  highlightNode(nodeId: string): void {
    this.workflowGraph.highlightNode(nodeId);
    this.showStatus(`🔍 Highlighted step: ${nodeId}`);
  }

  /**
   * Show status message
   */
  private showStatus(message: string): void {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
      statusElement.textContent = message;
      
      // Clear status after 5 seconds
      setTimeout(() => {
        if (statusElement.textContent === message) {
          statusElement.textContent = '';
        }
      }, 5000);
    }
  }

  /**
   * Setup text editor event handlers
   */
  private setupTextEditor(): void {
    this.textEditor.onSaveHandler(async (filename: string, content: string) => {
      await this.saveWorkflowFile(filename, content);
    });

    this.textEditor.onCreateHandler(async (filename: string, title: string, description: string, content: string, isEntrypoint: boolean) => {
      await this.createWorkflowFromForm(filename, title, description, content, isEntrypoint);
    });

    this.textEditor.onCloseHandler(() => {
      // Refresh data after closing editor (in case file was changed)
      this.loadWorkflowData();
    });
  }

  /**
   * Edit a workflow file
   */
  async editWorkflow(filename: string): Promise<void> {
    try {
      this.showStatus('🔄 Loading workflow file...');
      
      // Load the raw file content using MCP tool
      const response = await this.mcpClient.callTool<ToolCallResponse>('workflow_get_raw_content', { filename });
      const content = response.content[0].text;
      
      // Open in text editor
      await this.textEditor.openFile({
        filename,
        content,
        readonly: false
      });

      this.showStatus('📝 Workflow file opened in editor');
    } catch (error) {
      console.error('Failed to load workflow file:', error);
      this.showStatus('❌ Failed to load workflow file');
    }
  }

  /**
   * Edit a workflow file and go to specific line
   */
  async editWorkflowAtLine(filename: string, lineNumber: number): Promise<void> {
    try {
      this.showStatus('🔄 Loading workflow file...');
      
      // Load the raw file content using MCP tool
      const response = await this.mcpClient.callTool<ToolCallResponse>('workflow_get_raw_content', { filename });
      const content = response.content[0].text;
      
      // Open in text editor at specific line
      await this.textEditor.openFile({
        filename,
        content,
        initialLine: lineNumber,
        readonly: false
      });

      this.showStatus(`📝 Workflow file opened at line ${lineNumber}`);
    } catch (error) {
      console.error('Failed to load workflow file:', error);
      this.showStatus('❌ Failed to load workflow file');
    }
  }

  /**
   * Delete a workflow file
   */
  async deleteWorkflow(filename: string): Promise<void> {
    if (!confirm(`Are you sure you want to delete the workflow "${filename}"? This action cannot be undone.`)) {
      return;
    }

    try {
      this.showStatus('🗑️ Deleting workflow...');
      
      await this.mcpClient.callTool<ToolCallResponse>('workflow_delete', { filename });
      
      this.showStatus('✅ Workflow deleted successfully');
      await this.loadWorkflowData(); // Refresh data
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      this.showStatus('❌ Failed to delete workflow');
    }
  }

  /**
   * Create a new workflow
   */
  async createNewWorkflow(): Promise<void> {
    try {
      this.showStatus('➕ Opening workflow creation form...');

      await this.textEditor.openCreateMode({
        mode: 'create',
        isEntrypoint: false
      });

      this.showStatus('📝 Fill out the form to create a new workflow');
    } catch (error) {
      console.error('Failed to open workflow creation form:', error);
      this.showStatus('❌ Failed to open creation form');
    }
  }

  /**
   * Create a missing workflow based on invalid reference
   */
  async createMissingWorkflow(stepId: string): Promise<void> {
    try {
      this.showStatus('➕ Opening workflow creation form...');

      // Generate suggested title from step ID
      const suggestedTitle = stepId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      await this.textEditor.openCreateMode({
        mode: 'create',
        suggestedFilename: stepId,
        suggestedTitle,
        isEntrypoint: false
      });

      this.showStatus(`📝 Fill out the form to create "${stepId}" workflow`);
    } catch (error) {
      console.error('Failed to create missing workflow:', error);
      this.showStatus('❌ Failed to create missing workflow');
    }
  }

  /**
   * Create workflow from form data
   */
  private async createWorkflowFromForm(filename: string, title: string, description: string, content: string, isEntrypoint: boolean): Promise<void> {
    try {
      // Ensure filename has .md extension
      const fullFilename = filename.endsWith('.md') ? filename : `${filename}.md`;
      
      await this.mcpClient.callTool<ToolCallResponse>('workflow_create_or_update', {
        filename: fullFilename,
        title,
        description,
        content,
        is_entrypoint: isEntrypoint
      });

      this.showStatus('✅ Workflow created successfully');
      await this.loadWorkflowData(); // Refresh data
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw new Error('Failed to create workflow: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Save workflow file content
   */
  private async saveWorkflowFile(filename: string, content: string): Promise<void> {
    try {
      // Parse the content to extract title and check for entrypoint
      const lines = content.split('\n');
      let title = filename.replace('.md', '');
      let isEntrypoint = false;

      // Simple frontmatter parsing
      if (lines[0] === '---') {
        for (let i = 1; i < lines.length; i++) {
          if (lines[i] === '---') break;
          
          const match = lines[i].match(/^title:\s*["'](.+)["']$/);
          if (match) {
            title = match[1];
          }
          
          if (lines[i].includes('entrypoint: true')) {
            isEntrypoint = true;
          }
        }
      }

      await this.mcpClient.callTool<ToolCallResponse>('workflow_create_or_update', {
        filename,
        title,
        content,
        is_entrypoint: isEntrypoint
      });

      this.showStatus('💾 Workflow saved successfully');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      throw new Error('Failed to save workflow: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.refreshDebounceTimer) {
      clearTimeout(this.refreshDebounceTimer);
    }
    this.notificationListener.disconnect();
    this.workflowGraph.destroy();
    this.textEditor.destroy();
  }
}

// Make UI controller available globally for diagnostics panel buttons
declare global {
  interface Window {
    workflowApp?: UIController;
  }
}