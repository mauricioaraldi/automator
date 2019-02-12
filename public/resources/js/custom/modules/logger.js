;(function ( $, window ) {

	/**
	 * This module controls the interactions with log informations
	 *
	 * @author mauricio.araldi
	 * @since 18/11/2016
	 */
	App.Logger = (function() {
	
		/**
		 * Default function with all event bindings related to this module
		 *
		 * @author mauricio.araldi
		 * @since 18/11/2016
		 */
		function bindEvents() {
		}
		
		/**
		 * Default function that runs as soon as the page is loaded
		 * and events are binded (see bindEvents())
		 *
		 * @author mauricio.araldi
		 * @since 18/11/2016
		 */
		function init() {
		}

		/**
		 * Load all blocks from database
		 *
		 * @author mauricio.araldi
		 * @since 18/11/2016
		 *
		 * @parameter String message - Adds a message to the Logger
		 */
		function add(message) {
			var line = $('<p>').text(message),
				log = $('#log'),
				scrollMax = log[0].scrollTopMax,
				curScroll = log[0].scrollTop,
				scrollTo = false;

			if (scrollMax == curScroll) {
				scrollTo = true;
			}

			log.append(line);

			if (scrollTo) {
				log.scrollTop(log[0].scrollTopMax);
			}
		}

		// These functions will be visible
		return {
			bindEvents : bindEvents,
			init : init,
			add : add
		}
	
	})();

	// DOM Ready -- Initialize the module
	$(function() {
		App.Logger.bindEvents();
		App.Logger.init();
	});

})( jQuery, window );