const fs = require('fs');
const path = 'app/globals.css';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `  --bg: 11 18 32;           /* Dark Blue #0B1220 */
  --surface: 17 24 42;      /* Dark Blue #11182A */
  --surface-2: 26 35 56;    /* Dark Blue #1A2338 */
  --surface-3: 30 41 66;    /* Dark Blue #1E2942 */
  --border: 41 54 80;       /* Dark Blue #293650 */
  --border-strong: 56 70 100; /* #384664 */
  --fg: 240 245 255;        /* Near white */
  --muted: 140 160 190;     /* Muted blue-gray */
  --muted-2: 90 110 140;    /* Darker muted */`,
  `  --bg: 30 35 50;           /* Dark slate #1E2332 */
  --surface: 45 50 65;      /* Slate #2D3241 */
  --surface-2: 60 65 82;    /* Slate #3C4152 */
  --surface-3: 75 80 100;   /* Slate #4B5064 */
  --border: 100 105 125;    /* Gray #64697D */
  --border-strong: 130 135 155; /* #82879B */
  --fg: 245 247 250;        /* White */
  --muted: 165 175 195;     /* Light gray-blue */
  --muted-2: 120 130 155;   /* Medium gray-blue */`
);

fs.writeFileSync(path, content);
console.log('Lightened dark theme colors');
