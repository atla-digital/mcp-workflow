import '../types/vis.js';
import { GraphData, WorkflowDiagnostics } from '../types/workflow.js';

export class WorkflowGraph {
  private container: HTMLElement;
  private network: vis.Network | null = null;
  private nodes: vis.DataSet<vis.Node>;
  private edges: vis.DataSet<vis.Edge>;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element with id '${containerId}' not found`);
    }
    this.container = container;
    this.nodes = new vis.DataSet<vis.Node>();
    this.edges = new vis.DataSet<vis.Edge>();
    this.initializeNetwork();
  }

  /**
   * Initialize the vis.js network
   */
  private initializeNetwork(): void {
    const data = {
      nodes: this.nodes,
      edges: this.edges
    };

    const options: vis.NetworkOptions = {
      physics: {
        forceAtlas2Based: {
          gravitationalConstant: -26,
          centralGravity: 0.005,
          springLength: 230,
          springConstant: 0.18,
        },
        maxVelocity: 146,
        solver: "forceAtlas2Based",
        timestep: 0.35,
        stabilization: { iterations: 450 },
      },
      nodes: {
        borderWidth: 2,
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.3)',
          size: 5,
          x: 2,
          y: 2
        },
        font: {
          size: 14,
          face: 'arial'
        },
        margin: 10
      },
      edges: {
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 1
          }
        },
        color: {
          color: '#757575',
          highlight: '#2196f3'
        },
        width: 2,
        smooth: {
          enabled: true,
          type: 'dynamic'
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 300,
        hideEdgesOnDrag: false,
        hideNodesOnDrag: false
      }
    };

    this.network = new vis.Network(this.container, data, options);
    this.setupEventHandlers();
    
    // Ensure network has proper dimensions after Grid layout settles
    setTimeout(() => {
      if (this.network) {
        this.network.redraw();
        this.network.fit();
      }
    }, 100);
  }

  /**
   * Set up event handlers for the network
   */
  private setupEventHandlers(): void {
    if (!this.network) return;

    this.network.on('click', (params: any) => {
      if (params.nodes && params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        this.onNodeClick(nodeId as string);
      }
    });

    this.network.on('doubleClick', (params: any) => {
      if (params.nodes && params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        this.onNodeDoubleClick(nodeId as string);
      }
    });

    this.network.on('hoverNode', () => {
      this.container.style.cursor = 'pointer';
    });

    this.network.on('blurNode', () => {
      this.container.style.cursor = 'default';
    });
  }

  /**
   * Handle node click events
   */
  private onNodeClick(nodeId: string): void {
    console.log('Node clicked:', nodeId);
    // Emit custom event for handling by parent component
    this.container.dispatchEvent(new CustomEvent('nodeClick', {
      detail: { nodeId }
    }));
  }

  /**
   * Handle node double-click events
   */
  private onNodeDoubleClick(nodeId: string): void {
    console.log('Node double-clicked:', nodeId);
    // Emit custom event for handling by parent component
    this.container.dispatchEvent(new CustomEvent('nodeDoubleClick', {
      detail: { nodeId }
    }));
  }

  /**
   * Update the graph with new data
   */
  updateGraph(graphData: GraphData): void {
    try {
      // Clear existing data
      this.nodes.clear();
      this.edges.clear();

      // Add new data
      this.nodes.add(graphData.nodes);
      this.edges.add(graphData.edges);

      // Redraw and fit the network to show all nodes
      if (this.network) {
        setTimeout(() => {
          if (this.network) {
            this.network.redraw();
            this.network.fit();
          }
        }, 100);
      }

      console.log(`Graph updated: ${graphData.nodes.length} nodes, ${graphData.edges.length} edges`);
    } catch (error) {
      console.error('Failed to update graph:', error);
    }
  }

  /**
   * Highlight nodes and edges related to a specific node
   */
  highlightNode(nodeId: string): void {
    if (!this.network) return;

    // Reset all nodes to default
    const allNodes = this.nodes.get();
    const resetNodes = allNodes.map(node => ({
      ...node,
      color: node.color || { background: '#f5f5f5', border: '#757575' }
    }));
    this.nodes.update(resetNodes);

    // Highlight selected node
    const selectedNode = this.nodes.get(nodeId);
    if (selectedNode) {
      this.nodes.update({
        ...selectedNode,
        color: {
          background: '#bbdefb',
          border: '#1976d2'
        }
      });
    }

    // Highlight connected edges
    const connectedEdges = this.edges.get().filter(edge => 
      edge.from === nodeId || edge.to === nodeId
    );
    
    const highlightedEdges = connectedEdges.map(edge => ({
      ...edge,
      color: {
        color: '#1976d2'
      }
    }));
    
    this.edges.update(highlightedEdges);
  }

  /**
   * Clear all highlights
   */
  clearHighlights(): void {
    if (!this.network) return;

    // Reset all nodes
    const allNodes = this.nodes.get();
    const resetNodes = allNodes.map(node => ({
      ...node,
      color: node.color || { background: '#f5f5f5', border: '#757575' }
    }));
    this.nodes.update(resetNodes);

    // Reset all edges
    const allEdges = this.edges.get();
    const resetEdges = allEdges.map(edge => ({
      ...edge,
      color: {
        color: '#757575'
      }
    }));
    this.edges.update(resetEdges);
  }

  /**
   * Fit the network to show all nodes
   */
  fit(): void {
    if (this.network) {
      this.network.fit();
    }
  }

  /**
   * Destroy the network instance
   */
  destroy(): void {
    if (this.network) {
      this.network.destroy();
      this.network = null;
    }
  }

  /**
   * Get network statistics
   */
  getStats(): { nodeCount: number; edgeCount: number } {
    return {
      nodeCount: this.nodes.get().length,
      edgeCount: this.edges.get().length
    };
  }
}