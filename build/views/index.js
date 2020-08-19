"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQuestionModal = exports.addQuestionsModal = exports.showGameCreateModal = exports.showGameEditModal = exports.getModalView = void 0;
const lodash_1 = require("lodash");
function getQuestionAnswerElements(number, data, showLastDivider = true) {
    let elements = [];
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
        let questionData = lodash_1.get(data, `questions[${i}]`);
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
function getConfigElements(data) {
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
                initial_option: data && lodash_1.get(data, "config.answerMatchPercentage")
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
                initial_value: data && lodash_1.get(data, "config.timePerQuestion")
                    ? lodash_1.get(data, "config.timePerQuestion").toString()
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
function getModalView(body, context, gameName, questionNos, callbackContext, viewId, data) {
    const questionElements = getQuestionAnswerElements(questionNos, data, callbackContext !== "addQuestions");
    const configElements = callbackContext !== "addQuestions" ? getConfigElements(data) : [];
    return {
        token: context.botToken,
        view_id: viewId,
        trigger_id: body.trigger_id,
        view: {
            type: "modal",
            callback_id: callbackContext === "new"
                ? "modal_create_callback_id"
                : callbackContext === "edit"
                    ? "modal_edit_callback_id"
                    : "modal_add_questions_callback_id",
            title: {
                type: "plain_text",
                text: `${callbackContext === "new"
                    ? "Create"
                    : callbackContext === "edit"
                        ? "Edit"
                        : ""} Game - ${lodash_1.capitalize(gameName)}`,
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
                            text: `${callbackContext === "edit" ? `Edit ` : `Add `} Questions`,
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
exports.getModalView = getModalView;
async function showGameEditModal(app, body, context, gameName, data) {
    try {
        await app.client.views.open(getModalView(body, context, gameName, data ? data.questions.length : 1, "edit", undefined, data));
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
exports.showGameEditModal = showGameEditModal;
async function showGameCreateModal(app, body, context, name, initialQuestions) {
    try {
        await app.client.views.open(getModalView(body, context, name, initialQuestions, "new"));
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
exports.showGameCreateModal = showGameCreateModal;
async function addQuestionsModal(app, body, context, name, questionNos) {
    try {
        await app.client.views.open(getModalView(body, context, name, questionNos, "addQuestions"));
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
exports.addQuestionsModal = addQuestionsModal;
async function updateQuestionModal(app, body, context, gameName, questionNos, callbackContext, data) {
    try {
        await app.client.views.update(getModalView(body, context, gameName, questionNos, callbackContext, body.view.id, data));
    }
    catch (error) {
        console.error(error);
    }
}
exports.updateQuestionModal = updateQuestionModal;
