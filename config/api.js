import axios from 'axios';

// Create an Axios instance with default configuration
const apiClient = axios.create({
  baseURL: 'https://v3.football.api-sports.io', // Replace with your third-party API base URL
//   headers: {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer f22a9d427bce2ffa69a33c7db27f8f3e`, // Replace with your actual API key
//   }
  headers: {
    'x-rapidapi-host': 'v3.football.api-sports.io',
    'x-rapidapi-key': 'f22a9d427bce2ffa69a33c7db27f8f3e'
  }
});

export default apiClient;
