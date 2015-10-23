/*globals Canvas, players, find */

var render, tail;
(function () {
  'use strict';

  var options, draw, stopped,
    colors = ['green', 'blue', 'red', 'purple'],
    canvas = new Canvas({
      width: 500,
      height: 500
    });

  options = {
    width: 5,
    background: '#e8e8e8'
  };

  render = function () {
    draw.fresh();

    players
      .filter(function (player) {
        return player.history && player.history.length;
      })
      .forEach(function (player) {
        draw.player(player).history(player);
      });

    window.requestAnimationFrame(render);
    return true;
  };

  function setTail(current) {
    if (!tail) {
      tail = current;
    }

  }

  draw = {
    fresh: function () {
      canvas.clear(options.background);

      return this;
    },

    player: function (player) {
      var color = colors[player.num];

      canvas
        .width(options.width)
        .square(player)
        .fill(color);

      return this;
    },

    history: function (player) {
      var color = colors[player.num],
        current = find(player);
      setTail(current);

      player.history.forEach(function (entry) {
        canvas.width(1).line(entry);
      });

      canvas.line(current).stroke(color);

      return this;
    }
  };

}());

// Spawn rendering loop
render();
