import { Line, Runner, Point } from './forest.js';


// DOM references
const finishButton = document.getElementById('done_button');
const clearButton = document.getElementById('clear_button');
const solveButton = document.getElementById('solve_button');
const resetButton = document.getElementById('reset');
const distanceList = document.getElementById('distances');
const runnningText = document.getElementById('running');
const genCounter = document.getElementById('genMarker');
var c = document.getElementById("maincanvas");
var ctx = c.getContext("2d");


// Constants
const WIDTH = c.getBoundingClientRect().width;
const HEIGHT = c.getBoundingClientRect().height;
const NUM_DISTANCES_STORED = 10;


// Objects to draw/render
let lines = [];
let badLines = [];
let collisionDots = [];
let pixels = [];
let distances = [];

// variables
let drawAble = true;
let badLineTimer = -1;
let iteration = -1;
let lastClickX = -1;
let lastClickY = -1;
let mouseLine = new Line();
let forestSolver;

/**
 * This function is run every millisecond. 
 * It holds everthing this program does in those increments
 */
function updateScreen() {

  
  if (iteration === 0) {
    // Setting these labels so the user knows the program is running
    runnningText.textContent = "Running...";
    genCounter.textContent = "Generation 1";
  } else if (iteration === 1) {

    // Initiating the forestSolver
    forestSolver = new Runner(lines);
    forestSolver.getPoints();
    forestSolver.populateGeneration();
  }
  if (iteration >= 1) {

    // Getting and using the results from the loop
    let results = forestSolver.runLoop();
    pixels = results[0];
    distances.push(results[1]);
    updateDistanceList();

    //
    genCounter.textContent = "Generation " + iteration;
  }

  // Removing things from distances if needed
  if (distances.length > NUM_DISTANCES_STORED) {
    distances.splice(0, 1);
  }

  // The off conditions
  // The first one is if the result has not changed in a while
  if (distances.length === NUM_DISTANCES_STORED) {
    if (distances[0] === distances[NUM_DISTANCES_STORED - 1]) {
      solvedForest();
    }
  }
  // Also stops running the generations if 100 have run
  if (iteration === 100) {
    solvedForest();
  }

  // Incrementing the iterator
  if (iteration > -1) {
    iteration += 1;
  }


  updateCanvas();
  
}

/**
 * Runs as soon as the forest has been solved\solving process stopped
 */
function solvedForest() {
  iteration = -1;
  resetButton.style.visibility = "";
  runnningText.textContent = "Done!";
}

// Screen/canvas updating functions

/**
 * Updates and draws on the canvas
 */
function updateCanvas() {

  // Reseting the canvas
  ctx.rect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "white";
  ctx.fill();

  // Drawing various lines
  ctx.strokeStyle = "black";
  for (let i = 0; i < lines.length; i++) {
    drawLine(lines[i]);
  }
  if (mouseLine.x1 > 0) {
    drawLine(mouseLine);
  }

  ctx.fillStyle = "red";
  ctx.strokeStyle = "red";

  // Drawing the path
  for (let i = 0; i < pixels.length; i++) {
    drawPixel(pixels[i]);
  }

  // Drawing the shapes if the user tries to make an invalid forest shape
  if (badLineTimer > 0) {
    badLineTimer -= 1;

    for (let i = 0; i < badLines.length; i++) {
      drawLine(badLines[i]);
    }

    for (let i = 0; i < collisionDots.length; i++) {
      drawPoint(collisionDots[i][0], collisionDots[i][1]);
    }

    if (badLineTimer === 0) {
      drawAble = true;
      badLines = [];
      collisionDots = [];
    }
  }
}

/**
 * Draws a given line on the canvas
 * @param { Line } line 
 */
function drawLine(line) {
  ctx.beginPath();
  ctx.moveTo(line.x1, line.y1);
  ctx.lineTo(line.x2, line.y2);
  ctx.stroke();
}

/**
 * Draws a small circle on the canvas given coordinates
 * @param { number } x 
 * @param { number } y 
 */
