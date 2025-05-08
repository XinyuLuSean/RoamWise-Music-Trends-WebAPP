import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Container, Typography, Button } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
const config = require('../config.json');

export default function TopCountryPerSongPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `http://${config.server_host}:${config.server_port}/api/song_trends/top-country-per-song`
    )
      .then(res => res.json())
      .then(data => {
        setRows(data.map((r, i) => ({ id: i, ...r })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { field: 'song_id', headerName: 'Song ID', flex: 1 },
    { field: 'title', headerName: 'Title', flex: 2 },
    { field: 'top_country', headerName: 'Top Country', flex: 1 },
    { field: 'chart_appearances', headerName: 'Appearances', type: 'number', flex: 1 }
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
        Song Trends
      </Typography>
      <Typography variant="h5" gutterBottom>
        Top Country for Each Song
      </Typography>
      <div style={{ width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 25]}
          loading={loading}
          components={{ Toolbar: GridToolbar }}
          autoHeight
        />
      </div>
    </Container>
  );
}
