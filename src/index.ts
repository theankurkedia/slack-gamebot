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
  stopGame,
  resumeGame,
  pauseGame,
} from "./actions";
import {
  showGameCreateModal,
  updateQuestionModal,
  showGameEditModal,
  openQuestionEditView,
  getModalView,
  addQuestionsModal,
} from "./views";
const DEFAULT_QUESTIONS_COUNT = 5;
import mongoose from "mongoose";
import { QuizModel } from "./models/Quiz";
import {
  getButtonAttachment,
  getGameNameFromView,
  getQuestionNumberFromView,
  getValueFromView,
  getQuestionIndex,
} from "./utils";
import { forEach, get, isEmpty } from "lodash";
import { getQuizFormData } from "./getQuizFormData";
var stringSimilarity = require("string-similarity");

const uri: any = process.env.MONGODB_URI;
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected");
  })
  .catch((err: any) => {
    console.log("error in connection", err);
  });

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();

app.message("list", async ({ say, context, message }) => {
  console.log(
    stringSimilarity.compareTwoStrings("play station", "playstation")
  );
  // const user = message.user;
  // await say({
  //   token: context.botToken,
  //   channel: user,
  //   text: "Would you like to play a game?",
  //   attachments: [
  //     {
  //       text: "Choose a game to play",
  //       fallback: "You are unable to choose a game",
  //       callback_id: "button_callback",
  //       color: "#3AA3E3",
  //       actions: [
  //         {
  //           name: "edit",
  //           text: "Edit Game",
  //           type: "button",
  //           value: "maze",
  //         },
  //         {
  //           name: "game",
  //           text: "Delete Game",
  //           style: "danger",
  //           type: "button",
  //           value: "war",
  //           confirm: {
  //             title: "Are you sure?",
  //             text: "",
  //             ok_text: "Yes",
  //             dismiss_text: "No",
  //           },
  //         },
  //       ],
  //     },
  //   ],
  // });
});

