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

interface SuccessorCache<T, V> {
  [key: string]: MinMaxNode<T, V>[];
}

interface EvalCache {
  [key: string]: number;
}

export class MinMax<T, V> {
  successorCache: SuccessorCache<T, V>;
  evalCache: EvalCache;

  constructor() {
    this.successorCache = {};
    this.evalCache = {};
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
      const nodeStateStr = `${node.state}`;
      const nodeSuccessors =
        this.successorCache[nodeStateStr] || node.getSuccessors();
      if (!(nodeStateStr in this.successorCache))
        this.successorCache[nodeStateStr] = nodeSuccessors;
      if (depth >= maxDepth || nodeSuccessors.length === 0) {
        const stateEval =
          this.evalCache[nodeStateStr] || staticEvalFn(node.state);
        if (!(nodeStateStr in this.evalCache))
          this.evalCache[nodeStateStr] = stateEval;
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
      const nodeStateStr = `${node.state}`;
      const nodeSuccessors =
        this.successorCache[nodeStateStr] || node.getSuccessors();
      if (!(nodeStateStr in this.successorCache))
        this.successorCache[nodeStateStr] = nodeSuccessors;
      if (depth >= maxDepth || nodeSuccessors.length === 0) {
        const stateEval =
          this.evalCache[nodeStateStr] || staticEvalFn(node.state);
        if (!(nodeStateStr in this.evalCache))
          this.evalCache[nodeStateStr] = stateEval;
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
          if (alpha >= beta) return [beta, curBestMove];
        } else {
          // min node
          if (bestMoveFromSuccValue < beta) {
            // found move that results in better game state
            beta = bestMoveFromSuccValue;
            curBestMove = succNode.move;
          }
          if (alpha <= beta) return [alpha, curBestMove];
        }
      }
      return [minMaxNodeIsMax(node) ? alpha : beta, curBestMove];
    };
    const [bestSuccStateValue, bestMove] = minMaxAlphaBetaRec(node);
    return bestMove;
  };
}

//---------------------------------------------------------------------

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
  // alpha beta values
  alpha: number;
  beta: number;
  constructor(
    state: T,
    getStateSuccessors: (state: T) => [T, V][],
    type: MinMaxNodeType,
    depth: number,
    move: V,
    alpha: number = Number.NEGATIVE_INFINITY,
    beta: number = Number.POSITIVE_INFINITY
  ) {
    this.state = state;
    this.getStateSuccessors = getStateSuccessors;
    this.type = type;
    this.depth = depth;
    this.move = move;
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
        moveToSuccState
      );
      successors[idx] = succNode;
    });
    return successors;
  }
}

export const minMax = <T, V>(
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
    const nodeSuccessors = node.getSuccessors();
    if (depth >= maxDepth || nodeSuccessors.length === 0) {
      return [staticEvalFn(node.state), move];
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

export const minMaxAlphaBeta = <T, V>(
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
    const nodeSuccessors = node.getSuccessors();
    if (depth >= maxDepth || nodeSuccessors.length === 0) {
      return [staticEvalFn(node.state), move];
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
        if (alpha >= beta) return [beta, curBestMove];
      } else {
        // min node
        if (bestMoveFromSuccValue < beta) {
          // found move that results in better game state
          beta = bestMoveFromSuccValue;
          curBestMove = succNode.move;
        }
        if (alpha <= beta) return [alpha, curBestMove];
      }
    }
    return [minMaxNodeIsMax(node) ? alpha : beta, curBestMove];
  };
  const [bestSuccStateValue, bestMove] = minMaxAlphaBetaRec(node);
  return bestMove;
};
