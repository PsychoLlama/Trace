/*jslint node: true*/
/*globals gun, stream, players */
'use strict';

var local = require('./local');
var invincible = require('./invincibility');

module.exports = function (player, done) {
	var join = require('./join');
	invincible.player(player.index, false);

	local.players.db.path(player.index).put(null);
	player.object = null;
	player.index = null;
	player.db = null;

	if (!done) {
		join();
	}
};
