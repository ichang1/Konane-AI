export const randInt = (min: number, max: number) => {
  min = Math.floor(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randArrElement = <T>(arr: T[]) => {
  const randIdx = randInt(0, arr.length - 1);
  return arr[randIdx];
};
