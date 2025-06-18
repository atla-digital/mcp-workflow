import { UIController } from './components/ui-controller.js';

/**
 * Main application entry point
 */
class WorkflowVisualizationApp {
  private uiController: UIController | null = null;
  private isInitialized = false;

  /**
   * Initialize the application
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('App already initialized');
      return;
    }

    try {
      // Only log in development mode
      if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'production') {
        console.log('Starting Workflow Visualization App...');
      }
      
      // Show loading state
      this.showLoadingState();

      // Initialize UI controller
      this.uiController = new UIController();
      
      // Make it globally available for diagnostics panel
      window.workflowApp = this.uiController;
      
      // Initialize the UI
      await this.uiController.initialize();
      
      // Hide loading state
      this.hideLoadingState();
      
      this.isInitialized = true;
      // Only log in development mode
      if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'production') {
        console.log('Workflow Visualization App initialized successfully');
      }

    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showErrorState('Failed to initialize application: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Show loading state
   */
  private showLoadingState(): void {
    const loadingElement = document.getElementById('loading-overlay');
    if (loadingElement) {
      loadingElement.style.display = 'flex';
    }
  }

  /**
   * Hide loading state
   */
  private hideLoadingState(): void {
    const loadingElement = document.getElementById('loading-overlay');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  /**
   * Show error state
   */
  private showErrorState(message: string): void {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
    this.hideLoadingState();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.uiController) {
      this.uiController.destroy();
      this.uiController = null;
    }
    this.isInitialized = false;
  }
}

// Initialize app when DOM is ready
let app: WorkflowVisualizationApp;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

async function initializeApp(): Promise<void> {
  app = new WorkflowVisualizationApp();
  await app.initialize();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (app) {
    app.destroy();
  }
});

// Handle page visibility changes (pause/resume)
document.addEventListener('visibilitychange', () => {
  // Only log in development mode
  if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'production') {
    if (document.hidden) {
      console.log('Page hidden, pausing updates...');
    } else {
      console.log('Page visible, resuming updates...');
    }
  }
  // Optionally refresh data when page becomes visible
  if (!document.hidden && window.workflowApp) {
    // Could trigger a refresh here if needed
  }
});

export { WorkflowVisualizationApp };