export const BLACK: Player = "black";
export const WHITE: Player = "white";
export const BLACK_CHECKER = "X";
export const WHITE_CHECKER = "O";
export const EMPTY = ".";
const REMOVE = "remove";
const MOVE = "move";

export type Player = "white" | "black";
export type Cell = "O" | "X" | ".";
export type RemoveChecker = {
  player: Player;
  type: "remove";
  cell: number[];
};

export type MoveChecker = {
  player: Player;
  type: "move";
  from: number[];
  to: number[];
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

export const actionIsMoveChecker = (action: Action): action is MoveChecker => {
  const { type } = action;
  return type === "move";
};

export const actionIsRemoveChecker = (
  action: Action
): action is MoveChecker => {
  const { type } = action;
  return type === "remove";
};

export type KonaneGameState = {
  action: Action;
  board: Cell[][];
  playerValues: {
    white: number;
    black: number;
  };
};

export const konaneDifficulties = {
  novice: 0,
  easy: 1,
  medium: 2,
  hard: 3,
  challenger: 4,
  grandmaster: 5,
};
