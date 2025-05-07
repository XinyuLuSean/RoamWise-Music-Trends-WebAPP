from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv

client = MongoClient("mongodb://localhost:27017/")
db = client["global_music_mongo"]
collection = db["lastfm_top_tracks"]

sample_data = [
    {
        "country": "US",
        "date": datetime.today().strftime('%Y-%m-%d'),
        "top_songs": [
            {"title": "Cruel Summer", "artist": "Taylor Swift", "streams": 1200000},
            {"title": "Blinding Lights", "artist": "The Weeknd", "streams": 1100000}
        ]
    },
    {
        "country": "UK",
        "date": datetime.today().strftime('%Y-%m-%d'),
        "top_songs": [
            {"title": "Flowers", "artist": "Miley Cyrus", "streams": 980000},
            {"title": "Shape of You", "artist": "Ed Sheeran", "streams": 900000}
        ]
    }
]

collection.insert_many(sample_data)
print("Sample data inserted into lastfm_top_tracks!")