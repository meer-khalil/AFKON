import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  id: Number,
  name: String,
  age: Number,
  number: Number,
  position: String,
  photo: String,
});

const squadSchema = new mongoose.Schema({
  team: {
    id: Number,
    name: String,
    logo: String,
  },
  players: [playerSchema],
  lastUpdated: { type: Date, default: Date.now }, // Timestamp for cache validity
});

export default mongoose.model('Squad', squadSchema);
