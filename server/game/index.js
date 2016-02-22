/*jslint node: true*/
'use strict';
var Gun = require('gun/gun');
var gun = require('../gun');
var players = {};
var waiting = require('../waitroom');

gun.get('players').put({
  1: null,
  2: null,
  3: null,
  4: null
}).sync(players);


module.exports = {
	vacant: function () {
		return Gun.obj.map(players, function (player, num) {
			// check for players who've been chosen, but haven't joined yet.
			if (!player && !waiting.chosen[num]) {
				return num;
			}
		}) || null;
	},
	db: gun.get('players'),
	players: players
};
