const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, 'dist');
const docsDir = path.resolve(__dirname, 'docs');

if (fs.existsSync(distDir)) {
  if (fs.existsSync(docsDir)) {
    fs.rmSync(docsDir, { recursive: true, force: true });
  }
  fs.cpSync(distDir, docsDir, { recursive: true });
  console.log('✅ Successfully copied production build from /dist to /docs for GitHub Pages!');
} else {
  console.error('❌ dist directory does not exist. Run vite build first.');
}
