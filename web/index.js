/*jslint node: true*/
'use strict';
localStorage.clear();

var join = require('./join');
var render = require('./render');
var collision = require('./collision');
//var time = require('./clock');

// join the waitroom
//time(join);
join();

// initialize keyboard listeners
require('./input');

// main rendering/collision detection loop
window.requestAnimationFrame(function loop() {
	render();
	collision();
	window.requestAnimationFrame(loop);
});
