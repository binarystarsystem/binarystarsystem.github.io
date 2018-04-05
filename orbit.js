
//constants, to be scaled
var G = 190809; //units: (solar radii)/(solar mass units)*(km/s)^2
//solar masses = 2*10^30
//solar radii = 695600 km
var AU = 100;
var singularity_threshold = 90000000;
var planet_singularity_threshold = 10;
var scale_radius = 25;
var scale_mass_slider = 25;
var planet_mass = 1;
var SOLARRADIUS_PER_AU = 215;
var scale_distance = SOLARRADIUS_PER_AU/AU;
var KM_PER_AU = 1.5e8;
var KM_PER_SOLARRADIUS = 6.956e5;

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
var M = 3;
var planet_masses = [];
var planet_positions = [];
var planet_velocities = [];
var planet_accelerations = [];
var planets = [];
var planet_colours = [];
var planet;
var parent_star;

var t = 0;
var dt = 6000;
var console_flag = 0;
var pause_button;
var start_button;
var menu_button;
var randomize_button;
var menu_created = 0;

var num_stars_input;
var submit_num;
var num_planets_input;
var submit_num_planets;

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

//variables for planet input interface in the menu
var planet_input_mass;
var planet_input_masses = [];
var planet_input_x_pos;
var planet_input_initial_x_pos = [];
var planet_input_y_pos;
var planet_input_initial_y_pos = [];
var planet_input_x_vel;
var planet_input_initial_x_vel = [];
var planet_input_y_vel;
var planet_input_initial_y_vel = [];

//Create initial state of the system. Be very cautious when editing code in this program since global variables
//are heavily used. This was a necessity since I was unable to pass and modify certain parameters of the Star class.
function setup() {
    createCanvas(windowWidth, windowHeight);
    //start with a random star simulation of N stars and M planets
    generateButtons();
    generateRandomStars();
    generateRandomPlanets();
}

