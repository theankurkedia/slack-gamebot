import { get, capitalize } from "lodash";

function getQuestionAnswerElements(
  number: number,
  data?: any,
  showLastDivider: boolean = true
) {
  let elements: any = [];
  for (let i = 0; i < number; i++) {
    const deleteButton = data
      ? [
          {
            type: "actions",
            elements: [
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
        ]
      : [];
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
      ...deleteButton,
    ]);
    if (i !== number - 1 || showLastDivider) {
      elements.push({
        type: "divider",
      });
    }
  }
  return elements;
}
function getConfigElements(config: any) {
  return [
    {
      type: "context",
      elements: [
        {
          type: "plain_text",
          text: "Set Config",
          emoji: true,
        },
      ],
    },
    {
      type: "input",
      block_id: "answerMatchPercentage",
      element: {
        type: "static_select",
        initial_option:
          config && get(config, "answerMatchPercentage")
            ? config.answerMatchPercentage == "0.8"
              ? {
                  text: {
                    type: "plain_text",
                    text: "Partial match",
                    emoji: true,
                  },
                  value: "0.8",
                }
              : {
                  text: {
                    type: "plain_text",
                    text: "Exact match",
                    emoji: true,
                  },
                  value: "1",
                }
            : undefined,
        placeholder: {
          type: "plain_text",
          text: "Select accuracy",
          emoji: true,
        },
        options: [
          {
            text: {
              type: "plain_text",
              text: "Partial match",
              emoji: true,
            },
            value: "0.8",
          },
          {
            text: {
              type: "plain_text",
              text: "Exact match",
              emoji: true,
            },
            value: "1",
          },
        ],
      },
      label: {
        type: "plain_text",
        text: "Answer accuracy",
        emoji: true,
      },
    },
    {
      type: "input",
      block_id: "timePerQuestion",
      element: {
        type: "plain_text_input",
        initial_value:
          config && get(config, "timePerQuestion")
            ? get(config, "timePerQuestion").toString()
            : undefined,
        placeholder: {
          type: "plain_text",
          text: "Enter the time in seconds",
        },
      },
      label: {
        type: "plain_text",
        text: "Time per question",
        emoji: true,
      },
    },
  ];
}
export function getModalView(
  body: any,
  context: any,
  gameName: string,
  questionNos: number,
  callbackContext: "new" | "edit" | "addQuestions",
  viewId?: string,
  data?: any
) {
  const questionElements = getQuestionAnswerElements(
    questionNos,
    data,
    callbackContext !== "addQuestions"
  );

  let config = get(data, "config");

  if (!config) {
    config = {
      answerMatchPercentage: "0.8",
      timePerQuestion: "10",
    };
  }
  const configElements =
    callbackContext !== "addQuestions" ? getConfigElements(config) : [];

  console.log(configElements, "hello");
  return {
    token: context.botToken,
    view_id: viewId,
    trigger_id: body.trigger_id,
    view: {
      type: "modal",
      callback_id:
        callbackContext === "new"
          ? "modal_create_callback_id"
          : callbackContext === "edit"
          ? "modal_edit_callback_id"
          : "modal_add_questions_callback_id",
      title: {
        type: "plain_text",
        text: `${
          callbackContext === "new"
            ? "Create"
            : callbackContext === "edit"
            ? "Edit"
            : ""
        } Game - ${capitalize(gameName)}`,
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
              text: `${
                callbackContext === "edit" ? `Edit ` : `Add `
              } Questions`,
              emoji: true,
            },
          ],
        },
        ...questionElements,
        ...configElements,
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
        "edit",
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
  name: string,
  initialQuestions: number
) {
  try {
    await app.client.views.open(
      getModalView(body, context, name, initialQuestions, "new")
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}
export async function addQuestionsModal(
  app: any,
  body: any,
  context: any,
  name: string,
  questionNos: number
) {
  try {
    await app.client.views.open(
      getModalView(body, context, name, questionNos, "addQuestions")
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
  callbackContext: "new" | "edit" | "addQuestions",
  data: any
) {
  try {
    await app.client.views.update(
      getModalView(
        body,
        context,
        gameName,
        questionNos,
        callbackContext,
        body.view.id,
        data
      )
    );
  } catch (error) {
    console.error(error);
  }
}
