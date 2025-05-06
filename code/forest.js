// Algorithm constants
const POINTS_ON_LINES = 10;
const POINTS_INSIDE_SHAPE = 200;
const PATH_SEGMENTS = 100;
const NUM_ANGLES = 200;
const NUM_RAYCASTS = 5;
const MAX_CHANGE = Math.PI / 8;

const EPSILON = 0.001;
const ROUNDING_EPSILON = EPSILON / 100;

// Other constants
const CANVAS_SIZE = 400;
const MAX_DIST = Math.sqrt(CANVAS_SIZE*CANVAS_SIZE*2);
const SEGMENT_LENGTH = MAX_DIST / PATH_SEGMENTS;

/**
 * A basic line class
 */
export class Line {
  x1;
  y1;

  x2;
  y2;

  /**
   * Fully initializes all the values of the line
   * @param {*} x1 
   * @param {*} y1 
   * @param {*} x2 
   * @param {*} y2 
   */
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  
  /**
   * Checks to see if the current line intersects with another line.
   * It returns the x and y coordinates of the intersections if it does hit, with 1 as the third number [x, y, 1]
   * If it does not intersect with the other line, it returns [-1, -1, 0]
   * If it intersects with the other line, but the intersection point is an endpont, it returns [x, y, 2]
   * 
   * @param {*} otherLine 
   * @returns { [number, number, number] }
   */
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

    // Some things to get rid of some rounding errors
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

  /**
   * Gets a point along the line, from (x1, y1) to (x2, y2)
   * @param {*} percentage The percentage of the distance along the line for the point returned (0.5 returns a point halfway along the line)
   * @returns { Point } 
   */
  getPointAlongLine(percentage) {
    let xDiff = this.x2 - this.x1;
    let yDiff = this.y2 - this.y1;

    let x = (xDiff * percentage) + this.x1;
    let y = (yDiff * percentage) + this.y1;

    return new Point(x, y);
  }
}

/**
 * Basic point class
 */
export class Point {
  x
  y

  /**
   * Basic constructor
   * @param {*} x 
   * @param {*} y 
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

/**
 * This class can solve a forest given the boundary lines
 */
export class Runner {

  // Global variables
  lines = [];
  points = [];
  pathGeneration = [];

  /**
   * Initiate the runner by giving it the boundary lines
   * @param {*} lines 
   */
  constructor(lines) {
    this.lines = lines;
  }

  /**
   * Gets the test points
   */
  getPoints() {
    this.points = this.getTestPoints();
  }

  /**
   * Starts the generation array out with a certain set of paths.
   * It has one straight path and 6 random paths.
   */
  populateGeneration() {
    // Starting the generation with these paths
    this.pathGeneration.push(this.createZeroPath());
    for (let i = 0; i < 6; i++) {
      this.pathGeneration.push(this.createRandomPath());
    }
  }

  /**
   * Runs and evaluates a generation of paths
   * @returns {[Point[], number]} Returns the shortest worst-case path of the generation, as well as the distance
   */
  runLoop() {
    let results = this.runGeneration(this.pathGeneration, this.points, this.lines);
    this.pathGeneration = results[3];
    return [this.recordPath(results[2], results[1], results[0], this.lines), results[4]];
  }

