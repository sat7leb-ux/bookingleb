const fs = require('fs');
const path = 'app/(app)/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `<StatCard label="Today" value={stats.today} icon={<CalendarClock size={18} />} accent="info" sub="bookings" />`,
  `<StatCard label="Today" value={stats.today} icon={<CalendarClock size={18} />} accent="info" sub="bookings" href="/bookings?date=today" />`
);
content = content.replace(
  `<StatCard label="Upcoming" value={stats.upcoming} icon={<CalendarDays size={18} />} accent="primary" sub="scheduled" />`,
  `<StatCard label="Upcoming" value={stats.upcoming} icon={<CalendarDays size={18} />} accent="primary" sub="scheduled" href="/bookings?from=today" />`
);
content = content.replace(
  `<StatCard label="Pending" value={stats.pending} icon={<Hourglass size={18} />} accent="warning" sub="awaiting reply" />`,
  `<StatCard label="Pending" value={stats.pending} icon={<Hourglass size={18} />} accent="warning" sub="awaiting reply" href="/bookings?status=Pending+Confirmation" />`
);
content = content.replace(
  `<StatCard label="Confirmed" value={stats.confirmed} icon={<CheckCircle2 size={18} />} accent="success" sub="locked in" />`,
  `<StatCard label="Confirmed" value={stats.confirmed} icon={<CheckCircle2 size={18} />} accent="success" sub="locked in" href="/bookings?status=Confirmed" />`
);
content = content.replace(
  `<StatCard label="Reschedule" value={stats.reschedule} icon={<RefreshCw size={18} />} accent="violet" sub="requests" />`,
  `<StatCard label="Reschedule" value={stats.reschedule} icon={<RefreshCw size={18} />} accent="violet" sub="requests" href="/bookings?status=Reschedule+Requested" />`
);
content = content.replace(
  `<StatCard label="Cancelled" value={stats.cancelled} icon={<XCircle size={18} />} accent="danger" sub="this period" />`,
  `<StatCard label="Cancelled" value={stats.cancelled} icon={<XCircle size={18} />} accent="danger" sub="this period" href="/bookings?status=Cancelled" />`
);

fs.writeFileSync(path, content);
console.log('Patched dashboard StatCards to href-linked filters');
