// Simple text editor with line numbers using textarea

export interface FileEditorOptions {
  filename: string;
  content: string;
  initialLine?: number;
  readonly?: boolean;
}

export interface CreateWorkflowOptions {
  mode: 'create';
  suggestedFilename?: string;
  suggestedTitle?: string;
  isEntrypoint?: boolean;
}

interface ParsedWorkflow {
  title: string;
  description: string;
  isEntrypoint: boolean;
  content: string;
  frontmatterLineCount: number;
}

export class TextEditor {
  private container: HTMLElement;
  private textarea: HTMLTextAreaElement | null = null;
  private lineNumbers: HTMLElement | null = null;
  private currentFilename: string = '';
  private editorMode: 'edit' | 'create' = 'edit';
  private frontmatterLineCount: number = 0;
  private onSave?: (filename: string, content: string) => Promise<void>;
  private onCreate?: (filename: string, title: string, description: string, content: string, isEntrypoint: boolean) => Promise<void>;
  private onClose?: () => void;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element with id '${containerId}' not found`);
    }
    this.container = container;
    this.initializeEditor();
  }

  /**
   * Parse frontmatter and content from raw workflow file
   */
  private parseWorkflowContent(rawContent: string): ParsedWorkflow {
    const lines = rawContent.split('\n');
    let title = '';
    let description = '';
    let isEntrypoint = false;
    let contentStartIndex = 0;
    let frontmatterLineCount = 0;

    // Check if file starts with frontmatter
    if (lines[0] === '---') {
      let frontmatterEnd = -1;
      
      // Find the end of frontmatter
      for (let i = 1; i < lines.length; i++) {
        if (lines[i] === '---') {
          frontmatterEnd = i;
          break;
        }
        
        // Parse frontmatter fields
        const line = lines[i].trim();
        if (line.startsWith('title:')) {
          const match = line.match(/title:\s*["'](.+?)["']/) || line.match(/title:\s*(.+)/);
          if (match) title = match[1].trim();
        } else if (line.startsWith('description:')) {
          const match = line.match(/description:\s*["'](.+?)["']/) || line.match(/description:\s*(.+)/);
          if (match) description = match[1].trim();
        } else if (line.includes('entrypoint: true')) {
          isEntrypoint = true;
        }
      }
      
      if (frontmatterEnd > -1) {
        contentStartIndex = frontmatterEnd + 1;
        frontmatterLineCount = frontmatterEnd + 1;
        
        // Skip empty lines after frontmatter
        while (contentStartIndex < lines.length && lines[contentStartIndex].trim() === '') {
          contentStartIndex++;
        }
      }
    }

    const content = lines.slice(contentStartIndex).join('\n');
    
    return {
      title,
      description,
      isEntrypoint,
      content,
      frontmatterLineCount
    };
  }

  /**
   * Reconstruct full workflow file from form fields and content
   */
  private reconstructWorkflowFile(title: string, description: string, isEntrypoint: boolean, content: string): string {
    const frontmatter = [
      '---',
      `title: "${title}"`,
      ...(description.trim() ? [`description: "${description}"`] : []),
      ...(isEntrypoint ? ['entrypoint: true'] : []),
      '---',
      ''
    ].join('\n');

    return frontmatter + content;
  }

  /**
   * Initialize the editor modal structure
   */
  private initializeEditor(): void {
    this.container.innerHTML = `
      <div class="editor-modal" id="editor-modal" style="display: none;">
        <div class="editor-modal-backdrop"></div>
        <div class="editor-modal-content">
          <div class="editor-header">
            <div class="editor-title">
              <span class="editor-icon">📝</span>
              <span id="editor-filename">Workflow Editor</span>
            </div>
            <div class="editor-actions">
              <button id="editor-save-btn" class="btn btn-primary">💾 Save</button>
              <button id="editor-close-btn" class="btn btn-secondary">✕ Close</button>
            </div>
          </div>
          <div class="editor-body">
            <!-- Unified Form and Editor -->
            <div class="unified-editor">
              <!-- Workflow Metadata Form -->
              <div class="metadata-section">
                <div class="metadata-grid">
                  <div class="form-group">
                    <label for="workflow-filename">Filename:</label>
                    <input type="text" id="workflow-filename" placeholder="workflow-name" />
                    <small>Filename without .md extension</small>
                  </div>
                  <div class="form-group">
                    <label for="workflow-title">Title:</label>
                    <input type="text" id="workflow-title" placeholder="Workflow Title" />
                  </div>
                  <div class="form-group">
                    <label for="workflow-description">Description:</label>
                    <input type="text" id="workflow-description" placeholder="Brief description of the workflow" />
                  </div>
                  <div class="form-group checkbox-group">
                    <label class="checkbox-label">
                      <input type="checkbox" id="workflow-entrypoint" />
                      <span class="checkmark"></span>
                      Entrypoint workflow
                    </label>
                    <small>Should this workflow be a starting point?</small>
                  </div>
                </div>
              </div>
              
