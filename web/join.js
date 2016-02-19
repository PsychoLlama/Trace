/*jslint node: true*/
'use strict';
var Gun = require('gun/gun');
var local = require('./local');
var claim = require('./claim');
var kick = require('./kick');
var waiting = local.gun.get('waitlist');
var chosen = local.gun.get('chosen');
var token;

function leave() {
	kick(local.player, true);
}
chosen.map(function (serving, player) {

	if (serving === token) {
		// accept the invite
		chosen.path(player).put(null);

		// take the position in the game
		claim(player);

		// no support in firefox :(
		window.addEventListener('beforeunload', leave);

		// uncomment for production
//		window.addEventListener('blur', leave);
	}
});

module.exports = function () {
	token = Gun.text.random();
	return waiting.path(token).put(token);
};
