const fs = require('fs');
const path = 'lib/queries.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace single location join with multi-location subquery
content = content.replace(
  `left join locations l on l.id = b.location_id`,
  `left join locations l on l.id = b.location_id
     left join lateral (
       select jsonb_agg(jsonb_build_object('id', loc.id, 'name', loc.name)) as locations
       from booking_locations bl
       join locations loc on loc.id = bl.location_id
       where bl.booking_id = b.id
     ) blocs on true`
);

content = content.replace(
  `l.name as location_name,`,
  `l.name as location_name, blocs.locations as location_list,`
);

// Update hydrateBooking to set locations
content = content.replace(
  `location: r.location_name ? { id: r.location_id!, name: r.location_name } : null,`,
  `location: r.location_name ? { id: r.location_id!, name: r.location_name } : null,
  locations: r.location_list || [],`
);

fs.writeFileSync(path, content);
console.log('Updated queries.ts with multi-location support');
