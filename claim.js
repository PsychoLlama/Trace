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

  function claim(player) {
    if (player.taken || players.me !== undefined || stream.state.benched) {
      return;
    }

    players.me = player.num;
    var address = new Address();

    gun.path(String(players.me)).put({
      taken: true,
      history: {
        0: address
      }
    });
  }

  stream.on('player update', 'approval').run(claim);

}());
