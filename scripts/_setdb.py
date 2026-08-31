import json, os, sys

# Reads the Neon DATABASE_URL (pooled) from a file and sets:
#  - local .env.local (gitignored) for local testing
#  - queues it for Vercel env vars
def main():
    url = sys.argv[1] if len(sys.argv) > 1 else None
    if not url:
        print("usage: set_db_url.py <postgresql://...>")
        sys.exit(1)
    # normalize to pooled connection string with sslmode=require
    if "sslmode=" not in url:
        url = url + ("&" if "?" in url else "?") + "sslmode=require"
    # write .env.local (gitignored)
    with open(r"C:/Users/ITLEB/bookingleb/.env.local", "w") as f:
        f.write(f"DATABASE_URL={url}\n")
        f.write("AUTH_SECRET=dev-only-secret-not-for-production-1234567890abcdef\n")
    print("Wrote .env.local with DATABASE_URL (len=%d)" % len(url))
    # stash for vercel step
    with open(r"C:/Users/ITLEB/neon_db_url.txt", "w") as f:
        f.write(url)
    print("Saved Neon URL for Vercel env step.")

if __name__ == "__main__":
    main()
