import ScoreBoard from "./models/ScoreboardTemp";
import { App, Context, SayFn } from "@slack/bolt";
import quizRunner from "./services/quizRunner";
import { isNil, get, capitalize } from "lodash";
import { QuizModel } from "./models/Quiz";
import { ScoreboardModel } from "./models/Scoreboard";
const DEFAULT_QUESTIONS_COUNT = 1;
let questionCount: number = -1;

export function setExistingQuestionCount(count: number) {
  questionCount = count;
}

export function setGameType(type: string) {
  // sets the game type
}
export async function startGame(
  app: App,
  context: Context,
  say: SayFn,
  name: string,
  channelName: string
) {
  say(
    "Hello everyone!\nLet's start the game.\nThe first question is coming up in 5 seconds."
  );

  let quiz1 = await QuizModel.findOne({ name });
  // if (!quiz1) {
  //   //
  // }
  console.log(quiz1.config, "hello quiz");

  // quiz1 = {
  //   ...quiz1,
  //   scoreboard: new ScoreBoard(),
  // };
  const scoreboard = new ScoreBoard();

  // start game

  setTimeout(() => {
    let expectedAnswer: string | null = null;
    let userAwardedPointForThisRound: string = "";
    quizRunner(quiz1, {
      postQuestion: async (question: any, index: number) => {
        const result = await app.client.chat.postMessage({
          // The token you used to initialize your app is stored in the `context` object
          token: context.botToken,
          channel: `#${channelName}`,
          text: question.question,
          // blocks: [
          //   {
          //     type: "section",
          //     text: {
          //       type: "mrkdwn",
          //       text: `Hey there <@himanshu>!`,
          //     },
          //     accessory: {
          //       type: "button",
          //       text: {
          //         type: "plain_text",
          //         text: "Click Me",
          //       },
          //       action_id: "button_click",
          //     },
          //   },
          // ],
        });

        expectedAnswer = question.answer;
      },
      postScoreboard: async (question: any, index: number) => {
        const formattedScoreboard = scoreboard.getFormattedScoreboard();
        if (formattedScoreboard) {
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
\`\`\`${formattedScoreboard}\`\`\`

`,
          });
          if (index === quiz1.questions.length - 1) {
            const winner = scoreboard.getWinner();
            await app.client.chat.postMessage({
              // The token you used to initialize your app is stored in the `context` object
              token: context.botToken,
              channel: `#${channelName}`,
              text: `
The winner of ${quiz1.name} is :drum_with_drumsticks: :drum_with_drumsticks: :drum_with_drumsticks:



            `,
            });
            setTimeout(async () => {
              await app.client.chat.postMessage({
                // The token you used to initialize your app is stored in the `context` object
                token: context.botToken,
                channel: `#${channelName}`,
                text: `<@${winner}> :tada::tada::tada:`,
              });
            }, 3000);
          }
        }

        expectedAnswer = null;
        userAwardedPointForThisRound = "";
      },
    });

    app.message(/^.*/, async ({ message, say }) => {
      if (expectedAnswer === message.text && !userAwardedPointForThisRound) {
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

  app.action("button_click", async ({ context, ack, say }) => {
    ack();
    // await app.client.chat.postMessage({
    //   // The token you used to initialize your app is stored in the `context` object
    //   token: context.botToken,
    //   channel: `#${channelName}`,
    //   text: "Button clicked",
    // });
    await say("wdwdwdw");
  });

  // await say({
  //   blocks: [
  //     {
  //       "type": "section",
  //       "text": {
  //         "type": "mrkdwn",
  //         "text": `Hey there <@${message.user}>!`
  //       },
  //       "accessory": {
  //         "type": "button",
  //         "text": {
  //           "type": "plain_text",
  //           "text": "Click Me"
  //         },
  //         "action_id": "button_click"
  //       }
  //     }
  //   ],
  //   text: `Hey there <@${message.user}>!`
  // });
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
