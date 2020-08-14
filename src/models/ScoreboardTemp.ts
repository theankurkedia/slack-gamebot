export default class ScoreBoard {
  score = new Map<string, number>();

  getUserScore(userId: string) {
    return this.score.get(userId);
  }

  setUserScore(userId: string, score: number) {
    this.score.set(userId, score);
  }

  initializeAllUsersScore(userIds: Array<string>) {
    userIds.forEach((userId) => {
      this.score.set(userId, 0);
    });
  }

  getFormattedScoreboard() {
    console.log("calculating score board...");
    let scoreboardString = "";
    this.score.forEach((score, userId) => {
      scoreboardString += `<@${userId}>                      ${score}\n`;
    });
    console.log(this.score, scoreboardString);
    return scoreboardString;
  }
  getWinner() {
    let max = 0;
    let winner = ""; // Consider a tie
    this.score.forEach((score, userId) => {
      if (score > max) {
        max = score;
        winner = userId;
      }
    });

    return winner;
  }
}
