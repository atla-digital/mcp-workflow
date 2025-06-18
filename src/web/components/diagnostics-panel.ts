import { WorkflowDiagnostics, OrphanedWorkflow } from '../types/workflow.js';

export class DiagnosticsPanel {
  private container: HTMLElement;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element with id '${containerId}' not found`);
    }
    this.container = container;
    this.initializePanel();
  }

  /**
   * Initialize the diagnostics panel HTML structure
   */
  private initializePanel(): void {
    this.container.innerHTML = `
      <div class="diagnostics-panel">
        <div class="diagnostics-grid">
          <section class="stats-section">
            <h4>📊 Statistics</h4>
            <div id="stats-content">
              <p>Loading...</p>
            </div>
          </section>
          <section class="orphans-section">
            <h4>🔗 Orphaned Workflows</h4>
            <div id="orphans-content">
              <p>Loading...</p>
            </div>
          </section>
          <section class="invalid-links-section">
            <h4>❌ Invalid Links</h4>
            <div id="invalid-links-content">
              <p>Loading...</p>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  /**
   * Update the diagnostics panel with new data
   */
  updateDiagnostics(diagnostics: WorkflowDiagnostics, stats?: { nodeCount: number; edgeCount: number }): void {
    this.updateStats(stats);
    this.updateOrphans(diagnostics.orphans);
    this.updateInvalidLinks(diagnostics.invalidLinks);
  }

  /**
   * Update statistics section
   */
  private updateStats(stats?: { nodeCount: number; edgeCount: number }): void {
    const statsContent = document.getElementById('stats-content');
    if (!statsContent) return;

    if (stats) {
      statsContent.innerHTML = `
        <div class="stat-item">
          <span class="stat-label">Workflow Steps:</span>
          <span class="stat-value">${stats.nodeCount}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Connections:</span>
          <span class="stat-value">${stats.edgeCount}</span>
        </div>
      `;
    } else {
      statsContent.innerHTML = '<p class="no-data">No statistics available</p>';
    }
  }

  /**
   * Update orphaned workflows section
   */
  private updateOrphans(orphans: OrphanedWorkflow[]): void {
    const orphansContent = document.getElementById('orphans-content');
    if (!orphansContent) return;

    if (orphans.length === 0) {
      orphansContent.innerHTML = `
        <p class="no-issues">✅ No orphaned workflows found</p>
        <div class="section-actions">
          <button class="btn btn-primary" onclick="window.workflowApp?.createNewWorkflow()">
            ➕ Add Workflow
          </button>
        </div>
      `;
      return;
    }

    const orphansList = orphans.map(orphan => `
      <div class="diagnostic-item orphan-item">
        <span class="item-icon">🔗</span>
        <div class="item-details">
          <div class="item-main" title="Workflow: ${this.escapeHtml(orphan.title)} (${this.escapeHtml(orphan.filename)})">
            <strong>WF:</strong> ${this.escapeHtml(orphan.title)}
          </div>
          <div class="item-sub" title="Reason: ${this.escapeHtml(orphan.reason)}">
            <strong>File:</strong> ${this.escapeHtml(orphan.filename)}
          </div>
        </div>
        <div class="item-actions">
          <button class="item-action edit-btn" onclick="window.workflowApp?.editWorkflow('${orphan.filename}')">
            ✏️ Edit
          </button>
          <button class="item-action delete-btn" onclick="window.workflowApp?.deleteWorkflow('${orphan.filename}')">
            🗑️ Delete
          </button>
        </div>
      </div>
    `).join('');

    orphansContent.innerHTML = `
      <div class="section-header-with-actions">
        <p class="issue-count">Found ${orphans.length} orphaned workflow(s):</p>
        <button class="btn btn-primary btn-small" onclick="window.workflowApp?.createNewWorkflow()">
          ➕ Add Workflow
        </button>
      </div>
      <div class="diagnostic-list">${orphansList}</div>
    `;
  }

