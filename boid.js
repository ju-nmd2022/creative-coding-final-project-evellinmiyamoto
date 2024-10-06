class Boid {
  constructor(flock) {
    this.position = createVector(random(width), random(height));
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.acceleration = createVector();
    this.maxForce = 0.2;
    this.maxSpeed = 5;
    //traits
    this.energy = random(0, 100);
    this.sociability = random(0, 100);
    //personality based on traits and surrounding
    this.determinePersonality(flock);
  }
  //personality based on traits
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
    if (frameCount % 200 === 0) {
      this.energy += random(-10, 10);
      this.energy = constrain(this.energy, 0, 100);
      this.sociability += random(-5, 5);
      this.sociability = constrain(this.sociability, 0, 100);
      this.determinePersonality(flock);
    }
  }

  show() {
    strokeWeight(7);
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
      personalityColor = color(150);
    }
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
    }
  }
}
