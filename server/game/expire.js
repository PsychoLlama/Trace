/*jslint node: true, nomen: true*/
'use strict';

var Gun = require('gun/gun');
var game = require('./index');

function expired(player) {
	var max, vel = 0.1;
	max = Math.max.apply(Math, Object.keys(player));
	return (Gun.time.now() - max) * vel > 1000;
}

/*
	instead of a fixed timeout,
	why not detect wall overlap + latency?
	That would speed up kicking.
	Move to collision.js to isomorph.
*/
setInterval(function () {
	Gun.obj.map(game.players, function (player, number) {
		if (!player) {
			return;
		}
		if (expired(player)) {
			console.log('Kicking player', number);
			game.db.path(number).put(null);
		}
	});
}, 1000);
