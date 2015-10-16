/*globals console, requestAnimationFrame, prompt */
/*jslint plusplus: true */

(function () {
  'use strict';

  var $ = function (s) {
      return document.querySelector(s);
    },
    canvas = $('canvas'),
    ctx = canvas.getContext('2d'),
    yDown = null,
    xDown = null,
    model,
    view,
    controller,
    currentPlayer,
    stopped = false;

  function Player(config) {
    var player = this;

    player.name = config.name;
    player.x = config.x;
    player.y = config.y;
    player.width = 5;
    player.color = config.color || '#505050';
    player.speed = 3;
    player.direction = config.direction;
    player.axis = config.axis;
    player.killed = false;
    player.original = {
      color: player.color,
      speed: player.speed
    };
    player.power = {
      boost: null
    };
    // Must communicate across connected peers
    player.history = [
      {
        x: config.x,
        y: config.y,
        axis: config.axis
      }
    ];
  }

  Player.prototype = {
    constructor: Player,
    toString: function () {
      return (this.name || this.original.color + " Player");
    },

    move: function () {
      var step = this.speed * this.direction;
      this[this.axis] += step;
      return this;
    },

    turn: function (axis, direction) {
      var player = this;
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
      player.history.push({
        axis: player.axis,
        x: player.x,
        y: player.y
      });
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
      console.log((player + " has died").toUpperCase());
      player.unBoost();
      player.blink('transparent').then(function () {
        var newPlayer = controller.setupPlayer();
        model.players.push(newPlayer);
        return (model.player = newPlayer);
      });
      player.speed = 0;
      return this;
    },
    blink: function (color) {
      var player = this,
        black,
        clear,
        callbacks = [];
      player.color = color;
      clear = setInterval(function () {
        player.color = color;
      }, 100);
      setTimeout(function () {
        player.color = 'black';
        black = setInterval(function () {
          player.color = 'black';
        }, 100);
      }, 50);
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
        }
      };
    },

    boost: function () {
      var player = this;
      if (player.power.boost || player.killed) {
        return this;
      }
      player.power.boost = setInterval(function () {
        player.color = '#' + Math.random().toString(16).substr(-6);
      }, 100);

      player.speed = player.speed * 2.5;
      setTimeout(function () {
        if (player.killed) {
          return;
        }
        player.unBoost();
      }, 1000);

      return this;
    },

    unBoost: function () {
      var player = this;
      clearInterval(player.power.boost);
      player.color = player.original.color;
      player.speed = player.original.speed;
      player.power.boost = null;
      return this;
    },

    trail: function () {
      var player = this,
        lastEntry = player.history[player.history.length - 1],
        captureDistance = player.speed * player.direction,
        perpendicular = player.axis === 'x' ? 'y' : 'x',
        range = Math.abs(lastEntry[player.axis] - player[player.axis]),
        line = {
          offset: player[perpendicular],
          owner: player,
          start: 0,
          end: player[player.axis]
        };

      if (range < captureDistance) {
        line.start = lastEntry[player.axis];
      } else {
        line.start = player[player.axis] - captureDistance;
      }
      return line;
    }
  };








  view = {
    color: {
      background: '#f0f0f0',
      player: ['green', 'blue', 'red', 'orange', 'purple']
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
        var start, end, i, lastEntry = player.history.length - 1,
          lastTurn = player.history[lastEntry];

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
        if (line.offset >= trail.start &&
            line.offset <= trail.end) {
          return true;
        }
        if (line.offset <= trail.start &&
            line.offset >= trail.end) {
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
    var call = {
      then: function (callback) {
        target.addEventListener(type, callback);
      }
    };
    if (typeof target === 'string') {
      type = target;
      target = document;
      return call;
    }
    return call;
  }

  controller = {
    init: function () {
      var player;
      canvas.width = 1200;
      canvas.height = 1200;
      view.resize().render();
      player = controller.setupPlayer();
      controller.getPlayers();
      model.players.push(player);
      model.player = player;
      model.movePlayers();
      listen(window, 'resize').then(function () {
        view.resize().render();
      });
      listen('touchstart').then(controller.swipeInput);
      listen('touchmove').then(controller.swipeMove);
      listen('keydown').then(controller.gameInput);
      return this;
    },
    setupPlayer: function (x, y, color) {
      return new Player({
        x: x || 150,
        y: y || 300,
        axis: 'y',
        direction: 1,
        name: localStorage.name || (localStorage.name = prompt("What's your name?")),
        color: color || view.color.player[model.players.length]
      });
    },
    getPlayers: function () {
      var newPlayers = view.color.player.map(function (color, i) {
        var padding = canvas.width / view.color.player.length,
          x = ++i * padding - padding / 2,
          y = canvas.height / 100 * 5;
        return controller.setupPlayer(x, y, color);
      }).filter(function (player) {
        return !!player;
      });
      model.players = model.players.concat(newPlayers);
      model.player = model.players[model.players.length - 1];
      return this;
    },
    gameInput: function (e) {
      var player = model.player,
        arrow,
        axis;
      switch (e.keyCode) {
      case 0:
        return this;
      case 32:
        return player.boost();
      case 65:
        return player.turn('left');
      case 68:
        return player.turn('right');
      case 87:
        return player.turn('up');
      case 83:
        return player.turn('down');
      }
      if (e.key.match(/Arrow/)) {
        arrow = e.key.match(/^Arrow(\w*)$/)[1];
        player.turn(arrow);
      }
      return this;
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
