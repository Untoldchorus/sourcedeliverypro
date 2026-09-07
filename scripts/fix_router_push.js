const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.next') && !fullPath.includes('.git')) {
        results = results.concat(walk(fullPath));
      }
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('.');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('router.push(/')) {
    content = content.replace(/router\.push\(\/([^)]+)\)/g, 'router.push(/)');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed router.push in:', file);
    count++;
  }
});

console.log('Total router.push fixes:', count);