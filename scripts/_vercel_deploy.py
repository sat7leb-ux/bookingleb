import json, os, sys, urllib.request, urllib.error

VERCEL_COOKIE = open(r"C:/Users/ITLEB/ff_cookiehdr.txt").read().split("VERCEL=")[1].split("\n")[0]
TEAM = "team_ynzNBTRTnYIqNNlOPe7MHoqL"

def vcurl(method, path, data=None):
    url = "https://api.vercel.com" + path + (f"&teamId={TEAM}" if "?" in path else f"?teamId={TEAM}")
    req = urllib.request.Request(url, method=method,
          headers={"Cookie": VERCEL_COOKIE, "Content-Type": "application/json"})
    if data is not None:
        req.data = json.dumps(data).encode()
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

def main():
    db_url = open(r"C:/Users/ITLEB/neon_db_url.txt").read().strip()
    auth_secret = "bookingleb-prod-secret-" + os.urandom(16).hex()
    st, proj = vcurl("POST", "/v10/projects", {
        "name": "bookingleb",
        "framework": "nextjs",
        "gitRepository": {"type": "github", "repo": "sat7leb-ux/bookingleb"},
    })
    if st == 409 or (isinstance(proj, dict) and (proj.get("error",{}) or {}).get("code") == "resource_exists"):
        st, proj = vcurl("GET", "/v9/projects/bookingleb")
    print("PROJECT:", st, proj.get("id") if isinstance(proj, dict) else proj)
    pid = proj.get("id") if isinstance(proj, dict) else None
    if not pid:
        print("NO PROJECT ID"); sys.exit(1)
    for name, val in [("DATABASE_URL", db_url), ("AUTH_SECRET", auth_secret)]:
        st2, res = vcurl("POST", f"/v10/projects/{pid}/env",
                         {"key": name, "value": val, "type": "encrypted", "target": ["production", "preview", "development"]})
        print("ENV", name, st2, res.get("key") if isinstance(res, dict) else res)
    st3, dep = vcurl("POST", f"/v13/deployments", {
        "name": "bookingleb",
        "gitSource": {"type": "github", "repoId": "sat7leb-ux/bookingleb", "ref": "main"},
        "projectSettings": {"framework": "nextjs"},
    })
    print("DEPLOY:", st3, (dep.get("url") if isinstance(dep, dict) else dep))
    print("DONE")

if __name__ == "__main__":
    main()
