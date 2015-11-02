/*globals stream, find, players, path */
/*jslint plusplus: true */

(function () {
  'use strict';

  var position, invalid,
    canvas = document.querySelector('canvas');


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



  function onAxis(axis) {
    return players.map(path)
      .reduce(function (last, now) {
        return last.concat(now);
      }).filter(function (entry) {
        return entry.axis === axis;
      });
  }






  function crash() {
    var overflow = {};
    if (invalid) {
      return;
    }

    overflow.x = position.x > canvas.width || position.x < 0;
    overflow.y = position.y > canvas.height || position.y < 0;
    if (overflow.x || overflow.y) {
      stream.emit('collision', players.me);
    }
  }

  function collision(tail) {
    if (invalid) {
      return;
    }

    var overlapping,
      perpendicular = (position.axis === 'x') ? 'y' : 'x';


    function inPath(line) {
      var onLeft = line.start < position[perpendicular],
        onRight = line.end > position[perpendicular];

      if (onLeft && onRight) {
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
  }

  stream.on('render').run(validate, crash, collision);

}());
