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
import { QuizModel } from "./models/Quiz";
import { getValueFromFormInput } from "./utils";
import { forEach } from "lodash";

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

app.message("whoami", async ({ say, context }) => {
  console.log("je;;p", context);
  await say(`User Details: ${JSON.stringify(context.user)}`);
});

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
          let data = await QuizModel.find({ name: textArray[1] });
          if (data && data.length) {
            await showGameCreateModal(app, body, context, data[0]);
          } else {
            out = "Game does not exist";
          }
          // startGame(textArray[1]);
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
  "modal_callback_id",
  async ({ action, ack, context, view, body, say }: any) => {
    // Submission of modal
    await ack();

    console.log(body, "hello here");
    const user = body["user"]["id"];
    let msg = "";

    const dataInput = view["state"]["values"];

    const quizObject: any = {
      name: "",
      questions: [],
    };

    Object.entries(dataInput).map((entry) => {
      let key = entry[0];
      let value = getValueFromFormInput(entry[1]);

      if (key === "quiz_name") {
        // quiz.name = value;
        quizObject.name = value;
      } else if (key.startsWith("question_")) {
        quizObject.questions.push({
          question: value,
          answer: getValueFromFormInput(
            dataInput[`answer_${key.split(`question_`)[1]}`]
          ),
        });
        // const questionObj = new QuestionModel();
        // questionObj.question = value;
        // questionObj.answer = getValueFromFormInput(
        //   dataInput[`answer_${key.split(`question_`)[1]}`]
        // );
        // quiz.addQuestion(questionObj);
      }
    });

    let quiz = await QuizModel.findOne({ name: quizObject.name });

    console.log(quiz, "quiz here");
    if (!quiz) {
      quiz = new QuizModel();
      quiz.name = quizObject.name;
    } else {
      quiz.questions = [];
    }

    forEach(quizObject.questions, (quesData) => {
      const questionObj = new QuestionModel();
      questionObj.question = quesData.question;
      questionObj.answer = quesData.answer;
      quiz.addQuestion(questionObj);
    });
    // const quizName = getValueFromFormInput(dataInput.quiz_name);

    quiz.save(async function(err: any) {
      console.log("*** 🔥 ssssss", dataInput);

      if (err) {
        console.log("hello here", err.message);
        msg = `There was an error with your submission \n \`${err.message}\``;
        // say(err.message);
      } else {
        // console.log("*** 🔥 ssssss", dataInput);
        msg = "Your submission was successful";

        // say("Quiz created successfully");
      }

      // if (results) {
      //   // DB save was successful
      //   msg = 'Your submission was successful';
      // } else {
      //   msg = 'There was an error with your submission';
      // }

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
