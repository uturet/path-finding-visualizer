

export type Point = [number, number]
export interface AlgorithInterface {
    nextStep: (count: number) => boolean
}


abstract class Algorithm implements AlgorithInterface {
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
    if (point[0] == this.endPoint[0] && point[1] == this.endPoint[1]) return true;
    this.nextPoints.delete(index);
    while (this.usedCells.has(index) || !this.usePoint(point)) {
      index = this.nextPoints.keys().next().value;
      if (index === undefined) return true;
      point = this.indexToPoint(index);
      if (point[0] == this.endPoint[0] && point[1] == this.endPoint[1]) return true;
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
