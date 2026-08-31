import json
d = json.load(open(r"C:/Users/ITLEB/neon_detail.json"))
print("roles:", [r.get("name") for r in d.get("roles", [])])
print("branches:", [b.get("id") for b in d.get("branches", [])])
print("endpoints:", [e.get("host") for e in d.get("endpoints", [])])
print("databases:", [db.get("name") for db in d.get("databases", [])])
