import mongoose from 'mongoose';


const StatisticsSchema = new mongoose.Schema({
  league: {
    id: Number,
    name: String,
    country: String,
    logo: String,
    flag: String,
    season: Number,
  },
  team: {
    id: Number,
    name: String,
    logo: String,
  },
  form: String,
  fixtures: {
    played: {
      home: Number,
      away: Number,
      total: Number,
    },
    wins: {
      home: Number,
      away: Number,
      total: Number,
    },
    draws: {
      home: Number,
      away: Number,
      total: Number,
    },
    loses: {
      home: Number,
      away: Number,
      total: Number,
    },
  },
  goals: {
    for: {
      total: {
        home: Number,
        away: Number,
        total: Number,
      },
      average: {
        home: String,
        away: String,
        total: String,
      },
      minute: Object,
      under_over: Object,
    },
    against: {
      total: {
        home: Number,
        away: Number,
        total: Number,
      },
      average: {
        home: String,
        away: String,
        total: String,
      },
      minute: Object,
      under_over: Object,
    },
  },
  biggest: {
    streak: {
      wins: Number,
      draws: Number,
      loses: Number,
    },
    wins: {
      home: String,
      away: String,
    },
    loses: {
      home: String,
      away: String,
    },
    goals: {
      for: {
        home: Number,
        away: Number,
      },
      against: {
        home: Number,
        away: Number,
      },
    },
  },
  clean_sheet: {
    home: Number,
    away: Number,
    total: Number,
  },
  failed_to_score: {
    home: Number,
    away: Number,
    total: Number,
  },
  penalty: {
    scored: {
      total: Number,
      percentage: String,
    },
    missed: {
      total: Number,
      percentage: String,
    },
    total: Number,
  },
  lineups: [
    {
      formation: String,
      played: Number,
    },
  ],
  cards: {
    yellow: Object,
    red: Object,
  },
});

const Statistics = mongoose.model('Statistics', StatisticsSchema);
export default Statistics;