const fs = require('fs');
const path = 'app/(auth)/login/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "Internal tool. New team members are added from Settings → Users.",
  ""
);

fs.writeFileSync(path, content);
console.log('Removed helper text from login page');
