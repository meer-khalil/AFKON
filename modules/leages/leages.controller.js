import League from './leages.model.js'; // Import the Mongoose model

// Controller function to handle GET requests with dynamic filters
export const getLeagues = async (req, res) => {
    try {
        // Valid schema fields for filtering
        const validFields = ['league.id', 'league.name', 'league.type', 'country.name', 'country.code', 'seasons.year', 'seasons.current'];

        // Validate filters
        const filters = {};
        for (const key in req.query) {
            if (validFields.includes(key)) {
                filters[key] = req.query[key];
            }
        } 
        
        const leagues = await League.find(filters); // Apply filters dynamically

        res.json({ success: true, data: leagues });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching leagues',
            error: error.message
        });
    }
};
