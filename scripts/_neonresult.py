import json
d = json.load(open(r"C:/Users/ITLEB/neon_proj_create.json"))
print("PROJECT ID:", d.get("id"))
print("NAME:", d.get("name"))
ep = (d.get("endpoints") or [{}])[0]
branch = (d.get("branches") or [{}])[0]
print("ENDPOINT HOST:", ep.get("host"))
print("BRANCH ID:", branch.get("id"))
print("ROLE:", (d.get("roles") or [{}])[0].get("name"))
# connection_uris
for cu in d.get("connection_uris") or []:
    print("CONN:", cu.get("connection_uri"))
