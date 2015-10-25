/*globals stream */

(function () {
  'use strict';
  var xDown, yDown;

  function tie(cb) {
    return {
      to: function (event) {
        document.addEventListener(event, cb);
      }
    };
  }

  function turn(direction) {
    return stream.emit('turn', direction);
  }

  // listen for game input
  function keyboard(e) {
    var axis;
    switch (e.keyCode) {
    case 65:
    case 37:
      return turn('left');
    case 68:
    case 39:
      return turn('right');
    case 87:
    case 38:
      return turn('up');
    case 83:
    case 40:
      return turn('down');
    }
  }




  function touch(e) {
    xDown = e.touches[0].clientX;
    yDown = e.touches[0].clientY;
  }

  function move(e) {
    if (!xDown || !yDown) {
      return;
    }

    var xUp = e.touches[0].clientX,
      yUp = e.touches[0].clientY,
      xDiff = xDown - xUp,
      yDiff = yDown - yUp;

    xDown = null;
    yDown = null;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      return xDiff > 0 ? turn('left') : turn('right');
    } else {
      return yDiff > 0 ? turn('up') : turn('down');
    }
  }


  function resize() {

  }


  tie(keyboard).to('keydown');
  tie(touch).to('touchstart');
  tie(move).to('touchmove');
  tie(resize).to('resize');

}());
