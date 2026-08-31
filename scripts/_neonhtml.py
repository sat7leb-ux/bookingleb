import re
html = open(r"C:/Users/ITLEB/neon_home.html", encoding="utf-8", errors="ignore").read()
print("html len:", len(html))
for m in re.findall(r'org[_-]?id["\': =]+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', html, re.I)[:10]:
    print("ORGID:", m)
for m in re.findall(r'organizationId["\': =]+([0-9a-f-]{36})', html)[:10]:
    print("ORG2:", m)
print("has __NEXT_DATA__:", "__NEXT_DATA__" in html)
# print a snippet around 'org'
for mm in re.finditer(r'org', html, re.I):
    s = max(0, mm.start()-30); e = min(len(html), mm.start()+50)
    print("...", html[s:e].replace("\n"," "), "...")
    if mm.start() > 5000: break
