"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const bolt_1 = require("@slack/bolt");
const actions_1 = require("./actions");
const views_1 = require("./views");
const mongoose_1 = __importDefault(require("mongoose"));
const Quiz_1 = require("./models/Quiz");
const utils_1 = require("./utils");
const lodash_1 = require("lodash");
const getQuizFormData_1 = require("./getQuizFormData");
var stringSimilarity = require("string-similarity");
const uri = process.env.MONGODB_URI;
mongoose_1.default
    .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
    console.log("connected");
})
    .catch((err) => {
    console.log("error in connection", err);
});
const app = new bolt_1.App({
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
/${process.env.COMMAND_NAME} list                                      - list of all games
/${process.env.COMMAND_NAME} help                                      - list out the commands
/${process.env.COMMAND_NAME} myScore <gameName>                        - find the result of person \`\`\``;
async function runCommand(textArray, body, context, say, command, user, channelName) {
    let out;
    switch (textArray[0]) {
        case "create": {
            const gameName = textArray[1];
            if (gameName) {
                let questionNos = textArray[2];
                let data = await Quiz_1.QuizModel.findOne({ name: gameName });
                if (!data) {
                    await views_1.showGameCreateModal(app, body, context, textArray[1], questionNos ? Number(questionNos) : 5);
                }
                else {
                    out = ":warning: Game already exists :warning:";
                }
            }
            else {
                out = "Please enter game name!";
            }
            break;
        }
        case "edit":
            if (textArray[1]) {
                let data = await Quiz_1.QuizModel.findOne({ name: textArray[1] });
                if (data && user === data.userId) {
                    await views_1.showGameEditModal(app, body, context, textArray[1], data);
                }
                else {
                    out = ":warning: Game does not exist! :warning:";
                }
            }
            else {
                out = "Please enter game name!";
            }
            break;
        case "addQuestions": {
            const gameName = textArray[1];
            if (gameName) {
                let questionNos = textArray[2];
                let data = await Quiz_1.QuizModel.findOne({ name: gameName });
                if (data) {
                    await views_1.addQuestionsModal(app, body, context, textArray[1], questionNos ? Number(questionNos) : 1);
                }
                else {
                    out = ":warning: Game does not exist! :warning:";
                }
            }
            else {
                out = "Please enter game name!";
            }
            break;
        }
        case "start":
            if (textArray[1]) {
                let quiz = await Quiz_1.QuizModel.findOne({ name: textArray[1] });
                if (quiz) {
                    if (user === quiz.userId && !quiz.running && !quiz.paused) {
                        actions_1.startGame(app, context, say, quiz, channelName);
                    }
                    else {
                        if (!quiz.running) {
                            out = "Please start the game first!";
                        }
                        else if (quiz.paused) {
                            out = "Game is paused! Please resume the game.";
                        }
                        else {
                            out = ":warning: Access denied! :warning:";
                        }
                    }
                }
                else {
                    out = ":warning: Game does not exist! :warning:";
                }
            }
            else {
                out = "Please enter game name!";
            }
            break;
        case "stop": {
            if (textArray[1]) {
                let quiz = await Quiz_1.QuizModel.findOne({ name: textArray[1] });
                if (quiz) {
                    if (user === quiz.userId) {
                        await actions_1.stopGame(quiz);
                        out = "Game stopped succesfully!";
                    }
                    else {
                        out = "Game is paused! Please resume the game.";
                    }
                }
                else {
                    out = ":warning: Game does not exist! :warning:";
                }
            }
            else {
                out = "Please enter game name!";
            }
            break;
        }
        case "resume": {
            if (textArray[1]) {
                let quiz = await Quiz_1.QuizModel.findOne({ name: textArray[1] });
                if (quiz) {
                    if (user === quiz.userId && quiz.running && quiz.paused) {
                        actions_1.resumeGame(app, context, say, quiz, channelName);
                        out = "Game resumed!";
                    }
                    else {
                        if (!quiz.running) {
                            out = "Please start the game first!";
                        }
                        else if (!quiz.paused) {
                            out = "Game is already running!";
                        }
                        else {
                            out = "Game is paused! Please resume the game.";
                        }
                    }
                }
                else {
                    out = ":warning: Game does not exist! :warning:";
                }
            }
            else {
                out = "Please enter game name!";
            }
            break;
        }
        case "pause": {
            if (textArray[1]) {
                let quiz = await Quiz_1.QuizModel.findOne({ name: textArray[1] });
                if (quiz) {
                    if (user === quiz.userId && quiz.running) {
                        actions_1.pauseGame(app, context, say, quiz, channelName);
                        out = "Game paused!";
                    }
                    else {
                        if (!quiz.running) {
                            out = "Please start the game first!";
                        }
                        else {
                            out = ":warning: Game does not exist! :warning:";
                        }
                    }
                }
                else {
                    out = ":warning: Game does not exist! :warning:";
                }
            }
            else {
                out = "Please enter game name!";
            }
            break;
        }
        case "restart": {
            if (textArray[1]) {
                let quiz = await Quiz_1.QuizModel.findOne({ name: textArray[1] });
                let user = body.user_id;
                if (quiz) {
                    if (user === quiz.userId) {
                        actions_1.stopGame(quiz);
                        setTimeout(() => {
                            actions_1.startGame(app, context, say, quiz, channelName);
                        }, 1000);
                    }
                    else {
                        out = ":warning: Game does not exist! :warning:";
                    }
                }
                else {
                    out = ":warning: Game does not exist! :warning:";
                }
            }
            else {
                out = "Please enter game name!";
            }
            break;
        }
        case "list":
            let msgChannel = channelName !== "directmessage" ? channelName : user;
            await actions_1.showGameList(app, say, user, context, msgChannel);
            // TODO: can show a modal for this
            break;
        case "help":
            out = commandsList;
            break;
        case "scoreboard":
            if (textArray[1]) {
                let quiz = await Quiz_1.QuizModel.findOne({ name: textArray[1] });
                if (quiz) {
                    out = await actions_1.getScoreboard(quiz);
                }
                else {
                    out = ":warning: Game does not exist! :warning:";
                }
            }
            else {
                out = "Please enter game name!";
            }
            break;
        case "myScore":
            if (textArray[1]) {
                let quiz = await Quiz_1.QuizModel.findOne({ name: textArray[1] });
                if (quiz) {
                    out = await actions_1.getUserScore(quiz, command.user_id);
                }
                else {
                    out = ":warning: Game does not exist! :warning:";
                }
            }
            else {
                out = "Please enter game name!";
            }
            break;
        default:
            out = `<@${command.user_id}> ${command.text}`;
            break;
    }
    if (out) {
        let msgChannel = channelName !== "directmessage" ? channelName : user;
        let message = {
            token: context.botToken,
            channel: msgChannel,
            user: user,
            text: out,
            attachments: [],
        };
        await app.client.chat.postEphemeral(message);
    }
}
app.command(`/${process.env.COMMAND_NAME}`, async ({ ack, body, context, say, command }) => {
    await ack();
    let textArray = command.text.split(" ");
    let user = body.user_id;
    const channelName = body.channel_name;
    // if
    runCommand(textArray, body, context, say, command, user, channelName);
});
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
app.action({ callback_id: "button_callback" }, async ({ context, ack, action, view, body, say, command }) => {
    await ack();
    const user = body["user"]["id"];
    let channelName = body["channel"]["name"];
    let messageObj = {
        token: context.botToken,
        channel: user,
        user: user,
        text: "",
    };
    if (action.name === "edit") {
        let data = await Quiz_1.QuizModel.findOne({ name: action.value });
        if (data && user === data.userId && !data.running) {
            await views_1.showGameEditModal(app, body, context, action.value, data);
        }
        else {
            messageObj.text = "Error occured!";
            await app.client.chat.postEphemeral(messageObj);
        }
    }
    else if (action.name === "delete") {
        let name = action.value;
        let data = await Quiz_1.QuizModel.findOne({ name: action.value });
        const user = body["user"]["id"];
        if (data && user === data.userId && !data.running) {
            Quiz_1.QuizModel.deleteOne({ name }, async function (err) {
                if (err) {
                    messageObj.text = "Error occured!";
                }
                else {
                    messageObj.text = `Quiz \`${name}\` deleted successfully.`;
                }
                // deleted at most one tank document
                await app.client.chat.postEphemeral(messageObj);
            });
        }
        else {
            messageObj.text = "Error occured!";
            await app.client.chat.postEphemeral(messageObj);
        }
    }
    else if (action.name === "start") {
        runCommand(["start", action.value], body, context, say, command, user, channelName);
    }
    else if (action.name === "stop") {
        runCommand(["stop", action.value], body, context, say, command, user, channelName);
    }
    else if (action.name === "pause") {
        runCommand(["pause", action.value], body, context, say, command, user, channelName);
    }
    else if (action.name === "resume") {
        runCommand(["resume", action.value], body, context, say, command, user, channelName);
    }
    else if (action.name === "add_question") {
        runCommand(["addQuestions", action.value], body, context, say, command, user, channelName);
    }
});
app.action("delete_question", async ({ context, ack, action, view, body, say }) => {
    await ack();
    let name = utils_1.getGameNameFromView(body["view"]);
    let quiz = await Quiz_1.QuizModel.findOne({ name: name });
    const user = body["user"]["id"];
    if (quiz && user === quiz.userId) {
        quiz.deleteQuestion(parseInt(action.value, 10));
        quiz.save();
        await views_1.updateQuestionModal(app, body, context, name, quiz.questions.length, lodash_1.get(body, "view.callback_id") === "modal_create_callback_id"
            ? "new"
            : lodash_1.get(body, "view.callback_id") === "modal_edit_callback_id"
                ? "edit"
                : "addQuestions", quiz);
    }
});
app.view("modal_create_callback_id", async ({ ack, context, view, body }) => {
    await ack();
    const user = body["user"]["id"];
    let quizName = utils_1.getGameNameFromView(view);
    let msg = "";
    let quizFormData = getQuizFormData_1.getQuizFormData(view);
    let quiz = new Quiz_1.QuizModel();
    quiz.name = quizName;
    quiz.userId = user;
    quiz.addAllQuestions(quizFormData.questions);
    quiz.config = quizFormData.config;
    let messageObj = {
        token: context.botToken,
        channel: user,
        user: user,
        text: "",
    };
    quiz.save(async function (err) {
        if (err) {
            messageObj.text = `There was an error with your submission \n \`${err.message}\``;
        }
        else {
            messageObj.text = `Quiz created successfully.`;
            messageObj.attachments = [utils_1.getButtonAttachment(quiz)];
        }
        // Message the user
        try {
            await app.client.chat.postEphemeral(messageObj);
        }
        catch (error) {
            console.error(error);
        }
    });
});
app.view("modal_add_questions_callback_id", async ({ ack, context, view, body }) => {
    await ack();
    const user = body["user"]["id"];
    let quizName = utils_1.getGameNameFromView(view);
    let quizFormData = getQuizFormData_1.getQuizFormData(view);
    let quiz = await Quiz_1.QuizModel.findOne({ name: quizName });
    let existingQuestionLength = quiz.questions.length;
    if (quizFormData.questions) {
        quizFormData.questions.forEach((questionObj, index) => {
            quiz.addQuestion(questionObj, existingQuestionLength + index + 1);
        });
    }
    let messageObj = {
        token: context.botToken,
        channel: user,
        user: user,
        text: "",
    };
    quiz.save(async function (err) {
        if (err) {
            messageObj.text = `There was an error with your submission \n \`${err.message}\``;
        }
        else {
            messageObj.text = `Question added successfully.`;
            messageObj.attachments = [utils_1.getButtonAttachment(quiz)];
        }
        // Message the user
        try {
            await app.client.chat.postEphemeral(messageObj);
        }
        catch (error) {
            console.error(error);
        }
    });
});
app.view("modal_edit_callback_id", async ({ action, ack, context, view, body, say }) => {
    await ack();
    const user = body["user"]["id"];
    let msg = "";
    let quizName = utils_1.getGameNameFromView(view);
    let quizFormData = getQuizFormData_1.getQuizFormData(view);
    console.log(action, view, body, "hello here");
    let quiz = await Quiz_1.QuizModel.findOne({ name: quizName });
    let messageObj = {
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
        }
        catch (error) {
            console.error(error);
        }
    }
    else {
        quiz.addAllQuestions(quizFormData.questions);
        quiz.config = quizFormData.config;
        quiz.save(async function (err) {
            if (err) {
                messageObj.text = `There was an error with your submission \n \`${err.message}\``;
            }
            else {
                messageObj.text = `Quiz \`${quiz.name}\` updated successfully.`;
            }
            // Message the user
            try {
                await app.client.chat.postEphemeral(messageObj);
            }
            catch (error) {
                console.error(error);
            }
        });
    }
});
