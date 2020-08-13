const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * User Schema
 */

export const QuestionSchema = new Schema({
  question: String,
  questionType: String,
  options: String,
  answer: String,
  answerType: String,
});
// a setter
// QuestionSchema.path("question").set(function(question: any) {
//   return question;
// });

// middleware
// QuestionSchema.pre("save", function(next: any) {
//   next();
// });

/**
 * Methods
 */

QuestionSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */

  test: function() {
    return "test";
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
};

/**
 * Statics
 */

QuestionSchema.statics = {
  /**
   * Load
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  load: function(options: any, cb: any) {
    options.select = options.select || "name username";
    return this.findOne(options.criteria)
      .select(options.select)
      .exec(cb);
  },
};

export const QuestionModel = mongoose.model("questions", QuestionSchema);
