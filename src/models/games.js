const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  points: { type: Number, required: true },
  rank: { type: Number, required: true },
});

const gameSessionSchema = new mongoose.Schema({
  gameID: { type: String, required: true },
  active: {
    type: Boolean,
    default: true,
  },
  date: { type: Date, default: Date.now },
  gameType: { type: String, enum: ["public", "private"], required: true },
  adminName: { type: String, required: true }, // New field to store the admin name
  players: [playerSchema],
});

const GameSession = mongoose.model("GameSession", gameSessionSchema);
module.exports = GameSession;
