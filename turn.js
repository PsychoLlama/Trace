/*globals players, find, gun, stream */

(function () {
  'use strict';

  var turns = 0;

  function Entry(axis, direction) {
    var position = find(players[players.me]);
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

  function turn(direction) {
    if (players.me === undefined) {
      return;
    }
    if (!players[players.me].history.length) {
      throw new Error('Awkward! No history...');
    }
    // TODO: validate against same direction
    turns += 1;
    var entry = extract(direction);

    gun
      .path(String(players.me))
      .path('history')
      .path(String(turns))
      .put(entry);
  }

  stream.on('turn').run(turn);

}());
