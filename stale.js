/*globals players, stream */
// remove players after 15 seconds of inactivity

(function () {
  'use strict';

  function reset(player) {
    stream.emit('expiry', player.num);
  }

  function stale(player) {
    if (!player.history || !player.history.length) {
      return false;
    }

    var now = new Date().getTime(),
      entry = player.history[player.history.length - 1],
      elapsed = now - entry.time;

    return (elapsed > 15000);
  }

  function scan() {
    players.filter(stale).forEach(reset);
  }

  setInterval(scan, 1000);

}());
