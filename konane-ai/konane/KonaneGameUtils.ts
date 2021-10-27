import Konane from "./Konane";
import {
  Player,
  BLACK,
  WHITE,
  Action,
  actionIsMoveChecker,
  actionIsRemoveChecker,
} from "./KonaneUtils";

export type ComputerDifficulty = 0 | 1 | 2 | 3 | 4 | 5;

export const konaneDifficulties: { [key: string]: ComputerDifficulty } = {
  novice: 0,
  easy: 1,
  medium: 2,
  hard: 3,
  challenger: 4,
  grandmaster: 5,
};

export const oppositeColor = (p: Player) => {
  if (p === BLACK) return WHITE;
  else return BLACK;
};

export const isCorner = (cellPos: [number, number]) => {
  const [row, col] = cellPos;
  if (row === 0 && col === 0) return true;
  if (row === 7 && col === 0) return true;
  if (row === 0 && col === 7) return true;
  if (row === 7 && col === 7) return true;
  return false;
};

export const computerDifficultyDepths: { [key: string]: number } = {
  easy: 2,
  medium: 4,
  hard: 6,
  challenger: 8,
  grandmaster: 10,
};

export const getKonaneSuccessors = (state: Konane) => {
  const playerToPlay = state.turn % 2 === 0 ? BLACK : WHITE;
  if (playerToPlay === BLACK) return state.getBlackSuccessors();
  else return state.getWhiteSuccessors();
};

export const actionToString = (action: Action) => {
  const entries = Object.entries(action);
  return entries.toString();
};
