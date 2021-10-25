import { MinMax, MinMaxNode } from "../utils/MinMax";
import { randInt } from "../utils/misc";
import Konane from "./Konane";
import {
  Player,
  Action,
  BLACK,
  WHITE,
  ComputerDifficulty,
  konaneDifficulties,
  actionIsRemoveChecker,
  MoveChecker,
  cellIsChecker,
  actionIsMoveChecker,
  oppositeColor,
  isCorner,
} from "./KonaneUtils";

const computerDifficultyDepths: { [key: string]: number } = {
  easy: 2,
  medium: 4,
  hard: 6,
  challenger: 8,
  grandmaster: 10,
};
export default class KonaneGame {
  human: Player = WHITE;
  computer: Player = BLACK;
  difficulty: ComputerDifficulty;
  konane: Konane;
  private minMaxHandler: MinMax<Konane, Action | null>;

  constructor(human: Player, difficulty: ComputerDifficulty) {
    this.human = human;
    this.computer = oppositeColor(human);
    this.difficulty = difficulty;
    this.konane = new Konane();
    this.minMaxHandler = new MinMax();
  }

  get board() {
    // current state
    return this.konane.board;
  }

  get playerToPlay() {
    if (this.konane.turn % 2 === 0) return BLACK;
    else return WHITE;
  }

  get turn() {
    return this.konane.turn;
  }

  getLegalHumanActions() {
    if (this.human === BLACK) {
      return this.konane.getBlackLegalActions();
    } else {
      return this.konane.getWhiteLegalActions();
    }
  }

  getBestComputerAction(): Action | null {
    switch (this.difficulty) {
      case konaneDifficulties.novice:
        const legalActions = this.getLegalComputerActions();
        const legalActionsFlat = Object.values(legalActions).flat(1);
        if (legalActionsFlat.length === 0) return null;
        const randIdx = randInt(0, legalActionsFlat.length - 1);
        return legalActionsFlat[randIdx];
      case konaneDifficulties.easy:
        const easyNode = new MinMaxNode<Konane, Action | null>(
          this.konane,
          (k: Konane) => k.getSuccessors(),
          "max",
          0,
          null
        );
        return this.minMaxHandler.minMaxAlphaBeta(
          easyNode,
          computerDifficultyDepths.easy,
          getKonaneStaticEval(this.computer)
        );
      case konaneDifficulties.medium:
        const mediumNode = new MinMaxNode<Konane, Action | null>(
          this.konane,
          (k: Konane) => k.getSuccessors(),
          "max",
          0,
          null
        );
        return this.minMaxHandler.minMaxAlphaBeta(
          mediumNode,
          computerDifficultyDepths.medium,
          getKonaneStaticEval(this.computer)
        );
      case konaneDifficulties.hard:
        const hardNode = new MinMaxNode<Konane, Action | null>(
          this.konane,
          (k: Konane) => k.getSuccessors(),
          "max",
          0,
          null
        );
        return this.minMaxHandler.minMaxAlphaBeta(
          hardNode,
          computerDifficultyDepths.hard,
          getKonaneStaticEval(this.computer)
        );
      case konaneDifficulties.challenger:
        const challengerNode = new MinMaxNode<Konane, Action | null>(
          this.konane,
          (k: Konane) => k.getSuccessors(),
          "max",
          0,
          null
        );
        return this.minMaxHandler.minMaxAlphaBeta(
          challengerNode,
          computerDifficultyDepths.challenger,
          getKonaneStaticEval(this.computer)
        );
      case konaneDifficulties.grandmaster:
        const grandmasterNode = new MinMaxNode<Konane, Action | null>(
          this.konane,
          (k: Konane) => k.getSuccessors(),
          "max",
          0,
          null
        );
        return this.minMaxHandler.minMaxAlphaBeta(
          grandmasterNode,
          computerDifficultyDepths.grandmaster,
          getKonaneStaticEval(this.computer)
        );
      default:
        return null;
    }
  }

  getLegalComputerActions() {
    if (this.computer === BLACK) {
      return this.konane.getBlackLegalActions();
    } else {
      return this.konane.getWhiteLegalActions();
    }
  }

  applyAction(action: Action) {
    this.konane.applyAction(action);
  }
}

/**
 *
 * @param computer type of player computer is playing as
 * @returns arrow fn for gettin
 */
