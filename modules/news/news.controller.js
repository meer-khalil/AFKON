import mongoose from 'mongoose';
import { fetchNews } from './news.service.js';
import News from './news.model.js'; // Import your Mongoose model

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const getNews = async (req, res) => {
  try {
    // Check if data exists and is still fresh
    let latestNews = await News.findOne().sort({ lastUpdated: -1 }); // Fetch the latest document

    console.log('query1: ', latestNews);
    
    if (latestNews && Date.now() - new Date(latestNews.lastUpdated).getTime() < CACHE_DURATION) {
      // Return cached data from MongoDB
      console.log('news served from cache');
      return res.json({ success: true, data: latestNews.articles });
    }

    // Fetch fresh data from the external API
    const newsData = await fetchNews();
    console.log('fetched News: ', newsData.length);
    
    // Update MongoDB with new data, replacing old data
    await News.deleteMany({}); // Clear old data
    await News.create({ articles: newsData, lastUpdated: new Date() }); // Save new data

    latestNews = await News.findOne().sort({ lastUpdated: -1 }); // Fetch the latest document

    res.json({ success: true, data: latestNews.articles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching news', error: error.message });
  }
};
