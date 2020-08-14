import { QuestionModel, QuestionSchema } from "./Question";
import { ScoreboardSchema, ScoreboardModel } from "./Scoreboard";
import { forEach } from "lodash";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * User Schema
 */

const QuizSchema = new Schema({
  name: { type: String, unique: true, required: true },
  userId: { type: String, unique: true, require: true },
  config: String,
  running: { type: Boolean, default: false },
  channel: { type: String, defautl: "" },
  questions: [QuestionSchema],
  scoreboard: ScoreboardSchema,
});

QuizSchema.methods = {
  test: function() {
    return "test";
  },

  addQuestion: function(question: typeof QuestionModel) {
    this.questions.push(question);
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
