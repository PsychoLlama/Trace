/*jslint node: true*/
'use strict';
var Gun = require('gun/gun');
var processed, gun = require('./local').gun;
var clock = gun.get('time');



module.exports = function (callback) {
	var adjustment = gun.put({
		sent: Gun.time.is()
	}).on(function (msg) {
		if (msg.recieved && !processed) {
			processed = true;

			var now, latency, diff;
			now = Gun.time.is();

			latency = (now - msg.sent) / 2;

			diff = now - (msg.recieved + latency);

			Gun.time.is = function () {
				return Gun.time.is() + Math.round(diff);
			};

			(callback || function () {})();
		}
	});

	window.clock = clock.set(adjustment);
};