const commandsList = `\`\`\`/${process.env.COMMAND_NAME} create <gameName> <questionNos = 5> - create a new game
/${process.env.COMMAND_NAME} edit <gameName> - edit existing game
/${process.env.COMMAND_NAME} addQuestions <gameName> <questionNos = 1> - edit existing game
/${process.env.COMMAND_NAME} cancel <gameName> - cancel the creation of game
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

async function runCommand(
  textArray: any,
  body: any,
  context: any,
  say: any,
  command: any,
  user: any
) {
  let out;

  switch (textArray[0]) {
    case "create": {
      const gameName = textArray[1];
      if (gameName) {
        let questionNos = textArray[2];
        let data = await QuizModel.findOne({ name: gameName });
        if (!data) {
          await showGameCreateModal(
            app,
            body,
            context,
            textArray[1],
            questionNos ? Number(questionNos) : 5
          );
        } else {
          out = ":warning: Game already exists :warning:";
        }
      } else {
        out = ":warning: Game already exists :warning:";
      }
      break;
    }

    case "edit":
      if (textArray[1]) {
        let data = await QuizModel.findOne({ name: textArray[1] });
        if (data && user === data.userId) {
          await showGameEditModal(app, body, context, textArray[1], data);
        } else {
          out = ":warning: Game does not exist :warning:";
        }
      } else {
        out = "Game does not exist";
      }
      break;
    case "addQuestions": {
      const gameName = textArray[1];
      if (gameName) {
        let questionNos = textArray[2];
        let data = await QuizModel.findOne({ name: gameName });
        if (data) {
          await addQuestionsModal(
            app,
            body,
            context,
            textArray[1],
            questionNos ? Number(questionNos) : 1
          );
        } else {
          out = ":warning: Game does not exist :warning:";
        }
      } else {
        out = "Please enter name for the game";
      }
      break;
    }
    case "start":
      const channelName = body.channel_name;
      let quiz = await QuizModel.findOne({ name: textArray[1] });

      if (user === quiz.userId && !quiz.running && !quiz.paused) {
        startGame(app, context, say, quiz, channelName);
      } else {
        if (!quiz.running) {
          out = "Please start the game first!";
        } else if (quiz.paused) {
          out = "Game is paused! Please resume the game.";
        } else {
          out = "Game not Found!";
        }
      }
      break;

    case "stop": {
      const channelName = body.channel_name;
      let quiz = await QuizModel.findOne({ name: textArray[1] });

      console.log(user, textArray[1]);

      if (user === quiz.userId) {
        stopGame(quiz);
        say("Game stopped succesfully!");
      } else {
        out = "Game not found!";
      }
      break;
    }

    case "resume": {
      const channelName = body.channel_name;
      let quiz = await QuizModel.findOne({ name: textArray[1] });
      if (user === quiz.userId && quiz.running && quiz.paused) {
        resumeGame(app, context, say, quiz, channelName);
        say("Game resumed!");
      } else {
        if (!quiz.running) {
          out = "Please start the game first!";
        } else if (!quiz.paused) {
          out = "Game is already running!";
        } else {
          out = "Game not Found!";
        }
      }
      break;
    }
    case "pause": {
      const channelName = body.channel_name;
      let quiz = await QuizModel.findOne({ name: textArray[1] });
      if (user === quiz.userId && quiz.running) {
        pauseGame(app, context, say, quiz, channelName);
        say("Game paused!");
      } else {
        if (!quiz.running) {
          out = "Please start the game first!";
        } else {
          out = "Game not Found!";
        }
      }
      break;
    }

    case "restart": {
      const channelName = body.channel_name;
      let quiz = await QuizModel.findOne({ name: textArray[1] });
      let user = body.user_id;

      if (user === quiz.userId) {
        stopGame(quiz);
        setTimeout(() => {
          startGame(app, context, say, quiz, channelName);
        }, 1000);
      } else {
        out = "Game not found!";
      }
      break;
    }
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
    let message: any = {
      token: context.botToken,
      channel: user,
      user: user,
      text: out,
      attachments: [],
    };

    await app.client.chat.postEphemeral(message);
  }
}
app.command(
  `/${process.env.COMMAND_NAME}`,
  async ({ ack, body, context, say, command }) => {
    await ack();
    let textArray = command.text.split(" ");
    let user = body.user_id;

    runCommand(textArray, body, context, say, command, user);
  }
);

// app.action("add_question", async ({ ack, context, body, view }: any) => {
//   await ack();
//   // let quizFormData = getQuizFormData(body["view"]);
//   let name = getGameNameFromView(body["view"]);
//   let questionNo = getNextQuestionNumber();
//   await openQuestionEditView(app, body, context, name, true, questionNo);
//   // await updateQuestionModal(
//   //   app,
//   //   body,
//   //   context,
//   //   name,
//   //   questionNo,
//   //   get(body, "view.callback_id") === "modal_create_callback_id",
//   //   quizFormData
//   // );
// });
// app.action(
//   "edit_question",
//   async ({ ack, body, context, message, event, action, options }: any) => {
//     await ack();
//     let name = getGameNameFromView(body["view"]);
//     let quizData = await QuizModel.findOne({ name: name });
//     let questionData = quizData.questions[action.value - 1];
//     await openQuestionEditView(
//       app,
//       body,
//       context,
//       name,
//       false,
//       action.value,
//       questionData
//     );
//   }
// );

app.action(
  { callback_id: "button_callback" },
  async ({ context, ack, action, view, body, say, command }: any) => {
    await ack();
    const user = body["user"]["id"];

    if (action.name === "edit") {
      let data = await QuizModel.findOne({ name: action.value });
      if (data && user === data.userId && !data.running) {
        await showGameEditModal(app, body, context, action.value, data);
      } else {
        say("Something went wrong!");
      }
    } else if (action.name === "delete") {
      let name = action.value;
      let data = await QuizModel.findOne({ name: action.value });
      const user = body["user"]["id"];

      if (data && user === data.userId && !data.running) {
        QuizModel.deleteOne({ name }, function(err: any) {
          if (err) return say("Something went wrong!");
          // deleted at most one tank document
          say(`Quiz \`${name}\` deleted successfully.`);
        });
      } else {
        say("Something went wrong!");
      }
    } else if (action.name === "start") {
      runCommand(["start", action.value], body, context, say, command, user);
    } else if (action.name === "stop") {
      runCommand(["stop", action.value], body, context, say, command, user);
    } else if (action.name === "pause") {
      runCommand(["pause", action.value], body, context, say, command, user);
    } else if (action.name === "resume") {
      runCommand(["resume", action.value], body, context, say, command, user);
    } else if (action.name === "add_question") {
      runCommand(
        ["addQuestions", action.value],
        body,
        context,
        say,
        command,
        user
      );
    }
  }
);
app.action(
  "delete_question",
  async ({ context, ack, action, view, body, say }: any) => {
    await ack();
    let name = getGameNameFromView(body["view"]);

    let quiz = await QuizModel.findOne({ name: name });
    const user = body["user"]["id"];

    if (quiz && user === quiz.userId) {
      quiz.deleteQuestion(parseInt(action.value, 10));
      quiz.save();

      await updateQuestionModal(
        app,
        body,
        context,
        name,
        quiz.questions.length,
        get(body, "view.callback_id") === "modal_create_callback_id"
          ? "new"
          : get(body, "view.callback_id") === "modal_edit_callback_id"
          ? "edit"
          : "addQuestions",
        quiz
      );
    }
  }
);
app.view(
  "modal_create_callback_id",
  async ({ ack, context, view, body }: any) => {
    await ack();
    const user = body["user"]["id"];
    let quizName = getGameNameFromView(view);
    let msg = "";
    let quizFormData = getQuizFormData(view);
    let quiz = new QuizModel();
    quiz.name = quizName;
    quiz.userId = user;
    quiz.addAllQuestions(quizFormData.questions);
    quiz.config = quizFormData.config;
    let messageObj: any = {
      token: context.botToken,
      channel: user,
      user: user,
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
        await app.client.chat.postEphemeral(messageObj);
      } catch (error) {
        console.error(error);
      }
    });
  }
);
app.view(
  "modal_add_questions_callback_id",
  async ({ ack, context, view, body }: any) => {
    await ack();
    const user = body["user"]["id"];
    let quizName = getGameNameFromView(view);
    let quizFormData = getQuizFormData(view);
    let quiz = await QuizModel.findOne({ name: quizName });
    let existingQuestionLength = quiz.questions.length;
    if (quizFormData.questions) {
      quizFormData.questions.forEach((questionObj: any, index: number) => {
        quiz.addQuestion(questionObj, existingQuestionLength + index + 1);
      });
    }

    let messageObj: any = {
      token: context.botToken,
      channel: user,
      user: user,
      text: "",
    };
    quiz.save(async function(err: any) {
      if (err) {
        messageObj.text = `There was an error with your submission \n \`${err.message}\``;
      } else {
        messageObj.text = `Question added successfully.`;
        messageObj.attachments = [getButtonAttachment(quiz)];
      }
      // Message the user
      try {
        await app.client.chat.postEphemeral(messageObj);
      } catch (error) {
        console.error(error);
      }
    });
  }
);

app.view(
  "modal_edit_callback_id",
  async ({ action, ack, context, view, body, say }: any) => {
    await ack();
    const user = body["user"]["id"];
    let msg = "";
    let quizName = getGameNameFromView(view);
    let quizFormData = getQuizFormData(view);

    console.log(quizFormData, "hello here");
    let quiz = await QuizModel.findOne({ name: quizName });

    let messageObj: any = {
      token: context.botToken,
      channel: user,
      user: user,
      text: "",
    };

    if (!quiz || quiz.userId !== user) {
      try {
        await app.client.chat.postEphemeral({
          token: context.botToken,
          channel: user,
          user: user,
          text: "Quiz not found",
        });
      } catch (error) {
        console.error(error);
      }
    } else {
      quiz.addAllQuestions(quizFormData.questions);
      quiz.config = quizFormData.config;
      quiz.save(async function(err: any) {
        if (err) {
          messageObj.text = `There was an error with your submission \n \`${err.message}\``;
        } else {
          messageObj.text = `Quiz \`${quiz.name}\` updated successfully.`;
        }
        // Message the user
        try {
          await app.client.chat.postEphemeral(messageObj);
        } catch (error) {
          console.error(error);
        }
      });
    }
  }
);
