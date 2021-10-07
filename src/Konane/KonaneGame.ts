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
} from "./KonaneUtils";

export default class KonaneGame {
  player: Player;
  computer: Player;
  konane: Konane;
  constructor(player: Player) {
    this.player = player;
    this.computer = player === WHITE ? BLACK : WHITE;
    this.konane = new Konane();
  }

  get board() {
    // current state
    return this.konane.board;
  }

  successors() {
    const playerToPlay = this.konane.turn % 2 === 0 ? BLACK : WHITE;
    const playerChecker =
      playerToPlay === BLACK ? BLACK_CHECKER : WHITE_CHECKER;
    const playerLegalActions =
      playerToPlay === BLACK
        ? this.konane.getBlackLegalActions()
        : this.konane.getWhiteLegalActions();
    if (!playerLegalActions) return [];
    const successors: Cell[][][] = [...Array(playerLegalActions.length)];
    playerLegalActions.forEach((action, idx) => {
      successors[idx] = this.getSuccesor(action, playerChecker);
    });
    return successors;
  }

  private getSuccesor(action: Action, playerChecker: Cell) {
    const boardCopy: Cell[][] = JSON.parse(JSON.stringify(this.konane.board));
    if (action.type === "remove") {
      // remove initial checker
      const [row, col] = action.cell;
      boardCopy[row][col] = EMPTY;
    } else {
      // move checker
      const [fromRow, fromCol] = action.from;
      const [toRow, toCol] = action.to;

      // remove checkers along the move
      // guaranteed to only have opposing checkers along the way
      const startRow = Math.min(fromRow, toRow);
      const endRow = Math.max(fromRow, toRow);
      const startCol = Math.min(fromCol, toCol);
      const endCol = Math.max(fromCol, toCol);
      if (startRow === endRow) {
        // moved left/right
        for (let col = startCol; col <= endCol; col++) {
          boardCopy[startRow][col] = EMPTY;
        }
      } else if (startCol == endCol) {
        // moved up/down
        for (let row = startRow; row <= endRow; row++) {
          boardCopy[row][startCol] = EMPTY;
        }
      }
      boardCopy[toRow][toCol] = playerChecker;
    }
    return boardCopy;
  }

  //   get isPlayerWin() {
  //     const computerLegalMoves = this.konane.getComputerLegalActions();
  //     if (!computerLegalMoves) return false;
  //     if (computerLegalMoves.length === 0) return true;
  //     return false;
  //   }
}
