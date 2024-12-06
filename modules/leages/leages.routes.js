import { Router } from 'express';
import { getLeagues } from './leages.controller.js';

const router = Router();

// Define the GET endpoint for leagues with optional query filters
router.get('/', getLeagues);

export default router;
