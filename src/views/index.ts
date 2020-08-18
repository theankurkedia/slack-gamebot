import { get, capitalize } from "lodash";

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
              text: "Delete",
              emoji: true,
            },
            value: `delete_question_${i + 1}`,
            action_id: "delete_question",
          },
        ],
      },
      {
        type: "divider",
      },
    ]);
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
      notify_on_close: true,
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
export function getModalView(
  body: any,
  context: any,
  gameName: string,
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
              text: `${data ? `Add ` : `Edit `} Questions`,
              emoji: true,
            },
          ],
        },
        ...questionElements,
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
          initial_option:
            data && get(data, "data.config.answerMatchPercentage")
              ? data.config.answerMatchPercentage == "0.8"
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
          element: {
            type: "static_select",
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
              data && get(data, "config.timePerQuestion")
                ? get(data, "config.timePerQuestion").toString()
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
  name: string,
  initialQuestions: number
) {
  try {
    await app.client.views.open(
      getModalView(body, context, name, initialQuestions, true)
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
  // console.log(
  //   app.client.views,
  //   "&&&&&&",
  //   getModalView(
  //     body,
  //     context,
  //     gameName,
  //     questionNos,
  //     newQuiz,
  //     body.view.id,
  //     data
  //   )
  // );
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
