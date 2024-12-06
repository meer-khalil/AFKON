import Standing from '../models/standings.model.js';

// Get standings by league, season, and optionally by team
export const getStandings = async (req, res) => {
  try {
    const { league, season, team } = req.query;

    if (!league || !season) {
      return res.status(400).json({ message: 'Both "league" and "season" query parameters are required.' });
    }

    const filter = {
      'league.id': league,
      'league.season': season,
    };

    if (team) {
      filter['standings.team.id'] = team;
    }

    const standings = await Standing.findOne(filter);

    if (!standings) {
      return res.status(404).json({ message: 'No standings found for the given parameters.' });
    }

    res.status(200).json(standings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch standings', details: error.message });
  }
};
