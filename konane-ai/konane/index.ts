// import PriorityQueue from "./utils/PriorityQueue";
import { actionIsMoveChecker, BLACK, WHITE } from "./KonaneUtils";
import KonaneGame from "./KonaneGame";

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

const konane = new KonaneGame(human);

const randInt = (min: number, max: number) => {
  min = Math.floor(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
for (let i = 0; i < 100; i++) {
  const playerToPlay = konane.playerToPlay;
  const legalActions =
    playerToPlay === human
      ? konane.getLegalHumanActions()
      : konane.getLegalComputerActions();
  if (legalActions === null) {
    console.log("Something went wrong");
    break;
  }
  if (legalActions.length === 0) {
    const msg = `${roles[playerToPlay]} (${playerToPlay}) loses`;
    console.log(msg);
    break;
  }
  const randAction = legalActions[randInt(0, legalActions.length - 1)];
  const { player } = randAction;
  konane.applyAction(randAction);
  if (actionIsMoveChecker(randAction)) {
    const { to, from } = randAction;
    console.log(`${roles[player]} (${player}) moves ${from} to ${to}`);
  } else {
    const { cell } = randAction;
    console.log(`${player} removes ${cell}`);
  }
  console.table(konane.board);
}
