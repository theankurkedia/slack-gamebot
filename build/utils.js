"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getButtonAttachment = exports.getValueFromView = exports.getQuestionIndex = exports.getQuestionNumberFromView = exports.getGameNameFromView = exports.getSelectedOptionFromFormInput = exports.getValueFromFormInput = void 0;
exports.getValueFromFormInput = (obj) => {
    const inputObj = obj[Object.keys(obj)[0]];
    return inputObj.value;
};
exports.getSelectedOptionFromFormInput = (obj) => {
    const inputObj = obj[Object.keys(obj)[0]];
    return inputObj.selected_option.value;
};
function getGameNameFromView(view) {
    let quizName = view["title"]["text"];
    quizName = quizName ? quizName.split(" ") : [];
    quizName = quizName[quizName.length - 1]
        ? quizName[quizName.length - 1].toLowerCase()
        : undefined;
    return quizName;
}
exports.getGameNameFromView = getGameNameFromView;
function getQuestionNumberFromView(view) {
    let no = view["title"]["text"];
    no = no ? no.split(" ") : [];
    no = no[1];
    return no - 1;
}
exports.getQuestionNumberFromView = getQuestionNumberFromView;
function getQuestionIndex(view) {
    let no = view["title"]["text"];
    no = no ? no.split(" ") : [];
    no = no[1];
    return no - 1;
}
exports.getQuestionIndex = getQuestionIndex;
function getValueFromView(view, name) {
    const dataInput = view["state"]["values"];
    // Object.entries(dataInput).map((entry) => {
    //   let key = entry[0];
    let value = exports.getValueFromFormInput(dataInput[name]);
    return value;
    // console.log(dataInput[name]);
    //   if (key === "quiz_name") {
    //     // quiz.name = value;
    //     quizObject.name = value;
    //   } else if (key.startsWith("question_")) {
    //     quizObject.questions.push({
    //       question: value,
    //       answer: getValueFromFormInput(
    //         dataInput[`answer_${key.split(`question_`)[1]}`]
    //       ),
    //     });
    //   }
    // });
    // return quizObject;
    // console.log(view, "view here");
    // let no = view["title"]["text"];
    // no = no ? no.split(" ") : [];
    // no = no[1];
    // return no - 1;
}
exports.getValueFromView = getValueFromView;
exports.getButtonAttachment = (quiz) => {
    let attachments = {
        text: quiz.name,
        fallback: "You are unable to choose a game",
        callback_id: "button_callback",
        color: "#3AA3E3",
        actions: [
            {
                name: "add_question",
                text: "Add Question",
                type: "button",
                value: quiz.name,
            },
            {
                name: "edit",
                text: "Edit",
                type: "button",
                value: quiz.name,
            },
            {
                name: "delete",
                text: "Delete",
                style: "danger",
                type: "button",
                value: quiz.name,
                confirm: {
                    title: "Are you sure?",
                    text: "",
                    ok_text: "Yes",
                    dismiss_text: "No",
                },
            },
        ],
    };
    if (quiz.running) {
        attachments.actions.push({
            name: "stop",
            text: "Stop",
            type: "button",
            value: quiz.name,
            confirm: {
                title: "Are you sure?",
                text: "",
                ok_text: "Yes",
                dismiss_text: "No",
            },
        });
        if (quiz.paused) {
            attachments.actions.push({
                name: "resume",
                text: "Resume",
                type: "button",
                value: quiz.name,
                confirm: {
                    title: "Are you sure?",
                    text: "",
                    ok_text: "Yes",
                    dismiss_text: "No",
                },
            });
        }
        else {
            attachments.actions.push({
                name: "pause",
                text: "Pause",
                type: "button",
                value: quiz.name,
                confirm: {
                    title: "Are you sure?",
                    text: "",
                    ok_text: "Yes",
                    dismiss_text: "No",
                },
            });
        }
    }
    else {
        attachments.actions.push({
            name: "start",
            text: "Start",
            type: "button",
            value: quiz.name,
            confirm: {
                title: "Are you sure?",
                text: "",
                ok_text: "Yes",
                dismiss_text: "No",
            },
        });
    }
    return attachments;
};
