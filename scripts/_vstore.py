import json
try:
    d = json.load(open(r"C:/Users/ITYLEB/vstore.json".replace("ITYLEB","ITLEB")))
    print(json.dumps(d, indent=0)[:600])
except Exception as e:
    print("raw:", open(r"C:/Users/ITLEB/vstore.json").read()[:300])
