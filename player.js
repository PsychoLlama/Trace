/*globals Gun, stream */

/*

Find and sync all players
into the local players array

*/


var gun = new Gun('https://gungame.herokuapp.com/gun').get('players'),
  players;

gun.array(players = [
  {
    num: 0
  }, {
    num: 1
  }, {
    num: 2
  }, {
    num: 3
  }
]);


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
    players[number].taken = !!data.taken;

    players[number].history = array(data.history);

    stream.emit('player update', players[number]);
  });


  // subscribe to each player's entries
  players.forEach(function (obj, i) {

    // subscribe to each player's history
    gun.path(i).path('history')
      .map(function (entry, index) {
        var history = players[i].history;
        history[index] = cleaned(entry);
      });

  });
}());
