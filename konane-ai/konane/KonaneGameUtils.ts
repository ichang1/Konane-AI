import { pythagoreanDistance } from "../utils/misc";
import Konane from "./Konane";
import {
  Player,
  BLACK,
  WHITE,
  Action,
  actionIsMoveChecker,
  actionIsRemoveChecker,
  MoveChecker,
  RemoveChecker,
} from "./KonaneUtils";

export type ComputerDifficulty = 0 | 1 | 2 | 3 | 4 | 5;

export const konaneDifficulties: { [key: string]: ComputerDifficulty } = {
  novice: 0,
  easy: 1,
  medium: 2,
  hard: 3,
};

export const oppositeColor = (p: Player) => {
  if (p === BLACK) return WHITE;
  else return BLACK;
};

export const computerDifficultyDepths: { [key: string]: number } = {
  easy: 2,
  medium: 4,
  hard: 6,
};

export const actionToString = (action: Action) => {
  const entries = Object.entries(action);
  return entries.toString();
};

export const simple = (state: Konane, player: Player) => {
  const blackLegalActionsMap = state.getBlackLegalActions();
  const whiteLegalActionsMap = state.getWhiteLegalActions();
  const playerActionsMap =
    player === BLACK ? blackLegalActionsMap : whiteLegalActionsMap;
  const opposingActionsMap =
    player === BLACK ? whiteLegalActionsMap : blackLegalActionsMap;

  const playerActionsFlat = [...playerActionsMap.values()].flat(1);
  const opposingActionsFlat = [...opposingActionsMap.values()].flat(1);

  // terminal game state
  if (playerActionsFlat.length === 0) return Number.NEGATIVE_INFINITY;
  if (opposingActionsFlat.length === 0) return Number.POSITIVE_INFINITY;

  return playerActionsFlat.length - opposingActionsFlat.length;
};

export const simple2 = (state: Konane, player: Player) => {
  const blackLegalActionsMap = state.getBlackLegalActions();
  const whiteLegalActionsMap = state.getWhiteLegalActions();
  const playerActionsMap =
    player === BLACK ? blackLegalActionsMap : whiteLegalActionsMap;
  const opposingActionsMap =
    player === BLACK ? whiteLegalActionsMap : blackLegalActionsMap;

  const playerActionsCheckers = [...playerActionsMap.keys()].flat(1);
  const opposingActionsCheckers = [...opposingActionsMap.keys()].flat(1);

  // terminal game state
  if (playerActionsCheckers.length === 0) return Number.NEGATIVE_INFINITY;
  if (opposingActionsCheckers.length === 0) return Number.POSITIVE_INFINITY;

  return playerActionsCheckers.length - opposingActionsCheckers.length;
};

export interface Weights {
  one: number;
  two: number;
  three: number;
  four: number;
  five: number;
  six: number;
  seven: number;
  eight: number;
}

export const boardValue = (
  state: Konane,
  player: Player,
  weights: Weights | null = null
) => {
  const opposingPlayer = oppositeColor(player);
  const blackLegalActionsMap = state.getBlackLegalActions();
  const whiteLegalActionsMap = state.getWhiteLegalActions();

  const playerActionsMap =
    player === BLACK ? blackLegalActionsMap : whiteLegalActionsMap;
  const opposingActionsMap =
    opposingPlayer === BLACK ? blackLegalActionsMap : whiteLegalActionsMap;

  // terminal game state
  if (playerActionsMap.size === 0) return Number.NEGATIVE_INFINITY;
  if (opposingActionsMap.size === 0) return Number.POSITIVE_INFINITY;

  const successors =
    player === BLACK ? state.getBlackSuccessors() : state.getWhiteSuccessors();

  // { action: Konane ... }

  const successorsMap: Map<String, Konane> = new Map(
    successors.map(([konane, action]) => [actionToString(action), konane])
  );

  // { [x,y]: -inf ...}
  const cellBestActionValue = new Map(
    [...playerActionsMap.entries()].map(([cellPos, _]) => [
      cellPos,
      Number.NEGATIVE_INFINITY,
    ])
  );

  playerActionsMap.forEach((actionsFromPos, cellPos) => {
    actionsFromPos.forEach((action) => {
      if (!actionIsMoveChecker(action)) {
        cellBestActionValue.set(cellPos, removeCheckerValue(action));
        return;
      }
      const actionSuccessor = successorsMap.get(actionToString(action));
      if (!actionSuccessor) return;
      const actionValue = moveCheckerValue(state, actionSuccessor, action);
      // let actionValue = 0;
      // const { to, from } = action;

      // const threatened = checkerIsThreatened(state, from, player);
      // const threateningInSucc = checkerIsThreatening(
      //   actionSuccessor,
      //   to,
      //   player
      // );
      // const threatenedInSucc = checkerIsThreatened(actionSuccessor, to, player);

      // if (isCorner(cellPos)) {
      //   actionValue += 1.45;
      // } else if (!threatened && threateningInSucc && !threatenedInSucc) {
      //   // move that gets a move by choice
      //   actionValue += 1.3;
      // } else if (!threatened && !threateningInSucc && !threatenedInSucc) {
      //   // move to get stranded by choice
      //   actionValue += 1.15;
      // } else {
      //   actionValue += 1;
      // }
      cellBestActionValue.set(
        cellPos,
        Math.max(actionValue, cellBestActionValue.get(cellPos)!)
      );
    });
  });

  const value = [...cellBestActionValue.values()].reduce(
    (acc, cur) => acc + cur,
    0
  );
  return value;
};