const getKonaneStaticEval = (computer: Player) => {
  // // number of black moves minus number of white moves
  // const blackComputerEvalFn = (state: Konane) => {
  //   const blackLegalActionsMap = state.getBlackLegalActions();
  //   const whiteLegalActionsMap = state.getWhiteLegalActions();
  //   const numBlackLegalActions =
  //     Object.values(blackLegalActionsMap).flat(1).length;
  //   const numWhiteLegalActions =
  //     Object.values(whiteLegalActionsMap).flat(1).length;
  //   if (numWhiteLegalActions === 0) return Number.POSITIVE_INFINITY;
  //   if (numBlackLegalActions === 0) return Number.NEGATIVE_INFINITY;
  //   return (
  //     (numBlackLegalActions - numWhiteLegalActions) *
  //     (numBlackLegalActions / numWhiteLegalActions)
  //   );
  // };
  // const whiteComputerEvalFn = (state: Konane) => {
  //   const blackLegalActionsMap = state.getBlackLegalActions();
  //   const whiteLegalActionsMap = state.getWhiteLegalActions();
  //   const numBlackLegalActions =
  //     Object.values(blackLegalActionsMap).flat(1).length;
  //   const numWhiteLegalActions =
  //     Object.values(whiteLegalActionsMap).flat(1).length;
  //   if (numWhiteLegalActions === 0) return Number.NEGATIVE_INFINITY;
  //   if (numBlackLegalActions === 0) return Number.POSITIVE_INFINITY;
  //   return (
  //     (numWhiteLegalActions - numBlackLegalActions) *
  //     (numWhiteLegalActions / numBlackLegalActions)
  //   );
  // };
  // if (computer === BLACK) return blackComputerEvalFn;
  // else return whiteComputerEvalFn;

  const fn = (state: Konane) => {
    const computerBoardValue = boardValue3(state, computer);
    const humanBoardValue = boardValue3(state, oppositeColor(computer));
    return computerBoardValue - humanBoardValue;
    // const successorValues = state
    //   .getSuccessors()
    //   .map(
    //     ([succ, _]) =>
    //       boardValue2(succ, computer) -
    //       boardValue2(succ, oppositeColor(computer))
    //   );
    // return Math.max(...successorValues);
  };
  return fn;
};

// const boardValue = (state: Konane, player: Player) => {
//   const blackLegalActionsMap = state.getBlackLegalActions();
//   const whiteLegalActionsMap = state.getWhiteLegalActions();
//   const numBlackLegalActions =
//     Object.values(blackLegalActionsMap).flat(1).length;
//   const numWhiteLegalActions =
//     Object.values(whiteLegalActionsMap).flat(1).length;
//   if (player === BLACK) {
//     if (numWhiteLegalActions === 0) return Number.POSITIVE_INFINITY;
//     if (numBlackLegalActions === 0) return Number.NEGATIVE_INFINITY;
//     return (
//       (numBlackLegalActions - numWhiteLegalActions) *
//       (numBlackLegalActions / numWhiteLegalActions)
//     );
//   } else {
//     // player is white
//     if (numWhiteLegalActions === 0) return Number.NEGATIVE_INFINITY;
//     if (numBlackLegalActions === 0) return Number.POSITIVE_INFINITY;
//     return (
//       (numWhiteLegalActions - numBlackLegalActions) *
//       (numWhiteLegalActions / numBlackLegalActions)
//     );
//   }
// };

// classifications
// 1. checker threatens other pieces without being threatened => 2
// 2. checker threatens other pieces while also being threatened => 1
// 3. check doesn't threaten and is not threatened => 0
// 4. checker doesn't threaten other pieces while also being threatened => -1

const boardValue = (state: Konane, player: Player) => {
  const blackLegalActionsMap = state.getBlackLegalActions();
  const whiteLegalActionsMap = state.getWhiteLegalActions();
  const playerChecker = player === BLACK ? "X" : "O";
  const playerActionsMap =
    player === BLACK ? blackLegalActionsMap : whiteLegalActionsMap;
  const opposingActionsMap =
    player === BLACK ? whiteLegalActionsMap : blackLegalActionsMap;

  let value = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = state.board[row][col];
      if (cell !== playerChecker) continue;
      const checkerPos: [number, number] = [row, col];
      const checkerThreatening = checkerIsThreatening(
        state,
        checkerPos,
        player
      );
      const checkerThreatened = checkerIsThreatened(state, checkerPos, player);
      if (checkerThreatening && !checkerThreatened) {
        //    O X O
        value += 4;
      } else if (checkerThreatening && checkerThreatened) {
        //  X O
        value += 1;
      } else if (!checkerThreatening && checkerThreatened) {
        //  X O X
        value -= 2;
      } else {
        value += 1.5;
      }
    }
  }
  return value;
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
  return checkerPos.toString() in playerActionsMap;
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
  const opposingActionsFlat = Object.values(opposingActionsMap).flat(1);
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
        if (row === minRow && minCol < col && col < maxCol) return true;
      } else if (minCol === maxCol) {
        // move is up/down
        if (col === minCol && minRow < row && row < maxRow) return true;
      }
    }
  }
  return false;
};

