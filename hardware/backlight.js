// var sys = require('sys')
const exec = require('child_process').exec;
const shifty = require('shifty');

const ev = require('../lib/event');

function run(cmd, cb) {
	exec(cmd, function(error, stdout, stderr) {
		if (error !== null) {
			console.log('exec error: ', error);
		}
		cb && cb(error, stdout, stderr);
	});
}

/**
 * Backlight control module
 * @constructor
 */

// max visible changes sometimes up to 1000 instead of 65536… why?
var Backlight = function Backlight(min_backlight = 0, max_backlight = 65536) {
	this.ensure_backlight_setup();

	this.min_backlight = min_backlight;
	this.max_backlight = max_backlight;
	this.current_backlight = max_backlight;
	this.do_tween = false;
	this._tween_not_ready = false;
	this.tweenable = new shifty({
		current_backlight: this.current_backlight
	});
};
/*
 * Internally used (no arguments check) for tweening to a new brightness value
 * @param {number} num – the new brightness value
 * @param {function} cb – callback when ready TODO only current backlight as argument
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
		duration: 400,
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

			cb && cb(obj);
		}
	})

};

/*
 * Sets a new brightness value, tweens if do_tween is true
 * @param {number} num – the new brightness value
 * @param {function} cb – callback when ready TODO only current backlight as argument
 */

Backlight.prototype.set_backlight = function set_backlight(num, cb) {
	if (this._tween_not_ready) {
		cb && cb();

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
		cb && cb();
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
			cb && cb();
		});
	});
}
module.exports = new Backlight();
