import os
import sys
import psycopg

path = sys.argv[1]
sql = open(path, encoding="utf-8").read()
conninfo = (
    f"host={os.environ['PGHOST']} "
    f"port={os.environ.get('PGPORT', '5432')} "
    f"user={os.environ['PGUSER']} "
    f"password={os.environ['PGPASSWORD']} "
    f"dbname={os.environ.get('PGDATABASE', 'postgres')} "
    "sslmode=require"
)
with psycopg.connect(conninfo, connect_timeout=20, autocommit=True) as conn:
    with conn.cursor() as cur:
        cur.execute(sql)
print(f"applied {os.path.basename(path)}")
