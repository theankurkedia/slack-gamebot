import { get, capitalize } from "lodash";

function getStaticQuestionAnswerElements(number: number, data?: any) {
  let elements: any = [];
  for (let i = 0; i < number; i++) {
    let questionData = get(data, `questions[${i}]`);
    elements = elements.concat([
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Question ${i + 1}*`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: questionData ? questionData.question : `Question ${i + 1}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Answer*: ${
            questionData ? questionData.answer : `answer ${i + 1}`
          }`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Edit",
              emoji: true,
            },
            value: `${i + 1}`,
            action_id: "edit_question",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Delete",
              emoji: true,
            },
            value: `${i + 1}`,
            action_id: "delete_question",
          },
        ],
      },
    ]);
    if (i !== number - 1) {
      elements.push({
        type: "divider",
      });
    }
  }
  return elements;
}
function getQuestionAnswerElements(number: number, data?: any) {
  let elements: any = [];
  for (let i = 0; i < number; i++) {
    let questionData = get(data, `questions[${i}]`);
    elements = elements.concat([
      {
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
      },
      {
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
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Save",
              emoji: true,
            },
            value: `save_question_${i + 1}`,
            action_id: "save_question",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Delete",
              emoji: true,
            },
            value: `delete_question_${i + 1}`,
            action_id: "delete_question",
          },
        ],
      },
    ]);
    if (i !== number - 1) {
      elements.push({
        type: "divider",
      });
    }
  }
  return elements;
}
export async function openQuestionEditView(
  app: any,
  body: any,
  context: any,
  gameName: string,
  newQuestion: boolean,
  questionIndex: number,
  data?: any
) {
  try {
    await app.client.views.push({
      trigger_id: body.trigger_id,
      token: context.botToken,
      view_id: body.view.id,
      view: {
        type: "modal",
        callback_id: newQuestion
          ? "question_add_callback_id"
          : "question_edit_callback_id",
        title: {
          type: "plain_text",
          text: "Question" + ` ${questionIndex} - ${gameName}`,
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
            block_id: `question_view`,
            element: {
              type: "plain_text_input",
              initial_value: data ? data.question : undefined,
            },
            label: {
              type: "plain_text",
              text: `Question`,
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: `answer_view`,
            element: {
              type: "plain_text_input",
              initial_value: data ? data.answer : undefined,
            },
            label: {
              type: "plain_text",
              text: `Answer`,
              emoji: true,
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error(error);
  }
}
function getModalView(
  body: any,
  context: any,
  gameName: string,
  questionNos: number,
  newQuiz?: boolean,
  viewId?: string,
  data?: any
) {
  const questionElements = getStaticQuestionAnswerElements(questionNos, data);
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
        text: `${newQuiz ? "Create Game" : "Edit Game"} - ${capitalize(
          gameName
        )}`,
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
  gameName: string,
  data: any
) {
  try {
    await app.client.views.open(
      getModalView(
        body,
        context,
        gameName,
        data ? data.questions.length : 1,
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
export async function showGameCreateModal(
  app: any,
  body: any,
  context: any,
  name: string
) {
  try {
    await app.client.views.open(
      getModalView(body, context, name, 1, true, undefined)
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}
export async function updateQuestionModal(
  app: any,
  body: any,
  context: any,
  gameName: string,
  questionNos: number,
  newQuiz: boolean,
  data: any
) {
  try {
    await app.client.views.update(
      getModalView(
        body,
        context,
        gameName,
        questionNos,
        newQuiz,
        body.view.id,
        data
      )
    );
  } catch (error) {
    console.error(error);
  }
}
