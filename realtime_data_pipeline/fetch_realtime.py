# fetch_realtime.py

import requests, os, json, time
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# 1. Load environment variables
load_dotenv()
API_KEY = os.getenv("LASTFM_API_KEY")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

# 2. Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["global_music_mongo"]
collection = db["realtime_listening"]

# 3. Load country list
with open(os.path.join(BASE_DIR, "../data_insertion/supported_countries.json")) as f:
    COUNTRIES = json.load(f)

# 4. Function to fetch top tracks for a country
def fetch_country_top_tracks(country):
    url = (
        f"http://ws.audioscrobbler.com/2.0/?method=geo.gettoptracks"
        f"&country={country}&api_key={API_KEY}&format=json"
    )
    try:
        res = requests.get(url, timeout=10)
        if res.status_code != 200:
            print(f"[{country}] Failed: {res.status_code}")
            return []
        return res.json().get("tracks", {}).get("track", [])
    except Exception as e:
        print(f"[{country}] ⚠️ Error: {e}")
        return []

# 5. Main data insertion logic
def insert_realtime_data():
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    print(f"Starting real-time data fetch for {today_str}...\n")

    # Optional: delete today's old data
    collection.delete_many({ "date": today_str })

    all_entries = []
    for i, country in enumerate(COUNTRIES):
        print(f"[{i+1}/{len(COUNTRIES)}] Fetching {country}...")
        tracks = fetch_country_top_tracks(country)

        for track in tracks:
            if not track.get("name") or not track.get("artist", {}).get("name"):
                continue

            entry = {
                "song_title": track["name"],
                "artist": track["artist"]["name"],
                "country": country,
                "listener_count": int(float(track.get("listeners", 0))),
                "timestamp": datetime.utcnow(),
                "date": today_str
            }
            all_entries.append(entry)

        time.sleep(0.4)  # avoid rate limiting

    if all_entries:
        collection.insert_many(all_entries)
        print(f"\nInserted {len(all_entries)} records into MongoDB.")
    else:
        print("\nNo valid data fetched.")

# 6. Entry point
if __name__ == "__main__":
    insert_realtime_data()
