//Dependencies
var fs = require('fs'),
	project = require('./routes/project.js'),
	block = require('./routes/block.js'),
	test = require('./routes/test.js');


//Self executable
module.exports = (function(req, res) {
	//Main
	app.get('/', function(req, res) {
		html = fs.readFileSync(__dirname + '/../public/main.html');

		res.writeHead(200, {
			"Content-Type" : 'text/html'
		});

		res.write(html);
		res.end();
	});

	//Selenium
	app.use('/project', project);
	app.use('/block', block);
	app.use('/test', test);
})();