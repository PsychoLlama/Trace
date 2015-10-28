/*globals Gun, stream */
var gun, players;

(function () {
  'use strict';

  gun = new Gun('https://gungame.herokuapp.com/gun')
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


  // Sometimes this function fails
  // and ends up overwriting existing history
  function hasHistory(number) {
    var history,
      player = players[number];
    if (!player || player.history) {
      return false;
    }
    history = player.history;
    if (!history) {
      return false;
    }
    if (history.constructor !== Array) {
      return false;
    }
    return true;
  }



  // Subscribe to each player
  gun.map(function (data, number) {
    players[number] = cleaned(data);

    var history = hasHistory(number);

    if (!history) {
      players[number].history = [];
    }

    stream.emit('player update', players[number]);
  });


  // subscribe to all entries
  (['0', '1', '2', '3']).forEach(function (player) {

    // subscribe to each player's history
    gun.path(player)
      .path('history')
      .map(function (entry, index) {
        players[player]
          .history[index] = cleaned(entry);
      });

  });
}());
