export type MinMaxNodeType = "min" | "max";

export const minMaxNodeTypeIsMin = (type: MinMaxNodeType): type is "min" => {
  return type === "min";
};

export const minMaxNodeTypeIsMax = (type: MinMaxNodeType): type is "max" => {
  return type === "max";
};

export const oppositeMinMaxNodeType = (
  type: MinMaxNodeType
): MinMaxNodeType => {
  if (minMaxNodeTypeIsMin(type)) return "max";
  else return "min";
};

export class MinMaxNode<T, V> {
  // state is of type T
  // action to get to a state is of type V
  state: T;
  private getStateSuccessors: (state: T) => [T, V][];
  type: MinMaxNodeType;
  depth: number;
  move: V;
  alpha: number;
  beta: number;
  constructor(
    state: any,
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

const minMax = <T, V>(
  node: MinMaxNode<T, V>,
  maxDepth: number,
  staticEvalFn: (node: MinMaxNode<T, V>) => number
): V => {
  /**
   *
   * @param node min max node
   * @returns val of succ state from a move, best move to take from looking ahead
   */
  const minMaxRec = (node: MinMaxNode<T, V>): [number, V] => {
    const { depth, move } = node;
    const nodeSuccessors = node.getSuccessors();
    if (depth > maxDepth || nodeSuccessors.length === 0) {
      return [staticEvalFn(node), move];
    }
    const bestMoveDetails = nodeSuccessors.reduce<[number, V]>(
      (curBest, succNode) => {
        // current best move and move's value
        const [curBestMoveToSuccValue, curBestMoveToSucc] = curBest;
        // best move from a successor and its value
        const [bestMoveFromSuccValue, bestMoveFromSucc] = minMaxRec(succNode);
        if (bestMoveFromSuccValue > curBestMoveToSuccValue) {
          // successor led to a better terminating game state
          // the new best move value is from this successor's best terminating game state
          // the new best move to take is the move to get to this successor
          return [curBestMoveToSuccValue, succNode.move];
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
