export type MinMaxNodeType = "min" | "max";

export const minMaxNodeTypeIsMin = (type: MinMaxNodeType): type is "min" => {
  return type === "min";
};

export const minMaxNodeTypeIsMax = (type: MinMaxNodeType): type is "max" => {
  return type === "max";
};

export const minMaxNodeIsMin = <T, V>(node: MinMaxNode<T, V>) => {
  return node.type === "min";
};

export const minMaxNodeIsMax = <T, V>(node: MinMaxNode<T, V>) => {
  return node.type === "max";
};

export const oppositeMinMaxNodeType = (
  type: MinMaxNodeType
): MinMaxNodeType => {
  if (minMaxNodeTypeIsMin(type)) return "max";
  else return "min";
};

interface GenericWithToString {
  toString: () => string;
}

export class MinMax<T extends GenericWithToString, V> {
  successorCache: Map<String, MinMaxNode<T, V>[]>;
  evalCache: Map<String, number>;

  constructor() {
    this.successorCache = new Map();
    this.evalCache = new Map();
  }

  minMax = (
    node: MinMaxNode<T, V>,
    maxDepth: number,
    staticEvalFn: (nodeState: T) => number
  ): V => {
    /**
     *
     * @param node min max node
     * @returns val of succ state from a move, best move to take from looking ahead
     */
    const minMaxRec = (node: MinMaxNode<T, V>): [number, V] => {
      const { depth, move } = node;
      // get/store values in successors and eval cache
      const nodeStateStr = node.state.toString();
      const nodeSuccessors =
        this.successorCache.get(nodeStateStr) || node.getSuccessors();
      if (!this.successorCache.has(nodeStateStr))
        this.successorCache.set(nodeStateStr, nodeSuccessors);
      if (depth >= maxDepth || nodeSuccessors.length === 0) {
        const stateEval =
          this.evalCache.get(nodeStateStr) || staticEvalFn(node.state);
        if (!this.evalCache.has(nodeStateStr))
          this.evalCache.set(nodeStateStr, stateEval);
        return [stateEval, move];
      }
      const bestMoveDetails = nodeSuccessors.reduce<[number, V]>(
        (curBest, succNode) => {
          // current best move and move's value
          const [curBestMoveToSuccValue, curBestMoveToSucc] = curBest;
          // best move from a successor and its value
          const [bestMoveFromSuccValue, bestMoveFromSucc] = minMaxRec(succNode);
          if (
            minMaxNodeIsMax(node)
              ? bestMoveFromSuccValue > curBestMoveToSuccValue
              : bestMoveFromSuccValue < curBestMoveToSuccValue
          ) {
            // successor led to a better terminating game state
            // the new best move value is from this successor's best descendent
            // the new best move to take is the move to get to this successor
            return [bestMoveFromSuccValue, succNode.move];
          } else {
            return curBest;
          }
        },
        [Number.NEGATIVE_INFINITY, nodeSuccessors[0].move]
      );
      return bestMoveDetails;
    };
    const [bestSuccStateValue, bestMove] = minMaxRec(node);
    return bestMove;
  };

  minMaxAlphaBeta = (
    node: MinMaxNode<T, V>,
    maxDepth: number,
    staticEvalFn: (nodeState: T) => number
  ): V => {
    /**
     *
     * @param node min max node
     * @returns val of succ state from a move, best move to take from looking ahead
     */
    const minMaxAlphaBetaRec = (node: MinMaxNode<T, V>): [number, V] => {
      const { depth, move } = node;
      // get/store values in successors and eval cache
      const nodeStateStr = node.state.toString();
      const nodeSuccessors =
        this.successorCache.get(nodeStateStr) || node.getSuccessors();
      if (!this.successorCache.has(nodeStateStr)) {
        this.successorCache.set(nodeStateStr, nodeSuccessors);
      }
      if (depth >= maxDepth || nodeSuccessors.length === 0) {
        const stateEval =
          this.evalCache.get(nodeStateStr) || staticEvalFn(node.state);
        if (!this.evalCache.has(nodeStateStr))
          this.evalCache.set(nodeStateStr, stateEval);
        return [stateEval, move];
      }
      let { alpha, beta } = node;
      let curBestMove = nodeSuccessors[0].move;
      for (let succNode of nodeSuccessors) {
        // successor function doesn't work with alpha beta so need to set it manually
        succNode.alpha = alpha;
        succNode.beta = beta;
        const [bestMoveFromSuccValue, bestMoveFromSucc] =
          minMaxAlphaBetaRec(succNode);
        if (minMaxNodeIsMax(node)) {
          if (bestMoveFromSuccValue > alpha) {
            // found move that results in better game state
            alpha = bestMoveFromSuccValue;
            curBestMove = succNode.move;
          }
          if (alpha >= beta) return [alpha, curBestMove];
        } else {
          // min node
          if (bestMoveFromSuccValue < beta) {
            // found move that results in better game state
            beta = bestMoveFromSuccValue;
            curBestMove = succNode.move;
          }
          if (alpha >= beta) return [beta, curBestMove];
        }
      }
      return [minMaxNodeIsMax(node) ? alpha : beta, curBestMove];
    };
    const [bestSuccStateValue, bestMove] = minMaxAlphaBetaRec(node);
    return bestMove;
  };
}

export class MinMaxNode<T, V> {
  // state is of type T
  // action to get to a state is of type V

  // game state
  state: T;
  // function to get successor states
  private getStateSuccessors: (state: T) => [T, V][];
  // min/max
  type: MinMaxNodeType;
  // depth of node
  depth: number;
  // move to get to this.state
  move: V;
  // optional reorder function
  reorderCmp:
    | ((state: T, successor1: [T, V], successor2: [T, V]) => number)
    | null;
  // alpha beta values
  alpha: number;
  beta: number;
  constructor(
    state: T,
    getStateSuccessors: (state: T) => [T, V][],
    type: MinMaxNodeType,
    depth: number,
    move: V,
    reorderCmp:
      | ((state: T, successor1: [T, V], successor2: [T, V]) => number)
      | null = null,
    alpha: number = Number.NEGATIVE_INFINITY,
    beta: number = Number.POSITIVE_INFINITY
  ) {
    this.state = state;
    this.getStateSuccessors = getStateSuccessors;
    this.type = type;
    this.depth = depth;
    this.move = move;
    this.reorderCmp = reorderCmp;
    this.alpha = alpha;
    this.beta = beta;
  }

  getSuccessors() {
    const succStates = this.getStateSuccessors(this.state);
    const successors: MinMaxNode<T, V>[] = new Array(succStates.length);
    succStates.forEach(([succState, moveToSuccState], idx) => {
      const succNode = new MinMaxNode(
        succState,
        this.getStateSuccessors,
        oppositeMinMaxNodeType(this.type),
        this.depth + 1,
        moveToSuccState,
        this.reorderCmp
      );
      successors[idx] = succNode;
    });
    if (this.reorderCmp !== null) {
      successors.sort((succ1, succ2) =>
        this.reorderCmp!(
          this.state,
          [succ1.state, succ1.move],
          [succ2.state, succ2.move]
        )
      );
    }
    return successors;
  }
}
