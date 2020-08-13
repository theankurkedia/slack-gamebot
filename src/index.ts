require("dotenv").config();
import { App } from "@slack/bolt";
import {
  showGameCreateModal,
  getScoreboard,
  getUserScore,
  startGame,
  cancelGame,
} from "./actions";

import mongoose from "mongoose";
import { QuestionModel } from "./models/Question";
import { QuizModel } from "./models/Quiz";

const uri: any = process.env.MONGODB_URI;
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected");

    // console.log(instance);
  })
  .catch((err: any) => {
    console.log("error in connection", err);
  });

// instance.name = "hello";

// const question = new QuestionModel();
// question.question = "How are you?";
// instance.questions = [question];

// instance.save(function(err: any) {
//   //
// });

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

app.message("create test", async ({ say, context }) => {
  console.log(context);

  const quiz = new QuizModel();
  quiz.name = "Test";
  quiz.save(function(err: any) {
    if (err) {
      console.log("hello here", err.message);
      say(err.message);
    } else {
      say("Quiz created successfully");
    }
  });
});

app.command("/botsuraj", async ({ ack, body, say, context }) => {
  await ack();
  const quiz = await QuizModel.findOne({ name: body.text });
  if (quiz) {
    console.log(quiz);
    await say(`Quiz with name ${body.text} found`);
  } else {
    await say("Sorry, Invalid command");
  }
  // const quiz = new QuizModel();
  // quiz.name = "Test";
  // quiz.save(function(err: any) {
  //   if (err) {
  //     console.log("hello here", err.message);
  //     say(err.message);
  //   } else {
  //     say("Quiz created successfully");
  //   }
  // });
});

// app.command("/botsuraj", async ({ ack, body, say, context }) => {
//   console.log("jello here", context, body);

//   await say("Quiz created successfully");
//   // const quiz = new QuizModel();
//   // quiz.name = "Test";
//   // quiz.save(function(err: any) {
//   //   if (err) {
//   //     console.log("hello here", err.message);
//   //     say(err.message);
//   //   } else {
//   //     say("Quiz created successfully");
//   //   }
//   // });
// });
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

app.event("app_mention", async ({ context, event }: any) => {
  try {
    await app.client.chat.postMessage({
      token: context.botToken,
      channel: event.channel,
      text: `Hey <@${event.user}>, you mentioned me.`,
    });
  } catch (e) {
    console.log(`error responding ${e}`);
  }
});
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
