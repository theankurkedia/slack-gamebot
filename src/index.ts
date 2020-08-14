require("dotenv").config();
import { App } from "@slack/bolt";
import {
  showGameCreateModal,
  showGameEditModal,
  getScoreboard,
  getUserScore,
  startGame,
  cancelGame,
  getNextQuestionNumber,
  addQuestionFieldInModal,
} from "./actions";

import mongoose from "mongoose";
import { QuestionModel } from "./models/Question";
import { QuizModel } from "./models/Quiz";
import { getValueFromFormInput } from "./utils";
import { forEach } from "lodash";
import { getQuizFormData } from "./getQuizFormData";

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

// app.command("/botsuraj", async ({ ack, body, say, context }) => {
//   await ack();
//   const quiz = await QuizModel.find({});
//   if (quiz) {
//     console.log(quiz);
//     await say(`Quiz with name ${body.text} found`);
//   } else {
//     await say("Sorry, Invalid command");
//   }
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
const commandsList = `\`\`\`/${process.env.COMMAND_NAME} create - create a new game
/${process.env.COMMAND_NAME} cancel <id> - cancel the creation of game
/${process.env.COMMAND_NAME} help  - list out the commands
/${process.env.COMMAND_NAME} start <id> - start the game
/${process.env.COMMAND_NAME} assign <id> <name> @<channel>
/${process.env.COMMAND_NAME} result <id> <name> - find the result of person \`\`\``;

// app.message("t", async ({ say, context, body }) => {
//   console.log("je;;p", body);
//   const user = body.event.user;

//   const quiz = await QuizModel.findOne({ name: 1 });

//   console.log(quiz.updateUserScore(quiz.userId, 10));
//   await say(`User Details: ${user}`);
// });

app.command(
  `/${process.env.COMMAND_NAME}`,
  async ({ ack, body, context, say, command }: any) => {
    let out;
    await ack();
    let textArray = command.text.split(" ");
    switch (textArray[0]) {
      case "create":
        await showGameCreateModal(app, body, context);
        // TODO: can show a modal for this
        break;
      case "edit":
        if (textArray[1]) {
          let data = await QuizModel.findOne({ name: textArray[1] });
          const user = body.user_id;
          console.log("jello ", user, data.userId);
          if (data && user === data.userId) {
            await showGameEditModal(app, body, context, data);
          } else {
            out = "Game does not exist";
          }
        } else {
          out = "Please enter game id";
        }
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
  }
);

app.action(
  "add_question",
  async ({ action, ack, context, view, body }: any) => {
    await ack();
    let questionNo = getNextQuestionNumber();
    await addQuestionFieldInModal(app, body, context, questionNo);
  }
);

app.view(
  "modal_create_callback_id",
  async ({ action, ack, context, view, body, say }: any) => {
    // Submission of modal
    await ack();
    const user = body["user"]["id"];

    console.log(user, "hello user");
    let msg = "";
    let quizFormData = getQuizFormData(view);
    let quiz = new QuizModel();
    quiz.name = quizFormData.name;
    quiz.userId = user;
    quiz.addAllQuestions(quizFormData.questions);

    quiz.save(async function(err: any) {
      if (err) {
        msg = `There was an error with your submission \n \`${err.message}\``;
      } else {
        msg = "Your submission was successful";
      }
      // Message the user
      try {
        await app.client.chat.postMessage({
          token: context.botToken,
          channel: user,
          text: msg,
        });
      } catch (error) {
        console.error(error);
      }
    });
  }
);

app.view(
  "modal_edit_callback_id",
  async ({ action, ack, context, view, body, say }: any) => {
    // Submission of modal
    await ack();
    const user = body["user"]["id"];
    let msg = "";

    let quizFormData = getQuizFormData(view);
    let quiz = await QuizModel.findOne({ name: quizFormData.name });

    if (!quiz || quiz.userId !== user) {
      try {
        await app.client.chat.postMessage({
          token: context.botToken,
          channel: user,
          text: "Quiz not found",
        });
      } catch (error) {
        console.error(error);
      }
    } else {
      quiz.addAllQuestions(quizFormData.questions);

      quiz.save(async function(err: any) {
        if (err) {
          msg = `There was an error with your submission \n \`${err.message}\``;
        } else {
          msg = "Your submission was successful";
        }
        // Message the user
        try {
          await app.client.chat.postMessage({
            token: context.botToken,
            channel: user,
            text: msg,
          });
        } catch (error) {
          console.error(error);
        }
      });
    }
  }
);
