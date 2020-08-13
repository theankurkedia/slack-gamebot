require("dotenv").config();
import { App } from "@slack/bolt";
import {
  showGameCreateModal,
  getScoreboard,
  getUserScore,
  startGame,
  cancelGame,
} from "./actions";

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();

const commandsList = `\`\`\`/gamebot create - create a new game
/gamebot cancel <id> - cancel the creation of game
/gamebot help  - list out the commands
/gamebot start <id> - start the game
/gamebot assign <id> <name> @<channel>
/gamebot result <id> <name> - find the result of person \`\`\``;

app.command("/gamebot", async ({ ack, body, context, say, command }: any) => {
  let out;
  await ack();
  let textArray = command.text.split(" ");
  switch (textArray[0]) {
    case "create":
      await showGameCreateModal(app, body, context);
      // TODO: can show a modal for this
      break;
    case "start":
      if (textArray[1]) {
        out = "Starting in 3..2..1";
        startGame(textArray[1]);
      } else {
        out = "Game does not exist";
      }
      break;
    case "cancel":
      if (textArray[1]) {
        out = "Cancelling the game";
        cancelGame(textArray[1]);
      } else {
        out = "Game does not exist";
      }
      break;
    case "help":
      out = commandsList;
      break;
    case "scoreboard":
      out = getScoreboard("game");
      break;
    case "score":
      out = getUserScore(command.user_id);
      break;
    default:
      out = `<@${command.user_id}> ${command.text}`;
      break;
  }
  if (out) {
    await say(`${out}`);
  }
});
