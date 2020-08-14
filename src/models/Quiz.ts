import { QuestionModel, QuestionSchema } from "./Question";
import { ScoreboardSchema } from "./Scoreboard";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * User Schema
 */

const QuizSchema = new Schema({
  name: { type: String, unique: true, required: true },
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
