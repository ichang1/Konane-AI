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

export const specialCssClasses = [
  "rotating-cell-border-black-primary",
  "rotating-cell-border-white-primary",
  "rotating-cell-border-black-secondary",
  "rotating-cell-border-white-secondary",
  "cell-border-black-primary",
  "cell-border-white-primary",
  "cell-border-black-secondary",
  "cell-border-white-secondary",
];

export const oddIndexElements = <T>(arr: T[]) => {
  const elements: T[] = [];
  arr.forEach((el, idx) => {
    if (idx % 2 === 1) elements.push(el);
  });
  return elements;
};

export const pythagoreanDistance = (
  p1: [number, number],
  p2: [number, number]
) => {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
};
