import axios from '../../config/api.js'
import Team from './models/team.model.js';
// Import the model
import Statistics from './models/statistics.model.js';
import Country from './models/countries.model.js';

// Cache update interval (e.g., 24 hours in milliseconds)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export const getTeams = async (req, res) => {
  try {
    // Define valid fields and their expected data types
    const validFields = {
      id: 'number',
      name: 'string',
      code: 'string',
      search: 'string',
      country: 'string',
      league: 'number',
      season: 'number',
      venue: 'string',
    };

    // Validate filters
    const filters = { league: 6, season: 2021 };
    // TODO: Uncomment this validation if needed
    // for (const key in req.query) {
    //     if (validFields.hasOwnProperty(key)) {
    //         if (
    //             (typeof req.query[key] === validFields[key]) || 
    //             (!isNaN(req.query[key]) && validFields[key] === 'number')
    //         ) {
    //             filters[key] = req.query[key];
    //         }
    //     }
    // }

    // Check if data exists in the database and is fresh
    let teams = await Team.find({}).select('team lastUpdated');
    const isCacheExpired = !teams.length || (Date.now() - new Date(teams[0].lastUpdated).getTime()) > CACHE_DURATION;

    if (!teams.length || isCacheExpired) {
      // Build the API request URL based on filters
      let apiUrl = '/teams';
      const params = new URLSearchParams(filters).toString();
      apiUrl += `?${params}`;

      // Fetch teams data from the third-party API
      const response = await axios.get(apiUrl);

      if (response.status !== 200 || !response.data.response.length) {
        return res.status(404).json({ success: false, message: 'Teams not found in the third-party API' });
      }

      const fetchedTeamsData = response.data.response;
      console.log('teams: ', fetchedTeamsData);

      // Clear existing teams in the database matching the filters to avoid duplicates
      await Team.deleteMany({});

      // Save new teams data to the database with an updated timestamp
      const teamsToSave = fetchedTeamsData.map(team => ({
        ...team,
        lastUpdated: new Date()
      }));

      await Team.insertMany(teamsToSave);

      // Retrieve the newly saved teams
      teams = await Team.find({}).select('team');
      res.json({ success: true, data: teams });
    } else {
      // Return the teams data from the database
      console.log('teams served from cache');
      res.json({ success: true, data: teams });
    }


  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teams',
      error: error.message
    });
  }
};

// GET /api/statistics with query filters
export const getStatistics = async (req, res) => {
  try {
    // Extract and validate query parameters
    const filters = {};
    for (const key in req.query) {
      if (['league', 'team', 'season'].includes(key)) {
        filters[key] = req.query[key];
      }
    }

    // Find statistics based on filters
    const statistics = await Statistics.find(filters);
    res.status(200).json(statistics);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};


// Fetch and update seasons for a specific team
export const fetchAndUpdateSeasons = async (req, res) => {
  const { teamId } = req.query;

  try {
    // Check if the team exists and if the data is stale
    const existingTeam = await Team.findOne({ 'team.id': teamId }).select('seasons lastUpdated');

    console.log('check: ', existingTeam);
    
    if (existingTeam) {
      
      const lastUpdatedTime = new Date(existingTeam.lastUpdated).getTime();
      const isCacheValid = (Date.now() - lastUpdatedTime) < CACHE_DURATION;      
      
      if (isCacheValid && existingTeam.seasons && existingTeam.seasons.length > 0) {
        console.log('seasons served from cache');
        return res.status(200).json(existingTeam); // Return cached data
      }
    }

    // Fetch data from the third-party API if cache is stale or doesn't exist
    const response = await axios.get(`/teams/seasons`, { params: { team: teamId } });
    const seasons = response.data.response;

    // Update the team document with the fetched seasons and update the lastUpdated timestamp
    const updatedTeam = await Team.findOneAndUpdate(
      { 'team.id': teamId },
      {
        $set: {
          seasons,
          lastUpdated: new Date()
        }
      },
      { new: true, upsert: true } // Return updated document, create if not exists
    ).select('seasons');

    res.status(200).json({
      data: updatedTeam
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch or update seasons', details: error.message });
  }
};

// Fetch and add countries to the database
export const fetchAndAddCountries = async (req, res) => {
  try {
    // Fetch data from the third-party API
    const response = await axios.get('https://api.example.com/countries'); // Replace with actual API URL

    // Assuming response.data contains an array of country objects
    const countries = response.data;

    // Insert or update each country in the database
    await Country.bulkWrite(
      countries.map(country => ({
        updateOne: {
          filter: { code: country.code },
          update: { $set: country },
          upsert: true,
        },
      }))
    );

    res.status(200).json({ message: 'Countries added/updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch or update countries', details: error.message });
  }
};

// Fetch and update seasons for a specific team
export const fetchAndUpdateCoachs = async (req, res) => {
  const { teamId } = req.query;

  try {
    // Check if the team exists and if the data is stale
    const existingTeam = await Team.findOne({ 'team.id': teamId }).select('coach lastUpdated');

    if (existingTeam && existingTeam.lastUpdated) {
      const isCacheValid = Date.now() - new Date(existingTeam.lastUpdated).getTime() < CACHE_DURATION;
      if (isCacheValid && existingTeam.coach) {
        console.log('couch served from cache');
        return res.status(200).json(existingTeam); // Return cached data
      }
    }

    // Fetch data from the third-party API if cache is stale or doesn't exist
    const response = await axios.get(`/coachs`, { params: { team: teamId } });
    const coach = response.data.response[0];
    delete coach.career;

    // Update the team document with the fetched seasons and update the lastUpdated timestamp
    const updatedTeam = await Team.findOneAndUpdate(
      { 'team.id': teamId },
      {
        $set: {
          coach,
          lastUpdated: new Date()
        }
      },
      { new: true, upsert: true } // Return updated document, create if not exists
    ).select('coach');

    res.status(200).json({
      data: updatedTeam
    });
  } catch (error) {
    console.log('couch: ', error);
    
    res.status(500).json({ error: 'Failed to fetch or update couch', details: error.message });
  }
};