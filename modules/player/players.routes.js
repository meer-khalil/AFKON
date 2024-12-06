import express from 'express';
import { getAllPlayers, getPlayerProfile, getPlayerStatistics, getTeamSquad } from './players.controller.js';

const router = express.Router();

// Route for fetching player profile
router.get('/profiles', getPlayerProfile);

// Route for fetching and updating player statistics
router.get('/statistics', getPlayerStatistics);

// Route for fetching and updating player statistics
router.get('/teams', getPlayerStatistics);
router.get('/squads', getTeamSquad);
router.get('/topscorers', getPlayerStatistics);
router.get('/topassists', getPlayerStatistics);
router.get('/topyellowcards', getPlayerStatistics);
router.get('/topredcards', getPlayerStatistics);

// get all players of the league
router.get('/all', getAllPlayers);

export default router;
