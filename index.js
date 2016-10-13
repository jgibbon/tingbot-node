const ev = require('./lib/event');


const modules = {
	backlight: function (tingbot) {
		const backlight = require('./hardware/backlight');
		//convenience
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
 * tingbot-node itself. exposes submodules (backlight, buttons), event listeners and convenience functions
 * @namespace tingbot
 * @example <caption>create a tingbot-node instance called tingbot</caption>
 * var tb = require('tingbot-node'), tingbot = new tb();
 * //use tingbot.on or tingbot.set_backlight
 */
 /**
  * Creates a tingbot instance and loads modules
  *
  * @constructor
  * @function
  * @exports tingbot
  * @example <caption>create a tingbot-node instance called tingbot</caption>
  * var tb = require('tingbot-node'), tingbot = new tb();
  * @param {Object} options
  * @param {Array.<String>} options.modules (['buttons', 'backlight']) If you only want do set the backlight, you don't need to load wiring-pi
  */

const TingbotNode = module.exports = function tingbot(options) {
	this.options = options || {};
	//start those modules
	this.options.modules = this.options.modules || ['buttons', 'backlight'];
	this.init();
};



/**
 * loads modules set in this.options.modules once internally.
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
 * @param {function} cb callback function to be called with event specific argument payload
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
 * @param {function} cb callback function to be called with event specific argument payload
 */
TingbotNode.prototype.once = function (evname, cb) {
	ev.once(evname, cb);
};

/**
 * Sets a new brightness value, tweens if do_tween is true. Alias for tingbot.backlight.set_backlight
 * @function
 * @memberof tingbot
 * @fires tingbot#backlight
 * @example <caption>set backlight value</caption>
 * tingbot.backlight.set_backlight(99999, function(val){
 * 	console.log('done', val);
 * });
 * @name set_backlight
 * @param {number} num the new brightness value
 * @param {function} cb callback when ready, gets value as argument
 */
