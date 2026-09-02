const fs = require('fs');
const path = 'lib/queries.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `location?: Pick<Location, "id" | "name"> | null;`,
  `location?: Pick<Location, "id" | "name"> | null;
  locations?: Pick<Location, "id" | "name">[];`
);

fs.writeFileSync(path, content);
console.log('Updated queries.ts for multi-location');
