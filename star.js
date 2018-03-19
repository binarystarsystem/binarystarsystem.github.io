//  Binary Star Simulator
//  Written by Michael Topping
//  Last updated - Feb. 19, 2017
//  Created for use with UCLA Astro 3: Lab 5




function Star(m_, a_, e_, tau_) {
    this.pos = createVector(0,0,0);
    this.m = m_;
    this.e = e_;
    this.r = 5*sqrt(m_);
    this.a = a_;
    this.tau = tau_;
    this.path = [];
    if (this.tau < PI/2.) {
        this.graph = new Graph(20, 600, 300, 180);
    } else {
        this.graph = new Graph(480, 600, 300, 180);
    };


    this.draw = function() {
        // draw the star
        fill(220);
        ellipse(width/2+this.pos.x, height/2.+this.pos.y, this.r, this.r);

        this.graph.draw();


    };



    this.draw_path = function() {
        // check the length of the path, and remove one if necessary
        if (this.path.length > 200) {
            this.path.shift();
        }

        // draw the path of the orbit
        for (var ii=0; ii<this.path.length-1; ii++) {
            // change the color of the line
            var shade = map(ii, 0, this.path.length, 50, 220);
            stroke(shade);
            // draw the line segment
            line(this.path[ii].x+width/2, this.path[ii].y+height/2.,
                    this.path[ii+1].x+width/2, this.path[ii+1].y+height/2);
        }

    };




    // update the position of the star, and add its position to the list
    this.update_position = function(t) {

        // find the eccentric anomaly from the time
        var E = this.t_to_E(t);

        // the orbit mechanics happens here
        this.pos.x = cos(this.tau)*this.a*(cos(E)-this.e);
        this.pos.y = (sin(i*PI/180))*cos(this.tau)*this.a*(sqrt(1-pow(this.e, 2))*sin(E));

        // add the current position to the path array
        this.path.push(this.pos.copy());

        // add parameters to graph
        if (frameCount%3 == 0) {
            this.graph.add_point(this.pos.y, t);
        };
        
    
    };




    // convert from time to eccentric anomaly
    this.t_to_E = function(t) { 
     
        // create arrays  in order to find intersection
        for (var ii=0; ii<nsteps; ii++) { 
            Es[ii] = (2*PI*ii/nsteps); 
            // this is the equation for the eccentric anomaly 
            ts[ii] = Es[ii] - this.e*sin(Es[ii]); 
        } 
     
     
        // change the time domain 
        t = t%2*PI;  

        // find the difference between the current time and each time array element
        for (var ii=0; ii<nsteps; ii++) { 
            dists[ii] = abs(ts[ii]-t); 
        } 
     
        // find the minimum index and value of the time array
        var index = 0; 
        var value = dists[0]; 
        for (var i = 1; i < dists.length; i++) { 
          if (dists[i] < value) { 
            value = dists[i]; 
            index = i; 
          } 
        } 
     
        return Es[index]; 
}



}
