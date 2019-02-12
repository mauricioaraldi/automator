//Dependencies
var router = require('express').Router(),
	utils = require('../utils.js');

//Module routes

/**
 * Search database for all blocks
 *
 * @author mauricio.araldi
 * @since 23/07/2015
 *
 * @path /block/loadAll
 */
router.get('/loadAll', function(req, res) {
	utils.loadBlocks(function(data) {
		res.send(data);
	});
});

/**
 * Search database for all blocks from a certain project
 *
 * @author mauricio.araldi
 * @since 23/07/2015
 *
 * @path /block/loadAll
 */
router.get('/loadAllFromProject', function(req, res) {
	var projectId = req.query.projectId,
		data = {};

	var streamBlocks = db.collection('block').find({project_id: ObjectId(projectId)}).stream();
	streamBlocks.on("data", function(item) {
		data[item._id] = item;
	});
	streamBlocks.on("end", function() {
		res.send(data);
	});
});

/**
 * Bring a block from DB by its id
 *
 * @author mauricio.araldi
 * @since 27/07/2015
 *
 * @path /block/getById
 */
router.get('/getById', function(req, res) {
	//Searches for the block
	db.collection('block').findOne({_id: ObjectId(req.query.blockId)}, function(err, block) {
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

		res.send(block);
	});
});

/**
 * Save a block on database
 *
 * @author mauricio.araldi
 * @since 24/07/2015
 *
 * @path /block/save
 */
router.post('/save', function(req, res) {
	var block = req.body.block;

	//Turn project ID into a object ID
	block._id = ObjectId(block._id);
	block.project_id = ObjectId(block.project_id);

	db.collection('block').save(block, {w: 1}, 
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
 * Removes a block
 *
 * @author mauricio.araldi
 * @since 27/07/2015
 *
 * @route /block/remove
 */
router.put('/remove', function(req, res) {
	var blockId = req.body.blockId;

	//Removes block
	db.collection('block').remove({_id: ObjectId(blockId)}, true, function(err, nDocs) {
		var nBlocksRemoved = nDocs.result;

		if (err) {
			res.send(err);
			return;
		}

		if (nBlocksRemoved.n) {
			//Remove tests
			db.collection('test').remove({block_id: ObjectId(blockId)}, {w: 1}, function(err, nDocs) {
				if (err) {
					res.send(err);
					return;
				}

				res.send(nBlocksRemoved);
			});
		} else {
			res.send('No block removed');
			return;
		}
	});
});

//Module export
module.exports = router;