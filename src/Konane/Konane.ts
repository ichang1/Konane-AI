import {
  Action,
  BLACK,
  Cell,
  EMPTY,
  Player,
  WHITE,
  Jump,
  possibleJumps,
  BLACK_CHECKER,
  WHITE_CHECKER,
  MoveChecker,
  RemoveChecker,
} from "./KonaneUtils";

export default class Konane {
  private n: number;
  board: Cell[][];
  blackCheckerCells: Set<number[]>;
  whiteCheckerCells: Set<number[]>;
  turn = 0;

  constructor() {
    this.n = 8;
    this.board = this.initializeBoard();
    this.blackCheckerCells = this.getCheckerCells(BLACK);
    this.whiteCheckerCells = this.getCheckerCells(WHITE);
  }

  getBlackLegalActions(): Action[] | null {
    if (this.turn % 2 !== 0) return null;
    if (this.turn === 0) {
      // remove black checker
      return this.getLegalRemoves(BLACK);
    }
    // find possible black checkers to move
    return this.getLegalMoves(BLACK);
  }

  getWhiteLegalActions(): Action[] | null {
    if (this.turn % 2 !== 1) return null;
    if (this.turn === 1) {
      // remove white checker adjacent to initial removed black checker
      // there should be 1 empty cell on the board
      return this.getLegalRemoves(WHITE);
    }
    // find possible white checkers to move
    return this.getLegalMoves(WHITE);
  }

  private getLegalMoves(player: Player) {
    const playerCheckerCells =
      player === BLACK ? this.blackCheckerCells : this.whiteCheckerCells;
    const legalMoves: MoveChecker[] = [...playerCheckerCells].flatMap(
      ([curX, curY]) => {
        // legal jumps from this cell
        const legalCheckerJumpsFromCell = this.getLegalCheckerJumps(curX, curY);
        // convert jump to move
        const legalMovesFromCell: MoveChecker[] = legalCheckerJumpsFromCell.map(
          ({ offset: [offsetX, offsetY] }, times) => ({
            player,
            type: "move",
            from: [curX, curY],
            to: [curX + offsetX * times, curY + offsetY * times],
          })
        );
        return legalMovesFromCell;
      }
    );
    return legalMoves;
  }

  private getLegalCheckerJumps(row: number, col: number) {
    // gets all legal jumps from a cell
    const legalJumps = possibleJumps.filter((jump) =>
      this.isLegalJump(row, col, jump)
    );
    return legalJumps;
  }

  private isLegalJump(row: number, col: number, jump: Jump) {
    const { offset, times } = jump;
    const [offsetY, offsetX] = offset;
    // Ex: [[r + 2 ,c], [r + 4, c]]
    const intermediateCells = [...Array(times - 1)].map((_, idx) => [
      row + offsetY * idx,
      col + offsetX * idx,
    ]);
    return intermediateCells.every(
      ([row, col]) =>
        this.isLegalCell(row, col) && this.board[row][col] === EMPTY
    );
  }

  private isLegalCell(row: number, col: number) {
    // check if cell is within bounds
    if (row < 0 || row >= this.n) return false;
    if (col < 0 || col >= this.n) return false;
    return true;
  }

  private getLegalRemoves(player: Player): RemoveChecker[] {
    if (player === BLACK) {
      return [
        {
          player: BLACK,
          type: "remove",
          cell: [Math.floor(this.n / 2) - 1, Math.floor(this.n / 2) - 1],
        },
      ];
    }
    return [
      {
        player: WHITE,
        type: "remove",
        cell: [Math.floor(this.n / 2) - 1, Math.floor(this.n / 2)],
      },
    ];
  }

  private initializeBoard() {
    const board = [...Array(this.n)].map((_) => [...Array(this.n)]);
    const BLACK: Cell = "X";
    const WHITE: Cell = "O";
    for (let row = 0; row < this.n; row++) {
      for (let col = 0; col < this.n; col++) {
        if (row % 2 === col % 2) {
          board[row][col] = BLACK;
        } else {
          board[row][col] = WHITE;
        }
      }
    }
    return board;
  }

  private getCheckerCells(player: Player) {
    const positions: Set<number[]> = new Set();
    const playerChecker = player === BLACK ? "X" : "O";
    for (let row = 0; row < this.n; row++) {
      for (let col = 0; col < this.n; col++) {
        if (this.board[row][col] === playerChecker) {
          positions.add([row, col]);
        }
      }
    }
    return positions;
  }
}
