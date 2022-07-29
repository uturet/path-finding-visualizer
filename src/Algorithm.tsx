

export type Point = [number, number]
export interface AlgorithInterface {
    nextStep: (count: number) => boolean
}

abstract class Algorithm implements AlgorithInterface {
  protected width: number;
  protected height: number;
  protected startPoint: Point;
  protected endPoint: Point;
  protected usePoint: (point: Point) => void;

  constructor(width: number, height: number, startPoint: Point, endPoint: Point, usePoint: (pos: Point) => void) {
    this.width = width;
    this.height = height;
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.usePoint = usePoint;
  }

  abstract nextStep(count: number): boolean
}

export class BFSAlgorithm extends Algorithm {
  nextStep(count: number): boolean {
    if (count < this.width && count < this.height) {
      this.usePoint([count, count]);
      return false;
    }
    return true;
  }
}
