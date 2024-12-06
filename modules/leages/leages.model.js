import mongoose from 'mongoose';

const leagueSchema = new mongoose.Schema({
  league: {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    logo: { type: String, required: true }
  },
  country: {
    name: { type: String, required: true },
    code: { type: String, default: null },
    flag: { type: String, default: null }
  },
  seasons: [
    {
      year: { type: Number, required: true },
      start: { type: Date, required: true },
      end: { type: Date, required: true },
      current: { type: Boolean, required: true },
      coverage: {
        fixtures: {
          events: { type: Boolean, required: true },
          lineups: { type: Boolean, required: true },
          statistics_fixtures: { type: Boolean, required: true },
          statistics_players: { type: Boolean, required: true }
        },
        standings: { type: Boolean, required: true },
        players: { type: Boolean, required: true },
        top_scorers: { type: Boolean, required: true },
        top_assists: { type: Boolean, required: true },
        top_cards: { type: Boolean, required: true },
        injuries: { type: Boolean, required: true },
        predictions: { type: Boolean, required: true },
        odds: { type: Boolean, required: true }
      }
    }
  ]
});

export default mongoose.model('League', leagueSchema);
