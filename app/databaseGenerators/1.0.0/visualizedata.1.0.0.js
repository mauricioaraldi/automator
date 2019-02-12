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

	console.log('\n- - - Printing data - - -\n');

	function getReturn(err, result) {
		if (err) {
			console.log(err);
		}
	};

	//Print data

	//Project
	var streamProjects = database.collection('project').find().stream();
	streamProjects.on("data", function(item) { console.log('\n[PROJECT]\n', item); });
	streamProjects.on("end", function() {});

	//Block
	var streamBlocks = database.collection('block').find().stream();
	streamBlocks.on("data", function(item) { console.log('\n[BLOCK]\n', item); });
	streamBlocks.on("end", function() {});

	//Test
	var streamTests = database.collection('test').find().stream();
	streamTests.on("data", function(item) { console.log('\n[TEST]\n', item); });
	streamTests.on("end", function() {});

	console.log('\n- - - All data printed - - -\n');
});

//- - App Body
//Server initialization
app.listen(3000, function() {
	console.log('\n- - - Server running - - -\n');
});