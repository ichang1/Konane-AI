export const randInt = (min: number, max: number) => {
  min = Math.floor(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randArrElement = <T>(arr: T[]) => {
  const randIdx = randInt(0, arr.length - 1);
  return arr[randIdx];
};

export const hash = (obj: any) => {
  const s = obj.toString();
  let hash = 0;
  if (s.length == 0) return hash;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};
