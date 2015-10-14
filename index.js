/*globals console, requestAnimationFrame */
/*jslint plusplus: true */

/*********************************************************
** Line start is sometimes measured out of order:
** Sometimes start > end
** My code assumes the opposite
** Meaning collisions don't always happen when they should
**********************************************************/

/*********************************************************
** Kill order needs to be determined based on how close
** the head is to the collision.
** Right now, kill order is based on the position of the
** player in the model.players array.
** This means that sometimes, the wrong player is killed.
**********************************************************/

(function () {
  'use strict';

  function Player(color, x, y) {
    var axis = 'x',
      player = this;
    
    player.x = x;
    player.y = y;
    player.width = 0;
    player.color = color;
    player.speed = 1;
    player.original = {
      speed: player.speed,
      color: player.color
    };
    player.direction = 1;
    player.axis = axis;
    player.killed = false;
    player.power = {
      boost: null
    };
    player.history = [{
      x: x,
      y: y,
      axis: axis
    }];
  }

  Player.prototype = {
    constructor: Player,
    toString: function () {
      return "Player " + this.original.color;
    },
    move: function () {
      var step = this.speed * this.direction;
      this[this.axis] += step;
      return this;
    },
    turn: function (axis, direction) {
      var player = this;
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
      console.log((player + " is dead").toUpperCase());
      player.unBoost();
      player.speed = 0;
      return this;
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
      }, 3000);

      return this;
    },
    unBoost: function () {
      var player = this;
      clearInterval(player.power.boost);
      player.color = player.original.color;
      player.speed = player.original.speed;
      player.power.boost = null;
      return this;
    }
  };

  var $ = function (s, e) {
      return (e || document).querySelector(s);
    },
    canvas = $('canvas'),
    ctx = canvas.getContext('2d'),
    model,
    view,
    controller,
    stopped = false;

  view = {
    color: {
      background: '#101418',
      player: ['green', 'blue', 'red', 'yellow']
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
    resizeCanvas: function () {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      view.render();
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
      model.testForCollisions();
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
        var opposite = (axis === 'x') ? 'y' : 'x',
          intermediate;
        if (start[axis] > end[axis]) {
          intermediate = start;
          start = end;
          end = intermediate;
        }
        lines.push({
          start: start[axis],
          end: end[axis],
          offset: end[opposite],
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
    testForCollisions: function () {
      var lines = {
        x: model.findLines('x'),
        y: model.findLines('y')
      };

      model.players.forEach(function (player) {
        if (player.killed) {
          return this;
        }
        //      if (player.y === 199) {
        //        debugger;
        //      }
        var perpendicular = player.axis === 'x' ? 'y' : 'x',
          lastEntry = player.history.length - 1,
          collision = lines[perpendicular].filter(function (line) {
            if (line.owner.killed) {
              return false;
            }
            var isAfterBeginning = line.start < player[perpendicular],
              isBeforeEnd = line.end > player[perpendicular],
              isInWay = isAfterBeginning && isBeforeEnd,

              trajectoryBeginsBeforeLine = player.history[lastEntry][player.axis] < line.offset,
              trajectoryEndsAfterLine = player[player.axis] > line.offset,
              isOverlapping = trajectoryBeginsBeforeLine && trajectoryEndsAfterLine;

            return isInWay && isOverlapping;
          });

        if (collision.length !== 0) {
          player.kill();
        }
      });
      return this;
    }
  };


  controller = {
    init: function () {
      view.resizeCanvas();
      controller.setPlayers();
      model.movePlayers();
      window.addEventListener('resize', view.resizeCanvas);
      document.body.addEventListener('keydown', controller.gameInput);
      return this;
    },
    setPlayers: function () {
      model.players = view.color.player.map(function (color, i) {
        return new Player(color, 100, ++i * 100);
      });
      return this;
    },
    gameInput: function (e) {
      var player = model.players[3],
        arrow,
        axis;
      if (e.keyCode === 0) {
        return this;
      }
      if (e.keyCode === 32) {
        player.boost();
      }
      if (e.key.match(/Arrow/)) {
        arrow = e.key.match(/^Arrow(\w*)$/)[1];

        switch (arrow.toLowerCase()) {
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
      return this;
    }
  };

  controller.init();
}());
