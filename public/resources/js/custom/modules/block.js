;(function ( $, window ) {

	/**
	 * This module controls the interactions with block informations
	 *
	 * @author mauricio.araldi
	 * @since 23/07/2015
	 */
	App.Block = (function() {
	
		/**
		 * Default function with all event bindings related to this module
		 *
		 * @author mauricio.araldi
		 * @since 23/07/2015
		 */
		function bindEvents() {
			/**
			 * Action of opening 'add block' popup
			 * 
			 * @author mauricio.araldi
			 * @since 24/07/2015
			 *
			 * @element .open-save-block
			 * @event click
			 */
			$('#open-save-block').on('click', function() {
				App.Project.populateSelect('#block-project');
				$('#block-project-name').text( $('#test-project option:selected').text() );
				$('#block-name').val('');
				$('#popup-block-informations').show();
			});

			/**
			 * Action of closing 'add block' popup
			 * 
			 * @author mauricio.araldi
			 * @since 24/07/2015
			 *
			 * @element #close-save-block
			 * @event click
			 */
			$('#close-save-block').on('click', function() {
				$('#popup-block-informations').hide();
			});

			/**
			 * Action of clicking on the button to save block
			 *
			 * @author mauricio.araldi
			 * @since 24/07/2015
			 *
			 * @element #save-block
			 * @event click
			 */
			$('#save-block').on('click', function() {
				var block = new Block(
						$('#block-id').val(),
						$('#block-name').val(),
						$('#block-project').val()
					);

				save(block).then(
					function(result) {
						if (result.n >= 1) {
							App.Utils.addSuccessMessage(App.i18n('block.savedSuccessfully'));
							$('#popup-block-informations').hide();
							
							if ( $('#popup-test-informations:visible')[0] )  {
								populateSelect('#test-block', $('#test-project').val());
							}

							App.Project.loadAllWithTests().then(
								function(projects) {
									App.Project.drawProjects(projects);
								},
								function(err) {
									App.Utils.addErrorMessage(err);
								}
							);
						} else {
							App.Utils.addErrorMessage(App.i18n('block.errorSaving'));
						}
					},
					function(err) {
						App.Utils.treatServerError(err);
					}
				);
			});

			/**
			 * On clicking 'edit' in a block
			 *
			 * @author mauricio.araldi
			 * @since 24/07/2015
			 *
			 * @element .edit-block
			 * @event click
			 */
			$(document).on('click', '.edit-block', function(ev) {
				ev.stopPropagation();

				var id = $(this).closest('ol').attr('data-block-id');

				openEdit(id);
			});

			/**
			 * On clicking 'remove' in a block
			 *
			 * @author mauricio.araldi
			 * @since 27/07/2015
			 *
			 * @element .remove-block
			 * @event click
			 */
			$(document).on('click', '.remove-block', function(ev) {
				ev.stopPropagation();

				var id = $(this).closest('ol').attr('data-block-id');

				remove(id).then(
					function(result) {
						App.Utils.addSuccessMessage(App.i18n('block.removedSuccessfully'));
						App.Project.loadAllWithTests().then(
							function(projects) {
								App.Project.drawProjects(projects);
							},
							function(err) {
								App.Utils.addErrorMessage(err);
							}
						);
					},
					function(err) {
						App.Utils.treatServerError(err);
					}
				);
			});
		}
		
		/**
		 * Default function that runs as soon as the page is loaded
		 * and events are binded (see bindEvents())
		 *
		 * @author mauricio.araldi
		 * @since 23/07/2015
		 */
		function init() {
		}

		/**
		 * Load all blocks from database
		 *
		 * @author mauricio.araldi
		 * @since 23/07/2015
		 *
		 * @return Promise - A promise with all blocks
		 */
		function loadAll() {
			return new Promise(function(resolve, reject) {
				$.get('/block/loadAll')
					.done(function(data) {
						resolve(data);
					})
					.fail(function(data) {
						reject(data);
					});
			});
		}

		/**
		 * Load all blocks from database that belongs to a certain project
		 *
		 * @author mauricio.araldi
		 * @since 23/07/2015
		 *
		 * @parameter String projectId - The id of the project to have its blocks retrieved
		 * @return Promise - A promise with the blocks of the project
		 */
		function loadAllFromProject(projectId) {
			return new Promise(function(resolve, reject) {
				$.get('/block/loadAllFromProject', {projectId: projectId})
					.done(function(data) {
						resolve(data);
					})
					.fail(function(data) {
						reject(data);
					});
			});
		}

		/**
		 * Populates a select with all available blocks from a project
		 *
		 * @author mauricio.araldi
		 * @since 24/07/2015
		 *
		 * @parameter String selectCssSelector - A CSS selector that leads to the desired select
		 * @parameter String projectId - The id of the projects from which the blocks will be loaded
		 */
		function populateSelect(selectCssSelector, projectId) {
			$(selectCssSelector).empty();

			//Add projects to select
			loadAllFromProject(projectId).then(
				function(blocks) {
					for (var k in blocks) {
						var block = blocks[k];

						$(selectCssSelector).append(
							$('<option>').val(block._id).text(block.name)
						);
					}

					$(selectCssSelector).change();
				},
				function(err) {
					App.Utils.treatServerError(err);
				}
			);
		}

		/**
		 * Saves or update a block on DB
		 *
		 * @author mauricio.araldi
		 * @since 24/07/2015
		 *
		 * @parameter Block - The block to be saved or updated
		 * @return Promise - A promise with the result of the operation
		 */
		function save(block) {
			return new Promise(function(resolve, reject) {
				if (!block._id) {
					delete block._id;
				}

				$.post('/block/save', {block: block})
					.done(function(data) {
						resolve(data);
					})
					.fail(function(err) {
						reject(err);
					});
			});
		}

		/**
		 * Open the edit block screen
		 *
		 * @author mauricio.araldi
		 * @since 27/07/2015
		 *
		 * @parameter blockId - The id of the block to be edited
		 */
		function openEdit(blockId) {
			getById(blockId).then(
				function(result) {
					//Populating project select
					App.Project.populateSelect('#block-project', result.project_id);

					//Set name
					$('#block-name').val(result.name);

					//Set ID
					$('#block-id').val(result._id);

					$('#popup-block-informations').show();
				},
				function(err) {
					App.Utils.treatServerError(err);
				}
			);
		}

		/**
		 * Brings a block by id
		 *
		 * @author mauricio.araldi
		 * @since 27/07/2015
		 *
		 * @parameter blockId - The id of the block to be retrieved
		 * @return Promise - The promise with a block
		 */
		function getById(blockId) {
			return new Promise(function(resolve, reject) {
				$.get('/block/getById', {blockId: blockId})
					.done(function(data) {
						if (data._id) {
							resolve(data);
						} else {
							reject(data);
						}
					})
					.fail(function(data) {
						reject(data);
					});
			});
		}

		/**
		 * Removes a block
		 *
		 * @author mauricio.araldi
		 * @since 27/07/2015
		 *
		 * @parameter blockId - The id of the block to be removed
		 * @return Promise - The promise of block removed
		 */
		function remove(blockId) {
			return new Promise(function(resolve, reject) {
				$.ajax('/block/remove', {data: {blockId: blockId}, method: 'PUT'})
					.done(function(data) {
						if (data.n > 0) {
							resolve(data);
						} else {
							reject(data);
						}
					})
					.fail(function(data) {
						reject(data);
					});
			});
		}

		// These functions will be visible
		return {
			bindEvents : bindEvents,
			init : init,
			loadAll : loadAll,
			loadAllFromProject : loadAllFromProject,
			populateSelect : populateSelect
		}
	
	})();

	// DOM Ready -- Initialize the module
	$(function() {
		App.Block.bindEvents();
		App.Block.init();
	});

})( jQuery, window );