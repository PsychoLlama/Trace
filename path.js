/*globals find */

var path, Line;

(function () {
  'use strict';

  var lines = [];

  Line = function (start, end) {
    var axis = start.axis,
      perpendicular = (axis === 'x') ? 'y' : 'x',
      intermediate;

    // always record going from top to bottom, left to right
    if (start[axis] > end[axis]) {
      intermediate = start;
      start = end;
      end = intermediate;
    }

    this.start = start[axis];
    this.end = end[axis];
    this.offset = end[perpendicular];
    this.axis = axis;

  };

  path = function (player) {
    var i, start, end, line, set = [],
      lines = player.history,
      position = find(player);
    if (!lines.length) {
      return [];
    }

    for (i = 1; i < lines.length; i += 1) {
      start = lines[i - 1];
      end = lines[i];
      line = new Line(start, end);
      set.push(line);
    }
    set.push(new Line(lines[i - 1], position));
    return set;
  };

}());
