/**************************************************************
***************************************************************
** Automator, tests and tasks automations
**
** A project by Mauricio Araldi
**
** All rights reserved (CC). 
** Do not redistribute without authorization.
** This project is under GNU General Public License 3.0
***************************************************************
**************************************************************/

//- - App Head

//Dependencies
var express = require('express'),
    MongoClient = require('mongodb').MongoClient,
    bodyParser = require('body-parser');

//Global dependencies
db = null;
ObjectId = require('mongodb').ObjectID;
FIREFOX_PATH = '/firefox24esr/firefox-bin';
FIREFOX_VERSION = 24;
FIREFOX_PROFILE = __dirname + '/../profiles/firefox/';
STEPS_INTERVAL = 200;

//App initialization
app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Static Path
app.use(express.static(__dirname + '/../public'));

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/automator", function(err, database) {
	if(err) {
		console.log('\n! ! ! Database connection error ! ! !\n');
		return;
	}

	db = database;

	console.log('\n- - - Database connection successful - - -\n');
});

//- - App Body

//Routing
require('./routes');

//Server initialization
app.listen(3000, function() {
	console.log('\n- - - Server running - - -\n');
})