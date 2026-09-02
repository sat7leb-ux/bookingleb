const fs = require('fs');
const path = 'app/globals.css';
let content = fs.readFileSync(path, 'utf8');

// Replace current dark theme with Promo Desk dark theme
content = content.replace(
  `:root {
  /* SAT-7 Brand Theme — Red, Black, Dark Blue */
  --bg: 60 65 80;           /* Light slate #3C4150 */
  --surface: 85 90 110;      /* Light slate #555A6E */
  --surface-2: 120 125 145;  /* Light slate #787D91 */
  --surface-3: 155 160 180;  /* Light slate #9BA0B4 */
  --border: 190 195 215;     /* Light gray #BEC3D7 */
  --border-strong: 215 218 235; /* #D7DAEB */
  --fg: 250 251 253;         /* Near white */
  --muted: 170 175 195;      /* Light gray */
  --muted-2: 140 145 170;    /* Medium gray */
  --primary: 225 18 46;     /* SAT-7 Red #E1122E */
  --primary-fg: 255 255 255;
  --accent: 225 18 46;      /* SAT-7 Red */
  --success: 52 211 153;
  --warning: 245 166 35;
  --danger: 225 18 46;      /* SAT-7 Red */
  --info: 56 189 248;
  --violet: 167 139 250;
  --font-sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

.light {
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
  --violet: 124 58 237;`,
  `:root {
  --bg: 243 245 247;
  --surface: 255 255 255;
  --surface-2: 234 238 242;
  --border: 220 226 232;
  --border-strong: 200 208 218;
  --fg: 22 33 43;
  --muted: 92 107 120;
  --muted-2: 139 152 165;
  --primary: 225 68 58;
  --primary-fg: 255 255 255;
  --accent: 225 68 58;
  --success: 30 158 134;
  --warning: 238 159 46;
  --danger: 225 68 58;
  --info: 62 111 224;
  --violet: 124 108 224;
  --font-sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

.dark {
  --bg: 13 19 25;
  --surface: 20 28 36;
  --surface-2: 27 37 48;
  --border: 38 50 61;
  --border-strong: 54 66 78;
  --fg: 231 237 242;
  --muted: 152 166 178;
  --muted-2: 100 114 128;
  --primary: 225 68 58;
  --primary-fg: 255 255 255;
  --accent: 225 68 58;
  --success: 30 158 134;
  --warning: 238 159 46;
  --danger: 225 68 58;
  --info: 62 111 224;
  --violet: 124 108 224;`
);

fs.writeFileSync(path, content);
console.log('Applied Promo Desk color tokens');
