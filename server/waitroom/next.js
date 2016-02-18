/*jslint node: true*/
'use strict';
var game = require('../game');
var confirm = require('./confirm');

module.exports = function (num) {
	var oldest, waiting = require('./index');

	num = num || game.vacant();

	oldest = waiting.oldest();

	if (!oldest || !num) {
		return;
	}

	console.log('Now serving', oldest, 'as player', num);
	waiting.room.path(oldest).put(null);

	return confirm(num, oldest);
};
