/*jslint node: true*/
'use strict';

var options = require('../shared/options');
var local = require('./local');
var style = options.colors;
var list, timeouts, intervals, colors;
intervals = {};
timeouts = {};

// create a copy of the colors object
colors = JSON.parse(
	JSON.stringify(options.colors)
);
var db = local.gun.get('invincible').sync(list = {});

function blink(player) {
	var index = player - 1;
	intervals[player] = setInterval(function () {

		style[index] = style[index] === colors[index] ? 'darkgray' : colors[index];
	}, options.blinkSpeed);
}

function invincible(player, bool) {
	db.path(player).put(bool);

	if (!bool) {
		clearTimeout(timeouts[player]);
		timeouts[player] = null;
		style[player - 1] = colors[player - 1];
	}
}


db.map(function (immortal, player) {
	if (!immortal) {
		clearInterval(intervals[player]);
		intervals[player] = null;
	} else if (!intervals[player]) {
		blink(player);
		timeouts[player] = setTimeout(function () {
			invincible(player, false);
		}, options.invincibility);
	}
});

module.exports = window.i = {
	player: invincible,
	list: list
};
