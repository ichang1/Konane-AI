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
} from "./KonaneUtils";

export default class KonaneGame {
  human: Player;
  computer: Player;
  konane: Konane;
  constructor(human: Player) {
    this.human = human;
    this.computer = human === WHITE ? BLACK : WHITE;
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

  getLegalComputerActions() {
    if (this.computer === BLACK) {
      return this.konane.getBlackLegalActions();
    } else {
      return this.konane.getWhiteLegalActions();
    }
  }

  getSuccessors() {
    const playerToPlay = this.konane.turn % 2 === 0 ? BLACK : WHITE;
    const playerLegalActions =
      playerToPlay === BLACK
        ? this.konane.getBlackLegalActions()
        : this.konane.getWhiteLegalActions();
    if (!playerLegalActions) return [];
    const successors: KonaneGameState[] = [];
    playerLegalActions.forEach((action, idx) => {
      const successorBoard = this.getSuccesorBoard(action);
      successors.push({
        action,
        board: successorBoard,
        playerValues: {
          white: 0,
          black: 0,
        },
      });
    });
    return successors;
  }

  applyAction(action: Action) {
    if (actionIsMoveChecker(action)) {
      this.moveChecker(action, this.board);
    } else if (actionIsRemoveChecker(action)) {
      this.removeChecker(action, this.board);
    }
    this.konane.turn += 1;
  }

  private getSuccesorBoard(action: Action) {
    const boardCopy: Cell[][] = JSON.parse(JSON.stringify(this.konane.board));
    if (actionIsMoveChecker(action)) {
      this.moveChecker(action, boardCopy);
    } else if (actionIsRemoveChecker(action)) {
      this.removeChecker(action, boardCopy);
    }
    return boardCopy;
  }

  private moveChecker(action: MoveChecker, board: Cell[][]) {
    const { player, from, to } = action;
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    const playerChecker = player === BLACK ? BLACK_CHECKER : WHITE_CHECKER;

    // remove checkers along the move
    const startRow = Math.min(fromRow, toRow);
    const endRow = Math.max(fromRow, toRow);
    const startCol = Math.min(fromCol, toCol);
    const endCol = Math.max(fromCol, toCol);
    if (startRow === endRow) {
      // action move checker left/right
      for (let col = startCol; col <= endCol; col++) {
        board[startRow][col] = EMPTY;
      }
    } else if (startCol == endCol) {
      // action move checker up/down
      for (let row = startRow; row <= endRow; row++) {
        board[row][startCol] = EMPTY;
      }
    }
    board[toRow][toCol] = playerChecker;
  }

  private removeChecker(action: RemoveChecker, board: Cell[][]) {
    const [row, col] = action.cell;
    board[row][col] = EMPTY;
  }
}
