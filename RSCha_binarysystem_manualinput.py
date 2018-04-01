# Modelling the RSCha binary star system for practice
# Date: 29 Mar 2018
#
# Data from www.ast.cam.ac.uk/~pettini/STARS/Lecture04.pdf
# ------------------------------------
# Parameter   Primary      Secondary
# ------------------------------------
# Mass [Ms]   1.89+/-0.01  1.87+/-0.01
# v [km/s]    64+/-6       70+/-6
# P [days]     1.67

import numpy as np
import matplotlib.pyplot as plt
import math
from mpl_toolkits import mplot3d
from numpy import linalg as LA

# Setting up axes for plot
fig = plt.figure()
ax = plt.axes(projection='3d')

# Define constants
G = 6.674*10**(-11) # Gravitational constant
AU = 1.50*10**(11)  # Astronomical unit: 1AU = 150 million km = 150 billion m 
M = 1.98892*10**(30)      # Solar mass: 1M = 2*10**(30) kg

m1 = 1.89*M         # Mass of star 1
m2 = 1.87*M         # Mass of star 2

dt = 60           # Time step = 1 hour = 3600 s
N = 40*60              # Number of iterations for numerical solution = for 2 days

# Define variables for position and velocity of stars
r1 = np.zeros((3,N))
r2 = np.zeros((3,N))
v1 = np.zeros((3,N))
v2 = np.zeros((3,N))

# Position vector for center of mass
R = np.zeros((3,N))

# Position of stars relative to center of mass
r1_rel = np.zeros((3,N))
r2_rel = np.zeros((3,N))
 
# Initial conditions
r1[:,0] = [0.02*AU,0,0]
r2[:,0] = [-0.02*AU,0,0]
v1[:,0] = [0,-150000,0]
v2[:,0] = [0,150000,0]

# Update position and velocity
for t in range(N-1):
    r1[:,t+1] = r1[:,t] + v1[:,t]*dt
    r2[:,t+1] = r2[:,t] + v2[:,t]*dt
    a1 = G*m2*(r2[:,t]-r1[:,t])/((LA.norm(r1[:,t]-r2[:,t]))**3)
    a2 = G*m1*(r1[:,t]-r2[:,t])/((LA.norm(r1[:,t]-r2[:,t]))**3)
    v1[:,t+1] = v1[:,t] + a1*dt
    v2[:,t+1] = v2[:,t] + a2*dt

R = (r1*m1+r2*m2)/(m1+m2)
r1_rel = r1 - R
r2_rel = r2 - R

#Uncomment to plot absolute position of stars (with changing position of CM)
#ax.plot3D(r1[0,:], r1[1,:], r1[2,:], 'red')
#ax.plot3D(r2[0,:], r2[1,:], r2[2,:], 'blue')

#Plot position of stars relative to CM (with position of CM held constant)
ax.plot3D(r1_rel[0,:], r1_rel[1,:], r1_rel[2,:], 'red')
ax.plot3D(r2_rel[0,:], r2_rel[1,:], r2_rel[2,:], 'blue')

plt.show()
