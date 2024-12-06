import axios from 'axios';

// Create an Axios instance with default configuration
const apiClient = axios.create({
  baseURL: `https://${process.env.FOOTBALL_API_HOST}`, // Replace with your third-party API base URL
  headers: {
    'x-rapidapi-host': process.env.FOOTBALL_API_HOST,
    'x-rapidapi-key': process.env.FOOTBALL_API_KEY
  }
});

export default apiClient;
