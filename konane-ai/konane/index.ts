import {
  Action,
  actionIsMoveChecker,
  BLACK,
  Player,
  WHITE,
} from "./KonaneUtils";
import KonaneGame, {
  boardValue3,
  getKonaneStaticEval,
  movableRatio,
  simple,
  weightedRatio,
} from "./KonaneGame";
import { MinMax, MinMaxNode } from "../utils/MinMax";
import Konane from "./Konane";
import { randInt } from "../utils/misc";
import {
  ComputerDifficulty,
  computerDifficultyDepths,
  oppositeColor,
  konaneDifficulties,
  getKonaneSuccessors,
} from "./KonaneGameUtils";
class KonaneGameTest extends KonaneGame {
  private minMaxHandlerHuman: MinMax<Konane, Action | null>;
  constructor(human: Player, computerDifficulty: ComputerDifficulty) {
    super(human, computerDifficulty);
    this.minMaxHandlerHuman = new MinMax();
  }

  getBestHumanAction() {
    const testNode = new MinMaxNode<Konane, Action | null>(
      this.konane,
      getKonaneSuccessors,
      "max",
      0,
      null
    );
    return this.minMaxHandlerHuman.minMaxAlphaBeta(
      testNode,
      computerDifficultyDepths.grandmaster,
      getKonaneStaticEval(this.human, weightedRatio)
    );
  }

  getRandomHumanAction() {
    const legalActionsMap = this.getLegalHumanActions();
    const legalActionsFlat = Object.values(legalActionsMap).flat(1);
    if (legalActionsFlat.length === 0) return null;
    const randIdx = randInt(0, legalActionsFlat.length - 1);
    return legalActionsFlat[randIdx];
  }
}

const human = BLACK;
const computer = oppositeColor(human);

const temp: any = {
  human,
  computer,
};
const roles = {
  ...temp,
  ...Object.fromEntries(Object.entries(temp).map(([k, v]) => [v, k])),
};

const runningTrials = true;
const TRIALS = 25;
let humanWins = 0;
let computerWins = 0;

if (runningTrials) {
  for (let trial = 0; trial < TRIALS; trial++) {
    const game = new KonaneGameTest(human, konaneDifficulties.grandmaster);
    for (let i = 0; i < 100; i++) {
      const playerToPlay = game.playerToPlay;
      if (playerToPlay === human) {
        const bestHumanAction = game.getRandomHumanAction();
        if (bestHumanAction === null) {
          // human lost, no moves left
          computerWins += 1;
          console.log("human LOSES! computer WINS", trial);
          break;
        } else {
          // console.log("human plays:", bestHumanAction);
          game.applyAction(bestHumanAction);
          // console.table(game.board);
        }
      } else {
        const bestComputerAction = game.getBestComputerAction();
        if (bestComputerAction === null) {
          // computer lost, no moves left
          humanWins += 1;
          console.log("human WINS! computer LOSES", trial);
          break;
        } else {
          // console.log("computer plays:", bestComputerAction);
          game.applyAction(bestComputerAction);
          // console.table(game.board);
        }
      }
    }
  }
  console.log("human:", humanWins, "computer:", computerWins);
} else {
  const game = new KonaneGameTest(human, konaneDifficulties.grandmaster);
  for (let i = 0; i < 100; i++) {
    const playerToPlay = game.playerToPlay;
    if (playerToPlay === human) {
      const bestHumanAction = game.getBestHumanAction();
      if (bestHumanAction === null) {
        // computer lost, no moves left
        console.log("human LOSES! computer WINS");
        break;
      } else {
        console.log("human plays:", bestHumanAction);
        game.applyAction(bestHumanAction);
        console.table(game.board);
      }
    } else {
      const bestComputerAction = game.getBestComputerAction();
      if (bestComputerAction === null) {
        // computer lost, no moves left
        console.log("human WINS! computer LOSES");
        break;
      } else {
        console.log("computer plays:", bestComputerAction);
        game.applyAction(bestComputerAction);
        console.table(game.board);
      }
    }
  }
}

// ===========================================

// simple move diff < weighted diff
// simple move diff < movable checker ratio
// weighted diff < movable checker ratio
// weighted ratio > movable checker ratio
// wighted ratio ? weight diff
