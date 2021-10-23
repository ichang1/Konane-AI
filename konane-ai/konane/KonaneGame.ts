import { minMax, MinMax, minMaxAlphaBeta, MinMaxNode } from "../utils/MinMax";
import { randInt } from "../utils/misc";
import Konane from "./Konane";
import {
  Player,
  Action,
  BLACK,
  WHITE,
  ComputerDifficulty,
  konaneDifficulties,
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
  private konane: Konane;
  private minMaxHandler: MinMax<Konane, Action | null>;

  constructor(human: Player, difficulty: ComputerDifficulty) {
    this.human = human;
    this.computer = human === WHITE ? BLACK : WHITE;
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
  // number of black moves minus number of white moves
  const blackComputerEvalFn = (state: Konane) => {
    const blackLegalActionsMap = state.getBlackLegalActions();
    const whiteLegalActionsMap = state.getWhiteLegalActions();
    const numBlackLegalActions =
      Object.values(blackLegalActionsMap).flat(1).length;
    const numWhiteLegalActions =
      Object.values(whiteLegalActionsMap).flat(1).length;
    if (numWhiteLegalActions === 0) return Number.POSITIVE_INFINITY;
    if (numBlackLegalActions === 0) return Number.NEGATIVE_INFINITY;
    return (
      (numBlackLegalActions - numWhiteLegalActions) *
      (numBlackLegalActions / numWhiteLegalActions)
    );
  };
  const whiteComputerEvalFn = (state: Konane) => {
    const blackLegalActionsMap = state.getBlackLegalActions();
    const whiteLegalActionsMap = state.getWhiteLegalActions();
    const numBlackLegalActions =
      Object.values(blackLegalActionsMap).flat(1).length;
    const numWhiteLegalActions =
      Object.values(whiteLegalActionsMap).flat(1).length;
    if (numWhiteLegalActions === 0) return Number.NEGATIVE_INFINITY;
    if (numBlackLegalActions === 0) return Number.POSITIVE_INFINITY;
    return (
      (numWhiteLegalActions - numBlackLegalActions) *
      (numWhiteLegalActions / numBlackLegalActions)
    );
  };
  if (computer === BLACK) return blackComputerEvalFn;
  else return whiteComputerEvalFn;
};
