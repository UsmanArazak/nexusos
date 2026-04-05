const fs = require('fs');
const path = require('path');

function refactorToVariables(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.git') && !fullPath.includes('.next')) {
        refactorToVariables(fullPath);
      }
    } else {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let newContent = content
          .replace(/\[#166534\]/g, 'primary')
          .replace(/\[#14532D\]/g, 'primary-hover');
          
        if (content !== newContent) {
          console.log('Refactored classes in ' + fullPath);
          fs.writeFileSync(fullPath, newContent, 'utf8');
        }
      }
    }
  }
}

refactorToVariables(path.join(__dirname, 'src'));
