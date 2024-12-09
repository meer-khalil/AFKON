import { Router } from 'express';
import { getTeams, getStatistics, fetchAndUpdateSeasons, fetchAndAddCountries, fetchAndUpdateCoachs } from './team.controller.js';

const router = Router();

// Define the GET endpoint for fetching teams
router.get('/', getTeams);

// Route to get statistics
router.get('/statistics', getStatistics);

// Route to fetch and update seasons for a team
router.get('/seasons', fetchAndUpdateSeasons);

router.get('/coach', fetchAndUpdateCoachs);

// Route to fetch and add countries
router.get('/api/countries/fetch', fetchAndAddCountries);

export default router;