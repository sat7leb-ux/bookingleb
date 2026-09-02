const fs = require('fs');
const path = 'app/globals.css';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `  --bg: 30 35 50;           /* Dark slate #1E2332 */
  --surface: 45 50 65;      /* Slate #2D3241 */
  --surface-2: 60 65 82;    /* Slate #3C4152 */
  --surface-3: 75 80 100;   /* Slate #4B5064 */
  --border: 100 105 125;    /* Gray #64697D */
  --border-strong: 130 135 155; /* #82879B */
  --fg: 245 247 250;        /* White */
  --muted: 165 175 195;     /* Light gray-blue */
  --muted-2: 120 130 155;   /* Medium gray-blue */`,
  `  --bg: 60 65 80;           /* Light slate #3C4150 */
  --surface: 85 90 110;      /* Light slate #555A6E */
  --surface-2: 120 125 145;  /* Light slate #787D91 */
  --surface-3: 155 160 180;  /* Light slate #9BA0B4 */
  --border: 190 195 215;     /* Light gray #BEC3D7 */
  --border-strong: 215 218 235; /* #D7DAEB */
  --fg: 250 251 253;         /* Near white */
  --muted: 170 175 195;      /* Light gray */
  --muted-2: 140 145 170;    /* Medium gray */`
);

fs.writeFileSync(path, content);
console.log('Lightened dark theme with more white and gray');
