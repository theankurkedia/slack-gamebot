import ScoreBoard from "./models/ScoreboardTemp";
import { App, Context, SayFn } from "@slack/bolt";
import quizRunner from "./services/quizRunner";
import { isNil, get, forEach, capitalize } from "lodash";
import { QuizModel } from "./models/Quiz";
import { ScoreboardModel } from "./models/Scoreboard";
import { getButtonAttachment } from "./utils";
const DEFAULT_QUESTIONS_COUNT = 1;
let questionCount: number = -1;
var stringSimilarity = require("string-similarity");

export function setExistingQuestionCount(count: number) {
  questionCount = count;
}

export function setGameType(type: string) {
  // sets the game type
}

export async function stopGame(quiz1: any) {
  //
  quiz1.running = false;
  quiz1.paused = false;
  await quiz1.save();
}

function playGame(
  app: App,
  context: Context,
  say: SayFn,
  quiz1: any,
  channelName: string
) {
  const scoreboard = quiz1.scoreboard;
  setTimeout(() => {
    let expectedAnswer: string | null = null;
    let userAwardedPointForThisRound: string = "";
    quizRunner(quiz1, {
      postQuestion: async (question: any, index: number) => {
        const result = await app.client.chat.postMessage({
          // The token you used to initialize your app is stored in the `context` object
          token: context.botToken,
          channel: `#${channelName}`,
          text: `\`Question (${index + 1}/${quiz1.questions.length}):\` ${
            question.question
          }`,
        });
        expectedAnswer = question.answer;
      },
      postScoreboard: async (question: any, index: number) => {
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

${
  index === quiz1.questions.length - 1
    ? "This is the final scoreboard!"
    : "Here's the scoreboard:"
}
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
The winner${winners.length > 1 ? "s" : ""} of ${quiz1.name} ${
              winners.length > 1 ? "are" : "is"
            } :drum_with_drumsticks: :drum_with_drumsticks: :drum_with_drumsticks:
          `,
          });

          setTimeout(async () => {
            let winnersString = "";
            winners.forEach((winner: string) => {
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
      const answerMatched = stringSimilarity.compareTwoStrings(
        message.text?.toLowerCase(),
        expectedAnswer?.toLowerCase()
      );
      console.log(
        "hello here ",
        answerMatched,
        answerMatched >= quiz1.config.answerMatchPercentage,
        userAwardedPointForThisRound
      );
      if (
        answerMatched >= quiz1.config.answerMatchPercentage &&
        !userAwardedPointForThisRound
      ) {
        // await say(`Hello, <@${message.user}>\nBilkul sahi jawab!!!:tada:`);
        const existingUserScore = scoreboard.getUserScore(message.user);
        console.log(existingUserScore, "existingUserScore");
        if (isNil(existingUserScore)) {
          scoreboard.setUserScore(message.user, 1);
          console.log("setting 0 score");
        } else {
          scoreboard.setUserScore(message.user, existingUserScore + 1);
          console.log("setting score ", existingUserScore + 1);
        }
        userAwardedPointForThisRound = message.user;
      }
    });
  }, 5000);
}

export async function pauseGame(
  app: App,
  context: Context,
  say: SayFn,
  quiz1: any,
  channelName: string
) {
  //
  quiz1.paused = true;
  await quiz1.save();
}
export async function resumeGame(
  app: App,
  context: Context,
  say: SayFn,
  quiz1: any,
  channelName: string
) {
  //
  quiz1.paused = false;
  await quiz1.save();

  playGame(app, context, say, quiz1, channelName);
}

export async function startGame(
  app: App,
  context: Context,
  say: SayFn,
  quiz1: any,
  channelName: string
) {
  say(
    "Hello everyone!\nLet's start the game.\nThe first question is coming up in 5 seconds."
  );

  quiz1.running = true;
  quiz1.paused = false;
  quiz1.currentQuestionIndex = 0;
  await quiz1.save();

  const scoreboard = new ScoreboardModel();
  quiz1.scoreboard = scoreboard;

  playGame(app, context, say, quiz1, channelName);
}
export function cancelGame(name: string) {
  // cancel game
}

export function getNextQuestionNumber() {
  return questionCount ? ++questionCount : DEFAULT_QUESTIONS_COUNT + 1;
}
export function addQuestion(type: string) {
  // sets the game type
}

export function getUserScore(userId: string) {
  // return user score
}

export function getScoreboard(gameId: string) {
  return `\`\`\` Ankur  10 \`\`\``;
  // return scoreboard in sorted order and removing 0 scores
}
export function tickUserScore(userId: string) {
  // add user score by 1
}

export async function showGameList(
  app: any,
  say: any,
  userId: any,
  context: any
) {
  // add user score by 1

  // {
  //   text: "Choose a game to play",
  //   fallback: "You are unable to choose a game",
  //   callback_id: "button_callback",
  //   color: "#3AA3E3",
  //   actions: [
  //     {
  //       name: "edit",
  //       text: "Edit Game",
  //       type: "button",
  //       value: "maze",
  //     },
  //     {
  //       name: "game",
  //       text: "Delete Game",
  //       style: "danger",
  //       type: "button",
  //       value: "war",
  //       confirm: {
  //         title: "Are you sure?",
  //         text: "",
  //         ok_text: "Yes",
  //         dismiss_text: "No",
  //       },
  //     },
  //   ],
  // },

  const user = userId;
  const quizzes = await QuizModel.find({ userId: user });
  if (quizzes.length) {
    let message: any = {
      token: context.botToken,
      channel: userId,
      text: "List of games.",
      attachments: [],
    };

    forEach(quizzes, (quiz) => {
      const attachment: any = getButtonAttachment(quiz);
      message.attachments.push(attachment);
    });

    say(message);
  } else {
    say(`No quizzes found!`);
  }
}