  /**
   * Returns an array of starting points within the forest boundary.
   * @returns the test starting points
   */
  getTestPoints() {
    let pointArray = [];

    // Getting the test points along the lines
    for (let i = 0; i < this.lines.length; i++) {
      for (let p = 0; p <= POINTS_ON_LINES; p++) {
        let percentage = p / POINTS_ON_LINES;

        let pointOnLine = this.lines[i].getPointAlongLine(percentage);

        // Getting four different points close to the line. 
        // Chances are that at least one of these will be inside the forest
        let p1 = new Point(pointOnLine.x + EPSILON, pointOnLine.y);
        let p2 = new Point(pointOnLine.x - EPSILON, pointOnLine.y);
        let p3 = new Point(pointOnLine.x, pointOnLine.y + EPSILON);
        let p4 = new Point(pointOnLine.x, pointOnLine.y - EPSILON);

        if (this.pointInsideLines(p1, this.lines)) {
          pointArray.push(p1);
        }
        if (this.pointInsideLines(p2, this.lines)) {
          pointArray.push(p2);
        }
        if (this.pointInsideLines(p3, this.lines)) {
          pointArray.push(p3);
        }
        if (this.pointInsideLines(p4, this.lines)) {
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
    for (let i = 0; i < this.lines.length; i++) {
      if (this.lines[i].x1 > largestX || largestX === -1) {
        largestX = this.lines[i].x1;
      }
      if (this.lines[i].x2 > largestX || largestX === -1) {
        largestX = this.lines[i].x2;
      }
      if (this.lines[i].y1 > largestY || largestY === -1) {
        largestY = this.lines[i].y1;
      }
      if (this.lines[i].y2 > largestY || largestY === -1) {
        largestY = this.lines[i].y2;
      }

      if (this.lines[i].x1 < smallestX || smallestX === -1) {
        smallestX = this.lines[i].x1;
      }
      if (this.lines[i].x2 < smallestX || smallestX === -1) {
        smallestX = this.lines[i].x2;
      }
      if (this.lines[i].y1 < smallestY || smallestY === -1) {
        smallestY = this.lines[i].y1;
      }
      if (this.lines[i].y2 < smallestY || smallestY === -1) {
        smallestY = this.lines[i].y2;
      }
    }


    let numPlaced = 0;
    while (numPlaced < POINTS_INSIDE_SHAPE) {
      let x = this.randRange(smallestX, largestX);
      let y = this.randRange(smallestY, largestY);

      let newPoint = new Point(x, y);

      if (this.pointInsideLines(newPoint)) {
        numPlaced += 1;
        pointArray.push(newPoint);
      }
    }



    return pointArray;
  }

  /**
   * Tests to see if a given point is inside the forest
   * @param {*} point 
   * @returns { boolean }
   */
  pointInsideLines(point) {

    let numOdd = 0;
    let numEven = 0;

    for (let i = 0; i < NUM_RAYCASTS; i++) {
      let angle = this.randRange(0, Math.PI * 2);

      let farX = point.x + Math.cos(angle) * MAX_DIST;
      let farY = point.y + Math.sin(angle) * MAX_DIST;

      let raycast = new Line(point.x, point.y, farX, farY);
      let collisions = 0;
      for (let i = 0; i < this.lines.length; i++) {
        let result = raycast.collidesWith(this.lines[i]);
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

  /**
   * Runs a path on all the test points and angles
   * @param {*} path 
   * @returns { [number, number, Point] } The best worst-case distance, the angle it started at, and the point it started at
   */
  evaluatePath(path) {
    let longestPath = -1;
    let worstAngle = 0;
    let worstPoint = new Point(0,0);


    this.points.forEach(startPoint => {
      
      for (let i = 0; i < NUM_ANGLES; i++) {
        let angle = ((Math.PI * 2) * i) / NUM_ANGLES;
        let dist = this.runPath(startPoint, angle, path);
    
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

    return [longestPath, worstAngle, worstPoint];
  }

  /**
   * Runs a path a single time from a starting point and angle
   * @param {*} startPoint 
   * @param {*} angle 
   * @param {*} path 
   * @returns { number } The distance the path traveled before going out of the forest
   */
  runPath(startPoint, angle, path) {

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
      
      for (let j = 0; j < this.lines.length; j++) {
        let collision = colliderLine.collidesWith(this.lines[j]);
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

  /**
   * Runs a path a single time from a starting point and angle
   * @param {*} startPoint 
   * @param {*} angle 
   * @param {*} path 
   * @returns { number[] } The path traveled as a set of points
   */
  recordPath(startPoint, angle, path) {

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

      for (let j = 0; j < this.lines.length; j++) {
        let collision = colliderLine.collidesWith(this.lines[j]);
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

  /**
   * Creates a path with random angle
   * @returns { number[] }
   */
  createRandomPath() {
    let path = [];
    for (let i = 0; i < PATH_SEGMENTS; i++) {
      path.push(this.randRange(-MAX_CHANGE, MAX_CHANGE));
    }
    return path;
  }

  /**
   * Creates a straight path
   * @returns { number[] }
   */
  createZeroPath() {
    let path = [];
    for (let i = 0; i < PATH_SEGMENTS; i++) {
      path.push(0);
    }
    return path;
  }

  /**
   * Creates a path based on the parameter path, but with random changes 
   * @param {number[]} path 
   * @returns { number[] }
   */
  createMutant(path) {
    let newPath = [];
    for (let i = 0; i < PATH_SEGMENTS; i++) {
      let val = path[i] + this.randRange(-MAX_CHANGE, MAX_CHANGE);
      newPath.push(val);
    }
    return newPath;
  }

  /**
   * Creates several paths by crossing two paths
   * @param { number[] } path1
   * @param { number[] } path2 
   * @returns { number[][] }
   */
  crossPaths(path1, path2) {
    let pathArray = [[],[],[],[]];
    for (let i = 0; i < PATH_SEGMENTS; i++) {
      for (let j = 0; j < pathArray.length; j++) {
        let angleCross = this.randRange(path1[i], path2[i]);
        pathArray[j].push(angleCross);
      }
    }
    return pathArray;
  }

  /**
   * Runs a whole generation of paths, and returns the results
   * @param {*} pathGeneration 
   * @param {*} points 
   * @returns { [number[], number, Point, number[][], number]}
   */
  runGeneration(pathGeneration, points) {
    let shortestDistance = MAX_DIST;
    let bestPath = [];
    let bestStartPoint = new Point();
    let bestAngle = 0;

    let secondShortestDistance = MAX_DIST;
    let secondBestPath = [];
    let secondBestStartPoint = new Point();
    let secondBestAngle = 0;

    pathGeneration.forEach(path => {
      let results = this.evaluatePath(path, points);

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

    newGeneration.push(this.createMutant(bestPath));

    let combinationPaths = this.crossPaths(bestPath, secondBestPath);
    combinationPaths.forEach(path => {
      newGeneration.push(path);
    });

    newGeneration.push(this.createMutant(bestPath));

    return [bestPath, bestAngle, bestStartPoint, newGeneration, shortestDistance];
  }

  /**
   * Creates a random number between a range
   * @param { number } min 
   * @param { number } max 
   * @returns { number }
   */
  randRange(min, max) {
    let range = max - min;
    return (Math.random() * range) + min;
  }
}

