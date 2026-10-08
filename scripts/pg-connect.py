import os
import sys
import psycopg

conninfo = (
    f"host={os.environ['PGHOST']} "
    f"port={os.environ.get('PGPORT', '5432')} "
    f"user={os.environ['PGUSER']} "
    f"password={os.environ['PGPASSWORD']} "
    f"dbname={os.environ.get('PGDATABASE', 'postgres')} "
    "sslmode=require"
)
sql = sys.argv[1] if len(sys.argv) > 1 else "select current_user, current_database();"
with psycopg.connect(conninfo, connect_timeout=15) as conn:
    with conn.cursor() as cur:
        cur.execute(sql)
        if cur.description:
            rows = cur.fetchall()
            cols = [d.name for d in cur.description]
            print([dict(zip(cols, row)) for row in rows])
        else:
            print(cur.statusmessage)
    conn.commit()
