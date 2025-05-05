export class Line {
  x1;
  y1;

  x2;
  y2;

  
  collidesWith(otherLine) {

    let xDiff1 = this.x2 - this.x1;
    let yDiff1 = this.y2 - this.y1;

    let xDiff2 = otherLine.x2 - otherLine.x1;
    let yDiff2 = otherLine.y2 - otherLine.y1;

    let c1 = (this.x1 * this.y2) - (this.y1 * this.x2)

    let c2 = (otherLine.x1 * otherLine.y2) - (otherLine.y1 * otherLine.x2)

    let determinant = (xDiff1 * yDiff2) - (xDiff2 * yDiff1);

    if (determinant === 0) {
      return false;
    }

    let Dx = (c2 * xDiff1) - (c1 * xDiff2);
    let Dy = (c2 * yDiff1) - (c1 * yDiff2);

    let y = Dy / determinant;
    let x = Dx / determinant;

    let greaterX1 = this.x1;
    let lesserX1 = this.x2;
    if (lesserX1 > greaterX1) {
      greaterX1 = this.x2;
      lesserX1 = this.x1;
    }

    let greaterY1 = this.y1;
    let lesserY1 = this.y2;
    if (lesserY1 > greaterY1) {
      greaterY1 = this.y2;
      lesserY1 = this.y1;
    }

    let greaterX2 = otherLine.x1;
    let lesserX2 = otherLine.x2;
    if (lesserX2 > greaterX2) {
      greaterX2 = otherLine.x2;
      lesserX2 = otherLine.x1;
    }

    let greaterY2 = otherLine.y1;
    let lesserY2 = otherLine.y2;
    if (lesserY2 > greaterY2) {
      greaterY2 = otherLine.y2;
      lesserY2 = otherLine.y1;
    }

    if (x < greaterX1 && x > lesserX1 && y < greaterY1 && y > lesserY1 && x < greaterX2 && x > lesserX2 && y < greaterY2 && y > lesserY2) {
      return [x, y];
    }
    return false;

  }
}

export function solveForest(lines) {
  console.log("hello");
}

// function randRange(min, max) {
//   let range = max - min;
//   return Math.floor(Math.random() * range) + min;
// }