function drawPoint(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI*2, true);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draws a small pixel on the canvas given coordinates in the form of a Point
 * @param { Point } p 
 */
function drawPixel(p) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, 1, 0, Math.PI*2, true);
  ctx.closePath();
  ctx.fill();
}

/**
 * Updates the DOM to show the most recent distances
 */
function updateDistanceList() {
  let htmlString = "<p>Shortest worst-case paths:</p>";
  let loopLength = 8;
  if (distances.length < 8) {
    loopLength = distances.length;
  }
  for (let i = 0; i < loopLength; i++) {
    htmlString += `<p>${distances[i]}</p>`;
  }
  distanceList.setHTMLUnsafe(htmlString);
}

// Mouse moving/drawing functions

/**
 * Is called when the mouse is clicked on the canvas
 * @param {*} event 
 */
function mouseClick(event) {
  let rect = c.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;

  if (lastClickX < 0) {
    lastClickX = x;
    lastClickY = y;
  } else {
    let newLine = new Line(lastClickX, lastClickY, x, y);

    let didCollide = collisionCheck(newLine);

    if (didCollide === false) {
      lastClickX = x;
      lastClickY = y;
    }
  }
}

/**
 * Is called when the mouse moves on the canvas
 * @param {*} event 
 */
function mouseMove(event) {
  let rect = c.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;

  mouseLine.x1 = lastClickX;
  mouseLine.y1 = lastClickY;

  mouseLine.x2 = x;
  mouseLine.y2 = y;
}

/**
 * Checks to see if the newest line made by the user conflicts with others.
 * If it does not conflict, adds it to the lines array.
 * 
 * @param {*} newLine the newest line
 * @returns { boolean } returns true if the user has tried to make an invalid shape with the newest line
 */
function collisionCheck(newLine) {
  for (let i = 0; i < lines.length; i++) {
    let result = newLine.collidesWith(lines[i]);
    if (result[2] === 1) {
      collisionDots.push(result);
      badLines.push(lines[i]);
    }
  } 
  if (badLines.length > 0) {
    // The line conflicts
    badLines.push(newLine);
    badLineTimer = 100;
    drawAble = false;
    return true;
  } else {
    // The line does not conflict
    lines.push(newLine);
    return false;
  }
}

// Event listeners

c.addEventListener("mousedown", function (e) {
  if (drawAble) {
    mouseClick(e);
  }
});

c.addEventListener("mousemove", function (e) {
  if (drawAble) {
    mouseMove(e);
  }
})

c.addEventListener("mouseout", function (e) {
  if (drawAble) {
    mouseLine.x1 = -1;
  }
})

finishButton.onclick = function() {
  let len = lines.length;
  if (len > 1 && drawAble) {
    let newLine = new Line(lines[0].x1, lines[0].y1, lines[len-1].x2, lines[len-1].y2);


    // Checking for collisions
    let collided = collisionCheck(newLine);
    
    if (!collided) {
      solveButton.style.visibility = "";
    }

    drawAble = false;
  } 
}
clearButton.onclick = function() {
  lines = [];
  lastClickX = -1;
  mouseLine.x1 = -1;
  drawAble = true;
  solveButton.style.visibility = "hidden";
}

solveButton.onclick = function() {
  solveButton.style.visibility = "hidden";
  finishButton.style.visibility = "hidden";
  clearButton.style.visibility = "hidden";
  
  iteration = 0;
}

resetButton.onclick = function() {
  finishButton.style.visibility = "";
  clearButton.style.visibility = "";
  resetButton.style.visibility = "hidden";
  lines = [];
  pixels = [];
  distances = [];
  distanceList.setHTMLUnsafe("");
  runnningText.textContent = "";
  genCounter.textContent = "";
  drawAble = true;
  lastClickX = -1;
  iteration = -1;
}


// Initial setting of variables and things
solveButton.style.visibility = "hidden";
resetButton.style.visibility = "hidden";
runnningText.textContent = "";
genCounter.textContent = "";

// Starting the interval
setInterval(updateScreen, 1);