/*jslint node: true*/
'use strict';

var local = require('./local');
var player = local.player;
var players = local.players;
var Gun = require('gun/gun');
var position = require('./position');
var options = require('../shared/options');
var invincible = require('./invincibility');


// join the game
module.exports = function (number) {
	var start, color, time = Gun.time.is();

	player.db = players.db.path(number).put({});
	player.index = number;
	player.object = players.list[number];

	// get the player starting point
	start = position(number);
	player.db.path(time).stringify(start);

	// give the player a chance to escape
	invincible.player(player.index, true);
};
