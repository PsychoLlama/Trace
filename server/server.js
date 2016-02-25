/*jslint node: true, nomen: true */
'use strict';
var express = require('express');
var app = express();
var port = process.argv[2] || 8080;
var waiting = require('./waitroom');
var game = require('./game');

// remove inactive players
require('./game/expire');

// sync system clock with clients
require('./game/clock');

app.use(express['static'](__dirname + '/../dist'));

var Gun = require('gun/gun');
var gun = require('./gun');
gun.wsp(app);

app.listen(port, function () {
  console.log('Listening on port', port);
});

game.db.map(function (change, number) {
	if (change === null) {
		console.log('Player slot #' + number, 'is available');
		waiting.next(number);
	}
});

waiting.room.map(function (player) {
	if (!player) {
		return;
	}
	waiting.next();
});
