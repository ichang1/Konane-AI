package minmax

private fun oppositeMinMaxNodeType(type: String): String {
	if (type != "min" && type != "max") return ""
	if (type == "min") return "max"
	return "min"
}

private fun <T, V>minMaxNodeIsMax(node: MinMaxNode<T, V>): Boolean {
	return node.type == "max"
}

class MinMaxNode<T, V>(
	val state: T,
	val getStateSuccessors: (T) -> List<Pair<T, V>>,
	val type: String,
	val depth: Int,
	val move: V,
	val _alpha: Double = Double.NEGATIVE_INFINITY,
	val _beta: Double = Double.POSITIVE_INFINITY 
) {
	var alpha: Double
	var beta: Double
	init {
		alpha = _alpha
		beta = _beta
	}
	fun getSuccessors(): List<MinMaxNode<T, V>> {
		val succStates = getStateSuccessors(state)
		val successors = succStates.map {
			succ ->
				val (succState, moveToSucc) = succ
				val succNode = MinMaxNode(
					succState,
					getStateSuccessors,
					oppositeMinMaxNodeType(type),
					depth + 1,
					moveToSucc
				)
				succNode
		}
		return successors
	}
}

class MinMax<T, V>{
	val successorCache = mutableMapOf<String, List<MinMaxNode<T, V>>>()
	val evalCache = mutableMapOf<String, Double>()
	var evaluations = 0

	@Suppress("UNUSED_VARIABLE")
	fun minMax(node: MinMaxNode<T, V>, maxDepth: Int, staticEvalFn: (T) -> Double): V {
		fun minMaxRec(node: MinMaxNode<T, V>): Pair<Double, V>{
			val depth = node.depth
			val move = node.move
			val nodeStateStr = node.state.toString()
			val nodeSuccessors = successorCache.getOrDefault(nodeStateStr, node.getSuccessors())
			
			successorCache.set(nodeStateStr, nodeSuccessors)

			if (depth >= maxDepth || nodeSuccessors.size == 0) {
				evaluations++
				val stateEval = evalCache.getOrDefault(nodeStateStr, staticEvalFn(node.state))
				evalCache.set(nodeStateStr, stateEval)
				return Pair(stateEval, move)
			}
			val initialValue = if (minMaxNodeIsMax(node)) {Double.NEGATIVE_INFINITY} else {Double.POSITIVE_INFINITY}
			val initial = Pair(initialValue, nodeSuccessors[0].move)
			val bestMoveDetails = nodeSuccessors.fold(initial) {
				curBest, succNode ->
					val (curBestMoveToSuccValue, curBestMoveToSucc) = curBest

					val (bestMoveFromSuccValue, bestMoveFromSucc) = minMaxRec(succNode)

					if(if (minMaxNodeIsMax(node)) {bestMoveFromSuccValue > curBestMoveToSuccValue} else {bestMoveFromSuccValue < curBestMoveToSuccValue}){
						Pair(bestMoveFromSuccValue, succNode.move)
					} else {
						curBest
					}
			}
			return bestMoveDetails
		}
		val (bestSuccStateValue, bestMove) = minMaxRec(node)
		return bestMove
	}

	@Suppress("UNUSED_VARIABLE")
	fun minMaxAlphaBeta(node: MinMaxNode<T, V>, maxDepth: Int, staticEvalFn: (T) -> Double): V {
		fun minMaxAlphaBetaRec(node: MinMaxNode<T, V>): Pair<Double, V>{
			val depth = node.depth
			val move = node.move
			val nodeStateStr = node.state.toString()
			val nodeSuccessors = successorCache.getOrDefault(nodeStateStr, node.getSuccessors())
			
			successorCache.set(nodeStateStr, nodeSuccessors)

			if (depth >= maxDepth || nodeSuccessors.size == 0) {
				evaluations++
				val stateEval = evalCache.getOrDefault(nodeStateStr, staticEvalFn(node.state))
				evalCache.set(nodeStateStr, stateEval)
				return Pair(stateEval, move)
			}

			var alpha = node.alpha
			var beta = node.beta
			var curBestMove = nodeSuccessors[0].move
			for (succNode in nodeSuccessors){
				succNode.alpha = alpha;
				succNode.beta = beta;
				val (bestMoveFromSuccValue, bestMoveFromSucc) = minMaxAlphaBetaRec(succNode)
				if (minMaxNodeIsMax(node)) {
					if (bestMoveFromSuccValue > alpha) {
						alpha = bestMoveFromSuccValue
						curBestMove = succNode.move
					}
					if (alpha >= beta) return Pair(alpha, curBestMove)
				} else {
					if (bestMoveFromSuccValue < beta){
						beta = bestMoveFromSuccValue
						curBestMove = succNode.move
					}
					if (alpha >= beta) return Pair(beta, curBestMove)
				}
			}
			val bestValue = if(minMaxNodeIsMax(node)) {alpha} else {beta}
			return Pair(bestValue, curBestMove)
		}
		val (bestSuccStateValue, bestMove) = minMaxAlphaBetaRec(node)
		return bestMove
	}
}