import { QuizModel } from "../models/Quiz";

async function run(inputQuiz: any, callbacks: any) {
  let quiz = await QuizModel.findOne({ name: inputQuiz.name });
  const timePerQuestion = quiz.config.timePerQuestion * 1000; // in milliseconds

  const index = quiz.currentQuestionIndex;
  const question = quiz.questions[index];

  console.log("quiz here", quiz.paused);
  if (question && quiz.running && !quiz.paused) {
    quiz.currentQuestionIndex = index + 1;
    quiz.save();
    callbacks.postQuestion(question, index);
    console.log(
      "asking question after ",
      timePerQuestion * index + 5000 * index,
      " seconds "
    );

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
export default function quizRunner(
  quiz: any,
  callbacks: {
    postQuestion: (question: any, index: number) => void;
    postScoreboard: (question: any, index: number) => void;
  }
) {
  run(quiz, callbacks);
}
