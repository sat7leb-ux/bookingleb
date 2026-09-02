const fs = require('fs');

// Update Booking type to support multiple locations
const typesPath = 'lib/types.ts';
let types = fs.readFileSync(typesPath, 'utf8');

types = types.replace(
  `location_id: string | null;`,
  `location_id: string | null;
  location_ids: string[];`
);

types = types.replace(
  `location?: Pick<Location, "id" | "name"> | null;`,
  `location?: Pick<Location, "id" | "name"> | null;
  locations?: Pick<Location, "id" | "name">[];`
);

fs.writeFileSync(typesPath, types);
console.log('Updated types.ts for multi-location');
