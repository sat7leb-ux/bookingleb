import json
d = json.load(open(r"C:/Users/ITLEB/neon_list2.json"))
for p in d.get("projects", []):
    print(p.get("id"), p.get("name"))
