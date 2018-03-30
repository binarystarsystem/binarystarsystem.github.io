var star1;
var star2;
var m1 = 25;
var m2 = 25;
var e = 0.5;
var i = 0;
var norma = 200;

var t = 0;
var dt = 10;

function setup() {
  //create canvas
  createCanvas(windowWidth, windowHeight);
  textSize(15);

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

  star1 = new Star(m1, norma, e, 0);
  star2 = new Star(m2, norma, e, 90);
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

  //update the positions
  //star1.update_position(t);
  //star2.update_position(t);

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
}

function Star(m_, a_, e_, tau_){ 
  this.pos = createVector(0,0,0);
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

  this.update_position = function(t) {
    //find the eccentric anomaly from the time
    var E = this.t_to_E(t);
    //the orbit mechanics happens here
    this.pos.x = cos(this.tau)*this.a*(cos(E)-this.e);
    this.pos.y = (sin(i*PI/180))*cos(this.tau)*this.a*(sqrt(1-pow(this.e, 2))*sin(E));
    //add the current position to the path array
    this.path.push(this.pos.copy());      
  };
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
