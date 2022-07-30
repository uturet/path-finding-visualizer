

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

  constructor(width: number, height: number, startPoint: number, endPoint: number, usePoint: (pos: Point) => boolean) {
    this.width = width;
    this.height = height;
    this.startPoint = this.indexToPoint(startPoint);
    this.endPoint = this.indexToPoint(endPoint);
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

  constructor(width: number, height: number, startPoint: number, endPoint: number, usePoint: (pos: Point) => boolean) {
    super(width, height, startPoint, endPoint, usePoint);
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


class Box {
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
  private openList: Map<number, Box>;
  private closedList: Map<number, Box>;
  private startNode: Box;
  private endNode: Box;
  private isEnd: boolean = false;

  constructor(width: number, height: number, startPoint: number, endPoint: number, usePoint: (pos: Point) => boolean) {
    super(width, height, startPoint, endPoint, usePoint);
    this.openList = new Map();
    this.closedList = new Map();
    this.startNode = new Box(startPoint, this.indexToPoint(startPoint));
    this.startNode.g = this.startNode.h = this.startNode.f = 0;
    this.endNode = new Box(endPoint, this.indexToPoint(endPoint));
    this.endNode.g = this.endNode.h = this.endNode.f = 0;
    this.openList.set(startPoint, this.startNode);
  }

  nextStep(count: number) {
    console.log(count, this.isEnd);
    if (this.openList.size === 0 || this.isEnd) return true;
    let curNode = this.openList.values().next().value;
    this.openList.forEach((n) => {
      if (n.f < curNode.f) {
        curNode = n;
      }
    });
    this.openList.delete(curNode.index);
    this.closedList.set(curNode.index, curNode);
    if (curNode.index === this.endNode.index) return true;
    this.getNewNodes(curNode);
    return false;
  }

  getNewNodes(node: Box): void {
    for (let i=0; i<this.around.length; i++) {
      const p: Point = [node.point[0]+this.around[i][0], node.point[1]+this.around[i][1]];
      const index = this.pointToIndex(p);
      if (this.usePoint(p) && this.isValidPoint(p)) {
        const n = new Box(index, p, node.index);
        n.g = node.g;
        n.h = ((n.point[0] - this.endNode.point[0])**2) + ((n.point[1] - this.endNode.point[1])**2);
        n.f = node.g + node.h;
        if (index === this.endNode.index) {
          this.openList.clear();
          this.openList.set(n.index, n);
        }
        if (this.closedList.has(n.index)) {
          if ((this.closedList.get(n.index) as Box).f > n.f) this.closedList.set(n.index, n);
        } else if (this.openList.has(n.index)) {
          if ((this.openList.get(n.index) as Box).f > n.f) this.openList.set(n.index, n);
        } else this.openList.set(n.index, n);
      }
    }
  }
}
