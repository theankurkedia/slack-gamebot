"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showGameList = exports.tickUserScore = exports.getScoreboard = exports.getUserScore = exports.addQuestion = exports.getNextQuestionNumber = exports.cancelGame = exports.startGame = exports.resumeGame = exports.pauseGame = exports.stopGame = exports.setGameType = exports.setExistingQuestionCount = void 0;
const quizRunner_1 = __importDefault(require("./services/quizRunner"));
const lodash_1 = require("lodash");
const Quiz_1 = require("./models/Quiz");
const Scoreboard_1 = require("./models/Scoreboard");
const utils_1 = require("./utils");
const DEFAULT_QUESTIONS_COUNT = 1;
let questionCount = -1;
var stringSimilarity = require("string-similarity");
function setExistingQuestionCount(count) {
    questionCount = count;
}
exports.setExistingQuestionCount = setExistingQuestionCount;
function setGameType(type) {
    // sets the game type
}
exports.setGameType = setGameType;
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
                const result = await app.client.chat.postMessage({
                    // The token you used to initialize your app is stored in the `context` object
                    token: context.botToken,
                    channel: `#${channelName}`,
                    text: `\`Question (${index + 1}/${quiz1.questions.length}):\` ${question.question}`,
                });
                expectedAnswer = question.answer;
            },
            postScoreboard: async (question, index) => {
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
                expectedAnswer = null;
                userAwardedPointForThisRound = "";
            },
        });
        app.message(/^.*/, async ({ message, say }) => {
            var _a;
            const answerMatched = stringSimilarity.compareTwoStrings((_a = message.text) === null || _a === void 0 ? void 0 : _a.toLowerCase(), expectedAnswer === null || expectedAnswer === void 0 ? void 0 : expectedAnswer.toLowerCase());
            console.log("hello here ", answerMatched, answerMatched >= quiz1.config.answerMatchPercentage, userAwardedPointForThisRound);
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
    await quiz1.save();
    const scoreboard = new Scoreboard_1.ScoreboardModel();
    quiz1.scoreboard = scoreboard;
    playGame(app, context, say, quiz1, channelName);
}
exports.startGame = startGame;
function cancelGame(name) {
    // cancel game
}
exports.cancelGame = cancelGame;
function getNextQuestionNumber() {
    return questionCount ? ++questionCount : DEFAULT_QUESTIONS_COUNT + 1;
}
exports.getNextQuestionNumber = getNextQuestionNumber;
function addQuestion(type) {
    // sets the game type
}
exports.addQuestion = addQuestion;
function getUserScore(userId) {
    // return user score
}
exports.getUserScore = getUserScore;
function getScoreboard(gameId) {
    return `\`\`\` Ankur  10 \`\`\``;
    // return scoreboard in sorted order and removing 0 scores
}
exports.getScoreboard = getScoreboard;
function tickUserScore(userId) {
    // add user score by 1
}
exports.tickUserScore = tickUserScore;
async function showGameList(app, say, userId, context) {
    const user = userId;
    const quizzes = await Quiz_1.QuizModel.find({ userId: user });
    if (quizzes.length) {
        let message = {
            token: context.botToken,
            channel: userId,
            user: userId,
            text: "List of games.",
            attachments: [],
        };
        lodash_1.forEach(quizzes, (quiz) => {
            const attachment = utils_1.getButtonAttachment(quiz);
            message.attachments.push(attachment);
        });
        await app.client.chat.postEphemeral(message);
        // postEphemeral
        // say(message);
    }
    else {
        await app.client.chat.postEphemeral(`No quizzes found!`);
    }
}
exports.showGameList = showGameList;
