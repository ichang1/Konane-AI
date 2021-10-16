import { randInt } from "../utils/misc";
import Konane from "./Konane";
import {
  Player,
  Action,
  BLACK,
  WHITE,
  Cell,
  EMPTY,
  BLACK_CHECKER,
  WHITE_CHECKER,
  actionIsMoveChecker,
  actionIsRemoveChecker,
  RemoveChecker,
  MoveChecker,
  KonaneGameState,
  ComputerDifficulty,
  konaneDifficulties,
} from "./KonaneUtils";

export default class KonaneGame {
  human: Player;
  computer: Player;
  difficulty: ComputerDifficulty;
  private konane: Konane;
  constructor(human: Player, difficulty: ComputerDifficulty) {
    this.human = human;
    this.computer = human === WHITE ? BLACK : WHITE;
    this.difficulty = difficulty;
    this.konane = new Konane();
  }

  get board() {
    // current state
    return this.konane.board;
  }

  get playerToPlay() {
    if (this.konane.turn % 2 === 0) return BLACK;
    else return WHITE;
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
        if (!legalActions) return null;
        const legalActionsFlat = Object.values(legalActions).flat(1);
        const randIdx = randInt(0, legalActionsFlat.length - 1);
        return legalActionsFlat[randIdx];
      case konaneDifficulties.easy:
        return null;
      case konaneDifficulties.medium:
        return null;
      case konaneDifficulties.hard:
        return null;
      case konaneDifficulties.challenger:
        return null;
      case konaneDifficulties.grandmaster:
        return null;
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
