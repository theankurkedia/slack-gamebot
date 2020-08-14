const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ScoreSchema = new Schema({
  userId: { type: String, required: true },
  score: { type: Number, default: 0 },
});
export const ScoreboardSchema = new Schema({
  scores: [ScoreSchema],
});

export const ScoreboardModel = mongoose.model("scoreboard", ScoreboardSchema);
