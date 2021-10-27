import { MinMax, MinMaxNode } from "../utils/MinMax";
import { randInt } from "../utils/misc";
import Konane from "./Konane";
import {
  ComputerDifficulty,
  oppositeColor,
  konaneDifficulties,
  computerDifficultyDepths,
  isCorner,
  getKonaneSuccessors,
  actionToString,
} from "./KonaneGameUtils";
import {
  Player,
  Action,
  BLACK,
  WHITE,
  actionIsRemoveChecker,
  MoveChecker,
  cellIsChecker,
  actionIsMoveChecker,
} from "./KonaneUtils";

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
        const legalActionsFlat = [...legalActions.values()].flat(1);
        if (legalActionsFlat.length === 0) return null;
        const randIdx = randInt(0, legalActionsFlat.length - 1);
        return legalActionsFlat[randIdx];
      case konaneDifficulties.easy:
        const easyNode = new MinMaxNode<Konane, Action | null>(
          this.konane,
          getKonaneSuccessors,
          "max",
          0,
          null
        );
        return this.minMaxHandler.minMaxAlphaBeta(
          easyNode,
          computerDifficultyDepths.easy,
          getKonaneStaticEval(this.computer, boardValueDiff)
        );
      case konaneDifficulties.medium:
        const mediumNode = new MinMaxNode<Konane, Action | null>(
          this.konane,
          getKonaneSuccessors,
          "max",
          0,
          null
        );
        return this.minMaxHandler.minMaxAlphaBeta(
          mediumNode,
          computerDifficultyDepths.medium,
          getKonaneStaticEval(this.computer, boardValueDiff)
        );
      case konaneDifficulties.hard:
        const hardNode = new MinMaxNode<Konane, Action | null>(
          this.konane,
          getKonaneSuccessors,
          "max",
          0,
          null
        );
        return this.minMaxHandler.minMaxAlphaBeta(
          hardNode,
          computerDifficultyDepths.hard,
          getKonaneStaticEval(this.computer, boardValueDiff)
        );
      case konaneDifficulties.challenger:
        const challengerNode = new MinMaxNode<Konane, Action | null>(
          this.konane,
          getKonaneSuccessors,
          "max",
          0,
          null
        );
        return this.minMaxHandler.minMaxAlphaBeta(
          challengerNode,
          computerDifficultyDepths.challenger,
          getKonaneStaticEval(this.computer, boardValueDiff)
        );
      case konaneDifficulties.grandmaster:
        const grandmasterNode = new MinMaxNode<Konane, Action | null>(
          this.konane,
          getKonaneSuccessors,
          "max",
          0,
          null
        );
        return this.minMaxHandler.minMaxAlphaBeta(
          grandmasterNode,
          computerDifficultyDepths.grandmaster,
          getKonaneStaticEval(this.computer, boardValueDiff)
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
export const getKonaneStaticEval = (
  computer: Player,
  hueristic: (state: Konane, player: Player) => number
) => {
  const fn = (state: Konane) => {
    return hueristic(state, computer);
  };
  return fn;
};
// classifications
// 1. checker threatens other pieces without being threatened => 2
// 2. checker threatens other pieces while also being threatened => 1
// 3. check doesn't threaten and is not threatened => 0
// 4. checker doesn't threaten other pieces while also being threatened => -1

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
  console.table(state.board);
  console.log(checkerPos);
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

export const boardValue3 = (state: Konane, player: Player) => {
  const blackLegalActionsMap = state.getBlackLegalActions();
  const whiteLegalActionsMap = state.getWhiteLegalActions();

  const playerActionsMap =
    player === BLACK ? blackLegalActionsMap : whiteLegalActionsMap;
  const opposingActionsMap =
    player === BLACK ? whiteLegalActionsMap : blackLegalActionsMap;

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
      if (!actionIsMoveChecker(action)) return;
      const actionSuccessor = successorsMap.get(actionToString(action));
      if (!actionSuccessor) return;
      let actionValue = 0;
      const { to, from } = action;

      const atCorner = isCorner(from);
      const threatened = checkerIsThreatened(state, from, player);
      const threateningInSucc = checkerIsThreatening(
        actionSuccessor,
        to,
        player
      );
      const threatenedInSucc = checkerIsThreatened(actionSuccessor, to, player);

      // if corner piece award 3 points
      // if (atCorner) actionValue += 3;

      if (threatened && threateningInSucc && !threatenedInSucc) {
        // take away opponent's move and get a move
        actionValue += 4;
      } else if (!threatened && threateningInSucc && !threatenedInSucc) {
        // move that gets a move by choice
        actionValue += 2;
      } else if (threatened && threateningInSucc && threatenedInSucc) {
        // trading piece possibly
        actionValue -= 2;
      } else if (!threatened && threateningInSucc && threatenedInSucc) {
        // putting piece in danger by choice
        actionValue -= 3;
      } else if (threatened && !threateningInSucc && threatenedInSucc) {
        // gave opponent move, but take their checker
        actionValue -= 2;
      } else if (!threatened && !threateningInSucc && threatenedInSucc) {
        // give opponent move by choice
        actionValue -= 4;
      } else if (threatened && !threateningInSucc && !threatenedInSucc) {
        // take away opponent move and get stranded
        actionValue += 2;
      } else {
        // move to get stranded by choice
        actionValue += 1;
      }
      // if (verbose) console.log(actionValue);
      //count how many
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

export const boardValueDiff = (state: Konane, player: Player) => {
  const opposingPlayer = oppositeColor(player);
  return boardValue3(state, player) - boardValue3(state, opposingPlayer);
};

export const movableRatio = (state: Konane, player: Player) => {
  const blackLegalActionsMap = state.getBlackLegalActions();
  const whiteLegalActionsMap = state.getWhiteLegalActions();
  const playerActionsMap =
    player === BLACK ? blackLegalActionsMap : whiteLegalActionsMap;
  const opposingActionsMap =
    player === BLACK ? whiteLegalActionsMap : blackLegalActionsMap;

  const playerMovableCheckers = playerActionsMap.size;
  const opposingMovableCheckers = opposingActionsMap.size;

  if (playerMovableCheckers === 0) return Number.NEGATIVE_INFINITY;
  if (opposingMovableCheckers === 0) return Number.POSITIVE_INFINITY;

  return playerMovableCheckers / opposingMovableCheckers;
};

export const weightedRatio = (state: Konane, player: Player) => {
  const blackLegalActionsMap = state.getBlackLegalActions();
  const whiteLegalActionsMap = state.getWhiteLegalActions();
  const playerActionsMap =
    player === BLACK ? blackLegalActionsMap : whiteLegalActionsMap;
  const opposingActionsMap =
    player === BLACK ? whiteLegalActionsMap : blackLegalActionsMap;

  const playerMovableCheckers = playerActionsMap.size;
  const opposingMovableCheckers = opposingActionsMap.size;

  if (playerMovableCheckers === 0) return Number.NEGATIVE_INFINITY;
  if (opposingMovableCheckers === 0) return Number.POSITIVE_INFINITY;

  return boardValue3(state, player) / boardValue3(state, oppositeColor(player));
};
