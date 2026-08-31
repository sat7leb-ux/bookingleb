import json
d = json.load(open(r"C:/Users/ITLEB/neon_branch.json"))
proj = d.get("project") or {}
branch = d.get("branch") or {}
roles = d.get("roles") or []
endpoints = d.get("endpoints") or []
cus = d.get("connection_uris") or []
print("PROJECT ID:", proj.get("id"))
print("BRANCH ID:", branch.get("id"))
print("ROLES:", [r.get("name") for r in roles])
print("ENDPOINTS:", [e.get("host") for e in endpoints])
for cu in cus:
    print("CONN:", cu.get("connection_uri"))
    pooled = cu.get("pooled")
    if isinstance(pooled, dict):
        print("POOLED:", pooled.get("connection_uri"))
