import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import axios from "axios";
import worldGeoJSON from "../world-countries.json";

const countryNameMap = {
  "United States of America": "United States",
  "South Korea": "Korea, Republic of",
  "North Korea": "Korea, Democratic People's Republic of",
  "Russia": "Russian Federation",
  "Iran": "Iran, Islamic Republic of",
  "Vietnam": "Viet Nam",
  "Laos": "Lao People's Democratic Republic",
  "Syria": "Syrian Arab Republic",
  "Bolivia": "Bolivia, Plurinational State of",
  "Venezuela": "Venezuela, Bolivarian Republic of",
};

const Globe3D = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [topSongs, setTopSongs] = useState([]);
  const [topGlobalSongs, setTopGlobalSongs] = useState([]);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [availableCountries, setAvailableCountries] = useState([]);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    axios.get(`/api/home/global-trends?date=${today}`).then((res) => {
      const allData = res.data;
      setAvailableCountries(Object.keys(allData));

      const allSongs = Object.values(allData).flat();
      const songMap = {};
      allSongs.forEach((song) => {
        const key = `${song.song_title}__${song.artist}`;
        songMap[key] = (songMap[key] || 0) + song.listener_count;
      });
      const sorted = Object.entries(songMap)
        .map(([key, listener_count]) => {
          const [song_title, artist] = key.split("__");
          return { song_title, artist, listener_count };
        })
        .sort((a, b) => b.listener_count - a.listener_count)
        .slice(0, 10);
      setTopGlobalSongs(sorted);
    });
  }, [today]);

  const handleCountryClick = (country) => {
    setSelectedCountry(country);
    axios
      .get(`/api/home/global-trends?date=${today}`)
      .then((res) => {
        const top = res.data[country];
        setTopSongs(top ? top.slice(0, 3) : []);
      })
      .catch((err) => {
        console.error("Error fetching country songs:", err);
        setTopSongs([]);
      });
  };

  const renderCountryShape = (geo) => {
    const geoName = geo.properties.name;
    const mappedName = countryNameMap[geoName] || geoName;
    const isAvailable = availableCountries.includes(mappedName);

    return (
      <Geography
        key={geo.rsmKey}
        geography={geo}
        onClick={() => {
          if (isAvailable) handleCountryClick(mappedName);
        }}
        style={{
          default: {
            fill: isAvailable ? "#00C9A7" : "#555",
            outline: "none"
          },
          hover: {
            fill: isAvailable ? "#00DDB3" : "#333",
            outline: "none"
          },
          pressed: {
            fill: isAvailable ? "#009F8E" : "#555",
            outline: "none"
          }
        }}
      />
    );
  };

  return (
    <div style={{ backgroundColor: "#000", height: "100vh", position: "relative", color: "#fff" }}>
      <h2 style={{ textAlign: "center", paddingTop: "20px", color: "#00C9A7" }}>
        🌍 RoamWise: Global Music Trends
      </h2>
      <p style={{ textAlign: "center", color: "#ccc" }}>
        Click any country to view today's Top 3 tracks.
      </p>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 160 }}
          style={{ width: "100%", height: "80vh", marginTop: "30px" }}
        >
          <Geographies geography={worldGeoJSON}>
            {({ geographies }) =>
              geographies.map((geo) => renderCountryShape(geo))
            }
          </Geographies>
        </ComposableMap>
      </div>

      {selectedCountry && topSongs.length > 0 && (
        <div
          style={{
            position: "absolute",
            right: 20,
            top: 120,
            backgroundColor: "#1E1E1E",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 0 10px rgba(0,0,0,0.4)",
            width: "260px",
            zIndex: 1000,
            color: "#fff"
          }}
        >
          <h4 style={{ marginBottom: "10px" }}>{selectedCountry} - Top 3 Songs</h4>
          <ol style={{ margin: 0, paddingLeft: "20px" }}>
            {topSongs.map((song, i) => (
              <li key={i} style={{ marginBottom: "6px" }}>
                <strong>{song.song_title || "N/A"}</strong><br />
                <small>{song.artist || "Unknown"} ({song.listener_count || 0} plays)</small>
              </li>
            ))}
          </ol>
          <button
            onClick={() => setSelectedCountry(null)}
            style={{ marginTop: "10px", padding: "5px 10px" }}
          >
            Close
          </button>
        </div>
      )}

      {topGlobalSongs.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            backgroundColor: "#1E1E1E",
            padding: isPanelCollapsed ? "5px 10px" : "12px 20px",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(255,255,255,0.1)",
            zIndex: 999,
            color: "#fff",
            maxHeight: isPanelCollapsed ? "40px" : "40vh",
            overflowY: "auto",
            width: isPanelCollapsed ? "160px" : "280px",
            transition: "all 0.3s ease-in-out"
          }}
        >
          <button
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            style={{
              background: "none",
              border: "none",
              color: "#00C9A7",
              cursor: "pointer",
              float: "right",
              fontSize: "18px"
            }}
          >
            {isPanelCollapsed ? "▲" : "▼"}
          </button>
          {!isPanelCollapsed && (
            <>
              <h4 style={{ textAlign: "center", marginBottom: "10px" }}>🌍 Today's Global Top 10</h4>
              <ol style={{ margin: 0, paddingLeft: "20px" }}>
                {topGlobalSongs.map((song, i) => (
                  <li key={i} style={{ marginBottom: "6px" }}>
                    <strong>{song.song_title || "undefined"}</strong> — <small>{song.artist || "Unknown"}</small>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Globe3D;
