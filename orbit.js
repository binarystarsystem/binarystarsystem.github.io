//  Binary Star Simulator
//  Written by Michael Topping
//  Last updated - Feb. 19, 2017
//  Created for use with UCLA Astro 3: Lab 5
//  Observatory image: clipartpanda.com


// global variables
var star1;
var star2;

var m1Slider;
var m2Slider;
var speedSlider;
var eSlider;
var iSlider;
var m1 = 10;
var m2 = 10;
var e = 0.5;
var i = 90;
var v1;
var v2;
var dt = 10;
var fStrength = 10;
var isep = 200;
var t = 0;
var dt = 0.01;
var nsteps = 200;
var Es = [];
var ts = [];
var dists = [];
var norma = 200;
var test;


function setup() {
    // create the app
    var canvas=createCanvas(800, 800);
    canvas.parent("canvas-container");
    background(51);
    textSize(14);
    
    // parameter controls
    m1Slider = createSlider(1, 100, 10);
    m1Slider.position(20, 20);
    m2Slider = createSlider(1, 100, 10);
    m2Slider.position(20, 50);
    eSlider = createSlider(0, 100, 50);
    eSlider.position(20, 80);
    iSlider = createSlider(0, 90, 90);
    iSlider.position(20, 110);
//    speedSlider = createSlider(1, 100, dt*1000);
//    speedSlider.position(20, 110);


    // create initial stars
    star1 = new Star(m1, norma, e, 0)
    star2 = new Star(m1, norma, e, PI)


}

function draw() {
    // clear the frame
    background(51);
    star1.run();
    star2.run();

    // check if the speed of the simulation has changed
//    if (speedSlider.value()/1000 != dt) {
//    
//        dt = speedSlider.value()/1000;
//    }

    //check if the parameters have changed, then recreate the scene
    if (m2Slider.value() != m2 || m1Slider.value() != m1 || eSlider.value()/100 != e 
            || iSlider.value() != i) {
        e = eSlider.value()/100.;
        create_binary(m1Slider.value(), m2Slider.value());
        m2 = m2Slider.value();
        m1 = m1Slider.value();
        i = iSlider.value();
    }

    // draw the slider values
    fill(220);
    text('M'+'₁'+' = '+`${m1}`, 165, 35);
    text(`M₂ = ${m2}`, 165, 65);
    text(`e = ${e}`, 165, 95);
    text(`i = ${i}°`, 165, 125);
    text("w=90°", 165, 155);
//    text(`speed = ${dt}`, 165, 125);

    // update the positions of both stars
    star1.update_position(t);
    star2.update_position(t);

    // draw the star stuffs
    star1.draw_path();
    star2.draw_path();
    star1.draw();
    star2.draw();

    // draw the center of mass on top of everything
    stroke(127);
    line(width/2.-3, height/2., width/2.+3, height/2.);
    line(width/2., height/2.-3, width/2., height/2.+3);

    // increment the time
    t += dt;
    

}




// this will create the binary star when parameters have changed
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
    star1 = new Star(m1,sep1, e,  0)
    star2 = new Star(m2,sep2, e, PI)

}

