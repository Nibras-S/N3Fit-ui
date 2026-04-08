const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src/features');
let fixedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Strip ${backendUrl}/api/ -> /
    content = content.replace(/api\.(get|post|put|delete|patch)\(\s*`\$\{backendUrl\}\/api\//g, 'api.$1(`/');
    
    // 2. Strip ${backendUrl}/ -> /
    content = content.replace(/api\.(get|post|put|delete|patch)\(\s*`\$\{backendUrl\}\//g, 'api.$1(`/');

    // 3. Strip /api/ -> / completely in string quotes
    content = content.replace(/api\.(get|post|put|delete|patch)\(\s*["']\/api\//g, 'api.$1(\'/');
    
    // 4. Strip /api/ -> / inside template literals
    content = content.replace(/api\.(get|post|put|delete|patch)\(\s*`\/api\//g, 'api.$1(`/');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Fixed:', file);
        fixedCount++;
    }
});
console.log(`Fixed ${fixedCount} files.`);
