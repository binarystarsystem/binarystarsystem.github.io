// Where is the circle
var x, y;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(15);
  // Starts in the middle
  x = width / 2;
  y = height;


  // create sliders
  sliderM1 = createSlider(0, 255, 100);
  sliderM1.position(20, 20);
  sliderM2 = createSlider(0, 255, 0);
  sliderM2.position(20, 50);
}

function draw(){
  background(0);

  //slider values
  var m1 = sliderM1.value();
  var m2 = sliderM2.value();
  text("Mass 1", sliderM1.x * 2 + sliderM1.width, 35);
  text("Mass 2", sliderM2.x * 2 + sliderM2.width, 65);
  
  // Draw a circle
  noStroke();
  fill(255);
  ellipse(x, y, 24, 24);
  
  // Jiggling randomly on the horizontal axis
  x = x + random(-1, 1);
  // Moving up at a constant speed
  y = y - 1;
  
  // Reset to the bottom
  if (y < 0) {
    y = height;
  }
}