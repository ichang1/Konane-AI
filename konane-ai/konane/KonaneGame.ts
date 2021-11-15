import { MinMax, MinMaxNode } from "../utils/MinMax";
import { randInt } from "../utils/misc";
import Konane from "./Konane";
import {
  oppositeColor,
  getKonaneSuccessors,
  boardValueDiff,
} from "./KonaneGameUtils";
import { Player, Action, BLACK, WHITE } from "./KonaneUtils";

export default class KonaneGame {
  human: Player = WHITE;
  computer: Player = BLACK;
  difficulty: number;
  konane: Konane;
  private minMaxHandler: MinMax<Konane, Action | null>;

  constructor(human: Player, difficulty: number) {
    this.human = human;
    this.computer = oppositeColor(human);
    this.difficulty = Math.floor(difficulty);
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
    if (this.difficulty < 2) {
      const legalActions = this.getLegalComputerActions();
      const legalActionsFlat = [...legalActions.values()].flat(1);
      if (legalActionsFlat.length === 0) return null;
      const randIdx = randInt(0, legalActionsFlat.length - 1);
      return legalActionsFlat[randIdx];
    } else {
      const minMaxNode = new MinMaxNode<Konane, Action | null>(
        this.konane,
        getKonaneSuccessors,
        "max",
        0,
        null
        // konaneSuccessorsCmp
      );
      return this.minMaxHandler.minMaxAlphaBeta(
        minMaxNode,
        this.difficulty,
        getKonaneStaticEval(this.computer, boardValueDiff)
      );
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
