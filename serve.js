/*jslint node: true, nomen: true */
'use strict';
var express = require('express'),
  app = express();

app.use(express['static'](__dirname + '/'));

app.listen(3000, function () {
  console.log('Listening on port 3000');
});