/*
This is the primary looping portion of the code
Flags will determine whether the simulation is in pause mode, running mode or menu mode
This portion is also what generates all text and non-input elements
*/
function draw() {
    background(0);
    //If menu is not running run the simulation
    if (show_menu == 0) {
        menu_created = 0;
        //Check if slider values have changed and update the stars accordingly. This can be done even while paused
        //Still display sliders and stars while paused but not while in the menu
        for (var index = 0; index < N; index++) {
            if (sliders[index].value() != masses[index]) {
                masses[index] = sliders[index].value() / scale_mass_slider;
                stars[index].m = masses[index];
                stars[index].r = scale_radius * sqrt(masses[index]);
                //reset(); //May choose to reset with slider change but it is nice to change sizes within the same simulation
            }
            noStroke();
            fill(220);
            text("Mass " + (index + 1), sliders[index].x * 2 + sliders[index].width, 35 + 30 * index);
        }
        //Code runs when not paused this is the active portion of the sim
        if (paused == 0) {
            //The primary physics engine generalized for N bodies
            var positions_copy = positions;
            var velocities_copy = velocities;
            var acceleration_copy = accelerations;
            //Physics! Still time stepped but fairly effectively. Need to work on singularities more
            for (var primary = 0; primary < masses.length; primary++) {
                //Update positions
                positions[primary].x = positions_copy[primary].x + velocities_copy[primary].x / KM_PER_AU * AU * dt;
                positions[primary].y = positions_copy[primary].y + velocities_copy[primary].y / KM_PER_AU * AU * dt;
                accelerations[primary].x = 0;
                accelerations[primary].y = 0;
                for (var secondary = 0; secondary < masses.length; secondary++) {
                    if (primary != secondary) {
                        norm3 = pow(sqrt(pow(positions_copy[secondary].x - positions_copy[primary].x, 2) + pow(positions_copy[secondary].y - positions_copy[primary].y, 2))*scale_distance, 3);
                        accelerations[primary].x += G * masses[secondary] *(positions_copy[secondary].x - positions_copy[primary].x)*scale_distance / (norm3*KM_PER_SOLARRADIUS);
                        accelerations[primary].y += G * masses[secondary] *(positions_copy[secondary].y - positions_copy[primary].y)*scale_distance / (norm3*KM_PER_SOLARRADIUS);
                    }
                }
                console.log('x ' + accelerations[primary].x);
                console.log('y ' + accelerations[primary].y);
                //Handle singularities 
                //Rails accelerations at a threshold value. This could be edited if needed
                //We may want to handle singularities in the looping portion to isolate contributions from each star
                if (accelerations[primary].x > singularity_threshold) {
                    accelerations[primary].x = singularity_threshold;
                }
                if (accelerations[primary].x < (-1 * singularity_threshold)) {
                    accelerations[primary].x = -1*singularity_threshold;
                }
                if (accelerations[primary].y > singularity_threshold) {
                    accelerations[primary].y = singularity_threshold;
                }
                if (accelerations[primary].y < (-1 * singularity_threshold)) {
                    accelerations[primary].y = -1*singularity_threshold;
                }
                //Update velocities
                velocities[primary].x = velocities_copy[primary].x + accelerations[primary].x * dt;
                velocities[primary].y = velocities_copy[primary].y + accelerations[primary].y * dt;
            }
            //See planet physics function, similar to above physics
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
            //comment out line bellow to remove planet paths
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
        //generate text for the star and planet inputs
        for (var index = 0; index < input_mass_sliders.length; index++) {
            text("Star " + (index + 1), input_mass_sliders[index].x, 95);
            text("Mass", input_mass_sliders[index].x, 115);
            text("Initial X Position", input_mass_sliders[index].x, 170);
            text("Initial Y Position", input_mass_sliders[index].x, 220);
            text("Initial X Velocity", input_mass_sliders[index].x, 270);
            text("Initial Y Velocity", input_mass_sliders[index].x, 320);
        }
        //for troubleshooting
        //console.log(M);
        for (var index = 0; index < planet_input_masses.length; index++) {
            text("Mass of Planet " + (index + 1), planet_input_masses[index].x, 370);
            text("Initial X Position", planet_input_masses[index].x, 420);
            text("Initial Y Position", planet_input_masses[index].x, 470);
            text("Initial X Velocity", planet_input_masses[index].x, 520);
            text("Initial Y Velocity", planet_input_masses[index].x, 570);       
        }
    }
    //for troubleshooting
    if (console_flag % 5 == 0) {
        //console.log('X ' + planet_accelerations[0].x);
        //console.log('Y ' + planet_accelerations[0].y);
    }
    console_flag += 1;
}

/*
Heavily modified star object. Most of the actual physics is conducted using global arrays
However Star objects are still used to draw the stars and their paths
They also keep the colour and mass consistent, since these terms determine how the star is draw
The position update function should be called to change the position that the star is drawn at, though
this does not effect the actual physics of the star
*/
function Star(m_, colour_) {
    this.pos = createVector(0, 0, 0);
    this.m = m_;
    this.r = scale_radius * sqrt(m_);
    this.path = [];
    this.colour = colour_;
    //draws an elipse representing the star
    this.draw = function () {
        //draw the star
        //220 for white
        noStroke();
        fill(this.colour);
        ellipse(width / 2 + this.pos.x, height / 2. + this.pos.y, this.r, this.r);
    };
    //draws a tail behind the star
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
            //console.log(this.path[ii].x);
            line(this.path[ii].x + width / 2, this.path[ii].y + height / 2., this.path[ii + 1].x + width / 2, this.path[ii + 1].y + height / 2);
        }
    };
    //updates the position that the star is drawn at
    this.update_position = function (position) {
        //add the current position to the path array
        this.pos = position;
        this.path.push(this.pos.copy());
    };
}

/*
Resets the current simulation with the currently randomly generated stars
Sets them equally spaced around a circle at equal radius from center.
Should regenerate random stars around them
*/
function reset() {
    for (var index2 = 0; index2 < N; index2++) {
        positions[index2] = createVector(cos(2 * PI * index2 / N) * 0.6 * AU, sin(2 * PI * index2 / N) * 0.6 * AU, 0);
        velocities[index2] = createVector(cos(2 * PI * index2 / N) * 2, sin(2 * PI * index2 / N) * -2, 0);
        accelerations[index2] = createVector(0, 0, 0);
        stars[index2].path = [];
    }
    zeroPlanetArrays();
    generateRandomPlanets();
}

