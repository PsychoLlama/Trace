/*globals gun, stream, players */

(function () {
  'use strict';

  function bench(time) {
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
      bench(5000);
    }
    gun.path(num).put({
      taken: false,
      history: null
    }, function () {
//      location.reload(true);
    });

    if (num === players.me) {
      players.me = undefined;
    }
    stream.emit('kill', num);

  }

  stream.on('collision', 'expiry').run(kill);

}());
