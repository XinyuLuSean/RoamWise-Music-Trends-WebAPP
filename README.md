# Group23-Project

## Motivation for the Idea / Description of the Problem the Application Solves
We are all passionate about music, but each of us has a unique musical taste and follows different music trends. This inspired us to create a global music trend visualization platform that allows users to explore how music is trending in different regions intuitively and interactively.

Music trends are constantly evolving and vary significantly across different regions. However, existing music analytics platforms primarily present data in static lists and rankings, making it difficult to visualize the global distribution of music trends effectively. Understanding how songs gain popularity in different countries and how listening habits change over time is crucial for enthusiasts, industry professionals, and data analysts.

To address this, our application will leverage an interactive world map visualization to showcase real-time and historical music trends across different countries. By integrating data from:  
- **Spotify Playlists Datasets** – Understanding user-generated playlist trends and preferences.  
- **Top Spotify Songs in 73 Countries Dataset** – Tracking song rankings, streaming counts, and regional music variations.  
- **Last.fm API** – Capturing real-time listening behavior and trends across a global audience.  

With real-time streaming data processing, users can:  
- Explore trending songs and artists by region on an interactive world map.  
- Track global music trends dynamically, identifying emerging genres and cultural influences.  
- Compare real-time listening data with historical rankings to understand the evolution of music trends over time.  

Our platform transforms music analytics from a static experience into a dynamic, visually engaging exploration of the world’s evolving music landscape.

### Data Cleaning and Preprocessing
- Cleaned: `top_songs_cleaned.csv` and `playlists_cleaned.csv`
- Processed artists list using `ast.literal_eval`
- Converted release dates, durations, and removed nulls
  
Steps performed: • Removed null entries and cleaned artist/album/song names
• Converted artist lists to usable formats using ast.literal_eval
• Standardized release date formats and duration units (e.g., converted milliseconds to seconds)

### Database Schema (PostgreSQL)
We designed and implemented 6 core tables:

• Artists
• Albums
• Songs
• Playlists
• PlaylistSongs
• CountryRankings

Schema design ensures: • Proper use of foreign key constraints
• Referential integrity between songs, artists, albums, and playlists

### Localhost Testing + AWS RDS Deployment
• Inserted data into all tables locally using psycopg2
• Migrated the database to AWS RDS (group23-db) and verified data insertion
• Stored RDS credentials securely using a .env file and loaded them via python-dotenv
• Created modular insertion scripts under /data_insertion/, including:
- insert_artists.py
- insert_albums.py
- insert_songs.py
- insert_playlists.py
- insert_playlistsongs.py
- insert_country_rankings.py

## Backend API Development 

We implemented backend RESTful APIs to support both relational and NoSQL-based queries. APIs were built using Express.js and connected to PostgreSQL and MongoDB.

### Routes Implemented

Each route is designed following the format:
- Functionality Description  
- Request Path  
- Request Parameters (type, location, required)  
- Response Parameters (type, description)  

## Datasets

Due to file size, datasets are available via Google Drive:

- [Top Songs Cleaned CSV](https://drive.google.com/file/d/1OgsGpsE5TWSRsOto9ZtY6cL5aQcCUuu_/view?usp=drive_link)
- [Playlists Cleaned CSV](https://drive.google.com/file/d/1eFlZoxA4hMzdpnN0UTDAqcEx8FJ5avSR/view?usp=drive_link)
- 

## Features

- 🌍 Interactive world map of music trends
- 📊 Real-time global listening data via Last.fm API
- 📁 Historical Spotify-based rankings and playlist insights
- 🔗 Dual database support: PostgreSQL (relational) + MongoDB (real-time)

---

## How to Run the Project Locally

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Group23-Project.git
cd Group23-Project

### 2. Set Up the Backend

cd server
npm install
cp .env.example .env  
node index.js        

### 3. Set Up the Frontend

cd ../client
npm install
npm start

### 4. Set Up Databases
cd ../data_insertion
python insert_artists.py
python insert_albums.py
python insert_songs.py
python insert_playlists.py
python insert_playlistsongs.py
python insert_country_rankings.py

cd ../realtime_pipeline
python fetch_realtime.py


# PostgreSQL settings
PG_HOST=your-postgres-hostname
PG_PORT=5432
PG_USER=your-postgres-username
PG_PASSWORD=your-postgres-password
PG_DATABASE=global_music

# MongoDB Atlas URI
MONGO_URI=mongodb+srv://<username>:<password>@your-cluster.mongodb.net/global_music?retryWrites=true&w=majority

# Last.fm API key 
LASTFM_API_KEY=your_lastfm_api_key

