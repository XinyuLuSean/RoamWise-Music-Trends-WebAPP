import { BrowserRouter, Routes, Route } from "react-router-dom";
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { indigo, amber } from '@mui/material/colors';
import './App.css';

import HomePage from './pages/HomePage';
import SongTrendsPage from './pages/SongTrendsPage';
import CountryTrendsPage from './pages/CountryTrendsPage';
import ArtistTrendsPage from './pages/ArtistTrendsPage';
import TopPage from './pages/TopPage';


export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00C9A7' },
    secondary: { main: '#ccc' },
    background: {
      default: '#000',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#fff',
      secondary: '#ccc',
    }
  },
  typography: {
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    h2: {
      color: '#00C9A7',
      fontWeight: 500,
    },
    h4: {
      color: '#fff',
      fontWeight: 500,
    },
    h5: {
      color: '#ccc',
      fontWeight: 400,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        }
      }
    }
  }
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
          <Route path="/top" element={<TopPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;