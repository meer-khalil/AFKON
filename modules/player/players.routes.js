import express from 'express';
import { getAllPlayers, getPlayerProfile, getPlayerStatistics, getTeamSquad, getPlayerCurrentTeam } from './players.controller.js';

const router = express.Router();


router.get('/profiles', getPlayerProfile);
router.get('/statistics', getPlayerStatistics);
router.get('/teams', getPlayerStatistics);
router.get('/squads', getTeamSquad);
router.get('/current-fixtures', getPlayerCurrentTeam);
router.get('/topscorers', getPlayerStatistics);
router.get('/topassists', getPlayerStatistics);
router.get('/topyellowcards', getPlayerStatistics);
router.get('/topredcards', getPlayerStatistics);

// get all players of the league
router.get('/all', getAllPlayers);

export default router;
