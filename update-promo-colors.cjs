const fs = require('fs');
const path = 'app/globals.css';
let content = fs.readFileSync(path, 'utf8');

// Replace light theme with Promo Desk light colors
content = content.replace(
  `  --bg: 60 65 80;           /* Light slate #3C4150 */
  --surface: 85 90 110;      /* Light slate #555A6E */
  --surface-2: 120 125 145;  /* Light slate #787D91 */
  --surface-3: 155 160 180;  /* Light slate #9BA0B4 */
  --border: 190 195 215;     /* Light gray #BEC3D7 */
  --border-strong: 215 218 235; /* #D7DAEB */
  --fg: 250 251 253;         /* Near white */
  --muted: 170 175 195;      /* Light gray */
  --muted-2: 140 145 170;    /* Medium gray */`,
  `  --bg: 243 245 247;
  --surface: 255 255 255;
  --surface-2: 234 238 242;
  --border: 220 226 232;
  --border-strong: 200 208 218;
  --fg: 250 251 253;
  --muted: 92 107 120;
  --muted-2: 139 152 165;`
);

// Replace dark theme with Promo Desk dark colors
content = content.replace(
  `.light {
  --bg: 255 255 255;
  --surface: 245 245 250;
  --surface-2: 235 235 245;
  --surface-3: 225 225 240;
  --border: 200 200 220;
  --border-strong: 180 180 200;
  --fg: 11 18 32;           /* Dark Blue #0B1220 */
  --muted: 90 100 120;
  --muted-2: 140 150 168;
  --primary: 225 18 46;     /* SAT-7 Red */
  --primary-fg: 255 255 255;
  --accent: 225 18 46;      /* SAT-7 Red */
  --success: 16 185 129;
  --warning: 217 119 6;
  --danger: 225 18 46;      /* SAT-7 Red */
  --info: 2 132 199;
  --violet: 124 58 237;`,
  `.light {
  --bg: 243 245 247;
  --surface: 255 255 255;
  --surface-2: 234 238 242;
  --border: 220 226 232;
  --border-strong: 200 208 218;
  --fg: 22 33 43;
  --muted: 92 107 120;
  --muted-2: 139 152 165;
  --primary: 225 18 46;     /* SAT-7 Red */
  --primary-fg: 255 255 255;
  --accent: 225 18 46;      /* SAT-7 Red */
  --success: 16 185 129;
  --warning: 217 119 6;
  --danger: 225 18 46;      /* SAT-7 Red */
  --info: 2 132 199;
  --violet: 124 58 237;`
);

fs.writeFileSync(path, content);
console.log('Updated colors to match Promo Desk');
