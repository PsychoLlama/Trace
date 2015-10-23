/*globals Gun, me, hijack */
var gun, players;

(function () {
  'use strict';

  gun = new Gun('http://localhost:8080/gun')
    .get('players').set()
    .put({
      0: {
        num: 0
      },
      1: {
        num: 1
      },
      2: {
        num: 2
      },
      3: {
        num: 3
      }
    });

  players = [];

  function cleaned(entry) {
    var meta = '_',
      soul = '#';
    delete entry[meta];
    delete entry[soul];
    return entry;
  }

  // Subscribe to each player
  gun.map(function (player, number) {

    players[number] = cleaned(player);
    players[number].history = [];

    if (!player.taken && !me) {
      hijack(number);
    }
  });


  // subscribe to all entries
  ([0, 1, 2, 3]).forEach(function (player, number) {

    // subscribe to each player's history
    gun
      .path(number + '.history')
      .map(function (entry, logNum) {
        players[number].history[logNum] = cleaned(entry);
      });

  });
}());
