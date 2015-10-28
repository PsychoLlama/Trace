var find;

(function () {
  'use strict';

  // for distance traveled
  var options = {
    speed: 0.1
  };

  function clone(data) {
    var cp = new data.constructor();

    Object.keys(data).forEach(function (key) {
      cp[key] = data[key];
    });

    return cp;
  }

  // calculate the distance moved
  function distance(point) {
    var elapsed = new Date().getTime() - point.time,
      delta = (elapsed * options.speed) * point.direction;

    return delta + point[point.axis];
  }

  // find the current coordinate of the player
  find = function (player) {
    if (player === undefined || !player.history.length) {
      return null;
    }
    var length = player.history.length,
      coord = player.history[length - 1],
      position = clone(coord);

    position[coord.axis] = distance(coord);

    return position;
  };

}());
