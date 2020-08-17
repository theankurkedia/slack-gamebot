require("dotenv").config();
import { App } from "@slack/bolt";
import {
  getScoreboard,
  getUserScore,
  startGame,
  cancelGame,
  getNextQuestionNumber,
  showGameList,
  setExistingQuestionCount,
} from "./actions";
import {
  showGameCreateModal,
  addQuestionFieldInModal,
  showGameEditModal,
  openQuestionEditView,
} from "./views";
const DEFAULT_QUESTIONS_COUNT = 1;
import mongoose from "mongoose";
import { QuestionModel } from "./models/Question";
import { QuizModel } from "./models/Quiz";
import {
  getValueFromFormInput,
  getButtonAttachment,
  getGameNameFromView,
  getQuestionNumberFromView,
  getValueFromView,
  getQuestionIndex,
} from "./utils";
import { forEach, get, isEmpty } from "lodash";
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
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();

app.message("list", async ({ say, context, message }) => {
  const user = message.user;

  await say({
    token: context.botToken,
    channel: user,
    text: "Would you like to play a game?",
    attachments: [
      {
        text: "Choose a game to play",
        fallback: "You are unable to choose a game",
        callback_id: "button_callback",
        color: "#3AA3E3",
        actions: [
          {
            name: "edit",
            text: "Edit Game",
            type: "button",
            value: "maze",
          },
          {
            name: "game",
            text: "Delete Game",
            style: "danger",
            type: "button",
            value: "war",
            confirm: {
              title: "Are you sure?",
              text: "",
              ok_text: "Yes",
              dismiss_text: "No",
            },
          },
        ],
      },
    ],
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
/${process.env.COMMAND_NAME} list  - list of all games
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
  async ({ ack, body, context, say, command }) => {
    let out;
    await ack();
    let textArray = command.text.split(" ");

    switch (textArray[0]) {
      case "create":
        if (textArray[1]) {
          let data = await QuizModel.findOne({ name: textArray[1] });
          if (!data) {
            setExistingQuestionCount(DEFAULT_QUESTIONS_COUNT);
            await showGameCreateModal(app, body, context, textArray[1]);
          } else {
            out = ":warning: Game already exists :warning:";
          }
        } else {
          out = "Please enter name for the game";
        }
        break;

      case "edit":
        if (textArray[1]) {
          let data = await QuizModel.findOne({ name: textArray[1] });
          const user = body.user_id;
          if (data && user === data.userId) {
            if (get(data, "questions.length")) {
              setExistingQuestionCount(get(data, "questions.length"));
            }
            await showGameEditModal(app, body, context, textArray[1], data);
          } else {
            out = "Game does not exist";
          }
        } else {
          out = "Please enter game id";
        }
        break;
      case "start":
        const channelName = body.channel_name;
        let data = await QuizModel.findOne({ name: textArray[1] });
        let user = body.user_id;
        if (data && user === data.userId) {
          startGame(app, context, say, textArray[1], channelName);
        } else {
          say("Game not found!");
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

      case "list":
        let user1 = body.user_id;
        await showGameList(app, say, user1, context);
        // TODO: can show a modal for this
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

app.action("add_question", async ({ ack, context, body, view }: any) => {
  await ack();
  // let quizFormData = getQuizFormData(body["view"]);
  let name = getGameNameFromView(body["view"]);
  let questionNo = getNextQuestionNumber();
  await openQuestionEditView(app, body, context, name, true, questionNo);
  // await addQuestionFieldInModal(
  //   app,
  //   body,
  //   context,
  //   name,
  //   questionNo,
  //   get(body, "view.callback_id") === "modal_create_callback_id",
  //   quizFormData
  // );
});
app.action(
  "edit_question",
  async ({ ack, body, context, message, event, action, options }: any) => {
    await ack();
    let name = getGameNameFromView(body["view"]);
    let quizData = await QuizModel.findOne({ name: name });
    let questionData = quizData.questions[action.value - 1];
    await openQuestionEditView(
      app,
      body,
      context,
      name,
      false,
      action.value,
      questionData
    );
  }
);

app.action(
  { callback_id: "button_callback" },
  async ({ context, ack, action, view, body, say }: any) => {
    await ack();

    if (action.name === "edit") {
      let data = await QuizModel.findOne({ name: action.value });
      const user = body["user"]["id"];
      if (data && user === data.userId) {
        await showGameEditModal(app, body, context, action.value, data);
      } else {
        say("Something went wrong!");
      }
    } else if (action.name === "delete") {
      //
      console.log(action);
      let name = action.value;

      QuizModel.deleteOne({ name }, function(err: any) {
        if (err) return say("Something went wrong!");
        // deleted at most one tank document
        say(`Quiz \`${name}\` deleted successfully.`);
      });
    }
  }
);

app.view(
  "question_edit_callback_id",
  async ({ ack, context, view, body }: any) => {
    await ack();
    let quizName = getGameNameFromView(view);
    let questionIndex = getQuestionIndex(view);

    const quiz = await QuizModel.findOne({ name: quizName });
    if (quiz) {
      const questionObj = new QuestionModel();
      let question = getValueFromView(view, "question_view");
      let answer = getValueFromView(view, "answer_view");
      questionObj.question = question;
      questionObj.answer = answer;
      console.log(questionObj);

      quiz.addQuestion(questionObj, questionIndex);

      console.log(quiz, "quiz here");
      quiz.save();
    }
  }
);
app.view(
  "question_add_callback_id",
  async ({ ack, context, view, body }: any) => {
    // Submission of modal
    await ack();
    let quizName = getGameNameFromView(view);

    const quiz = await QuizModel.findOne({ name: quizName });
    if (quiz) {
      const questionObj = new QuestionModel();

      let question = getValueFromView(view, "question_view");
      let answer = getValueFromView(view, "answer_view");
      questionObj.question = question;
      questionObj.answer = answer;

      quiz.addQuestion(questionObj);
      quiz.save();
    }
  }
);
app.view(
  "modal_create_callback_id",
  async ({ ack, context, view, body }: any) => {
    // Submission of modal
    await ack();
    const user = body["user"]["id"];
    let quizName = getGameNameFromView(view);
    let msg = "";
    let quizFormData = getQuizFormData(view);
    let quiz = new QuizModel();
    quiz.name = quizName;
    quiz.userId = user;
    quiz.addAllQuestions(quizFormData.questions);

    let messageObj: any = {
      token: context.botToken,
      channel: user,
      text: "",
    };
    quiz.save(async function(err: any) {
      if (err) {
        messageObj.text = `There was an error with your submission \n \`${err.message}\``;
      } else {
        messageObj.text = `Quiz created successfully.`;
        messageObj.attachments = [getButtonAttachment(quiz)];
      }
      // Message the user
      try {
        await app.client.chat.postMessage(messageObj);
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
    let quizName = getGameNameFromView(view);
    let quizFormData = getQuizFormData(view);
    let quiz = await QuizModel.findOne({ name: quizName });

    let messageObj: any = {
      token: context.botToken,
      channel: user,
      text: "",
    };

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
          messageObj.text = `There was an error with your submission \n \`${err.message}\``;
        } else {
          messageObj.text = `Quiz \`${quiz.name}\` updated successfully.`;
        }
        // Message the user
        try {
          await app.client.chat.postMessage(messageObj);
        } catch (error) {
          console.error(error);
        }
      });
    }
  }
);
