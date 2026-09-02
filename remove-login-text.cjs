const fs = require('fs');
const path = 'app/(auth)/login/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `<p className="mt-6 text-center text-xs text-muted-2">
          Internal tool. New team members are added from{" "}
          <Link href="/settings" className="text-primary hover:underline">
            Settings → Users
          </Link>
          .
        </p>`,
  ``
);

fs.writeFileSync(path, content);
console.log('Removed internal tool text from login');
