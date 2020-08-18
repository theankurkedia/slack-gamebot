"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoreboardModel = exports.ScoreboardSchema = void 0;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
exports.ScoreboardSchema = new Schema({
    score: { type: Map, default: new Map() },
});
exports.ScoreboardSchema.methods = {
    getUserScore(userId) {
        return this.score.get(userId);
    },
    setUserScore(userId, score) {
        this.score.set(userId, score);
    },
    initializeAllUsersScore(userIds) {
        userIds.forEach((userId) => {
            this.score.set(userId, 0);
        });
    },
    getFormattedScoreboard() {
        console.log("calculating score board...", this.score);
        let scoreboardString = "";
        this.score.forEach((score, userId) => {
            scoreboardString += `<@${userId}>                      ${score}\n`;
        });
        console.log(this.score, scoreboardString);
        return scoreboardString;
    },
    getWinners() {
        let max = 0;
        let winners = []; // Consider a tie
        this.score.forEach((score, userId) => {
            if (score > max) {
                max = score;
            }
        });
        this.score.forEach((score, userId) => {
            if (score === max) {
                winners.push(userId);
            }
        });
        return winners;
    },
};
exports.ScoreboardModel = mongoose.model("scoreboard", exports.ScoreboardSchema);
