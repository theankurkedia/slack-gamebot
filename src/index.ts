require("dotenv").config();
import { App } from "@slack/bolt";
import {
  getScoreboard,
  getUserScore,
  startGame,
  cancelGame,
  showGameList,
  stopGame,
  resumeGame,
  pauseGame,
} from "./actions";
import {
  showGameCreateModal,
  updateQuestionModal,
  showGameEditModal,
  addQuestionsModal,
} from "./views";
import mongoose from "mongoose";
import { QuizModel } from "./models/Quiz";
import { getButtonAttachment, getGameNameFromView } from "./utils";
import { get } from "lodash";
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

const commandsList = `\`\`\`/${process.env.COMMAND_NAME} create <gameName> <questionNos = 5>       - create a new game
/${process.env.COMMAND_NAME} edit <gameName>                           - edit existing game
/${process.env.COMMAND_NAME} addQuestions <gameName> <questionNos = 1> - edit existing game
/${process.env.COMMAND_NAME} start <gameName>                          - start the game
/${process.env.COMMAND_NAME} stop <gameName>                           - stop the game
/${process.env.COMMAND_NAME} pause <gameName>                          - pause the game
/${process.env.COMMAND_NAME} resume <gameName>                         - resume the game
/${process.env.COMMAND_NAME} restart <gameName>                        - restart the game
/${process.env.COMMAND_NAME} cancel <gameName>                         - cancel the creation of game
/${process.env.COMMAND_NAME} list                                      - list of all games
/${process.env.COMMAND_NAME} help                                      - list out the commands
/${process.env.COMMAND_NAME} myScore <gameName>                        - find the result of person \`\`\``;

