package konane

import minmax.MinMax
import minmax.MinMaxNode

open class KonaneGame(val _human: String, val _difficulty: Int){
	var human: String
	var computer: String
	var difficulty: Int
	val konane = Konane()
	val minMaxHandler: MinMax<Konane, Action?> = MinMax()

	val board: Board
		get() = konane.board
	val turn: Int
		get() = konane.turn
	val playerToPlay: String 
		get() = if (konane.turn % 2 == 0) {BLACK} else {WHITE}

	init {
		human = _human
		computer = oppositeColor(_human)
		difficulty = _difficulty
	}

	fun getLegalHumanActions(): PlayerActions {
		if (human != WHITE && human != BLACK) return mutableMapOf<Cell, List<Action>>()
		if (human == BLACK) return konane.getBlackLegalActions()
		else return konane.getWhiteLegalActions()
	}

	private fun getLegalComputerActions(): PlayerActions {
		if (computer != WHITE && computer != BLACK) return mutableMapOf<Cell, List<Action>>()
		// println(computer)
		if (computer == BLACK) return konane.getBlackLegalActions()
		else return konane.getWhiteLegalActions()
	}

	fun getBestComputerAction(): Action? {
		if (difficulty < 2) {
			val legalComputerActions = getLegalComputerActions()
			// println(legalComputerActions)
			val legalActionsFlat = legalComputerActions.flatMap { 
				entry -> entry.value
			}
			return randElement(legalActionsFlat)
		} else {
			val minMaxNode = MinMaxNode<Konane, Action?>(
				konane,
				getKonaneSuccessors,
				"max",
				0,
				null
			)
			return minMaxHandler.minMaxAlphaBeta(
				minMaxNode,
				difficulty,
				getKonaneStaticEval(computer, boardValueDiff)
			)
		}
	}

	fun applyAction(action: Action) {
		konane.applyAction(action)
	}
}

fun getKonaneStaticEval(computer: String, hueristic: (Konane, String) -> Double): (Konane) -> Double {
	val fn = fun (state: Konane): Double {
		return hueristic(state, computer)
	}
	return fn
}

fun simple(state: Konane, player: String): Double {
	if (player != BLACK && player != WHITE) return 0.0
	val legalMovesMap = if (player == WHITE) {state.getWhiteLegalActions()} else {state.getBlackLegalActions()}
	if (legalMovesMap.size == 0) return Double.NEGATIVE_INFINITY
	return legalMovesMap.size.toDouble()
}

val boardValueDiff = fun (state: Konane, player: String): Double {
	if (player != BLACK && player != WHITE) return 0.0 
	val opposingPlayer = oppositeColor(player)
	return boardValue(state, player) - boardValue(state, opposingPlayer)
}

fun boardValue(state: Konane, player: String): Double {
  val opposingPlayer = oppositeColor(player);
  val blackLegalActionsMap = state.getBlackLegalActions();
  val whiteLegalActionsMap = state.getWhiteLegalActions();

  val playerActionsMap = if (player == BLACK) {blackLegalActionsMap} else {whiteLegalActionsMap}
  val opposingActionsMap = if (opposingPlayer == BLACK) {blackLegalActionsMap} else {whiteLegalActionsMap};

  // terminal game state
  if (playerActionsMap.size == 0) return Double.NEGATIVE_INFINITY;
  if (opposingActionsMap.size == 0) return Double.POSITIVE_INFINITY;

  val successors = if (player == BLACK) {state.getBlackSuccessors()} else {state.getWhiteSuccessors()};

  // { action: Konane ... }

  val successorsMap = successors.map { 
	  	entry ->
			val (succ, actionToSucc) = entry
			Pair(actionToSucc.toString(), succ)
	  }.toMap()

  // { [x,y]: -inf ...}
  val cellBestActionValue = playerActionsMap.keys.toList().map {
	  cell -> Pair(cell, Double.NEGATIVE_INFINITY)
  }.toMap(mutableMapOf())

	playerActionsMap.forEach outer@ {
		entry ->
			val cell = entry.key
			val actions = entry.value
			actions.forEach inner@ {
				action ->
					if (action is RemoveChecker) {
						cellBestActionValue.set(cell, removeCheckerValue(action))
					} else if (action is MoveChecker) {
						val actionSuccessor = successorsMap.get(action.toString())
						if (actionSuccessor == null) return@inner
						val actionValue = moveCheckerValue(state, actionSuccessor, action)
						cellBestActionValue.set(
							cell,
							Math.max(actionValue, cellBestActionValue.getOrDefault(cell, Double.NEGATIVE_INFINITY))
						)
					}
			}
	}

  val value = cellBestActionValue.values.toList().fold(0.0) {
	  cur, curVal -> cur + curVal
  }

  return value
}

