/*jslint node: true, nomen: true*/
'use strict';

var Gun = require('gun/gun');
var game = require('./index');
function expired(player) {
	var max, vel = 0.1;
	max = Math.max.apply(Math, Object.keys(player));
	return (Gun.time.now() - max) * vel > 1000;
}

setInterval(function () {
	Gun.obj.map(game.players, function (player, number) {
		if (!player) {
			return;
		}
		if (expired(player)) {
			console.log('removing player', number);
			game.db.path(number).put(null);
		}
	});
}, 1000);
