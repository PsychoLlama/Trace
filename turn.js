/*globals players, me, find, gun */
var turn;

(function () {
  'use strict';

  var turns = 0;

  function Entry(axis, direction) {
    var position = find(players[me]);
    this.axis = axis;
    this.direction = direction;
    this.time = new Date().getTime();
    this.x = position.x;
    this.y = position.y;
  }

  function extract(axis, direction) {
    if (!direction) {
      switch (axis) {
      case 'up':
        return extract('y', -1);
      case 'down':
        return extract('y', 1);
      case 'left':
        return extract('x', -1);
      case 'right':
        return extract('x', 1);
      }
    }
    return new Entry(axis, direction);
  }

  turn = function (direction) {
    if (me === undefined) {
      return this;
    }
    if (!players[me].history.length) {
      return console.log('No history, bro.');
    }
    // TODO: validate against same direction
    turns += 1;
    var entry = extract(direction),
      turn = {};

    turn[turns] = entry;

    gun
      .path(String(me))
      .path('history')
      .put(turn);
  };

}());
