// Jönköping University
// Creative Coding course - 2024
// Evellin Miyamoto
// Creative System Project

// Based on Garrit's class and code of boids https://codepen.io/pixelkind/pen/oNJzppX
// Based on the the tutorial and code from Daniel Shiffman https://youtu.be/mhjuuHl6qHM
// Based on Bassima's class and code for the handpose as a starting point
// Debug with claude.ai

class Boid {
  constructor(flock) {
    this.position = createVector(random(width), random(height));
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.acceleration = createVector();
    this.maxForce = 0.2;
    this.maxSpeed = 5;
    //traits and personality
    this.energy = random(0, 100);
    this.sociability = random(0, 100);
    this.determinePersonality(flock);
    //glow
    this.isInteractingWithHand = false;
    this.glowIntensity = 0;
    //interaction evolution
    this.interactionCount = 0;
    this.lastInteractionTime = 0;
  }

  //personality based on traits and surrounding
  determinePersonality(flock) {
    let totalAround = 0;
    let radius = 50;
    for (let other of flock) {
      if (other !== this && this.position.dist(other.position) < radius) {
        totalAround++;
      }
    }
    if (this.energy > 70 && this.sociability > 60) {
      this.personality = "friendly";
    } else if (this.energy < 30 || (this.sociability < 40 && totalAround > 5)) {
      this.personality = "shy";
    } else {
      this.personality = "neutral";
    }
  }

  flocking(flock) {
    //3 rules by Craig Reynolds
    let alignment = this.align(flock);
    let cohesion = this.cohesion(flock);
    let separation = this.separation(flock);

    alignment.mult(1);
    cohesion.mult(1);
    separation.mult(1);

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
  }
  align(flock) {
    let radius = 25;
    let steer = createVector();
    let totalAround = 0;
    for (let other of flock) {
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );
      if (other != this && d < radius) {
        steer.add(other.velocity);
        totalAround++;
      }
    }
    if (totalAround > 0) {
      steer.div(totalAround);
      steer.setMag(this.maxSpeed);
      steer.sub(this.velocity);
      steer.limit(this.maxForce);
    }
    return steer;
  }

  separation(flock) {
    let radius = 24;
    let steer = createVector();
    let totalAround = 0;
    for (let other of flock) {
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );
      if (other != this && d < radius) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d * d);
        steer.add(diff);
        totalAround++;
      }
    }
    if (totalAround > 0) {
      steer.div(totalAround);
      steer.setMag(this.maxSpeed);
      steer.sub(this.velocity);
      steer.limit(this.maxForce);
    }
    return steer;
  }

  cohesion(flock) {
    let radius = 50;
    let steer = createVector();
    let totalAround = 0;
    for (let other of flock) {
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );
      if (other != this && d < radius) {
        steer.add(other.position);
        totalAround++;
      }
    }
    if (totalAround > 0) {
      steer.div(totalAround);
      steer.sub(this.position);
      steer.setMag(this.maxSpeed);
      steer.sub(this.velocity);
      steer.limit(this.maxForce);
    }
    return steer;
  }

  borders() {
    if (this.position.x > width) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = width;
    }
    if (this.position.y > height) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = height;
    }
  }

  update(flock) {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0);

    //time to time reassess personality
    // if (frameCount % 50 === 0) {
    //   this.energy += random(-10, 10);
    //   this.energy = constrain(this.energy, 0, 100);
    //   this.sociability += random(-5, 5);
    //   this.sociability = constrain(this.sociability, 0, 100);
    //   this.determinePersonality(flock);
    // }

    //evolve personality based on interactions
    this.evolvePersonality();
    //reset interaction count after 5sec of last interaction
    if (frameCount - this.lastInteractionTime > 300) {
      this.interactionCount = 0;
    }
  }

  evolvePersonality() {
    if (this.personality === "shy" && this.interactionCount >= 2) {
      this.personality = "neutral";
      this.sociability += 20;
      this.interactionCount = 0;
    } else if (this.personality === "neutral" && this.interactionCount >= 4) {
      this.personality = "friendly";
      this.sociability += 20;
      this.interactionCount = 0;
    }
    this.sociability = constrain(this.sociability, 0, 100);
  }

  show() {
    // strokeWeight(7);
    // stroke(255);
    let personalityColor;
    if (this.personality === "friendly") {
      //pink
      personalityColor = color(255, 102, 178);
    } else if (this.personality === "neutral") {
      //white
      personalityColor = color(255, 255, 255);
    } else if (this.personality === "shy") {
      //blue
      personalityColor = color(102, 178, 255);
    } else {
      //grey for unexpected personality
      personalityColor = color(0, 255, 0);
    }

    //coded the glow with the help of claude ai
    if (this.isInteractingWithHand) {
      //glow effect
      let glowSize = 80;
      let glowAlpha = this.glowIntensity * 100;
      noStroke();
      for (let i = glowSize; i > 0; i -= 2) {
        let alphaI = map(i, 0, glowSize, glowAlpha, 0);
        fill(
          red(personalityColor),
          green(personalityColor),
          blue(personalityColor),
          alphaI
        );
        ellipse(this.position.x, this.position.y, i, i);
      }
    }
    strokeWeight(7);
    stroke(personalityColor);
    point(this.position.x, this.position.y);
  }

  handInteraction(handPosition) {
    let handRadius = 150;
    let d = dist(
      this.position.x,
      this.position.y,
      handPosition.x,
      handPosition.y
    );

    if (d < handRadius) {
      if (!this.isInteractingWithHand) {
        //incrementar se ele NÃO estiver interagindo no frame anterior
        this.interactionCount++;
      }
      this.isInteractingWithHand = true;
      this.glowIntensity = map(d, 0, handRadius, 1, 0);
      this.lastInteractionTime = frameCount;

      let steer = p5.Vector.sub(handPosition, this.position);
      // steer.setMag(this.maxSpeed);
      // steer.sub(this.velocity);
      // steer.limit(this.maxForce);
      // this.acceleration.add(steer);
      if (this.personality === "friendly") {
        //friendly boids are strongly attracted to the hand
        steer.setMag(this.maxSpeed * 1.5);
      } else if (this.personality === "neutral") {
        //neutral boids are mildly attracted to the hand
        steer.setMag(this.maxSpeed);
      } else if (this.personality === "shy") {
        //shy boids flee from the hand
        steer.mult(-1);
        //Flee a bit faster
        steer.setMag(this.maxSpeed * 1.5);
      } else {
        steer.setMag(this.maxSpeed);
      }

      steer.sub(this.velocity);
      steer.limit(this.maxForce);
      this.acceleration.add(steer);
    } else {
      this.isInteractingWithHand = false;
      this.glowIntensity = 0;
    }
  }
}
