import { IncomingMessage, ServerResponse } from 'http';
import { readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));

export class StaticFileHandler {
  private staticRoot: string;
  private mimeTypes: Map<string, string>;

  constructor() {
    // Static files are in build/static after compilation
    this.staticRoot = join(__dirname, '../static');
    
    this.mimeTypes = new Map([
      ['.html', 'text/html; charset=utf-8'],
      ['.js', 'application/javascript; charset=utf-8'],
      ['.css', 'text/css; charset=utf-8'],
      ['.json', 'application/json; charset=utf-8'],
      ['.png', 'image/png'],
      ['.jpg', 'image/jpeg'],
      ['.jpeg', 'image/jpeg'],
      ['.gif', 'image/gif'],
      ['.svg', 'image/svg+xml'],
      ['.ico', 'image/x-icon'],
      ['.woff', 'font/woff'],
      ['.woff2', 'font/woff2'],
      ['.ttf', 'font/ttf'],
      ['.eot', 'application/vnd.ms-fontobject']
    ]);
  }

  /**
   * Handle static file requests
   */
  async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
    const url = req.url;
    if (!url) {
      return false;
    }

    // Handle root path - serve index.html
    let filePath: string;
    if (url === '/' || url === '/index.html') {
      filePath = join(this.staticRoot, 'index.html');
    } else {
      // Remove leading slash and resolve file path
      const requestPath = url.startsWith('/') ? url.slice(1) : url;
      
      // Prevent directory traversal
      if (requestPath.includes('..') || requestPath.includes('\\')) {
        this.sendError(res, 400, 'Invalid file path');
        return true;
      }

      filePath = join(this.staticRoot, requestPath);
    }

    try {
      console.debug(`Serving static file: ${filePath}`);
      
      // Check if file exists and is a file (not directory)
      const stats = await stat(filePath);
      if (!stats.isFile()) {
        console.debug(`Not a file: ${filePath}`);
        return false;
      }

      // Read file content
      const content = await readFile(filePath);
      
      // Determine content type
      const ext = extname(filePath).toLowerCase();
      const contentType = this.mimeTypes.get(ext) || 'application/octet-stream';

      console.debug(`Serving ${filePath} as ${contentType} (${content.length} bytes)`);

      // Set headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', content.length);
      
      // Add cache headers for static assets
      if (ext === '.html' || ext === '.js') {
        // No cache for HTML and JS files to ensure fresh content during development
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day for other assets
      }

      // Send response
      res.writeHead(200);
      res.end(content);
      
      return true;

    } catch (error: any) {
      // File not found or other error
      if (error.code === 'ENOENT') {
        console.debug(`File not found: ${filePath}`);
        return false; // Let other handlers try
      }
      
      console.error('Static file error:', error);
      this.sendError(res, 500, 'Internal server error');
      return true;
    }
  }

  /**
   * Send error response
   */
  private sendError(res: ServerResponse, status: number, message: string): void {
    res.writeHead(status, { 'Content-Type': 'text/plain' });
    res.end(message);
  }

  /**
   * Check if a URL should be handled by static file handler
   */
  static shouldHandle(url: string): boolean {
    // Handle root path and static assets
    if (url === '/' || url === '/index.html') {
      return true;
    }

    // Handle static file extensions
    const staticExtensions = ['.js', '.css', '.html', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
    const ext = extname(url).toLowerCase();
    
    return staticExtensions.includes(ext);
  }
}