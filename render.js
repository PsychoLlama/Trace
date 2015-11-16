/*globals Canvas, players, find, stream, Line */

(function () {
  'use strict';

  var options, draw, prev, canvas, colors;

  colors = ['green', 'blue', 'red', 'purple'];

  canvas = new Canvas({
    width: 700,
    height: 700
  });

  options = {
    width: 5,
    background: '#e8e8e8'
  };

  function tail(position) {
    var turns, trail;
    if (!position) {
      return null;
    }
    if (!prev) {
      prev = position;
    }
    if (prev.axis !== position.axis) {
      turns = players[players.me].history;
      prev = turns[turns.length - 1];
    }
    trail = new Line(prev, position);
    prev = position;
    return trail;
  }

  function playing(player) {
    return player.history && player.history.length;
  }

  function render() {
    var position = find(players[players.me]);

    players.filter(playing)
      .forEach(draw.fresh().history);

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

      player.history
        .forEach(canvas.width(1).line);

      canvas.line(position).stroke(color);

      return this;
    }
  };

  // Spawn rendering loop
  render();

}());
