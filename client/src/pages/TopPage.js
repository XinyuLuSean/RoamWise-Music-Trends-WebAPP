import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import './TopPage.css'; // 加载样式

const config = require('../config.json');

export default function TopPage() {
  const [selectedTab, setSelectedTab] = useState('songs');

  const [topSongs, setTopSongs] = useState([]);
  const [topAlbums, setTopAlbums] = useState([]);
  const [topPlaylists, setTopPlaylists] = useState([]);
  const [topRecentPlaylists, setTopRecentPlaylists] = useState([]);
  const [loadingRecentPlaylists, setLoadingRecentPlaylists] = useState(true);

  const [loadingSongs, setLoadingSongs] = useState(true);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const navigate = useNavigate();
  const apiBase = `http://${config.server_host}:${config.server_port}/api/home`;

  useEffect(() => {
    fetch(`${apiBase}/top-songs`)
      .then(res => res.json())
      .then(data => {
        setTopSongs(data.map((row, i) => ({ id: i, ...row })));
      })
      .catch(console.error)
      .finally(() => setLoadingSongs(false));

    fetch(`${apiBase}/top-albums`)
      .then(res => res.json())
      .then(data => {
        setTopAlbums(data.map((row, i) => ({
          id: i,
          album_title: row.album_title,
          artist_name: row.artist_name,
          avg_album_popularity: Number(row.avg_album_popularity),
          total_songs: Number(row.total_songs)
        })));
      })
      .catch(console.error)
      .finally(() => setLoadingAlbums(false));

    fetch(`${apiBase}/top-playlists`)
      .then(res => res.json())
      .then(data => {
        setTopPlaylists(data.map((row, i) => ({
          id: i,
          playlist_name: row.playlist_name,
          total_playlist_popularity: Number(row.total_playlist_popularity),
          total_songs: Number(row.total_songs)
        })));
      })
      .catch(console.error)
      .finally(() => setLoadingPlaylists(false));

      fetch(`${apiBase}/playlist-recent-hits`)
        .then(res => res.json())
        .then(data => {
          setTopRecentPlaylists(data.map((row, i) => ({
            id: i,
            playlist_name: row.name,
            recent_hit_rate: Number(row.recent_hit_rate)
        })));
        })
        .catch(console.error)
        .finally(() => setLoadingRecentPlaylists(false));
  }, []);

  const songCols = [
    { field: 'title', headerName: '🎵 Song Title', flex: 2 },
    { field: 'popularity_score', headerName: 'Popularity', type: 'number', flex: 1 }
  ];

  const albumCols = [
    { field: 'album_title', headerName: '💿 Album Title', flex: 2 },
    { field: 'artist_name', headerName: 'Artist', flex: 2 },
    { field: 'avg_album_popularity', headerName: 'Avg Popularity', type: 'number', flex: 1 },
    { field: 'total_songs', headerName: 'Total Songs', type: 'number', flex: 1 }
  ];

  const playlistCols = [
    { field: 'playlist_name', headerName: '📻 Playlist Name', flex: 2 },
    { field: 'total_playlist_popularity', headerName: 'Total Popularity', type: 'number', flex: 1 },
    { field: 'total_songs', headerName: 'Total Songs', type: 'number', flex: 1 }
  ];

  const playlistRecentCols = [
    { field: 'playlist_name', headerName: '📻 Playlist Name', flex: 2 },
    { field: 'recent_hit_rate', headerName: '1-Year Hit Rate', type: 'number', flex: 1 }
  ];

  const renderTable = () => {
    const commonProps = {
      autoHeight: true,
      components: { Toolbar: GridToolbar },
      pageSize: 10,
      rowsPerPageOptions: [5, 10],
    };

    if (selectedTab === 'songs') {
      return <DataGrid {...commonProps} rows={topSongs} columns={songCols} loading={loadingSongs} />;
    }
    if (selectedTab === 'albums') {
      return <DataGrid {...commonProps} rows={topAlbums} columns={albumCols} loading={loadingAlbums} />;
    }
    if (selectedTab === 'playlists') {
      return <DataGrid {...commonProps} rows={topPlaylists} columns={playlistCols} loading={loadingPlaylists} />;
    }
    if (selectedTab === 'playlists_recent') {
      return (
        <DataGrid
          {...commonProps}
          rows={topRecentPlaylists}
          columns={playlistRecentCols}
          loading={loadingRecentPlaylists}
        />
      );
    }
    return null;
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* 左侧旋转菜单 */}
      <Box className="menu">
        {[
          { key: 'songs', label: '🎵 Top Songs' },
          { key: 'albums', label: '💿 Top Albums' },
          { key: 'playlists', label: '📻 Top Playlists' },
          { key: 'playlists_recent', label: '📈 Playlists (1-yr Hits)' },
        ].map(({ key, label }, index) => (
          <div
            key={key}
            className={`menu-item color-${index} ${selectedTab === key ? 'active' : ''}`}
            onClick={() => setSelectedTab(key)}
          >
            {label}
          </div>
        ))}
      </Box>

      {/* 右侧内容展示区 */}
      <Box sx={{ flex: 1, p: 4 }}>
        {/* ✅ Back button 添加在这里 */}
        <Button
          variant="outlined"
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          ← Back to Home
        </Button>

        <Typography
            variant="h4"
            gutterBottom
            sx={{ color: '#1abc9c', fontWeight: 'bold' }} // ✅ 添加自定义颜色
            >
                Top Music Overview
        </Typography>
        <Paper elevation={3} sx={{ p: 2 }}>
          {renderTable()}
        </Paper>
      </Box>
    </Box>
  );
}