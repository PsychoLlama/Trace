# gaming
No frills p2p gaming server.

**Please send us your game! We'd love to list it and help advertise it!**

Deploy your own with:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

And then connect to it from any page via:

```html
<html>
  <head>
    <script src="https://rawgit.com/amark/gun/master/gun.js"></script>
    <script src="https://rawgit.com/amark/gun/master/lib/nts.js"></script>
    <script>
      // You can use this gaming server for testing, but please run your own!
      var gun = Gun("https://gungame.herokuapp.com/gun");
      var game = gun.get("your-alias/your-game-name");
    </script>
  </head>
</html>
```

**Note**: It is important to include the `nts.js` library with gun for gaming, it synchronizes the clocks of connected devices.

You might also find the [synchronous](https://github.com/gundb/synchronous) extension helpful for building games. You don't want to be making async calls on every frame.
