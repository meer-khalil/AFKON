import express from 'express';
import { getFixtures } from './fixtures.controller.js';

const router = express.Router();

router.get('/', getFixtures);

export default router;
