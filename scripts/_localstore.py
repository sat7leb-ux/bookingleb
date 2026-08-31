import sqlite3
con = sqlite3.connect(r"C:/Users/ITLEB/ff_store.sqlite")
cur = con.cursor()
cur.execute("select sql from sqlite_master where name='webappsstore2'")
print("schema:", cur.fetchone())
cur.execute("select * from webappsstore2 limit 1")
print("sample row:", cur.fetchone())
cur.execute("select scope, key, value from webappsstore2 where scope like '%neon%' or value like '%postgresql://%' or key like '%neon%' or value like '%neon%' limit 50")
rows = cur.fetchall()
print("matches:", len(rows))
for sc, k, v in rows:
    print("SCOPE:", sc, "| KEY:", k)
    print("  VAL:", str(v)[:200])
