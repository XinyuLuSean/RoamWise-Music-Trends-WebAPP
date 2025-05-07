import pandas as pd
import psycopg2
import ast
import os
from dotenv import load_dotenv

# Load database credentials from .env file
load_dotenv()

DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")

df = pd.read_csv("datasets/top_songs_cleaned.csv")

# Convert 'artists' column from string to list
df['artists'] = df['artists'].apply(
    lambda x: ast.literal_eval(x) if isinstance(x, str) and x.startswith('[') else [x]
)


# Extract album title, artist name, and release date from each row
album_rows = []
for _, row in df.iterrows():
    album_name = row.get('album_name', '').strip()[:255]  # Ensure no string overflow
    release_date = row.get('album_release_date', None)
    for artist in row['artists']:
        artist = artist.strip()
        album_rows.append((album_name, artist, release_date))

# Remove duplicates (unique album-artist-release combinations)
album_df = pd.DataFrame(list(set(album_rows)), columns=['title', 'artist_name', 'release_date'])

# Connect to PostgreSQL using .env credentials
conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT
)
cursor = conn.cursor()

# Build a dictionary mapping artist name to artist_id
cursor.execute("SELECT artist_id, name FROM Artists")
artist_rows = cursor.fetchall()
artist_mapping = {name.strip(): artist_id for artist_id, name in artist_rows}

inserted = 0

# Iterate through each unique album record
for _, row in album_df.iterrows():
    artist_id = artist_mapping.get(row['artist_name'])  # Lookup artist_id by name
    if not artist_id:
        continue  # Skip if artist not found
    
    # Parse release date
    release_date = pd.to_datetime(row['release_date'], errors='coerce')
    release_date = release_date.date() if pd.notnull(release_date) else None

    # Insert album into Albums table
    cursor.execute("""
        INSERT INTO Albums (title, artist_id, release_date, total_tracks, album_type)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """, (
        row['title'], artist_id, release_date, None, None  # total_tracks and album_type are unknown
    ))
    inserted += 1


# Finalize changes and close connection
conn.commit()
cursor.close()
conn.close()

print(f"Successfully inserted {inserted} albums into the Albums table.")