App = {
	Values : {
	},

	Config : {
	},

	Utils : {
		/**
		 * Appends a darkened blocker to the screen
		 * 
		 * @author mauricio.araldi
		 * @since 03/08/2015
		 */
		blockScreen: function() {
			var blocker = $('<div class="screen-block darken"></div>');

			blocker.on('click', function(ev) {
				ev.stopPropagation();
				App.Utils.unblockScreen();
				$('.popup').hide();
			});

			$('body').append(blocker);
		},

		/**
		 * Removes all screen blockers
		 * 
		 * @author mauricio.araldi
		 * @since 03/08/2015
		 */
		unblockScreen: function() {
			$('.screen-block').remove();
		},

		/**
		 * Makes a noty on the screen with no style
		 *
		 * @author mauricio.araldi
		 * @since 03/08/2015
		 *
		 * @parameter String text - The text of the notification to be created
		 * @parameter String type - The type of the notification to be created
		 */
		addMessage : function(text, type) {
			noty({
				layout: 'center',
				type: type,
				text: text,
				timeout: 4000,
			});
		},
		
		/**
		 * Makes a noty on the screen with info style
		 *
		 * @author mauricio.araldi
		 * @since 03/08/2015
		 *
		 * @parameter String text - The text of the notification to be created
		 */
		addInfoMessage : function(text) {
			App.Utils.addMessage(text, 'information');
		},
		
		/**
		 * Makes a noty on the screen with warning style
		 *
		 * @author mauricio.araldi
		 * @since 03/08/2015
		 *
		 * @parameter String text - The text of the notification to be created
		 */
		addWarningMessage : function(text) {
			App.Utils.addMessage(text, 'warning');
		},
		
		/**
		 * Makes a noty on the screen with error style
		 *
		 * @author mauricio.araldi
		 * @since 03/08/2015
		 *
		 * @parameter String text - The text of the notification to be created
		 */
		addErrorMessage : function(text) {
			App.Utils.addMessage(text, 'error');
		},
		
		/**
		 * Makes a noty on the screen with success style
		 *
		 * @author mauricio.araldi
		 * @since 03/08/2015
		 *
		 * @parameter String text - The text of the notification to be created
		 */
		addSuccessMessage : function(text) {
			App.Utils.addMessage(text, 'success');
		},

		/**
		 * Function used to treat error returns from ajax server calls
		 *
		 * @author mauricio.araldi
		 * @since 03/08/2015
		 *
		 * @parameter Object err - The error returned by the ajax call
		 */
		treatServerError: function(err) {
			if (err.status == 404) {
				App.Utils.addErrorMessage(App.i18n('serverConnectionError'));
			} else {
				App.Utils.addErrorMessage(err);
			}
		}
	}
};