  /**
   * Update invalid links section
   */
  private updateInvalidLinks(invalidLinks: Array<{ sourceWorkflow: string; sourceTitle: string; invalidReference: string; line: number }>): void {
    const invalidLinksContent = document.getElementById('invalid-links-content');
    if (!invalidLinksContent) return;

    if (invalidLinks.length === 0) {
      invalidLinksContent.innerHTML = `
        <p class="no-issues">✅ No invalid links found</p>
        <div class="section-actions">
          <button class="btn btn-primary" onclick="window.workflowApp?.createNewWorkflow()">
            ➕ Create Missing Workflow
          </button>
        </div>
      `;
      return;
    }

    const invalidLinksList = invalidLinks.map(link => `
      <div class="diagnostic-item invalid-link-item">
        <span class="item-icon">❌</span>
        <div class="item-details">
          <div class="item-main" title="Workflow: ${this.escapeHtml(link.sourceTitle)} (${this.escapeHtml(link.sourceWorkflow)})">
            <strong>WF:</strong> ${this.escapeHtml(link.sourceTitle)}
          </div>
          <div class="item-sub" title="Invalid Reference: ${this.escapeHtml(link.invalidReference)} (line ${link.line})">
            <strong>Ref:</strong> ${this.escapeHtml(link.invalidReference)} (L${link.line})
          </div>
        </div>
        <div class="item-actions">
          <button class="item-action edit-btn" onclick="window.workflowApp?.editWorkflowAtLine('${link.sourceWorkflow}', ${link.line})">
            📝 Locate
          </button>
          <button class="item-action create-btn" onclick="window.workflowApp?.createMissingWorkflow('${link.invalidReference}')">
            ➕ Create
          </button>
        </div>
      </div>
    `).join('');

    invalidLinksContent.innerHTML = `
      <div class="section-header">
        <p class="issue-count">Found ${invalidLinks.length} invalid link(s):</p>
      </div>
      <div class="diagnostic-list">${invalidLinksList}</div>
    `;
  }

