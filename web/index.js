/*jslint node: true*/
'use strict';
localStorage.clear();

var join = require('./join');
var render = require('./render');
var collision = require('./collision');

// join the waitroom
join();

// initialize keyboard listeners
require('./input');

// main rendering/collision detection loop
window.requestAnimationFrame(function loop() {
	render();
	collision();
	window.requestAnimationFrame(loop);
});
