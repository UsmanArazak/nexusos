const fs = require('fs');
const path = require('path');

function replaceColors(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.git') && !fullPath.includes('.next')) {
        replaceColors(fullPath);
      }
    } else {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.css') || fullPath.endsWith('.md')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let newContent = content
          .replace(/#C8A84B/g, '#166534')
          .replace(/#C8A84B/i, '#166534') // handle any lowercase
          .replace(/#c8a84b/g, '#166534')
          .replace(/#A8892E/g, '#14532D')
          .replace(/#A8892E/i, '#14532D')
          .replace(/#a8892e/g, '#14532D');
          
        if (content !== newContent) {
          console.log('Updated ' + fullPath);
          fs.writeFileSync(fullPath, newContent, 'utf8');
        }
      }
    }
  }
}

replaceColors(path.join(__dirname, 'src'));
replaceColors(path.join(__dirname, 'README.md'));
