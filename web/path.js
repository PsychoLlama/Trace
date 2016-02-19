/*jslint node: true*/
'use strict';
var find = require('./find');
var sort = require('./sort');
var line = require('./line');

function line(start, end) {
	if (!start || !end) {
		return null;
	}
	var temp, perp, axis = start.axis;
	perp = (axis === 'x') ? 'y' : 'x';

	// always record going from top to bottom, left to right
	if (start[axis] > end[axis]) {
		temp = start;
		start = end;
		end = temp;
	}

	return {
		start: start[axis],
		end: end[axis],
		offset: end[perp],
		axis: axis
	};
}

module.exports = function path(player) {
	var	position, lines;
	if (!player) {
		return [];
	}

	lines = sort(player);
	position = find(player);
	if (!lines.length) {
		return [];
	}

	lines.push(position);
	return lines.map(function (start, i) {
		if (i === lines.length - 1) {
			return;
		}
		var end = lines[i + 1];
		return line(start, end);
	}).filter(Boolean);
};
