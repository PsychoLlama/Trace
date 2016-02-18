/*jslint node: true*/
/*globals stream */
'use strict';

var turn = require('./turn');

var xDown, yDown, canvas;
canvas = document.querySelector('canvas');

function turn(direction) {
	console.log(direction);
}

function tie(cb) {
	return {
		to: function (event, target) {
			(target || document).addEventListener(event, cb);
		}
	};
}

// listen for game input
function keyboard(e) {
	switch (e.keyCode) {
	case 65:
	case 37:
		return turn('left');
	case 68:
	case 39:
		return turn('right');
	case 87:
	case 38:
		return turn('up');
	case 83:
	case 40:
		return turn('down');
	}
}



/*
	shamelessly copied from
	a stackoverflow post:
	http://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android#answer-23230280
*/
function touch(e) {
	xDown = e.touches[0].clientX;
	yDown = e.touches[0].clientY;
}

function move(e) {
	if (!xDown || !yDown) {
		return;
	}

	var xUp, yUp, xDiff, yDiff;
	xUp = e.touches[0].clientX;
	yUp = e.touches[0].clientY;
	xDiff = xDown - xUp;
	yDiff = yDown - yUp;

	xDown = null;
	yDown = null;

	if (Math.abs(xDiff) > Math.abs(yDiff)) {
		return xDiff > 0 ? turn('left') : turn('right');
	} else {
		return yDiff > 0 ? turn('up') : turn('down');
	}
}


function resize() {
	var width = window.innerWidth,
		height = window.innerHeight;

	if (height > width) {
		// Centering
		canvas.style.left = 0;
		canvas.style.top = (height / 2) - (width / 2) + 'px';

		canvas.style.width = width + "px";
		canvas.style.height = width + "px";
	} else {
		// Centering
		canvas.style.top = 0;
		canvas.style.left = (width / 2) - (height / 2) + 'px';

		canvas.style.width = height + "px";
		canvas.style.height = height + "px";
	}
}


tie(keyboard).to('keydown');
tie(touch).to('touchstart');
tie(move).to('touchmove');
tie(resize).to('resize', window);

// initial canvas sizing
resize();
