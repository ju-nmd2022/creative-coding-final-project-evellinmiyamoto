// Jönköping University
// Creative Coding course - 2024
// Evellin Miyamoto
// Creative System Project

// Based on Garrit's class and code of boids https://codepen.io/pixelkind/pen/oNJzppX
// Based on the the tutorial and code from Daniel Shiffman https://youtu.be/mhjuuHl6qHM

import { Boid } from "./boid.js";
const flock = [];

function setup() {
  createCanvas(innerWidth, innerHeight);

  for (let i = 0; i < 100; i++) {
    flock.push(new Boid());
  }
}

function draw() {
  background(0);
  for (let boid of flock) {
    boid.flocking(flock);
    boid.update();
    boid.show();
    boid.borders();
  }
}
