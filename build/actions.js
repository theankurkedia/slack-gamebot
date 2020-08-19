"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showGameList = exports.getScoreboard = exports.getUserScore = exports.startGame = exports.resumeGame = exports.pauseGame = exports.stopGame = void 0;
const quizRunner_1 = __importDefault(require("./services/quizRunner"));
const lodash_1 = require("lodash");
const Quiz_1 = require("./models/Quiz");
const Scoreboard_1 = require("./models/Scoreboard");
const utils_1 = require("./utils");
var stringSimilarity = require("string-similarity");
async function stopGame(quiz1) {
    //
    quiz1.running = false;
    quiz1.paused = false;
    await quiz1.save();
}
exports.stopGame = stopGame;
function playGame(app, context, say, quiz1, channelName) {
    const scoreboard = quiz1.scoreboard;
    setTimeout(() => {
        let expectedAnswer = null;
        let userAwardedPointForThisRound = "";
        quizRunner_1.default(quiz1, {
            postQuestion: async (question, index) => {
                expectedAnswer = question.answer;
                const result = await app.client.chat.postMessage({
                    // The token you used to initialize your app is stored in the `context` object
                    token: context.botToken,
                    channel: `#${channelName}`,
                    text: `\`Question (${index + 1}/${quiz1.questions.length}):\` ${question.question}`,
                });
            },
            postScoreboard: async (question, index) => {
                expectedAnswer = null;
                scoreboard.save();
                const formattedScoreboard = scoreboard.getFormattedScoreboard();
                console.log(formattedScoreboard, "format");
                // if (formattedScoreboard) {
                const pointsMessage = userAwardedPointForThisRound
                    ? `<@${userAwardedPointForThisRound}> gets this one. `
                    : `Oops! Looks like no one got this one. `;
                await app.client.chat.postMessage({
                    // The token you used to initialize your app is stored in the `context` object
                    token: context.botToken,
                    channel: `#${channelName}`,
                    text: `Time up :clock1:

${pointsMessage}
The correct answer was \`${question.answer}\`.

${index === quiz1.questions.length - 1
                        ? "This is the final scoreboard!"
                        : "Here's the scoreboard:"}
\`\`\`${formattedScoreboard ? formattedScoreboard : "---------"}\`\`\`

`,
                });
                if (index === quiz1.questions.length - 1) {
                    const winners = scoreboard.getWinners();
                    await app.client.chat.postMessage({
                        // The token you used to initialize your app is stored in the `context` object
                        token: context.botToken,
                        channel: `#${channelName}`,
                        text: `
The winner${winners.length > 1 ? "s" : ""} of ${quiz1.name} ${winners.length > 1 ? "are" : "is"} :drum_with_drumsticks: :drum_with_drumsticks: :drum_with_drumsticks:
          `,
                    });
                    setTimeout(async () => {
                        let winnersString = "";
                        winners.forEach((winner) => {
                            winnersString += `<@${winner}> `;
                        });
                        await app.client.chat.postMessage({
                            // The token you used to initialize your app is stored in the `context` object
                            token: context.botToken,
                            channel: `#${channelName}`,
                            text: winnersString
                                ? `${winnersString} :tada::tada::tada:`
                                : `No one :cry:`,
                        });
                        stopGame(quiz1);
                    }, 3000);
                }
                // }
                userAwardedPointForThisRound = "";
            },
        });
        app.message(/^.*/, async ({ message, say }) => {
            var _a;
            if (!expectedAnswer) {
                return;
            }
            const answerMatched = stringSimilarity.compareTwoStrings((_a = message.text) === null || _a === void 0 ? void 0 : _a.toLowerCase(), expectedAnswer === null || expectedAnswer === void 0 ? void 0 : expectedAnswer.toLowerCase());
            // console.log(
            //   "hello here ",
            //   answerMatched,
            //   answerMatched >= quiz1.config.answerMatchPercentage,
            //   userAwardedPointForThisRound
            // );
            if (answerMatched >= quiz1.config.answerMatchPercentage &&
                !userAwardedPointForThisRound) {
                // await say(`Hello, <@${message.user}>\nBilkul sahi jawab!!!:tada:`);
                const existingUserScore = scoreboard.getUserScore(message.user);
                console.log(existingUserScore, "existingUserScore");
                if (lodash_1.isNil(existingUserScore)) {
                    scoreboard.setUserScore(message.user, 1);
                    console.log("setting 0 score");
                }
                else {
                    scoreboard.setUserScore(message.user, existingUserScore + 1);
                    console.log("setting score ", existingUserScore + 1);
                }
                userAwardedPointForThisRound = message.user;
            }
        });
    }, 5000);
}
async function pauseGame(app, context, say, quiz1, channelName) {
    //
    quiz1.paused = true;
    await quiz1.save();
}
exports.pauseGame = pauseGame;
async function resumeGame(app, context, say, quiz1, channelName) {
    //
    quiz1.paused = false;
    await quiz1.save();
    playGame(app, context, say, quiz1, channelName);
}
exports.resumeGame = resumeGame;
async function startGame(app, context, say, quiz1, channelName) {
    say("Hello everyone!\nLet's start the game.\nThe first question is coming up in 5 seconds.");
    quiz1.running = true;
    quiz1.paused = false;
    quiz1.currentQuestionIndex = 0;
    const scoreboard = new Scoreboard_1.ScoreboardModel();
    quiz1.scoreboard = scoreboard;
    await quiz1.save();
    console.log(channelName, "hello channel");
    playGame(app, context, say, quiz1, channelName);
}
exports.startGame = startGame;
function getUserScore(quiz, userId) {
    if (quiz.scoreboard) {
        let score = quiz.scoreboard.getUserScore(userId);
        return `Your score is \`${score}\``;
    }
    else {
        return `No scores found`;
    }
}
exports.getUserScore = getUserScore;
async function getScoreboard(quiz) {
    if (quiz.scoreboard) {
        return `\`\`\`${quiz.scoreboard.getFormattedScoreboard()}\`\`\``;
    }
    else {
        return `No scores found`;
    }
}
exports.getScoreboard = getScoreboard;
async function showGameList(app, say, userId, context, channelName) {
    console.log(channelName, "hell");
    let message = {
        token: context.botToken,
        channel: channelName,
        user: userId,
        text: "List of games.",
        attachments: [],
    };
    const quizes = await Quiz_1.QuizModel.find({ userId });
    if (quizes && quizes.length) {
        lodash_1.forEach(quizes, (quiz) => {
            const attachment = utils_1.getButtonAttachment(quiz);
            message.attachments.push(attachment);
        });
        await app.client.chat.postEphemeral(message);
    }
    else {
        message.text = `No games found!`;
        await app.client.chat.postEphemeral(message);
    }
}
exports.showGameList = showGameList;
