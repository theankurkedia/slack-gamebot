import ScoreBoard from "./models/ScoreboardTemp";
import { App, Context, SayFn } from "@slack/bolt";
import quizRunner from "./services/quizRunner";
import { isNil } from "lodash";

export function createGame(name: string) {
  // create a game with the unique id
}
export async function showGameCreateModal(app: App, body: any, context: any) {
  try {
    const result = await app.client.views.open({
      token: context.botToken,
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      view: {
        title: {
          type: "plain_text",
          text: "Create Game",
          emoji: false,
        },
        submit: {
          type: "plain_text",
          text: "Submit",
          emoji: true,
          // action_id: "game_submit",
        },
        type: "modal",
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true,
        },
        blocks: [
          {
            type: "input",
            element: {
              type: "plain_text_input",
            },
            label: {
              type: "plain_text",
              text: "Please enter a quiz name",
              emoji: true,
            },
          },
          {
            type: "divider",
          },
          {
            type: "context",
            elements: [
              {
                type: "plain_text",
                text: "Add Questions",
                emoji: true,
              },
            ],
          },
          {
            type: "input",
            element: {
              type: "plain_text_input",
            },
            label: {
              type: "plain_text",
              text: "Question 1",
              emoji: true,
            },
          },
          {
            type: "section",
            accessory: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select question item",
                emoji: true,
              },
              options: [
                {
                  text: {
                    type: "plain_text",
                    text: "MCQ",
                    emoji: true,
                  },
                  value: "answer-type-mcq",
                },
                {
                  text: {
                    type: "plain_text",
                    text: "Input",
                    emoji: true,
                  },
                  value: "answer-type-input",
                },
                {
                  text: {
                    type: "plain_text",
                    text: "Chat",
                    emoji: true,
                  },
                  value: "answer-type-chat",
                },
              ],
            },
            text: {
              type: "mrkdwn",
              text: " ",
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: " ",
            },
            accessory: {
              type: "button",
              text: {
                type: "plain_text",
                text: "Add question",
                emoji: true,
              },
              value: "add_question_button",
            },
          },
        ],
      },
    });
    // console.log(result);
  } catch (error) {
    console.error(error);
  }
}
export function setGameType(type: string) {
  // sets the game type
}
export async function startGame(
  app: App,
  context: Context,
  say: SayFn,
  name: string
) {
  say(
    "Hello everyone!\nLet's start the game.\nThe first question is coming up in 5 seconds."
  );
  const quiz1 = {
    name: "quiz1",

    config: {
      // schedule info for slack
      timePerQuestion: 10,
    },
    running: false,
    // channel: "string",
    questions: [
      {
        question: "Question question question?",
        questionType: "string",
        // options: ["pomegrenate", "banana", "apple", "potato"],
        answer: "answer",
        answerType: "chat",
      },
      {
        question: "Question question question?",
        questionType: "string",
        // options: ["pomegrenate", "banana", "apple", "potato"],
        answer: "answer",
        answerType: "chat",
      },
      {
        question: "Question question question?",
        questionType: "string",
        // options: ["pomegrenate", "banana", "apple", "potato"],
        answer: "answer",
        answerType: "chat",
      },
    ],
    scoreboard: new ScoreBoard(),
  };

  // start game

  setTimeout(() => {
    let expectedAnswer: string | null = null;
    let userAwardedPointForThisRound: string = "";
    quizRunner(quiz1, {
      postQuestion: async (question: any, index: number) => {
        const result = await app.client.chat.postMessage({
          // The token you used to initialize your app is stored in the `context` object
          token: context.botToken,
          channel: "#bot-himanshu",
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
        const scoreboard = quiz1.scoreboard.getFormattedScoreboard();
        if (scoreboard) {
          const pointsMessage = userAwardedPointForThisRound
            ? `<@${userAwardedPointForThisRound}> gets this one. `
            : `Oops! Looks like no one got this one. `;
          await app.client.chat.postMessage({
            // The token you used to initialize your app is stored in the `context` object
            token: context.botToken,
            channel: "#bot-himanshu",
            text: `Time up :clock1: 

${pointsMessage}
The correct answer was \`${question.answer}\`.

${
  index === quiz1.questions.length - 1
    ? "This is the final scoreboard!"
    : "Here's the scoreboard:"
}
${scoreboard}
 
`,
          });
          if (index === quiz1.questions.length - 1) {
            const winner = quiz1.scoreboard.getWinner();
            await app.client.chat.postMessage({
              // The token you used to initialize your app is stored in the `context` object
              token: context.botToken,
              channel: "#bot-himanshu",
              text: `
The winner of ${quiz1.name} is :drum_with_drumsticks: :drum_with_drumsticks: :drum_with_drumsticks: 
            
 
              
            `,
            });
            setTimeout(async () => {
              await app.client.chat.postMessage({
                // The token you used to initialize your app is stored in the `context` object
                token: context.botToken,
                channel: "#bot-himanshu",
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
        const existingUserScore = quiz1.scoreboard.getUserScore(message.user);
        console.log(existingUserScore, "existingUserScore");
        if (isNil(existingUserScore)) {
          quiz1.scoreboard.setUserScore(message.user, 1);
          console.log("setting 0 score");
        } else {
          quiz1.scoreboard.setUserScore(message.user, existingUserScore + 1);
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
    //   channel: "#bot-himanshu",
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
