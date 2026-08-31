import json
try:
    d = json.load(open(r"C:/Users/ITLEB/neon_key.json"))
    print(json.dumps(d, indent=0)[:400])
except Exception as e:
    print("raw:", open(r"C:/Users/ITLEB/neon_key.json").read()[:200])
