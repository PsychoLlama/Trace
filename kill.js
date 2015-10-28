/*globals gun, stream, players */

(function () {
  'use strict';

  function wait(time) {
    stream.state.benched = true;
    var player = players[players.me];
    setTimeout(function () {
      stream.state.benched = false;
      stream.emit('approval', player);
    }, time);
  }

  function kill(num) {
    if (num === undefined) {
      return;
    }
    if (num === players.me) {
      wait(5000);
    }
    gun
      .path(String(num))
      .path('taken').put(false)
      .path('history').put(null);

    players.me = undefined;
  }

  stream.on('collision', 'expiry').run(kill);
}());
