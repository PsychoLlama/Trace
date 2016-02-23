/*jslint node: true*/
'use strict';
var room, list, gun = require('../gun');
var Gun = require('gun/gun');

list = {};

function time(soul) {
	return Gun.is.node.state(list, soul);
}

function players() {
	var all = [];
	Gun.obj.map(list, function (val, field) {
		// filter null values and metadata
		if (!val || field === '_') {
			return;
		}
		all.push(val);
	});
	return all;
}

function oldest() {
	var all = players();

	if (!all.length) {
		return null;
	}

	// get the oldest in the list
	return all.reduce(function (last, next) {
		return time(last) < time(next) ? last : next;
	});
}

module.exports = {
	next: require('./next'),
	list: list,
	room: gun.get('waitlist').sync(list, true),

	players: players,
	oldest: oldest
};

