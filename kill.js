/*globals me, gun */

var kill;

(function () {
  'use strict';
  kill = function () {
    if (!me) {
      return;
    }
    gun
      .path(String(me))
      .put({
        taken: false,
        history: null
      });

    me = undefined;
  };
}());
