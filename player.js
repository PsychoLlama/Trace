/*globals Gun, stream */
/*jslint nomen: true */

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
    delete entry._;
    delete entry['#'];
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


  // subscribe to each player's status
  gun.map(function (data, number) {
    if (!players[number]) {
      return;
    }
    players[number].taken = !!data.taken;
  });

  // wait until we're fairly certain that
  // we've got current information
  // before trying to grab a player
  setTimeout(function () {
    stream.emit('player update');
  }, 5000);



  // subscribe to each player's entries
  players.forEach(function (obj, i) {


    // subscribe to each player's history
    gun.path(i).path('history')
      .map(function (entry, index) {
        var player = players[i];
        if (!player.history || player.history.constructor === Object) {
          player.history = array(player.history);
        }
        players[i].history[index] = cleaned(entry);
      });


    // handle empty history
    gun.path(i).map(function () {

      this.path('history').val(function (val) {
        if (val === null) {
          // the history has been nulled
          players[i].history = [];
        }
      });

    });


  });

}());
