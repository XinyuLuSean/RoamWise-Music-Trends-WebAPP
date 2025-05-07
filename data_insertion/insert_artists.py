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

# Load cleaned top songs CSV
df = pd.read_csv('datasets/top_songs_cleaned.csv')

# Convert stringified lists into real Python lists
df['artists'] = df['artists'].apply(
    lambda x: ast.literal_eval(x) if isinstance(x, str) and x.startswith('[') else [x]
)

# Extract all artist names into a flat list
all_artists = []
for artist_list in df['artists']:
    for artist in artist_list:
        all_artists.append(artist.strip())


# Get unique artists
unique_artists = pd.DataFrame(list(set(all_artists)), columns=['name'])

# Add default values for missing fields
unique_artists['country'] = 'Unknown'          
unique_artists['followers'] = None               # Placeholder for future Spotify API
unique_artists['popularity_score'] = None        # Placeholder for future Spotify API

# Connect to PostgreSQL database (AWS RDS)
conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT
)
cursor = conn.cursor()

# Insert each artist into the database
for _, row in unique_artists.iterrows():
    cursor.execute("""
        INSERT INTO Artists (name, country, followers, popularity_score)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """, (row['name'], row['country'], row['followers'], row['popularity_score']))

# Commit and close connection
conn.commit()
cursor.close()
conn.close()

print("Artists data successfully inserted into PostgreSQL database!")