// import PriorityQueue from "./utils/PriorityQueue";
import {
  Action,
  actionIsMoveChecker,
  BLACK,
  konaneDifficulties,
  WHITE,
} from "./KonaneUtils";
import KonaneGame from "./KonaneGame";
import { randArrElement } from "../utils/misc";

// const pq = new PriorityQueue((el: number) => el);
// console.log(pq.isEmpty());
// pq.push(100);
// pq.push(90);
// pq.push(80);
// pq.push(60);
// pq.pop();
// console.log(pq);

const human = BLACK;
const computer = WHITE;

const temp: any = {
  human,
  computer,
};
const roles = {
  ...temp,
  ...Object.fromEntries(Object.entries(temp).map(([k, v]) => [v, k])),
};
console.log("here");
const game = new KonaneGame(human, konaneDifficulties.easy);
for (let i = 0; i < 100; i++) {
  const playerToPlay = game.playerToPlay;
  if (playerToPlay === human) {
    const humanLegalActions = game.getLegalHumanActions();
    const allLegalHumanActions = Object.values(humanLegalActions!).flat(1);
    if (allLegalHumanActions.length >= 1) {
      const bestHumanAction = randArrElement(
        Object.values(humanLegalActions!).flat(1)
      );
      console.log("human plays:", bestHumanAction);
      game.applyAction(bestHumanAction);
      console.table(game.board);
    } else {
      // human lost, no moves left
      console.log("human LOSES! computer WINS");
      break;
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
