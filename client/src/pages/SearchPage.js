import { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
const config = require('../config.json');

export default function SearchPage() {
  const [date, setDate]       = useState('');
  const [rows, setRows]       = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (!date) return;
    setLoading(true);

    fetch(
      `http://${config.server_host}:${config.server_port}` +
      `/api/search/jaccard_similarity?date=${date}`
    )
      .then(res => res.json())
      .then(data => {
        const withId = data.map((r, i) => ({ id: i, ...r }));
        setRows(withId);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const columns = [
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
      <Typography variant="h4" gutterBottom>
        Country Similarity by Date
      </Typography>

      <Box display="flex" alignItems="center" gap={2} mb={2}>
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
          disabled={!date || loading}
        >
          Search
        </Button>
      </Box>

      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 25]}
          onPageSizeChange={newSize => setPageSize(newSize)}
          autoHeight
          loading={loading}
        />
      </div>
    </Container>
  );
}