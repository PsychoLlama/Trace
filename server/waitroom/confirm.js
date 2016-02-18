/*jslint node: true*/
'use strict';
var list, Gun = require('gun/gun');
var chosen = require('../gun').get('chosen').put({
	1: null,
	2: null,
	3: null,
	4: null
}).sync(list = {});

// if no response, choose another player
module.exports = function confirm(num, soul) {
	var waiting = require('./index');

	chosen.path(num).put(soul);

	return setTimeout(function () {

		// kick unresponsive players
		if (list[num] === soul) {
			console.log('Rescanning...');
			waiting.next(num);
			confirm(num, soul);
		}
	}, 5000);
};
