import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
    player: {
        id: { type: Number, required: true },
        name: { type: String, required: true },
        firstname: { type: String },
        lastname: { type: String },
        age: { type: Number },
        birth: {
            date: { type: Date },
            place: { type: String },
            country: { type: String },
        },
        nationality: { type: String },
        height: { type: String },
        weight: { type: String },
        number: { type: Number },
        position: { type: String },
        photo: { type: String },
    },
    statistics: [{
        team: {
            id: { type: Number, required: true },
            name: { type: String, required: true },
            logo: { type: String },
        },
        league: {
            id: { type: Number, required: true },
            name: { type: String, required: true },
            country: { type: String },
            logo: { type: String },
            flag: { type: String },
            season: { type: Number, required: true },
        },
        games: {
            appearances: { type: Number },
            lineups: { type: Number },
            minutes: { type: Number },
            number: { type: Number, default: null },
            position: { type: String },
            rating: { type: String },
            captain: { type: Boolean },
        },
        substitutes: {
            in: { type: Number },
            out: { type: Number },
            bench: { type: Number },
        },
        shots: {
            total: { type: Number, default: null },
            on: { type: Number, default: null },
        },
        goals: {
            total: { type: Number, default: 0 },
            conceded: { type: Number, default: 0 },
            assists: { type: Number, default: null },
            saves: { type: Number, default: 0 },
        },
        passes: {
            total: { type: Number },
            key: { type: Number, default: null },
            accuracy: { type: Number, default: null },
        },
        tackles: {
            total: { type: Number, default: null },
            blocks: { type: Number, default: null },
            interceptions: { type: Number, default: 0 },
        },
        duels: {
            total: { type: Number },
            won: { type: Number },
        },
        dribbles: {
            attempts: { type: Number, default: null },
            success: { type: Number, default: null },
            past: { type: Number, default: null },
        },
        fouls: {
            drawn: { type: Number },
            committed: { type: Number, default: null },
        },
        cards: {
            yellow: { type: Number, default: 0 },
            yellowred: { type: Number, default: 0 },
            red: { type: Number, default: 0 },
        },
        penalty: {
            won: { type: Number, default: null },
            committed: { type: Number, default: null },
            scored: { type: Number, default: 0 },
            missed: { type: Number, default: 0 },
            saved: { type: Number, default: 0 },
        },
    }],
    seasons: { type: [Number], default: [] }, // Optional field for seasons
    currentTeam: {
        id: { type: Number }
    },
    lastUpdated: { type: Date, default: Date.now }  // For cache timeout
});

const Player = mongoose.model('Player', playerSchema);

export default Player;
