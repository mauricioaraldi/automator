/**
 * Load all tests from database
 *
 * @author mauricio.araldi
 * @since 23/07/2015
 *
 * @parameter includeScripts - If the objects should return script together
 * @parameter callBack - Action to take when all tests are loaded
 */
exports.loadTests = function(includeScripts, callBack) {
	var data = {};

	var streamTests = db.collection('test').find().stream();
	streamTests.on("data", function(item) {
		//Remove scripts from objects
		if (!includeScripts) {
			delete item.script;
		}
		
		data[item._id] = item;
	});
	streamTests.on("end", function() {
		callBack(data);
	});
}

/**
 * Load all blocks from database
 *
 * @author mauricio.araldi
 * @since 23/07/2015
 *
 * @parameter callBack - Action to take when all blocks are loaded
 */
exports.loadBlocks = function(callBack) {
	var data = {};

	var streamBlocks = db.collection('block').find().stream();
	streamBlocks.on("data", function(item) {
		data[item._id] = item;
	});
	streamBlocks.on("end", function() {
		callBack(data);
	});
}

/**
 * Load all projects from database
 *
 * @author mauricio.araldi
 * @since 23/07/2015
 *
 * @parameter callBack - Action to take when all projects are loaded
 */
exports.loadProjects = function(callBack) {
	var data = {};

	var streamProjects = db.collection('project').find().stream();
	streamProjects.on("data", function(item) {
		data[item._id] = item;
	});
	streamProjects.on("end", function() {
		callBack(data);
	});
}