private fun isCorner(cell: Cell): Boolean {
	val (row, col) = cell
  if (row == 0 && col == 0) return true;
  if (row == 7 && col == 0) return true;
  if (row == 0 && col == 7) return true;
  if (row == 7 && col == 7) return true;
  return false;
}

private fun checkerIsThreatening(
  state: Konane,
  cell: Cell,
  player: String
): Boolean {
  val playerActionsMap = if (player == BLACK) {state.getBlackLegalActions()} else {state.getWhiteLegalActions()}
  return playerActionsMap.containsKey(cell)
};

private fun checkerIsThreatened(
  state: Konane,
  cell: Cell,
  player: String
): Boolean {
  val opposingActionsMap = if (player === BLACK) {state.getWhiteLegalActions()} else {state.getBlackLegalActions()}
  val (row, col) = cell
  val opposingActionsFlat = opposingActionsMap.flatMap { 
			entry -> entry.value
		}
  for (action in opposingActionsFlat) {
    if (action is MoveChecker) {
      val to = action.to
	  val from = action.from
      val (toRow, toCol) = to
      val (fromRow, fromCol) = from
      val minRow = Math.min(toRow, fromRow)
      val maxRow = Math.max(toRow, fromRow)
      val minCol = Math.min(toCol, fromCol)
      val maxCol = Math.max(toCol, fromCol)
      if (minRow == maxRow) {
        // move is left/right
        if (row == minRow && minCol < col && col < maxCol) {
          return true
        }
      } else if (minCol == maxCol) {
        // move is up/down
        if (col == minCol && minRow < row && row < maxRow) {
          return true
        }
      }
    }
  }
  return false
}

private fun moveCheckerValue(
  state: Konane,
  successor: Konane,
  move: MoveChecker
): Double {
  val player = move.player
  var moveValue = 0.0
  val to = move.to
  val from = move.from

  val threatened = checkerIsThreatened(state, from, player)
  val threateningInSucc = checkerIsThreatening(successor, to, player)
  val threatenedInSucc = checkerIsThreatened(successor, to, player)

  if (isCorner(to)) {
    moveValue += 1.45
  } else if (!threatened && threateningInSucc && !threatenedInSucc) {
    // move that gets a move by choice
    moveValue += 1.3
  } else if (!threatened && !threateningInSucc && !threatenedInSucc) {
    // move to get stranded by choice
    moveValue += 1.15
  } else {
    moveValue += 1
  }
  return moveValue
}

private fun removeCheckerValue(move: RemoveChecker): Double{
  val cell = move.cell
  val player = move.player
  val middle =  if (player == BLACK) {Pair(3,3)} else {Pair(3,4)}
  // better to remove checker in the middle of board
  return 1 / pythagoreanDistance(cell, middle);
};



fun pythagoreanDistance(p1: Cell, p2: Cell): Double {
	val (x1, y1) = p1
	val (x2, y2) = p2
	return Math.hypot((x1 - x2).toDouble(), (y1 - y2).toDouble())
}
