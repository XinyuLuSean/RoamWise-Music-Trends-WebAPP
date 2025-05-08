// src/pages/SongTrendsPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import ChoroplethMap from './ChoroplethMap';
const config = require('../config.json');

export default function SongTrendsPage() {
  const navigate = useNavigate();

  // 原始表格数据与加载状态
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // 每页显示行数
  const [pageSize, setPageSize] = useState(50);

  // 视图模式：0 = 表格，1 = 地图
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (_e, idx) => setTabIndex(idx);

  useEffect(() => {
    fetch(
      `http://${config.server_host}:${config.server_port}/api/song_trends/top-country-per-song`
    )
      .then(res => res.json())
      .then(data => {
        setRows(
          data.map((r, i) => ({
            id: i,
            song_id: r.song_id,
            title: r.title,
            top_country: r.top_country.toUpperCase(),
            chart_appearances: Number(r.chart_appearances)
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 聚合每个国家的 appearances，为地图准备数据
  const mapData = useMemo(() => {
    const counts = {};
    rows.forEach(({ top_country, chart_appearances }) => {
      counts[top_country] = (counts[top_country] || 0) + chart_appearances;
    });
    return Object.entries(counts).map(([country, album_count], i) => ({
      id: i,
      country,
      album_count
    }));
  }, [rows]);

  // DataGrid 列定义
  const columns = [
    { field: 'song_id', headerName: 'Song ID', flex: 1 },
    { field: 'title', headerName: 'Title', flex: 2 },
    { field: 'top_country', headerName: 'Top Country', flex: 1 },
    {
      field: 'chart_appearances',
      headerName: 'Appearances',
      type: 'number',
      flex: 1
    }
  ];

  return (
    <Container>
      <Button
        variant="outlined"
        onClick={() => navigate('/')}
        sx={{ mt: 2, mb: 2 }}
      >
        ← Back to Home
      </Button>

      <Typography variant="h4" gutterBottom>
        Song Trends
      </Typography>

      {/* 两个 Tab：表格视图 & 地图视图 */}
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab label="Top Country for Each Song" />
        <Tab label="Appearances by Country" />
      </Tabs>

      {/* === Tab 0: 表格 === */}
      {tabIndex === 0 && (
        <Box sx={{ mb: 4 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={pageSize}
            rowsPerPageOptions={[25, 50, 100]}
            onPageSizeChange={newSize => setPageSize(newSize)}
            loading={loading}
            components={{ Toolbar: GridToolbar }}
            autoHeight
          />
        </Box>
      )}

      {/* === Tab 1: 地图 === */}
      {tabIndex === 1 && (
        <>
          <Typography variant="h6" gutterBottom>
            Appearances by Country (Choropleth)
          </Typography>
          <Box sx={{ height: 400, width: '100%' }}>
            <ChoroplethMap data={mapData} />
          </Box>
        </>
      )}
    </Container>
  );
}