import axios from '../../config/api.js';
import Team from '../team/models/team.model.js'; // Assuming a Team model exists
import Season from './models/seasons.model.js';
import Player from './models/players.model.js'; // Assuming a Player model exists
import Squad from './models/squad.model.js';
import squadModel from './models/squad.model.js';


let CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Get player by search term, player id, or pagination
export const getPlayerProfile = async (req, res) => {
  try {
    const { search, playerId, page = 1 } = req.query;
    const limit = 10;

    if (!playerId && !search) {
      return res.status(400).json({ message: 'Player ID or search query is required.' });
    }

    // Build query filter
    let filter = {};
    if (search) {
      filter['player.name'] = { $regex: search, $options: 'i' };
    } else if (playerId) {
      filter['player.id'] = playerId;
    }

    // Fetch player data from the database
    let players = await Player.findOne(filter).select('player lastUpdated')
      // .skip((page - 1) * limit)
      // .limit(limit);

    // Check if cache data exists and is fresh
    if (players && Date.now() - players.lastUpdated?.getTime() < CACHE_EXPIRY) {
      console.log('players served from cache');
      return res.status(200).json(players);
    }

    const params = {};

    if (playerId) {
      params.player = playerId
    }
    // Fetch fresh data from the third-party API

    const apiResponse = await axios.get('/players/profiles', {
      params: { player: playerId },
    });;


    if (!apiResponse.data || !apiResponse.data.response.length) {
      return res.status(404).json({ message: 'No player found from the third-party source.' });
    }

    // Save or update the data in the database
    const playerData = apiResponse.data.response[0];
    await Player.findOneAndUpdate(
      { 'player.id': playerData.player.id },
      {player: playerData.player, lastUpdated: new Date()},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Fetch the updated data from the database
    players = await Player.findOne(filter).select('player lastUpdated')
      // .skip((page - 1) * limit)
      // .limit(limit);

    res.status(200).json(players);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player profile', details: error.message });
  }
};


export const getPlayerSeasons = async (req, res) => {
  try {
    const playerId = req.query.id;

    if (!playerId) {
      return res.status(400).json({
        success: false,
        message: 'Player ID is required',
      });
    }

    // Fetch player details from the database
    let player = await Player.findById(playerId);

    // Check if player exists
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found',
      });
    }

    // Check if seasons data is missing or outdated
    const currentTime = new Date().getTime();
    if (!player.seasons || !player.lastUpdated || (currentTime - player.lastUpdated) > CACHE_DURATION) {

      // Fetch updated seasons from the third-party API
      const response = await axios.get(`/players/seasons`, {
        params: {
          player: playerId
        }
      });
      const seasons = response.data.response;

      // Update player data with new seasons
      player.seasons = seasons;
      player.lastUpdated = currentTime; // Update the timestamp

      // Save the player with updated data
      await player.save();
    }

    res.json({
      success: true,
      data: {
        player,
        seasons: player.seasons,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching player seasons',
      error: error.message,
    });
  }
};

export const getPlayerStatistics = async (req, res) => {
  try {
    const { season, playerId, teamId, leagueId, page } = req.query;

    // Validate required parameters
    if (!season) {
      return res.status(400).json({ success: false, message: 'Season is required' });
    }
    if (!playerId && !teamId) {
      return res.status(400).json({ success: false, message: 'Along with season, either playerId or teamId is required' });
    }

    // Check if data already exists in the database and is still fresh
    let playerData = await Player.findOne({ 'player.id': playerId, 'statistics.league.season': season });
    console.log('player: ', playerData);
    // return res.status(200).json('hello')
    const isCacheExpired = !playerData || (Date.now() - new Date(playerData.lastUpdated).getTime()) > CACHE_EXPIRY;

    if (!playerData || isCacheExpired) {
      // Build the API request URL
      let apiUrl = `/players?season=${season}`;
      if (playerId) apiUrl += `&id=${playerId}`;
      if (teamId) apiUrl += `&team=${teamId}`;
      if (leagueId) apiUrl += `&league=${leagueId}`;
      if (page) apiUrl += `&page=${page}`;

      // Fetch player statistics from the third-party API
      const response = await axios.get(apiUrl);

      console.log(response.data);

      if (response.status !== 200 || !response.data.response.length) {
        return res.status(404).json({ success: false, message: 'Player data not found in the third-party API' });
      }

      const fetchedPlayerData = response.data.response[0];

      // Create or update the player record in the database
      if (!playerData) {
        playerData = new Player({
          player: fetchedPlayerData.player,
          statistics: fetchedPlayerData.statistics,
          lastUpdated: new Date(),
        });
      } else {
        playerData.statistics = fetchedPlayerData.statistics;  // Update existing stats
        playerData.lastUpdated = new Date();
      }

      await playerData.save();  // Save to the database
    } else {
      console.log('statistics served from cache');
    }

    // Return the player data from the database
    res.json({ success: true, data: playerData });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching or saving player statistics', error: error.message });
  }
};


