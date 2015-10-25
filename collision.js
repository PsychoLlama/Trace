/*jslint plusplus: true */
/*globals stream, find, players */

(function () {
  'use strict';

  var onAxis, overflow, collision, position, invalid;


  function validate() {
    var player = players[players.me];
    position = find(player);

    if (!player || !player.history) {
      return (invalid = true);
    }
    if (player.history.length === 0) {
      return (invalid = true);
    }
    if (!position) {
      return (invalid = true);
    }
    invalid = false;
  }



  onAxis = function (axis) {
    return players.map(function (player) {
      return player.history.map(function (entry) {
        return entry;
      });
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
      stream.emit('player died', players[players.me]);
    }
  };

  collision = function () {
    if (invalid) {
      return;
    }
    var overlapping = false;



    if (overlapping) {
      stream.emit('player died', players[players.me]);
    }
  };

  stream.on('render').run(validate, overflow, collision);

}());
