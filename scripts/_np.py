import json
d = json.load(open(r"C:/Users/ITLEB/neon_proj_create.json"))
print("keys:", list(d.keys())[:12])
print("msg:", d.get("message"))
print("full:", json.dumps(d)[:500])
