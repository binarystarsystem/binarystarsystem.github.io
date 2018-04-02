
//might be able to remove these
var e = 0.5;
var i = 0;
var norma = 200;
var initial_spacing = 1;
//play with these
var G = 100000;
var AU = 100;

//these arrays are how the N bodies are implemented
var masses = [];
var positions = [];
var velocities = [];
var accelerations = [];
var stars = [];
var sliders = [];
var N = 4;


var t = 0;
var dt = 0.02;
var console_flag = 0;
var setup_flag = 0


function setup() {
  //create canvas

    
        createCanvas(windowWidth, windowHeight);
        textSize(15);

        for (var index = 0; index < N; index++) {
            slider = createSlider(0, 100, Math.random()*100);
            sliders.push(slider);
            sliders[index].position(20, 20 + 30 * index);
        }
        for (var index = 0; index < N; index++) {
            masses.push(sliders[index].value());
        }

    //creates stars and sets initial conditions
    for (var index = 0; index < N; index++) {
        positions.push(createVector(cos(2 * PI * index / N) * Math.random()*3 * AU, sin(2 * PI * index / N) * Math.random()*3 * AU, 0));
        velocities.push(createVector(cos(2 * PI * index / N) * 2, sin(2 * PI * index / N) * -2, 0));
        //velocities.push(createVector(0, 0, 0));
        accelerations.push(createVector(0, 0, 0));
        star = new Star(masses[index], norma, e, PI);
        stars.push(star);
    }
    setup_flag = 1;
}

function draw(){
  background(0);

  //check if slider values have changed
    for (var index = 0; index < N; index++) {
        if (sliders[index].value() != masses[index]) {
            masses[index] = sliders[index].value();
            stars[index].m = masses[index];
            stars[index].r = 5 * sqrt(masses[index]);
            //reset();
        }
        //slider names
        text("Mass " + (index+1), sliders[index].x * 2 + sliders[index].width, 35 + 30 * index);
    }

  noStroke();
  fill(220);

    //the primary physics engine generalized for N bodies
    var positions_copy = positions;
    var velocities_copy = velocities;
    var acceleration_copy = accelerations;

    for (var primary = 0; primary < masses.length; primary++) {
        positions[primary].x = positions_copy[primary].x + velocities_copy[primary].x * dt;
        positions[primary].y = positions_copy[primary].y + velocities_copy[primary].y * dt;
        accelerations[primary].x = 0;
        accelerations[primary].y = 0;
        for (var secondary = 0; secondary < masses.length; secondary++) {
            if (primary != secondary) {
                norm2 = pow(sqrt(pow(positions_copy[secondary].x - positions_copy[primary].x, 2) + pow(positions_copy[secondary].y - positions_copy[primary].y, 2)), 2) ;
                accelerations[primary].x += G  * masses[secondary] * (positions_copy[secondary].x - positions_copy[primary].x) / norm2 / 10e3;
                accelerations[primary].y += G  * masses[secondary] * (positions_copy[secondary].y - positions_copy[primary].y) / norm2 / 10e3;
            }     
        }
        //fix singularities here by modifying dt
       /* if (accelerations[primary].x > 3 || accelerations[primary].y > 3) {
            //dt = 0.01;
        }
        else {
            //dt = 0.1;
        }*/
        
            velocities[primary].x = velocities_copy[primary].x + accelerations[primary].x * dt;
            velocities[primary].y = velocities_copy[primary].y + accelerations[primary].y * dt;
        
        //dt = 0.1;
        if (abs(positions[primary].x) > windowWidth/2+200 || abs(positions[primary].y) > windowHeight/2+200) {
           // reset();
        }

    }
 
    
    //update the positions and draw stars
    for (var index = 0; index < N; index++) {
        stars[index].update_position(positions[index]);
        stars[index].draw_path();
        stars[index].draw();
    }
    
//for troubleshooting
    if (console_flag % 10 == 0) {
        display_console; 
    }
    
    stroke(127);

  //update time
    t += dt;
    console_flag += 1;

    
}

function display_console() {
    //console.log();
}

function Star(m_, a_, e_, tau_) {
  this.pos = createVector(0, 0, 0);
    //this.vel = vel_;
  this.m = m_;
  this.e = e_;
  this.r = 5*sqrt(m_);
  this.a = a_;
  this.tau = tau_;
  this.path = [];

  this.draw = function() {
    //draw the star
    fill(220);
    ellipse(width/2+this.pos.x, height/2.+this.pos.y, this.r, this.r);
  };

  this.draw_path = function() {
    //check the length of the path, and remove one if necessary
    if (this.path.length > 200) {
      this.path.shift();
    }
    //draw the path of the orbit
    for (var ii=0; ii<this.path.length-1; ii++) {
      //change the color of the line
      var shade = map(ii, 0, this.path.length, 50, 220);
      stroke(shade);
      //draw the line segment
      line(this.path[ii].x+width/2, this.path[ii].y+height/2., this.path[ii+1].x+width/2, this.path[ii+1].y+height/2);
    }
  };

    this.update_position = function (position) { 
        //add the current position to the path array
        this.pos = position;
        this.path.push(this.pos.copy());     
    };
}

function reset() {
    for (var index2 = 0; index2 < N; index2++) {
                positions[index2]=createVector(cos(2 * PI * index2 / N) * 0.6 * AU, sin(2 * PI * index2 / N) * 0.6 * AU, 0);
                velocities[index2] = createVector(cos(2 * PI * index2 / N) * 2, sin(2 * PI * index2 / N) * -2, 0);
                accelerations[index2] = createVector(0, 0, 0);
                stars[index2].path = [];
      }
}

function create_binary(m1, m2) {
    // determine the semi-major axes so that the larger of the two is equal to the variable norma;
    if (m1 > m2) {
        var sep1 = norma*m2/m1;
        var sep2 = norma;
    } else if (m1 <= m2) {
        var sep1 = norma;
        var sep2 = norma*m1/m2;
    }

    // create the two stars
    star1 = new Star(m1, sep1, e,  0)
    star2 = new Star(m2, sep2, e, PI)
}
