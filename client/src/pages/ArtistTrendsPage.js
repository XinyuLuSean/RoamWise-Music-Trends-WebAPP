import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Button
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
const config = require('../config.json');

export default function ArtistTrendsPage() {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);

  // Popular artists state
  const [popularArtists, setPopularArtists] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  // Global impact state
  const [artistImpact, setArtistImpact] = useState([]);
  const [loadingImpact, setLoadingImpact] = useState(true);

  useEffect(() => {
    // Fetch top 10 artists by popular songs
    fetch(
      `http://${config.server_host}:${config.server_port}/api/artist_trends/popular-songs`
    )
      .then(res => res.json())
      .then(data => {
        setPopularArtists(
          data.map((r, i) => ({ id: i, ...r }))
        );
      })
      .catch(console.error)
      .finally(() => setLoadingPopular(false));

    // Fetch global artist impact scores
    fetch(
      `http://${config.server_host}:${config.server_port}/api/artist_trends/global_artist_impact`
    )
      .then(res => res.json())
      .then(data => {
        setArtistImpact(
          data.map((r, i) => ({ id: i, ...r }))
        );
      })
      .catch(console.error)
      .finally(() => setLoadingImpact(false));
  }, []);

  const popularCols = [
    { field: 'name', headerName: 'Artist Name', flex: 2 },
    { field: 'popular_song_count', headerName: 'Popular Songs', type: 'number', flex: 1 }
  ];

  const impactCols = [
    { field: 'artist_id', headerName: 'Artist ID', flex: 1 },
    { field: 'name', headerName: 'Artist Name', flex: 2 },
    { field: 'impact_score', headerName: 'Impact Score', type: 'number', flex: 1 }
  ];

  return (
    <Container>
      {/* Back button */}
      <Button
        variant="outlined"
        onClick={() => navigate('/')}
        sx={{ mt: 2, mb: 2 }}
      >
        ← Back to Home
      </Button>

      <Typography variant="h4" gutterBottom>
        Artist Trends
      </Typography>

      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
        <Tab label="Number of Popular Songs" />
        <Tab label="Global Impact" />
      </Tabs>

      {tabIndex === 0 && (
        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={popularArtists}
            columns={popularCols}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25]}
            loading={loadingPopular}
            components={{ Toolbar: GridToolbar }}
            autoHeight
          />
        </Box>
      )}

      {tabIndex === 1 && (
        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={artistImpact}
            columns={impactCols}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25]}
            loading={loadingImpact}
            components={{ Toolbar: GridToolbar }}
            autoHeight
          />
        </Box>
      )}
    </Container>
  );
}