/*globals stream, find, players, path */
/*jslint plusplus: true */

var onAxis;

(function () {
  'use strict';

  var overflow, collision, position, invalid;


  function validate(tail) {
    var player = players[players.me];
    position = find(player);

    if (!player || !player.history) {
      return (invalid = true);
    }
    if (player.history.length === 0) {
      return (invalid = true);
    }
    if (!position || tail === null) {
      return (invalid = true);
    }
    invalid = false;
  }



  onAxis = function (axis) {
    return players.map(function (player) {
      return path(player);
    }).reduce(function (last, now) {
      return last.concat(now);
    }).filter(function (entry) {
      return entry.axis === axis;
    });
  };






  overflow = function () {
    var canvas = document.querySelector('canvas'),
      overflow = {};
    if (invalid) {
      return;
    }

    overflow.x = position.x > canvas.width || position.x < 0;
    overflow.y = position.y > canvas.height || position.y < 0;
    if (overflow.x || overflow.y) {
      stream.emit('collision', players.me);
    }
  };

  collision = function (tail) {
    if (invalid) {
      return;
    }

    var overlapping,
      perpendicular = (position.axis === 'x') ? 'y' : 'x';


    function inPath(line) {
      if (line.start < position[perpendicular] &&
          line.end > position[perpendicular]) {
        return true;
      }
      return false;
    }

    function crossing(line) {
      if (line.offset >= tail.start && line.offset <= tail.end) {
        return true;
      }
      if (line.offset <= tail.start && line.offset >= tail.end) {
        return true;
      }
      return false;
    }

    overlapping = onAxis(perpendicular)
      .filter(inPath)
      .filter(crossing)
      .length;

    if (overlapping) {
      stream.emit('collision', players.me);
    }
  };

  stream.on('render').run(validate, overflow, collision);

}());
