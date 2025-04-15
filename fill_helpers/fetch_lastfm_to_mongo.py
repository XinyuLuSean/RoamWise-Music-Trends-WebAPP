import requests
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load API key from .env
load_dotenv()
API_KEY = os.getenv("LASTFM_API_KEY")

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["global_music_mongo"]
collection = db["lastfm_top_tracks"]

print("Connected to Mongo:", db.name, collection.name)

def fetch_top_tracks(artist_name):
    url = "http://ws.audioscrobbler.com/2.0/"
    params = {
        "method": "artist.gettoptracks",
        "artist": artist_name,
        "api_key": API_KEY,
        "format": "json",
        "limit": 10
    }
    response = requests.get(url, params=params)
    data = response.json()

        # Insert into MongoDB
    if 'toptracks' in data and 'track' in data['toptracks']:
        tracks = data['toptracks']['track']
        for track in tracks:
            collection.insert_one({
                "artist": artist_name,
                "track": track["name"],
                "listeners": int(track["listeners"]),
                "playcount": int(track["playcount"]),
                "url": track["url"]
            })
        print(f"Inserted {len(tracks)} tracks for {artist_name}")
    else:
        print(f"Failed to fetch or no tracks for artist: {artist_name}")

 # Example usage
if __name__ == "__main__":
    fetch_top_tracks("Taylor Swift")