/*globals stream */

(function () {
  'use strict';
  var xDown, yDown, turn = stream.bind('turn'),
    canvas = document.querySelector('canvas');

  function tie(cb) {
    return {
      to: function (event, target) {
        (target || document).addEventListener(event, cb);
      }
    };
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
    var width = window.innerWidth,
      height = window.innerHeight;

    if (height > width) {
      // Centering
      canvas.style.left = 0;
      canvas.style.top = (height / 2) - (width / 2) + 'px';

      canvas.style.width = width + "px";
      canvas.style.height = width + "px";
    } else {
      // Centering
      canvas.style.top = 0;
      canvas.style.left = (width / 2) - (height / 2) + 'px';

      canvas.style.width = height + "px";
      canvas.style.height = height + "px";
    }
  }


  tie(keyboard).to('keydown');
  tie(touch).to('touchstart');
  tie(move).to('touchmove');
  tie(resize).to('resize', window);
  // initial canvas sizing
  resize();

}());
