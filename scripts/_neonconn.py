import json
d = json.load(open(r"C:/Users/ITLEB/neon_conn.json"))
print("uri:", d.get("uri"))
print("pooled:", (d.get("pooled") or {}).get("uri") if isinstance(d.get("pooled"), dict) else d.get("pooled"))
# if error, show
print("msg:", d.get("message"))
print("keys:", list(d.keys())[:10])
