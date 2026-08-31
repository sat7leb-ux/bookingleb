import json
d = json.load(open(r"C:/Users/ITLEB/neon_list.json"))
projs = d.get("projects", [])
print("count:", len(projs))
for p in projs:
    print("ID:", p.get("id"), "NAME:", p.get("name"))
