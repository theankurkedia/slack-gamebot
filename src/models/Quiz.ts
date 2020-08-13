const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * User Schema
 */

const QuizSchema = new Schema({
  name: String,
});
// a setter
// QuizSchema.path("question").set(function(question: any) {
//   return question;
// });

// middleware
// QuizSchema.pre("save", function(next: any) {
//   next();
// });

/**
 * Methods
 */

QuizSchema.methods = {
  test: function() {
    return "test";
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

export const QuizModel = mongoose.model("Question", QuizSchema);
