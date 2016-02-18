/*jslint node: true*/
'use strict';
localStorage.clear();

var Gun = require('gun/gun');
var kick = require('./kick');
var local = require('./local');
var claim = require('./claim');
var chosen = local.gun.get('chosen');

// start the rendering loop
require('./render');

// initialize keyboard listeners
require('./input');


var token = Gun.text.random();

local.gun.get('waitlist').path(token).put(token);

chosen.map(function (serving, player) {

	if (serving === token) {
		// accept the invite
		chosen.path(player).put(null);

		// take the position in the game
		claim(player);

		// no support in firefox :(
		window.addEventListener('beforeunload', function () {
			kick(player);
		});
	}
});
