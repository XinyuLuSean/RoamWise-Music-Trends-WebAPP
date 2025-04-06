import pandas as pd
import psycopg2
import ast
import os
from dotenv import load_dotenv
from psycopg2.extras import execute_values

# Load environment variables
load_dotenv()
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")

# Load cleaned playlist dataset
df = pd.read_csv("datasets/playlists_cleaned.csv")

# Drop rows with missing critical fields
df = df.dropna(subset=['user_id', 'playlistname', 'trackname', 'artistname'])

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT
)
cursor = conn.cursor()

# Build playlist mapping
cursor.execute("SELECT playlist_id, name, user_id FROM Playlists")
playlist_mapping = {
    (name.strip(), user_id.strip()): playlist_id
    for playlist_id, name, user_id in cursor.fetchall()
}

# Build song mapping
cursor.execute("SELECT song_id, title, artist_id FROM Songs")
song_rows = cursor.fetchall()
cursor.execute("SELECT artist_id, name FROM Artists")
artist_rows = cursor.fetchall()
artist_map = {name.strip().lower(): artist_id for artist_id, name in artist_rows}

song_mapping = {}
for song_id, title, artist_id in song_rows:
    for name, aid in artist_map.items():
        if aid == artist_id:
            song_mapping[(title.strip().lower(), name)] = song_id
            break

# Build batch insert values
playlist_song_values = []

for _, row in df.iterrows():
    try:
        playlist_key = (str(row['playlistname']).strip(), str(row['user_id']).strip())
        playlist_id = playlist_mapping.get(playlist_key)
        
        track = str(row['trackname']).strip().lower()

        artists = ast.literal_eval(row['artistname']) if isinstance(row['artistname'], str) else []
        if not artists:
            continue
        artist = artists[0].strip().lower()
        song_id = song_mapping.get((track, artist))

        if playlist_id and song_id:
            playlist_song_values.append((playlist_id, song_id))
    except Exception as e:
        print("Skipping row due to error:", e)

# Batch insert
insert_sql = """
    INSERT INTO PlaylistSongs (playlist_id, song_id)
    VALUES %s
    ON CONFLICT DO NOTHING
"""

batch_size = 500
for i in range(0, len(playlist_song_values), batch_size):
    batch = playlist_song_values[i:i+batch_size]
    execute_values(cursor, insert_sql, batch)
    print(f"Inserted {i + len(batch)} / {len(playlist_song_values)} rows into PlaylistSongs")

conn.commit()
cursor.close()
conn.close()
print("PlaylistSongs successfully inserted (batch optimized)")

