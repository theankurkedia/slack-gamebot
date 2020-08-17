export const getValueFromFormInput = (obj: any) => {
  const inputObj = obj[Object.keys(obj)[0]];
  return inputObj.value;
};
export function getGameNameFromView(view: any) {
  let quizName = view["title"]["text"];
  quizName = quizName ? quizName.split(" ") : [];
  quizName = quizName[quizName.length - 1]
    ? quizName[quizName.length - 1].toLowerCase()
    : undefined;
  return quizName;
}
export function getQuestionNumberFromView(view: any) {
  let no = view["title"]["text"];
  no = no ? no.split(" ") : [];
  no = no[1];
  return no - 1;
}

export function getQuestionIndex(view: any) {
  let no = view["title"]["text"];
  no = no ? no.split(" ") : [];
  no = no[1];
  return no - 1;
}

export function getValueFromView(view: any, name: any) {
  const dataInput = view["state"]["values"];

  // Object.entries(dataInput).map((entry) => {
  //   let key = entry[0];

  let value = getValueFromFormInput(dataInput[name]);
  return value;
  console.log(dataInput[name]);

  //   if (key === "quiz_name") {
  //     // quiz.name = value;
  //     quizObject.name = value;
  //   } else if (key.startsWith("question_")) {
  //     quizObject.questions.push({
  //       question: value,
  //       answer: getValueFromFormInput(
  //         dataInput[`answer_${key.split(`question_`)[1]}`]
  //       ),
  //     });
  //   }
  // });

  // return quizObject;

  // console.log(view, "view here");
  // let no = view["title"]["text"];
  // no = no ? no.split(" ") : [];
  // no = no[1];
  // return no - 1;
}

export const getButtonAttachment = (quiz: any): any => {
  return {
    text: quiz.name,
    fallback: "You are unable to choose a game",
    callback_id: "button_callback",
    color: "#3AA3E3",
    actions: [
      {
        name: "edit",
        text: "Edit",
        type: "button",
        value: quiz.name,
      },
      {
        name: "delete",
        text: "Delete",
        style: "danger",
        type: "button",
        value: quiz.name,
        confirm: {
          title: "Are you sure?",
          text: "",
          ok_text: "Yes",
          dismiss_text: "No",
        },
      },
    ],
  };
};
