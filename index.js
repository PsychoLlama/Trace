/*globals console, requestAnimationFrame, prompt, Gun */
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
      return model.movePlayers();
    }
  }
});

function turn(data) {
  return {
    into: function (Type) {
      if (Type instanceof Function) {
        Type = new Type();
      }
      return this.merge(Type);
    },
    merge: function (target) {
      Object.keys(data).forEach(function (key) {
        Type[key] = data[key];
      });
      return
    }
  };
}




gun = new Gun('https://gungame.herokuapp.com/gun')
  .get('example/games/trace').set().put({
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


//stopped = true;


function Player(coord) {
  coord = coord || {};
  var player = this;

  player.x = coord.x || 100;
  player.y = coord.y || 100;
  player.width = 5;
  player.color = view.color.player[model.playerNum];
  player.speed = 0.15;
  player.direction = coord.direction || 1;
  player.axis = coord.axis || 'y';
  player.killed = coord.killed || false;
  player.taken = coord.taken || false;
  player.time = coord.time || Gun.time.now();
  player.last = {
    x: player.x,
    y: player.y,
    time: player.time
  };
  player.original = {
    color: player.color
  };
  player.history = coord.history || {};
  player.history[0] = (coord.history || {})[0] || player.last;
}

Player.prototype = {
  constructor: Player,
  toString: function () {
    return (this.name || this.original.color + " Player");
  },
  move: function () {
    var player = this,
      distance = player.getDistance();
    player.last[player.axis] = player[player.axis];
    player[player.axis] = distance;
    return this;
  },

  turn: function (axis, direction) {
    if (!model.me.taken) {
      return this
    }
    var player = this,
      entry;
    if (player.killed) {
      return;
    }
    if (axis.length !== 1) {
      switch (axis.toLowerCase()) {
      case 'up':
        return player.turn('y', -1);
      case 'down':
        return player.turn('y', 1);
      case 'left':
        return player.turn('x', -1);
      case 'right':
        return player.turn('x', 1);
      default:
        return this;
      }
    }
    if (player.axis === axis) {
      return this;
    }
    entry = {
      time: Gun.time.now(),
      axis: player.axis,
      x: player.x,
      y: player.y
    };
    model.emit(entry);
    player.last.x = player.x;
    player.last.y = player.y;
    player.direction = direction;
    player.axis = axis;
    return this;
  },

  kill: function () {
    var player = this;
    if (player.killed) {
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
      model.joinGame(model.playerNum);
    });
    player.speed = 0;
    return this;
  },

  blink: function (color) {
    var player = this,
      callbacks = [],
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
  },

  trail: function () {
    var player = this,
      lastTurn = player.history[player.history.length - 1],
      axis = player.axis,
      perpendicular = axis === 'x' ? 'y' : 'x';

    return {
      offset: player[perpendicular],
      owner: player,
      start: player.last[axis] || lastTurn[axis],
      end: player[axis]
    };
  },

  getDistance: function () {
    var entry = this.history[0], // TODO: THIS SHOULD NOT BE HARD CODED!
      now = Gun.time.now(),
      lastTime = entry.time,
      elapsed = now - lastTime,
      distance = this.speed * elapsed,
      step = entry[this.axis] + (distance * this.direction);
    return step;
  }
};







// View is beatifully self contained.
// No refactoring needed here
view = {
  color: {
    background: '#f0f0f0',
    player: ['green', 'blue', 'red', 'purple']
  },

  render: function () {
    view.clear().drawWalls().drawWalls().drawWalls();
    //model.players.map(view.drawPlayer);
    Gun.obj.map(model.gunPlayers, view.drawPlayer);
    return this;
  },

  clear: function () {
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = view.color.background;
    ctx.fill();
    return this;
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
    return this;
  },

  drawPlayer: function (player) {
    var offset = player.width / 2;
    ctx.beginPath();
    ctx.rect(player.x - offset, player.y - offset, player.width, player.width);
    ctx.fillStyle = player.color;
    ctx.fill();
    return this;
  },

  drawWalls: function () {
    Gun.obj.map(model.gunPlayers, function (player, i) {
      //model.players.map(function (player, i) {
      if (!player.history) {
        return;
      }
      ctx.beginPath();
      ctx.strokeWidth = 1;
      ctx.strokeStyle = player.color;
      ctx.moveTo(player.history[0].x, player.history[0].y);
      Gun.obj.map(player.history, function (coord) {
        ctx.lineTo(coord.x, coord.y);
      });
      ctx.lineTo(player.x, player.y);
      ctx.stroke();
      ctx.closePath();
    });
    return this;
  }
};




model = {
  players: [],
  me: {},
  gunPlayers: {},
  playerNum: NaN,
  movePlayers: function () {

    // MAIN LOOP

    if (stopped) {
      return;
    }
    Gun.obj.map(model.gunPlayers, function (player) {
      //console.log("gun players:", player);
      if (true || player.history.length) {
        var p = new Player(player);
        p.move();
      }
    });
    model.killCollided();

    view.render();
    requestAnimationFrame(model.movePlayers);
    return this;
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
      return this;
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
    return this;
  },

  emit: function (entry) {
    if (!model.me.taken) return;
    // Find current player
    // Push out an update based on it
    var submission = {
        history: {}
      },
      player = model.playerNum,
      logs = model.players[player].history,
      entryNum = logs.length;

    //submission[player] = {};
    //submission[player][entryNum] = entry;
    submission.history[0] = entry;
    model.me.put(submission);
    return this;
  },

  joinGame: function (index) {
    model.playerNum = index;

    var coord = controller.findOpenPosition(),
      player = new Player(coord);

    model.players[index] = player;
    model.player = model.players[index];

    model.emit({
      x: player.x,
      y: player.y,
      axis: player.axis,
      time: Gun.time.now()
    });
    return model.player;
  }
};





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

controller = {
  init: function () {
    gun.synchronous(model.gunPlayers).map(function (player, num) {
      console.log("player update", player);
      // If there is an open spot
      if (!model.me.taken && !player.taken) {
        model.me = this;
        model.me.taken = true;
        var p = model.joinGame(num);
        model.me.put({
          x: p.x,
          y: p.y,
          direction: p.direction,
          axis: p.axis,
          killed: p.killed,
          taken: true,
          time: Gun.time.now()
        });
      }
      if (model.playerNum != num && !model.players[num] && player.taken) {
        console.log("New player as joined the game!", player);
        model.players[num] = new Player(controller.findOpenPosition());
      }
    });
    canvas.width = 1200;
    canvas.height = 1200;
    view.resize().render();
    controller.getPlayers().listen();

    // rendering loop
    model.movePlayers();
    return this;
  },

  listen: function () {
    listen(window, 'resize').then(function () {
      view.resize().render();
    });
    listen('touchstart').then(controller.swipeInput);
    listen('touchmove').then(controller.swipeMove);
    listen('keydown').then(controller.gameInput);
    return this;
  },

  getPlayers: function () {
    return this;
    gun.map(function (player, index) {
      // NOTE: val only executes once
      // we'll need to figure out when a player dies
      // each player
      if (player === null) {
        // someone died
        model.players[index] = new Player(controller.findOpenPosition());
      }
      // get all the history entries
      this.map(function (entry, i) {
        //          console.log('Player', model.playerNum, 'has been updated to', entry);
        model.players[index].history[0] = entry;
      });
    });

    return this;
  },

  findOpenPosition: function () {
    return {
      x: 150,
      y: 300,
      axis: 'y'
    };
  },

  gameInput: function (e) {
    var player = model.player,
      arrow,
      axis;
    if (!model.player) {
      return;
    }
    switch (e.keyCode) {
    case 0:
      return;
    case 65:
    case 37:
      return player.turn('left');
    case 68:
    case 39:
      return player.turn('right');
    case 87:
    case 38:
      return player.turn('up');
    case 83:
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
      yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0) {
        model.player.turn('left');
      } else {
        model.player.turn('right');
      }
    } else {
      if (yDiff > 0) {
        model.player.turn('up');
      } else {
        model.player.turn('down');
      }
    }

    xDown = null;
    yDown = null;
  }
};

controller.init();
//}());
