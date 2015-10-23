/*globals console, requestAnimationFrame, prompt, alert, Gun */
/*jslint plusplus: true */

//(function () {
'use strict';


var canvas = document.querySelector('canvas'),
  ctx = canvas.getContext('2d'),
  yDown = null,
  xDown = null,
  model,
  view,
  controller,
  stopped = false,
  gun;


// Game control shortcuts
Object.defineProperties(window, {
  's': {
    get: function () {
      return (stopped = true);
    }
  },
  'p': {
    get: function () {
      stopped = false;
      return view.loop();
    }
  }
});

function turn(data) {
  return {
    into: function (Type) {
      if (Type instanceof Function) {
        Type = new Type();
      }
      Object.keys(data).forEach(function (key) {
        Type[key] = data[key];
      });
      return Type;
    }
  };
}

localStorage.clear();
gun = new Gun(/*'https://gungame.herokuapp.com/gun'*/)
  .get('example/games/trace')
  .set()
  .put({
    1: {
      num: 1
    },
    2: {
      num: 2
    },
    3: {
      num: 3
    },
    4: {
      num: 4
    }
  });

function Player(player) {
  player = player || {};

  // these are weird
//  player.x = player.x;
//  player.y = player.y;
  player.width = player.width || 5;
  player.color = player.color || view.color.player[model.num];
  player.speed = player.speed || 0.15;
  player.direction = player.direction || 1;
  player.axis = player.axis || 'y';
  player.killed = player.killed || false;
  player.taken = player.taken || false;
  player.turns = player.turns || 0;

//  if (player.history) {
    // THIS LINE IS THE DEVIL
    // IT IS THE THING THAT MAKES ALL UNDEFINED OFFENSES POSSIBLE
    // player.prev = player.history[player.turns];
//  }

  player.last = {
    x: null,
    y: null
  };

  var api = {};
  api.move = function () {
    var prev,
      distance;
    if (!player.history) {
      return api;
    }
    prev = player.history[player.turns];
    if (!prev || Gun.obj.empty(prev)) {
      return api;
    }
    distance = api.getDistance(prev, player.axis);

    // player.last = Gun.obj.copy(player.last);
    api.snapshot(player.last, player);

    player[player.axis] = distance;
    return api;
  };

  api.snapshot = function (historical, operating) {
    historical.x = operating.x;
    historical.y = operating.y;
    return api;
  };

  api.turn = function (axis, direction) {
    var entry;
    if (!model.gun || !model.num || player.killed || player.axis === axis) {
      return api;
    }
    if (!direction) {
      switch (axis) {
      case 'up':
        return api.turn('y', -1);
      case 'down':
        return api.turn('y', 1);
      case 'left':
        return api.turn('x', -1);
      case 'right':
        return api.turn('x', 1);
      default:
        return api;
      }
    }
    model.turns += 1;

    // add an entry to history
    entry = model.makeEntry({
      time: Gun.time.now(),
      axis: player.axis = axis,
      direction: player.direction = direction,
      x: player.x,
      y: player.y
    });

    // So it's not recording the first turn because undefined is an
    // invalid value. An x or y is not set.
    model.gun.put(entry);

    return api;
  };

  api.kill = function () {
    if (!player.history || player.killed) {
      return player;
    }
    player.killed = new Date();
    player.history.push({
      time: Gun.time.now(),
      x: player.x,
      y: player.y
    });
    console.log((player + " has died").toUpperCase());
    player.blink('transparent').then(function () {
      model.joinGame(model.num);
    });
    player.speed = 0;
    return api;
  };

  api.blink = function (color) {
    var callbacks = [],
      black,
      clear = setInterval(function () {
        player.color = color;
      }, 100);

    setTimeout(function () {
      player.color = 'black';
      black = setInterval(function () {
        player.color = 'black';
      }, 100);
    }, 50);
    player.color = color;
    setTimeout(function () {
      clearInterval(clear);
      clearInterval(black);
      player.color = color;
      callbacks.forEach(function (cb) {
        cb(player);
      });
    }, 300);
    return {
      then: function (cb) {
        callbacks.push(cb);
        return this;
      }
    };
  };

  api.trail = function () {
    if (!player.history) {
      return;
    }
    var lastTurn = player.history[player.history.length - 1],
      axis = player.axis,
      perpendicular = axis === 'x' ? 'y' : 'x';

    return {
      offset: player[perpendicular],
      owner: player,
      start: player.last[axis] || lastTurn[axis],
      end: player[axis]
    };
  };

  api.getDistance = function (prev, axis) {
    if (prev.x === undefined || prev.y === undefined) {
      console.log('prev', prev);
      alert("YOU'RE LOSING THE GAME");
      return 150;
    }

    var now = Gun.time.now(),
      elapsed = now - prev.time,
      distance = player.speed * elapsed,
      step = prev[player.axis] + (distance * player.direction);
    return step;
  };

  return api;
}







