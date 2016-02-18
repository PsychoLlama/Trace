/*jslint node: true*/
'use strict';

var Gun = require('gun/gun');
var find = require('./find');
var local = require('./local');

function turn(axis, direction) {
	var position = find(local.player.object);

	return {
		direction: direction,
		x: position.x,
		y: position.y,
		axis: axis
	};
}

function extract(axis, direction) {
	if (!direction) {
		switch (axis) {
		case 'up':
			return extract('y', -1);
		case 'down':
			return extract('y', 1);
		case 'left':
			return extract('x', -1);
		case 'right':
			return extract('x', 1);
		}
	}
	return turn(axis, direction);
}


module.exports = function (direction) {
	var time, turn, position;
	position = find(local.player.object);
	if (!position) {
		return;
	}
	turn = extract(direction);
	time = Gun.time.now();

	if (position.axis === turn.axis) {
		return;
	}

	local.player.db.path(time).stringify(turn);
};
