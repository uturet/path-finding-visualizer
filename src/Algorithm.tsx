

export type Point = [number, number]
export interface AlgorithInterface {
    nextStep: (count: number) => boolean
}


abstract class Algorithm implements AlgorithInterface {
  static title: string;
  protected width: number;
  protected height: number;
  protected startPoint: Point;
  protected endPoint: Point;
  protected usePoint: (point: Point) => boolean;
  protected usedCells: Set<number>;

  constructor(width: number, height: number, startIndex: number, endIndex: number, usePoint: (pos: Point) => boolean) {
    this.width = width;
    this.height = height;
    this.startPoint = this.indexToPoint(startIndex);
    this.endPoint = this.indexToPoint(endIndex);
    this.usePoint = usePoint;
    this.usedCells = new Set<number>();
  }

  indexToPoint(index: number): Point {
    const y = Math.floor(index/this.width);
    const x = index - y*this.width;
    return [x, y];
  }

  pointToIndex(point: Point): number {
    return (point[1] * this.width) + point[0];
  }

  isValidPoint(point: Point): boolean {
    return point[0] > -1 && point[0] < this.width && point[1] > -1 && point[1] < this.height;
  }

  abstract nextStep(count: number): boolean
}

export class BFSAlgorithm extends Algorithm {
  static title = 'BFS';
  private around = [[1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]];
  private nextPoints: Set<number>;

  constructor(width: number, height: number, startIndex: number, endIndex: number, usePoint: (pos: Point) => boolean) {
    super(width, height, startIndex, endIndex, usePoint);
    this.nextPoints = new Set();
    this.nextPoints.add(this.pointToIndex(this.startPoint));
  }

  nextStep(count: number): boolean {
    let index: number|undefined = this.nextPoints.keys().next().value;
    if (index === undefined) return true;
    let point = this.indexToPoint(index);
    if (point[0] === this.endPoint[0] && point[1] === this.endPoint[1]) return true;
    this.nextPoints.delete(index);
    while (this.usedCells.has(index) || !this.usePoint(point)) {
      index = this.nextPoints.keys().next().value;
      if (index === undefined) return true;
      point = this.indexToPoint(index);
      if (point[0] === this.endPoint[0] && point[1] === this.endPoint[1]) return true;
      this.nextPoints.delete(index);
    }
    this.usedCells.add(index);

    this.around.forEach((shift) => {
      const p: Point = [point[0]+shift[0], point[1]+shift[1]];
      if (this.isValidPoint(p)) {
        this.nextPoints.add(this.pointToIndex(p));
      }
    });

    return false;
  }
}


class Node {
  parent?: number;
  index: number;
  point: Point;
  g: number;
  h: number;
  f: number;

  constructor(index: number, point: Point, parent?: number) {
    this.parent = parent;
    this.index = index;
    this.point = point;
    this.g = 0;
    this.h = 0;
    this.f = 0;
  }
}


export class AstarAlgorithm extends Algorithm {
  static title = 'A*';
  private around = [[1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]];
  private curIndex: number = 0;
  private openList: Map<number, Node>;
  private closedList: Map<number, Node>;
  private startNode: Node;
  private endNode: Node;
  private curNode: Node;

  constructor(width: number, height: number, startIndex: number, endIndex: number, usePoint: (pos: Point) => boolean) {
    super(width, height, startIndex, endIndex, usePoint);
    this.openList = new Map();
    this.closedList = new Map();
    this.startNode = new Node(startIndex, this.indexToPoint(startIndex));
    this.startNode.g = this.startNode.h = this.startNode.f = 0;
    this.endNode = new Node(endIndex, this.indexToPoint(endIndex));
    this.endNode.g = this.endNode.h = this.endNode.f = 0;
    this.openList.set(startIndex, this.startNode);
    this.curNode = this.startNode;
  }

  nextStep(count: number) {
    if (this.openList.size === 0) return true;
    if (this.curIndex === 0) {
      this.curNode = this.openList.values().next().value;
      this.openList.forEach((n) => {
        if (n.f < this.curNode.f) {
          this.curNode = n;
        }
      });
      this.openList.delete(this.curNode.index);
      this.closedList.set(this.curNode.index, this.curNode);
    }
    if (this.curNode.index === this.endNode.index) return true;

    this.getNewNodes();
    return false;
  }

  getNewNodes(): void {
    for (let i=this.curIndex; i<8; i++) {
      const p: Point = [this.curNode.point[0]+this.around[this.curIndex][0], this.curNode.point[1]+this.around[this.curIndex][1]];
      const index = this.pointToIndex(p);
      if (this.usePoint(p) && this.isValidPoint(p)) {
        const n = new Node(index, p, this.curNode.index);
        n.g = this.curNode.g+1;
        n.h = ((n.point[0] - this.endNode.point[0])**2) + ((n.point[1] - this.endNode.point[1])**2);
        n.f = n.g + n.h;
        if (index === this.endNode.index) {
          this.openList.clear();
          return;
        }
        if (this.closedList.has(n.index)) {
          if ((this.closedList.get(n.index) as Node).f > n.f) this.closedList.set(n.index, n);
        } else if (this.openList.has(n.index)) {
          if ((this.openList.get(n.index) as Node).f > n.f) this.openList.set(n.index, n);
        } else {
          this.openList.set(n.index, n);
          this.curIndex = (this.curIndex+1) % 8;
          break;
        };
      }
      this.curIndex = (this.curIndex+1) % 8;
    }
  }
}
