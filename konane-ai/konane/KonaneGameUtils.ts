import Konane from "./Konane";
import {
  Player,
  BLACK,
  WHITE,
  Action,
  actionIsMoveChecker,
  actionIsRemoveChecker,
  MoveChecker,
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

export const computerDifficultyDepths: { [key: string]: number } = {
  easy: 2,
  medium: 4,
  hard: 6,
  challenger: 8,
  grandmaster: 10,
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

// export const boardValue = (
//   state: Konane,
//   player: Player,
//   weights: Weights | null = null
// ) => {
//   const opposingPlayer = oppositeColor(player);
//   const blackLegalActionsMap = state.getBlackLegalActions();
//   const whiteLegalActionsMap = state.getWhiteLegalActions();

//   const playerActionsMap =
//     player === BLACK ? blackLegalActionsMap : whiteLegalActionsMap;
//   const opposingActionsMap =
//     opposingPlayer === BLACK ? blackLegalActionsMap : whiteLegalActionsMap;

//   // terminal game state
//   if (playerActionsMap.size === 0) return Number.NEGATIVE_INFINITY;
//   if (opposingActionsMap.size === 0) return Number.POSITIVE_INFINITY;

//   const successors =
//     player === BLACK ? state.getBlackSuccessors() : state.getWhiteSuccessors();

//   // { action: Konane ... }

//   const successorsMap: Map<String, Konane> = new Map(
//     successors.map(([konane, action]) => [actionToString(action), konane])
//   );

//   // { [x,y]: -inf ...}
//   const cellBestActionValue = new Map(
//     [...playerActionsMap.entries()].map(([cellPos, _]) => [
//       cellPos,
//       Number.NEGATIVE_INFINITY,
//     ])
//   );

//   playerActionsMap.forEach((actionsFromPos, cellPos) => {
//     actionsFromPos.forEach((action) => {
//       if (!actionIsMoveChecker(action)) {
//         cellBestActionValue.set(cellPos, 0);
//         return;
//       }
//       const actionSuccessor = successorsMap.get(actionToString(action));
//       if (!actionSuccessor) return;
//       let actionValue = 0;
//       const { to, from } = action;

//       const threatened = checkerIsThreatened(state, from, player);
//       const threateningInSucc = checkerIsThreatening(
//         actionSuccessor,
//         to,
//         player
//       );
//       const threatenedInSucc = checkerIsThreatened(actionSuccessor, to, player);

//       const successorOpposingActionsMap =
//         opposingPlayer === BLACK
//           ? actionSuccessor.getBlackLegalActions()
//           : actionSuccessor.getWhiteLegalActions();
//       const currentOpposingMovableCheckersCount = opposingActionsMap.size;
//       const successorOpposingMovableCheckersCount =
//         successorOpposingActionsMap.size;

//       // the number of moves opponent gains if this move is made
//       actionValue -=
//         currentOpposingMovableCheckersCount -
//         successorOpposingMovableCheckersCount;

//       if (threatened && threateningInSucc && !threatenedInSucc) {
//         // take away opponent's move and get a move
//         actionValue += weights?.one || 0;
//       } else if (!threatened && threateningInSucc && !threatenedInSucc) {
//         // move that gets a move by choice
//         actionValue += weights?.two || 1;
//       } else if (threatened && threateningInSucc && threatenedInSucc) {
//         // trading piece possibly
//         actionValue += weights?.three || 0;
//       } else if (!threatened && threateningInSucc && threatenedInSucc) {
//         // putting piece in danger by choice
//         actionValue += weights?.four || 0;
//       } else if (threatened && !threateningInSucc && threatenedInSucc) {
//         // gave opponent move, but take their checker
//         actionValue += weights?.five || 0;
//       } else if (!threatened && !threateningInSucc && threatenedInSucc) {
//         // give opponent move by choice
//         actionValue += weights?.six || 0;
//       } else if (threatened && !threateningInSucc && !threatenedInSucc) {
//         // take away opponent move and get stranded
//         actionValue += weights?.seven || 0;
//       } else {
//         // move to get stranded by choice
//         actionValue += weights?.eight || 1;
//       }
//       //count how many
//       cellBestActionValue.set(
//         cellPos,
//         Math.max(actionValue, cellBestActionValue.get(cellPos)!)
//       );
//     });
//   });

//   const value = [...cellBestActionValue.values()].reduce(
//     (acc, cur) => acc + cur,
//     0
//   );

//   return value;
// };

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
        cellBestActionValue.set(cellPos, 0);
        return;
      }
      const actionSuccessor = successorsMap.get(actionToString(action));
      if (!actionSuccessor) return;
      let actionValue = 0;
      const { to, from } = action;

      const threatened = checkerIsThreatened(state, from, player);
      const threateningInSucc = checkerIsThreatening(
        actionSuccessor,
        to,
        player
      );
      const threatenedInSucc = checkerIsThreatened(actionSuccessor, to, player);

      const successorOpposingActionsMap =
        opposingPlayer === BLACK
          ? actionSuccessor.getBlackLegalActions()
          : actionSuccessor.getWhiteLegalActions();
      const currentOpposingMovableCheckersCount = opposingActionsMap.size;
      const successorOpposingMovableCheckersCount =
        successorOpposingActionsMap.size;

      if (isCorner(cellPos)) {
        actionValue += 1.45;
      } else if (!threatened && threateningInSucc && !threatenedInSucc) {
        // move that gets a move by choice
        actionValue += 1.3;
      } else if (!threatened && !threateningInSucc && !threatenedInSucc) {
        // move to get stranded by choice
        actionValue += 1.15;
      } else {
        actionValue += 1;
      }
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
  return boardValue(state, player) - boardValue(state, opposingPlayer);
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

export const isCorner = (cellPos: [number, number]) => {
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
