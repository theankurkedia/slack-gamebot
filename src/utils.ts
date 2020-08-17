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
