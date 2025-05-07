import pandas as pd
import psycopg2
import os
import ast
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")

# Load dataset
df = pd.read_csv("datasets/top_songs_cleaned.csv")
df['artists'] = df['artists'].apply(
    lambda x: ast.literal_eval(x) if isinstance(x, str) and x.startswith("[") else [x]
)

# Connect to PostgreSQL (AWS RDS)
conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT
)
cursor = conn.cursor()

# Step 1: Build mapping for (song_title, artist_name) → song_id
cursor.execute("SELECT song_id, title, artist_id FROM Songs")
song_rows = cursor.fetchall()

cursor.execute("SELECT artist_id, name FROM Artists")
artist_rows = cursor.fetchall()
artist_dict = {aid: name.strip().lower() for aid, name in artist_rows}

# Build mapping from (song_title, artist_name) → song_id
song_mapping = {}
for song_id, title, artist_id in song_rows:
    artist_name = artist_dict.get(artist_id)
    if artist_name:
        key = (title.strip().lower(), artist_name)
        song_mapping[key] = song_id

# Step 2: Insert country ranking data
inserted = 0
for _, row in df.iterrows():
    try:
        song_title = row['name'].strip().lower()
        artist_name = row['artists'][0].strip().lower()
        song_id = song_mapping.get((song_title, artist_name))

        if not song_id:
            continue

        country = row['country']
        rank_position = row.get('daily_rank', None)
        streams = row.get('popularity', None)
        date = pd.to_datetime(row.get('snapshot_date'), errors='coerce')
        date = date.date() if pd.notnull(date) else None

        cursor.execute("""
            INSERT INTO CountryRankings (song_id, country, rank_position, streams, date)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, (song_id, country, rank_position, streams, date))

        inserted += 1
    except Exception as e:
        print(f"Failed to insert row — {e}")

# Finalize
conn.commit()
cursor.close()
conn.close()
print(f"Successfully inserted {inserted} records into CountryRankings table.")
