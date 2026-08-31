import sqlite3, os, json
db = r"C:/Users/ITLEB/ff_cookies.sqlite"
con = sqlite3.connect(db); cur = con.cursor()
cur.execute("select host, name, value, path from moz_cookies")
rows = cur.fetchall()
out = {}
for host, name, value, path in rows:
    out.setdefault(host, []).append({"name": name, "value": value, "path": path})
# Save full cookie jar (local only, temp) for use with curl/API
with open(r"C:/Users/ITLEB/ff_cookies.json", "w") as f:
    json.dump(out, f)
print("dumped", sum(len(v) for v in out.values()), "cookies for", len(out), "hosts")
# Report which hosts have session-like cookies without printing values
for host in ("vercel.com", ".vercel.com", "console.neon.tech", ".neon.tech", "api.supabase.com", ".supabase.com", "github.com", ".github.com"):
    names = [c["name"] for c in out.get(host, [])]
    print(host, "->", names)
