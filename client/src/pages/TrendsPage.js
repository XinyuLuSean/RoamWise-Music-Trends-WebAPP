import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
const config = require('../config.json');

export default function TrendsPage() {
  const [tabIndex, setTabIndex] = useState(0);

  // Countries list for Top Songs tab
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countrySongs, setCountrySongs] = useState([]);
  const [loadingCountrySongs, setLoadingCountrySongs] = useState(false);

  // Albums by country
  const [albumCounts, setAlbumCounts] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  // Top country per song
  const [topCountryList, setTopCountryList] = useState([]);
  const [loadingTopCountry, setLoadingTopCountry] = useState(true);

  // Global artist impact
  const [artistImpact, setArtistImpact] = useState([]);
  const [loadingArtistImpact, setLoadingArtistImpact] = useState(true);

  // Fetch initial data
  useEffect(() => {
    // Fetch list of countries
    fetch(`http://${config.server_host}:${config.server_port}/api/trends/countries`)
      .then(res => res.json())
      .then(data => {
        setCountries(data.map((c, i) => ({ id: i, country: c })));
      })
      .catch(console.error)
      .finally(() => setLoadingCountries(false));

    // Fetch album counts
    fetch(`http://${config.server_host}:${config.server_port}/api/trends/albums-by-country`)
      .then(res => res.json())
      .then(data => {
        setAlbumCounts(data.map((r, i) => ({ id: i, country: r.country, album_count: Number(r.album_count) })));
      })
      .catch(console.error)
      .finally(() => setLoadingAlbums(false));

    // Fetch top country per song
    fetch(`http://${config.server_host}:${config.server_port}/api/trends/top-country-per-song`)
      .then(res => res.json())
      .then(data => {
        setTopCountryList(data.map((r, i) => ({ id: i, song_id: r.song_id, title: r.title, top_country: r.top_country, chart_appearances: Number(r.chart_appearances) })));
      })
      .catch(console.error)
      .finally(() => setLoadingTopCountry(false));

    // Fetch global artist impact
    fetch(`http://${config.server_host}:${config.server_port}/api/trends/global_artist_impact`)
      .then(r => r.json())
      .then(data =>
        setArtistImpact(data.map((r, i) => ({
          id: i,
          artist_id: r.artist_id,
          name:       r.name,
          impact_score: Number(r.impact_score),
        })))
      )
      .catch(console.error)
      .finally(() => setLoadingArtistImpact(false));
  }, []);

  // Lazy-load songs for selected country
  const fetchSongsByCountry = country => {
    setLoadingCountrySongs(true);
    fetch(`http://${config.server_host}:${config.server_port}/api/trends/top-songs-by-country?country=${encodeURIComponent(country)}`)
      .then(res => res.json())
      .then(data => {
        setCountrySongs(data.map((r, i) => ({ id: i, song_id: r.song_id, title: r.title, popularity_score: Number(r.popularity_score), rank: Number(r.rank) })));
      })
      .catch(console.error)
      .finally(() => setLoadingCountrySongs(false));
  };

  useEffect(() => {
    if (selectedCountry) {
      fetchSongsByCountry(selectedCountry);
    }
  }, [selectedCountry]);

  const handleTabChange = (_, newIndex) => {
    setTabIndex(newIndex);
    setSelectedCountry(null);
    setCountrySongs([]);
  };

  const songCols = [
    { field: 'rank', headerName: 'Rank', type: 'number', flex: 0.5 },
    { field: 'song_id', headerName: 'Song ID', flex: 1 },
    { field: 'title', headerName: 'Title', flex: 2 },
    { field: 'popularity_score', headerName: 'Popularity', type: 'number', flex: 1 }
  ];
  const albumCols = [
    { field: 'country', headerName: 'Country', flex: 1 },
    { field: 'album_count', headerName: 'Album Count', type: 'number', flex: 1 }
  ];
  const topCountryCols = [
    { field: 'song_id', headerName: 'Song ID', flex: 1 },
    { field: 'title', headerName: 'Title', flex: 2 },
    { field: 'top_country', headerName: 'Top Country', flex: 1 },
    { field: 'chart_appearances', headerName: 'Appearances', type: 'number', flex: 1 }
  ];
  const artistImpactCols = [
    { field: 'artist_id', headerName: 'Artist ID', flex: 1 },
    { field: 'name', headerName: 'Artist Name', flex: 2 },
    { field: 'impact_score', headerName: 'Impact Score', type: 'number', flex: 1 }
  ];

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Music Trends Dashboard</Typography>

      <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Top Songs" />
        <Tab label="Albums" />
        <Tab label="Top Countries" />
        <Tab label="Artist Impact" />
      </Tabs>

      {tabIndex === 0 && (
        <Box>
          {!selectedCountry ? (
            <DataGrid
              rows={countries}
              columns={[{ field: 'country', headerName: 'Country', flex: 1 }]}
              pageSize={10}
              rowsPerPageOptions={[5, 10]}
              loading={loadingCountries}
              components={{ Toolbar: GridToolbar }}
              onRowClick={params => setSelectedCountry(params.row.country)}
              autoHeight
            />
          ) : (
            <Box>
              <Button onClick={() => setSelectedCountry(null)} sx={{ mb: 2 }}>← Back</Button>
              <DataGrid
                rows={countrySongs}
                columns={songCols}
                pageSize={10}
                rowsPerPageOptions={[5, 10]}
                loading={loadingCountrySongs}
                autoHeight
              />
            </Box>
          )}
        </Box>
      )}

      {tabIndex === 1 && (
        <DataGrid
          rows={albumCounts}
          columns={albumCols}
          pageSize={10}
          rowsPerPageOptions={[5, 10]}
          loading={loadingAlbums}
          components={{ Toolbar: GridToolbar }}
          autoHeight
        />
      )}

      {tabIndex === 2 && (
        <DataGrid
          rows={topCountryList}
          columns={topCountryCols}
          pageSize={10}
          rowsPerPageOptions={[5, 10]}
          loading={loadingTopCountry}
          components={{ Toolbar: GridToolbar }}
          autoHeight
        />
      )}

      {tabIndex === 3 && (
        <DataGrid
          rows={artistImpact}
          columns={artistImpactCols}
          pageSize={10}
          rowsPerPageOptions={[5, 10]}
          loading={loadingArtistImpact}
          components={{ Toolbar: GridToolbar }}
          autoHeight
        />
      )}
    </Container>
  );
}