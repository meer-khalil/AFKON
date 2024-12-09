import axios from '../../config/api.js'
import Fixture from './fixtures.model.js';


export const getFixtures = async (req, res) => {
    try {
        const { live } = req.query;
        const CACHE_DURATION = live === 'all' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 15 seconds for live, 1 hour otherwise

        const queryFilters = buildQueryFiltersForSchema(req.query);  // Helper function to handle allowed filters

        
        const LIVE_DURATION = 7200;  // 2 hours in seconds
        const currentTimestamp = Math.floor(Date.now() / 1000);  // Current Unix timestamp

        // Check for existing fixtures in the database
        let fixture;
        if (live == 'all') {
            fixture = await Fixture.find({
                $and: [
                  { 'fixture.timestamp': { $lte: currentTimestamp } },  // Match started
                  { 'fixture.timestamp': { $gte: currentTimestamp - LIVE_DURATION } }  // Still ongoing
                ]
              });            
        } else {
            const queryFilters = buildQueryFiltersForSchema(req.query);  // Helper function to handle allowed filters
            console.log('queryFilters: ', queryFilters);
            
            fixture = await Fixture.find(queryFilters);  
        }

        console.log('already: ', fixture.length);
        
        // Check if cache is expired or data is missing
        const isCacheExpired = !fixture.length || (Date.now() - new Date(fixture.lastUpdated).getTime()) > CACHE_DURATION;

        if (!fixture.length || isCacheExpired) {
            
            const queryFilters = buildQueryFilters(req.query);  // Helper function to handle allowed filters

            // Fetch fresh data from third-party API
            const apiUrl = buildApiUrl(req.query);  // Helper function to build API URL based on query
            const response = await axios.get(apiUrl);
            console.log('hello: ', response.data.response.length);
            
            if (response.status !== 200 || !response.data.response.length) {
                return res.status(404).json({ success: false, message: 'Fixture not found in third-party API' });
            }

            // Delete previous data matching the query
            const queryFiltersSchema = buildQueryFiltersForSchema(req.query);  // Helper function to handle allowed filters
            await Fixture.deleteMany(queryFiltersSchema);

            const fixturesList = response.data.response;

            // Insert new fixture data
            await Fixture.insertMany(fixturesList.map(fix => ({
                ...fix,
                lastUpdated: new Date()
            })))
            res.json({ success: true, data: fixturesList });
        } else {
            console.log('fixtures served from cache');
            res.json({ success: true, data: fixture });
        }

    } catch (error) {

        res.status(500).json({ success: false, message: 'Error fetching fixtures', error: error.message });
    }
};

// Helper function to build query filters from allowed parameters
const buildQueryFilters = (query) => {
    const allowedParams = ['id', 'ids', 'league', 'season', 'team', 'live', 'date', 'from', 'to', 'next', 'last', 'round', 'status', 'venue', 'timezone'];
    const filters = {};
    for (const param of allowedParams) {
        if (query[param]) filters[param] = query[param];
    }
    return filters;
};

export const buildQueryFiltersForSchema = (query) => {
    const paramToSchemaMap = {
        id: 'fixture.id',
        league: 'league.id',
        season: 'league.season',
        team: { $or: [{ 'teams.home.id': query.team }, { 'teams.away.id': query.team }] },
        live: 'fixture.status.short', // Assumes 'live' maps to status like '1H', '2H'
        date: 'fixture.date',
        from: { 'fixture.date': { $gte: query.from } },
        to: { 'fixture.date': { $lte: query.to } },
        next: 'fixture.date', // Assumes 'next' and 'last' would need date-based logic externally
        last: 'fixture.date',
        round: 'league.round',
        status: 'fixture.status.short',
        venue: 'fixture.venue.name',
        timezone: 'fixture.timezone',
    };

    const filters = {};
    for (const [param, schemaField] of Object.entries(paramToSchemaMap)) {
        if (query[param]) {
            if (param === 'team') {
                // Handle the 'team' case separately for home or away teams
                filters.$or = schemaField.$or;
            } else if (param === 'from' || param === 'to') {
                // Handle date range queries
                filters['fixture.date'] = {
                    ...(filters['fixture.date'] || {}),
                    ...(param === 'from' ? { $gte: query.from } : { $lte: query.to }),
                };
            } else {
                filters[schemaField] = query[param];
            }
        }
    }

    return filters;
};

// Helper function to build the third-party API URL
export const buildApiUrl = (query) => {
    let apiUrl = '/fixtures?';
    for (const key in query) {
        apiUrl += `${key}=${query[key]}&`;
    }
    return apiUrl.slice(0, -1);  // Remove trailing '&'
};
