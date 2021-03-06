import { App, Context, SayFn } from "@slack/bolt";
import quizRunner from "./services/quizRunner";
import { isNil, forEach } from "lodash";
import { QuizModel } from "./models/Quiz";
import { ScoreboardModel } from "./models/Scoreboard";
import { getButtonAttachment } from "./utils";
var stringSimilarity = require("string-similarity");

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
        expectedAnswer = question.answer;
        const result = await app.client.chat.postMessage({
          // The token you used to initialize your app is stored in the `context` object
          token: context.botToken,
          channel: `#${channelName}`,
          text: `\`Question (${index + 1}/${quiz1.questions.length}):\` ${
            question.question
          }`,
        });
      },
      postScoreboard: async (question: any, index: number) => {
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

        userAwardedPointForThisRound = "";
      },
    });

    app.message(/^.*/, async ({ message, say }) => {
      if (!expectedAnswer) {
        return;
      }
      const answerMatched = stringSimilarity.compareTwoStrings(
        message.text?.toLowerCase(),
        expectedAnswer?.toLowerCase()
      );
      // console.log(
      //   "hello here ",
      //   answerMatched,
      //   answerMatched >= quiz1.config.answerMatchPercentage,
      //   userAwardedPointForThisRound
      // );
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

  const scoreboard = new ScoreboardModel();
  quiz1.scoreboard = scoreboard;
  await quiz1.save();

  playGame(app, context, say, quiz1, channelName);
}

export function getUserScore(quiz: typeof QuizModel, userId: string) {
  if (quiz.scoreboard) {
    let score = quiz.scoreboard.getUserScore(userId);
    return `Your score is \`${score}\``;
  } else {
    return `No scores found`;
  }
}

export async function getScoreboard(quiz: typeof QuizModel) {
  if (quiz.scoreboard) {
    return `\`\`\`${quiz.scoreboard.getFormattedScoreboard()}\`\`\``;
  } else {
    return `No scores found`;
  }
}

export async function showGameList(
  app: any,
  say: any,
  userId: any,
  context: any,
  channelName: any
) {
  console.log(channelName, "hell");
  let message: any = {
    token: context.botToken,
    channel: channelName,
    user: userId,
    text: "List of games.",
    attachments: [],
  };

  const quizes = await QuizModel.find({ userId });
  if (quizes && quizes.length) {
    forEach(quizes, (quiz) => {
      const attachment: any = getButtonAttachment(quiz);
      message.attachments.push(attachment);
    });
    await app.client.chat.postEphemeral(message);
  } else {
    message.text = `No games found!`;
    await app.client.chat.postEphemeral(message);
  }
}
