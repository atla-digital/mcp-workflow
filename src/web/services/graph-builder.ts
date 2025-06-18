import { WorkflowEntrypoint, WorkflowStep, GraphData, GraphNode, GraphEdge } from '../types/workflow.js';

export class GraphBuilder {
  /**
   * Build a complete graph from workflow entrypoints
   */
  async buildWorkflowGraph(
    entrypoints: WorkflowEntrypoint[],
    getStepFn: (stepId: string) => Promise<WorkflowStep | null>
  ): Promise<GraphData> {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const visitedSteps = new Set<string>();

    // Process each entrypoint
    for (const entrypoint of entrypoints) {
      await this.processStep(entrypoint.id, getStepFn, nodes, edges, visitedSteps);
    }

    return { nodes, edges };
  }

  /**
   * Recursively process a step and its connections
   */
  private async processStep(
    stepId: string,
    getStepFn: (stepId: string) => Promise<WorkflowStep | null>,
    nodes: GraphNode[],
    edges: GraphEdge[],
    visited: Set<string>
  ): Promise<void> {
    if (visited.has(stepId)) {
      return;
    }

    visited.add(stepId);

    try {
      const step = await getStepFn(stepId);
      
      // Check if step is valid
      if (!step) {
        console.warn(`Step ${stepId} not found, skipping in graph`);
        return;
      }
      
      // Add node
      nodes.push(this.createNode(step));

      // Process next steps - create error nodes for invalid references
      for (const nextStepId of step.nextSteps) {
        // First try to process the next step to validate it exists
        const nextStepProcessed = await this.tryProcessStep(nextStepId, getStepFn, nodes, edges, visited);
        
        if (nextStepProcessed) {
          // Valid step - create edge
          edges.push(this.createEdge(stepId, nextStepId));
        } else {
          // Invalid step - create error node if not already created
          const existingErrorNode = nodes.find(node => node.id === nextStepId);
          if (!existingErrorNode) {
            nodes.push(this.createErrorNode(nextStepId));
          }
          // Create edge to error node
          edges.push(this.createEdge(stepId, nextStepId));
        }
      }

    } catch (error) {
      console.warn(`Failed to process step ${stepId}, creating error node`);
      
      // Add error node for missing steps
      // Error nodes have no nextSteps, so no outgoing edges will be created
      nodes.push(this.createErrorNode(stepId));
    }
  }

  /**
   * Create a graph node from a workflow step
   */
  private createNode(step: WorkflowStep): GraphNode {
    const baseNode: GraphNode = {
      id: step.id,
      label: this.formatLabel(step.title),
      title: this.formatTooltip(step)
    };

    if (step.isEntrypoint) {
      return {
        ...baseNode,
        color: {
          background: '#e8f5e8',
          border: '#2e7d32'
        },
        shape: 'box',
        font: {
          color: '#1b5e20',
          size: 14
        }
      };
    } else {
      return {
        ...baseNode,
        color: {
          background: '#f5f5f5',
          border: '#757575'
        },
        shape: 'ellipse',
        font: {
          color: '#424242',
          size: 12
        }
      };
    }
  }

  /**
   * Try to process a step and return whether it was successful
   */
  private async tryProcessStep(
    stepId: string,
    getStepFn: (stepId: string) => Promise<WorkflowStep | null>,
    nodes: GraphNode[],
    edges: GraphEdge[],
    visited: Set<string>
  ): Promise<boolean> {
    try {
      // First check if the step exists by trying to get it
      const step = await getStepFn(stepId);
      if (!step) {
        return false; // Step doesn't exist
      }
      
      // Step exists, process it normally
      await this.processStep(stepId, getStepFn, nodes, edges, visited);
      return true;
    } catch (error) {
      // Step doesn't exist or failed to process
      return false;
    }
  }

  /**
   * Create an error node for missing steps
   */
  private createErrorNode(stepId: string): GraphNode {
    return {
      id: stepId,
      label: `⚠️ ${stepId}`,
      title: `Missing step: ${stepId}`,
      color: {
        background: '#ffebee',
        border: '#f44336'
      },
      shape: 'box',
      font: {
        color: '#c62828',
        size: 12
      }
    };
  }

  /**
   * Create an edge between two steps
   */
  private createEdge(fromId: string, toId: string): GraphEdge {
    return {
      id: `${fromId}->${toId}`,
      from: fromId,
      to: toId,
      arrows: 'to',
      color: {
        color: '#757575'
      }
    };
  }

  /**
   * Format node label (truncate if too long)
   */
  private formatLabel(title: string): string {
    const maxLength = 25;
    if (title.length <= maxLength) {
      return title;
    }
    return title.substring(0, maxLength - 3) + '...';
  }

  /**
   * Format tooltip with step details
   */
  private formatTooltip(step: WorkflowStep): string {
    let tooltip = `<strong>${step.title}</strong>`;
    
    if (step.isEntrypoint) {
      tooltip += '<br/><em>Entrypoint</em>';
    }

    if (step.nextSteps.length > 0) {
      tooltip += `<br/><br/><strong>Next steps:</strong><br/>`;
      tooltip += step.nextSteps.map(id => `• ${id}`).join('<br/>');
    }

    // Truncate content for tooltip
    if (step.content) {
      const shortContent = step.content.length > 100 
        ? step.content.substring(0, 100) + '...'
        : step.content;
      tooltip += `<br/><br/>${shortContent}`;
    }

    return tooltip;
  }
}