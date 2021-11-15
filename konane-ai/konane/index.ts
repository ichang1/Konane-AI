import { Action, BLACK, Player, WHITE } from "./KonaneUtils";
import KonaneGame, { getKonaneStaticEval } from "./KonaneGame";
import { MinMax, MinMaxNode } from "../utils/MinMax";
import Konane from "./Konane";
import { randInt } from "../utils/misc";
import {
  computerDifficultyDepths,
  oppositeColor,
  konaneDifficulties,
  getKonaneSuccessors,
  boardValueDiff,
} from "./KonaneGameUtils";

class KonaneGameTest extends KonaneGame {
  minMaxHandlerHuman: MinMax<Konane, Action | null>;

  nodeCount: number;
  branchCount: number;

  constructor(human: Player, difficulty: number) {
    super(human, difficulty);
    this.minMaxHandlerHuman = new MinMax();

    this.nodeCount = 0;
    this.branchCount = 0;
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
      4,
      getKonaneStaticEval(this.human, (state: Konane, player: Player) =>
        // simple2(state, player)
        boardValueDiff(state, player)
      )
    );
    return this.minMaxHandlerHuman.minMax(
      testNode,
      0,
      getKonaneStaticEval(this.human, (state: Konane, player: Player) =>
        // simple2(state, player)
        boardValueDiff(state, player)
      )
    );
  }

  getRandomHumanAction() {
    const legalActionsMap = this.getLegalHumanActions();
    const legalActionsFlat = [...legalActionsMap.values()].flat(1);
    this.nodeCount++;
    this.branchCount += legalActionsFlat.length;
    // console.log("Branch Factor: ", this.branchCount / this.nodeCount);
    if (legalActionsFlat.length === 0) return null;
    const randIdx = randInt(0, legalActionsFlat.length - 1);
    return legalActionsFlat[randIdx];
  }
}

const human = WHITE;
const computer = oppositeColor(human);

const temp: any = {
  human,
  computer,
};
const roles = {
  ...temp,
  ...Object.fromEntries(Object.entries(temp).map(([k, v]) => [v, k])),
};

const runningTrials = false;
const branchFactor = false;
const minmaxBranch = false;
const minmaxABBranch = true;
const TRIALS = 100;

if (runningTrials) {
  runTrials(TRIALS, false);
  throw "";
}
if (branchFactor) {
  runBoth(false, true);
  throw "";
}

if (minmaxABBranch) {
  runBoth(true, false);
}

// ===========================================

// simple move diff < weighted diff
// simple move diff < movable checker ratio
// weighted diff < movable checker ratio
// weighted ratio > movable checker ratio
// wighted ratio ? weight diff

function runTrials(trials: number, verbose: boolean | null = null) {
  let humanWins = 0;
  let computerWins = 0;
  for (let trial = 0; trial < trials; trial++) {
    if (
      humanWins * computerWins > 0 &&
      trial > 30 &&
      humanWins / computerWins < 2
    )
      return null;
    const game = new KonaneGameTest(
      human,
      computerDifficultyDepths[konaneDifficulties.hard]
    );
    for (let i = 0; i < 100; i++) {
      const playerToPlay = game.playerToPlay;
      if (playerToPlay === human) {
        // const bestHumanAction = game.getRandomHumanAction();
        const bestHumanAction = game.getBestHumanAction();
        if (bestHumanAction === null) {
          // human lost, no moves left
          computerWins += 1;
          if (verbose)
            console.log("human LOSES! computer WINS", trial, game.turn);
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
          if (verbose)
            console.log("human WINS! computer LOSES", trial, game.turn);
          break;
        } else {
          // console.log("computer plays:", bestComputerAction);
          game.applyAction(bestComputerAction);
          // console.table(game.board);
        }
      }
    }
  }
  if (verbose) console.log("human:", humanWins, "computer:", computerWins);
  return [humanWins, computerWins];
}

function runBoth(
  verbose: boolean | null = null,
  random: boolean | null = null
) {
  const [blackHumanWin, _a] = run(WHITE, verbose, random);
  const [whiteHumanWin, _b] = run(BLACK, verbose, random);
  return blackHumanWin + whiteHumanWin === 2;
}

function run(
  player: Player,
  verbose: boolean | null = null,
  random: boolean | null = null
) {
  const game = new KonaneGameTest(player, 2);
  for (let i = 0; i < 100; i++) {
    const playerToPlay = game.playerToPlay;
    if (playerToPlay === human) {
      const bestHumanAction = random
        ? game.getRandomHumanAction()
        : game.getBestHumanAction();
      if (bestHumanAction === null) {
        // human lost, no moves left
        if (verbose) console.log("human LOSES! computer WINS", game.turn);
        // console.log(
        //   `Evaluations (${player}): `,
        //   game.minMaxHandlerHuman.evaluations
        // );
        if (random)
          console.log(
            `Branch Factor (${player}): `,
            game.branchCount / game.nodeCount
          );
        return [0, 1];
      } else {
        // console.log("human plays:", bestHumanAction);
        game.applyAction(bestHumanAction);
        // console.table(game.board);
      }
    } else {
      const bestComputerAction = game.getBestComputerAction();
      if (bestComputerAction === null) {
        // computer lost, no moves left
        if (verbose) console.log("human WINS! computer LOSES", game.turn);
        // console.log(
        //   `Evaluations (${player}): `,
        //   game.minMaxHandlerHuman.evaluations
        // );
        if (random)
          console.log(
            `Branch Factor (${player}): `,
            game.branchCount / game.nodeCount
          );
        return [1, 0];
      } else {
        // console.log("computer plays:", bestComputerAction);
        game.applyAction(bestComputerAction);
        // console.table(game.board);
      }
    }
  }
  return [0, 0];
}
