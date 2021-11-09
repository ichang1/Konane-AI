import { MinMax, MinMaxNode } from "../utils/MinMax";
import { randInt } from "../utils/misc";
import Konane from "./Konane";
import {
  ComputerDifficulty,
  oppositeColor,
  konaneDifficulties,
  computerDifficultyDepths,
  getKonaneSuccessors,
  actionToString,
  boardValue,
  boardValueDiff,
  simple2,
  simple,
  konaneSuccessorsCmp,
} from "./KonaneGameUtils";
import {
  Player,
  Action,
  BLACK,
  WHITE,
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
    const minMaxNode = new MinMaxNode<Konane, Action | null>(
      this.konane,
      getKonaneSuccessors,
      "max",
      0,
      null
      // konaneSuccessorsCmp
    );
    switch (this.difficulty) {
      case konaneDifficulties.novice:
        const legalActions = this.getLegalComputerActions();
        const legalActionsFlat = [...legalActions.values()].flat(1);
        if (legalActionsFlat.length === 0) return null;
        const randIdx = randInt(0, legalActionsFlat.length - 1);
        return legalActionsFlat[randIdx];
      case konaneDifficulties.easy:
        return this.minMaxHandler.minMaxAlphaBeta(
          minMaxNode,
          computerDifficultyDepths.easy,
          getKonaneStaticEval(this.computer, boardValueDiff)
        );
      case konaneDifficulties.medium:
        return this.minMaxHandler.minMaxAlphaBeta(
          minMaxNode,
          computerDifficultyDepths.medium,
          getKonaneStaticEval(this.computer, boardValueDiff)
        );
      case konaneDifficulties.hard:
        return this.minMaxHandler.minMaxAlphaBeta(
          minMaxNode,
          computerDifficultyDepths.hard,
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
 * @returns arrow fn for getting hueristic depending on player
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
