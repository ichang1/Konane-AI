package konane

const val BLACK = "BLACK"
const val WHITE = "WHITE"
const val BLACK_CHECKER = "X";
const val WHITE_CHECKER = "O";
const val EMPTY = ".";

typealias Cell = Pair<Int, Int> 

typealias PlayerActions = Map<Cell, List<Action>>

typealias Jump = Pair<Cell, Int>

typealias Board = List<MutableList<String>>

fun Board.verbose(): String {
	var s = ""
	for (i in this.indices) {
		s += this[i].toString()
		if (i != this.size - 1) s += "\n"
	}
	return s
}

fun Board.deepCopy(): Board {
	val copy = this.map {
		row -> row.map {
			el -> el
		}.toMutableList()
	}
	return copy
}

open class Action(val player: String, val type: String)

class RemoveChecker(player: String, type: String, val cell: Cell): Action(player, type) {
	override fun toString(): String{
		return "${player} ${type} ${cell}"
	}
}

class MoveChecker(player: String, type: String, val from: Cell, val to: Cell): Action(player, type){
	override fun toString(): String{
		return "${player} ${type} ${from} ${to}"
	}
}

val possibleJumps = listOf(
	// right
	Jump(Cell(0,2), 1),
	Jump(Cell(0,2), 2),
	Jump(Cell(0,2), 3),
	// left
	Jump(Cell(0,-2), 1),
	Jump(Cell(0,-2), 2),
	Jump(Cell(0,-2), 3),
	// up
	Jump(Cell(2,0), 1),
	Jump(Cell(2,0), 2),
	Jump(Cell(2,0), 3),
	// down
	Jump(Cell(-2,0), 1),
	Jump(Cell(-2,0), 2),
	Jump(Cell(-2,0), 3),
)

fun oppositeColor(player: String): String {
	if (player != BLACK && player != WHITE) return ""
	if (player == BLACK) return WHITE
	return BLACK
}

fun randInt(min: Int, max: Int): Int {
	if (max < min) return 0
	return (min..max).random()
}

fun <T>randElement(l: List<T>): T? {
	if (l.size == 0) return null
	val randIdx = randInt(0, l.size - 1)
	return l[randIdx]
}