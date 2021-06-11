const prefix = (n: number) => (n < 10 ? '0' + n : n);

export const dt = (date: Date) => {
  const year = date.getFullYear();
  const month = prefix(date.getMonth() + 1);
  const day = prefix(date.getDate());
  const hours = prefix(date.getHours());
  const minutes = prefix(date.getMinutes());
  return `${year}-${month}-${day}, ${hours}:${minutes}`;
};
