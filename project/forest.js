const POINTS_ON_LINES = 10;
const POINTS_INSIDE_SHAPE = 200;
const PATH_SEGMENTS = 100;
const NUM_ANGLES = 200;
const NUM_RAYCASTS = 5;


const MAX_CHANGE = Math.PI / 8;


const EPSILON = 0.001;
const ROUNDING_EPSILON = EPSILON / 100;


const CANVAS_SIZE = 400;
const MAX_DIST = Math.sqrt(CANVAS_SIZE*CANVAS_SIZE*2);
const SEGMENT_LENGTH = MAX_DIST / PATH_SEGMENTS;


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

    greaterX1 += ROUNDING_EPSILON;
    lesserX1 -= ROUNDING_EPSILON;
    greaterY1 += ROUNDING_EPSILON;
    lesserY1 -= ROUNDING_EPSILON;
    greaterX2 += ROUNDING_EPSILON;
    lesserX2 -= ROUNDING_EPSILON;
    greaterY2 += ROUNDING_EPSILON;
    lesserY2 -= ROUNDING_EPSILON;
    
    const isEndPoint = ((x === this.x1 && y === this.y1) || (x === this.x2 && y === this.y2) || (x === otherLine.x1 && y === otherLine.y1) || (x === otherLine.x2 && y === otherLine.y2));

    if (isEndPoint) {
      return [x, y, 2];
    }

    if (x <= greaterX1 && x >= lesserX1 && y <= greaterY1 && y >= lesserY1 && x <= greaterX2 && x >= lesserX2 && y <= greaterY2 && y >= lesserY2) {
      return [x, y, 1];
    }
    return [-1, -1, 0];

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

export class Runner {
  lines = [];
  points = [];

  pathGeneration = [];

  constructor(lines) {
    this.lines = lines;
  }

  getPoints() {
    this.points = getTestPoints(this.lines);
  }
  populateGeneration() {
    // Starting the generation with these paths
    this.pathGeneration.push(createZeroPath());
    for (let i = 0; i < 6; i++) {
      this.pathGeneration.push(createRandomPath());
    }
  }
  runLoop() {
    let results = runGeneration(this.pathGeneration, this.points, this.lines);
    this.pathGeneration = results[3];
    return recordPath(results[2], results[1], results[0], this.lines);
  }
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

  let numOdd = 0;
  let numEven = 0;

  for (let i = 0; i < NUM_RAYCASTS; i++) {
    let angle = randRange(0, Math.PI * 2);

    let farX = point.x + Math.cos(angle) * MAX_DIST;
    let farY = point.y + Math.sin(angle) * MAX_DIST;

    let raycast = new Line(point.x, point.y, farX, farY);
    let collisions = 0;
    for (let i = 0; i < lines.length; i++) {
      let result = raycast.collidesWith(lines[i]);
      if (result[2] === 1) {
        collisions += 1;
      }
      if (result[2] === 2) {
        return false;
      }
    }

    if (collisions % 2 === 1) {
      numOdd += 1;
    } else {
      numEven += 1;
    }

  }

  return numOdd > numEven;
}

function evaluatePath(path, points, lines) {
  let longestPath = -1;
  let worstAngle = 0;
  let worstPoint = new Point(0,0);


  points.forEach(startPoint => {
    
    for (let i = 0; i < NUM_ANGLES; i++) {
      let angle = ((Math.PI * 2) * i) / NUM_ANGLES;
      let dist = runPath(startPoint, angle, path, lines);
  
      if (dist > longestPath && dist < MAX_DIST - 1) {
        longestPath = dist;
        worstAngle = angle;
        worstPoint.x = startPoint.x;
        worstPoint.y = startPoint.y;
      }
    }

  });

  if (longestPath < 0) {
    longestPath = MAX_DIST;
  }

  // let str = "let lines = [";
  // for (let i = 0; i < lines.length; i++) {
  //   str += "new Line(" + lines[i].x1 + ", " + lines[i].y1 + ", " + lines[i].x2 + ", " + lines[i].y2 + "), ";
  // }
  // str += "];"
  // console.log(str);

  // str = "let startPoint = new Point(" + worstPoint.x + ", " + worstPoint.y + ");";
  // console.log(str);

  // str = "let angle = " + worstAngle;

  // console.log(str);

  return [longestPath, worstAngle, worstPoint];
}