// Controller function to fetch seasons data and save it to the database
export const fetchAndSavePlayerSeasons = async (req, res) => {
  try {
    const { player, season, league, team, page = 1 } = req.query;

    // Validate required parameters
    if (!season || (!player && !team)) {
      return res.status(400).json({
        success: false,
        message: 'Season is required, and either player or team is required.',
      });
    }

    // Fetch player by player parameter (search player by player name or id)
    let playerRecord;
    if (player) {
      playerRecord = await Player.findOne({ name: player }); // Assuming we are searching by player name
      if (!playerRecord) {
        return res.status(404).json({
          success: false,
          message: 'Player not found in the database.',
        });
      }
    }

    // Fetch team by team ID if provided
    let teamRecord;
    if (team) {
      teamRecord = await Team.findById(team);
      if (!teamRecord) {
        return res.status(404).json({
          success: false,
          message: 'Team not found in the database.',
        });
      }
    }

    // Build the query for third-party API
    const apiUrl = `https://api.sportsdata.io/v4/soccer/scores/json/Players/${playerRecord?._id || team}/Seasons`;
    const apiParams = {
      league,
      season,
      page,
    };

    // Fetch data from third-party API
    const response = await axios.get(apiUrl, {
      params: apiParams,
      headers: {
        'Authorization': `Bearer YOUR_API_KEY`, // Replace with your API key
      },
    });

    const { data } = response;

    // Check if seasons data already exists
    let existingSeasons = await Season.findOne({ playerId: playerRecord._id, teamId: teamRecord?._id });
    if (existingSeasons) {
      return res.status(200).json({
        success: true,
        message: 'Seasons data already exists for this player and team.',
        data: existingSeasons,
      });
    }

    // Prepare data to save in the database
    const seasonsData = {
      playerId: playerRecord._id,
      teamId: teamRecord?._id,
      seasons: data.seasons || [], // Assuming 'data.seasons' is an array of seasons
    };

    // Save seasons data to the database
    const newSeason = new Season(seasonsData);
    await newSeason.save();

    return res.status(201).json({
      success: true,
      message: 'Seasons data saved successfully.',
      data: newSeason,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching or saving player seasons data.',
      error: error.message,
    });
  }
};


export const getTeamSquad = async (req, res) => {
  try {
    const { player, team } = req.query;

    if (!team) {
      return res.status(400).json({ success: false, message: 'Team ID is required' });
    }

    // Check if the squad is already in the database
    let squad = await Squad.findOne({ 'team.id': team });

    // Check if the squad is missing or outdated
    const currentTime = new Date().getTime();
    if (!squad || (currentTime - squad.lastUpdated.getTime()) > CACHE_EXPIRY) {
      // Fetch updated squad from the third-party API
      const params = {};
      if (team) {
        params.team = team
      }

      const response = await axios.get(`/players/squads`, { params });
      const fetchedSquad = response.data.response[0]; // Assuming this format from API

      // Prepare the squad data
      const newSquadData = {
        team: {
          id: fetchedSquad.team.id,
          name: fetchedSquad.team.name,
          logo: fetchedSquad.team.logo,
        },
        players: fetchedSquad.players,
        lastUpdated: new Date(),
      };

      // Update or create the squad in the database
      if (squad) {
        squad.players = newSquadData.players;
        squad.lastUpdated = new Date();
      } else {
        squad = new Squad(newSquadData);
      }
      await squad.save();
    } else {
      console.log('squad served from cache');
    }

    // Filter players if the 'player' query parameter is provided
    const filteredPlayers = player
      ? squad.players.filter((p) => p.id === parseInt(player))
      : squad.players;

    res.json({
      success: true,
      data: {
        team: squad.team,
        players: filteredPlayers,
      },
    });
  } catch (error) {
    console.log('squard: ', error);
    
    res.status(500).json({
      success: false,
      message: 'Error fetching team squad',
      error: error.message,
    });
  }
};

export const getAllPlayers = async (req, res) => {

  try {
    const players = await Squad.find({});
    let data = []
    players.forEach((p) => {
      data = [...data, ...p.players]
    })
    res.status(200).json({
      success: true,
      data
    })
  } catch (error) {
    console.log('All Players: ', error);
    
    res.status(500).json({
      success: false,
      message: 'Error fetching team squad',
      error: error.message,
    });
  }
};