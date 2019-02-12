//Dependencies
var router = require('express').Router(),
	utils = require('../utils.js');

//Module routes

/**
 * Search database for all projects
 *
 * @author mauricio.araldi
 * @since 23/07/2015
 *
 * @path /project/loadAll
 */
router.get('/loadAll', function(req, res) {
	utils.loadProjects(function(data) {
		res.send(data);
	});
});

/**
 * Search database for all projects, blocks and tests
 *
 * @author mauricio.araldi
 * @since 23/07/2015
 *
 * @path /project/loadAllWithTests
 */
router.get('/loadAllWithTests', function(req, res) {
	var projects, blocks, tests;

	utils.loadTests(false, function(data) {
		tests = data;

		if (projects && blocks && tests) {
			res.send(parseFullObject(projects, blocks, tests));
		}
	});

	utils.loadBlocks(function(data) {
		blocks = data;

		if (projects && blocks && tests) {
			res.send(parseFullObject(projects, blocks, tests));
		}
	});

	utils.loadProjects(function(data) {
		projects = data;

		if (projects && blocks && tests) {
			res.send(parseFullObject(projects, blocks, tests));
		}
	});
});

/**
 * Bring a project from DB by its id
 *
 * @author mauricio.araldi
 * @since 27/07/2015
 *
 * @path /project/getById
 */
router.get('/getById', function(req, res) {
	//Searches for the project
	db.collection('project').findOne({_id: ObjectId(req.query.projectId)}, function(err, project) {
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

		res.send(project);
	});
});

/**
 * Save a project on database
 *
 * @author mauricio.araldi
 * @since 24/07/2015
 *
 * @path /project/save
 */
router.post('/save', function(req, res) {
	//Parse IDs
	var project = req.body.project;
	if (project._id) {
		project._id = ObjectId(project._id);
	}

	db.collection('project').save(project, {w: 1}, 
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
 * Removes a project
 *
 * @author mauricio.araldi
 * @since 27/07/2015
 *
 * @route /project/remove
 */
router.put('/remove', function(req, res) {
	var projectId = req.body.projectId;

	//Removes project
	db.collection('project').remove({_id: ObjectId(projectId)}, true, function(err, nDocs) {
		var nProjectsRemoved = nDocs.result;

		if (err) {
			res.send(err);
			return;
		}

		if (nProjectsRemoved.n > 0) {
			removeBlocksByProjectId(projectId)
				.then( //Result from remove blocks
					function(result) {
						removeTestsByBlockIdList(result);
					}
				)
				.then( //Result from remove tests
					function(result) {
						res.send(nProjectsRemoved);
					}
				)
				.then(null, function(err) { //Reject flux
					console.log('Remove project ['+ projectId +']: '+ err);
					res.send(nProjectsRemoved);
				});
		} else {
			res.send(nProjectsRemoved);
		}
	});
});

//Module export
module.exports = router;

/**
 * Unite all tests inside blocks and all blocks inside projects, in a single object
 *
 * @author mauricio.araldi
 * @since 23/07/2015
 *
 * @parameter projects - Projects to receive blocks with tests
 * @parameter blocks - Blocks to receive tests
 * @parameter tests - Tests to populate blocks and projects
 * @returns Projects - Projects with blocks and tests
 */
function parseFullObject(projects, blocks, tests) {
	for (var k in tests) {
		var test = tests[k],
			testBlock = blocks[test.block_id];

		if (!testBlock.tests) {
			testBlock.tests = [];
		}

		testBlock.tests.push(test);
	}

	for (var k in blocks) {
		var block = blocks[k],
			blockProject = projects[block.project_id];

		if (block.tests && block.tests.length > 1) {
			block.tests.sort(function(a, b) {
				if (a.order > b.order) {
					return 1;
				}

				if (a.order < b.order) {
					return -1;
				}

				if (a.order == b.order) {
					return 0;
				}
			});
		}

		if (!blockProject.blocks) {
			blockProject.blocks = [];
		}

		blockProject.blocks.push(block);
	}

	return projects;
}

/**
 * Remove all tests associated with a list of block Ids
 *
 * @author mauricio.araldi
 * @since 27/07/2015
 *
 * @parameter blockIdList - List of block Ids to have associated tests removed
 * @returns Promise - A promise with the id of all tests removed
 */
function removeTestsByBlockIdList(blockIdList) {
	return new Promise(function(resolve, reject) {
		var streamTests = db.collection('test').find({block_id: {$in: blockIdList}}).stream(),
			testsToRemove = [];

		//Search tests associated with block
		streamTests.on("data", function(item) {
			testsToRemove.push(item._id);
		});

		//Removes tests associated with the blocks
		streamTests.on("end", function() {
			db.collection('test').remove({_id: {$in: testsToRemove}}, {w: 1}, function(err, nDocs) {
				if (err) {
					reject(err);
					return;
				}

				if (nDocs.result.n == 0) {
					reject('No tests removed');
					return;
				}

				resolve(testsToRemove);
			});
		});
	});
}

/**
 * Remove all blocks associated with a project id
 *
 * @author mauricio.araldi
 * @since 27/07/2015
 *
 * @parameter projectId - Project Id to have associated blocks removed
 * @returns Promise - A promise with the id of all blocks removed
 */
function removeBlocksByProjectId(projectId) {
	return new Promise(function(resolve, reject) {
		var streamBlocks = db.collection('block').find({project_id: ObjectId(projectId)}).stream(),
			blocksToRemove = [];

		//Search blocks associated with project
		streamBlocks.on("data", function(item) {
			blocksToRemove.push(item._id);
		});

		//Removes blocks associated with the project
		streamBlocks.on("end", function() {
			db.collection('block').remove({_id: {$in: blocksToRemove}}, {w: 1}, function(err, nDocs) {
				if (err) {
					reject(err);
					return;
				}

				if (nDocs.result.n == 0) {
					reject('No blocks removed');
					return;
				}

				resolve(blocksToRemove);
			});
		});
	});
}