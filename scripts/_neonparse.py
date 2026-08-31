import json, sys
# Parse a Neon project create/list JSON for a cleartext connection URI
path = sys.argv[1] if len(sys.argv) > 1 else r"C:/Users/ITLEB/neon_proj_create.json"
d = json.load(open(path))
print("PROJECT ID:", d.get("id"), "NAME:", d.get("name"))
cus = d.get("connection_uris") or []
if cus:
    for cu in cus:
        print("URI:", cu.get("connection_uri"))
        print("POOLED:", (cu.get("pooled") or {}).get("connection_uri") if isinstance(cu.get("pooled"), dict) else cu.get("pooled"))
else:
    # maybe nested
    print("keys:", list(d.keys())[:12])
    print("no connection_uris; raw:", json.dumps(d)[:300])
