export function createGame(name: string) {
  // create a game with the unique id
}
export async function showGameCreateModal(app: any, body: any, context: any) {
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
export function startGame(name: string) {
  // start game
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
