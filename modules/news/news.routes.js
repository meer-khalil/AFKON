import { Router } from 'express';
import { getNews } from './news.controller.js';

const router = Router();

// Define the GET endpoint for news
router.get('/', getNews);

export default router;
