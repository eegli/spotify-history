// Consistent locale, hopefully less typos
export const localDS = (unixTimeStamp: number) => {
  return new Date(unixTimeStamp).toLocaleString('en-CH');
};
