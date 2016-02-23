/*jslint node: true*/
'use strict';

module.exports = function (player) {
	var turns, position;
	if (!player) {
		return [];
	}

	return Object.keys(player).sort().map(function (key) {
		var coord = JSON.parse(player[key]);
		coord.time = parseInt(key, 10);
		return coord;
	});

};
