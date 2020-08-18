function run(quiz: any, callbacks: any) {
  const timePerQuestion = quiz.config.timePerQuestion * 1000; // in milliseconds

  const index = quiz.currentQuestionIndex;
  const question = quiz.questions[index];

  if (question) {
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
