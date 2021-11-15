package konane

import minmax.MinMax
import minmax.MinMaxNode

class KonaneGameTest(human: String, difficulty: Int): KonaneGame(human, difficulty) {
	val humanMinMaxHandler = MinMax<Konane, Action?>()
	var expansions = 0
	var branches = 0

	fun getRandomHumanAction(): Action? {
		val legalHumanActions = getLegalHumanActions()
		val legalActionsFlat = legalHumanActions.flatMap { 
			entry -> entry.value
		}
		expansions++
		branches += legalActionsFlat.size
		return randElement(legalActionsFlat)
	}

	fun getBestHumanAction(): Action? {
		val minMaxNode = MinMaxNode<Konane, Action?>(
			konane,
			getKonaneSuccessors,
			"max",
			0,
			null
		)
		return humanMinMaxHandler.minMax(
			minMaxNode,
			5,
			getKonaneStaticEval(computer, boardValueDiff)
		)
		return humanMinMaxHandler.minMaxAlphaBeta(
			minMaxNode,
			8,
			getKonaneStaticEval(computer, boardValueDiff)
		)
	}
}

fun main(){
	val human = BLACK
	val computer = oppositeColor(human)
	val diff = 2

	val game = KonaneGameTest(human, diff)
	loop@ for (i in 0..100) {
		val playerToPlay = game.playerToPlay
		if (playerToPlay == human) {
			val bestHumanAction = game.getBestHumanAction()
			// val bestHumanAction = game.getRandomHumanAction()
			if (bestHumanAction == null) {
				println("human (${human}) lost, computer (${computer}) won, ${game.turn}")
				println("Branch Factor = ${game.branches.toDouble() / game.expansions.toDouble()}")
				println("Evaluations: ${game.humanMinMaxHandler.evaluations}")
				break@loop
			} else {
				game.applyAction(bestHumanAction)
				println(bestHumanAction)
				println(game.board.verbose())
			}
		} else {
			val bestComputerAction = game.getBestComputerAction()
			if (bestComputerAction == null) {
				println("human (${human}) won, computer (${computer}) lost, ${game.turn}")
				println("Branch Factor = ${game.branches.toDouble() / game.expansions.toDouble()}")
				println("Evaluations: ${game.humanMinMaxHandler.evaluations}")
				break@loop
			} else {
				game.applyAction(bestComputerAction)
				println(bestComputerAction)
				println(game.board.verbose())
			}
		}
	}
}