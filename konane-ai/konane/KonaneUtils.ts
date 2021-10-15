export const BLACK: Player = "black";
export const WHITE: Player = "white";
export const BLACK_CHECKER = "X";
export const WHITE_CHECKER = "O";
export const EMPTY = ".";
const REMOVE = "remove";
const MOVE = "move";

export type Player = "white" | "black";
export type Empty = ".";
export type Checker = "X" | "O";
export type Cell = Checker | Empty;

export const cellIsChecker = (cell: Cell): cell is Checker => {
  return cell === "X" || cell === "O";
};

export type RemoveChecker = {
  player: Player;
  type: "remove";
  cell: [number, number];
};

export type MoveChecker = {
  player: Player;
  type: "move";
  from: [number, number];
  to: [number, number];
};

export type Action = RemoveChecker | MoveChecker;

export type Jump = {
  offset: [0, 2] | [0, -2] | [2, 0] | [-2, 0];
  times: 1 | 2 | 3;
};

export const possibleJumps: Jump[] = [
  // right
  { offset: [0, 2], times: 1 },
  { offset: [0, 2], times: 2 },
  { offset: [0, 2], times: 3 },
  // left
  { offset: [0, -2], times: 1 },
  { offset: [0, -2], times: 2 },
  { offset: [0, -2], times: 3 },
  // up
  { offset: [2, 0], times: 1 },
  { offset: [2, 0], times: 2 },
  { offset: [2, 0], times: 3 },
  // down
  { offset: [-2, 0], times: 1 },
  { offset: [-2, 0], times: 2 },
  { offset: [-2, 0], times: 3 },
];

type Tuple<TItem, TLength extends number> = [TItem, ...TItem[]] & {
  length: TLength;
};

export type Board<T> = Tuple<T, 8>;

export const actionIsMoveChecker = (action: Action): action is MoveChecker => {
  const { type } = action;
  return type === "move";
};

export const actionIsRemoveChecker = (
  action: Action
): action is RemoveChecker => {
  const { type } = action;
  return type === "remove";
};

export type KonaneGameState = {
  action: Action;
  board: Cell[][];
  turn: number;
  playerValues: {
    white: number;
    black: number;
  };
};

export type ComputerDifficulty = 0 | 1 | 2 | 3 | 4 | 5;

export const konaneDifficulties: { [key: string]: ComputerDifficulty } = {
  novice: 0,
  easy: 1,
  medium: 2,
  hard: 3,
  challenger: 4,
  grandmaster: 5,
};

export const stringIsPlayer = (s: string): s is Player => {
  return s === WHITE || s === BLACK;
};

export const verboseCellPosition = (pos: [number, number]) => {
  const [row, col] = pos;
  return [col + 1, 8 - row];
};