// View is beatifully self contained.
// No refactoring needed here

view = {
  color: {
    background: '#f0f0f0',
    player: ['green', 'blue', 'red', 'purple']
  },
  loop: function () {
    // RENDERING LOOP

    if (stopped) {
      return;
    }
    model.movePlayers();
    view.render();
    requestAnimationFrame(view.loop);

    return view;
  },
  render: function () {
    // player trails
    view.clear().drawWalls();

    // player head
    Gun.obj.map(model.players, view.drawPlayer);
    return view;
  },

  clear: function () {
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = view.color.background;
    ctx.fill();
    return view;
  },

  resize: function () {
    var width = window.innerWidth,
      height = window.innerHeight;

    if (height > width) {
      // Centering
      canvas.style.left = 0;
      canvas.style.top = (height / 2) - (width / 2);

      canvas.style.width = width + "px";
      canvas.style.height = width + "px";
    } else {
      // Centering
      canvas.style.top = 0;
      canvas.style.left = (width / 2) - (height / 2);

      canvas.style.width = height + "px";
      canvas.style.height = height + "px";
    }
    return view;
  },

  drawPlayer: function (player) {
    var width, offset, color;
    width = player.width || 5;
    offset = width / 2;
    color = player.color || view.color.player[(player.num - 1) || 0];
    ctx.beginPath();
    ctx.rect(player.x - offset, player.y - offset, width, width);
    ctx.fillStyle = color;
    ctx.fill();
    return view;
  },

  drawWalls: function () {
    // BEAUTIFUL FUNCTION
    Gun.obj.map(model.players, function (player, i) {
      if (!player.history || !player.history[0]) {
        return view;
      }
      ctx.beginPath();
      ctx.strokeWidth = 1;
      ctx.strokeStyle = player.color;
      ctx.moveTo(player.history[0].x, player.history[0].y);

      // Objects aren't sorted.
      // This has a potential to fall out of order.
      Gun.obj.map(player.history, function (coord) {
        if (!coord) {
          return view;
        }
        ctx.lineTo(coord.x, coord.y);
      });
      ctx.lineTo(player.x, player.y);
      ctx.stroke();
      ctx.closePath();
    });
    return view;
  }
};




