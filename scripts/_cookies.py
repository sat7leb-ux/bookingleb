import sqlite3, os
db = r"C:/tmp/ff_cookies.sqlite"
if not os.path.exists(db):
    print("no copy"); raise SystemExit
con = sqlite3.connect(db)
cur = con.cursor()
try:
    cur.execute("select host, count(*) from moz_cookies group by host")
    rows = cur.fetchall()
except Exception as e:
    print("err", e); raise SystemExit
print("total cookies:", sum(c for _, c in rows))
for h, c in sorted(rows):
    if any(k in h for k in ("vercel", "neon", "supabase", "github", "auth", "clerk")):
        print("  ", h, c)
