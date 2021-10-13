// type MinMaxNodeType = "min" | "max";

// class MinMaxNode {
//   state: any;
//   action: any;
//   type: MinMaxNodeType;
//   parent: MinMaxNode;
//   constructor(
//     state: any,
//     action: any,
//     type: MinMaxNodeType,
//     parent: MinMaxNode
//   ) {
//     this.state = state;
//     this.action = action;
//     this.type = type;
//     this.parent = parent;
//   }

//   get path() {
//     return 0;
//   }

//   bubble() {
//     return;
//   }
// }

class PriorityQueueNode<T> {
  element: T | null;
  priority: number;
  constructor(element: T, priority: number) {
    this.element = element;
    this.priority = priority;
  }
}

export default class PriorityQueue<T> {
  heap: PriorityQueueNode<T>[];
  priorityFn: (element: T) => number;
  constructor(priorityFn: (element: T) => number) {
    this.heap = [];
    this.priorityFn = priorityFn;
  }

  push(element: T) {
    const priority = this.priorityFn(element);
    const node = new PriorityQueueNode<T>(element, priority);
    this.heap.push(node);
    this.heapifyUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    const root = this.heap[0];
    this.heap = this.heap.slice(1, this.heap.length);
    this.heapifyDown(0);
    return root.element;
  }

  toString() {
    return this.heap.toString();
  }

  private heapifyDown(i: number) {
    const n = this.heap.length - 1;
    if (i > n) return;
    let curIdx = i;
    while (curIdx <= n) {
      const cur = this.heap[i];
      const leftIdx = 2 * curIdx + 1;
      const rightIdx = 2 * curIdx + 2;
      const leftChild = this.heap[leftIdx];
      const rightChild = this.heap[rightIdx];
      if (leftIdx <= n && rightIdx <= n) {
        // has 2 children
        // get smaller child's curIdx
        let smallerChildIdx = i;
        smallerChildIdx =
          leftChild.priority < this.heap[smallerChildIdx].priority
            ? leftIdx
            : smallerChildIdx;
        smallerChildIdx =
          rightChild.priority < this.heap[smallerChildIdx].priority
            ? rightIdx
            : smallerChildIdx;
        // if parent is smaller than both children
        if (smallerChildIdx === curIdx) return;
        // swap smaller child with parent
        [this.heap[i], this.heap[smallerChildIdx]] = [
          this.heap[i],
          this.heap[smallerChildIdx],
        ];
        curIdx = smallerChildIdx;
      } else if (leftIdx <= n) {
        // has only left child
        if (leftChild.priority < cur.priority) {
          // swap parent and child
          // heapify down left subtree
          [this.heap[i], this.heap[leftIdx]] = [
            this.heap[leftIdx],
            this.heap[i],
          ];
          curIdx = leftIdx;
        } else return;
      } else if (rightIdx <= n) {
        // has only right chid
        if (rightChild.priority < cur.priority) {
          // swap parent and child
          [this.heap[i], this.heap[rightIdx]] = [
            this.heap[rightIdx],
            this.heap[i],
          ];
          // heapfiy down right subtree
          curIdx = rightIdx;
        } else return;
      } else {
        // no children
        return;
      }
    }
  }

  private heapifyUp(i: number) {
    let curIdx = i;
    while (curIdx > 0) {
      const cur = this.heap[curIdx];
      const parentIdx = Math.floor((curIdx - 1) / 2);
      const parent = this.heap[parentIdx];
      if (parent.priority > cur.priority) {
        //swap cur with parent
        [this.heap[parentIdx], this.heap[curIdx]] = [
          this.heap[curIdx],
          this.heap[parentIdx],
        ];

        curIdx = parentIdx;
      } else {
        return;
      }
    }
  }

  isEmpty() {
    return this.heap.length === 0;
  }
}
