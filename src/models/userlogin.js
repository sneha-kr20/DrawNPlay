const mongoose = require("mongoose");
const validator = require("validator");


const userSchema1 = mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  date: {
    type: Date,
    default: Date.now,
  },
  password: { type: String },
  googleId: { type: String }, 
  points: {
    type: Number,
    default: 0,
  },
  gameHistory: [gameSchema],
});

// creating a collection
const User1 = mongoose.model("Login", userSchema1);
module.exports = User1;

