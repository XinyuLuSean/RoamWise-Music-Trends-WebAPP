import { BrowserRouter, Routes, Route } from "react-router-dom";
import CssBaseline                     from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme }  from '@mui/material/styles';
import { indigo, amber } from '@mui/material/colors'
import './App.css';

import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import TrendsPage from './pages/TrendsPage';

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
          <Route path="/search" element={<SearchPage />} />
          <Route path="/trends" element={<TrendsPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