export const boardValueDiff = (
  state: Konane,
  player: Player,
  weights: Weights | null = null
) => {
  const opposingPlayer = oppositeColor(player);
  return boardValue(state, player) - boardValue(state, opposingPlayer) || 0;
};

export const movableRatio = (state: Konane, player: Player) => {
  const opposingPlayer = oppositeColor(player);
  const blackLegalActionsMap = state.getBlackLegalActions();
  const whiteLegalActionsMap = state.getWhiteLegalActions();

  const playerActionsMap =
    player === BLACK ? blackLegalActionsMap : whiteLegalActionsMap;
  const opposingActionsMap =
    opposingPlayer === BLACK ? blackLegalActionsMap : whiteLegalActionsMap;

  // terminal game state
  if (playerActionsMap.size === 0) return Number.NEGATIVE_INFINITY;
  if (opposingActionsMap.size === 0) return Number.POSITIVE_INFINITY;

  return playerActionsMap.size / opposingActionsMap.size;
};

const isCorner = (cellPos: [number, number]) => {
  const [row, col] = cellPos;
  if (row === 0 && col === 0) return true;
  if (row === 7 && col === 0) return true;
  if (row === 0 && col === 7) return true;
  if (row === 7 && col === 7) return true;
  return false;
};

export const getKonaneSuccessors = (state: Konane) => {
  const playerToPlay = state.turn % 2 === 0 ? BLACK : WHITE;
  if (playerToPlay === BLACK) return state.getBlackSuccessors();
  else return state.getWhiteSuccessors();
};

const checkerIsThreatening = (
  state: Konane,
  checkerPos: [number, number],
  player: Player
) => {
  const playerActionsMap =
    player === BLACK
      ? state.getBlackLegalActions()
      : state.getWhiteLegalActions();
  return playerActionsMap.has(checkerPos);
};

const checkerIsThreatened = (
  state: Konane,
  checkerPos: [number, number],
  player: Player
) => {
  const opposingActionsMap =
    player === BLACK
      ? state.getWhiteLegalActions()
      : state.getBlackLegalActions();
  const [row, col] = checkerPos;
  const opposingActionsFlat = [...opposingActionsMap.values()].flat(1);
  for (let action of opposingActionsFlat) {
    if (actionIsMoveChecker(action)) {
      const { to, from } = action;
      const [toRow, toCol] = to;
      const [fromRow, fromCol] = from;
      const minRow = Math.min(toRow, fromRow);
      const maxRow = Math.max(toRow, fromRow);
      const minCol = Math.min(toCol, fromCol);
      const maxCol = Math.max(toCol, fromCol);
      if (minRow === maxRow) {
        // move is left/right
        if (row === minRow && minCol < col && col < maxCol) {
          return true;
        }
      } else if (minCol === maxCol) {
        // move is up/down
        if (col === minCol && minRow < row && row < maxRow) {
          return true;
        }
      }
    }
  }
  return false;
};

const moveCheckerValue = (
  state: Konane,
  successor: Konane,
  move: MoveChecker
) => {
  const player = move.player;
  let moveValue = 0;
  const { to, from } = move;

  const threatened = checkerIsThreatened(state, from, player);
  const threateningInSucc = checkerIsThreatening(successor, to, player);
  const threatenedInSucc = checkerIsThreatened(successor, to, player);

  if (isCorner(to)) {
    moveValue += 1.45;
  } else if (!threatened && threateningInSucc && !threatenedInSucc) {
    // move that gets a move by choice
    moveValue += 1.3;
  } else if (!threatened && !threateningInSucc && !threatenedInSucc) {
    // move to get stranded by choice
    moveValue += 1.15;
  } else {
    moveValue += 1;
  }
  return moveValue;
};

const removeCheckerValue = (move: RemoveChecker) => {
  const { cell, player } = move;
  const middle: [number, number] = player === BLACK ? [3, 3] : [3, 4];
  // better to remove checker in the middle of board
  return 1 / pythagoreanDistance(cell, middle);
};

export const konaneSuccessorsCmp = (
  state: Konane,
  succ1: [Konane, Action | null],
  succ2: [Konane, Action | null]
) => {
  const [succ1State, succ1Action] = succ1;
  const [succ2State, succ2Action] = succ2;
  if (!succ1Action || !succ2Action) return 0;
  if (actionIsMoveChecker(succ1Action) && actionIsMoveChecker(succ2Action)) {
    // past the start of the game
    return (
      moveCheckerValue(state, succ1State, succ1Action) -
      moveCheckerValue(state, succ2State, succ2Action)
    );
  }
  if (
    actionIsRemoveChecker(succ1Action) &&
    actionIsRemoveChecker(succ2Action)
  ) {
    // start of the game
    return removeCheckerValue(succ1Action) - removeCheckerValue(succ2Action);
  }
  // one action is move checker and other is remove checker
  // should not be possible
  return Number.NEGATIVE_INFINITY;
};
