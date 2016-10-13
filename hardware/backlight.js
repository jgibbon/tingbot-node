const exec = require('child_process').exec;
const shifty = require('shifty');
const ev = require('../lib/event');

function run(cmd, cb) {
	exec(cmd, function(error, stdout, stderr) {
		if (error !== null) {
			console.log('exec error: ', error);
		}
		if(cb) {
			 cb(error, stdout, stderr);
		 }
	});
}
/**
 * @namespace tingbot.backlight
 */

/**
 * Backlight module. Gets loaded and exposed as the tingbot.backlight namespace
 * @constructor
 * @class backlight
 * @function
 * @name backlight
 * @exports tingbot.backlight

 * @param {number} min_backlight minimum backlight value (default:0)
 * @param {number} max_backlight maximum backlight value (default:65536)
 */
var Backlight = function Backlight(min_backlight, max_backlight) {
	this.ensure_backlight_setup();
 // max visible changes sometimes up to 1000 instead of 65536… why?
	/**
	 * Minimum brightness value to allow
	 * @type Number
	 * @default 0
	 * @name tingbot.backlight.min_backlight
	 */
	this.min_backlight = min_backlight || 0;
	/**
	 * Maximum brightness value to allow
	 * @type Number
	 * @default 65536
	 * @name tingbot.backlight.max_backlight
	 */
	this.max_backlight = max_backlight || 65536;

	/**
	 * Last set brightness value
	 * @type Number
   * @example
   * console.log(tingbot.backlight.current_backlight);
	 * @name tingbot.backlight.current_backlight
	 */
	this.current_backlight = max_backlight;

	/**
	 * Try to smooth brightness changes
	 * @type Boolean
	 * @default false
   * @example <caption>enable smooth backlight changes:</caption>
   * tingbot.backlight.do_tween = true;
	 * @name tingbot.backlight.do_tween
	 */
	this.do_tween = false;

	/**
	 * Internal Variable to throw away requests when the old one isn't ready
	 * @ name tingbot.backlight._tween_not_ready
	 * @type Boolean
	 * @default false
	 */
	this._tween_not_ready = false;

		/**
		 * Tween instance
		 * @name tingbot.backlight.tweenable
		 * @type {shifty}
		 */
		this.tweenable = new shifty({
			current_backlight: this.current_backlight
		});

		/**
		 * Tween duration in ms
		 * @name tingbot.backlight.tween_duration
		 * @type {number}
		 * @default 400
		 */
		this.tween_duration = 400;
	};


/**
 * Backlight event. Emitted as 'backlight' when a change has occurred,
 * 'backlight:tweendone' when a tween is finished or 'backlight:tween' on every tween step
 *
 * @event tingbot#backlight
 * @example <caption>listen to a backlight change event</caption>
 * tingbot.on('backlight', function(data) {
 *  console.log('done', data);
 * });
 * @type {object}
 * @property {String} type - is 'backlight'.
 * @property {number} value - changed brightness value.
 */

/*
 * Internally used (no arguments check) for tweening to a new brightness value
 * @param {number} num the new brightness value
 * @param {function} cb callback when ready TODO only current backlight as argument
 * @fires tingbot#backlight
 */
Backlight.prototype._tween_backlight = function(num, cb) {
	var self = this;
	this.tweenable.tween({
		from: {
			current_backlight: this.current_backlight
		},
		to: {
			current_backlight: num
		},
		duration: this.tween_duration,
		easing: 'easeOutQuad',
		start: function() {
			// console.log('backlight tween start');
		},
		step: function(obj, val, step) {
			if (self._tween_not_ready) {
				return;
			}
			self._tween_not_ready = true;
			self.current_backlight = obj.current_backlight;
			run('sudo gpio -g pwm 18 "' + self.current_backlight + '"', function stepdone() {
				ev.emit('backlight:tween', {
					type: 'backlight',
					value: self.current_backlight
				});
				self._tween_not_ready = false;
				// setTimeout(function() {
				// 	//throttle steps a bit
				// }, 1);
			});
		},
		finish: function(obj) {
			// console.log('backlight tween done');
			var evdata = {
				type: 'backlight',
				value: num
			};
			self.current_backlight = num;
			run('sudo gpio -g pwm 18 "' + self.current_backlight + '"');
			ev.emit('backlight:tweendone', evdata);
			ev.emit('backlight', evdata);

			if(cb) {
				 cb(num);
			 }
		}
	});

};

/**
 * Sets a new brightness value, tweens if do_tween is true
 * @function
 * @memberof tingbot.backlight
 * @fires tingbot#backlight
 * @example <caption>set backlight value</caption>
 * tingbot.backlight.set_backlight(99999, function(val){
 * 	console.log('done', val);
 * });
 * @name set_backlight
 * @param {number} num the new brightness value
 * @param {function} cb callback when ready, gets value as argument
 */

Backlight.prototype.set_backlight = function set_backlight(num, cb) {
	if (this._tween_not_ready) {
		if(cb) {
			cb();
		}

		return;
	}
	num = parseInt(num);
	if (num < this.min_backlight) {
		num = this.min_backlight;
	} else if (num > this.max_backlight) {
		num = this.max_backlight;
	}
	if (num === this.current_backlight) {
		return;
	}
	if (!this.do_tween) {
		run('sudo gpio -g pwm 18 "' + num + '"');
		var evdata = {
			type: 'backlight',
			value: num
		};
		ev.emit('backlight', evdata);

		this.current_backlight = num;
		if(cb) {
			cb(num);
		}
	} else {
		this._tween_backlight(num, cb);
	}
};


/*
 * Setup Display GPIO
 * @param {function} cb – callback when ready
 */

Backlight.prototype.ensure_backlight_setup = function ensure_backlight_setup(cb) {
	//
	run('sudo gpio -g mode 18 pwm', function() {
		run('sudo gpio -g pwmr 65536', function() {
			this.issetup = true;
			if(cb) {
				cb();
			}
		});
	});
};
module.exports = new Backlight();
