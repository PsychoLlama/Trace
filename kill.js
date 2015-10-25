/*globals gun, stream, players */

(function () {
  'use strict';

  function wait(time) {
    stream.state.benched = true;
    setTimeout(function () {
      stream.state.benched = false;
      stream.emit('approval', players.me);
    }, time);
  }

  function kill() {
    if (players.me === undefined) {
      return;
    }
    wait(5000);
    gun
      .path(String(players.me))
      .path('taken').put(false)
      .path('history').put(null);

    players.me = undefined;
  }

  stream.on('player died').run(kill);
}());
