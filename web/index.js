/*jslint node: true*/
'use strict';
localStorage.clear();

var join = require('./join');

// join the waitroom
join();

// begin clock synchronization
require('../lib/nts');

// start the rendering loop
require('./render');

// initialize keyboard listeners
require('./input');

// spin up collision detection
require('./collision');
