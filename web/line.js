/*jslint node: true*/
'use strict';

module.exports = function (start, end) {
	if (!start || !end) {
		return null;
	}
	var temp, perp, axis = start.axis;
	perp = (axis === 'x') ? 'y' : 'x';

	// always record going from top to bottom, left to right
	if (start[axis] > end[axis]) {
		temp = start;
		start = end;
		end = temp;
	}

	return {
		start: start[axis],
		end: end[axis],
		offset: end[perp],
		axis: axis
	};
};