async function runCommand(
  textArray: any,
  body: any,
  context: any,
  say: any,
  command: any,
  user: any,
  channelName: any
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
        out = "Please enter game name!";
      }
      break;
    }
    case "edit":
      if (textArray[1]) {
        let data = await QuizModel.findOne({ name: textArray[1] });
        if (data && user === data.userId) {
          await showGameEditModal(app, body, context, textArray[1], data);
        } else {
          out = ":warning: Game does not exist! :warning:";
        }
      } else {
        out = "Please enter game name!";
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
          out = ":warning: Game does not exist! :warning:";
        }
      } else {
        out = "Please enter game name!";
      }
      break;
    }
    case "start":
      if (textArray[1]) {
        let quiz = await QuizModel.findOne({ name: textArray[1] });
        if (quiz) {
          if (user === quiz.userId && !quiz.running && !quiz.paused) {
            startGame(app, context, say, quiz, channelName);
          } else {
            if (!quiz.running) {
              out = "Please start the game first!";
            } else if (quiz.paused) {
              out = "Game is paused! Please resume the game.";
            } else {
              out = ":warning: Access denied! :warning:";
            }
          }
        } else {
          out = ":warning: Game does not exist! :warning:";
        }
      } else {
        out = "Please enter game name!";
      }
      break;
    case "stop": {
      if (textArray[1]) {
        let quiz = await QuizModel.findOne({ name: textArray[1] });
        if (quiz) {
          if (user === quiz.userId) {
            stopGame(quiz);
            out = "Game stopped succesfully!";
          } else {
            out = "Game is paused! Please resume the game.";
          }
        } else {
          out = ":warning: Game does not exist! :warning:";
        }
      } else {
        out = "Please enter game name!";
      }
      break;
    }
    case "resume": {
      if (textArray[1]) {
        let quiz = await QuizModel.findOne({ name: textArray[1] });
        if (quiz) {
          if (user === quiz.userId && quiz.running && quiz.paused) {
            resumeGame(app, context, say, quiz, channelName);
            out = "Game resumed!";
          } else {
            if (!quiz.running) {
              out = "Please start the game first!";
            } else if (!quiz.paused) {
              out = "Game is already running!";
            } else {
              out = "Game is paused! Please resume the game.";
            }
          }
        } else {
          out = ":warning: Game does not exist! :warning:";
        }
      } else {
        out = "Please enter game name!";
      }
      break;
    }
    case "pause": {
      if (textArray[1]) {
        let quiz = await QuizModel.findOne({ name: textArray[1] });
        if (quiz) {
          if (user === quiz.userId && quiz.running) {
            pauseGame(app, context, say, quiz, channelName);
            out = "Game paused!";
          } else {
            if (!quiz.running) {
              out = "Please start the game first!";
            } else {
              out = ":warning: Game does not exist! :warning:";
            }
          }
        } else {
          out = ":warning: Game does not exist! :warning:";
        }
      } else {
        out = "Please enter game name!";
      }
      break;
    }
    case "restart": {
      if (textArray[1]) {
        let quiz = await QuizModel.findOne({ name: textArray[1] });
        let user = body.user_id;
        if (quiz) {
          if (user === quiz.userId) {
            stopGame(quiz);
            setTimeout(() => {
              startGame(app, context, say, quiz, channelName);
            }, 1000);
          } else {
            out = ":warning: Game does not exist! :warning:";
          }
        } else {
          out = ":warning: Game does not exist! :warning:";
        }
      } else {
        out = "Please enter game name!";
      }
      break;
    }
    case "cancel":
      if (textArray[1]) {
        out = "Cancelling the game";
        cancelGame(textArray[1]);
      } else {
        out = "Please enter game name!";
      }
      break;
    case "list":
      await showGameList(app, say, user, context, body);
      // TODO: can show a modal for this
      break;
    case "help":
      out = commandsList;
      break;
    case "scoreboard":
      if (textArray[1]) {
        let quiz = await QuizModel.findOne({ name: textArray[1] });
        if (quiz) {
          out = await getScoreboard(quiz);
        } else {
          out = ":warning: Game does not exist! :warning:";
        }
      } else {
        out = "Please enter game name!";
      }
      break;
    case "myScore":
      if (textArray[1]) {
        let quiz = await QuizModel.findOne({ name: textArray[1] });
        if (quiz) {
          out = await getUserScore(quiz, command.user_id);
        } else {
          out = ":warning: Game does not exist! :warning:";
        }
      } else {
        out = "Please enter game name!";
      }
      break;
    default:
      out = `<@${command.user_id}> ${command.text}`;
      break;
  }
  if (out) {
    let message: any = {
      token: context.botToken,
      channel: body.channel_name,
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
    const channelName = body.channel_name;

    runCommand(textArray, body, context, say, command, user, channelName);
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
    const channelName = body["channel"]["name"];
    let messageObj: any = {
      token: context.botToken,
      channel: user,
      user: user,
      text: "",
    };

    if (action.name === "edit") {
      let data = await QuizModel.findOne({ name: action.value });
      if (data && user === data.userId && !data.running) {
        await showGameEditModal(app, body, context, action.value, data);
      } else {
        messageObj.text = "Error occured!";
        await app.client.chat.postEphemeral(messageObj);
      }
    } else if (action.name === "delete") {
      let name = action.value;
      let data = await QuizModel.findOne({ name: action.value });
      const user = body["user"]["id"];

      if (data && user === data.userId && !data.running) {
        QuizModel.deleteOne({ name }, async function(err: any) {
          if (err) {
            messageObj.text = "Error occured!";
          } else {
            messageObj.text = `Quiz \`${name}\` deleted successfully.`;
          }
          // deleted at most one tank document

          await app.client.chat.postEphemeral(messageObj);
        });
      } else {
        messageObj.text = "Error occured!";
        await app.client.chat.postEphemeral(messageObj);
      }
    } else if (action.name === "start") {
      runCommand(
        ["start", action.value],
        body,
        context,
        say,
        command,
        user,
        channelName
      );
    } else if (action.name === "stop") {
      runCommand(
        ["stop", action.value],
        body,
        context,
        say,
        command,
        user,
        channelName
      );
    } else if (action.name === "pause") {
      runCommand(
        ["pause", action.value],
        body,
        context,
        say,
        command,
        user,
        channelName
      );
    } else if (action.name === "resume") {
      runCommand(
        ["resume", action.value],
        body,
        context,
        say,
        command,
        user,
        channelName
      );
    } else if (action.name === "add_question") {
      runCommand(
        ["addQuestions", action.value],
        body,
        context,
        say,
        command,
        user,
        channelName
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

    console.log(action, view, body, "hello here");
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
