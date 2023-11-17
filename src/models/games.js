// models/games.js
const mongoose = require("mongoose");

const gameSessionSchema = new mongoose.Schema({
  gameID: { type: String, required: true, unique: true },
  active: { type: Boolean, default: true },
  date: { type: Date, default: Date.now },
  gameType: { type: String, enum: ["public", "private"], required: true },
  adminName: { type: String, required: true },
  players: [
    {
      username: { type: String, required: true },
      points: { type: Number, default: 0 },
      rank: { type: Number, default: 1000 },
    },
  ],
});

const GameSession = mongoose.model("GameSession", gameSessionSchema);

module.exports = GameSession;
