;(function ( $, window ) {

	/**
	 * This module controls test interactions
	 *
	 * @author mauricio.araldi
	 * @since 26/06/2015
	 */
	App.Test = (function() {
	
		/**
		 * Default function with all event bindings related to this module
		 *
		 * @author mauricio.araldi
		 * @since 26/06/2015
		 */
		function bindEvents() {
			/**
			 * Action for test itens. Execute related tests.
			 *
			 * @author mauricio.araldi
			 * @since 28/06/2015
			 *
			 * @element .test
			 * @event click
			 */
			$(document).on('click', '.test', function(ev) {
				var self = $(this),
					testId = self.attr('data-test-id');

				self.removeClass('success error')
					.addClass('testing')
					.find('p').remove();

				runTest(testId).then(
					function(result) {
						App.Logger.add(App.i18n('successIn') +': '+ self.find('span').text());
						self.removeClass('testing').addClass('success');
						applyLogClass();
						applyBlockClass(self.parent());
					},
					function(err) {
						self.removeClass('testing').addClass('error');

						self.append('<p>'+ App.i18n('error') +': '+ err.message +'</p>');
						self.append('<p>In step: [I] '+ err.step.instruction +' [T] '+  err.step.target +' [V] '+ err.step.value +'</p>');
						App.Logger.add(App.i18n('errorIn') +' '+ self.find('span').text() +': '+ err.message);
						App.Logger.add('In step: [I] '+ err.step.instruction +' [T] '+  err.step.target +' [V] '+ err.step.value);

						applyLogClass();
						applyBlockClass(self.parent());
					}
				);
			});

			/**
			 * Action for test blocks headers. Activate all tests inside block.
			 *
			 * @author mauricio.araldi
			 * @since 20/07/2015
			 *
			 * @element ol > li:first
			 * @event click
			 */
			$(document).on('click', 'ol > li:first', function() {
				$(this).parent().find('.test').click();
			});

			/**
			 * Action of clicking on the button to add tests
			 *
			 * @author mauricio.araldi
			 * @since 23/07/2015
			 *
			 * @element #open-save-test
			 * @event click
			 */
			$('#open-save-test').on('click', function() {
				App.Project.populateSelect('#test-project');

				//Clear fields
				$('#test-id').val('');
				$('#test-name').val('');
				$('#test-description').val('');
				$('#test-script').val('');
				$('#test-order').val('');

				$('#popup-test-informations').show();
				App.Utils.blockScreen();
			});

			/**
			 * Action of clicking on the button to close the popup 'add tests'
			 *
			 * @author mauricio.araldi
			 * @since 23/07/2015
			 *
			 * @element #close-save-test
			 * @event click
			 */
			$('#close-save-test').on('click', function() {
				$('#popup-test-informations').hide();
				App.Utils.unblockScreen();
			});

			/**
			 * Action of clicking on the button to save test
			 *
			 * @author mauricio.araldi
			 * @since 23/07/2015
			 *
			 * @element #save-test
			 * @event click
			 */
			$('#save-test').on('click', function() {
				var test = new Test(
						$('#test-id').val(),
						$('#test-name').val(),
						$('#test-description').val(),
						$('#test-block').val(),
						$('#test-script')[0].files[0],
						$('#test-order').val()
					);

				if (!test.name) {
					App.Utils.addErrorMessage(App.i18n("test.nameRequired"));
					return;
				} else if (!test.script) {
					App.Utils.addErrorMessage(App.i18n("test.scriptRequired"));
					return;
				} else if (!test.order) {
					test.order = 1;
				}

				var reader = new FileReader();

				reader.onload = function() {
					test.script = reader.result;

					save(test).then(
						function(result) {
							if (result.n >= 1) {
								App.Utils.addSuccessMessage(App.i18n("test.savedSuccessfully"));
								$('#popup-test-informations').hide();
								App.Utils.unblockScreen();

								App.Project.loadAllWithTests().then(
									function(projects) {
										App.Project.drawProjects(projects);
									},
									function(err) {
										App.Utils.addErrorMessage(err);
									}
								);
							} else {
								App.Utils.addErrorMessage(App.i18n("test.errorSaving"));
							}
						},
						function(err) {
							App.Utils.treatServerError(err);
						}
					);
				};

				reader.readAsText(test.script);
			});

			/**
			 * On clicking 'edit' in a test
			 *
			 * @author mauricio.araldi
			 * @since 24/07/2015
			 *
			 * @element .edit-test
			 * @event click
			 */
			$(document).on('click', '.edit-test', function(ev) {
				ev.stopPropagation();

				var id = $(this).parent().attr('data-test-id');

				openEdit(id);
			});

			/**
			 * On clicking 'remove' in a test
			 *
			 * @author mauricio.araldi
			 * @since 27/07/2015
			 *
			 * @element .remove-test
			 * @event click
			 */
			$(document).on('click', '.remove-test', function(ev) {
				ev.stopPropagation();

				var id = $(this).parent().attr('data-test-id');

				remove(id).then(
					function(result) {
						App.Utils.addSuccessMessage(App.i18n("test.removedSuccessfully"));
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
		 * @since 26/06/2015
		 */
		function init() {
		}

		/**
		 * Executes a single test
		 *
		 * @author mauricio.araldi
		 * @since 28/07/2015
		 *
		 * @param String testId - The id of the test to be executed
		 * @return Promise - Result of the test
		 */
		function runTest(testId) {
			return new Promise(function(resolve, reject) {
				$.get('/test/run', {testId: testId}, function(data) {
					if (data.testStatus) {
						resolve(data);
					} else {
						reject(data);
					}
				}).fail(function(data) {
					reject(data);
				});
			});
		}

		/**
		 * Applies to the log the class that represents the current test overall state
		 *
		 * @author mauricio.araldi
		 * @since 21/07/2015
		 */
		function applyLogClass() {
			$('#log').removeClass()
			.addClass( $('.test').hasClass('error') ? 'error' : 'success' );
		}

		/**
		 * Applies to the block of tests the class that represents
		 * the current block overall test state
		 *
		 * @author mauricio.araldi
		 * @since 21/07/2015
		 */
		function applyBlockClass(blockEl) {
			blockEl.removeClass('block-error block-success')
			.addClass( blockEl.find('.test').hasClass('error') ? 'block-error' : 'block-success' );
		}

		/**
		 * Saves a test on DB
		 *
		 * @author mauricio.araldi
		 * @since 23/07/2015
		 *
		 * @parameter Test - The test to be saved on DB
		 * @return Promise - The promise of test saved
		 */
		function save(test) {
			return new Promise(function(resolve, reject) {
				if (!test._id) {
					delete test._id;
				}

				$.post('/test/save', {test: test})
					.done(function(data) {
						resolve(data);
					})
					.fail(function(data) {
						reject(data);
					});
			});
		}

		/**
		 * Opens edit screen for a test
		 *
		 * @author mauricio.araldi
		 * @since 24/07/2015
		 *
		 * @parameter testId - The id of the test to be edited
		 */
		function openEdit(testId) {
			getFullObjectById(testId).then(
				function(result) {
					//Populating block select
					$('#test-block').one('change', function() {
						$(this).val(result.block._id);
					});

					//Populating project select
					App.Project.populateSelect('#test-project', result.project._id);

					//ID
					$('#test-id').val(result._id);

					//Name
					$('#test-name').val(result.name);

					//Description
					$('#test-description').val(result.description);

					//Script
					//$('#test-script').val();

					$('#popup-test-informations').show();
				},
				function(err) {
					App.Utils.treatServerError(err);
				}
			);
		}

		/**
		 * Brings a Full Object (test with block and project) by test Id
		 *
		 * @author mauricio.araldi
		 * @since 24/07/2015
		 *
		 * @parameter testId - The test to be retrieved
		 * @return Promise - The promise of full object
		 */
		function getFullObjectById(testId) {
			return new Promise(function(resolve, reject) {
				$.get('/test/getFullObjectById', {testId: testId})
					.done(function(data) {
						resolve(data);
					})
					.fail(function(data) {
						reject(data);
					});
			});
		}

		/**
		 * Removes a test
		 *
		 * @author mauricio.araldi
		 * @since 27/07/2015
		 *
		 * @parameter testId - The id of the test to be removed
		 * @return Promise - The promise of test removed
		 */
		function remove(testId) {
			return new Promise(function(resolve, reject) {
				$.ajax('/test/remove', {data: {testId: testId}, method: 'PUT'})
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

		return {
			bindEvents : bindEvents,
			init : init,
		}
	
	})();

	// DOM Ready -- Initialize the module
	$(function() {
		App.Test.bindEvents();
		App.Test.init();
	});

})( jQuery, window );