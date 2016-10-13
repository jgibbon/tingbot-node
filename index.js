const ev = require('./lib/event');


const modules = {
	backlight: function (tingbot) {
		const backlight = require('./hardware/backlight');
		//convenience
		//

		/**
		 * Sets a new brightness value, tweens if do_tween is true. Alias for {@link tingbot.backlight.set_backlight}
		 * @function
		 * @memberof tingbot
		 * @fires tingbot#backlight
		 * @alias tingbot.backlight.set_backlight
		 * @example <caption>set backlight value</caption>
		 * tingbot.backlight.set_backlight(99999, function(val){
		 * 	console.log('done', val);
		 * });
		 * @name set_backlight
		 * @param {number} num the new brightness value
		 * @param {tingbot.backlight~setBrightnessCallback} [cb] callback when ready, gets value as argument
		 */

		tingbot.set_backlight = function(num, cb) {
			return backlight.set_backlight(num, cb);
		};
		return backlight;
	},
	buttons: function (tingbot) {
		const buttons = require('./hardware/buttons');
		return buttons;
	}
};

/**
 * tingbot-node itself. exposes optional tingbot submodules ({@link tingbot.backlight}, {@link tingbot.buttons}), event listeners and convenience functions
 * @namespace tingbot
 * @example <caption>create a tingbot-node instance called tingbot</caption>
 * var tb = require('tingbot-node'), tingbot = new tb();
 * //use tingbot.on or tingbot.set_backlight
 */
 /**
  * Not really a Module, but the main constructor. Creates a {@link tingbot} instance and loads optional tingbot submodules ({@link tingbot.backlight}, {@link tingbot.buttons}).
  *
  * @constructor
  * @function
  * @exports tingbot
  * @example <caption>create a tingbot-node instance called tingbot</caption>
  * var tb = require('tingbot-node'), tingbot = new tb();
  * @param {Object} [options]
  * @param {Array.<String>} options.modules (['buttons', 'backlight']) If you only want do set the backlight, you don't need to load wiring-pi
  */

const TingbotNode = module.exports = function tingbot(options) {
	this.options = options || {};
	//start those modules
	this.options.modules = this.options.modules || ['buttons', 'backlight'];
	this.init();
};



/**
 * Loads modules set in this.options.modules once internally and self-destructs. Don't use.
 *
 * @function
 */
TingbotNode.prototype.init = function () {
	//load modules
	for (let i = 0; i < this.options.modules.length; i++) {
		console.log('module start:', this.options.modules[i]);
		this[this.options.modules[i]] = modules[this.options.modules[i]](this);
	}
	this.init = function () {};
};

/**
 * This callback is displayed as a global member. Should, among optional event specific properties, always have 'type' and 'value'. Look at the specific Events for more Detail.
 * @callback tingbot~onCallback
 * @param {object} tingbot_event
 * @param {string} tingbot_event.type Type of Event, eg 'button'
 * @param {number} tingbot_event.value value of Event, eg brightness
 */
/**
 * Attaches Event listener to tingbot-node events.
 *
 * @function
 * @name on
 * @memberof tingbot
 * @example <caption>listen to a release button event</caption>
 * tingbot.on('button-left:up',
 *  function(data) {
 *   console.log('button left released', data);
 * });
 * @param {string} evname Event name, like 'button'
 * @param {tingbot~onCallback} cb callback function to be called with event specific argument payload
 */
TingbotNode.prototype.on = function (evname, cb) {
	ev.on(evname, cb);
};

/**
 * Attaches Event listener to tingbot-node events for only one event.
 *
 * @function
 * @name once
 * @memberof tingbot
 * @example <caption>listen to a press button event once</caption>
 * tingbot.once('button#3:down', function(data) {
 *   console.log('button right pressed', data);
 * });
 * @param {string} evname Event name, like 'button'
 * @param {tingbot~onCallback} cb callback function to be called with event specific argument payload
 */
TingbotNode.prototype.once = function (evname, cb) {
	ev.once(evname, cb);
};
