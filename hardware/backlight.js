const exec = require('child_process').exec;
const shifty = require('shifty');
const ev = require('../lib/event');
const fs = require('fs');
const isRaspbian = !!fs.readFileSync('/etc/os-release', 'utf-8').match(/Raspbian/);
/**
 * Internal function to run gpio shell commands.
 * Beware: Usually run with sudo! (There is no password handling, because by default,
 *  linux user 'pi' is allowed to sudo without a password.)
 *
 * @param  {string}   cmd Command to be exected
 * @param  {Function} cb (error, stdout, stderr): callback when ready.
 */
const run = function(cmd, cb) {
    if (!isRaspbian) {
        if (cb) {
            cb('exec: not running on raspbian, aborting gpio command', null, null);
        }
        return;
    }
    exec(cmd, function(error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ', error);
        }
        if (cb) {
            cb(error, stdout, stderr);
        }
    });
};

/**
 *
 * The Backlight module is available as `tingbot.backlight`.
 * Set `tingbot.backlight.do_tween = true;` for a somewhat smoother brightness change.
 *
 * The module emits the following events via `tingbot.on` or `tingbot.once`:
 *  - `backlight`: Emitted when tingbot-node has finished updating the LCD backlight brightness
 *  - `backlight:tween`: Emitted at every tweening step if tweening is activated
 *  - `backlight:tweendone`: Emitted when tweening is finished
 *
 *	@example
 *  tingbot.on('backlight', function(obj) {
 *  	console.log('backlight event:', obj.value);
 *  });
 * // run `tingbot.backlight.set_backlight` or short `tingbot.set_backlight` to set brightness
 * tingbot.set_backlight(0, function() {
 * 	//does a lot of brightness updates, but can look nice:
 * 	tingbot.backlight.do_tween = true;
 * 	setTimeout(function() {
 * 		//high values will set to maximum
 * 		tingbot.set_backlight(300000);
 * 	}, 1500);
 * });
 * @namespace tingbot.backlight
 */

/**
 * Backlight module. Gets loaded and exposed as
 * {@link tingbot.backlight}
 * @constructor
 * @class backlight
 * @function
 * @name backlight
 * @exports tingbot.backlight

 * @param {number} min_backlight minimum backlight value (default:0)
 * @param {number} max_backlight maximum backlight value (default:65536)
 */
const Backlight = function Backlight(min_backlight, max_backlight) {
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


    //set backlight once, because on first start after a reboot, the display may go dark :(
    this.set_backlight(this.max_backlight);

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
    const self = this;
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
            //
            const evdata = {
                type: 'backlight',
                value: num
            };
            self.current_backlight = num;

            self._tween_not_ready = true;
            run('sudo gpio -g pwm 18 "' + self.current_backlight + '"', function() {
                ev.emit('backlight:tweendone', evdata);
                ev.emit('backlight', evdata);

                self._tween_not_ready = false;
                if (cb) {
                    cb(evdata);
                }
            });
        }
    });

};


/**
 * gets called when set_backlight is done.
 * @callback tingbot.backlight~setBrightnessCallback
 * @param {object} tingbot_event
 * @param {string} tingbot_event.type is 'brightness'
 * @param {number} tingbot_event.value brightness value
 */

/**
 * Sets a new brightness value, tweens if do_tween is true
 * @function
 * @memberof tingbot.backlight
 * @fires tingbot#backlight
 * @example <caption>set backlight to maximum:</caption>
 * tingbot.backlight.set_backlight(tingbot.backlight.max_backlight, function(val){
 * 	console.log('done', val);
 * });
 * @name set_backlight
 * @param {number} num new brightness value
 * @param {tingbot.backlight~setBrightnessCallback} [cb] callback when ready
 */

Backlight.prototype.set_backlight = function set_backlight(num, cb) {
    let evdata;

    // performance: abort if not ready
    if (this._tween_not_ready) {
        if (cb) {
            cb();
        }
        return;
    }

    // prepare event payload
    num = parseInt(num);
    if (num < this.min_backlight) {
        num = this.min_backlight;
    } else if (num > this.max_backlight) {
        num = this.max_backlight;
    }
    if (num === this.current_backlight) {
        return;
    }
    evdata = {
        type: 'backlight',
        value: num
    };

    //execute change
    if (!this.do_tween) {
        run('sudo gpio -g pwm 18 "' + num + '"');
        ev.emit('backlight', evdata);

        this.current_backlight = num;
        if (cb) {
            cb(evdata);
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
            if (cb) {
                cb();
            }
        });
    });
};
module.exports = new Backlight();
