(function() {
	// base CSS file
	require("./src/interactive.less");

	// this code will execute callback() when the DOM is ready, which can happen at different times in different environments due to the way Wordpress bootstraps the script
	module.exports = function(id, callback, skipCheckForReady) {
		if (!id || (typeof id !== "string" && typeof id !== "object")) {
			console.log("Whoops -- you need to give time-interactive a string id of the element on the page in which to self-assemble or the element itself.");
			return;
		}

		if (typeof callback !== 'function') {
			console.log("Warning!  You did not provide a callback function as the second parameter.  Your interactive might not work properly because you won't be notified that the initialization has completed if the jQuery(document).ready() has already been fired.");
		}

		//once you know that everything is loaded
		var checkForReady = function() {
			// check if the $(document).ready() event has occurred
			if (jQuery.isReady || skipCheckForReady) {  //http://stackoverflow.com/questions/8373910/in-jquery-how-do-i-check-if-the-dom-is-ready
				jQuery("body").trigger("time-interactive-ready");  // trigger the time-interactive-ready event
			} else {
				// the $(document).ready() event has not yet occurred
				// so let's install an event handler
				jQuery(document).ready(function() {
					jQuery("body").trigger("time-interactive-ready"); // trigger the time-interactive-ready event
				});
			}
		};

    // Prevent multiple event bindings
    jQuery("body").off("time-interactive-ready");

		jQuery("body").on("time-interactive-ready", "", function(event) {
			// once the interactive is ready, let's tell the hosting page that we are done
			// this could be used for ad rendering etc.
			if (typeof TIME !== "undefined") {
				Time.trigger("timeInteractive:ready", interactiveName, {/* optional other data that the hosting page can use */});
			}

			if (typeof id === "string") {
			// make el, a $ object
			var sel = id[0] !== "#" ? ("#" + id) : id,
				$el = jQuery(sel);
			} else if (typeof id === "object") {
				var $el = jQuery(id);
			}

			callback(jQuery, bootstrap_interactive(id));

		});

		checkForReady();
	}


	// this assumes there is already a <div> on the page with the correct id, which Wordpress should have created (see README)
	function bootstrap_interactive(id, opts) {
		if (!id || (typeof id !== "string" && typeof id !== "object")) {
			console.log("Whoops -- you need to give time-interactive a string id of the element on the page in which to self-assemble or the element itself.");
			return;
		}

		if (typeof id === "string") {
			// make el, a $ object
			var sel = id[0] !== "#" ? ("#" + id) : id,
				$el = jQuery(sel);
		} else if (typeof id === "object") {
			var $el = jQuery(id);
		}

		if ($el.length === 0) {
			console.log("Whoops -- the time-interactive function couldn't find a <div> on this page for the element it was given. You probably mistyped it in debug.js.");
			return;
		}

    if ($el.hasClass("time-interactive--rendered")) {
      console.log("Interactive already rendered -- skipping");
      return;
    }

		console.log("Loading interactive", id);

		var el = $el.get(0);

		// ought to already have this, but let's be sure
		$el.addClass("time-interactive");

    // add rendered class
    $el.addClass("time-interactive--rendered");

		if (!opts || !opts.keepScreenshot) {
			$el.find(".screenshot").remove();
		}

		// _$ and _d3 will only find elements inside the main div.
		var _$ = function(selector) {
			return $el.find(selector);
		};

		// return the DOM object
		return {
			version: "0.1.7",
			id: id,
			el: el,
			_$: _$,
			width: function() { return $el.width(); },
			height: function() { return $el.height(); },
			page_width: jQuery(document).width(),
			page_height: jQuery(document).height(),
			aspect_ratio: jQuery(document).width() / jQuery(document).height(),
			params: $el.data() || {},
			onresize: function(f, delay) {
				delay = typeof delay === undefined ? 100 : delay;
				var resizeTimer;
				$(window).resize(function() {
					clearTimeout(resizeTimer);
					resizeTimer = setTimeout(function() {
						f($el.width(), $el.height());
					}, delay);
				});
			}
		};

	}

	/* CONVENIENCE FUNCTIONS */

	// add commas to numbers over 1000
	module.exports.commafy = function(val){
		if (typeof val !== "number") {
			return;
		}
		val = parseInt(val, 10);

	    while (/(\d+)(\d{3})/.test(val.toString())){
	      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
	    }
	    return val;
	}

	// generate a unique GUID
	module.exports.guid = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		});
	}

}());
