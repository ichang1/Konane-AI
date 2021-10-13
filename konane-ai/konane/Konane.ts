import {
  Action,
  BLACK,
  Cell,
  EMPTY,
  Player,
  WHITE,
  Jump,
  possibleJumps,
  MoveChecker,
  RemoveChecker,
} from "./KonaneUtils";

export default class Konane {
  private n: number;
  board: Cell[][];
  turn = 0;

  constructor() {
    this.n = 8;
    this.board = this.initializeBoard();
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
      player === BLACK
        ? this.getCheckerCells(BLACK)
        : this.getCheckerCells(WHITE);
    const legalMoves: MoveChecker[] = [...playerCheckerCells].flatMap(
      ([curRow, curCol]) => {
        // legal jumps from this cell
        const legalCheckerJumpsFromCell = this.getLegalCheckerJumps(
          curRow,
          curCol
        );
        // convert jump to move
        const legalMovesFromCell: MoveChecker[] = legalCheckerJumpsFromCell.map(
          ({ offset: [offsetRow, offsetCol], times }) => ({
            player,
            type: "move",
            from: [curRow, curCol],
            to: [curRow + offsetRow * times, curCol + offsetCol * times],
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
    const [offsetRow, offsetCol] = offset;
    const startRow = Math.min(row + offsetRow * times, row);
    const endRow = Math.max(row + offsetRow * times, row);
    const startCol = Math.min(col + offsetCol * times, col);
    const endCol = Math.max(col + offsetCol * times, col);
    if (startRow === endRow) {
      // jumping up down
      for (let c = startCol; c <= endCol; c++) {
        // if this cell is the starting cell skip the check
        if (c === col) continue;
        // if this cell is off the board
        if (!this.isLegalCell(startRow, c)) return false;
        if ((c - startCol) % 2 === 0) {
          // should be empty
          if (this.board[startRow][c] !== EMPTY) return false;
        } else {
          // should have a checker
          // should not be empty
          // guaranteed to be opposing checker
          if (this.board[startRow][c] === EMPTY) return false;
        }
      }
    } else if (startCol === endCol) {
      // jumping left right
      for (let r = startRow; r <= endRow; r++) {
        // if this cell is the starting cell skip the check
        if (r === row) continue;
        // if this cell is off the board
        if (!this.isLegalCell(r, startCol)) return false;
        if ((r - startRow) % 2 === 0) {
          // should be empty
          if (this.board[r][startCol] !== EMPTY) return false;
        } else {
          // should have a checker
          // should not be empty
          // guaranteed to be opposing checker
          if (this.board[r][startCol] === EMPTY) return false;
        }
      }
    }
    // all even cells are empty
    // all odd cells have opposing checkers
    return true;
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
    const positions: [number, number][] = [];
    const playerChecker = player === BLACK ? "X" : "O";
    for (let row = 0; row < this.n; row++) {
      for (let col = 0; col < this.n; col++) {
        if (this.board[row][col] === playerChecker) {
          positions.push([row, col]);
        }
      }
    }
    return positions;
  }
}
