/*jslint node: true*/
'use strict';
var clock = require('../gun').get('time');

/*
	Clients sync towards the server clock.
	On a time request, the server immediately
	responds with the time, and the client
	adjusts their clock to meet server time + latency.
*/
clock.map().val(function (time, request) {
	this.path('recieved').put(new Date().getTime());
});

module.exports = clock;
