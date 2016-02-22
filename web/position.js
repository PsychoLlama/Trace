/*jslint node: true*/
'use strict';

// naive static starting point for players
module.exports = function (player) {
	switch (player) {
	case '1':
		return {
			x: 100,
			y: 100,
			direction: 1,
			axis: 'y'
		};
	case '2':
		return {
			x: 600,
			y: 100,
			direction: -1,
			axis: 'x'
		};
	case '3':
		return {
			x: 600,
			y: 600,
			direction: -1,
			axis: 'y'
		};
	case '4':
		return {
			x: 100,
			y: 600,
			direction: 1,
			axis: 'x'
		};
	}
};
