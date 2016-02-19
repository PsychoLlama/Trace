/*jslint node: true*/
/*globals gun, stream, players */
'use strict';

var local = require('./local');

module.exports = function (player, done) {
	var join = require('./join');
	local.players.db.path(player.index).put(null);
	player.object = null;
	player.index = null;
	player.db = null;
	if (!done) {
		join();
	}
};
