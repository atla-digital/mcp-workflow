#!/usr/bin/env node

import { copyFile, mkdir, readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, '..');
const WEB_BUILD_DIR = join(PROJECT_ROOT, 'build', 'web');
const STATIC_BUILD_DIR = join(PROJECT_ROOT, 'build', 'static');
const WEB_SRC_DIR = join(PROJECT_ROOT, 'src', 'web');

/**
 * Copy files recursively
 */
async function copyRecursive(src, dest) {
  try {
    const srcStat = await stat(src);
    
    if (srcStat.isDirectory()) {
      await mkdir(dest, { recursive: true });
      const entries = await readdir(src);
      
      for (const entry of entries) {
        await copyRecursive(join(src, entry), join(dest, entry));
      }
    } else {
      await mkdir(dirname(dest), { recursive: true });
      await copyFile(src, dest);
    }
  } catch (error) {
    console.error(`Error copying ${src} to ${dest}:`, error);
    throw error;
  }
}

/**
 * Copy vis.js library
 */
async function copyVisJS() {
  const libSrcDir = join(WEB_SRC_DIR, 'lib');
  const libDestDir = join(STATIC_BUILD_DIR, 'lib');
  
  console.log('📦 Copying vis.js library...');
  
  try {
    await copyRecursive(libSrcDir, libDestDir);
    console.log('✅ Copied vis.js library');
  } catch (error) {
    console.log('⚠️  vis.js library not found in src/web/lib/');
    console.log('   Please download vis-network.min.js manually to src/web/lib/');
    console.log('   URL: https://unpkg.com/vis-network@latest/dist/vis-network.min.js');
    
    // Create placeholder
    await mkdir(libDestDir, { recursive: true });
    const visPlaceholder = `
// vis.js library placeholder
console.error('vis.js library not found. Please download vis-network.min.js manually.');
`;
    const { writeFile } = await import('fs/promises');
    await writeFile(join(libDestDir, 'vis-network.min.js'), visPlaceholder);
  }
}

/**
 * Main build function
 */
async function buildStatic() {
  console.log('🔨 Building static web assets...');
  
  try {
    // Create static build directory
    await mkdir(STATIC_BUILD_DIR, { recursive: true });
    
    // Copy HTML file from web source
    const htmlSrc = join(WEB_SRC_DIR, 'index.html');
    const htmlDest = join(STATIC_BUILD_DIR, 'index.html');
    await copyFile(htmlSrc, htmlDest);
    console.log('✅ Copied index.html');
    
    // Copy all compiled JavaScript files from web build
    const webBuildExists = await stat(WEB_BUILD_DIR).catch(() => null);
    if (webBuildExists) {
      // Copy entire web build directory structure
      await copyRecursive(WEB_BUILD_DIR, STATIC_BUILD_DIR);
      console.log('✅ Copied all compiled web modules and source maps');
    } else {
      console.error('❌ Web build directory not found. Run npm run build:web first.');
      process.exit(1);
    }
    
    // Copy vis.js library
    await copyVisJS();
    
    console.log('✅ Static web assets built successfully!');
    console.log(`📁 Static files location: ${STATIC_BUILD_DIR}`);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run the build
buildStatic();