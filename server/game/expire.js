/*jslint node: true, nomen: true*/
'use strict';

var Gun = require('gun/gun');
var game = require('./index');
var options = require('../../shared/options');

function expired(player) {
	var max, vel = options.speed;
	max = Math.max.apply(Math, Object.keys(player));

	// distance travelled is greater than the board, plus latency
	return (Gun.time.is() - (max + options.latency)) * vel > 700;
}

/*
	instead of a fixed timeout,
	why not detect wall overlap + latency?
	That would speed up kicking.
	Move to collision.js to 'shared'.
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
