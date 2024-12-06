import axios from 'axios';

const NEWS_API_URL = 'https://newsdata.io/api/1/news';
const API_KEY = 'pub_60360f914ef2f383bd9fd2c072c5f22bf121b';  // Replace this with environment variable for security

// Function to fetch live news data
export const fetchNews = async () => {
  try {
    const response = await axios.get(NEWS_API_URL, {
      params: {
        apikey: API_KEY,
        q: 'football',
        country: 'za',  // South Africa
        language: 'en',
        category: 'sports'
      }
    });

    // Extract relevant data from the API response
    
    return response.data.results;
  } catch (error) {
    console.error('Error fetching news:', error.message);

    // Fallback to mock data if the API call fails
    return [
      { id: 1, title: 'Breaking News: Express Modular Design', content: 'Learn how to structure your Express apps.' },
      { id: 2, title: 'JavaScript ES Modules', content: 'Discover the power of ECMAScript modules in modern apps.' }
    ];
  }
};
