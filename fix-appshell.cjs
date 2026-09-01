const fs = require('fs');
const path = 'components/layout/AppShell.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "      </nav>\n\n      \n        <div className=\"mt-3 flex items-center gap-2.5 rounded-lg px-2 py-1.5\">",
  "      </nav>\n\n      <div className=\"mt-3 flex items-center gap-2.5 rounded-lg px-2 py-1.5\">"
);

fs.writeFileSync(path, content);
console.log('Fixed sidebar JSX wrapping');
