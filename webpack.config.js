/*jslint node: true, nomen: true*/
module.exports = {
	context: __dirname + '/web',
	entry: './index.js',
	output: {
		path: __dirname + '/dist',
		filename: 'bundle.js'
	}
};
