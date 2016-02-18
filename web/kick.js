/*jslint node: true*/
/*globals gun, stream, players */
'use strict';

var local = require('./local');

module.exports = function (player) {
	local.players.db.path(player).put(null);
	local.player.object = null;
	local.player.index = null;
	local.player.db = null;
};
