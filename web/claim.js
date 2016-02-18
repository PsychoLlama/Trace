/*jslint node: true*/
'use strict';

var local = require('./local');
var player = local.player;
var players = local.players;
var Gun = require('gun/gun');

function Address() {
	this.x = 200;
	this.y = 200;
	this.axis = 'y';
	this.direction = 1;
	this.time = Gun.time.now();
}

module.exports = function (number) {
	player.db = players.db.path(number).put({});
	player.index = number;
	player.object = players.list[number];

	player.db.path(Gun.time.now()).stringify(new Address());
};
