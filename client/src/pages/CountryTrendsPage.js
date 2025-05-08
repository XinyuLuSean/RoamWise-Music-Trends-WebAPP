// src/pages/CountryTrendsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import ChoroplethMap from './ChoroplethMap';
const config = require('../config.json');

export default function CountryTrendsPage() {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);

  // === Album counts ===
  const [albumCounts, setAlbumCounts] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  // === Top songs ===
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countrySongs, setCountrySongs] = useState([]);
  const [loadingCountrySongs, setLoadingCountrySongs] = useState(false);
  const [songPageSize, setSongPageSize] = useState(10);

  // === Similarity ===
  const [date, setDate] = useState('');
  const [simRows, setSimRows] = useState([]);
  const [simLoading, setSimLoading] = useState(false);
  const [simPageSize, setSimPageSize] = useState(10);

  // === Representative playlists ===
  const [repRows, setRepRows] = useState([]);
  const [repLoading, setRepLoading] = useState(true);

  // 1) 初始抓取
  useEffect(() => {
    // Album counts
    fetch(`http://${config.server_host}:${config.server_port}/api/country_trends/albums-by-country`)
      .then(r => r.json())
      .then(data =>
        setAlbumCounts(
          data.map((r, i) => ({
            id: i,
            country: r.country.toUpperCase(),
            album_count: Number(r.album_count)
          }))
        )
      )
      .catch(console.error)
      .finally(() => setLoadingAlbums(false));

    // Top-songs 可选国家
    fetch(`http://${config.server_host}:${config.server_port}/api/country_trends/countries`)
      .then(r => r.json())
      .then(data =>
        setCountries(data.map((c, i) => ({ id: i, country: c })))
      )
      .catch(console.error)
      .finally(() => setLoadingCountries(false));

    // Rep-playlists
    fetch(`http://${config.server_host}:${config.server_port}/api/country_trends/rep-playlists`)
      .then(r => r.json())
      .then(data =>
        setRepRows(
          data.map((r, i) => ({
            id: i,
            country: r.country.toUpperCase(),
            playlist_id: r.playlist_id,
            name: r.name,
            hit_rate: Number(r.hit_rate)
          }))
        )
      )
      .catch(console.error)
      .finally(() => setRepLoading(false));
  }, []);

  // 2) 拉某国 Top Songs
  const fetchSongsByCountry = country => {
    setLoadingCountrySongs(true);
    fetch(
      `http://${config.server_host}:${config.server_port}/api/country_trends/top-songs-by-country?country=${encodeURIComponent(
        country
      )}`
    )
      .then(r => r.json())
      .then(data =>
        setCountrySongs(
          data.map((r, i) => ({
            id: i,
            rank: Number(r.rank),
            song_id: r.song_id,
            title: r.title,
            popularity_score: Number(r.popularity_score)
          }))
        )
      )
      .catch(console.error)
      .finally(() => setLoadingCountrySongs(false));
  };

  useEffect(() => {
    if (selectedCountry) fetchSongsByCountry(selectedCountry);
  }, [selectedCountry]);

  // 3) 相似度查询
  const handleSearch = () => {
    if (!date) return;
    setSimLoading(true);
    fetch(
      `http://${config.server_host}:${config.server_port}/api/country_trends/jaccard_similarity?date=${date}`
    )
      .then(r => r.json())
      .then(data =>
        setSimRows(
          data.map((r, i) => ({
            id: i,
            c1: r.c1,
            c2: r.c2,
            jaccard_sim: Number(r.jaccard_sim)
          }))
        )
      )
      .catch(console.error)
      .finally(() => setSimLoading(false));
  };

  // —— 列定义 ——
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
      valueFormatter: ({ value }) => value.toFixed(4)
    }
  ];
  const repCols = [
    { field: 'country', headerName: 'Country', flex: 1 },
    { field: 'playlist_id', headerName: 'Playlist ID', flex: 1 },
    { field: 'name', headerName: 'Name', flex: 2 },
    { field: 'hit_rate', headerName: 'Hit Rate', type: 'number', flex: 1 }
  ];

  return (
    <Container>
      {/* Back to Home */}
      <Button
        variant="contained"
        onClick={() => navigate('/')}
        sx={{ mt: 2, mb: 2 }}
      >
        ← Back to Home
      </Button>

      <Typography variant="h3" gutterBottom>
        Country Trends
      </Typography>

      {/* 主 Tab 列表 */}
      <Tabs
        value={tabIndex}
        onChange={(_, i) => setTabIndex(i)}
        sx={{ mb: 2 }}
      >
        <Tab label="Album Counts" />
        <Tab label="Album Counts Map" />
        <Tab label="Top Songs" />
        <Tab label="Similarity" />
        <Tab label="Rep Playlist" />
        <Tab label="Rep Playlist Map" />
      </Tabs>

      {/* Tab 0: Album Counts 表格 */}
      {tabIndex === 0 && (
        <Box sx={{ mb: 4 }}>
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

      {/* Tab 1: Album Counts 地图 */}
      {tabIndex === 1 && (
        <>
          <Typography variant="h6" gutterBottom>
            Album Counts by Country (Choropleth)
          </Typography>
          <Box sx={{ height: 400, width: '100%', mb: 4 }}>
            <ChoroplethMap data={albumCounts} />
          </Box>
        </>
      )}

      {/* Tab 2: Top Songs */}
      {tabIndex === 2 && (
        <Box>
          {!selectedCountry ? (
            <DataGrid
              rows={countries}
              columns={[{ field: 'country', headerName: 'Country', flex: 1 }]}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 25]}
              loading={loadingCountries}
              components={{ Toolbar: GridToolbar }}
              onRowClick={p => setSelectedCountry(p.row.country)}
              autoHeight
            />
          ) : (
            <Box>
              <Button onClick={() => setSelectedCountry(null)} sx={{ mb: 2 }}>
                ← Back
              </Button>
              <DataGrid
                rows={countrySongs}
                columns={songCols}
                pageSize={songPageSize}
                rowsPerPageOptions={[5, 10, 25]}
                onPageSizeChange={size => setSongPageSize(size)}
                loading={loadingCountrySongs}
                autoHeight
              />
            </Box>
          )}
        </Box>
      )}

      {/* Tab 3: Similarity */}
      {tabIndex === 3 && (
        <Box>
          <Box display="flex" gap={2} mb={2}>
            <TextField
              label="Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={e => setDate(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={!date || simLoading}
            >
              Search
            </Button>
          </Box>
          <DataGrid
            rows={simRows}
            columns={simCols}
            pageSize={simPageSize}
            rowsPerPageOptions={[5, 10, 25]}
            onPageSizeChange={size => setSimPageSize(size)}
            loading={simLoading}
            autoHeight
            sx={{ mb: 4 }}
          />
        </Box>
      )}

      {/* Tab 4: Rep Playlist 表格 */}
      {tabIndex === 4 && (
        <Box sx={{ mb: 4 }}>
          <DataGrid
            rows={repRows}
            columns={repCols}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25]}
            loading={repLoading}
            components={{ Toolbar: GridToolbar }}
            autoHeight
            onRowClick={params =>
              window.open(
                `https://open.spotify.com/playlist/${params.row.playlist_id}`,
                '_blank'
              )
            }
          />
        </Box>
      )}

      {/* Tab 5: Rep Playlist 地图 */}
      {tabIndex === 5 && (
        <>
          <Typography variant="h6" gutterBottom>
            Rep Playlist Hit Rate by Country (Choropleth)
          </Typography>
          <Box sx={{ height: 400, width: '100%' }}>
            <ChoroplethMap
              data={repRows.map(r => ({
                country: r.country,
                album_count: r.hit_rate
              }))}
            />
          </Box>
        </>
      )}
    </Container>
  );
}