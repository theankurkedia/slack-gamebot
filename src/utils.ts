export const getValueFromFormInput = (obj: any) => {
  const inputObj = obj[Object.keys(obj)[0]]; //returns 'someVal'
  return inputObj.value;
};
