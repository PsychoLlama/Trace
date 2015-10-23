/*globals render, players, gun */

var me, hijack;

(function () {
  'use strict';

  function Spot() {
    this.x = 200;
    this.y = 200;
    this.axis = 'y';
    this.direction = 1;
    this.time = new Date().getTime();
  }

  hijack = function (number) {
    var position = new Spot();

    gun
      .path(String(number))
      .put({
        taken: true,
        history: {
          0: position
        }
      });

    me = number;
  };
}());
