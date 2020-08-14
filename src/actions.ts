import { get } from "lodash";
export function createGame(name: string) {
  // create a game with the unique id
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
      callback_id: "modal_callback_id",
      title: {
        type: "plain_text",
        text: "Create Game",
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
export async function showGameCreateModal(app: any, body: any, context: any) {
  try {
    const questionElements = getQuestionAnswerElements(5);
    await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "modal_create_callback_id",
        title: {
          type: "plain_text",
          text: "Create Game",
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
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}
export async function showGameEditModal(
  app: any,
  body: any,
  context: any,
  data: any
) {
  try {
    const questionElements = getQuestionAnswerElements(
      data.questions.length,
      data
    );
    await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "modal_edit_callback_id",
        title: {
          type: "plain_text",
          text: "Edit Game",
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
            type: "context",
            elements: [
              {
                type: "plain_text",
                text: "Edit Questions",
                emoji: true,
              },
            ],
          },
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
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}
export async function addQuestionFieldInModal(
  app: any,
  body: any,
  context: any,
  questionNos: number
) {
  try {
    await app.client.views.update(
      getModalView(app, body, context, questionNos, body.view.id)
    );
  } catch (error) {
    console.error(error);
  }
}
export function setGameType(type: string) {
  // sets the game type
}
export function startGame(name: string) {
  // start game
}
export function cancelGame(name: string) {
  // cancel game
}

let index = 3;
export function getNextQuestionNumber() {
  return ++index;
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