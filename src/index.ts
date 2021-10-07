// import PriorityQueue from "./utils/PriorityQueue";
import Konane from "./Konane/Konane";
import KonaneGame from "./Konane/KonaneGame";

// const pq = new PriorityQueue((el: number) => el);
// console.log(pq.isEmpty());
// pq.push(100);
// pq.push(90);
// pq.push(80);
// pq.push(60);
// pq.pop();
// console.log(pq);

const game = new KonaneGame("black");
console.table(game.board);
game.successors().forEach((succ) => {
  console.table(succ);
});
