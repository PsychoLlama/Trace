/*jslint node: true*/
'use strict';

var local = require('./local');
var player = local.player;
var players = local.players;
var Gun = require('gun/gun');
var position = require('./position');
var options = require('../shared/options');


// join the game
module.exports = function (number) {
	var start, time = Gun.time.now();

	player.db = players.db.path(number).put({});
	player.index = number;
	player.object = players.list[number];

	// get the player starting point
	start = position(number);
	player.db.path(time).stringify(start);

	local.justJoined = true;
	setTimeout(function () {
		local.justJoined = false;
	}, options.invincibility);

	/*
		Move the starting point logic to the server.
		It always has the full picture of the board,
		and knows the safest place to begin.
	*/
};