//generates N random stars
//randomize mass and position, in a circle about the origin
function generateRandomStars() {
    for (var index = 0; index < sliders.length; index++) {
        sliders[index].remove();
    }
    zeroStarArrays();
    //removes menu buttons
    
    if (show_menu == 1) {
        deleteMenu();
        generateButtons();
    }
    show_menu = 0;
    paused = 0;
    textSize(15);

    //creates sliders with masses equal to star masses
    for (var index = 0; index < N; index++) {
        slider = createSlider(0, 100, Math.random() * 100);
        sliders.push(slider);
        sliders[index].position(20, 20 + 30 * index);
        masses.push(sliders[index].value() / scale_mass_slider);
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

function zeroStarArrays() {
    masses = [];
    positions = [];
    velocities = [];
    accelerations = [];
    stars = [];
    sliders = [];
}

function zeroPlanetArrays() {
    planet_masses = [];
    planet_positions = [];
    planet_velocities = [];
    planet_accelerations = [];
    planets = [];
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

/*
Generates the initial menu. If # Planets or # Stars is pressed it updates N or M and generates 
input spaces so that the user can manually set parameters
*/
function createMenu() {
    zeroStarArrays();
    num_stars_input = createInput('');
    num_stars_input.position(20, 50);
    submit_num = createButton('# Stars');
    submit_num.position(20 + num_stars_input.width, 50);
    submit_num.mousePressed(setNumStars);
    num_planets_input = createInput('');
    num_planets_input.position(20 + num_stars_input.width + 70, 50);
    submit_num_planets = createButton('# Planets');
    submit_num_planets.position(20 + num_planets_input.width + num_stars_input.width + 70, 50);
    submit_num_planets.mousePressed(setNumPlanets);
}

//Removes all buttons, sliders and inputs from the menu screen and sets their arrays to empty
function deleteMenu() {
    randomize_button.remove();
    submit_num.remove();
    num_stars_input.remove();
    submit_num_planets.remove();
    num_planets_input.remove();
    if (set_stars != null) {
        set_stars.remove();
    }
    deleteInputInterface();   
}

function deleteInputInterface() {
    for (var index = 0; index < input_mass_sliders.length; index++) {
        input_mass_sliders[index].remove();
        input_initial_x_pos[index].remove();
        input_initial_y_pos[index].remove();
        input_initial_x_vel[index].remove();
        input_initial_y_vel[index].remove();
    }
    for (var index = 0; index < planet_input_masses.length; index++) {
        planet_input_masses[index].remove();
        planet_input_initial_x_pos[index].remove();
        planet_input_initial_y_pos[index].remove();
        planet_input_initial_x_vel[index].remove();
        planet_input_initial_y_vel[index].remove();
    }
    input_mass_sliders = [];
    input_initial_x_pos = [];
    input_initial_y_pos = [];
    input_initial_x_vel = [];
    input_initial_y_vel = [];
    planet_input_masses = [];
    planet_input_initial_x_pos = [];
    planet_input_initial_y_pos = [];
    planet_input_initial_x_vel = [];
    planet_input_initial_y_vel = [];
}

//sets the number of stars equal to the value of the num_stars_input
//creates a user interface to set the parameters for N stars
function setNumStars() {
    N = num_stars_input.value();
    num_stars_input.value('');
    createStarInputInterface();
}

function setNumPlanets() {
    M = num_planets_input.value();
    num_planets_input.value('');
    createStarInputInterface();
}

function createStarInputInterface() {
    deleteInputInterface();
    for (var index = 0; index < N; index++) {
        input_slider = createSlider(0, 100, 25);
        input_mass_sliders.push(input_slider);
        input_x_pos = createInput();
        input_initial_x_pos.push(input_x_pos);
        input_y_pos = createInput();
        input_initial_y_pos.push(input_y_pos);
        input_x_vel = createInput();
        input_initial_x_vel.push(input_x_vel);
        input_y_vel = createInput();
        input_initial_y_vel.push(input_y_vel);
        fill(220);
        input_mass_sliders[index].position(20 + 180 * index, 130);
        input_initial_x_pos[index].position(input_mass_sliders[index].x, 180);
        input_initial_y_pos[index].position(input_mass_sliders[index].x, 230);
        input_initial_x_vel[index].position(input_mass_sliders[index].x, 280);
        input_initial_y_vel[index].position(input_mass_sliders[index].x, 330);
    }
    for (var index = 0; index < M; index++) {
        planet_input_mass = createInput();
        planet_input_masses.push(planet_input_mass);
        planet_input_x_pos = createInput();
        planet_input_initial_x_pos.push(planet_input_x_pos);
        planet_input_y_pos = createInput();
        planet_input_initial_y_pos.push(planet_input_y_pos);
        planet_input_x_vel = createInput();
        planet_input_initial_x_vel.push(planet_input_x_vel);
        planet_input_y_vel = createInput();
        planet_input_initial_y_vel.push(planet_input_y_vel);
        planet_input_masses[index].position(20 + 180 * index, 380);
        planet_input_initial_x_pos[index].position(planet_input_masses[index].x, 430);
        planet_input_initial_y_pos[index].position(planet_input_masses[index].x, 480);
        planet_input_initial_x_vel[index].position(planet_input_masses[index].x, 530);
        planet_input_initial_y_vel[index].position(planet_input_masses[index].x, 580);
    }
    set_stars = createButton('Generate Star System');
    set_stars.position(20, 630);
    set_stars.mouseClicked(generateSetStars);
}



//generate M random planets
//planets naturally spawn around stars with some inital velocity. It may be nice to modify this initial velocity so that the 
//planets orbit right away
function generateRandomPlanets() {
    planet_masses = [];
    planet_positions = [];
    planet_velocities = [];
    planet_accelerations = [];
    planets = [];

    for (var index = 0; index < M; index++) {
        planet_masses.push(planet_mass/scale_mass_slider);
    }
    for (var index = 0; index < M; index++) {
        parent_star = Math.floor(Math.random() * N);
        planet_positions.push(createVector(positions[parent_star].x + 25 + 20* index, positions[parent_star].y, 0));
        planet_velocities.push(createVector(0, 2, 0));
        planet_accelerations.push(createVector(0, 0, 0));
        planet = new Star(planet_masses[index], 'white');
        planets.push(planet);
        //console.log(planet_positions[index].x);
    }
}

//stars should not be effected by gravity from planets
function doPlanetPhysics() {
    var planet_positions_copy = planet_positions;
    var planet_velocities_copy = planet_velocities;
    var planet_acceleration_copy = planet_accelerations;

    //physics of stars on planets
    for (var primary = 0; primary < planet_masses.length; primary++) {
        planet_positions[primary].x = planet_positions_copy[primary].x + planet_velocities_copy[primary].x * dt;
        planet_positions[primary].y = planet_positions_copy[primary].y + planet_velocities_copy[primary].y * dt;
        planet_accelerations[primary].x = 0;
        planet_accelerations[primary].y = 0;
        for (var secondary = 0; secondary < masses.length; secondary++) {
            norm2 = pow(sqrt(pow(positions[secondary].x - planet_positions_copy[primary].x, 2) + pow(positions[secondary].y - planet_positions_copy[primary].y, 2) * scale_distance), 2);
            if (positions[secondary].x >= planet_positions_copy[primary].x) {
                planet_accelerations[primary].x += G * masses[secondary] / norm2;// / 10e3;
            } else {
                planet_accelerations[primary].x -= G * masses[secondary] / norm2;// / 10e3;
            }
            if (positions[secondary].y >= planet_positions_copy[primary].y) {
                planet_accelerations[primary].y += G * masses[secondary] / norm2;// / 10e3;
            } else {
                planet_accelerations[primary].y -= G * masses[secondary] / norm2;// / 10e3;
            }
        }
        //planet_singularity_threshold
        //remove singularities
        //singularity threshold to be modified
        //console.log(planet_accelerations[primary]);
        if (planet_accelerations[primary].x > singularity_threshold) {
            planet_accelerations[primary].x = singularity_threshold;
        }
        if (planet_accelerations[primary].x < (-1 * singularity_threshold)) {
            planet_accelerations[primary].x = -1 * singularity_threshold;
        }
        if (planet_accelerations[primary].y > singularity_threshold) {
            planet_accelerations[primary].y = singularity_threshold;
        }
        if (planet_accelerations[primary].y < (-1 * singularity_threshold)) {
            planet_accelerations[primary].y = -1 * singularity_threshold;
        }
        //update velocity of planets
        planet_velocities[primary].x = planet_velocities_copy[primary].x + planet_accelerations[primary].x * dt;
        planet_velocities[primary].y = planet_velocities_copy[primary].y + planet_accelerations[primary].y * dt;
        planet_accelerations[primary].x = 0;
        planet_accelerations[primary].y = 0;
        //physics of planets on each other
       for (var secondary = 0; secondary < planet_masses.length; secondary++) {
            norm2 = pow(sqrt(pow(planet_positions_copy[secondary].x - planet_positions_copy[primary].x, 2) + pow(planet_positions_copy[secondary].y - planet_positions_copy[primary].y, 2)* scale_distance), 2);
            if (primary != secondary) {
                if (planet_positions_copy[secondary].x >= planet_positions_copy[primary].x) {
                    planet_accelerations[primary].x += G * planet_masses[secondary] / norm2; /// 10e3;
                } else {
                    planet_accelerations[primary].x -= G * planet_masses[secondary] / norm2;// / 10e3;
                }
                if (planet_positions_copy[secondary].y >= planet_positions_copy[primary].y) {
                    planet_accelerations[primary].y += G * planet_masses[secondary] / norm2; /// 10e3;
                } else {
                    planet_accelerations[primary].y -= G * planet_masses[secondary] / norm2;// / 10e3;
                }
            }
        }
        //remove singularities
        //singularity threshold to be modified
        //console.log(planet_accelerations[primary]);
        if (planet_accelerations[primary].x > planet_singularity_threshold) {  
            planet_accelerations[primary].x = planet_singularity_threshold;
        }
        if (planet_accelerations[primary].x < (-1 * planet_singularity_threshold)) {
            planet_accelerations[primary].x = -1 * planet_singularity_threshold;
        }
        if (planet_accelerations[primary].y > planet_singularity_threshold) {
            planet_accelerations[primary].y = planet_singularity_threshold;
        }
        if (planet_accelerations[primary].y < (-1 * planet_singularity_threshold)) {
            planet_accelerations[primary].y = -1 * planet_singularity_threshold;
        }
        //update velocity of planets
        planet_velocities[primary].x += planet_accelerations[primary].x * dt;
        planet_velocities[primary].y += planet_accelerations[primary].y * dt;
    }
}

/*
Generates stars based on user input in menu
*/
function generateSetStars() {
    for (var index = 0; index < sliders.length; index++) {
        sliders[index].remove();
    }
    zeroStarArrays();
    for (var index = 0; index < N; index++) {
        masses.push(input_mass_sliders[index].value() / scale_mass_slider);
        positions.push(createVector(Number(input_initial_x_pos[index].value()), Number(input_initial_y_pos[index].value()), 0));
        velocities.push(createVector(Number(input_initial_x_vel[index].value()), Number(input_initial_y_vel[index].value()), 0));
        accelerations.push(createVector(0, 0, 0));
        star = new Star(masses[index], colours[Math.floor(Math.random() * colours.length)]);
        stars.push(star);
    }
    //remove menu buttons in generateSetPlanets() instead of here
    /* if (show_menu == 1) {
        deleteMenu();
        generateButtons();
    }
    show_menu = 0;
    paused = 0;
    textSize(15);*/
    //Generates the adjustable sliders for inside the physics simulator
    for (var index = 0; index < N; index++) {
        slider = createSlider(0, 100, masses[index]*25);
        sliders.push(slider);
        sliders[index].position(20, 20 + 30 * index);
    }   
    //M = 0;
    generateSetPlanets();
}
/*
Generates planets based on user input in menu
NEED TO FINISH THIS! TOP PRIORITY
*/
function generateSetPlanets() {  
    zeroPlanetArrays(); 
    for (var index = 0; index < M; index++) {
        planet_masses.push(Number(planet_input_masses[index].value()));
        planet_positions.push(createVector(Number(planet_input_initial_x_pos[index].value()), Number(planet_input_initial_y_pos[index].value()), 0));
        planet_velocities.push(createVector(Number(planet_input_initial_x_vel[index].value()), Number(planet_input_initial_y_vel[index].value()), 0));
        planet_accelerations.push(createVector(0, 0, 0));
        planet = new Star(planet_masses[index], 'blue');
        planets.push(planet);
    }
    //removes menu buttons
    if (show_menu == 1) {
        deleteMenu();
        generateButtons();
    }
    show_menu = 0;
    paused = 0;
    textSize(15);
}



