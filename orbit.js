
//constants, to be scaled
var G = 150000;
var AU = 100;
var singularity_threshold = 15;

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
var N = 3;
var colours = ['red', 'orange', 'yellow', 'white', 'gold', 'DarkOrange']

//hold the planets
var M = 5;
var planet_masses = [];
var planet_positions = [];
var planet_velocities = [];
var planet_accelerations = [];
var planets = [];
var planet_colours = [];
var planet;
var parent_star;

var t = 0;
var dt = 0.08;
var console_flag = 0;
var pause_button;
var start_button;
var menu_button;
var randomize_button;
var menu_created = 0;

var num_stars_input;
var submit_num;

//variables for the input interfaces in the menu
var input_slider;
var input_mass_sliders = [];
var input_x_pos;
var input_initial_x_pos = [];
var input_y_pos;
var input_initial_y_pos = [];
var input_x_vel;
var input_initial_x_vel = [];
var input_y_vel;
var input_initial_y_vel = [];
var set_stars;
var xp;
var yp;
var xv;
var yv;

//use this for setup menu
function setup() {
    //create canvas
    createCanvas(windowWidth, windowHeight);
    //start with a random star simulation of N stars
    generateButtons();
    generateRandomStars();
    generateRandomPlanets();

}

//looping portion
function draw() {
    background(0);

    //if menu is not running run the simulation
    if (show_menu == 0) {
        menu_created = 0;
        //check if slider values have changed
        //still display sliders and stars while paused
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

        //code runs when not paused this is the active portion of the sim
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
                //handle singularities
                //maybe set equal to singularity threshold rather than 0?
                if (accelerations[primary].x > singularity_threshold || accelerations[primary].x < (-1 * singularity_threshold)) {
                    accelerations[primary].x = 0;
                }
                if (accelerations[primary].y > singularity_threshold || accelerations[primary].y < (-1 * singularity_threshold)) {
                    accelerations[primary].y = 0;
                }
                velocities[primary].x = velocities_copy[primary].x + accelerations[primary].x * dt;
                velocities[primary].y = velocities_copy[primary].y + accelerations[primary].y * dt;
            }
            doPlanetPhysics();
        }

        var reset_flag = 0;
        //update the positions and draw stars
        //still runs while paused so that stars still appear
        for (var index = 0; index < N; index++) {
            stars[index].update_position(positions[index]);
            stars[index].draw_path();
            stars[index].draw();
            if (abs(positions[index].x) > windowWidth / 2 || abs(positions[index].y) > windowHeight / 2) {
                reset_flag++;
            }
        }
        //reset the simulation if all stars are off the screen
        if (reset_flag == N) {
            reset();
        }
        //draw planets
        for (var index = 0; index < M; index++) {
            planets[index].update_position(planet_positions[index]);
            planets[index].draw_path();
            planets[index].draw();
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

        //generate the star number input, this will not work if it is continuously being referenced, hence the if statement
        if (menu_created == 0) {
            createMenu();
        }
        menu_created = 1;

        for (var index = 0; index < input_mass_sliders.length; index++) {
            text("Star " + (index + 1), input_mass_sliders[index].x, 95);
            text("Mass", input_mass_sliders[index].x, 115);
            text("Initial X Position", input_mass_sliders[index].x, 170);
            text("Initial Y Position", input_mass_sliders[index].x, 220);
            text("Initial X Velocity", input_mass_sliders[index].x, 270);
            text("Initial Y Velocity", input_mass_sliders[index].x, 320);
        }
    }

    //for troubleshooting
    if (console_flag % 5 == 0) {
        display_console();
        //console.log('X ' + planet_accelerations[0].x);
        //console.log('Y ' + planet_accelerations[0].y);
    }
    console_flag += 1;

}

