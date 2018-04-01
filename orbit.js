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





//var G = 6.674*pow(10,-11);
//var AU = 1.50e11; //150 million km = 150 billion m
//var M = 1.98892e30;

var t = 0;
var dt = 0.1;

function setup() {
  //create canvas
  createCanvas(windowWidth, windowHeight);
  textSize(15);
    //document.write(windowHeight + " " + windowWidth);
  //create sliders
  sliderM1 = createSlider(0, 100, 25);
  sliderM1.position(20, 20);
  sliderM2 = createSlider(0, 100, 25);
  sliderM2.position(20, 50);
  sliderE = createSlider(0, 100, 50);
  sliderE.position(20, 80);
  sliderI = createSlider(0, 90, 0);
  sliderI.position(20, 110);

  //slider values
  m1 = sliderM1.value();
  m2 = sliderM2.value();
  e = sliderE.value()/100;
  i = sliderI.value();
  r1 = createVector(0.2*AU, 0, 0);
  r2 = createVector(-0.2*AU, 0, 0);  
  v1 = createVector(0, 10, 0);
  v2 = createVector(0, -10, 0);
  a1 = createVector(0, 0, 0);
  a2 = createVector(0, 0, 0);
    

  star1 = new Star(m1, norma, e, 0);
  star2 = new Star(m2, norma, e, PI);
}

function draw(){
  background(0);

  //check if slider values have changed
  if (sliderM1.value() != m1 || sliderM2.value() != m2 || sliderE.value() != e || sliderI.value() != i) {
    create_binary(sliderM1.value(), sliderM2.value());
    m1 = sliderM1.value();
    m2 = sliderM2.value();
    e = sliderE.value()/100;
    i = sliderI.value();
  }

  noStroke();
  fill(220);

  //slider names
  text("mass 1", sliderM1.x * 2 + sliderM1.width, 35);
  text("mass 2", sliderM2.x * 2 + sliderM2.width, 65);
  text("eccentricity", sliderE.x * 2 + sliderE.width, 95);
  text("inclination", sliderI.x * 2 + sliderI.width, 125);

 
    r1.x = r1.x + v1.x * dt;
    r2.x = r2.x + v2.x * dt;
    r1.y = r1.y + v1.y * dt;
    r2.y = r2.y + v2.y * dt;
    a1.x = G*m2 * m1 * (r2.x - r1.x) / pow(sqrt(pow(r2.x - r1.x, 2) + pow(r2.y - r1.y, 2)), 3) / 10e3;
    a1.y = G*m2 * m1 * (r2.y - r1.y) / pow(sqrt(pow(r2.x - r1.x, 2) + pow(r2.y - r1.y, 2)), 3) / 10e3;
    v1.x = v1.x + a1.x * dt;
    v1.y = v1.y + a1.y * dt;
    a2.x = G*m2 * m1 * (r1.x - r2.x) / pow(sqrt(pow(r2.x - r1.x, 2) + pow(r2.y - r1.y, 2)), 3) / 10e3;
    a2.y = G*m2 * m1 * (r1.y - r2.y) / pow(sqrt(pow(r2.x - r1.x, 2) + pow(r2.y - r1.y, 2)), 3) / 10e3;
    v2.x = v2.x + a2.x * dt;
    v2.y = v2.y + a2.y * dt;


    /*if (abs(a1.x) > 10 || abs(a1.y) > 10 || abs(a2.x) > 10 || abs(a2.y) > 10) {
        r1.x = 0;
        r2.x = 0;
        r1.y = 0;
        r2.y = 0;
        a1.x = 0;
        a1.y = 0;
        v1.x = 0;
        v1.y = 0;
        a2.x = 0;
        a2.y = 0;
        v2.x = 0;
        v2.y = 0;
    }*/

    if (console_flag % 10 == 0) {
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
   
    
    
    
    
    //update the positions
    star1.update_position(r1);
    star2.update_position(r2);

    //document.write(star1.pos.x + " " + star2.pos.x);

  //draw the stars
  star1.draw_path();
  star2.draw_path();
  star1.draw();
  star2.draw();

  //draw the center of mass
  stroke(127);
  line(width/2.-3, height/2., width/2.+3, height/2.);
  line(width/2., height/2.-3, width/2., height/2.+3);

  //update time
    t += dt;
    console_flag += 1;
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
    //find the eccentric anomaly from the time
   // var E = this.t_to_E(t);
    //the orbit mechanics happens here
      //this.pos.x = cos(this.tau)*this.a*(cos(t/24*PI)-this.e);
     // this.pos.y = (sin(i*PI/180))*cos(this.tau)*this.a*(sqrt(1-pow(this.e, 2))*sin(t/24*PI));
      
      //add the current position to the path array
        this.pos = position;
        this.path.push(this.pos.copy());
        //document.write(" (" + this.pos.x + " , " + this.pos.y + ") ");
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