  /**
   * Show loading state
   */
  showLoading(): void {
    const sections = ['stats-content', 'orphans-content', 'invalid-links-content'];
    sections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.innerHTML = '<p class="loading">Loading...</p>';
      }
    });
  }

  /**
   * Show error state
   */
  showError(message: string): void {
    const sections = ['stats-content', 'orphans-content', 'invalid-links-content'];
    sections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.innerHTML = `<p class="error">❌ ${this.escapeHtml(message)}</p>`;
      }
    });
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Add custom CSS styles
   */
  static addStyles(): void {
    const styleId = 'diagnostics-panel-styles';
    if (document.getElementById(styleId)) {
      return; // Styles already added
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .diagnostics-panel {
        padding: 15px;
        background: #f9f9f9;
        height: 100%;
        box-sizing: border-box;
        overflow: hidden;
        display: grid;
        grid-template-rows: 1fr;
      }

      .diagnostics-grid {
        display: grid;
        grid-template-rows: auto auto 1fr;
        gap: 15px;
        height: 100%;
        overflow: hidden;
      }

      .stats-section {
        grid-row: 1;
        background: white;
        border-radius: 6px;
        padding: 12px;
        border: 1px solid #e0e0e0;
      }

      .orphans-section {
        grid-row: 2;
        background: white;
        border-radius: 6px;
        padding: 12px;
        border: 1px solid #e0e0e0;
        min-height: 120px;
        max-height: 200px;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .invalid-links-section {
        grid-row: 3;
        background: white;
        border-radius: 6px;
        padding: 12px;
        border: 1px solid #e0e0e0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 0;
      }

      .stats-section h4,
      .orphans-section h4,
      .invalid-links-section h4 {
        margin: 0 0 10px 0;
        color: #555;
        font-size: 14px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 5px;
      }

      .stats-section h4,
      .orphans-section h4 {
        grid-row: 1;
      }

      .invalid-links-section h4 {
        flex-shrink: 0;
      }

      .stat-item {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        border-bottom: 1px solid #eee;
      }

      .stat-label {
        color: #666;
      }

      .stat-value {
        font-weight: bold;
        color: #333;
      }

      .diagnostic-list {
        overflow-y: scroll;
        overflow-x: hidden;
        width: 100%;
        max-width: 100%;
        border: 1px solid #eee;
        border-radius: 4px;
        background: #fafafa;
        padding: 4px;
        box-sizing: border-box;
      }

      .invalid-links-section #invalid-links-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 0;
      }

      .invalid-links-section .section-header {
        flex-shrink: 0;
        margin-bottom: 10px;
      }

      .invalid-links-section .diagnostic-list {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-color: #ccc #f0f0f0;
      }

      .invalid-links-section .diagnostic-list::-webkit-scrollbar {
        width: 8px;
      }

      .invalid-links-section .diagnostic-list::-webkit-scrollbar-track {
        background: #f0f0f0;
        border-radius: 4px;
      }

      .invalid-links-section .diagnostic-list::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
      }

      .invalid-links-section .diagnostic-list::-webkit-scrollbar-thumb:hover {
        background: #999;
      }

      .orphans-section::-webkit-scrollbar,
      .diagnostic-list::-webkit-scrollbar {
        width: 8px;
      }

      .orphans-section::-webkit-scrollbar-track,
      .diagnostic-list::-webkit-scrollbar-track {
        background: #f0f0f0;
        border-radius: 4px;
      }

      .orphans-section::-webkit-scrollbar-thumb,
      .diagnostic-list::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
      }

      .orphans-section::-webkit-scrollbar-thumb:hover,
      .diagnostic-list::-webkit-scrollbar-thumb:hover {
        background: #999;
      }

      .diagnostic-item {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 8px;
        align-items: start;
        padding: 8px;
        margin-bottom: 6px;
        background: #fafafa;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        font-size: 11px;
        box-sizing: border-box;
        min-width: 0;
      }

      .section-header-with-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        gap: 10px;
      }

      .section-actions {
        margin-top: 10px;
        text-align: center;
      }

      .btn {
        background: #2196f3;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        transition: background-color 0.2s;
      }

      .btn:hover {
        background: #1976d2;
      }

      .btn-primary {
        background: #28a745;
      }

      .btn-primary:hover {
        background: #218838;
      }

      .btn-small {
        padding: 4px 8px;
        font-size: 10px;
      }

      .item-actions {
        grid-column: 3;
        display: flex;
        gap: 4px;
        flex-direction: column;
        align-items: end;
      }

      .item-icon {
        grid-column: 1;
        font-size: 12px;
        align-self: start;
      }

      .item-text {
        grid-column: 2;
        color: #333;
        font-family: 'SFMono-Regular', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
        font-size: 11px;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: help;
      }

      .item-details {
        grid-column: 2;
        min-width: 0;
        overflow: hidden;
      }

      .item-main {
        color: #333;
        margin-bottom: 2px;
        font-size: 11px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: help;
      }

      .item-sub {
        color: #666;
        font-size: 10px;
        font-family: 'SFMono-Regular', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: help;
      }

      .item-action {
        background: #2196f3;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 10px;
        white-space: nowrap;
        text-align: center;
        min-width: 50px;
      }

      .item-action:hover {
        background: #1976d2;
      }

      .edit-btn {
        background: #17a2b8;
      }

      .edit-btn:hover {
        background: #138496;
      }

      .delete-btn {
        background: #dc3545;
      }

      .delete-btn:hover {
        background: #c82333;
      }

      .create-btn {
        background: #28a745;
      }

      .create-btn:hover {
        background: #218838;
      }

      .no-issues {
        color: #4caf50;
        font-style: italic;
        margin: 0;
      }

      .no-data, .loading {
        color: #666;
        font-style: italic;
        margin: 0;
      }

      .error {
        color: #f44336;
        margin: 0;
      }

      .issue-count {
        color: #ff9800;
        font-weight: bold;
        margin: 0 0 10px 0;
        font-size: 12px;
      }
    `;

    document.head.appendChild(style);
  }
}