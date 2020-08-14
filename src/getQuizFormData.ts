import { getValueFromFormInput } from "./utils";
import { forEach } from "lodash";
import { QuizModel } from "./models/Quiz";
import { QuestionModel } from "./models/Question";

export const getQuizFormData = (view: any) => {
  const dataInput = view["state"]["values"];
  const quizObject: any = {
    name: "",
    questions: [],
  };

  Object.entries(dataInput).map((entry) => {
    let key = entry[0];
    let value = getValueFromFormInput(entry[1]);

    if (key === "quiz_name") {
      // quiz.name = value;
      quizObject.name = value;
    } else if (key.startsWith("question_")) {
      quizObject.questions.push({
        question: value,
        answer: getValueFromFormInput(
          dataInput[`answer_${key.split(`question_`)[1]}`]
        ),
      });
    }
  });

  return quizObject;
};
