require("dotenv").config();
import { App } from "@slack/bolt";

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
  // console.log("*** 🔥 params", body);
  await ack();
  switch (command.text) {
    case "help":
      out = `\`\`\`/game create - create a new game
/game cancel <id> - cancel the creation of game
/game help  - list out the commands
/game start <id> - start the game
/game assign <id> <name> @<channel>
/game result <id> <name> - find the result of person \`\`\``;
      break;
    default:
      out = `<@${command.user_id}> ${command.text}`;
      break;
  }
  await say(`${out}`);
});
