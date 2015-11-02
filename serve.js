/*jslint node: true, nomen: true */
'use strict';
var express = require('express'),
  app = express(),
  port = process.argv[2] || 3000;

app.use(express['static'](__dirname + '/'));

app.listen(port, function () {
  console.log('Listening on port', port);
});