model = {
  waiting: true,
  players: {},
  num: null,
  turns: null,
  movePlayers: function () {

    Gun.obj.map(model.players, function (player) {
      if (player.history && player.history[0]) {
        Player(player).move();
      }
    });

    //model.killCollided();

    return model;
  },

  findLines: function (axis) {
    var lines = [];

    function addLines(start, end, player) {
      if (end.axis !== axis) {
        return;
      }
      var perpendicular = (axis === 'x') ? 'y' : 'x',
        intermediate;
      if (start[axis] > end[axis]) {
        intermediate = start;
        start = end;
        end = intermediate;
      }
      lines.push({
        start: start[axis],
        end: end[axis],
        offset: end[perpendicular],
        owner: player
      });
    }

    model.players.forEach(function (player) {
      var lastEntry = player.history.length - 1,
        lastTurn = player.history[lastEntry],
        start,
        end,
        i;

      for (i = 0; i < lastEntry; i++) {
        start = player.history[i];
        end = player.history[i + 1];

        addLines(start, end, player);
      }
      // Include the current trajectory
      addLines(lastTurn, {
        x: player.x,
        y: player.y,
        axis: player.axis
      }, player);

    });
    return lines;
  },

  killCollided: function () {
    if (!model.player) {
      return;
    }
    var player = model.player,
      outOfBounds = player.x < 0 ||
        player.x > canvas.width ||
        player.y < 0 ||
        player.y > canvas.height,
      perpendicular = player.axis === 'x' ? 'y' : 'x',
      lastEntry = player.history[player.history.length - 1],
      walls = model.findLines(perpendicular),
      collision;

    if (player.killed) {
      return model;
    }

    function alive(line) {
      if (line.owner.killed) {
        return false;
      }
      return true;
    }

    function inPath(line) {
      if (line.start < player[perpendicular] &&
          line.end > player[perpendicular]) {
        return true;
      }
      return false;
    }

    function overlapping(line) {
      var trail = player.trail();
      if (line.offset >= trail.start && line.offset <= trail.end) {
        return true;
      }
      if (line.offset <= trail.start && line.offset >= trail.end) {
        return true;
      }
      return false;
    }

    collision = walls
      .filter(alive)
      .filter(inPath)
      .filter(overlapping)
      .length;

    if (collision || outOfBounds) {
      player.kill();
    }
    return model;
  },

  makeEntry: function (entry) {
    return {
      turns: model.turns,
      history: {
//        [model.turns]: entry
      }
    };
  },

  join: function (player) {
    var coord, entry;
    if (!model.waiting || player.taken) {
      return model;
    }
    // if we've made it this far,
    // we can take a player

    // potential race conditions!
    // possess the player
    model.waiting = false;
    model.num = player.num;
    model.turns = 0;
    model.gun = gun.path(model.num);

    /*
    model.gun.put({
      history: null,
      turns: model.turns
    });*/ //, function() {
    coord = controller.findOpenPosition();
    entry = {
      history: {
        0: coord
      },
      killed: false,
      taken: true,
      turns: model.turns,
      num: model.num
    };

    model.gun.put(entry, function (err, ok) {
      console.log("did we start?", err, ok, entry.history);
      //model.players[model.num].x = coord.x;
      //model.players[model.num].y = coord.y;
    });
    //});

    console.log("You joined the game as player", model.num);
    return model;
  },

  kill: function (player) {
    if (player.killed) {
      if (player.num === model.num) {
        // the player died, give up control
        model.gun.put({
          taken: false
        });
        model.gun = null;
        model.num = null;
        model.turns = null;
        model.waiting = false; // this forces us to reload to start again.
      }
    }
  },
  move: function (player) {
    return model;
  }
};



controller = {
  init: function () {
    gun.synchronous(model.players).map(function (player) {
      if (player.history) {
        console.log("yay history!", player.history);
      } else {
        console.log('no history');
      }

      // DATA LOOP
      model.join(player).move(player).kill(player);

    });

    canvas.width = 1200;
    canvas.height = 1200;
    view.resize().loop();

    controller.listen();

    return controller;
  },

  listen: function () {

    function listen(target, type) {
      if (target.constructor === String) {
        type = target;
        target = document;
      }
      return {
        then: function (callback) {
          target.addEventListener(type, callback);
        }
      };
    }

    listen(window, 'resize').then(function () {
      view.resize().render();
    });
    listen('keydown').then(controller.gameInput);
    listen('keyup').then(controller.unlockKey);
    listen('touchstart').then(controller.swipeInput);
    listen('touchmove').then(controller.swipeMove);
    return controller;
  },

  findOpenPosition: function () {
    return {
      x: 150,
      y: 300,
      axis: 'y',
      direction: 1,
      time: Gun.time.now()
    };
  },

  unlockKey: function (e) {
    model.down = false;
  },

  gameInput: function (e) {
    if (model.down) {
      return;
    }
    model.down = true;
    var player = Player(model.players[model.num]);
    if (!player) {
      return;
    }
    switch (e.keyCode) {
    case 0:
      return;
    case 65:
    case 37:
      return player.turn('left');
    case 68:
      return p;
    case 39:
      return player.turn('right');
    case 87:
    case 38:
      return player.turn('up');
    case 83:
      console.log('For your convenience, master', player);
      return s;
    case 40:
      return player.turn('down');
    }
  },
  swipeInput: function (e) {
    xDown = e.touches[0].clientX;
    yDown = e.touches[0].clientY;
  },
  swipeMove: function (e) {
    if (!xDown || !yDown) {
      return;
    }

    var xUp = e.touches[0].clientX,
      yUp = e.touches[0].clientY,
      xDiff = xDown - xUp,
      yDiff = yDown - yUp,
      player = model.players[model.num];

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0) {
        Player(player).turn('left');
      } else {
        Player(player).turn('right');
      }
    } else {
      if (yDiff > 0) {
        Player(player).turn('up');
      } else {
        Player(player).turn('down');
      }
    }

    xDown = null;
    yDown = null;
  }
};

controller.init();
//}());
