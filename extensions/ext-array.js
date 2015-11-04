/*globals Gun, console */

(function () {
  'use strict';

  function merge(from, into) {
    Object.keys(from).forEach(function (key) {
      into[key] = from[key];
    });
    return into;
  }

  Gun.chain.array = function (input) {
    var gun = this, arr = [];
    if (!input) {
      gun.val(function (res) {
        console.log(merge(res, []));
      });
      return gun;
    }
    switch (input.constructor) {
    case Array:
      gun.put(merge(input, {}));
      return gun;
    case Function:
      gun.map(function (obj, key) {
        arr[key] = obj;
        input(arr);
      });
      return gun;
    }
    return gun;
  };

}());
