import { hello } from './forest.js';



// Canvas stuff: sparkles
var c = document.getElementById("maincanvas");
var ctx = c.getContext("2d");

// const sizeX = 20;
// const sizeY = 40;

// function drawSparkle(x, y, scale) {
//   let width = sizeX * scale;
//   let height = sizeY * scale;
//   ctx.fillStyle = 'rgb(255,255,0)';
//   ctx.beginPath();
//   ctx.moveTo(x,y + height / 2);
//   ctx.lineTo(x + width/2, y);
//   ctx.lineTo(x, y - height / 2);
//   ctx.lineTo(x - width/2, y);
//   ctx.lineTo(x,y + height / 2);
//   ctx.fill();
// } 

// function randRange(min, max) {
//   let range = max - min;
//   return Math.floor(Math.random() * range) + min;
// }

// let sparkles = [];

// for (let i = 0; i < 20; i++) {
//   let newSparkle = [randRange(40, c.width - 40), randRange(40, c.height - 40), Math.random()];
//   sparkles.push(newSparkle);
// }

// for (let i = 0; i < sparkles.length; i++) {
//   console.log(sparkles[i]);
//   drawSparkle(sparkles[i][0], sparkles[i][1], sparkles[i][2]);
// }

// let timer = 0;
// const spakleSpeed = 100;

// function draw() {
//   ctx.clearRect(0, 0, c.width, c.height);
//   timer += 1;
//   for (let i = 0; i < sparkles.length; i++) {
//     let sparkleScale = (Math.cos((sparkles[i][2] * 2 * Math.PI) + timer / spakleSpeed) + 1) / 2;
//     drawSparkle(sparkles[i][0], sparkles[i][1], sparkleScale);
//   }
// }
// setInterval(draw, 1);


// HTML stuff
const startButton = document.getElementById('done_button');

startButton.onclick = function() {
  console.log('clicked');
}