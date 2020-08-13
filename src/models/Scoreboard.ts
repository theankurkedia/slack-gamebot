const mongoose = require("mongoose");
const Schema = mongoose.Schema;

export const ScoreboardSchema = new Schema({
  scores: [
    {
      userId: { type: String, unique: true, required: true },
      score: { type: Number, default: 0 },
    },
  ],
});

export const ScoreboardModel = mongoose.model("scoreboard", ScoreboardSchema);
