
var shifty = require('shifty');
var wpi = require('wiring-pi');
const ev = require('../lib/event');

/**
 * The Button event listener module
 * @constructor
 */
var Buttons = function Buttons() {
	var now = new Date();
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

Buttons.prototype.ensure_gpio_setup = function ensure_gpio_setup(cb) {
	wpi.wiringPiSetupGpio();
}
module.exports = new Buttons();
