// Jönköping University
// Creative Coding course - 2024
// Evellin Miyamoto
// Creative System Project

// Based on Garrit's class and code of boids https://codepen.io/pixelkind/pen/oNJzppX
// Based on the the tutorial and code from Daniel Shiffman https://youtu.be/mhjuuHl6qHM
// Based on Bassima's class and code for the handpose as a starting point

// import { Boid } from "./boid.js";

const flock = [];
let handpose;
let video;
let hands = [];

function preload() {
  handpose = ml5.handPose();
}
function setup() {
  createCanvas(innerWidth, innerHeight);

  for (let i = 0; i < 100; i++) {
    flock.push(new Boid());
  }
  video = createCapture(VIDEO);
  video.size(innerWidth, innerHeight);
  video.hide();
  handpose.detectStart(video, handsData);
}

function draw() {
  background(0);
  //draw autonomous agents
  for (let boid of flock) {
    boid.flocking(flock);
    boid.update();
    boid.show();
    boid.borders();
  }

  //video size to be smaller than canvas
  let videoWidth = width * 0.3;
  let videoHeight = (videoWidth / video.width) * video.height;

  //video at the center bottom
  let videoX = (width - videoWidth) / 2;
  let videoY = height - videoHeight;

  image(video, videoX, videoY, videoWidth, videoHeight);

  for (let hand of hands) {
    let indexFinger = hand.index_finger_tip;
    let thumb = hand.thumb_tip;

    let centerX = (indexFinger.x + thumb.x) / 2;
    let centerY = (indexFinger.y + thumb.y) / 2;

    let distance = dist(indexFinger.x, indexFinger.y, thumb.x, thumb.y);

    noStroke();
    fill(0, 0, 255);
    ellipse(centerX, centerY, distance);
  }
}
function handsData(results) {
  hands = results;
}
