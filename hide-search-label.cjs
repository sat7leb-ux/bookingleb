const fs = require('fs');
const path = 'components/layout/AppShell.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `<Search\n              size={16}\n              className="text-muted-2"\n            />\n            <span className="text-sm text-muted-2">Quick search — press /</span>`,
  `<Search\n              size={16}\n              className="text-muted-2"\n            />`
);

fs.writeFileSync(path, content);
console.log('Removed Quick search label from header');
