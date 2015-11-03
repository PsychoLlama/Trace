/*globals Gun, stream */

/*
** Find and sync all players
into the local players array
*/


var gun = new Gun('http://localhost:8080/gun')
  .get('players')
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
  }),
  players = [];

(function () {
  'use strict';

  function cleaned(entry) {
    var meta = '_',
      soul = '#';
    delete entry[meta];
    delete entry[soul];
    return entry;
  }



  function array(obj) {
    var arr = [];
    if (!obj) {
      return arr;
    }
    Object.keys(obj).forEach(function (key) {
      arr[key] = cleaned(obj[key]);
    });
    return cleaned(arr);
  }



  // Subscribe to each player
  gun.map(function (data, number) {
    players[number] = cleaned(data);

    players[number].history = array(data.history);

    stream.emit('player update', players[number]);
  });


  // subscribe to all entries
  (['0', '1', '2', '3']).forEach(function (player) {

    // subscribe to each player's history
    gun.path(player)
      .path('history')
      .map(function (entry, index) {
        var history = players[player].history;
        history[index] = cleaned(entry);
      });

  });
}());
