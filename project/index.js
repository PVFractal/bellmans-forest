import { Line, Runner } from './forest.js';



let drawAble = true;
// Canvas stuff 

var c = document.getElementById("maincanvas");
var ctx = c.getContext("2d");

let width = c.getBoundingClientRect().width;
let height = c.getBoundingClientRect().height;


// Objects to draw
let lines = [];
let badLines = [];
let collisionDots = [];
let pixels = [];

let numDistStored = 10;
let distances = [];

let badLineTimer = -1;

let lastClickX = -1;
let lastClickY = -1;

let mouseLine = new Line();

function drawLine(line) {
  ctx.beginPath();
  ctx.moveTo(line.x1, line.y1);
  ctx.lineTo(line.x2, line.y2);
  ctx.stroke();
}

function drawPoint(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI*2, true);
  ctx.closePath();
  ctx.fill();
}

function drawPixel(p) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, 1, 0, Math.PI*2, true);
  ctx.closePath();
  ctx.fill();
}


let iteration = -1;
function updateScreen() {

  
  if (iteration === 0) {
    runnningText.textContent = "Running...";
    genCounter.textContent = "Generation 1";
  } else if (iteration === 1) {
    forestSolver = new Runner(lines);
    forestSolver.getPoints();
    forestSolver.populateGeneration();
    genCounter.textContent = "Generation 1";
    let results = forestSolver.runLoop();
    pixels = results[0];
    distances.push(results[1]);
    updateDistanceList();
  } else if (iteration > 1) {
    let results = forestSolver.runLoop();
    pixels = results[0];
    distances.push(results[1]);
    updateDistanceList();
    genCounter.textContent = "Generation " + iteration;
  }

  if (distances.length > numDistStored) {
    distances.splice(0, 1);
  }

  // The off conditions
  if (distances.length === 10) {
    if (distances[0] === distances[9]) {
      iteration = -1;
      resetButton.style.visibility = "";
    }
  }

  if (iteration === 100) {
    resetButton.style.visibility = "";
    iteration = -1;
  }

  if (iteration > -1) {
    iteration += 1;
  }


  ctx.rect(0, 0, width, height);
  ctx.fillStyle = "white";
  ctx.fill();

  ctx.strokeStyle = "black";
  for (let i = 0; i < lines.length; i++) {
    drawLine(lines[i]);
  }
  if (mouseLine.x1 > 0) {
    drawLine(mouseLine);
  }

  ctx.fillStyle = "red";
  ctx.strokeStyle = "red";

  for (let i = 0; i < pixels.length; i++) {
    drawPixel(pixels[i]);
  }

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

function collisionCheck(newLine) {
  for (let i = 0; i < lines.length; i++) {
    let result = newLine.collidesWith(lines[i]);
    if (result[2] === 1) {
      collisionDots.push(result);
      badLines.push(lines[i]);
    }
  } 
  if (badLines.length > 0) {
    badLines.push(newLine);
    badLineTimer = 100;
    drawAble = false;
    return true;
  } else {
    lines.push(newLine);
    return false;
  }
}

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

function mouseMove(event) {
  let rect = c.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;

  mouseLine.x1 = lastClickX;
  mouseLine.y1 = lastClickY;

  mouseLine.x2 = x;
  mouseLine.y2 = y;
}

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



// Keeping the canvas constantly updated
setInterval(updateScreen, 1);

// HTML stuff
const finishButton = document.getElementById('done_button');
const clearButton = document.getElementById('clear_button');
const solveButton = document.getElementById('solve_button');
const resetButton = document.getElementById('reset');
const distanceList = document.getElementById('distances');

solveButton.style.visibility = "hidden";
resetButton.style.visibility = "hidden";

const runnningText = document.getElementById('running');
runnningText.textContent = "";

const genCounter = document.getElementById('genMarker');
genCounter.textContent = "";

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

let forestSolver;
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