var star1;
var star2;
var m1 = 25;
var m2 = 25;
var e = 0.5;
var i = 0;
var norma = 200;
var r1;
var r2;
var v1;
var v2;
var a1;
var a2;
var G = 100000;
var AU = 100;
var console_flag = 0;

//these arrays are how the N bodies are implemented
var masses = [];
var positions;
var velocities;
var accelerations;
var stars = [];
var sliders = [];
var N = 3;


//var G = 6.674*pow(10,-11);
//var AU = 1.50e11; //150 million km = 150 billion m
//var M = 1.98892e30;

var t = 0;
var dt = 0.1;

function setup() {
  //create canvas
  createCanvas(windowWidth, windowHeight);
  textSize(15);

    for (var index = 0; index < N; index++) {
        slider = createSlider(0,100,10);
        sliders.push(slider);
        sliders[index].position(20, 20 + 30 * index);   
    }
    for (var index = 0; index < N; index++) {       
        masses.push(sliders[index].value());
    }

    
    e = 1;//sliderE.value()/100;
    i = 1;//sliderI.value();
  r1 = createVector(0.2*AU, 0, 0);
  r2 = createVector(-0.2*AU, 0, 0);  
  v1 = createVector(0, 10, 0);
  v2 = createVector(0, -10, 0);
  a1 = createVector(0, 0, 0);
  a2 = createVector(0, 0, 0);
    

    
    positions = [r1, r2, createVector(0,0,0)];
    velocities = [v1, v2, createVector(0,0,0)];
    accelerations = [a1, a2, createVector(0, 0, 0)];

    for (var index = 0; index < N; index++) {
        star = new Star(masses[index], norma, e, PI);
        stars.push(star);
    }
}

function draw(){
  background(0);

  //check if slider values have changed
    for (var index = 0; index < N; index++) {
        if (sliders[index].value() != masses[index]) {
            masses[index] = sliders[index].value();
            stars[index].m = masses[index];
            stars[index].r = 5*sqrt(masses[index]);
        }
        //slider names
        text("Mass " + (index+1), sliders[index].x * 2 + sliders[index].width, 35 + 30 * index);
    }

  noStroke();
  fill(220);

    //the primary physics engine generalized for N bodies
    var positions_copy = positions;
    var velocities_copy = velocities;

    for (var primary = 0; primary < masses.length; primary++) {
        positions[primary].x = positions_copy[primary].x + velocities_copy[primary].x * dt;
        positions[primary].y = positions_copy[primary].y + velocities_copy[primary].y * dt;
        accelerations[primary].x = 0;
        accelerations[primary].y = 0;
        for (var secondary = 0; secondary < masses.length; secondary++) {
            if (primary != secondary) {
                norm2 = pow(sqrt(pow(positions_copy[secondary].x - positions_copy[primary].x, 2) + pow(positions_copy[secondary].y - positions_copy[primary].y, 2)), 3) ;
                accelerations[primary].x += G * masses[primary] * masses[secondary] * (positions_copy[secondary].x - positions_copy[primary].x) / norm2 / 10e3;
                accelerations[primary].y += G * masses[primary] * masses[secondary] * (positions_copy[secondary].y - positions_copy[primary].y) / norm2 / 10e3;
            }     
        }
        velocities[primary].x = velocities_copy[primary].x + accelerations[primary].x * dt;
        velocities[primary].y = velocities_copy[primary].y + accelerations[primary].y * dt;

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
    
  //draw the center of mass
  stroke(127);
  line(width/2.-3, height/2., width/2.+3, height/2.);
  line(width/2., height/2.-3, width/2., height/2.+3);

  //update time
    t += dt;
    console_flag += 1;
}

function display_console() {
    console.log("r1x " + r1.x);
    console.log("r2 " + r2.x);
    console.log("v1 " + v1.x);
    console.log("v2 " + v2.x);
    console.log("a1 " + a1.x);
    console.log("a2 " + a2.x);
    console.log("r1y " + r1.y);
    console.log("r2 " + r2.y);
    console.log("v1 " + v1.y);
    console.log("v2 " + v2.y);
    console.log("a1 " + a1.y);
    console.log("a2 " + a2.y);
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

    this.update_velocity = function (velocity) {

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
