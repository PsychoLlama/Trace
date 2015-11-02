/*globals gun, stream, players */

(function () {
  'use strict';

  function wait(time) {
    stream.state.benched = true;
    var num = players.me;
    setTimeout(function () {
      stream.state.benched = false;
      stream.emit('approval', players[num]);
    }, time);
  }

  function kill(num) {
    if (num === undefined) {
      return;
    }

    if (num === players.me) {
      wait(5000);
    }
    gun.path(String(num)).put({
      taken: false,
      history: null
    });

    stream.emit('kill', num);
    if (num === players.me) {
      players.me = undefined;
    }

  }

  stream.on('collision', 'expiry').run(kill);
}());
