import json, os

jar = json.load(open(r"C:/Users/ITLEB/ff_cookies.json"))
def cookie_str(host_key):
    parts = []
    for host in (host_key, "." + host_key.lstrip(".") if not host_key.startswith(".") else host_key):
        for c in jar.get(host, []):
            parts.append(f"{c['name']}={c['value']}")
    return "; ".join(parts)

# Vercel needs cookies from both vercel.com and .vercel.com
v = cookie_str("vercel.com") + "; " + cookie_str(".vercel.com")
# Neon
n = cookie_str("console.neon.tech") + "; " + cookie_str(".neon.tech")
# GitHub
g = cookie_str("github.com") + "; " + cookie_str(".github.com")

with open(r"C:/Users/ITLEB/ff_cookiehdr.txt", "w") as f:
    f.write("VERCEL=" + v + "\n")
    f.write("NEON=" + n + "\n")
    f.write("GITHUB=" + g + "\n")
print("Vercel cookie header length:", len(v))
print("Neon cookie header length:", len(n))
print("GitHub cookie header length:", len(g))
print("saved to C:/Users/ITLEB/ff_cookiehdr.txt")
