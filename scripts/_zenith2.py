import json, base64
jar = json.load(open(r"C:/Users/ITLEB/ff_cookies.json"))
z = [c["value"] for c in jar.get("console.neon.tech", []) if c["name"] == "zenith"][0]
print("zenith raw len:", len(z))
parts = z.split(".")
for i, p in enumerate(parts):
    print(f"--- part {i} (len {len(p)}) raw ---")
    print(p[:120])
    try:
        pp = p + "=" * (-len(p) % 4)
        dec = base64.urlsafe_b64decode(pp)
        print("   decoded:", dec[:200])
    except Exception as e:
        print("   b64 fail:", e)
