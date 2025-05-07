import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  TextField,
  Button
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
const config = require('../config.json');

export default function CountryTrendsPage() {
  const [tabIndex, setTabIndex] = useState(0);

  // Album counts state
  const [albumCounts, setAlbumCounts] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  // Top songs state
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countrySongs, setCountrySongs] = useState([]);
  const [loadingCountrySongs, setLoadingCountrySongs] = useState(false);
  const [songPageSize, setSongPageSize] = useState(10);

  // Similarity state
  const [date, setDate] = useState('');
  const [simRows, setSimRows] = useState([]);
  const [simLoading, setSimLoading] = useState(false);
  const [simPageSize, setSimPageSize] = useState(10);

  useEffect(() => {
    // Fetch album counts
    fetch(`http://${config.server_host}:${config.server_port}/api/country_trends/albums-by-country`)
      .then(res => res.json())
      .then(data => setAlbumCounts(
        data.map((r, i) => ({ id: i, country: r.country, album_count: Number(r.album_count) }))
      ))
      .catch(console.error)
      .finally(() => setLoadingAlbums(false));

    // Fetch countries for top songs
    fetch(`http://${config.server_host}:${config.server_port}/api/country_trends/countries`)
      .then(res => res.json())
      .then(data => setCountries(
        data.map((c, i) => ({ id: i, country: c }))
      ))
      .catch(console.error)
      .finally(() => setLoadingCountries(false));
  }, []);

  // Lazy-load top songs
  const fetchSongsByCountry = country => {
    setLoadingCountrySongs(true);
    fetch(
      `http://${config.server_host}:${config.server_port}/api/country_trends/top-songs-by-country?country=${encodeURIComponent(country)}`
    )
      .then(res => res.json())
      .then(data => setCountrySongs(
        data.map((r, i) => ({
          id: i,
          song_id: r.song_id,
          title: r.title,
          popularity_score: Number(r.popularity_score),
          rank: Number(r.rank)
        }))
      ))
      .catch(console.error)
      .finally(() => setLoadingCountrySongs(false));
  };

  useEffect(() => {
    if (selectedCountry) fetchSongsByCountry(selectedCountry);
  }, [selectedCountry]);

  // Handle similarity search
  const handleSearch = () => {
    if (!date) return;
    setSimLoading(true);
    fetch(
      `http://${config.server_host}:${config.server_port}/api/country_trends/jaccard_similarity?date=${date}`
    )
      .then(res => res.json())
      .then(data => setSimRows(data.map((r, i) => ({ id: i, ...r }))))
      .catch(console.error)
      .finally(() => setSimLoading(false));
  };

  const albumCols = [
    { field: 'country', headerName: 'Country', flex: 1 },
    { field: 'album_count', headerName: 'Album Count', type: 'number', flex: 1 }
  ];

  const songCols = [
    { field: 'rank', headerName: 'Rank', type: 'number', flex: 0.5 },
    { field: 'song_id', headerName: 'Song ID', flex: 1 },
    { field: 'title', headerName: 'Title', flex: 2 },
    { field: 'popularity_score', headerName: 'Popularity', type: 'number', flex: 1 }
  ];

  const simCols = [
    { field: 'c1', headerName: 'Country 1', flex: 1 },
    { field: 'c2', headerName: 'Country 2', flex: 1 },
    {
      field: 'jaccard_sim',
      headerName: 'Similarity',
      type: 'number',
      flex: 1,
      valueFormatter: ({ value }) => Number(value).toFixed(4)
    }
  ];

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Country Trends</Typography>

      <Tabs value={tabIndex} onChange={(_, i) => setTabIndex(i)} sx={{ mb: 2 }}>
        <Tab label="Album Counts" />
        <Tab label="Top Songs" />
        <Tab label="Similarity" />
      </Tabs>

      {tabIndex === 0 && (
        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={albumCounts}
            columns={albumCols}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25]}
            loading={loadingAlbums}
            components={{ Toolbar: GridToolbar }}
            autoHeight
          />
        </Box>
      )}

      {tabIndex === 1 && (
        <Box>
          {!selectedCountry ? (
            <DataGrid
              rows={countries}
              columns={[{ field: 'country', headerName: 'Country', flex: 1 }]}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 25]}
              loading={loadingCountries}
              components={{ Toolbar: GridToolbar }}
              onRowClick={params => setSelectedCountry(params.row.country)}
              autoHeight
            />
          ) : (
            <Box>
              <Button onClick={() => setSelectedCountry(null)} sx={{ mb: 2 }}>&larr; Back</Button>
              <DataGrid
                rows={countrySongs}
                columns={songCols}
                pageSize={songPageSize}
                rowsPerPageOptions={[5, 10, 25]}
                loading={loadingCountrySongs}
                onPageSizeChange={newSize => setSongPageSize(newSize)}
                autoHeight
              />
            </Box>
          )}
        </Box>
      )}

      {tabIndex === 2 && (
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <TextField
              label="Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={e => setDate(e.target.value)}
            />
            <Button variant="contained" onClick={handleSearch} disabled={!date || simLoading}>
              Search
            </Button>
          </Box>
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={simRows}
              columns={simCols}
              pageSize={simPageSize}
              rowsPerPageOptions={[5, 10, 25]}
              onPageSizeChange={newSize => setSimPageSize(newSize)}
              loading={simLoading}
              autoHeight
            />
          </Box>
        </Box>
      )}
    </Container>
  );
}
