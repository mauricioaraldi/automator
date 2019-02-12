;(function ( $, window ) {

	/**
	 * This module controls the interactions with project informations
	 *
	 * @author mauricio.araldi
	 * @since 22/07/2015
	 */
	App.Project = (function() {
	
		/**
		 * Default function with all event bindings related to this module
		 *
		 * @author mauricio.araldi
		 * @since 22/07/2015
		 */
		function bindEvents() {
			/**
			 * Action of opening 'add project' popup
			 * 
			 * @author mauricio.araldi
			 * @since 24/07/2015
			 *
			 * @element .open-save-project
			 * @event click
			 */
			$('.open-save-project').on('click', function() {
				$('#project-id').val('');
				$('#project-name').val('');
				$('#popup-project-informations').show();
			});

			/**
			 * Action of closing 'add project' popup
			 * 
			 * @author mauricio.araldi
			 * @since 24/07/2015
			 *
			 * @element #close-save-project
			 * @event click
			 */
			$('#close-save-project').on('click', function() {
				$('#popup-project-informations').hide();
			});

			/**
			 * Action of clicking on the button to save project
			 *
			 * @author mauricio.araldi
			 * @since 24/07/2015
			 *
			 * @element #save-project
			 * @event click
			 */
			$('#save-project').on('click', function() {
				var project = new Project(
						$('#project-id').val(),
						$('#project-name').val()
					);

				save(project).then(
					function(result) {
						if (result.n >= 1) {
							App.Utils.addSuccessMessage(App.i18n('project.savedSuccessfully'));

							if ( $('#popup-test-informations:visible')[0] )  {
								populateSelect('#test-project');
							}

							$('#popup-project-informations').hide();

							loadAllWithTests().then(
								function(projects) {
									drawProjects(projects);
								},
								function(err) {
									App.Utils.addErrorMessage(err);
								}
							);
						} else {
							App.Utils.addErrorMessage(App.i18n('project.errorSaving'));
						}
					},
					function(err) {
						App.Utils.treatServerError(err);
					}
				);
			});

			/**
			 * On clicking 'edit' in a project
			 *
			 * @author mauricio.araldi
			 * @since 24/07/2015
			 *
			 * @element .edit-project
			 * @event click
			 */
			$(document).on('click', '.edit-project', function(ev) {
				ev.stopPropagation();

				var id = $(this).parent().attr('data-project-id');

				openEdit(id);
			});

			/**
			 * On clicking 'remove' in a project
			 *
			 * @author mauricio.araldi
			 * @since 27/07/2015
			 *
			 * @element .remove-project
			 * @event click
			 */
			$(document).on('click', '.remove-project', function(ev) {
				ev.stopPropagation();

				var id = $(this).parent().attr('data-project-id');

				remove(id).then(
					function(result) {
						App.Utils.addSuccessMessage(App.i18n('project.removedSuccessfully'));
						loadAllWithTests().then(
							function(projects) {
								drawProjects(projects);
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

			/**
			 * On 'Add test' screen, whenever project changes, loads its blocks
			 *
			 * @author mauricio.araldi
			 * @since 23/07/2015
			 *
			 * @element #test-project
			 * @event change
			 */
			$('#test-project').on('change', function() {
				if ($(this).val()) {
					App.Block.populateSelect('#test-block', $(this).val());
				}
			});
		}
		
		/**
		 * Default function that runs as soon as the page is loaded
		 * and events are binded (see bindEvents())
		 *
		 * @author mauricio.araldi
		 * @since 22/07/2015
		 */
		function init() {
			$(document).one('i18nFileLoad', function() {
				loadAllWithTests().then(
					function(projects) {
						drawProjects(projects);
					},
					function(err) {
						App.Utils.treatServerError(err);
					}
				);
			});
		}

		/**
		 * Load all projects from database
		 *
		 * @author mauricio.araldi
		 * @since 23/07/2015
		 */
		function loadAll() {
			return new Promise(function(resolve, reject) {
				$.get('/project/loadAll')
					.done(function(data) {
						resolve(data);
					})
					.fail(function(data) {
						reject(data);
					});
			});
		}

		/**
		 * Load all projects from database
		 *
		 * @author mauricio.araldi
		 * @since 22/07/2015
		 */
		function loadAllWithTests() {
			return new Promise(function(resolve, reject) {
				$.get('/project/loadAllWithTests')
					.done(function(data) {
						resolve(data);
					})
					.fail(function(data) {
						reject(data);
					});
			});
		}

		/**
		 * Receives projects object and draws it to the screen
		 *
		 * @author mauricio.araldi
		 * @since 23/07/2015
		 *
		 * @parameter Projects - Projects with blocks and tests to draw on screes
		 */
		function drawProjects(projects) {
			$('#test-list-container').empty();

			//Projects
			for (var k in projects) {
				var project = projects[k],
					projectEl = $('<div class="project">'),
					editProjectEl = $('<a class="btn edit edit-project">'+ App.i18n('edit') +'</a>'),
					removeProjectEl = $('<a class="btn remove remove-project">'+ App.i18n('remove') +'</a>');

				//Set project id
				projectEl.attr('data-project-id', project._id);

				//Append project name before blocks
				$('#test-list-container').append(
					$('<h2>')
						.text(project.name)
						.attr('data-project-id', project._id)
						.append(removeProjectEl)
						.append(editProjectEl)
				);

				//Blocks
				for (var k in project.blocks) {
					var block = project.blocks[k],
						blockEl = $('<ol class="block" start="0">'),
						editBlockEl = $('<a class="btn edit edit-block">'+ App.i18n('edit') +'</a>'),
						removeBlockEl = $('<a class="btn remove remove-block">'+ App.i18n('remove') +'</a>');

					//Append block name as first list item
					blockEl.append(
						$('<li>').append(
							$('<h3>')
								.text(block.name)
								.append(removeBlockEl)
								.append(editBlockEl)
						)
					);

					//Set block id
					blockEl.attr('data-block-id', block._id);

					//Tests
					for (var k in block.tests) {
						var test = block.tests[k],
							testEl = $('<li class="test">'),
							editTestEl = $('<a class="btn edit edit-test">'+ App.i18n('edit') +'</a>'),
							removeTestEl = $('<a class="btn remove remove-test">'+ App.i18n('remove') +'</a>');

						//Set test name
						testEl.append($('<span>'+ test.name +'</span>'));

						//Set test id
						testEl.attr('data-test-id', test._id);

						//Appends buttons
						testEl.append(removeTestEl)
							.append(editTestEl);

						//Append test to block
						blockEl.append(testEl);
					}

					//Append block to project
					projectEl.append(blockEl);
				}

				//Append project to body
				$('#test-list-container').append(projectEl);
			}
		}

		/**
		 * Populates a select with all available projects
		 *
		 * @author mauricio.araldi
		 * @since 24/07/2015
		 *
		 * @parameter String selectCssSelector - A CSS selector that leads to the desired select
		 * @parameter String preSelectedValue - A value to come already selected
		 */
		function populateSelect(selectCssSelector, preSelectedValue) {
			$(selectCssSelector).empty();

			//Add projects to select
			loadAll().then(
				function(projects) {
					for (var k in projects) {
						var project = projects[k];

						$(selectCssSelector).append(
							$('<option>').val(project._id).text(project.name)
						);
					}

					if (preSelectedValue) {
						$(selectCssSelector).val(preSelectedValue);
					}

					$(selectCssSelector).change();
				},
				function(err) {
					App.Utils.treatServerError(err);
				}
			);
		}

		/**
		 * Saves or update a project on DB
		 *
		 * @author mauricio.araldi
		 * @since 24/07/2015
		 *
		 * @parameter Project - The project to be saved or updated
		 * @return Promise - A promise with the result of the operation
		 */
		function save(project) {
			return new Promise(function(resolve, reject) {
				if (!project._id) {
					delete project._id;
				}

				$.post('/project/save', {project: project})
					.done(function(data) {
						resolve(data);
					})
					.fail(function(err) {
						reject(err);
					});
			});
		}

		/**
		 * Open the edit project screen
		 *
		 * @author mauricio.araldi
		 * @since 27/07/2015
		 *
		 * @parameter projectId - The id of the project to be edited
		 */
		function openEdit(projectId) {
			getById(projectId).then(
				function(result) {
					//Set ID
					$('#project-id').val(result._id);

					//Set name
					$('#project-name').val(result.name);

					$('#popup-project-informations').show();
				},
				function(err) {
					App.Utils.treatServerError(err);	
				}
			);
		}

		/**
		 * Brings a project by id
		 *
		 * @author mauricio.araldi
		 * @since 27/07/2015
		 *
		 * @parameter projectId - The id of the project to be retrieved
		 * @return Promise - The promise with a project
		 */
		function getById(projectId) {
			return new Promise(function(resolve, reject) {
				$.get('/project/getById', {projectId: projectId})
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
		 * Removes a project
		 *
		 * @author mauricio.araldi
		 * @since 27/07/2015
		 *
		 * @parameter projectId - The id of the project to be removed
		 * @return Promise - The promise of project removed
		 */
		function remove(projectId) {
			return new Promise(function(resolve, reject) {
				$.ajax('/project/remove', {data: {projectId: projectId}, method: 'PUT'})
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
			loadAllWithTests : loadAllWithTests,
			drawProjects : drawProjects,
			populateSelect : populateSelect,
		}
	
	})();

	// DOM Ready -- Initialize the module
	$(function() {
		App.Project.bindEvents();
		App.Project.init();
	});

})( jQuery, window );