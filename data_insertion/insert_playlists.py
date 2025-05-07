import pandas as pd
import psycopg2
import os
from dotenv import load_dotenv
from psycopg2.extras import execute_values

# Load env variables
load_dotenv()
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")

# Load cleaned playlist dataset
df = pd.read_csv("datasets/playlists_cleaned.csv")

# Drop rows with missing user_id or playlistname
df = df.dropna(subset=["user_id", "playlistname"])

# Drop duplicates
df = df.drop_duplicates(subset=["user_id", "playlistname"])

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT
)
cursor = conn.cursor()

# Prepare insert values
playlist_rows = [
    (str(row["playlistname"])[:255], str(row["user_id"])[:100])
    for _, row in df.iterrows()
]

# Batch insert with conflict handling
insert_sql = """
    INSERT INTO Playlists (name, user_id)
    VALUES %s
    ON CONFLICT DO NOTHING
"""

batch_size = 500
for i in range(0, len(playlist_rows), batch_size):
    batch = playlist_rows[i:i+batch_size]
    execute_values(cursor, insert_sql, batch)
    print(f"Inserted {i + len(batch)} / {len(playlist_rows)} playlists")

conn.commit()
cursor.close()
conn.close()

print("Playlists inserted successfully (batch optimized)")
