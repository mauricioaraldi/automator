//Dependencies
var express = require('express'),
	MongoClient = require('mongodb').MongoClient;

//App initialization
app = express();

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/automator", function(err, database) {
	if(err) {
		console.log('\n! ! ! Database connection error ! ! !\n');
		return;
	}

	console.log('\n- - - Database connection successful - - -\n');

	console.log('\n- - - Droping database - - -\n');

	function getReturn(err, result) {
		if (err) {
			console.log(err);
		}
	};

	//Print data
	database.dropDatabase();

	console.log('\n- - - Droping database successful - - -\n');
});

//- - App Body
//Server initialization
app.listen(3000, function() {
	console.log('\n- - - Server running - - -\n');
});