"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizFormData = void 0;
const utils_1 = require("./utils");
exports.getQuizFormData = (view) => {
    const dataInput = view["state"]["values"];
    const quizObject = {
        name: "",
        questions: [],
    };
    Object.entries(dataInput).map((entry) => {
        let key = entry[0];
        let value = utils_1.getValueFromFormInput(entry[1]);
        if (key === "quiz_name") {
            quizObject.name = value;
        }
        else if (key.startsWith("question_")) {
            quizObject.questions.push({
                question: value,
                answer: utils_1.getValueFromFormInput(dataInput[`answer_${key.split(`question_`)[1]}`]),
            });
        }
        else if (key === "timePerQuestion") {
            if (quizObject.config) {
                quizObject.config.timePerQuestion = value;
            }
            else {
                quizObject.config = { timePerQuestion: value };
            }
        }
        else if (key === "answerMatchPercentage") {
            const selectedOption = utils_1.getSelectedOptionFromFormInput(entry[1]);
            // console.log("*** 🔥 key", selectedOption, entry[1]);
            if (quizObject.config) {
                quizObject.config.answerMatchPercentage = parseFloat(selectedOption);
            }
            else {
                quizObject.config = {
                    answerMatchPercentage: parseFloat(selectedOption),
                };
            }
        }
    });
    return quizObject;
};
