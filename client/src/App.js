import { BrowserRouter, Routes, Route } from "react-router-dom";
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { indigo, amber } from '@mui/material/colors';
import './App.css';

import HomePage from './pages/HomePage';
import SongTrendsPage from './pages/SongTrendsPage';
import CountryTrendsPage from './pages/CountryTrendsPage';
import ArtistTrendsPage from './pages/ArtistTrendsPage';

export const theme = createTheme({
  palette: {
    primary: indigo,
    secondary: amber,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/song-trends" element={<SongTrendsPage />} />
          <Route path="/country-trends" element={<CountryTrendsPage />} />
          <Route path="/artist-trends" element={<ArtistTrendsPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
