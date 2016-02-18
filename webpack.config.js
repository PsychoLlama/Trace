/*jslint node: true, nomen: true*/
module.exports = {
	context: __dirname + '/web',
	entry: './trace.js',
	output: {
		path: __dirname + '/web',
		filename: 'bundle.js'
	}
};
