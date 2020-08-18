"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionModel = exports.QuestionSchema = void 0;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
/**
 * User Schema
 */
exports.QuestionSchema = new Schema({
    question: { type: String, required: true },
    questionType: { type: String, default: "text" },
    options: { type: Array, default: [] },
    answer: { type: String, required: true },
    answerType: { type: String, default: "chat" },
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
exports.QuestionSchema.methods = {
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
    test: function () {
        return "test";
    },
};
/**
 * Statics
 */
exports.QuestionSchema.statics = {
    /**
     * Load
     *
     * @param {Object} options
     * @param {Function} cb
     * @api private
     */
    load: function (options, cb) {
        options.select = options.select || "name username";
        return this.findOne(options.criteria)
            .select(options.select)
            .exec(cb);
    },
};
exports.QuestionModel = mongoose.model("questions", exports.QuestionSchema);
