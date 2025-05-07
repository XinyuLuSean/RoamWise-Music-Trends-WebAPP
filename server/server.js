require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const dbTestRoutes = require('./routes/db_test'); 
const homeRoutes = require('./routes/home');
const artistTrendsRoutes = require('./routes/artist_trends');
const songTrendsRoutes = require('./routes/song_trends');
const countryTrendsRoutes = require('./routes/country_trends');
const realtimeRoutes = require('./routes/realtime');
const historyRoutes = require('./routes/history');


// Route registration
app.use('/api', dbTestRoutes);         
app.use('/api/home', homeRoutes);
app.use('/api/artist_trends', artistTrendsRoutes);
app.use('/api/song_trends', songTrendsRoutes);
app.use('/api/country_trends', countryTrendsRoutes);
// app.use('/api/realtime', realtimeRoutes);
// app.use('/api/history', historyRoutes);


// Root check
app.get('/', (req, res) => {
    res.send("Server is running!");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
