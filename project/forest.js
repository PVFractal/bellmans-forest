const POINTS_ON_LINES = 20;
const POINTS_INSIDE_SHAPE = 200;
const EPSILON = 0.001;


export class Line {
  x1;
  y1;

  x2;
  y2;

  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  
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

    x = roundTo(x, 10);
    y = roundTo(y, 10);

    greaterX1 = roundTo(greaterX1, 10);
    lesserX1 = roundTo(lesserX1, 10);
    greaterX2 = roundTo(greaterX2, 10);
    lesserX2 = roundTo(lesserX2, 10);

    greaterY1 = roundTo(greaterY1, 10);
    lesserY1 = roundTo(lesserY1, 10);
    greaterY2 = roundTo(greaterY2, 10);
    lesserY2 = roundTo(lesserY2, 10);

    const isEndPoint = ((x === this.x1 && y === this.y1) || (x === this.x2 && y === this.y2) || (x === otherLine.x1 && y === otherLine.y1) || (x === otherLine.x2 && y === otherLine.y2));

    if (isEndPoint) {
      return false;
    }

    if (x <= greaterX1 && x >= lesserX1 && y <= greaterY1 && y >= lesserY1 && x <= greaterX2 && x >= lesserX2 && y <= greaterY2 && y >= lesserY2) {
      return [x, y];
    }
    return false;

  }

  getPointAlongLine(percentage) {
    let xDiff = this.x2 - this.x1;
    let yDiff = this.y2 - this.y1;

    let x = (xDiff * percentage) + this.x1;
    let y = (yDiff * percentage) + this.y1;

    return new Point(x, y);
  }
}

export class Point {
  x
  y
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

export function solveForest(lines) {
  let points = getTestPoints(lines);
  return points;
}

function getTestPoints(lines) {
  let pointArray = [];

  // Getting the test points along the lines
  for (let i = 0; i < lines.length; i++) {
    for (let p = 0; p <= POINTS_ON_LINES; p++) {
      let percentage = p / POINTS_ON_LINES;

      let pointOnLine = lines[i].getPointAlongLine(percentage);

      // Getting four different points close to the line. 
      // Chances are that at least one of these will be inside the forest
      let p1 = new Point(pointOnLine.x + EPSILON, pointOnLine.y);
      let p2 = new Point(pointOnLine.x - EPSILON, pointOnLine.y);
      let p3 = new Point(pointOnLine.x, pointOnLine.y + EPSILON);
      let p4 = new Point(pointOnLine.x, pointOnLine.y - EPSILON);

      if (pointInsideLines(p1, lines)) {
        pointArray.push(p1);
      }
      if (pointInsideLines(p2, lines)) {
        pointArray.push(p2);
      }
      if (pointInsideLines(p3, lines)) {
        pointArray.push(p3);
      }
      if (pointInsideLines(p4, lines)) {
        pointArray.push(p4);
      }
    }
  }

  // Getting the test point inside the shape

  // First getting the smallest "box" to fit the shape in
  // This is so that when we randomly place points in the shape,
  // we won't get guess too far outside the shape
  let largestX = -1;
  let smallestX = -1;
  let largestY = -1;
  let smallestY = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].x1 > largestX || largestX === -1) {
      largestX = lines[i].x1;
    }
    if (lines[i].x2 > largestX || largestX === -1) {
      largestX = lines[i].x2;
    }
    if (lines[i].y1 > largestY || largestY === -1) {
      largestY = lines[i].y1;
    }
    if (lines[i].y2 > largestY || largestY === -1) {
      largestY = lines[i].y2;
    }

    if (lines[i].x1 < smallestX || smallestX === -1) {
      smallestX = lines[i].x1;
    }
    if (lines[i].x2 < smallestX || smallestX === -1) {
      smallestX = lines[i].x2;
    }
    if (lines[i].y1 < smallestY || smallestY === -1) {
      smallestY = lines[i].y1;
    }
    if (lines[i].y2 < smallestY || smallestY === -1) {
      smallestY = lines[i].y2;
    }
  }


  let numPlaced = 0;
  while (numPlaced < POINTS_INSIDE_SHAPE) {
    let x = randRange(smallestX, largestX);
    let y = randRange(smallestY, largestY);

    let newPoint = new Point(x, y);

    if (pointInsideLines(newPoint, lines)) {
      numPlaced += 1;
      pointArray.push(newPoint);
    }
  }



  return pointArray;
}

function pointInsideLines(point, lines) {
  let upLine = new Line(point.x, point.y, point.x, -1);
  let collisions = 0;
  for (let i = 0; i < lines.length; i++) {
    let result = upLine.collidesWith(lines[i]);
    if (result !== false) {
      collisions += 1;
    }
  }
  // If the number of lines the downward line crossed was odd, that means it is inside the shape
  // If it is even, that means it is outside the shape
  return ((collisions % 2) === 1);
}

function randRange(min, max) {
  let range = max - min;
  return (Math.random() * range) + min;
}

function roundTo(x, n) {
  let powNum = Math.pow(10, n);
  return Math.round(x * powNum) / powNum;
}
