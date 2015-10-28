/*globals Canvas, players, find, stream, Line */

(function () {
  'use strict';

  var options, draw, prev, stopped, hooks = [],
    colors = ['green', 'blue', 'red', 'purple'],
    canvas = new Canvas({
      width: 700,
      height: 700
    });

  options = {
    width: 5,
    background: '#e8e8e8'
  };

  function tail(position) {
    if (!position) {
      return null;
    }
    if (!prev) {
      prev = position;
    }
    var trail = new Line(prev, position);
    prev = position;
    return trail;
  }

  function render() {
    draw.fresh();

    players.filter(function (player) {
      return player.history && player.history.length;
    }).forEach(draw.history);

    var position = find(players[players.me]);
    stream.emit('render', tail(position));

    window.requestAnimationFrame(render);
  }

  draw = {
    fresh: function () {
      canvas.clear(options.background);

      return this;
    },

    history: function (player) {
      var color = colors[player.num],
        position = find(player);

      player.history.forEach(function (entry) {
        canvas.width(1).line(entry);
      });

      canvas.line(position).stroke(color);

      return this;
    }
  };

  // Spawn rendering loop
  render();

}());
