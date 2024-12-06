import mongoose from 'mongoose';

const { Schema } = mongoose;

const seasonSchema = new Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player', // Reference to the Player model
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team', // Reference to the Team model
      required: true,
    },
    seasons: [
      {
        type: Number,
        required: true,
      },
    ],
  },
  { timestamps: true }
);

// Create a model from the schema
const Season = mongoose.model('Season', seasonSchema);

export default Season;
