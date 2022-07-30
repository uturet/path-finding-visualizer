

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

  constructor(width: number, height: number, startPoint: Point, endPoint: Point, usePoint: (pos: Point) => boolean) {
    console.log(startPoint, endPoint);
    this.width = width;
    this.height = height;
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.usePoint = usePoint;
  }

  abstract nextStep(count: number): boolean
}

export class BFSAlgorithm extends Algorithm {
  private steps = 1;
  private curStep = 0;
  private doc = [[1, -1, 0, 1], [1, 1, -1, 0], [-1, 1, 0, -1], [-1, -1, 1, 0]]; // [StartPoint, Direction]
  private curDocIndex = 0;
  private curDoc = this.doc[this.curDocIndex];

  nextStep(count: number): boolean {
    let point: Point = [
      this.startPoint[0]+this.curDoc[0]*this.steps+this.curDoc[2]*this.curStep,
      this.startPoint[1]+this.curDoc[1]*this.steps+this.curDoc[3]*this.curStep,
    ];


    if (this.usePoint(point)) {
      this.curStep++;

      if (this.curStep == this.steps*2) {
        this.curStep = 0;
        this.curDocIndex++;
        if (this.curDocIndex > 3) {
          this.curDocIndex = 0;
          this.steps++;
        }
        this.curDoc = this.doc[this.curDocIndex];
      }
    } else {
      while (!this.usePoint(point)) {
        point = [
          this.startPoint[0]+this.curDoc[0]*this.steps+this.curDoc[2]*this.curStep,
          this.startPoint[1]+this.curDoc[1]*this.steps+this.curDoc[3]*this.curStep,
        ];

        this.curStep++;

        if (this.curStep == this.steps*2) {
          this.curStep = 0;
          this.curDocIndex++;
          if (this.curDocIndex > 3) {
            this.curDocIndex = 0;
            this.steps++;
          }
          this.curDoc = this.doc[this.curDocIndex];
        }
      }
    }

    return point[0] == this.endPoint[0] && point[1] == this.endPoint[1];
  }
}
