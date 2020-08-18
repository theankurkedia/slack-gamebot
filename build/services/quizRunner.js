"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Quiz_1 = require("../models/Quiz");
async function run(inputQuiz, callbacks) {
    let quiz = await Quiz_1.QuizModel.findOne({ name: inputQuiz.name });
    const timePerQuestion = quiz.config.timePerQuestion * 1000; // in milliseconds
    const index = quiz.currentQuestionIndex;
    const question = quiz.questions[index];
    console.log("quiz here", quiz.paused);
    if (question && quiz.running && !quiz.paused) {
        quiz.currentQuestionIndex = index + 1;
        quiz.save();
        callbacks.postQuestion(question, index);
        console.log("asking question after ", timePerQuestion * index + 5000 * index, " seconds ");
        setTimeout(() => {
            callbacks.postScoreboard(question, index);
            console.log("posting score after ", timePerQuestion);
            setTimeout(() => {
                //
                run(quiz, callbacks);
            }, 5000);
        }, timePerQuestion);
    }
}
function quizRunner(quiz, callbacks) {
    run(quiz, callbacks);
}
exports.default = quizRunner;
