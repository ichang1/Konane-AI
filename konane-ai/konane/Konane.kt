package konane

class Konane{
	val n = 8
	var board: Board
	var turn: Int = 0
	init {
		board = List(n) {
			row -> MutableList(n) {
				col -> if (row % 2 == col % 2) {BLACK_CHECKER} else {WHITE_CHECKER}
			}
		}
	}

	fun getBlackSuccessors(): List<Pair<Konane, Action>> {
		val blackLegalActionsMap = getBlackLegalActions()
		return getSuccessors(blackLegalActionsMap)
	}

	fun getWhiteSuccessors(): List<Pair<Konane, Action>> {
		val whiteLegalActionsMap = getWhiteLegalActions()
		return getSuccessors(whiteLegalActionsMap)
	}

	fun getSuccessors(playerLegalActionsMap: PlayerActions): List<Pair<Konane, Action>>{
		val legalActionsFlat = playerLegalActionsMap.flatMap { 
			entry -> entry.value
		}
		// println(legalActionsFlat)
		val successors = legalActionsFlat.map {
			action -> 
				val successorBoard = getSuccessorBoard(action)
				val succ = Konane()
				succ.turn = turn + 1
				succ.board = successorBoard
				Pair(succ, action)
		}
		return successors
	}

	fun getSuccessorBoard(action: Action): Board {
		val boardCopy = board.deepCopy()
		if (action is MoveChecker) {
			moveChecker(action, boardCopy)
		} else if (action is RemoveChecker) {
			removeChecker(action, boardCopy)
		}
		return boardCopy
	}

	fun applyAction(action: Action) {
		if (action is MoveChecker) {
			moveChecker(action, board)
			turn++
		} else if (action is RemoveChecker){
			removeChecker(action, board)
			turn++
		}
	}

	private fun moveChecker(action: MoveChecker, someBoard: Board) {
		val player = action.player
		val to = action.to
		val from = action.from
		if (player != WHITE && player != BLACK) return
		val (fromRow, fromCol) = from
		val (toRow, toCol) = to
		val playerChecker = if (player == WHITE) {WHITE_CHECKER} else {BLACK_CHECKER}
		
		// remove checkers along the move
		val startRow = Math.min(fromRow, toRow);
		val endRow = Math.max(fromRow, toRow);
		val startCol = Math.min(fromCol, toCol);
		val endCol = Math.max(fromCol, toCol);

		if (startRow == endRow) {
			for (col in startCol..endCol) {
				someBoard[startRow][col] = EMPTY
			}
		} else if (startCol == endCol) {
			for (row in startRow..endRow) {
				someBoard[row][startCol] = EMPTY
			}
		}
		someBoard[toRow][toCol] = playerChecker
	}

	private fun removeChecker(action: RemoveChecker, someBoard: Board) {
		val (row, col) = action.cell
		someBoard[row][col] = EMPTY
	}

	fun getBlackLegalActions(): PlayerActions {
		if (turn <= 1) return getLegalRemoves(BLACK)
		else return getLegalMoves(BLACK)
	}

	fun getWhiteLegalActions(): PlayerActions {
		if (turn <= 1) return getLegalRemoves(WHITE)
		else return getLegalMoves(WHITE)
	}

	fun getLegalMoves(player: String): PlayerActions {
		val legalMoves = mutableMapOf<Cell, List<MoveChecker>>()
		val playerCheckerCells = getCheckerCells(player)
		playerCheckerCells.forEach {
			cell -> 
				val (curRow, curCol) = cell
				val legalJumpsFromCell = getLegalCheckerJumps(cell)
				val legalMovesFromCell = legalJumpsFromCell.map {
					jump -> 
						val (offset, times) = jump
						val (offsetRow, offsetCol) = offset
						MoveChecker(player, "move", cell, Cell(curRow + offsetRow * times, curCol + offsetCol * times))
				}
				if (legalMovesFromCell.size == 0) return@forEach;
				legalMoves.set(cell, legalMovesFromCell) 
		}
		return legalMoves
	}

	fun getLegalCheckerJumps(cell: Cell): List<Jump> {
		// gets all legal jumps from a cell
		val legalJumps = possibleJumps.filter { isLegalJump(cell, it) }
		return legalJumps;
	}

	fun isLegalJump(cell: Cell, jump: Jump): Boolean {
		val (row, col) = cell
		val (offset, times) = jump
		val (offsetRow, offsetCol) = offset

		val startRow = Math.min(row + offsetRow * times, row);
    	val endRow = Math.max(row + offsetRow * times, row);
    	val startCol = Math.min(col + offsetCol * times, col);
    	val endCol = Math.max(col + offsetCol * times, col);
		if (startRow == endRow) {
			for (c in startCol..endCol){
				if (c == col) continue
				if (!isLegalCell(Pair(startRow, c))) return false;
				if ((c - startCol) % 2 == 0) {
					// should be empty
					if (board[startRow][c] != EMPTY) return false;
				} else {
					// should have a checker
					// should not be empty
					// guaranteed to be opposing checker
					if (board[startRow][c] == EMPTY) return false;
				}
			}
		} else if (startCol == endCol) {
			// jumping left right
			for (r in startRow..endRow) {
				// if this cell is the starting cell skip the check
				if (r == row) continue;
				// if this cell is off the board
				if (!isLegalCell(Pair(r, startCol))) return false;
				if ((r - startRow) % 2 == 0) {
					// should be empty
					if (board[r][startCol] != EMPTY) return false;
				} else {
					// should have a checker
					// should not be empty
					// guaranteed to be opposing checker
					if (board[r][startCol] == EMPTY) return false;
				}
			}
		}
		return true
	}

	fun isLegalCell(cell: Cell): Boolean {
		val (row, col) = cell
		if (row >= n || row < 0) return false
		if (col >= n || col < 0) return false
		return true
	}

	fun getLegalRemoves(player: String): PlayerActions {
		val legalRemoves = mutableMapOf<Cell, List<RemoveChecker>>()
		if (player != WHITE && player != BLACK) return legalRemoves
		if (player == BLACK) {
			val blackLegalRemoveCells = listOf(
				Cell(n / 2 - 1, n / 2 - 1)
			)
			blackLegalRemoveCells.forEach {
				cell -> 
					val removeAction = RemoveChecker(player, "remove", cell)	
					legalRemoves.set(cell, listOf(removeAction))
			}
		} else {
			val whiteLegalRemoveCells = listOf(
				Cell(n / 2 - 1, n / 2)
			)
			whiteLegalRemoveCells.forEach {
				cell -> 
					val removeAction = RemoveChecker(player, "remove", cell)	
					legalRemoves.set(cell, listOf(removeAction))
			}
		}
		return legalRemoves
	}

	fun getCheckerCells(player: String): List<Cell> {
		if (player != BLACK && player != WHITE) return listOf()
		val playeChecker = if (player == BLACK) {BLACK_CHECKER} else {WHITE_CHECKER}
		val positions = board.mapIndexedNotNull {
			rowN, row -> row.mapIndexedNotNull {
					colN, el -> if (el == playeChecker) {Cell(rowN, colN)} else {null}
			}
		}.flatten()
		return positions
	}

	override fun toString(): String {
		return "${board.toString()} ${turn}"
	}
}

val getKonaneSuccessors = fun (state: Konane): List<Pair<Konane, Action>> {
	val playerToPlay = if (state.turn % 2 == 0) {BLACK} else {WHITE}
	if (playerToPlay == BLACK) return state.getBlackSuccessors()
	return state.getWhiteSuccessors()
}