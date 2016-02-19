/*jslint plusplus: true, node: true */
'use strict';
var Gun = require('gun/gun');
var local = require('./local');
var find = require('./find');
var path = require('./path');
var kick = require('./kick');
var sort = require('./sort');
var line = require('./line');
var players = local.players;
var player = local.player;

var position, prev, boundary = 700;

function tail() {

	// we're not playing yet
	if (!position) {
		return null;
	}
	if (!prev) {
		prev = position;
	}

	/*
		If we've turned since the last
		collision check, use that turn
		as our last position.
	*/
	if (prev.axis !== position.axis) {
		prev = sort(player.object).slice(-1);
	}

	// figure out the path between renders
	return line(prev, prev = position);
}









function outOfBounds() {
	var overflow = {};

	overflow.x = position.x > boundary || position.x < 0;
	overflow.y = position.y > boundary || position.y < 0;
	return (overflow.x || overflow.y);
}

function inPath(line) {
	var onLeft, onRight, perp;
	perp = (position.axis === 'x') ? 'y' : 'x';
	onLeft = line.start < position[perp];
	onRight = line.end > position[perp];

	if (onLeft && onRight) {
		return true;
	}
	return false;
}

function crossing(line) {
	var thing = tail();
	if (line.offset >= thing.start && line.offset <= thing.end) {
		return true;
	}
	if (line.offset <= thing.start && line.offset >= thing.end) {
		return true;
	}
	return false;
}

function collision() {
	var lines = [];

	// add every player's history to the list of lines
	Gun.obj.map(players.list, function (player, number) {
		var history = path(player);
		lines = lines.concat(history);
	});

	/*
		Filter out lines that aren't dangerous,
		then filter out the ones that aren't in
		your way, then filter out the ones you're
		not overlapping with.
	*/
	return lines.filter(function (line) {
		return line.axis !== position.axis;
	}).filter(inPath).filter(crossing).length;
}

module.exports = (function detect() {
	position = find(player.object);
	if (position && (outOfBounds() || collision())) {
		kick(player);
		prev = null;
	}
	return window.requestAnimationFrame(detect);
}());
