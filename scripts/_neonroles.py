import json
d = json.load(open(r"C:/Users/ITLEB/neon_roles.json"))
print(json.dumps(d, indent=0)[:400])