export const boardValue2 = (state: Konane, player: Player) => {
  const blackLegalActionsMap = state.getBlackLegalActions();
  const whiteLegalActionsMap = state.getWhiteLegalActions();
  const playerActionsMap =
    player === BLACK ? blackLegalActionsMap : whiteLegalActionsMap;
  const opposingActionsMap =
    player === BLACK ? whiteLegalActionsMap : blackLegalActionsMap;

  const playerActionsFlat = Object.values(playerActionsMap).flat(1);
  const opposingActionsFlat = Object.values(opposingActionsMap).flat(1);

  // terminal game state
  if (playerActionsFlat.length === 0) return Number.NEGATIVE_INFINITY;
  if (opposingActionsFlat.length === 0) return Number.POSITIVE_INFINITY;

  let value = 0;
  // every move counts as 1 point
  value += Object.keys(playerActionsMap).length;
  // go through each move and see how good the effect of performing that move is

  const successors = state.getSuccessors();
  successors.forEach(([succ, action]) => {
    if (!actionIsMoveChecker(action)) return;
    const { to } = action;
    const succBlackLegalActionsMap = succ.getBlackLegalActions();
    const succWhiteLegalActionsMap = succ.getWhiteLegalActions();
    const succPlayerActionsMap =
      player === BLACK ? succBlackLegalActionsMap : succWhiteLegalActionsMap;
    const succOpposingActionsMap =
      player === BLACK ? succWhiteLegalActionsMap : succBlackLegalActionsMap;
    // check status of end position of moving checker
    const checkerThreatening = checkerIsThreatening(succ, to, player);
    const checkerThreatened = checkerIsThreatened(succ, to, player);
    if (checkerThreatening && !checkerThreatened) value += 3;
    else if (checkerThreatening && checkerThreatened) value -= 1;
    else if (!checkerThreatening && checkerThreatened) value -= 2;
    else value += 1;
  });
  return value;
};

export const boardValue3 = (state: Konane, player: Player) => {
  const blackLegalActionsMap = state.getBlackLegalActions();
  const whiteLegalActionsMap = state.getWhiteLegalActions();
  const playerActionsMap =
    player === BLACK ? blackLegalActionsMap : whiteLegalActionsMap;
  const opposingActionsMap =
    player === BLACK ? whiteLegalActionsMap : blackLegalActionsMap;

  const playerActionsFlat = Object.values(playerActionsMap).flat(1);
  const opposingActionsFlat = Object.values(opposingActionsMap).flat(1);

  const successors = state.getSuccessors();

  // { [x,y]: Konane ... }
  const successorsMap: { [key: string]: Konane } = Object.fromEntries(
    successors.map((x) => x.reverse())
  );

  // terminal game state
  if (playerActionsFlat.length === 0) return Number.NEGATIVE_INFINITY;
  if (opposingActionsFlat.length === 0) return Number.POSITIVE_INFINITY;

  // { [x,y]: -inf ...}
  const cellBestActionValue: { [key: string]: number } = Object.fromEntries(
    Object.entries(playerActionsMap).map(([cellPos, _]) => [
      cellPos,
      Number.NEGATIVE_INFINITY,
    ])
  );

  Object.entries(playerActionsMap).forEach(([cellPos, actionsFromPos]) => {
    actionsFromPos.forEach((action) => {
      if (!actionIsMoveChecker(action)) return;
      let actionValue = 0;
      const { to, from } = action;

      // if corner piece award 5 points
      if (isCorner(from)) actionValue += 3;
      if (checkerIsThreatened(state, from, player)) {
        // checker can also be eatened right now
        actionValue -= 3;
      } else {
        // checker is safe
        actionValue += 2;
      }

      const threateningInSucc = checkerIsThreatening(
        successorsMap[action.toString()],
        to,
        player
      );
      const threatenedInSucc = checkerIsThreatened(
        successorsMap[action.toString()],
        to,
        player
      );

      if (threateningInSucc && !threatenedInSucc) {
        // leads to another safe move
        actionValue += 2;
      } else if (threateningInSucc && threatenedInSucc) {
        actionValue += 0;
      } else if (!threateningInSucc && threatenedInSucc) {
        actionValue -= 2;
      } else {
        actionValue += 1;
      }
      cellBestActionValue[cellPos.toString()] = Math.max(
        actionValue,
        cellBestActionValue[cellPos.toString()]
      );
    });
  });

  const value = Object.values(cellBestActionValue).reduce(
    (acc, cur) => acc + cur,
    Object.keys(cellBestActionValue).length
  );

  return value / Object.keys(cellBestActionValue).length;
};
