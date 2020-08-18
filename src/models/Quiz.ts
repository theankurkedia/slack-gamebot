import { QuestionModel, QuestionSchema } from "./Question";
import { ScoreboardSchema, ScoreboardModel } from "./Scoreboard";
import { forEach, isNil } from "lodash";

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
  userId: { type: String, unique: true, require: true },
  config: {
    type: Config,
    default: { timePerQuestion: 10, answerMatchPercentage: 0.8 },
  },
  running: { type: Boolean, default: false },
  currentQuestionIndex: { type: Number, default: 0 },
  channel: { type: String, defautl: "" },
  questions: [QuestionSchema],
  scoreboard: ScoreboardSchema,
});

QuizSchema.methods = {
  test: function() {
    return "test";
  },

  addQuestion: function(question: typeof QuestionModel, index?: number) {
    if (!isNil(index)) {
      // replacing the question
      this.questions.splice(index, 1, question);
    } else {
      this.questions.push(question);
    }
  },
  deleteQuestion: function(index: number) {
    this.questions.splice(index, 1);
  },
  addAllQuestions: function(questions: any) {
    this.questions = [];
    forEach(questions, (quesData) => {
      const questionObj = new QuestionModel();
      questionObj.question = quesData.question;
      questionObj.answer = quesData.answer;
      this.addQuestion(questionObj);
    });
  },

  updateUserScore: function(userId: any, score: number) {
    const scoreData = {
      userId: userId,
      score: score,
    };
    if (!this.scoreboard) {
      this.scoreboard = new ScoreboardModel();
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
  load: function(options: any, cb: any) {
    options.select = options.select || "name username";
    return this.findOne(options.criteria)
      .select(options.select)
      .exec(cb);
  },
};

export const QuizModel = mongoose.model("quizzes", QuizSchema);
