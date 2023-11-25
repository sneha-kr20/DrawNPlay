// models/games.js
const mongoose = require("mongoose");

// Defining the schema for storing the data in mongodb atlas
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

// Player array consists of objects of players including username, points and their rannks

const GameSession = mongoose.model("GameSession", gameSessionSchema);

// Exporting the schema to server 
module.exports = GameSession;
