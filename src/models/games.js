const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  gameID: { type: String, required: true },
  date: { type: Date, default: Date.now },
  players: [
    {
      username: { type: String, required: true },
      points: { type: Number, required: true },
    },
  ],
});

const Game = mongoose.model("Game", gameSchema);
module.exports = Game;
