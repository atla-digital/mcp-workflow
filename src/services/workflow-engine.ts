import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import matter from 'gray-matter';
import chokidar from 'chokidar';
import { promptDefinitions, promptTemplates } from '../utils/prompts-data.js';
import { NotificationService } from './notification-service.js';

interface WorkflowStep {
  id: string;
  title: string;
  content: string;
  nextSteps: string[];
  isEntrypoint: boolean;
  filename: string;
}

interface WorkflowEntrypoint {
  id: string;
  title: string;
  description?: string;
  filename: string;
}

interface CreateWorkflowRequest {
  filename: string;
  title: string;
  description?: string;
  content: string;
  isEntrypoint: boolean;
}

interface OrphanedWorkflow {
  id: string;
  title: string;
  filename: string;
  reason: string;
}

interface InvalidLink {
  sourceWorkflow: string;
  sourceTitle: string;
  invalidReference: string;
  line?: number;
}

export class WorkflowEngine {
  private workflowsPath: string;
  private stepCache: Map<string, WorkflowStep> = new Map();
  private entrypointsCache: WorkflowEntrypoint[] = [];
  private watcher?: chokidar.FSWatcher;
  private notificationService: NotificationService;
  private isInitializing = true;
  private initializationTimeout?: NodeJS.Timeout;

  constructor(workflowsPath: string = process.env.WORKFLOWS_PATH || '/app/workflows') {
    this.workflowsPath = workflowsPath;
    this.notificationService = NotificationService.getInstance();
    this.initializeWatcher();
    
    // Stop initialization mode after initial file scan completes
    this.initializationTimeout = setTimeout(() => {
      this.isInitializing = false;
      console.log('WorkflowEngine initialization complete, notifications enabled');
    }, 2000); // 2 second delay to allow initial file scan
  }

  private initializeWatcher() {
    this.watcher = chokidar.watch(`${this.workflowsPath}/**/*.md`, {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });

    this.watcher.on('change', (filePath) => this.handleFileChange('changed', filePath));
    this.watcher.on('add', (filePath) => this.handleFileChange('added', filePath));
    this.watcher.on('unlink', (filePath) => this.handleFileChange('removed', filePath));
  }

  /**
   * Handle file watcher events
   */
  private async handleFileChange(event: string, filePath: string): Promise<void> {
    const filename = path.basename(filePath);
    
    // Refresh cache first
    await this.refreshCache();
    
    // Skip notifications during initial loading to prevent spam
    if (this.isInitializing) {
      return;
    }
    
    // Send file watcher notification (only after initialization)
    await this.notificationService.notifyFileWatcherEvent(event, filename);
    
    // Determine workflow ID from filename
    const workflowId = filename.replace(/\.md$/, '');
    
    // Send appropriate notifications
    if (event === 'added') {
      await this.notificationService.notifyWorkflowUpdated(workflowId, 'created');
      await this.notificationService.notifyWorkflowListChanged();
    } else if (event === 'changed') {
      await this.notificationService.notifyWorkflowUpdated(workflowId, 'updated');
    } else if (event === 'removed') {
      await this.notificationService.notifyWorkflowUpdated(workflowId, 'deleted');
      await this.notificationService.notifyWorkflowListChanged();
    }
  }

  private async refreshCache() {
    this.stepCache.clear();
    this.entrypointsCache = [];
    await this.loadWorkflows();
  }

  private async loadWorkflows() {
    try {
      const files = await this.getMarkdownFiles();
      
      for (const file of files) {
        await this.parseWorkflowFile(file);
      }
      
      // Update prompts after loading workflows
      this.updatePrompts();
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
  }

  private async getMarkdownFiles(): Promise<string[]> {
    const files: string[] = [];
    
    async function scanDirectory(dir: string) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            await scanDirectory(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.md')) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Directory might not exist yet
      }
    }
    
    await scanDirectory(this.workflowsPath);
    return files;
  }

  private async parseWorkflowFile(filePath: string) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const { data: frontmatter, content: markdownContent } = matter(content);
      
      const filename = path.basename(filePath, '.md');
      const isEntrypoint = Boolean(frontmatter.entrypoint);
      
      // Extract step references (@step-id@) from content
      const stepReferences = this.extractStepReferences(markdownContent);
      
