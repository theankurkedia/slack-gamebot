require("dotenv").config();
import { App } from "@slack/bolt";
import {
  showGameCreateModal,
  getScoreboard,
  getUserScore,
  startGame,
  cancelGame,
  getNextQuestionNumber,
  addQuestionFieldInModal,
} from "./actions";

import mongoose from "mongoose";
import { QuestionModel } from "./models/Question";

const uri: any = process.env.MONGODB_URI;
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected");
    // const instance = new QuestionModel();
    // instance.question = "hello";
    // instance.save(function(err: any) {
    //   //
    // });

    // console.log(instance);
  })
  .catch((err: any) => {
    console.log("error in connection", err);
  });

// const m = new MyModel();
// m.save();

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

app.message("whoami", async ({ say, context }) => {
  console.log("je;;p", context);
  await say(`User Details: ${JSON.stringify(context.user)}`);
});

app.command("/game", async ({ ack, body, context, say, command }: any) => {
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

app.action(
  "add_question",
  async ({ action, ack, context, view, body }: any) => {
    await ack();
    let questionNo = getNextQuestionNumber();
    await addQuestionFieldInModal(app, body, context, questionNo);
  }
);
app.view(
  "modal_callback_id",
  async ({ action, ack, context, view, body }: any) => {
    // Submission of modal
    await ack();

    console.log("*** 🔥 ssssss", view["state"]["values"]);
  }
);
