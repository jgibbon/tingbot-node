# tingbot-node
An unofficial Node.js module to listen for `buttons` pressed and control `backlight` brightness on a tingbot-equipped raspberry pi running a configured Raspbian.


## Installation ##
The Tingbot Hardware should already be configured and running – this will not install any drivers or configure your system.

The preinstalled version of Node.js on Raspbian is pretty ancient. Make sure you have installed at least the [current stable version](https://github.com/jgibbon/tingbot-node/blob/master/docs/installnode.md) including npm.

> To get a simple Node.js project, just create a directory for it somewhere, place an index.js in it and run `npm init` there.

Install tingbot-node first. While wiring-pi installs, you can just keep reading here.
```bash
npm install tingbot-node --save
```

## How To… ##
Use it in your .js file:
```javascript
var tb = require('tingbot-node');
var tingbot = new tb();
```
 > Keep in Mind:
 >
 > - The Button Module uses `wiring-pi` – which needs to be run with sufficient user rights to access GPIO – which most likely means running your whole script with sudo, eg. `sudo node ./index.js`.
 > - The Backlight Module executes gpio commands via shell using sudo. So you could only use the Backlight module such as this: `var tingbot = new tb({modules:['backlight']});` to prevent an error while running without sudo. Default: `modules:['backlight', 'buttons']`


### Buttons
The Buttons Module is available as `tingbot.buttons`, but normally you should just listen to events fired by it via `tingbot.on` or `tingbot.once`. It emits the following events:
 - `button`: Emitted when any Button is pressed or released.
 - `button#[0-3]`: Emitted when Button number [0-3] (from left to right) is pressed or released.
 - `button-[name]`: Emitted when Button [name] is pressed or released. [name] can be `left`, `center-left`,  `center-right`, `right`.
 - `button-[pin]`: Emitted when Button on Pin number [pin] is pressed or released.
 - ` :down`: can be appended to only get press events. `tingbot.on('button#3:down', function(){})`
 - ` :up`: can be appended to only get release events. `tingbot.on('button-left:up', function(){})`


To listen to press/release events on one Button, you'll likely want to access it by name:
```javascript
tingbot.on('button-center-left', function (data) {
	if (data.direction === 'up') { //do something when the button is released:
		console.log(data.name + ' released:', data);
	}
});
```
… or by number:
```javascript
tingbot.on('button#0', function (data) {
	if (data.direction === 'down') { //do something when the button is pressed:
		console.log(data.name + ' pressed:', data);
	}
});
```
### Backlight
The Backlight module is available as `tingbot.backlight`. Set `tingbot.backlight.do_tween = true;` for a somewhat smoother brightness change. The module emits the following events via `tingbot.on` or `tingbot.once`:
 - `backlight`: Emitted when tingbot-node has finished updating the LCD backlight brightness
 - `backlight:tween`: Emitted at every tweening step if tweening is activated
 - `backlight:tweendone`: Emitted when tweening is finished


 ```javascript
 tingbot.on('backlight', function(obj) {
 	console.log('backlight event:', obj.value);
 });
 ```
run `tingbot.backlight.set_backlight` or short `tingbot.set_backlight` to set brightness
```javascript
// set backlight value
tingbot.set_backlight(0, function() {
	//does a lot of brightness updates, but can look nice:
	tingbot.backlight.do_tween = true;
	setTimeout(function() {
		//high values will set to maximum
		tingbot.set_backlight(300000);
	}, 1500);
});
```
## More examples:
You could combine both modules to set the backlight brightness when Buttons are pressed. In this example, the outer buttons set the value to minimum/maximum, while pressing the inner buttons de-/increases in steps:
```javascript
//get all button down events and modify brightness
tingbot.on('button:down', function onBtn(data) {

	var steps = 9,
		range = tingbot.backlight.max_backlight - tingbot.backlight.min_backlight,
		step = range / steps;
	//new values for button pressess:
	var values = [
			tingbot.backlight.min_backlight,
			tingbot.backlight.current_backlight - step,
			tingbot.backlight.current_backlight + step,
			tingbot.backlight.max_backlight
		];

	if (data.number in values) {
		tingbot.set_backlight(values[data.number]);
	}
});
```
Or just exit the application when pressing both inner buttons for a while, a bit like on tingbot-os:

```javascript

//check middle buttons pressed for a bit:
var checkTimeout;
var checkFunc = function(cb){
		return tingbot.buttons.buttons[1].isdown &&
			tingbot.buttons.buttons[2].isdown;
}
tingbot.on('button:down', function(btn){
	if([1,2].indexOf(btn.number) >= 0 && checkFunc()) { //only listen for both middle buttons
		clearTimeout(checkTimeout);
		checkTimeout = setTimeout(function dostuff() {
				if(checkFunc()) {
					console.log('middle buttons still pressed!');
					// do something… drastic
					process.exit();
				}
		}, 1200);
	}
})

```

If you've read all this and didn't find what you were looking for, there's more in the [API documentation](https://github.com/jgibbon/tingbot-node/blob/master/docs/API.md).