function runPath(startPoint, angle, path, lines) {

  let nextPoint = new Point(startPoint.x, startPoint.y);
  let distance = 0;

  let previousAngle = angle;
  for (let p = 0; p < PATH_SEGMENTS; p++) {

    let nextAngle = previousAngle + path[p];

    let xDist = Math.cos(nextAngle) * SEGMENT_LENGTH;
    let yDist = Math.sin(nextAngle) * SEGMENT_LENGTH;

    let nextX = nextPoint.x + xDist;
    let nextY = nextPoint.y + yDist;

    let colliderLine = new Line(nextPoint.x, nextPoint.y, nextX, nextY);
    
    for (let j = 0; j < lines.length; j++) {
      let collision = colliderLine.collidesWith(lines[j]);
      if (collision[2] == 1 || collision[2] == 2) {

        // The path has reached the end of the forest
        let shortDistX = collision[0] - nextPoint.x;
        let shortDistY = collision[1] - nextPoint.y;
        let finalDist = Math.sqrt(shortDistX*shortDistX + shortDistY*shortDistY);

        // Adding the last bit of distance
        distance += finalDist;
        return distance;
      }
    }

    // If we have not reached the end of the forest, we need to count the distance
    distance += SEGMENT_LENGTH;

    // Setting the next starting point and angle

    nextPoint.x = nextX;
    nextPoint.y = nextY;

    previousAngle = nextAngle;

  } 

  return distance;
}

function recordPath(startPoint, angle, path, lines) {

  let pointList = [];

  let nextPoint = new Point(startPoint.x, startPoint.y);

  let previousAngle = angle;
  for (let p = 0; p < PATH_SEGMENTS; p++) {

    let nextAngle = previousAngle + path[p];

    let xDist = Math.cos(nextAngle) * SEGMENT_LENGTH;
    let yDist = Math.sin(nextAngle) * SEGMENT_LENGTH;

    pointList.push(new Point(nextPoint.x, nextPoint.y));

    let nextX = nextPoint.x + xDist;
    let nextY = nextPoint.y + yDist;

    let colliderLine = new Line(nextPoint.x, nextPoint.y, nextX, nextY);

    for (let j = 0; j < lines.length; j++) {
      let collision = colliderLine.collidesWith(lines[j]);
      if (collision[2] == 1 || collision[2] == 2) {
        return pointList;
      }
    }
    // Setting the next starting point and angle
    nextPoint.x = nextX;
    nextPoint.y = nextY;

    previousAngle = nextAngle;

  } 

  return pointList;
}

function createRandomPath() {
  let path = [];
  for (let i = 0; i < PATH_SEGMENTS; i++) {
    path.push(randRange(-MAX_CHANGE, MAX_CHANGE));
  }
  return path;
}

function createZeroPath() {
  let path = [];
  for (let i = 0; i < PATH_SEGMENTS; i++) {
    path.push(0);
  }
  return path;
}

function createMutant(path) {
  let newPath = [];
  for (let i = 0; i < PATH_SEGMENTS; i++) {
    let val = path[i] + randRange(-MAX_CHANGE, MAX_CHANGE);
    newPath.push(val);
  }
  return newPath;
}

function crossPaths(path1, path2) {
  let pathArray = [[],[],[],[]];
  for (let i = 0; i < PATH_SEGMENTS; i++) {
    for (let j = 0; j < pathArray.length; j++) {
      let angleCross = randRange(path1[i], path2[i]);
      pathArray[j].push(angleCross);
    }
  }
  return pathArray;
}

function runGeneration(pathGeneration, points, lines) {
  let shortestDistance = MAX_DIST;
  let bestPath = [];
  let bestStartPoint = new Point();
  let bestAngle = 0;

  let secondShortestDistance = MAX_DIST;
  let secondBestPath = [];
  let secondBestStartPoint = new Point();
  let secondBestAngle = 0;

  pathGeneration.forEach(path => {
    let results = evaluatePath(path, points, lines);

    let dist = results[0];

    if (dist < shortestDistance) {
      shortestDistance = dist;
      bestPath = path;
      bestAngle = results[1];
      bestStartPoint = results[2];
    } else if (dist < secondShortestDistance) {
      secondShortestDistance = dist;
      secondBestPath = path;
      secondBestAngle = results[1];
      secondBestStartPoint = results[2];
    }
  });

  let newGeneration = [];

  newGeneration.push(bestPath);

  newGeneration.push(createMutant(bestPath));

  let combinationPaths = crossPaths(newGeneration[0], newGeneration[1]);
  combinationPaths.forEach(path => {
    newGeneration.push(path);
  });

  newGeneration.push(createMutant(bestPath));

  return [bestPath, bestAngle, bestStartPoint, newGeneration];
}

function randRange(min, max) {
  let range = max - min;
  return (Math.random() * range) + min;
}

function roundTo(x, n) {
  let powNum = Math.pow(10, n);
  return Math.round(x * powNum) / powNum;
}
