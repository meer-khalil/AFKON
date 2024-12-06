import express from 'express';
import { getStandings } from './standings.controller.js';

const router = express.Router();

// Route for fetching standings
router.get('/api/standings', getStandings);

export default router;
