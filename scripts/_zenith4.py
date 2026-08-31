import base64, json, io

jar = json.load(open(r"C:/Users/ITLEB/ff_cookies.json"))
z = [c["value"] for c in jar.get("console.neon.tech", []) if c["name"] == "zenith"][0]
payload = z.split(".")[0] + "=" * (-len(z.split(".")[0]) % 4)
raw = base64.urlsafe_b64decode(payload)
idx = raw.find(b"|")
# after '|' there is a base64 string (Redis pickle). Decode it.
inner_b64 = raw[idx + 1:]
inner = base64.b64decode(inner_b64)
print("inner head:", inner[:80])
# Redis serialization format: \x00\x01 + key \x00\x02 + type ... Try to find org id string.
# Simpler: search for uuid-like patterns
import re
uids = re.findall(rb"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", inner)
print("UUIDs found:", [u.decode() for u in uids])
# also print readable ascii chunks
chunks = re.findall(rb"[ -~]{6,}", inner)
for c in chunks[:20]:
    print("  ", c.decode())
