/*jslint node: true, nomen: true*/
'use strict';
var gun, Gun = require('gun');
require('../shared/sync');

var fs = require('fs');
var path = require('path');

try {
	fs.unlinkSync(path.join(__dirname, '../', 'data.json'));
} catch (e) {}

module.exports = new Gun();

