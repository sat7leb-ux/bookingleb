import base64, pickle, io, json
jar = json.load(open(r"C:/Users/ITLEB/ff_cookies.json"))
z = [c["value"] for c in jar.get("console.neon.tech", []) if c["name"] == "zenith"][0]
# zenith is base64 of a pickled Flask session. Part0 holds the pickle (ignore signature parts).
payload = z.split(".")[0]
payload += "=" * (-len(payload) % 4)
raw = base64.urlsafe_b64decode(payload)
# The decoded bytes: "1788162382|" timestamp then pickle. Find pickle start (after '|').
idx = raw.find(b"|")
pickled = raw[idx + 1:]
obj = pickle.load(io.BytesIO(pickled))
print("type:", type(obj))
if isinstance(obj, dict):
    print("keys:", list(obj.keys()))
    for k, v in obj.items():
        if "org" in k.lower() or "id" in k.lower() or "user" in k.lower():
            print("  ", k, "=", v)
else:
    print("value:", str(obj)[:300])
