import pandas as pd
import psycopg2
import os
import ast
from dotenv import load_dotenv
from psycopg2.extras import execute_values

# Load environment variables
load_dotenv()
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")

df = pd.read_csv('../datasets/top_songs_cleaned.csv')
df['artists'] = df['artists'].apply(
    lambda x: ast.literal_eval(x) if isinstance(x, str) and x.startswith("[") else [x]
)

conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT
)
cursor = conn.cursor()

cursor.execute("SELECT artist_id, name FROM Artists")
artist_mapping = {name.strip().lower(): artist_id for artist_id, name in cursor.fetchall()}

cursor.execute("SELECT song_id, title, artist_id FROM Songs")
song_rows = cursor.fetchall()
artist_id_to_name = {v: k for k, v in artist_mapping.items()}
song_mapping = {}

for song_id, title, artist_id in song_rows:
    artist_name = artist_id_to_name.get(artist_id)
    if artist_name:
        song_mapping[(title.strip().lower(), artist_name)] = song_id

artist_song_rows = []
for _, row in df.iterrows():
    title = row['name'].strip().lower()
    artist_list = [a.strip().lower() for a in row['artists']]
    first_artist = artist_list[0] if artist_list else None
    song_id = song_mapping.get((title, first_artist))
    if song_id:
        for artist in artist_list:
            artist_id = artist_mapping.get(artist)
            if artist_id:
                artist_song_rows.append((artist_id, song_id))

# Batch insert
insert_sql = """
    INSERT INTO ArtistSong (artist_id, song_id)
    VALUES %s
    ON CONFLICT DO NOTHING
"""
execute_values(cursor, insert_sql, artist_song_rows)
conn.commit()

cursor.close()
conn.close()

print("Artist-song relations inserted into the database.")