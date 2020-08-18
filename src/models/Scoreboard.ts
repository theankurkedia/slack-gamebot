const mongoose = require("mongoose");
const Schema = mongoose.Schema;

export const ScoreboardSchema = new Schema({
  score: { type: Map, default: new Map() },
});

ScoreboardSchema.methods = {
  getUserScore(userId: string) {
    return this.score.get(userId);
  },

  setUserScore(userId: string, score: number) {
    this.score.set(userId, score);
  },

  initializeAllUsersScore(userIds: Array<string>) {
    userIds.forEach((userId) => {
      this.score.set(userId, 0);
    });
  },

  getFormattedScoreboard() {
    // console.log("calculating score board...", this.score);
    let scoreboardString = "";
    this.score.forEach((score: any, userId: any) => {
      scoreboardString += `<@${userId}>                      ${score}\n`;
    });
    console.log(this.score, scoreboardString);
    return scoreboardString;
  },
  getWinners() {
    let max = 0;
    let winners: any = []; // Consider a tie
    this.score.forEach((score: any, userId: any) => {
      if (score > max) {
        max = score;
      }
    });
    this.score.forEach((score: any, userId: any) => {
      if (score === max) {
        winners.push(userId);
      }
    });

    return winners;
  },
};

export const ScoreboardModel = mongoose.model("scoreboard", ScoreboardSchema);
