import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { indigo, amber } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";
import './App.css';

import NavBar from './components/NavBar';
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
        <NavBar />
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
