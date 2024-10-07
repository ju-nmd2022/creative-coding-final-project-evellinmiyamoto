// Jönköping University
// Creative Coding course - 2024
// Evellin Miyamoto
// Creative System Project

// Based on Garrit's class and code of boids https://codepen.io/pixelkind/pen/oNJzppX
// Based on the the tutorial and code from Daniel Shiffman https://youtu.be/mhjuuHl6qHM
// Based on Bassima's class and code for the handpose as a starting point
// Debug with claude.ai

const flock = [];
let handpose;
let video;
let hands = [];

//got help from Garrit during the lab to flip the camera. based on https://docs.ml5js.org/#/reference/handpose
function preload() {
  handpose = ml5.handPose({
    flipped: true,
    maxHands: 1,
  });
}

function setup() {
  createCanvas(innerWidth, innerHeight);
  // frameRate(30);
  for (let i = 0; i < 150; i++) {
    flock.push(new Boid(flock));
  }
  video = createCapture(VIDEO);
  video.size(innerWidth, innerHeight);
  video.hide();
  handpose.detectStart(video, handsData);
}

function draw() {
  background(0);

  let handCenter = 0;

  if (hands.length > 0) {
    let indexFinger = hands[0].index_finger_tip;
    let thumb = hands[0].thumb_tip;

    let centerX = (indexFinger.x + thumb.x) / 2;
    let centerY = (indexFinger.y + thumb.y) / 2;

    handCenter = createVector(centerX, centerY);
  }

  for (let boid of flock) {
    boid.flocking(flock);

    if (handCenter) {
      boid.handInteraction(handCenter);
    } else {
      boid.isInteractingWithHand = false;
      boid.glowIntensity = 0;
    }

    boid.update(flock);
    boid.show();
    boid.borders();
  }

  //Debug with claude.ai
  // //video size (smaller than canvas 30%)
  // let videoWidth = width * 0.3;
  // let videoHeight = (videoWidth / video.width) * video.height;

  // //position video at the center bottom
  // let videoX = (width - videoWidth) / 2;
  // let videoY = height - videoHeight;

  // image(video, videoX, videoY, videoWidth, videoHeight);
  // push();
  // translate(video.width, 0);
  // scale(-1, 1);
  // pop();

  if (handCenter) {
    noStroke();
    // fill(204, 153, 255);
    // ellipse(handCenter.x, handCenter.y, 50);
    //glow effect https://editor.p5js.org/jesse_harding/sketches/WpONQ8o6u
    fill(255, 255, 200, 4);
    for (i = 0; i < 100; i++) {
      ellipse(handCenter.x, handCenter.y, i * 1.7);
    }
  }
}

function handsData(results) {
  hands = results;
}
