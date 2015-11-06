/*globals gun, players, stream */

(function () {
  'use strict';

  function Address() {
    this.x = 200;
    this.y = 200;
    this.axis = 'y';
    this.direction = 1;
    this.time = new Date().getTime();
  }

  function claim() {

    var player, address = new Address(), open;

    open = players.some(function (target) {
      if (!target.taken) {
        return (player = target);
      }
    });

    if (!open || !isNaN(players.me) || stream.state.benched) {
      return;
    }
    window.console.log('claiming', player.num);

    players.me = player.num;

    gun.path(players.me).put({
      taken: true,
      history: {
        0: address
      }
    });

    stream.emit('claim', player.num);
  }

  stream.on('player update', 'approval', 'kill').run(claim);

}());
