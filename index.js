/*globals console, requestAnimationFrame, prompt, Gun */
/*jslint plusplus: true */

(function () {
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
        Object.keys(data).forEach(function (key) {
          Type[key] = data[key];
        });
        return Type;
      }
    };
  }




  gun = new Gun('http://localhost:8081/gun')
    .get('example/games/trace');


  //stopped = true;


  function Player(coord) {
    coord = coord || {};
    var player = this;

    player.x = coord.x || 100;
    player.y = coord.y || 100;
    player.width = 5;
    player.color = '#505050';
    player.speed = 0.15;
    player.direction = 1;
    player.axis = coord.axis || 'y';
    player.killed = false;
    player.last = {
      x: player.x,
      y: player.y
    };
    player.original = {
      color: player.color,
      speed: player.speed
    };
  }

  Player.prototype = {
    constructor: Player,
    toString: function () {
      return (this.name || this.original.color + " Player");
    },

    move: function () {
      //    debugger;
      var player = this,
        distance = player.getDistance();
      player.last[player.axis] = player[player.axis];
      player[player.axis] = distance;
      return this;
    },

    turn: function (axis, direction) {
      var player = this,
        turn;
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
      turn = {
        time: new Date().getTime(),
        axis: player.axis,
        x: player.x,
        y: player.y
      };
      player.history.push(turn);
      player.emit(turn);
      player.last.x = null;
      player.last.y = null;
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
        time: new Date().getTime(),
        x: player.x,
        y: player.y
      });
      console.log((player + " has died").toUpperCase());
      player
        .blink('transparent')
        .then(controller.replacePlayer);
      player.speed = 0;
      player.erase();
      return this;
    },

    erase: function () {
      var player = this,
        num = model.playerNum(player),
        nullify = {};
      nullify[num] = null;
      gun.put(nullify);
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
      var entry = this.history[this.history.length - 1],
        now = new Date().getTime(),
        lastTime = entry.time,
        elapsed = now - lastTime,
        distance = this.speed * elapsed,
        step = entry[this.axis] + (distance * this.direction);
      if (isNaN(step)) {
        return this.last[this.axis];
      }
      return step;
    },

    emit: function (entry) {
      var player = model.playerNum(model.player),
        last = this.history.length - 1,
        log = {};
      log[last] = entry;

      gun.path(String(player)).path('history').put(log);
      return this;
    }
  };







  view = {
    color: {
      background: '#f0f0f0',
      player: ['green', 'blue', 'red', 'purple']
    },
    render: function () {
      view.clear().drawWalls().drawWalls().drawWalls();
      model.players.map(view.drawPlayer);
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
      model.players.map(function (player, i) {
        ctx.beginPath();
        ctx.strokeWidth = 1;
        ctx.strokeStyle = player.color;
        ctx.moveTo(player.history[0].x, player.history[0].y);
        player.history.map(function (coord) {
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
    me: Math.random().toString(36).split('.')[1],
    players: [],
    movePlayers: function () {
      if (stopped) {
        return;
      }
      model.killCollided();
      model.players.forEach(function (player) {
        player.move();
      });

      view.render();
      requestAnimationFrame(model.movePlayers);
      return this;
    },

    playerNum: function (query) {
      var num = null;
      model.players.forEach(function (player, i) {
        if (player === query) {
          num = i;
        }
      });
      return num;
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
      canvas.width = 1200;
      canvas.height = 1200;
      view
        .resize()
        .render();
      controller
        .getPlayers()
        .checkQueue()
        .listen();

      // rendering loop
      model.movePlayers();
      return this;
    },

    checkQueue: function () {
      var i,
        player;
      // for each player
      for (i = 0; i < 4; i++) {
        player = model.players[i];
        if (!player || player.killed) {
          controller.replacePlayer(i);
        }
      }
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

    setupPlayer: function (index) {
      function getName() {
        var name = prompt("What's your name?");
        localStorage.name = name;
        return name;
      }
      var color = view.color.player[index],
        coord = controller.findOpenPosition(),
        player = turn({
          direction: 1,
          name: localStorage.name || getName(),
          color: color,
          history: [{
            time: new Date().getTime(),
            axis: coord.axis,
            x: coord.x,
            y: coord.y
          }]
        }).into(new Player(coord));
      return player;
    },

    getPlayers: function () {
      gun.map(function (player, index) {
        if (!player) {
          return;
        }
        // each player
        var ref = this;
        player.history = [];

        // Reconstruct the player
        ref.path('last', function (err, entry) {
          player.last = entry;
          ref.path('original', function (err, original) {
            player.original = original;
            ref.path('history').map(function (entry, i) {
              player.history[i] = entry;
              player = turn(player).into(Player);
              model.player = player;
              model.players[index] = player;
            });
          });
        });
      });
      return this;
    },

    replacePlayer: function (index) {
      index = (index.constructor === Number) ? index : model.playerNum(index);
      var player = controller.setupPlayer(index);

      // Que system?

      model.players[index] = player;
      model.player = player;
      controller.exportPlayer(player);
      return this;
    },

    exportPlayer: function (player) {
      // Copy, mutate and export player
      var index = model.playerNum(player),
        playerCopy = turn(player).into(Player);
      if (index === null) {
        return;
      }
      playerCopy.history = turn(playerCopy.history).into(Object);
      gun.path(String(index)).put(playerCopy);
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
}());
