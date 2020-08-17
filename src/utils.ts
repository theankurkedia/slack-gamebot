export const getValueFromFormInput = (obj: any) => {
  const inputObj = obj[Object.keys(obj)[0]]; //returns 'someVal'
  return inputObj.value;
};

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
