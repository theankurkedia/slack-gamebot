"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizModel = void 0;
const Question_1 = require("./Question");
const Scoreboard_1 = require("./Scoreboard");
const lodash_1 = require("lodash");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Config = new Schema({
    timePerQuestion: { type: Number, default: 10 },
    answerMatchPercentage: { type: Number, default: 0.8 },
});
/**
 * User Schema
 */
const QuizSchema = new Schema({
    name: { type: String, unique: true, required: true },
    userId: { type: String, require: true },
    config: {
        type: Config,
        default: { timePerQuestion: 10, answerMatchPercentage: 0.8 },
    },
    running: { type: Boolean, default: false },
    paused: { type: Boolean, default: false },
    currentQuestionIndex: { type: Number, default: 0 },
    channel: { type: String, defautl: "" },
    questions: [Question_1.QuestionSchema],
    scoreboard: Scoreboard_1.ScoreboardSchema,
});
QuizSchema.methods = {
    test: function () {
        return "test";
    },
    addQuestion: function (question, index) {
        if (!lodash_1.isNil(index)) {
            // replacing the question
            this.questions.splice(index, 1, question);
        }
        else {
            this.questions.push(question);
        }
    },
    deleteQuestion: function (index) {
        this.questions.splice(index, 1);
    },
    addAllQuestions: function (questions) {
        this.questions = [];
        lodash_1.forEach(questions, (quesData) => {
            const questionObj = new Question_1.QuestionModel();
            questionObj.question = quesData.question;
            questionObj.answer = quesData.answer;
            this.addQuestion(questionObj);
        });
    },
    updateUserScore: function (userId, score) {
        const scoreData = {
            userId: userId,
            score: score,
        };
        if (!this.scoreboard) {
            this.scoreboard = new Scoreboard_1.ScoreboardModel();
        }
        this.scoreboard.scores.push(scoreData);
        console.log(this.scoreboard, "hello here");
        this.save();
    },
};
/**
 * Statics
 */
QuizSchema.statics = {
    load: function (options, cb) {
        options.select = options.select || "name username";
        return this.findOne(options.criteria)
            .select(options.select)
            .exec(cb);
    },
};
exports.QuizModel = mongoose.model("quizzes", QuizSchema);
