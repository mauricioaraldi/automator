//Dependencies
var router = require('express').Router(),
	utils = require('../utils.js'),
	scriptUtils = require('../scriptUtils.js'),
	webdriver = require('selenium-webdriver'),
	Firefox = require('selenium-webdriver/firefox'),
	Options = Firefox.Options;

//Module routes

/**
 * Save a test on database
 *
 * @author mauricio.araldi
 * @since 23/07/2015
 *
 * @path /test/save
 */
router.post('/save', function(req, res) {
	//Parse IDs
	var test = req.body.test;
	test._id = ObjectId(test._id);
	test.block_id = ObjectId(test.block_id);

	db.collection('test').save(test, {w: 1}, 
		function(err, result) { 
			if (err) {
				res.send(err);
				return;
			}

			res.send(result);
		}
	);
});

/**
 * Bring a test from DB as Full Object
 *
 * @author mauricio.araldi
 * @since 24/07/2015
 *
 * @path /test/getFullObjectById
 */
router.get('/getFullObjectById', function(req, res) {
	//Searches for the test
	db.collection('test').findOne({_id: ObjectId(req.query.testId)}, function(err, test) {
		//Communication error
		if (err) {
			res.send(err);
			return;
		}

		//Test not found
		if (!test) {
			res.send('Test not found');
			return;
		}

		//Searches for the block
		db.collection('block').findOne({_id: ObjectId(test.block_id)}, function(err, block) {
			//Communication error
			if (err) {
				res.send(err);
				return;
			}

			//Block not found
			if (!block) {
				res.send('Block not found');
				return;
			}

			//Searches for the project
			db.collection('project').findOne({_id: ObjectId(block.project_id)}, function(err, project) {
				//Communication error
				if (err) {
					res.send(err);
					return;
				}

				//Project not found
				if (!project) {
					res.send('Project not found');
					return;
				}

				//Unite objects
				test.block = block;
				test.project = project;

				//Respond
				res.send(test);
			});
		});
	});
});

/**
 * Removes a test
 *
 * @author mauricio.araldi
 * @since 27/07/2015
 *
 * @route /test/remove
 */
router.put('/remove', function(req, res) {
	var testId = req.body.testId;

	//Removes test
	db.collection('test').remove({_id: ObjectId(testId)}, true, function(err, nDocs) {
		var nTestsRemoved = nDocs.result;

		if (err) {
			res.send(err);
			return;
		}

		if (nTestsRemoved.n) {
			res.send(nTestsRemoved);
		} else {
			res.send('No block removed');
			return;
		}
	});
});

/**
 * Runs a test
 *
 * @author mauricio.araldi
 * @since 28/07/2015
 *
 * @route /test/run
 */
router.get('/run', function(req, res) {
	var testId = req.query.testId;

	//Searches for the test
	db.collection('test').findOne({_id: ObjectId(testId)}, function(err, test) {
		var options = new Options().setProfile(FIREFOX_PROFILE),
			builder, driver;

		if (FIREFOX_PATH) {
			options.setBinary(FIREFOX_PATH);
		}

		if (FIREFOX_VERSION && FIREFOX_VERSION < 47) {
			options.useGeckoDriver(false);
		}

		builder = new webdriver.Builder().setFirefoxOptions(options),
		driver = builder.forBrowser('firefox', FIREFOX_VERSION).build();

		//Communication error
		if (err) {
			res.send(err);
			return;
		}

		//Test not found
		if (!test) {
			res.send('Test not found');
			return;
		}

		//Retrieve steps
		var stepsWithoutInterval = scriptUtils.retrieveIDEScriptSteps(test.script),
			responseSent = false,
			steps = [];

		//Add intervals
		stepsWithoutInterval.forEach(function(step, index) {
			steps.push(step);

			if (index != stepsWithoutInterval.length -1) {
				steps.push({instruction: 'pause', target: '', value: STEPS_INTERVAL.toString()});
			}
		});

		//Run steps
		steps.forEach(function(step, index) {
			if (index == steps.length - 1) {
				scriptUtils.executeIDEScriptStep(driver, step).then(
					function(result) {
						//Grants that there will always be an object
						// result = typeof result == 'object' ? result : {result: result};

						if (responseSent) { return; }

						res.send({testStatus: 1});
						driver.quit();
					},
					function(err) {
						if (responseSent) { return; }

						//Grants that there will always be an object
						err = typeof err == 'object' ? err : {err: err};

						//Verifies if the err is an exception
						err = err.name ? {message: err.message} : err;

						err.testStatus = 0;
						err.step = step;

						res.send(err);
						driver.quit();
					}
				)
			} else {
				scriptUtils.executeIDEScriptStep(driver, step).then(null,
					function(err) {
						if (responseSent) { return; }

						//Grants that there will always be an object
						err = typeof err == 'object' ? err : {err: err};

						//Verifies if the err is an exception
						err = err.name ? {message: err.message} : err;

						err.testStatus = 0;
						err.step = step;

						res.send(err);
						driver.quit();

						responseSent = true;
					}
				);
			}
		});
	});
});

//Module export
module.exports = router;