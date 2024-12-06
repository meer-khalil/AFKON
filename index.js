import express from 'express';
import connectDB from './config/db.js';
import newsRoutes from './modules/news/news.routes.js';
import leagesRoutes from './modules/leages/leages.routes.js';
import teamsRoutes from './modules/team/team.routes.js';
import playersRoutes from './modules/player/players.routes.js';
import fixturesRoutes from './modules/fixtures/fixtures.routes.js';

const app = express();
const PORT = process.env.PORT || 8080;

connectDB();

// Middleware
app.use(express.json());

// Use the news module routes
app.use('/api/news', newsRoutes);
app.use('/api/leages', leagesRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/fixtures', fixturesRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
