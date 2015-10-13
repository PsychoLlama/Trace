/*globals console, requestAnimationFrame */
/*jslint plusplus: true */

(function () {
  'use strict';

  function Player(color, x, y) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.width = 1;
    this.velocity = 3;
    this.direction = 'x';
    this.history = [{
      x: x,
      y: y
    }];
  }

  Player.prototype = {
    constructor: Player,
    move: function () {
      this[this.direction] += this.velocity;
    },
    turn: function (direction) {
      var player = this,
        velocity = Math.abs(player.velocity),
        setDirection = function (axis, velocity) {
          if (player.direction === axis) {
            return;
          }
          player.direction = axis;
          player.velocity = velocity;

          player.history.push({
            x: player.x,
            y: player.y
          });
        };

      switch (direction.toLowerCase()) {
      case 'up':
        setDirection('y', -velocity);
        break;
      case 'down':
        setDirection('y', velocity);
        break;
      case 'left':
        setDirection('x', -velocity);
        break;
      case 'right':
        setDirection('x', velocity);
        break;
      default:
        return;
      }
    },
    kill: function () {
      this.velocity = 0;
    }
  };

  var $ = function (s, e) {
      return (e || document).querySelector(s);
    },
    canvas = $('canvas'),
    ctx = canvas.getContext('2d'),
    model,
    view,
    controller;

  view = {
    color: {
      background: '#101418',
      player: ['green', 'lightblue', 'red', 'yellow']
    },
    render: function () {
      view.clear();
      view.drawWalls();
      model.players.map(view.drawPlayer);
    },
    clear: function () {
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = view.color.background;
      ctx.fill();
    },
    resizeCanvas: function () {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      view.render();
    },
    drawPlayer: function (player) {
      var offset = player.width / 2;
      ctx.beginPath();
      ctx.rect(player.x - offset, player.y - offset, player.width, player.width);
      ctx.fillStyle = player.color;
      ctx.fill();
    },
    drawWalls: function () {
      model.players.map(function (player, i) {
        ctx.beginPath();
        ctx.strokeWidth = 1;
        ctx.strokeStyle = view.color.player[i];
        ctx.moveTo(player.history[0].x, player.history[0].y);
        player.history.map(function (coord) {
          ctx.lineTo(coord.x, coord.y);
        });
        ctx.lineTo(player.x, player.y);
        ctx.stroke();
        ctx.closePath();
      });
    }
  };

  model = {
    players: [],
    movePlayers: function () {
      model.players.map(function (player) {
        player.move();
        if (model.hasCollided(player)) {
          player.kill();
        }
      });
      view.render();
      requestAnimationFrame(model.movePlayers);
    },
    hasCollided: function (player) {
      var lastPosition = player.history[player.history.length - 1],
        direction = player.direction,
        allWalls = [],
        collision = false;

      model.players.forEach(function (player) {
        var walls = [];
        player.history.sort(function (last, current) {
          var wall = false;
          if (last[direction] === current[direction]) {
            wall = [last[direction], current[direction]];
          }
          if (wall) {
            walls.push(wall);
          }
        });
        allWalls = allWalls.concat(walls);
      });

      allWalls.forEach(function (wall) {
        // TODO: Check to see if there is overlap
      });

      return false;
    }
  };

  controller = {
    init: function () {
      view.resizeCanvas();
      controller.setPlayers();
      window.addEventListener('resize', view.resizeCanvas);
      document.body.addEventListener('keydown', controller.gameInput);
      model.movePlayers();
    },
    setPlayers: function () {
      model.players = view.color.player.map(function (color, i) {
        return new Player(color, 100, ++i * 100);
      });
    },
    gameInput: function (e) {
      var player = model.players[0],
        direction;
      if (e.keyCode === 0) {
        return;
      }
      if (e.key.match(/Arrow/)) {
        direction = e.key.match(/^Arrow(\w*)$/)[1];
        player.turn(direction);
      }
    }
  };

  controller.init();
}());