              <!-- Content Editor -->
              <div class="content-section">
                <div class="content-header">
                  <h4>Content</h4>
                  <small>Markdown content without frontmatter</small>
                </div>
                <div class="editor-wrapper">
                  <div id="line-numbers" class="line-numbers"></div>
                  <textarea id="editor-textarea" class="editor-textarea" spellcheck="false" placeholder="Enter your workflow content here..."></textarea>
                </div>
              </div>
            </div>
          </div>
          <div class="editor-footer">
            <span id="editor-status" class="editor-status">Ready</span>
            <span id="editor-line-info" class="editor-line-info">Line 1, Column 1</span>
          </div>
        </div>
      </div>
    `;

    this.setupEventHandlers();
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Save button
    const saveButton = document.getElementById('editor-save-btn');
    if (saveButton) {
      saveButton.addEventListener('click', () => this.saveFile());
    }

    // Close button
    const closeButton = document.getElementById('editor-close-btn');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.closeEditor());
    }

    // Close on backdrop click
    const backdrop = this.container.querySelector('.editor-modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeEditor());
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.closeEditor();
      }
    });

    // Ctrl+S to save
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 's' && this.isOpen()) {
        e.preventDefault();
        this.saveFile();
      }
    });
  }

  /**
   * Open the editor in create mode
   */
  async openCreateMode(options: CreateWorkflowOptions): Promise<void> {
    this.editorMode = 'create';
    this.currentFilename = '';
    this.frontmatterLineCount = 0;
    
    // Update modal title
    const filenameElement = document.getElementById('editor-filename');
    if (filenameElement) {
      filenameElement.textContent = 'Create New Workflow';
    }

    // Update save button
    const saveButton = document.getElementById('editor-save-btn');
    if (saveButton) {
      saveButton.textContent = '➕ Create';
    }

    // Populate form with suggestions
    this.populateFormFields({
      filename: options.suggestedFilename || '',
      title: options.suggestedTitle || '',
      description: '',
      isEntrypoint: options.isEntrypoint || false,
      readonlyFilename: false
    });

    // Setup textarea editor with empty content
    this.textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement;
    this.lineNumbers = document.getElementById('line-numbers');
    
    if (this.textarea) {
      this.textarea.value = this.getDefaultWorkflowContent();
      this.updateLineNumbers();
      this.setupTextareaListeners();
    }

    // Show modal
    const modal = document.getElementById('editor-modal');
    if (modal) {
      modal.style.display = 'flex';
      // Focus the first input
      setTimeout(() => {
        const firstInput = document.getElementById('workflow-filename') as HTMLInputElement;
        if (firstInput) firstInput.focus();
      }, 100);
    }

    this.updateStatus('Ready to create workflow');
  }

  /**
   * Populate form fields
   */
  private populateFormFields(options: {
    filename: string;
    title: string;
    description: string;
    isEntrypoint: boolean;
    readonlyFilename: boolean;
  }): void {
    const filenameInput = document.getElementById('workflow-filename') as HTMLInputElement;
    const titleInput = document.getElementById('workflow-title') as HTMLInputElement;
    const descriptionInput = document.getElementById('workflow-description') as HTMLInputElement;
    const entrypointCheckbox = document.getElementById('workflow-entrypoint') as HTMLInputElement;

    if (filenameInput) {
      filenameInput.value = options.filename;
      filenameInput.readOnly = options.readonlyFilename;
      filenameInput.style.opacity = options.readonlyFilename ? '0.6' : '1';
    }
    
    if (titleInput) titleInput.value = options.title;
    if (descriptionInput) descriptionInput.value = options.description;
    if (entrypointCheckbox) entrypointCheckbox.checked = options.isEntrypoint;
  }

  /**
   * Get default workflow content template
   */
  private getDefaultWorkflowContent(): string {
    return `# Workflow Title

## Description

Add workflow description here.

## Steps

1. First step
2. Second step
3. Final step

## Next Steps

- Continue to @next-workflow@
- Or complete the process`;
  }

  /**
   * Open the editor with a file
   */
  async openFile(options: FileEditorOptions): Promise<void> {
    this.editorMode = 'edit';
    this.currentFilename = options.filename;
    
    // Parse the workflow content
    const parsed = this.parseWorkflowContent(options.content);
    this.frontmatterLineCount = parsed.frontmatterLineCount;
    
    // Update modal title
    const filenameElement = document.getElementById('editor-filename');
    if (filenameElement) {
      filenameElement.textContent = `Editing: ${options.filename}`;
    }

    // Update save button
    const saveButton = document.getElementById('editor-save-btn');
    if (saveButton) {
      saveButton.textContent = '💾 Save';
    }

    // Populate form fields from parsed content
    this.populateFormFields({
      filename: options.filename.replace('.md', ''),
      title: parsed.title,
      description: parsed.description,
      isEntrypoint: parsed.isEntrypoint,
      readonlyFilename: true
    });

    // Setup textarea editor with content only (no frontmatter)
    this.textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement;
    this.lineNumbers = document.getElementById('line-numbers');
    
    if (this.textarea) {
      this.textarea.value = parsed.content;
      this.updateLineNumbers();
      this.setupTextareaListeners();

      // Go to specific line if requested (adjust for removed frontmatter)
      if (options.initialLine && options.initialLine > 0) {
        // Adjust for frontmatter removal: diagnostics show raw file line numbers
        // but editor shows only content lines, so subtract frontmatter line count
        const adjustedLine = Math.max(1, options.initialLine - this.frontmatterLineCount);
        setTimeout(() => this.goToLine(adjustedLine), 100);
      }
    }

    // Show modal
    const modal = document.getElementById('editor-modal');
    if (modal) {
      modal.style.display = 'flex';
      // Focus the content textarea
      setTimeout(() => {
        if (this.textarea) {
          this.textarea.focus();
        }
      }, 100);
    }

    this.updateStatus('File loaded');
  }

  /**
   * Close the editor
   */
  private closeEditor(): void {
    const modal = document.getElementById('editor-modal');
    if (modal) {
      modal.style.display = 'none';
    }

    // Clear textarea content
    if (this.textarea) {
      this.textarea.value = '';
      this.textarea = null;
    }
    if (this.lineNumbers) {
      this.lineNumbers.innerHTML = '';
      this.lineNumbers = null;
    }

    if (this.onClose) {
      this.onClose();
    }
  }

  /**
   * Save the current file or create new workflow
   */
  private async saveFile(): Promise<void> {
    if (this.editorMode === 'create') {
      await this.createWorkflow();
    } else {
      await this.saveExistingFile();
    }
  }

  /**
   * Save existing file
   */
  private async saveExistingFile(): Promise<void> {
    if (!this.textarea || !this.currentFilename) {
      return;
    }

    try {
      this.updateStatus('Saving...');
      
      // Get form data
      const { title, description, isEntrypoint, valid } = this.getFormData();
      if (!valid) return;
      
      // Get content from textarea
      const content = this.textarea.value;
      
      // Reconstruct full file with frontmatter
      const fullContent = this.reconstructWorkflowFile(title, description, isEntrypoint, content);
      
      if (this.onSave) {
        await this.onSave(this.currentFilename, fullContent);
        this.updateStatus('Saved successfully');
      }
    } catch (error) {
      console.error('Failed to save file:', error);
      this.updateStatus('Save failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Get form data and validate
   */
  private getFormData(): { filename: string; title: string; description: string; isEntrypoint: boolean; valid: boolean } {
    const filenameInput = document.getElementById('workflow-filename') as HTMLInputElement;
    const titleInput = document.getElementById('workflow-title') as HTMLInputElement;
    const descriptionInput = document.getElementById('workflow-description') as HTMLInputElement;
    const entrypointCheckbox = document.getElementById('workflow-entrypoint') as HTMLInputElement;

    if (!filenameInput || !titleInput) {
      this.updateStatus('Form elements not found');
      return { filename: '', title: '', description: '', isEntrypoint: false, valid: false };
    }

    const filename = filenameInput.value.trim();
    const title = titleInput.value.trim();
    const description = descriptionInput?.value.trim() || '';
    const isEntrypoint = entrypointCheckbox?.checked || false;

    // Validate required fields
    if (!filename) {
      this.updateStatus('Filename is required');
      filenameInput.focus();
      return { filename, title, description, isEntrypoint, valid: false };
    }

    if (!title) {
      this.updateStatus('Title is required');
      titleInput.focus();
      return { filename, title, description, isEntrypoint, valid: false };
    }

    return { filename, title, description, isEntrypoint, valid: true };
  }

  /**
   * Create new workflow from form
   */
  private async createWorkflow(): Promise<void> {
    if (!this.textarea) {
      this.updateStatus('Editor not available');
      return;
    }

    try {
      this.updateStatus('Creating workflow...');
      
      // Get form data
      const { filename, title, description, isEntrypoint, valid } = this.getFormData();
      if (!valid) return;
      
      // Get content from textarea
      const content = this.textarea.value;
      
      // Reconstruct full file with frontmatter
      const fullContent = this.reconstructWorkflowFile(title, description, isEntrypoint, content);
      
      if (this.onCreate) {
        await this.onCreate(filename, title, description, fullContent, isEntrypoint);
        this.updateStatus('Workflow created successfully');
        
        // Close the modal after successful creation
        setTimeout(() => this.closeEditor(), 1000);
      }
    } catch (error) {
      console.error('Failed to create workflow:', error);
      this.updateStatus('Creation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Generate workflow content template
   */
  private generateWorkflowContent(title: string, description: string, isEntrypoint: boolean): string {
    const frontmatter = [
      '---',
      `title: "${title}"`,
      ...(description ? [`description: "${description}"`] : []),
      ...(isEntrypoint ? ['entrypoint: true'] : []),
      '---',
      ''
    ].join('\n');

    const content = [
      `# ${title}`,
      '',
      ...(description ? ['## Description', '', description, ''] : []),
      '## Steps',
      '',
      '1. First step',
      '2. Second step',
      '3. Final step',
      '',
      '## Next Steps',
      '',
      '- Continue to @next-workflow@',
      '- Or complete the process',
      ''
    ].join('\n');

    return frontmatter + content;
  }

  /**
   * Go to a specific line
   */
  private goToLine(lineNumber: number): void {
    if (!this.textarea) return;

    const lines = this.textarea.value.split('\n');
    const targetLine = Math.max(1, Math.min(lineNumber, lines.length));
    
    // Calculate character position for the start of the target line
    let charPos = 0;
    for (let i = 0; i < targetLine - 1; i++) {
      charPos += lines[i].length + 1; // +1 for newline
    }
    
    this.textarea.focus();
    this.textarea.setSelectionRange(charPos, charPos);
    
    // Scroll to the line
    const lineHeight = 20; // Approximate line height
    this.textarea.scrollTop = (targetLine - 1) * lineHeight - this.textarea.clientHeight / 2;
    
    this.updateLineInfo();
  }

  /**
   * Update line and column information
   */
  private updateLineInfo(): void {
    if (!this.textarea) return;

    const cursorPos = this.textarea.selectionStart;
    const textUpToCursor = this.textarea.value.substring(0, cursorPos);
    const lines = textUpToCursor.split('\n');
    const lineNumber = lines.length;
    const column = lines[lines.length - 1].length + 1;

    const lineInfoElement = document.getElementById('editor-line-info');
    if (lineInfoElement) {
      lineInfoElement.textContent = `Line ${lineNumber}, Column ${column}`;
    }
  }

  /**
   * Setup textarea event listeners
   */
  private setupTextareaListeners(): void {
    if (!this.textarea) return;

    // Update line numbers and info on input
    this.textarea.addEventListener('input', () => {
      this.updateLineNumbers();
      this.updateLineInfo();
    });

    // Update line info on selection change
    this.textarea.addEventListener('selectionchange', () => {
      this.updateLineInfo();
    });

    // Update line info on mouse clicks and key navigation
    this.textarea.addEventListener('click', () => {
      this.updateLineInfo();
    });

    this.textarea.addEventListener('keyup', () => {
      this.updateLineInfo();
    });

    // Sync scroll between textarea and line numbers
    this.textarea.addEventListener('scroll', () => {
      if (this.lineNumbers) {
        this.lineNumbers.scrollTop = this.textarea!.scrollTop;
      }
    });
  }

  /**
   * Update line numbers display
   */
  private updateLineNumbers(): void {
    if (!this.textarea || !this.lineNumbers) return;

    const lines = this.textarea.value.split('\n');
    const lineNumbersHtml = lines.map((_, index) => 
      `<div class="line-number">${index + 1}</div>`
    ).join('');
    
    this.lineNumbers.innerHTML = lineNumbersHtml;
  }

  /**
   * Update status message
   */
  private updateStatus(message: string): void {
    const statusElement = document.getElementById('editor-status');
    if (statusElement) {
      statusElement.textContent = message;
      
      // Clear status after 3 seconds
      setTimeout(() => {
        if (statusElement.textContent === message) {
          statusElement.textContent = 'Ready';
        }
      }, 3000);
    }
  }

  /**
   * Check if editor is open
   */
  private isOpen(): boolean {
    const modal = document.getElementById('editor-modal');
    return modal ? modal.style.display !== 'none' : false;
  }

  /**
   * Set save handler
   */
  onSaveHandler(handler: (filename: string, content: string) => Promise<void>): void {
    this.onSave = handler;
  }

  /**
   * Set close handler
   */
  onCloseHandler(handler: () => void): void {
    this.onClose = handler;
  }

  /**
   * Set create handler
   */
  onCreateHandler(handler: (filename: string, title: string, description: string, content: string, isEntrypoint: boolean) => Promise<void>): void {
    this.onCreate = handler;
  }

  /**
   * Add styles to the document
   */
  static addStyles(): void {
    const styleId = 'text-editor-styles';
    if (document.getElementById(styleId)) {
      return; // Styles already added
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .editor-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .editor-modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
      }

      .editor-modal-content {
        position: relative;
        width: 90%;
        height: 80%;
        max-width: 1200px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        display: grid;
        grid-template-rows: auto 1fr auto;
        overflow: hidden;
      }

      .editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
      }

      .editor-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        color: #333;
      }

      .editor-icon {
        font-size: 18px;
      }

      .editor-actions {
        display: flex;
        gap: 10px;
      }

      .btn {
        background: #2196f3;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
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

      .btn-secondary {
        background: #6c757d;
      }

      .btn-secondary:hover {
        background: #5a6268;
      }

      .editor-body {
        position: relative;
        overflow: hidden;
      }

      .unified-editor {
        display: grid;
        grid-template-rows: auto 1fr;
        height: 100%;
        gap: 0;
      }

      .metadata-section {
        background: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
        padding: 20px;
      }

      .metadata-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        max-width: 800px;
      }

      .metadata-grid .checkbox-group {
        grid-column: span 2;
      }

      .content-section {
        display: grid;
        grid-template-rows: auto 1fr;
        min-height: 0;
      }

      .content-header {
        padding: 15px 20px 10px 20px;
        background: white;
        border-bottom: 1px solid #dee2e6;
      }

      .content-header h4 {
        margin: 0 0 5px 0;
        color: #333;
        font-size: 14px;
        font-weight: 600;
      }

      .content-header small {
        color: #666;
        font-size: 12px;
      }

      .editor-wrapper {
        display: flex;
        height: 100%;
        width: 100%;
        position: relative;
        min-height: 0;
      }

      .line-numbers {
        background: #f8f9fa;
        border-right: 1px solid #dee2e6;
        padding: 10px 8px;
        font-family: SFMono-Regular, Monaco, Inconsolata, Roboto Mono, monospace;
        font-size: 14px;
        line-height: 20px;
        text-align: right;
        color: #6c757d;
        user-select: none;
        min-width: 50px;
        overflow: hidden;
        white-space: nowrap;
      }

      .line-number {
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      .editor-textarea {
        flex: 1;
        border: none;
        outline: none;
        resize: none;
        font-family: SFMono-Regular, Monaco, Inconsolata, Roboto Mono, monospace;
        font-size: 14px;
        line-height: 20px;
        padding: 10px;
        background: white;
        color: #333;
        tab-size: 2;
        white-space: pre;
        overflow-wrap: normal;
        overflow-x: auto;
      }

      .editor-textarea:focus {
        outline: none;
      }

      .create-form {
        padding: 20px;
        background: white;
        height: 100%;
        overflow-y: auto;
      }

      .form-section h3 {
        margin: 0 0 20px 0;
        color: #333;
        font-size: 18px;
      }

      .form-grid {
        display: grid;
        gap: 15px;
        max-width: 500px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .form-group label {
        font-weight: 600;
        color: #555;
        font-size: 14px;
      }

      .form-group input[type="text"] {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        font-family: inherit;
      }

      .form-group input[type="text"]:focus {
        outline: none;
        border-color: #2196f3;
        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
      }

      .form-group small {
        color: #666;
        font-size: 12px;
      }

      .checkbox-group {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: 10px;
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        user-select: none;
      }

      .checkbox-label input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      .checkbox-group small {
        color: #666;
        font-size: 12px;
        margin-top: 2px;
      }

      .editor-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 20px;
        background: #f8f9fa;
        border-top: 1px solid #dee2e6;
        font-size: 12px;
        color: #666;
      }

      .editor-status {
        color: #666;
      }

      .editor-line-info {
        color: #666;
        font-family: SFMono-Regular, Monaco, Inconsolata, Roboto Mono, monospace;
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .editor-modal-content {
          width: 95%;
          height: 90%;
        }

        .editor-header {
          padding: 10px 15px;
        }

        .editor-actions {
          flex-direction: column;
          gap: 5px;
        }

        .btn {
          padding: 6px 12px;
          font-size: 12px;
        }

        .editor-footer {
          padding: 8px 15px;
          flex-direction: column;
          gap: 5px;
          align-items: flex-start;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Destroy the editor instance
   */
  destroy(): void {
    if (this.textarea) {
      this.textarea = null;
    }
    if (this.lineNumbers) {
      this.lineNumbers = null;
    }
  }
}