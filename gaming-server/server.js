var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 80;

var Gun = require('gun');
var gun = Gun({
	file: false,
	hooks: {put: function(g,cb){
		cb("Gaming server is in memory only.");
	}}
});

var server = require('http').createServer(function(req, res){
	if(gun.server(req, res)){
		return; // filters gun requests!
	}
	require('fs').createReadStream(require('path').join(__dirname, req.url)).on('error',function(){ // static files!
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(require('fs').readFileSync(require('path').join(__dirname, 'index.html'))); // or default to index
	}).pipe(res); // stream
});
gun.attach(server);
server.listen(port);

console.log('Server started on port ' + port + ' with /gun');
