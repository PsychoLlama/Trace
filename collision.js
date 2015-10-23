/*jslint plusplus: true */
/*globals players, trail, find, me */

var collision, findLines;

(function () {
  'use strict';

  findLines = function (axis) {
    var onAxis = [];

    function scan(player) {
      player.history
        .filter(function (entry) {
          return entry.axis === axis;
        })
        .forEach(onAxis.push);
    }
    players.forEach(scan);
    return onAxis;
  };

  collision = function () {
    var player = players[me],
      canvas = document.querySelector('canvas'),
      position = player.history[player.history.length - 1],
      exceedsX,
      exceedsY;

    if (!player || !player.history || player.history.length === 0) {
      return false;
    }

    exceedsX = position.x > canvas.width || position.x < 0;
    exceedsY = position.y > canvas.height || position.y < 0;
    return exceedsX || exceedsY;
  };

}());
