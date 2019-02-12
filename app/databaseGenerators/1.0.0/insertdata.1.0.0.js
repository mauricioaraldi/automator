//Dependencies
var express = require('express'),
	MongoClient = require('mongodb').MongoClient,
	Project = require('../../objects/Project.js'),
	Block = require('../../objects/Block.js'),
	Test = require('../../objects/Test.js');

//App initialization
app = express();

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/automator", function(err, database) {
	if(err) {
		console.log('\n! ! ! Database connection error ! ! !\n');
		return;
	}

	console.log('\n- - - Database connection successful - - -\n');

	console.log('\n- - - Inserting data - - -\n');

	function getReturn(err, result) {
		if (err) {
			console.log(err);
		}
	};

	//Insert data

	//Project
	var project1 = new Project('Manager');
	var project2 = new Project('Script Runner');
	var project3 = new Project('Monitor');

	database.collection('project').insert(project1, {w: 1}, function(e, r) { getReturn(e, r); project1 = r.ops[0]; });
	database.collection('project').insert(project2, {w: 1}, function(e, r) { getReturn(e, r); project2 = r.ops[0]; });
	database.collection('project').insert(project3, {w: 1}, function(e, r) { getReturn(e, r); project3 = r.ops[0]; });

	//Block
	var block1 = new Block('Login', project1._id);
	var block2 = new Block('User', project1._id);
	var block3 = new Block('Reports', project1._id);
	var block4 = new Block('Login', project2._id);
	var block5 = new Block('Scripts', project2._id);
	var block6 = new Block('Login', project3._id);
	var block7 = new Block('Server Operations', project3._id);

	database.collection('block').insert(block1, {w: 1}, function(e, r) { getReturn(e, r); block1 = r.ops[0]; });
	database.collection('block').insert(block2, {w: 1}, function(e, r) { getReturn(e, r); block2 = r.ops[0]; });
	database.collection('block').insert(block3, {w: 1}, function(e, r) { getReturn(e, r); block3 = r.ops[0]; });
	database.collection('block').insert(block4, {w: 1}, function(e, r) { getReturn(e, r); block4 = r.ops[0]; });
	database.collection('block').insert(block5, {w: 1}, function(e, r) { getReturn(e, r); block5 = r.ops[0]; });
	database.collection('block').insert(block6, {w: 1}, function(e, r) { getReturn(e, r); block6 = r.ops[0]; });
	database.collection('block').insert(block7, {w: 1}, function(e, r) { getReturn(e, r); block7 = r.ops[0]; });

	//Test
	var test1 = new Test('Login', 'Does a login', block1._id, '');
	var test2 = new Test('Wrong user', 'Tries to log in with wrong user', block1._id, '');
	var test3 = new Test('Wrong pass', 'Tries to log in with wrong pass', block1._id, '');
	var test4 = new Test('Create user', 'Creates a new user on database', block2._id, '');
	var test5 = new Test('Print report', 'Prints a full year report', block3._id, '');
	var test6 = new Test('Login', 'Does a login', block4._id, '');
	var test7 = new Test('Light script', 'Runs a light script', block5._id, '');
	var test8 = new Test('Heavy Script', 'Runs a heavy script', block5._id, '');
	var test9 = new Test('Login', 'Does a login', block6._id, '');
	var test10 = new Test('Start all', 'Start all servers', block7._id, '');
	var test11 = new Test('Stop all', 'Stop all servers', block7._id, '');

	database.collection('test').insert(test1, {w: 1}, function(e, r) { getReturn(e, r); test1 = r.ops[0]; });
	database.collection('test').insert(test2, {w: 1}, function(e, r) { getReturn(e, r); test2 = r.ops[0]; });
	database.collection('test').insert(test3, {w: 1}, function(e, r) { getReturn(e, r); test3 = r.ops[0]; });
	database.collection('test').insert(test4, {w: 1}, function(e, r) { getReturn(e, r); test4 = r.ops[0]; });
	database.collection('test').insert(test5, {w: 1}, function(e, r) { getReturn(e, r); test5 = r.ops[0]; });
	database.collection('test').insert(test6, {w: 1}, function(e, r) { getReturn(e, r); test6 = r.ops[0]; });
	database.collection('test').insert(test7, {w: 1}, function(e, r) { getReturn(e, r); test7 = r.ops[0]; });
	database.collection('test').insert(test8, {w: 1}, function(e, r) { getReturn(e, r); test8 = r.ops[0]; });
	database.collection('test').insert(test9, {w: 1}, function(e, r) { getReturn(e, r); test9 = r.ops[0]; });
	database.collection('test').insert(test10, {w: 1}, function(e, r) { getReturn(e, r); test10 = r.ops[0]; });
	database.collection('test').insert(test11, {w: 1}, function(e, r) { getReturn(e, r); test11 = r.ops[0]; });

	console.log('\n- - - Test data inserted - - -\n');
});

//- - App Body
//Server initialization
app.listen(3000, function() {
	console.log('\n- - - Server running - - -\n');
});