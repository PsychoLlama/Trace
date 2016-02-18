/*jslint node: true*/
'use strict';
var Gun = require('gun/gun');
var gun = require('../gun');
var players = {};

gun.get('players').put({
  1: null,
  2: null,
  3: null,
  4: null
}).sync(players);


module.exports = {
	vacant: function () {
		return Gun.obj.map(players, function (player, num) {
			if (!player) {
				return num;
			}
		}) || null;
	},
	db: gun.get('players'),
	players: players
};
