import {
  Action,
  actionIsMoveChecker,
  BLACK,
  Player,
  WHITE,
} from "./KonaneUtils";
import KonaneGame, { getKonaneStaticEval } from "./KonaneGame";
import { MinMax, MinMaxNode } from "../utils/MinMax";
import Konane from "./Konane";
import { randInt } from "../utils/misc";
import {
  ComputerDifficulty,
  computerDifficultyDepths,
  oppositeColor,
  konaneDifficulties,
  getKonaneSuccessors,
  Weights,
  simple2,
  boardValueDiff,
} from "./KonaneGameUtils";

class KonaneGameTest extends KonaneGame {
  private minMaxHandlerHuman: MinMax<Konane, Action | null>;
  private weights: Weights | null;
  constructor(
    human: Player,
    computerDifficulty: ComputerDifficulty,
    weights: Weights | null = null
  ) {
    super(human, computerDifficulty);
    this.minMaxHandlerHuman = new MinMax();
    this.weights = weights;
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
      getKonaneStaticEval(this.human, (state: Konane, player: Player) =>
        // simple2(state, player)
        boardValueDiff(state, player, this.weights)
      )
    );
  }

  getRandomHumanAction() {
    const legalActionsMap = this.getLegalHumanActions();
    const legalActionsFlat = [...legalActionsMap.values()].flat(1);
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
const TRIALS = 100;

if (runningTrials) {
  const possibleWeights = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
  const positiveWeights = [1, 2, 3, 4, 5];
  const negativeWeights = [-5, -4, -3, -2, -1];
  let bestWeightsRatio = null;
  let bestWeights = null;
  for (let eight of possibleWeights) {
    for (let seven of positiveWeights) {
      for (let six of possibleWeights) {
        for (let five of possibleWeights) {
          for (let four of possibleWeights) {
            for (let three of possibleWeights) {
              for (let two of possibleWeights) {
                for (let one of positiveWeights) {
                  const weights = {
                    one,
                    two,
                    three,
                    four,
                    five,
                    six,
                    seven,
                    eight,
                  };
                  // console.log("testing:", weights);
                  const humanWinsBoth = runBoth(weights);
                  if (humanWinsBoth) console.log(weights);
                  // const winRates = runTrials(TRIALS, weights);
                  // if (!winRates) continue;
                  // const [humanWins, computerWins] = winRates;
                  // if (!bestWeightsRatio) {
                  //   bestWeightsRatio = [humanWins, computerWins];
                  //   bestWeights = weights;
                  //   console.log(bestWeightsRatio);
                  //   console.log(bestWeights);
                  // } else {
                  //   const [curBestHumanWins, curBestComputerWins] =
                  //     bestWeightsRatio;
                  //   if (curBestHumanWins < humanWins) {
                  //     bestWeightsRatio = [humanWins, computerWins];
                  //     bestWeights = weights;
                  //     console.log(bestWeightsRatio);
                  //     console.log(bestWeights);
                  //   }
                  // }
                }
              }
            }
          }
        }
      }
    }
  }
  console.log(bestWeightsRatio);
  console.log(bestWeights);
} else {
  // runTrials(TRIALS, null, true);
  const weights = {
    one: -5,
    two: -5,
    three: -5,
    four: -5,
    five: -5,
    six: -5,
    seven: -5,
    eight: -5,
  };
  runBoth(null, true);
  // const game = new KonaneGameTest(human, konaneDifficulties.grandmaster);
  // for (let i = 0; i < 100; i++) {
  //   const playerToPlay = game.playerToPlay;
  //   if (playerToPlay === human) {
  //     const bestHumanAction = game.getBestHumanAction();
  //     // const bestHumanAction = game.getRandomHumanAction();
  //     if (bestHumanAction === null) {
  //       // computer lost, no moves left
  //       console.log("human LOSES! computer WINS");
  //       break;
  //     } else {
  //       console.log("human plays:", bestHumanAction);
  //       game.applyAction(bestHumanAction);
  //       console.table(game.board);
  //     }
  //   } else {
  //     const bestComputerAction = game.getBestComputerAction();
  //     if (bestComputerAction === null) {
  //       // computer lost, no moves left
  //       console.log("human WINS! computer LOSES");
  //       break;
  //     } else {
  //       console.log("computer plays:", bestComputerAction);
  //       game.applyAction(bestComputerAction);
  //       console.table(game.board);
  //     }
  //   }
  // }
}

// ===========================================

// simple move diff < weighted diff
// simple move diff < movable checker ratio
// weighted diff < movable checker ratio
// weighted ratio > movable checker ratio
// wighted ratio ? weight diff

function runTrials(
  trials: number,
  weights: Weights | null = null,
  verbose: boolean | null = null
) {
  let humanWins = 0;
  let computerWins = 0;
  for (let trial = 0; trial < trials; trial++) {
    if (
      humanWins * computerWins > 0 &&
      trial > 30 &&
      humanWins / computerWins < 2
    )
      return null;
    const game = new KonaneGameTest(human, konaneDifficulties.hard, weights);
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

function runWeightTrials() {}

function runBoth(
  weights: Weights | null = null,
  verbose: boolean | null = null
) {
  const [blackHumanWin, _a] = run(BLACK, weights, verbose);
  const [whiteHumanWin, _b] = run(WHITE, weights, verbose);
  return blackHumanWin + whiteHumanWin === 2;
}

function run(
  player: Player,
  weights: Weights | null = null,
  verbose: boolean | null = null
) {
  const game = new KonaneGameTest(
    player,
    konaneDifficulties.grandmaster,
    weights
  );
  for (let i = 0; i < 100; i++) {
    const playerToPlay = game.playerToPlay;
    if (playerToPlay === human) {
      // const bestHumanAction = game.getRandomHumanAction();
      const bestHumanAction = game.getBestHumanAction();
      if (bestHumanAction === null) {
        // human lost, no moves left
        if (verbose) console.log("human LOSES! computer WINS", game.turn);
        return [0, 1];
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
        if (verbose) console.log("human WINS! computer LOSES", game.turn);
        return [1, 0];
        break;
      } else {
        // console.log("computer plays:", bestComputerAction);
        game.applyAction(bestComputerAction);
        // console.table(game.board);
      }
    }
  }
  return [0, 0];
}
