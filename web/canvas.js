/*jslint node: true*/
'use strict';

var line, canvas, context;
var color = '#303438';
var height = 10;
var width = 10;

var last = {
	dimension: width
};

function Canvas(options) {
	if (!(this instanceof Canvas)) {
		return new Canvas(options);
	}
	canvas = canvas || document.querySelector('canvas');
	context = canvas.getContext('2d');
	if (options && options.width && options.height) {
		canvas.width = options.width;
		canvas.height = options.height;
	}
}

Canvas.prototype = {
	constructor: Canvas,

	color: function (style) {
		if (!style) {
			return this;
		}
		color = style;
		last.color = style;

		return this;
	},

	width: function (setting) {
		width = setting;
		last.dimension = setting;

		return this;
	},

	height: function (setting) {
		height = setting;
		last.dimension = setting;

		return this;
	},

	ratio: function (string) {
		var setting = string.split(':');
		return this.width(setting[0]).height(setting[1]);
	},

	rect: function (coord) {
		context.beginPath();
		context.rect(coord.x, coord.y, width, height);

		return this;
	},

	square: function (coord) {
		return this
			.height(last.dimension)
			.width(last.dimension)
			.rect(coord);
	},

	line: function (coord) {
		var c = context;
		c.lineWidth = width;
		c.strokeWidth = width;

		if (!line) {
			line = coord;
			c.beginPath();
			c.moveTo(coord.x, coord.y);
		} else {
			c.lineTo(coord.x, coord.y);
		}

		return this;
	},

	stroke: function (style) {
		this.color(style);
		line = undefined;
		context.strokeStyle = color;
		context.stroke();
		context.closePath();

		return this;
	},

	fill: function (style) {
		this.color(style);
		context.fillStyle = color;
		context.fill();
		context.closePath();

		return this;
	},

	clear: function (style) {
		var c = canvas;
		if (style) {
			this.color(style);
		}

		return this.height(
			c.height
		).width(
			c.width
		).rect({
			x: 0,
			y: 0
		}).fill();
	}
};

module.exports = Canvas;
