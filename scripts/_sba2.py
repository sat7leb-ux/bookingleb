import json, urllib.request, urllib.error

jar = json.load(open(r"C:/Users/ITLEB/ff_cookies.json"))
cookies = []
for h in ("api.supabase.com", ".supabase.com", "supabase.com"):
    for c in jar.get(h, []):
        cookies.append(f"{c['name']}={c['value']}")
hdr = "; ".join(cookies)
print("cookie header len:", len(hdr))

def get(path):
    req = urllib.request.Request("https://api.supabase.com/v1" + path,
          headers={"Cookie": hdr, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

st, body = get("/projects")
print("GET /projects ->", st)
print(body[:400])
