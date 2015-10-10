/*globals console, requestAnimationFrame */
/*jslint plusplus: true */

(function () {
  'use strict';

  function Player(color, x, y) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.width = 1;
    this.velocity = 1;
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
      if (!direction) {
        return;
      }
      direction = direction.toLowerCase();
      var player = this,
        velocity = Math.abs(player.velocity),
        playerMoved = true,
        setDirection = function (axis, velocity) {
          if (player.direction === axis) {
            return;
          }
          player.direction = axis;
          player.velocity = velocity;
        };
      switch (direction) {
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
        playerMoved = false;
        return;
      }
      playerMoved = playerMoved && player.history.push({
        x: player.x,
        y: player.y
      });
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
      model.movePlayers();
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
      var last = player.history.length - 1,
        lastPosition = player.history[last],
        direction = player.direction;

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
      var player = model.players[0];
      if (e.keyCode === 0) {
        return;
      }
      if (e.key.match(/Arrow/)) {
        model.players.map(function (player) {
          player.turn(e.key.match(/^Arrow(\w*)$/)[1]);
        });
      }
    }
  };

  controller.init();
}());