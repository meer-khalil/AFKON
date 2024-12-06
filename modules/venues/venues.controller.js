const Venue = require('../models/venues.model');
const axios = require('axios');

// Get venues based on query parameters
exports.getVenues = async (req, res) => {
  try {
    const { id, name, search, city, country } = req.query;

    // Build filter object based on provided query parameters
    const filter = {};

    if (id) filter.id = id;
    if (name) filter.name = { $regex: name, $options: 'i' }; // case-insensitive search
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { country: { $regex: search, $options: 'i' } },
    ];
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (country) filter.country = { $regex: country, $options: 'i' };

    const venues = await Venue.find(filter);

    if (venues.length === 0) {
      return res.status(404).json({ message: 'No venues found matching the query' });
    }

    res.status(200).json(venues);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch venues', details: error.message });
  }
};

// Fetch venues from third-party API and store in DB
exports.fetchVenuesFromAPI = async () => {
  try {
    const response = await axios.get('https://api.example.com/venues'); // Replace with actual third-party API URL

    const venues = response.data;

    // Insert or update each venue in the database
    await Venue.bulkWrite(
      venues.map(venue => ({
        updateOne: {
          filter: { id: venue.id },
          update: { $set: venue },
          upsert: true,
        },
      }))
    );
  } catch (error) {
    console.error('Error fetching venues from API:', error.message);
  }
};
