import mongoose from 'mongoose';

const standingSchema = new mongoose.Schema({
  league: {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    country: { type: String, required: true },
    logo: { type: String },
    flag: { type: String },
    season: { type: Number, required: true },
  },
  standings: [
    [{
      rank: { type: Number },
      team: {
        id: { type: Number },
        name: { type: String },
        logo: { type: String },
      },
      points: { type: Number },
      goalsDiff: { type: Number },
      group: { type: String },
      form: { type: String },
      status: { type: String },
      description: { type: String },
      all: {
        played: { type: Number },
        win: { type: Number },
        draw: { type: Number },
        lose: { type: Number },
        goals: {
          for: { type: Number },
          against: { type: Number },
        },
      },
      home: {
        played: { type: Number },
        win: { type: Number },
        draw: { type: Number },
        lose: { type: Number },
        goals: {
          for: { type: Number },
          against: { type: Number },
        },
      },
      away: {
        played: { type: Number },
        win: { type: Number },
        draw: { type: Number },
        lose: { type: Number },
        goals: {
          for: { type: Number },
          against: { type: Number },
        },
      },
      update: { type: Date },
    }]
  ],
});

const Standing = mongoose.model('Standing', standingSchema);

export default Standing;