      const step: WorkflowStep = {
        id: filename,
        title: frontmatter.title || filename,
        content: markdownContent,
        nextSteps: stepReferences,
        isEntrypoint,
        filename
      };
      
      this.stepCache.set(filename, step);
      
      if (isEntrypoint) {
        this.entrypointsCache.push({
          id: filename,
          title: frontmatter.title || filename,
          description: frontmatter.description,
          filename
        });
      }
    } catch (error) {
      console.error(`Error parsing workflow file ${filePath}:`, error);
    }
  }

  private extractStepReferences(content: string): string[] {
    const stepRefRegex = /@([a-zA-Z0-9_-]+)@/g;
    const references: string[] = [];
    let match;
    
    while ((match = stepRefRegex.exec(content)) !== null) {
      if (!references.includes(match[1])) {
        references.push(match[1]);
      }
    }
    
    return references;
  }

  private updatePrompts() {
    // Clear existing prompts
    promptDefinitions.length = 0;
    Object.keys(promptTemplates).forEach(key => delete promptTemplates[key]);
    
    // Create prompts for each entrypoint
    for (const entrypoint of this.entrypointsCache) {
      const step = this.stepCache.get(entrypoint.id);
      if (!step) continue;
      
      // Create prompt definition
      promptDefinitions.push({
        name: entrypoint.id,
        description: `Execute workflow: ${entrypoint.title}${entrypoint.description ? ` - ${entrypoint.description}` : ''}`,
        arguments: [
          {
            name: "additional_instructions",
            description: "Optional additional instructions or context for executing this workflow",
            required: false
          }
        ]
      });
      
      // Create prompt template
      promptTemplates[entrypoint.id] = this.createPromptTemplate(step);
    }
  }
  
  private createPromptTemplate(step: WorkflowStep): string {
    return `# ${step.title}

{{additional_instructions}}

## Workflow Step

**Step ID:** ${step.id}

**Content:**
${step.content}

${step.nextSteps.length > 0 ? `
**Next Steps:**
${step.nextSteps.map(stepId => `- @${stepId}@`).join('\n')}

To continue this workflow, use the workflow_get_step tool with one of the next step IDs.
` : ''}

## Available Tools

You can use these workflow tools to navigate and manage workflows:

- **workflow_list_entrypoints**: List all available workflow entrypoints
- **workflow_get_step**: Get details for a specific workflow step
- **workflow_create_or_update**: Create or update workflow files
- **workflow_delete**: Delete workflow files
- **workflow_find_orphans**: Find orphaned workflows
- **workflow_find_invalid_links**: Find invalid workflow references

## Workflow Navigation

${step.nextSteps.length > 0 ? `
This workflow step references the following next steps:
${step.nextSteps.map(stepId => `- **${stepId}**: Use \`workflow_get_step\` with step_id="${stepId}" to continue`).join('\n')}
` : `
This workflow step has no next steps defined. This may be a terminal step in the workflow.
`}

## Getting Started

1. Review the workflow content above
2. Follow any instructions or guidelines provided
3. Use the workflow tools to navigate to next steps if available
4. Use workflow_get_step to continue the workflow with the next step ID

**Execute this workflow step now by following the content and instructions above.**`;
  }

  async listEntrypoints(search?: string): Promise<WorkflowEntrypoint[]> {
    if (this.entrypointsCache.length === 0) {
      await this.loadWorkflows();
    }
    
    let entrypoints = this.entrypointsCache;
    
    if (search) {
      const searchLower = search.toLowerCase();
      entrypoints = entrypoints.filter(entry => 
        entry.title.toLowerCase().includes(searchLower) ||
        entry.description?.toLowerCase().includes(searchLower) ||
        entry.id.toLowerCase().includes(searchLower)
      );
    }
    
    return entrypoints;
  }

  async getStep(stepId: string): Promise<WorkflowStep | null> {
    if (this.stepCache.size === 0) {
      await this.loadWorkflows();
    }
    
    return this.stepCache.get(stepId) || null;
  }

  async getRawFileContent(filename: string): Promise<string> {
    try {
      // Ensure filename has .md extension
      if (!filename.endsWith('.md')) {
        filename += '.md';
      }
      
      const filePath = path.join(this.workflowsPath, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`Failed to read workflow file ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createOrUpdateWorkflow(request: CreateWorkflowRequest): Promise<{ success: boolean; message: string; stepId: string }> {
    try {
      // Ensure workflows directory exists
      await fs.mkdir(this.workflowsPath, { recursive: true });
      
      // Validate filename
      if (!request.filename.endsWith('.md')) {
        request.filename += '.md';
      }
      
      // Generate step ID from filename (remove .md extension)
      const stepId = path.basename(request.filename, '.md');
      
      // Create frontmatter
      const frontmatter: any = {
        title: request.title
      };
      
      if (request.description) {
        frontmatter.description = request.description;
      }
      
      if (request.isEntrypoint) {
        frontmatter.entrypoint = true;
      }
      
      // Combine frontmatter and content
      const fileContent = matter.stringify(request.content, frontmatter);
      
      // Write to file
      const filePath = path.join(this.workflowsPath, request.filename);
      await fs.writeFile(filePath, fileContent, 'utf-8');
      
      // Refresh cache to include new/updated workflow
      await this.refreshCache();
      
      return {
        success: true,
        message: `Workflow ${request.filename} ${await this.fileExists(filePath) ? 'updated' : 'created'} successfully`,
        stepId
      };
    } catch (error) {
      console.error('Error creating/updating workflow:', error);
      return {
        success: false,
        message: `Failed to create/update workflow: ${error instanceof Error ? error.message : String(error)}`,
        stepId: ''
      };
    }
  }

  async deleteWorkflow(filename: string): Promise<{ success: boolean; message: string }> {
    try {
      // Ensure filename has .md extension
      if (!filename.endsWith('.md')) {
        filename += '.md';
      }
      
      const filePath = path.join(this.workflowsPath, filename);
      
      // Check if file exists
      if (!await this.fileExists(filePath)) {
        return {
          success: false,
          message: `Workflow file ${filename} does not exist`
        };
      }
      
      // Delete the file
      await fs.unlink(filePath);
      
      // Refresh cache to remove deleted workflow
      await this.refreshCache();
      
      return {
        success: true,
        message: `Workflow ${filename} deleted successfully`
      };
    } catch (error) {
      console.error('Error deleting workflow:', error);
      return {
        success: false,
        message: `Failed to delete workflow: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  async findOrphanedWorkflows(): Promise<OrphanedWorkflow[]> {
    if (this.stepCache.size === 0) {
      await this.loadWorkflows();
    }

    const orphans: OrphanedWorkflow[] = [];
    const allReferences = new Set<string>();

    // Collect all step references from all workflows
    for (const [stepId, step] of this.stepCache) {
      step.nextSteps.forEach(ref => allReferences.add(ref));
    }

    // Find non-entrypoint workflows that are not referenced
    for (const [stepId, step] of this.stepCache) {
      if (!step.isEntrypoint && !allReferences.has(stepId)) {
        orphans.push({
          id: stepId,
          title: step.title,
          filename: step.filename,
          reason: 'Not referenced by any workflow and not an entrypoint'
        });
      }
    }

    return orphans;
  }

  async findInvalidLinks(): Promise<InvalidLink[]> {
    if (this.stepCache.size === 0) {
      await this.loadWorkflows();
    }

    const invalidLinks: InvalidLink[] = [];
    const existingStepIds = new Set(this.stepCache.keys());

    // Check each workflow for invalid references
    for (const [stepId, step] of this.stepCache) {
      for (const reference of step.nextSteps) {
        if (!existingStepIds.has(reference)) {
          // Find line number in content where the invalid reference appears
          const lines = step.content.split('\n');
          let lineNumber: number | undefined;
          
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(`@${reference}@`)) {
              lineNumber = i + 1;
              break;
            }
          }

          invalidLinks.push({
            sourceWorkflow: stepId,
            sourceTitle: step.title,
            invalidReference: reference,
            line: lineNumber
          });
        }
      }
    }

    return invalidLinks;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  destroy() {
    if (this.initializationTimeout) {
      clearTimeout(this.initializationTimeout);
    }
    if (this.watcher) {
      this.watcher.close();
    }
  }
}