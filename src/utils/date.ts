export const localDS = (unixTimeStamp: string) => {
  const t = parseInt(unixTimeStamp);
  return new Date(t).toLocaleString('en-CH');
};
