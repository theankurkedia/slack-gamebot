export default function quizRunner(
  quiz: any,
  callbacks: {
    postQuestion: (question: any, index: number) => void;
    postScoreboard: (question: any, index: number) => void;
  }
) {
  const timePerQuestion = quiz.config.timePerQuestion * 1000; // in milliseconds

  quiz.questions.forEach((question: any, index: number) => {
    setTimeout(() => {
      callbacks.postQuestion(question, index);
      console.log(
        "asking question after ",
        timePerQuestion * index + 5000 * index,
        " seconds "
      );
    }, timePerQuestion * index + 5000 * index);

    setTimeout(() => {
      callbacks.postScoreboard(question, index);
      console.log(
        "posting score after ",
        timePerQuestion * index + 5000 * index + timePerQuestion
      );
    }, timePerQuestion * index + 5000 * index + timePerQuestion);
  });
}
