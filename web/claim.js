/*jslint node: true*/
'use strict';

var local = require('./local');
var player = local.player;
var players = local.players;
var Gun = require('gun/gun');


// join the game
module.exports = function (number) {
	var time = Gun.time.now();

	player.db = players.db.path(number).put({});
	player.index = number;
	player.object = players.list[number];

	// hard-coded starting point
	player.db.path(time).stringify({
		direction: 1,
		axis: 'y',
		x: 200,
		y: 200
	});

	/*
		Move the starting point logic to the server.
		It always has the full picture of the board,
		and knows the safest place to begin.
	*/
};
