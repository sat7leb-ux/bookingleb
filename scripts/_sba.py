import json, base64
jar = json.load(open(r"C:/Users/ITLEB/ff_cookies.json"))
print("SUPABASE-related cookie hosts:")
for h in jar:
    if "supabase" in h:
        print(" ", h, "->", [c["name"] for c in jar[h]])
print("\nJWT-like cookies (host:name):")
for h, cs in jar.items():
    for c in cs:
        v = c["value"]
        if v.count(".") == 2 and v.startswith("eyJ"):
            try:
                p = v.split(".")[1] + "==="
                d = json.loads(base64.urlsafe_b64decode(p))
                print(f"  {h}:{c['name']} -> sub={d.get('sub')} email={d.get('email')} role={d.get('role')}")
            except Exception:
                print(f"  {h}:{c['name']} (jwt, undecoded)")
