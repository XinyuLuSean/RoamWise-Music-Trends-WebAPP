import pandas as pd
import psycopg2
import ast
import os
from dotenv import load_dotenv

# Load .env credentials
load_dotenv()
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")

# Load cleaned dataset
df = pd.read_csv("datasets/top_songs_cleaned.csv")

# Convert artists column to list
df['artists'] = df['artists'].apply(
    lambda x: ast.literal_eval(x) if isinstance(x, str) and x.startswith("[") else [x]
)

# Connect to PostgreSQL (RDS)
conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT
)
cursor = conn.cursor()

# Load artist and album mapping
cursor.execute("SELECT artist_id, name FROM Artists")
artist_mapping = {name.strip().lower(): artist_id for artist_id, name in cursor.fetchall()}

cursor.execute("SELECT album_id, title FROM Albums")
album_mapping = {title.strip().lower(): album_id for album_id, title in cursor.fetchall()}

# Prepare batched data
batch_size = 1000
batch = []
inserted = 0

for _, row in df.iterrows():
    title = row['name'].strip()[:255]
    artist_name = row['artists'][0].strip().lower() if row['artists'] else None
    artist_id = artist_mapping.get(artist_name)
    album_id = album_mapping.get(row.get('album_name', '').strip().lower())

    if not artist_id:
        continue

    genre = row.get('track_genre')
    release_date = pd.to_datetime(row.get('album_release_date'), errors='coerce')
    release_date = release_date.date() if pd.notnull(release_date) else None
    duration = row.get('duration_ms')
    danceability = row.get('danceability')
    tempo = row.get('tempo')
    energy = row.get('energy')
    popularity_score = row.get('popularity')

    batch.append((
        title, artist_id, album_id, genre, release_date,
        duration, danceability, tempo, energy, popularity_score
    ))

    if len(batch) >= batch_size:
        cursor.executemany("""
            INSERT INTO Songs (
                title, artist_id, album_id, genre, release_date,
                duration, danceability, tempo, energy, popularity_score
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, batch)
        conn.commit()
        inserted += len(batch)
        print(f"Inserted {inserted} songs so far...")
        batch = []

# Insert remaining rows
if batch:
    cursor.executemany("""
        INSERT INTO Songs (
            title, artist_id, album_id, genre, release_date,
            duration, danceability, tempo, energy, popularity_score
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """, batch)
    conn.commit()
    inserted += len(batch)

cursor.close()
conn.close()

print(f"Successfully inserted {inserted} songs into Songs table.")
