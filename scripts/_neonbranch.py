import json
d = json.load(open(r"C:/Users/ITLEB/neon_branch.json"))
print("id:", d.get("id"))
print("branches:", d.get("branches"))
print("keys:", list(d.keys())[:15])
