export type MinMaxNodeType = "min" | "max";

export const minMaxNodeTypeIsMin = (type: MinMaxNodeType): type is "min" => {
  return type === "min";
};

export const minMaxNodeTypeIsMax = (type: MinMaxNodeType): type is "max" => {
  return type === "max";
};

export class MinMaxNode<T, V> {
  // state is of type T
  // action to get to a state is of type V
  state: T;
  private stateEvalFn: (state: T) => Number;
  private getStateSuccessors: (state: T) => [T, V][];
  type: MinMaxNodeType;
  alpha: Number;
  beta: Number;
  constructor(
    state: any,
    stateEvalFn: (state: T) => Number,
    getStateSuccessors: (state: T) => [T, V][],
    type: MinMaxNodeType,
    alpha: Number = Number.NEGATIVE_INFINITY,
    beta: Number = Number.POSITIVE_INFINITY
  ) {
    this.state = state;
    this.stateEvalFn = stateEvalFn;
    this.getStateSuccessors = getStateSuccessors;
    this.type = type;
    this.alpha = alpha;
    this.beta = beta;
  }

  get staticEval() {
    return this.stateEvalFn(this.state);
  }

  get stateSuccessors() {
    return this.getStateSuccessors(this.state);
  }

  minMax(depth: number): V {
    const [_, move] = this.minMaxRec(this, depth);
    return move;
  }

  private minMaxRec(node: MinMaxNode<T, V>, depth: Number): [number, V] {}
}
