
//constants, to be scaled
var G = 150000;
var AU = 100;

//admin variables
var paused = 0;
var show_menu = 0;

//these arrays are how the N bodies are implemented
var masses = [];
var positions = [];
var velocities = [];
var accelerations = [];
var stars = [];
var sliders = [];
var N = 5;
var colours = ['red', 'orange', 'yellow', 'white', 'gold', 'DarkOrange']

//hold the planets
var planet_masses = [];
var planet_positions = [];
var planet_velocities = [];
var planet_accelerations = [];
var planets = [];
var planet_colours = [];

var t = 0;
var dt = 0.04;
var console_flag = 0;
var pause_button;
var start_button;
var menu_button;
var randomize_button;
var menu_created = 0;

var num_stars_input;
var submit_num;

//use this for setup menu
function setup() {
    //create canvas


    createCanvas(windowWidth, windowHeight);
    generateButtons();
    generateRandomStars();






}

//looping portion
function draw() {
    background(0);


    if (show_menu == 0) {
        menu_created = 0;
        //check if slider values have changed
        for (var index = 0; index < N; index++) {
            if (sliders[index].value() != masses[index]) {
                masses[index] = sliders[index].value();
                stars[index].m = masses[index];
                stars[index].r = 5 * sqrt(masses[index]);
                //reset();
            }
            //slider names
            noStroke();
            fill(220);
            text("Mass " + (index + 1), sliders[index].x * 2 + sliders[index].width, 35 + 30 * index);
        }

        if (paused == 0) {


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
                        norm2 = pow(sqrt(pow(positions_copy[secondary].x - positions_copy[primary].x, 2) + pow(positions_copy[secondary].y - positions_copy[primary].y, 2)), 2);
                        if (positions_copy[secondary].x >= positions_copy[primary].x) {
                            accelerations[primary].x += G * masses[secondary] / norm2 / 10e3;
                        } else {
                            accelerations[primary].x -= G * masses[secondary] / norm2 / 10e3;
                        }
                        if (positions_copy[secondary].y >= positions_copy[primary].y) {
                            accelerations[primary].y += G * masses[secondary] / norm2 / 10e3;
                        } else {
                            accelerations[primary].y -= G * masses[secondary] / norm2 / 10e3;
                        }
                    }
                }
                velocities[primary].x = velocities_copy[primary].x + accelerations[primary].x * dt;
                velocities[primary].y = velocities_copy[primary].y + accelerations[primary].y * dt;

                /* if (abs(positions[primary].x) > windowWidth/2+200 || abs(positions[primary].y) > windowHeight/2+200) {
                    // reset();
                 }*/

            }

        }
        var reset_flag = 0;
        //update the positions and draw stars
        for (var index = 0; index < N; index++) {
            stars[index].update_position(positions[index]);
            stars[index].draw_path();
            stars[index].draw();
            if (abs(positions[index].x) > windowWidth / 2 || abs(positions[index].y) > windowHeight / 2) {
                reset_flag++;
            }
        }


        if (reset_flag == N) {
            reset();
        }



        //update time
        t += dt;
        
    }
    //menu
    else {

        //delete everything
        for (var index = 0; index < sliders.length; index++) {
            sliders[index].remove();
        }
        pause_button.remove();
        start_button.remove();
        menu_button.remove();
        randomize_button.position(20, 20);

        if (menu_created == 0) {
            createMenu();
        }
        menu_created = 1;
        

    }

    //for troubleshooting
    if (console_flag % 10 == 0) {
        display_console();
    }
    console_flag += 1;

}

function display_console() {
   console.log(N);
}

function Star(m_, colour_) {
    this.pos = createVector(0, 0, 0);
    this.m = m_;
    this.r = 3 * sqrt(m_);
    this.path = [];
    this.colour = colour_;

    this.draw = function () {
        //draw the star
        //220 for white
        noStroke();
        fill(this.colour);
        ellipse(width / 2 + this.pos.x, height / 2. + this.pos.y, this.r, this.r);
    };

    this.draw_path = function () {
        stroke(127);
        //check the length of the path, and remove one if necessary
        if (this.path.length > 200) {
            this.path.shift();
        }
        //draw the path of the orbit
        for (var ii = 0; ii < this.path.length - 1; ii++) {
            //change the color of the line
            var shade = map(ii, 0, this.path.length, 50, 220);
            stroke(shade);
            //draw the line segment
            line(this.path[ii].x + width / 2, this.path[ii].y + height / 2., this.path[ii + 1].x + width / 2, this.path[ii + 1].y + height / 2);
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
        positions[index2] = createVector(cos(2 * PI * index2 / N) * 0.6 * AU, sin(2 * PI * index2 / N) * 0.6 * AU, 0);
        velocities[index2] = createVector(cos(2 * PI * index2 / N) * 2, sin(2 * PI * index2 / N) * -2, 0);
        accelerations[index2] = createVector(0, 0, 0);
        stars[index2].path = [];
    }
}


/**
* Generates random starts
*/
function generateRandomStars() {
    for (var index = 0; index < sliders.length; index++) {
        sliders[index].remove();
    }
    masses = [];
    positions = [];
    velocities = [];
    accelerations = [];
    stars = [];
    sliders = [];

    if (show_menu == 1) {
        randomize_button.remove();
        submit_num.remove();
        num_stars_input.remove();
        generateButtons();
    }
    show_menu = 0;
    paused = 0;
    textSize(15);

    for (var index = 0; index < N; index++) {
        slider = createSlider(0, 100, Math.random() * 100);
        sliders.push(slider);
        sliders[index].position(20, 20 + 30 * index);
    }
    for (var index = 0; index < N; index++) {
        masses.push(sliders[index].value());
    }

    //creates stars and sets initial conditions
    for (var index = 0; index < N; index++) {
        positions.push(createVector(cos(2 * PI * index / N) * Math.random() * 3 * AU, sin(2 * PI * index / N) * Math.random() * 3 * AU, 0));
        velocities.push(createVector(cos(2 * PI * index / N + PI / 4) * 3, sin(2 * PI * index / N + PI / 4) * -3, 0));
        //velocities.push(createVector(0, 0, 0));
        accelerations.push(createVector(0, 0, 0));
        star = new Star(masses[index], colours[Math.floor(Math.random() * colours.length)]);
        stars.push(star);
    }
}

function pause() {
    paused = 1;

}

function unpause() {
    paused = 0;
}

function toggleMenu() {
    show_menu = 1;
}


function generateButtons() {
    //creates a pause button
    pause_button = createButton('Pause');
    start_button = createButton('Start');
    menu_button = createButton('Menu');
    randomize_button = createButton('Random');

    pause_button.position(20, 20 + 30 * N);
    start_button.position(80, 20 + 30 * N);
    menu_button.position(130, 20 + 30 * N);
    randomize_button.position(185, 20 + 30 * N);

    start_button.mouseClicked(unpause);
    pause_button.mouseClicked(pause);
    menu_button.mouseClicked(toggleMenu);
    randomize_button.mouseClicked(generateRandomStars);
}

function createMenu() {
    //N = 0;
    masses = [];
    positions = [];
    velocities = [];
    accelerations = [];
    stars = [];
    sliders = [];

    num_stars_input = createInput('');
    num_stars_input.position(20, 50);
    submit_num = createButton('Submit');
    submit_num.position(20 + num_stars_input.width, 50);
    submit_num.mousePressed(setNumStars);



}

function setNumStars() {
    N = num_stars_input.value();
    //num_stars_input.value('');
}

function createStarInputInterface() {


}
