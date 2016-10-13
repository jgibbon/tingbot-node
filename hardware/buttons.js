
var shifty = require('shifty');
var wpi = require('wiring-pi');
const ev = require('../lib/event');

/**
 * @namespace tingbot.buttons
 */

/**
 * The Button event listener module gets loaded and exposed as the tingbot.buttons namespace

 * @constructor
 * @function
 * @name buttons
 * @exports tingbot.buttons
 */
var Buttons = function Buttons() {
	var now = new Date();
	/**
	 * Current Button states. Array of four current button states as returned with the tingbot.on('button') event.
	 * @type Array
	 * @name tingbot.buttons.buttons
	 */
	this.buttons = [{
		type: 'button',
		changed: now,
		changed_before: now,
		number: 0,
		pin: 17,
		name: 'left',
		value: null,
		isdown: false,
		direction: 'up'
	}, {
		type: 'button',
		changed: now,
		changed_before: now,
		number: 1,
		pin: 23,
		name: 'center-left',
		value: null,
		isdown: false,
		direction: 'up'
	}, {
		type: 'button',
		changed: now,
		changed_before: now,
		number: 2,
		pin: 24,
		name: 'center-right',
		value: null,
		isdown: false,
		direction: 'up'
	}, {
		type: 'button',
		changed: now,
		changed_before: now,
		number: 3,
		pin: 14,
		name: 'right',
		value: null,
		isdown: false,
		direction: 'up'
	}];
	wpi.wiringPiSetupGpio();

	for (var i = 0; i < this.buttons.length; i++) {
		this.setPinCallback(this.buttons[i].pin, i, this.buttons[i].name);
	}
};
/**
 * Button event. Emitted as 'button' when a change has occurred, but can be optionally suffixed to get selector behavior:<br />
 *
 * `button`: Emitted when any Button is pressed or released.<br />
 * `button#[0-3]`: Emitted when Button number [0-3] (from left to right) is pressed or released.<br />
 * `button-[name]`: Emitted when Button [name] is pressed or released. [name] can be `left`, `center-left`,  `center-right`, `right`.<br />
 * `button-[pin]`: Emitted when Button on Pin number [pin] is pressed or released.<br />
 * ` :down`: can be appended to only get press events.<br />
 * ` :up`: can be appended to only get release events.
 * @event tingbot#button
 * @type {object}
 * @example <caption>listen to a release button event</caption>
 * tingbot.on('button-left:up', function(data) {
 *  console.log('button left released', data);
 * });
 * @property {String} type - is 'button'.
 * @property {String} name - one of 'left', 'center-left', 'center-right' or 'right'.
 * @property {String} direction - is the button pressed or released? 'up' or 'down'.
 * @property {number} pin - button pin number.
 * @property {Date} changed - date of last change
 * @property {Date} changed_before - date of previous change to get an idea how long a button was pressed
 * @property {number} value - button return value.
 * @property {Boolean} isdown - is the button currently pressed down.
 */
/**
 * internal: set pin callback
 * @name tingbot.buttons.setPinCallback
 * @param {number} pin    pin number
 * @param {number} number button index
 * @fires tingbot#button
 * @param {string} name   button name
 */
Buttons.prototype.setPinCallback = function setPinCallback(pin, number, name) {
	var self = this;
	wpi.pinMode(pin, wpi.INPUT);

	wpi.wiringPiISR(pin, wpi.INT_EDGE_BOTH, function(delta) {
		var isdown = (self.buttons[number].value === null || delta > self.buttons[number].value);
		if (isdown === self.buttons[number].isdown) { //not entirely comfortable with this
			isdown = !isdown;
		}
		//put out more events than anyone should need:
		self.buttons[number].value = delta;
		self.buttons[number].isdown = isdown;
		self.buttons[number].direction = isdown ? 'down' : 'up';
		self.buttons[number].changed_before = self.buttons[number].changed;
		self.buttons[number].changed = new Date();
		ev.emit('button', self.buttons[number]);
		ev.emit('button:' + self.buttons[number].direction, self.buttons[number]);
		ev.emit('button#' + number, self.buttons[number]);
		ev.emit('button#' + number +':' + self.buttons[number].direction, self.buttons[number]);
		ev.emit('button-' +  self.buttons[number].name, self.buttons[number]);
		ev.emit('button-' +  self.buttons[number].name+':' + self.buttons[number].direction, self.buttons[number]);
		ev.emit('button/' + pin, self.buttons[number]);
		ev.emit('button/' + pin+':' + self.buttons[number].direction, self.buttons[number]);
	});
};

module.exports = new Buttons();
