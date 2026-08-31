import sqlite3
con = sqlite3.connect(r"C:/Users/ITLEB/ff_store.sqlite")
cur = con.cursor()
# search all rows for supabase / postgresql / access_token
cur.execute("select scope, key, value from webappsstore2 where value like '%supabase%' or key like '%supabase%' or value like '%access_token%' or key like '%sb-%' limit 80")
rows = cur.fetchall()
print("matches:", len(rows))
for sc, k, v in rows:
    print("SCOPE:", sc, "| KEY:", k[:60])
    print("  VAL:", str(v)[:160])
