// Workflow-specific types

export interface WorkflowEntrypoint {
  id: string;
  title: string;
  description?: string;
  entrypoint: boolean;
}

export interface WorkflowStep {
  id: string;
  title: string;
  content: string;
  nextSteps: string[];
  isEntrypoint: boolean;
}

export interface OrphanedWorkflow {
  id: string;
  title: string;
  filename: string;
  reason: string;
}

export interface WorkflowDiagnostics {
  orphans: OrphanedWorkflow[];
  invalidLinks: Array<{
    sourceWorkflow: string;
    sourceTitle: string;
    invalidReference: string;
    line: number;
  }>;
}

export interface GraphNode {
  id: string;
  label: string;
  title?: string;
  color?: {
    background: string;
    border: string;
  };
  shape?: string;
  font?: {
    color: string;
    size: number;
  };
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  arrows?: string;
  color?: {
    color: string;
  };
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ToolCallResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}