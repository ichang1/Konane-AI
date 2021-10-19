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
  BLACK_CHECKER,
  WHITE_CHECKER,
  actionIsMoveChecker,
  actionIsRemoveChecker,
} from "./KonaneUtils";

export default class Konane {
  private n: number;
  board: Cell[][];
  turn = 0;

  constructor() {
    this.n = 8;
    this.board = this.initializeBoard();
  }

  /**
   *
   * @returns array of successor konanes
   */
  getSuccessors() {
    const playerToPlay = this.turn % 2 === 0 ? BLACK : WHITE;
    const playerLegalActions =
      playerToPlay === BLACK
        ? this.getBlackLegalActions()
        : this.getWhiteLegalActions();
    if (!playerLegalActions) return [];
    const playerLegalActionsFlat: Action[] =
      Object.values(playerLegalActions).flat(1);
    const successors: [Konane, Action][] = [];
    playerLegalActionsFlat.forEach((action) => {
      const successorBoard = this.getSuccesorBoard(action);
      const succ = new Konane();
      succ.turn = this.turn + 1;
      succ.board = successorBoard;
      successors.push([succ, action]);
    });
    return successors;
  }

  /**
   *
   * @param action action to apply on current board
   * @returns resulting board
   */
  private getSuccesorBoard(action: Action) {
    const boardCopy: Cell[][] = JSON.parse(JSON.stringify(this.board));
    if (actionIsMoveChecker(action)) {
      this.moveChecker(action, boardCopy);
    } else if (actionIsRemoveChecker(action)) {
      this.removeChecker(action, boardCopy);
    }
    return boardCopy;
  }

  /**
   * Applies the action to the board state
   * @param action the action to apply to the board
   */
  applyAction(action: Action) {
    if (actionIsMoveChecker(action)) {
      this.moveChecker(action, this.board);
      this.turn += 1;
    } else if (actionIsRemoveChecker(action)) {
      this.removeChecker(action, this.board);
      this.turn += 1;
    }
  }

  /**
   * Moves a checker on a board in place
   * @param action action that is a move action
   * @param board the board to apply the action on
   */
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

  /**
   * Removes a checker on a board in place
   * @param action action that is a remove action
   * @param board the board to apply the action on
   */
  private removeChecker(action: RemoveChecker, board: Cell[][]) {
    const [row, col] = action.cell;
    board[row][col] = EMPTY;
  }

  /**
   * Gets all legal actions for black
   * @returns all legal actions for black or null if not black's turn
   */
  getBlackLegalActions(): { [key: string]: Action[] } | null {
    if (this.turn % 2 !== 0) return null;
    if (this.turn === 0) {
      // remove black checker
      return this.getLegalRemoves(BLACK);
    }
    // find possible black checkers to move
    return this.getLegalMoves(BLACK);
  }

  /**
   * Gets all legal actions for white
   * @returns all legal actions for white nor null if not white's turn
   */
  getWhiteLegalActions(): { [key: string]: Action[] } | null {
    if (this.turn % 2 !== 1) return null;
    if (this.turn === 1) {
      // remove white checker adjacent to initial removed black checker
      // there should be 1 empty cell on the board
      return this.getLegalRemoves(WHITE);
    }
    // find possible white checkers to move
    return this.getLegalMoves(WHITE);
  }

  /**
   * Gets legal moves for a player
   * @param player the player to get the legal moves of
   * @returns array of legal moves for this player
   */
  private getLegalMoves(player: Player) {
    const playerCheckerCells =
      player === BLACK
        ? this.getCheckerCells(BLACK)
        : this.getCheckerCells(WHITE);
    const legalMoves: { [key: string]: MoveChecker[] } = {};
    playerCheckerCells.forEach(([curRow, curCol]) => {
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
      if (legalMovesFromCell.length === 0) return;
      legalMoves[[curRow, curCol].toString()] = legalMovesFromCell;
    });
    return legalMoves;
  }

  /**
   * Gets the legal directions and lengths a checker a specific cell can
   * be moved to
   * @param row row of checker
   * @param col col of checker
   * @returns direction and length of legal checker moves
   */
  private getLegalCheckerJumps(row: number, col: number) {
    // gets all legal jumps from a cell
    const legalJumps = possibleJumps.filter((jump) =>
      this.isLegalJump(row, col, jump)
    );
    return legalJumps;
  }

  /**
   * Checks if moving a checker in a certain way is valid
   * @param row row of checker
   * @param col col of checker
   * @param jump direction and length of a chcker move
   * @returns true/false
   */
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

  /**
   *
   * @param row row of cell
   * @param col col of cell
   * @returns if cell is within bounds
   */
  private isLegalCell(row: number, col: number) {
    // check if cell is within bounds
    if (row < 0 || row >= this.n) return false;
    if (col < 0 || col >= this.n) return false;
    return true;
  }

  /**
   *
   * @param player the player to get the legal removes for
   * @returns array of legal removes for player
   */
  private getLegalRemoves(player: Player): { [key: string]: RemoveChecker[] } {
    if (player === BLACK) {
      const legalRemoveCells: [number, number][] = [
        [Math.floor(this.n / 2) - 1, Math.floor(this.n / 2) - 1],
      ];
      const legalRemoves: { [key: string]: RemoveChecker[] } = {};
      legalRemoveCells.forEach((cell) => {
        const action: RemoveChecker = {
          player: BLACK,
          type: "remove",
          cell,
        };
        legalRemoves[cell.toString()] = [action];
      });
      return legalRemoves;
    }
    // player is white
    // normally there is more than 1 option
    const legalRemoveCells: [number, number][] = [
      [Math.floor(this.n / 2) - 1, Math.floor(this.n / 2)],
    ];
    const legalRemoves: { [key: string]: RemoveChecker[] } = {};
    legalRemoveCells.forEach((cell) => {
      const action: RemoveChecker = {
        player: WHITE,
        type: "remove",
        cell,
      };
      legalRemoves[cell.toString()] = [action];
    });
    return legalRemoves;
  }

  /**
   *
   * @returns a new initial konane board
   */
  private initializeBoard() {
    const board: Cell[][] = [...Array(this.n)].map((_) => [...Array(this.n)]);
    for (let row = 0; row < this.n; row++) {
      for (let col = 0; col < this.n; col++) {
        if (row % 2 === col % 2) {
          board[row][col] = BLACK_CHECKER;
        } else {
          board[row][col] = WHITE_CHECKER;
        }
      }
    }
    return board;
  }

  /**
   *
   * @param player player to get checker cells of
   * @returns the positions of this player's checkers
   */
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
