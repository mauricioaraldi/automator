;(function ( $, window ) {

	/**
	 * This module controls I18n interations.
	 *
	 * @author mauricio.araldi
	 * @since 03/08/2015
	 */
	App.I18n = (function(){
	
		/**
		 * Default function with all event bindings related to this module
		 *
		 * @author mauricio.araldi
		 * @since 03/08/2015
		 */
		function bindEvents() {
		}
		
		/**
		 * Default function that runs as soon as the page is loaded
		 * and events are binded (see bindEvents())
		 *
		 * @author mauricio.araldi
		 * @since 03/08/2015
		 */
		function init() {
			loadJSONFile( navigator.language );
			$(document).one('i18nFileLoad', localizePage);
		}
		
		/**
		 * Loads a JSON i18n file accordingly to the language of
		 * user browser
		 *
		 * @author mauricio.araldi
		 * @since 03/08/2015
		 *
		 * @triggers i18nFileLoaded - Event stating that the i18n file has
		 * finished loading
		 */
		function loadJSONFile(language) {
			$.getJSON('resources/i18n/languages/'+ language +'.json', function(data, status) {
				if (status == 'success') {
					App.i18n = function(message) {
						var result = message.split('.')
										.reduce(function index(data,i) {
											return data[i];
										}, data);
						
						if (!result) {
							result = '[??? '+ message +' ???]';
						}
						
						return result;
					};
					
					$(document).trigger('i18nFileLoad');
				}
			})
			.fail(function(data) {
				if (language != 'en-US') {
					loadJSONFile('en-US');
				}
			});
		}
		
		/**
		 * Search in all the page tags to localize
		 *
		 * @author mauricio.araldi
		 * @since 03/08/2015
		 */
		function localizePage() {
			var elements = $('[data-i18n]');
			
			elements.each(function() {
				var i18nString = $(this).attr('data-i18n'),
					localizedMessage = App.i18n(i18nString);
					
				$(this).text(localizedMessage);
			});
		}
	
		//These function will be visible
		return {
			bindEvents : bindEvents,
			init : init,
			localizePage : localizePage,
		};
	})();

	// DOM Ready -- Initialize Module
	$(function() {
		App.I18n.bindEvents();
		App.I18n.init();
	});
	
})( jQuery, window );