import json, base64
jar = json.load(open(r"C:/Users/ITLEB/ff_cookies.json"))
z = [c["value"] for c in jar.get("console.neon.tech", []) if c["name"] == "zenith"][0]
parts = z.split(".")
for i, p in enumerate(parts):
    try:
        pp = p + "=" * (-len(p) % 4)
        d = json.loads(base64.urlsafe_b64decode(pp))
        print(f"-- part {i} keys:", list(d.keys())[:25])
        for k, v in d.items():
            if "org" in k.lower() or "id" in k.lower() or "user" in k.lower():
                print("   ", k, "=", v)
    except Exception:
        pass
