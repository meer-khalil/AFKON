import mongoose from 'mongoose';

const CoachSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String },
  firstname: { type: String },
  lastname: { type: String },
  age: { type: Number },
  birth: {
    date: { type: String },
    place: { type: String },
    country: { type: String }
  },
  nationality: { type: String },
  height: { type: String, default: null },
  weight: { type: String, default: null },
  photo: { type: String },
  team: {
    id: { type: Number },
    name: { type: String },
    logo: { type: String }
  }
});

const teamSchema = new mongoose.Schema({
  team: {
    id: { type: Number, unique: true },
    name: { type: String, },
    code: { type: String, },
    country: { type: String, },
    founded: { type: Number, },
    national: { type: Boolean, },
    logo: { type: String, }
  },
  venue: {
    id: { type: Number, },
    name: { type: String, },
    address: { type: String, },
    city: { type: String, },
    capacity: { type: Number, },
    surface: { type: String, },
    image: { type: String, }
  },
  seasons: [Number], // Array to store the seasons
  coach: CoachSchema,
  lastUpdated: { type: Date, default: Date.now }, // Timestamp for cache validity
});

const Team = mongoose.model('Team', teamSchema);
export default Team;
