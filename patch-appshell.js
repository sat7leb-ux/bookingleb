const fs = require('fs');
const path = 'components/layout/AppShell.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove sidebar New Booking block
content = content.replace(
  `<div className="border-t border-border p-3">
        <Link
          href="/bookings/new"
          onClick={onNav}
          className="btn-primary w-full"
        >
          <Plus size={16} /> New Booking
        </Link>`,
  ``
);

// Remove header New Booking button
content = content.replace(
  `<Link
            href="/bookings/new"
            className="btn-primary hidden sm:inline-flex"
          >
            <Plus size={16} /> New Booking
          </Link>`,
  ``
);

fs.writeFileSync(path, content);
console.log('Removed New Booking buttons from AppShell');
