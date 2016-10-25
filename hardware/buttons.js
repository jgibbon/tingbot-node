const shifty = require('shifty');
const wpi = require('wiring-pi');
const ev = require('../lib/event');

const fs = require('fs');
const isRaspbian = !!fs.readFileSync('/etc/os-release', 'utf-8').match(/Raspbian/);

/**
 * The Buttons Module is available as `tingbot.buttons`, but normally you should just listen to events fired by it via `tingbot.on` or `tingbot.once`. It emits the following events:
 * <br><ul><li>
 * `button`: Emitted when any Button is pressed or released.
 * </li><li>
 * `button#[0-3]`: Emitted when Button number [0-3] (from left to right) is pressed or released.
 * </li><li>
 * `button-[name]`: Emitted when Button [name] is pressed or released. [name] can be `left`, `center-left`,  `center-right`, `right`.
 * </li><li>
 * `button-[pin]`: Emitted when Button on Pin number [pin] is pressed or released.<br /><br />
 * </li><li>
 * ` :down`: can be appended to only get press events. `tingbot.on('button#3:down', function(){})`
 * </li><li>
 * ` :up`: can be appended to only get release events. `tingbot.on('button-left:up', function(){})`
 * </li>
 * </ul>
 * @namespace tingbot.buttons
 * @example
 * //To listen to press/release events on one Button,
 * //you'll likely want to access it by name:
 *  tingbot.on('button-center-left', function (data) {
 *  	if (data.direction === 'up') { //do something when the button is released:
 *  		console.log(data.name + ' released:', data);
 *  	}
 *  });
 *  //… or by number:
 *  tingbot.on('button#0', function (data) {
 *  	if (data.direction === 'down') { //do something when the button is pressed:
 *  		console.log(data.name + ' pressed:', data);
 *  	}
 *  });
 *
 **/

/**
 * The Button event listener module gets loaded and exposed as
 * {@link tingbot.buttons}

 * @constructor
 * @function
 * @name buttons
 * @exports tingbot.buttons
 */
const Buttons = function Buttons() {
    var now = new Date();
    /**
     * Array of four current button states
     * @type Array.<tingbot#event:button>
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
    if (isRaspbian) {
        wpi.wiringPiSetupGpio();
    }

    for (let i = 0; i < this.buttons.length; i++) {
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
 * @property {String} type - is 'button'.
 * @property {String} name - one of 'left', 'center-left', 'center-right' or 'right'.
 * @property {String} direction - is the button pressed or released? 'up' or 'down'.
 * @property {number} pin - button pin number.
 * @property {Date} changed - date of last change.
 * @property {Date} changed_before - date of previous change to get an idea how long a button was pressed.
 * @property {number} value - button return value.
 * @property {Boolean} isdown - is the button currently pressed down.
 * @example <caption>listen to a release button event</caption>
 * tingbot.on('button-left:up', function(data) {
 *  console.log('button left released', data);
 * });
 */

/**
 * internal: Set button changed. Used by wiring-pi callback and simulate methods.
 * @param {number} number button index
 * @param {Boolean} isdown  true: press; false: release
 * @param {Array} buttons since this isn't scoped within tingbot.buttons, those are given via argument
 * @fires tingbot#button
 */
const setButtonChanged = function(number, isdown, buttons) {
    //put out more events than anyone should need:
    buttons[number].isdown = isdown;
    buttons[number].direction = isdown ? 'down' : 'up';
    buttons[number].changed_before = buttons[number].changed;
    buttons[number].changed = new Date();
    ev.emit('button', buttons[number]);
    ev.emit('button:' + buttons[number].direction, buttons[number]);
    ev.emit('button#' + number, buttons[number]);
    ev.emit('button#' + number + ':' + buttons[number].direction, buttons[number]);
    ev.emit('button-' + buttons[number].name, buttons[number]);
    ev.emit('button-' + buttons[number].name + ':' + buttons[number].direction, buttons[number]);
    ev.emit('button/' + buttons[number].pin, buttons[number]);
    ev.emit('button/' + buttons[number].pin + ':' + buttons[number].direction, buttons[number]);
};

/**
 * internal: set pin callback
 * @name tingbot.buttons.setPinCallback
 * @param {number} pin    pin number
 * @param {number} number button index
 * @param {string} name   button name
 */
Buttons.prototype.setPinCallback = function setPinCallback(pin, number, name) {
    const self = this;

    if (!isRaspbian) {
        return;
    }
    wpi.pinMode(pin, wpi.INPUT);

    wpi.wiringPiISR(pin, wpi.INT_EDGE_BOTH, function(delta) {
        let isdown = !!wpi.digitalRead(pin);
        if (isdown !== self.buttons[number].isdown) {
            self.buttons[number].value = delta;
            setButtonChanged(number, isdown, self.buttons);
        }
    });
};
/**
 * Simulate a button press action. Remember to release the button afterwards. Will fire an event, if the button is already pressed. Might not actually move the physical button.
 * @name tingbot.buttons.simulateDown
 * @param  {number} number Number of the button to be pressed (0-3)
 */
Buttons.prototype.simulateDown = function(number) {
    setButtonChanged(number, true, this.buttons);
};

/**
 * Simulate a button release action. Will fire an event, if the button is already released. Might not actually move the physical button.
 * @name tingbot.buttons.simulateUp
 * @param  {number} number Number of the button to be released (0-3)
 */
Buttons.prototype.simulateUp = function(number) {
    setButtonChanged(number, false, this.buttons);
};

module.exports = new Buttons();
