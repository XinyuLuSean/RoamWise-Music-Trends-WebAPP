require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const dbTestRoutes = require('./routes/db_test'); 
// Route imports (modular by page)
const homeRoutes = require('./routes/home');
const trendsRoutes = require('./routes/trends');
const artistsRoutes = require('./routes/artists');
const searchRoutes = require('./routes/search');
const realtimeRoutes = require('./routes/realtime');
const historyRoutes = require('./routes/history');


// Route registration
app.use('/api', dbTestRoutes);         
app.use('/api/home', homeRoutes);
app.use('/api/trends', trendsRoutes);
app.use('/api/artists', artistsRoutes);   
// app.use('/api/search', searchRoutes);
// app.use('/api/realtime', realtimeRoutes);
// app.use('/api/history', historyRoutes);


// Root check
app.get('/', (req, res) => {
    res.send("Server is running!");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
