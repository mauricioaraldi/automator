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

	function getReturn(err, collection) {
		if (err) {
			console.log(err);
		}
	};

	//Create collections
	database.createCollection('project', getReturn);
	database.createCollection('block', getReturn);
	database.createCollection('test', getReturn);

	console.log('\n- - - Database creation finished - - -\n')
});

//- - App Body
//Server initialization
app.listen(3000, function() {
	console.log('\n- - - Server running - - -\n');
});