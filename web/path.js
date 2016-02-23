/*jslint node: true*/
'use strict';
var find = require('./find');
var sort = require('./sort');
var line = require('./line');

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
