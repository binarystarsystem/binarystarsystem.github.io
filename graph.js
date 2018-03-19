//  Binary Star Simulator
//  Written by Michael Topping
//  Last updated - Feb. 19, 2017
//  Created for use with UCLA Astro 3: Lab 5

// class to store and display radial velocity data
function Graph(x_, y_, w_,h_) {
    // position, width and height
    this.x = x_;
    this.y = y_;
    this.w = w_;
    this.h = h_;
    
    // data for displaying
    this.ts = [];
    this.vels = [];
    
    // determines if more data should be added
    this.graphing = true;

    // draw the graph
    this.draw = function() {
        // draw the axes and axes labels
        this.draw_axes();
        stroke(220);
        
        // draw the data in the v-t plane
        for (var ii=0; ii<this.vels.length-2; ii++) {
            var t = map(this.ts[ii], 0, 10, 0, this.w);
            var nt = map(this.ts[ii+1], 0, 10, 0, this.w);
            var v = map(this.vels[ii+1]-this.vels[ii], -50, 50, 0, this.h);
            var nv = map(this.vels[ii+2]-this.vels[ii+1], -50, 50, 0, this.h);
            line(t+this.x, v+this.y, nt+this.x, nv+this.y);
        }

        // check if we have hit the end of the graph
        if (t >= this.w-2) { // the # is a buffer with the side of the plot
            this.graphing = false;
        }
        
    }


    // draw the axes
    // this includes a box, axis labels, and a zero point
    this.draw_axes = function() {
        fill(30);
        rect(this.x, this.y, this.w, this.h);
        stroke(127);
        line(this.x, this.y+this.h/2., this.x+this.w, this.y+this.h/2.);
        fill(220);
        text("Time ⟶", this.x+this.w/2.-20, this.y+this.h+14);
        text("V", this.x-12, this.y+this.h/2.+3);
    }


    // append a time and velocity to the arrays, if you are still adding points
    this.add_point = function(v, t) {
        if (this.graphing == true) {
            this.ts.push(dt*3*this.ts.length);
            this.vels.push(v);
        }
    }
}
