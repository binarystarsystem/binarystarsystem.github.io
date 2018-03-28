// Where is the circle
var x1, x2, y1, y2, r1, r2;
var m1 = 10;
var m2 = 10;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(15);
  
  //starting positions
  x1 = width / 2;
  y1 = height / 2;
  x2 = width / 2;
  y2 = height;


  // create sliders
  sliderM1 = createSlider(0, 200, 100);
  sliderM1.position(20, 20);
  sliderM2 = createSlider(0, 200, 100);
  sliderM2.position(20, 50);
}

function draw(){
  background(0);

  //slider values
  m1 = sliderM1.value();
  m2 = sliderM2.value();

  //change size of stars according to mass
  r1 = 5 * sqrt(m1);
  r2 = 5 * sqrt(m2);

  //slider names
  text("Mass 1", sliderM1.x * 2 + sliderM1.width, 35);
  text("Mass 2", sliderM2.x * 2 + sliderM2.width, 65);
  
  //draw the stars
  noStroke();
  fill(255);
  ellipse(x1, y1, r1, r1);
  ellipse(x2, y2, r2, r2);
  
  //update horizontal position
  x1 = x1 + random(-1, 1);
  x2 = x2 + random(-1, 1);
  //update vertical position
  y1 = y1 - 1;
  y2 = y2 - 1;

  //draw the center of mass
  stroke(127);
  line(width/2.-3, height/2., width/2.+3, height/2.);
  line(width/2., height/2.-3, width/2., height/2.+3);
}