function display_console() {
    //console.log();
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

//resets the current simulation with currently incorrect inital conditions
function reset() {
    for (var index2 = 0; index2 < N; index2++) {
        positions[index2] = createVector(cos(2 * PI * index2 / N) * 0.6 * AU, sin(2 * PI * index2 / N) * 0.6 * AU, 0);
        velocities[index2] = createVector(cos(2 * PI * index2 / N) * 2, sin(2 * PI * index2 / N) * -2, 0);
        accelerations[index2] = createVector(0, 0, 0);
        stars[index2].path = [];
    }
}

/**
* Generates random stars
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

    //removes menu buttons
    if (show_menu == 1) {
        randomize_button.remove();
        submit_num.remove();
        num_stars_input.remove();
        set_stars.remove();
        for (var index = 0; index < input_mass_sliders.length; index++) {
            input_mass_sliders[index].remove();
            input_initial_x_pos[index].remove();
            input_initial_y_pos[index].remove();
            input_initial_x_vel[index].remove();
            input_initial_y_vel[index].remove();
        }
        input_mass_sliders = [];
        input_initial_x_pos = [];
        input_initial_y_pos = [];
        input_initial_x_vel = [];
        input_initial_y_vel = [];
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
        //velocities.push(createVector(cos(2 * PI * index / N + PI / 4) * 3, sin(2 * PI * index / N + PI / 4) * -3, 0));
        velocities.push(createVector(0, 0, 0));
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
    randomize_button.mouseClicked(randomizeSim);
}

function randomizeSim() {
    generateRandomStars();
    generateRandomPlanets();
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
    num_stars_input.value('');
    createStarInputInterface();
}

function createStarInputInterface() {
    for (var index = 0; index < input_mass_sliders.length; index++) {
        input_mass_sliders[index].remove();
        input_initial_x_pos[index].remove();
        input_initial_y_pos[index].remove();
        input_initial_x_vel[index].remove();
        input_initial_y_vel[index].remove();
    }
    input_mass_sliders = [];
    input_initial_x_pos = [];
    input_initial_y_pos = [];
    input_initial_x_vel = [];
    input_initial_y_vel = [];
    for (var index = 0; index < N; index++) {
        input_slider = createSlider(0, 100, 25);
        input_mass_sliders.push(input_slider);
        input_x_pos = createInput('');
        input_initial_x_pos.push(input_x_pos);
        input_y_pos = createInput('');
        input_initial_y_pos.push(input_y_pos);
        input_x_vel = createInput('');
        input_initial_x_vel.push(input_x_vel);
        input_y_vel = createInput('');
        input_initial_y_vel.push(input_y_vel);

        fill(220);
        input_mass_sliders[index].position(20 + 180 * index, 130);
        input_initial_x_pos[index].position(input_mass_sliders[index].x, 180);
        input_initial_y_pos[index].position(input_mass_sliders[index].x, 230);
        input_initial_x_vel[index].position(input_mass_sliders[index].x, 280);
        input_initial_y_vel[index].position(input_mass_sliders[index].x, 330);
    }
    set_stars = createButton('Generate Star System');
    set_stars.position(20, 370);
    set_stars.mouseClicked(generateSetStars);

}

function generateRandomPlanets() {
    planet_masses = [];
    planet_positions = [];
    planet_velocities = [];
    planet_accelerations = [];
    planets = [];

    for (var index = 0; index < M; index++) {
        planet_masses.push(2);
    }
    for (var index = 0; index < M; index++) {
        parent_star = Math.floor(Math.random() * N);
        planet_positions.push(createVector(positions[parent_star].x + 25 + index, positions[parent_star].y, 0));
        planet_velocities.push(createVector(0, 4, 0));
        planet_accelerations.push(createVector(0, 0, 0));
        planet = new Star(planet_masses[index], 'white');
        planets.push(planet);
        //console.log(planet_positions[index].x);
    }
}


//planet masses currently do no effect each other
//stars should not be effected by gravity from planets
function doPlanetPhysics() {
    var planet_positions_copy = planet_positions;
    var planet_velocities_copy = planet_velocities;
    var planet_acceleration_copy = planet_accelerations;

    for (var primary = 0; primary < planet_masses.length; primary++) {
        planet_positions[primary].x = planet_positions_copy[primary].x + planet_velocities_copy[primary].x * dt;
        planet_positions[primary].y = planet_positions_copy[primary].y + planet_velocities_copy[primary].y * dt;
        planet_accelerations[primary].x = 0;
        planet_accelerations[primary].y = 0;
        for (var secondary = 0; secondary < masses.length; secondary++) {
            norm2 = pow(sqrt(pow(positions[secondary].x - planet_positions_copy[primary].x, 2) + pow(positions[secondary].y - planet_positions_copy[primary].y, 2)), 2);
            if (positions[secondary].x >= planet_positions_copy[primary].x) {
                planet_accelerations[primary].x += G * masses[secondary] / norm2 / 10e3;
            } else {
                planet_accelerations[primary].x -= G * masses[secondary] / norm2 / 10e3;
            }
            if (positions[secondary].y >= planet_positions_copy[primary].y) {
                planet_accelerations[primary].y += G * masses[secondary] / norm2 / 10e3;
            } else {
                planet_accelerations[primary].y -= G * masses[secondary] / norm2 / 10e3;
            }
        }
        //remove singularities
        //singularity threshold to be modified
        if (planet_accelerations[primary].x > singularity_threshold || planet_accelerations[primary].x < (-1 * singularity_threshold)) {
            planet_accelerations[primary].x = 0;
        }
        if (planet_accelerations[primary].y > singularity_threshold || planet_accelerations[primary].y < (-1 * singularity_threshold)) {
            planet_accelerations[primary].y = 0;
        }
        //update velocity of planets
        planet_velocities[primary].x = planet_velocities_copy[primary].x + planet_accelerations[primary].x * dt;
        planet_velocities[primary].y = planet_velocities_copy[primary].y + planet_accelerations[primary].y * dt;
    }
}

function generateSetStars() {
    for (var index = 0; index < sliders.length; index++) {
        sliders[index].remove();
    }
    masses = [];
    positions = [];
    velocities = [];
    accelerations = [];
    stars = [];
    sliders = [];

    for (var index = 0; index < N; index++) {
        xp = input_initial_x_pos[index].value();
        //input_initial_x_pos[index].value('');
        yp = input_initial_y_pos[index].value();
        //input_initial_y_pos[index].value('');
        xv = input_initial_x_vel[index].value();
        //input_initial_x_vel[index].value('');
        yv = input_initial_y_vel[index].value();
        //input_initial_y_vel[index].value('');
        console.log(xp);
        masses.push(input_mass_sliders[index].value());
        positions.push(createVector(xp, yp, 0));
        velocities.push(createVector(xv, yv, 0));
        accelerations.push(createVector(0, 0, 0));
        star = new Star(masses[index], colours[Math.floor(Math.random() * colours.length)]);
        stars.push(star);
    }

    //removes menu buttons
    if (show_menu == 1) {
        randomize_button.remove();
        submit_num.remove();
        num_stars_input.remove();
        set_stars.remove();
        for (var index = 0; index < input_mass_sliders.length; index++) {
            input_mass_sliders[index].remove();
            input_initial_x_pos[index].remove();
            input_initial_y_pos[index].remove();
            input_initial_x_vel[index].remove();
            input_initial_y_vel[index].remove();
        }
        input_mass_sliders = [];
        input_initial_x_pos = [];
        input_initial_y_pos = [];
        input_initial_x_vel = [];
        input_initial_y_vel = [];
        generateButtons();
    }
    show_menu = 0;
    paused = 0;
    textSize(15);

    for (var index = 0; index < N; index++) {
        slider = createSlider(0, 100, masses[index]);
        sliders.push(slider);
        sliders[index].position(20, 20 + 30 * index);
    }

    M = 0;
    planet_masses = [];
    planet_positions = [];
    planet_velocities = [];
    planet_accelerations = [];
    planets = [];
    
}
