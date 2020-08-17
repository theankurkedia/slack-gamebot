import ScoreBoard from "./models/ScoreboardTemp";
import { App, Context, SayFn } from "@slack/bolt";
import quizRunner from "./services/quizRunner";
import { isNil, get, forEach } from "lodash";
import { QuizModel } from "./models/Quiz";
import { ScoreboardModel } from "./models/Scoreboard";
import { getButtonAttachment } from "./utils";
const DEFAULT_QUESTIONS_COUNT = 5;
let questionCount: number = -1;

export function setExistingQuestionCount(count: number) {
  questionCount = count;
}
export function getQuestionAnswerElements(number: number, data?: any) {
  let elements = [];
  for (let i = 0; i < number; i++) {
    let questionData = get(data, `questions[${i}]`);
    elements.push({
      type: "input",
      block_id: `question_${i + 1}`,
      element: {
        type: "plain_text_input",
        initial_value: questionData ? questionData.question : undefined,
      },
      label: {
        type: "plain_text",
        text: `Question ${i + 1}`,
        emoji: true,
      },
    });
    elements.push({
      type: "input",
      block_id: `answer_${i + 1}`,
      element: {
        type: "plain_text_input",
        initial_value: questionData ? questionData.answer : undefined,
      },
      label: {
        type: "plain_text",
        text: `Answer ${i + 1}`,
        emoji: true,
      },
    });
  }
  return elements;
}
function getModalView(
  app: any,
  body: any,
  context: any,
  questionNos: number,
  newQuiz?: boolean,
  viewId?: string,
  data?: any
) {
  const questionElements = getQuestionAnswerElements(questionNos, data);
  return {
    token: context.botToken,
    view_id: viewId,
    trigger_id: body.trigger_id,
    view: {
      type: "modal",
      callback_id: newQuiz
        ? "modal_create_callback_id"
        : "modal_edit_callback_id",
      title: {
        type: "plain_text",
        text: newQuiz ? "Create Game" : "Edit Game",
        emoji: false,
      },
      submit: {
        type: "plain_text",
        text: "Submit",
        emoji: true,
      },
      close: {
        type: "plain_text",
        text: "Cancel",
        emoji: true,
      },
      blocks: [
        {
          type: "input",
          block_id: "quiz_name",
          element: {
            type: "plain_text_input",
            initial_value: data ? data.name : undefined,
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
        // {
        //   type: "section",
        //   accessory: {
        //     type: "static_select",
        //     placeholder: {
        //       type: "plain_text",
        //       text: "Select question item",
        //       emoji: true,
        //     },
        //     options: [
        //       {
        //         text: {
        //           type: "plain_text",
        //           text: "MCQ",
        //           emoji: true,
        //         },
        //         value: "answer-type-mcq",
        //       },
        //       {
        //         text: {
        //           type: "plain_text",
        //           text: "Input",
        //           emoji: true,
        //         },
        //         value: "answer-type-input",
        //       },
        //       {
        //         text: {
        //           type: "plain_text",
        //           text: "Chat",
        //           emoji: true,
        //         },
        //         value: "answer-type-chat",
        //       },
        //     ],
        //   },
        //   text: {
        //     type: "mrkdwn",
        //     text: " ",
        //   },
        // },
        ...questionElements,
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: " ",
          },
          accessory: {
            type: "button",
            action_id: "add_question",
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
  };
}
export async function showGameEditModal(
  app: any,
  body: any,
  context: any,
  data?: any
) {
  try {
    await app.client.views.open(
      getModalView(
        app,
        body,
        context,
        data ? data.questions.length : DEFAULT_QUESTIONS_COUNT,
        false,
        undefined,
        data
      )
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}
export async function showGameCreateModal(app: any, body: any, context: any) {
  try {
    await app.client.views.open(
      getModalView(app, body, context, DEFAULT_QUESTIONS_COUNT, true, undefined)
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}
export async function addQuestionFieldInModal(
  app: any,
  body: any,
  context: any,
  questionNos: number,
  newQuiz: boolean,
  data: any
) {
  try {
    await app.client.views.update(
      getModalView(app, body, context, questionNos, newQuiz, body.view.id, data)
    );
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

        console.log(formattedScoreboard, scoreboard, "format");
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
      console.log("hello here ", message);
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
