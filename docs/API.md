# tingbot-node API Documentation #


## Modules

<dl>
<dt><a href="#module_tingbot">tingbot</a></dt>
<dd><p>Not really a Module, but the main constructor. Creates a <a href="#tingbot">tingbot</a> instance and loads optional tingbot submodules (<a href="#tingbot.backlight">backlight</a>, <a href="#tingbot.buttons">buttons</a>).</p>
</dd>
<dt><a href="#module_backlight">backlight</a></dt>
<dd><p>Backlight module. Gets loaded and exposed as
<a href="#tingbot.backlight">backlight</a></p>
</dd>
<dt><a href="#module_buttons">buttons</a></dt>
<dd><p>The Button event listener module gets loaded and exposed as
<a href="#tingbot.buttons">buttons</a></p>
</dd>
</dl>

## Objects

<dl>
<dt><a href="#tingbot">tingbot</a> : <code>object</code></dt>
<dd><p>tingbot-node itself. exposes optional tingbot submodules (<a href="#tingbot.backlight">backlight</a>, <a href="#tingbot.buttons">buttons</a>), event listeners and convenience functions</p>
</dd>
</dl>

<a name="module_tingbot"></a>

## tingbot
Not really a Module, but the main constructor. Creates a [tingbot](#tingbot) instance and loads optional tingbot submodules ([backlight](#tingbot.backlight), [buttons](#tingbot.buttons)).


| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> |  |
| options.modules | <code>Array.&lt;String&gt;</code> | (['buttons', 'backlight']) If you only want do set the backlight, you don't need to load wiring-pi |

**Example** *(create a tingbot-node instance called tingbot)*  
```js
var tb = require('tingbot-node'), tingbot = new tb();
```

* [tingbot](#module_tingbot)
    * _instance_
        * [.init()](#module_tingbot+init)
    * _inner_
        * [~run(cmd, cb)](#module_tingbot..run)

<a name="module_tingbot+init"></a>

### tingbot.init()
Loads modules set in this.options.modules once internally and self-destructs. Don't use.

**Kind**: instance method of <code>[tingbot](#module_tingbot)</code>  
<a name="module_tingbot..run"></a>

### tingbot~run(cmd, cb)
Internal function to run gpio shell commands.
Beware: Usually run with sudo! (There is no password handling, because by default,
 linux user 'pi' is allowed to sudo without a password.)

**Kind**: inner method of <code>[tingbot](#module_tingbot)</code>  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> | Command to be exected |
| cb | <code>function</code> | (error, stdout, stderr): callback when ready. |

<a name="module_backlight"></a>

## backlight
Backlight module. Gets loaded and exposed as
[backlight](#tingbot.backlight)


| Param | Type | Description |
| --- | --- | --- |
| min_backlight | <code>number</code> | minimum backlight value (default:0) |
| max_backlight | <code>number</code> | maximum backlight value (default:65536) |

<a name="module_buttons"></a>

## buttons
The Button event listener module gets loaded and exposed as
[buttons](#tingbot.buttons)

<a name="module_buttons..setButtonChanged"></a>

### buttons~setButtonChanged(number, isdown, buttons)
internal: Set button changed. Used by wiring-pi callback and simulate methods.

**Kind**: inner method of <code>[buttons](#module_buttons)</code>  
**Emits**: <code>[button](#tingbot+event_button)</code>  

| Param | Type | Description |
| --- | --- | --- |
| number | <code>number</code> | button index |
| isdown | <code>Boolean</code> | true: press; false: release |
| buttons | <code>Array</code> | since this isn't scoped within tingbot.buttons, those are given via argument |

<a name="tingbot"></a>

## tingbot : <code>object</code>
tingbot-node itself. exposes optional tingbot submodules ([backlight](#tingbot.backlight), [buttons](#tingbot.buttons)), event listeners and convenience functions

**Kind**: global namespace  
**Example** *(create a tingbot-node instance called tingbot)*  
```js
var tb = require('tingbot-node'), tingbot = new tb();
//use tingbot.on or tingbot.set_backlight
```

* [tingbot](#tingbot) : <code>object</code>
    * _instance_
        * ["backlight"](#tingbot+event_backlight)
        * ["button"](#tingbot+event_button)
    * _static_
        * [.backlight](#tingbot.backlight) : <code>object</code>
            * _static_
                * [.min_backlight](#tingbot.backlight.min_backlight) : <code>Number</code>
                * [.max_backlight](#tingbot.backlight.max_backlight) : <code>Number</code>
                * [.current_backlight](#tingbot.backlight.current_backlight) : <code>Number</code>
                * [.do_tween](#tingbot.backlight.do_tween) : <code>Boolean</code>
                * [.tweenable](#tingbot.backlight.tweenable) : <code>shifty</code>
                * [.tween_duration](#tingbot.backlight.tween_duration) : <code>number</code>
                * [.set_backlight(num, [cb])](#tingbot.backlight.set_backlight)
            * _inner_
                * [~setBrightnessCallback](#tingbot.backlight..setBrightnessCallback) : <code>function</code>
        * [.buttons](#tingbot.buttons) : <code>object</code>
            * [.buttons](#tingbot.buttons.buttons) : <code>[Array.&lt;button&gt;](#tingbot+event_button)</code>
            * [.setPinCallback](#tingbot.buttons.setPinCallback)
            * [.simulateDown](#tingbot.buttons.simulateDown)
            * [.simulateUp](#tingbot.buttons.simulateUp)
        * [.set_backlight(num, [cb])](#tingbot.set_backlight)
        * [.on(evname, cb)](#tingbot.on)
        * [.once(evname, cb)](#tingbot.once)
    * _inner_
        * [~onCallback](#tingbot..onCallback) : <code>function</code>

<a name="tingbot+event_backlight"></a>

### "backlight"
Backlight event. Emitted as 'backlight' when a change has occurred,
'backlight:tweendone' when a tween is finished or 'backlight:tween' on every tween step

**Kind**: event emitted by <code>[tingbot](#tingbot)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | is 'backlight'. |
| value | <code>number</code> | changed brightness value. |

**Example** *(listen to a backlight change event)*  
```js
tingbot.on('backlight', function(data) {
 console.log('done', data);
});
```
<a name="tingbot+event_button"></a>

### "button"
Button event. Emitted as 'button' when a change has occurred, but can be optionally suffixed to get selector behavior:<br />

`button`: Emitted when any Button is pressed or released.<br />
`button#[0-3]`: Emitted when Button number [0-3] (from left to right) is pressed or released.<br />
`button-[name]`: Emitted when Button [name] is pressed or released. [name] can be `left`, `center-left`,  `center-right`, `right`.<br />
`button-[pin]`: Emitted when Button on Pin number [pin] is pressed or released.<br />
` :down`: can be appended to only get press events.<br />
` :up`: can be appended to only get release events.

**Kind**: event emitted by <code>[tingbot](#tingbot)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | is 'button'. |
| name | <code>String</code> | one of 'left', 'center-left', 'center-right' or 'right'. |
| direction | <code>String</code> | is the button pressed or released? 'up' or 'down'. |
| pin | <code>number</code> | button pin number. |
| changed | <code>Date</code> | date of last change. |
| changed_before | <code>Date</code> | date of previous change to get an idea how long a button was pressed. |
| value | <code>number</code> | button return value. |
| isdown | <code>Boolean</code> | is the button currently pressed down. |

**Example** *(listen to a release button event)*  
```js
tingbot.on('button-left:up', function(data) {
 console.log('button left released', data);
});
```
<a name="tingbot.backlight"></a>

### tingbot.backlight : <code>object</code>
The Backlight module is available as `tingbot.backlight`.
Set `tingbot.backlight.do_tween = true;` for a somewhat smoother brightness change.

The module emits the following events via `tingbot.on` or `tingbot.once`:
 - `backlight`: Emitted when tingbot-node has finished updating the LCD backlight brightness
 - `backlight:tween`: Emitted at every tweening step if tweening is activated
 - `backlight:tweendone`: Emitted when tweening is finished

**Kind**: static namespace of <code>[tingbot](#tingbot)</code>  
**Example**  
```js
tingbot.on('backlight', function(obj) {
 	console.log('backlight event:', obj.value);
 });
// run `tingbot.backlight.set_backlight` or short `tingbot.set_backlight` to set brightness
tingbot.set_backlight(0, function() {
	//does a lot of brightness updates, but can look nice:
	tingbot.backlight.do_tween = true;
	setTimeout(function() {
		//high values will set to maximum
		tingbot.set_backlight(300000);
	}, 1500);
});
```

* [.backlight](#tingbot.backlight) : <code>object</code>
    * _static_
        * [.min_backlight](#tingbot.backlight.min_backlight) : <code>Number</code>
        * [.max_backlight](#tingbot.backlight.max_backlight) : <code>Number</code>
        * [.current_backlight](#tingbot.backlight.current_backlight) : <code>Number</code>
        * [.do_tween](#tingbot.backlight.do_tween) : <code>Boolean</code>
        * [.tweenable](#tingbot.backlight.tweenable) : <code>shifty</code>
        * [.tween_duration](#tingbot.backlight.tween_duration) : <code>number</code>
        * [.set_backlight(num, [cb])](#tingbot.backlight.set_backlight)
    * _inner_
        * [~setBrightnessCallback](#tingbot.backlight..setBrightnessCallback) : <code>function</code>

<a name="tingbot.backlight.min_backlight"></a>

#### backlight.min_backlight : <code>Number</code>
Minimum brightness value to allow

**Kind**: static property of <code>[backlight](#tingbot.backlight)</code>  
**Default**: <code>0</code>  
<a name="tingbot.backlight.max_backlight"></a>

#### backlight.max_backlight : <code>Number</code>
Maximum brightness value to allow

**Kind**: static property of <code>[backlight](#tingbot.backlight)</code>  
**Default**: <code>65536</code>  
<a name="tingbot.backlight.current_backlight"></a>

#### backlight.current_backlight : <code>Number</code>
Last set brightness value

**Kind**: static property of <code>[backlight](#tingbot.backlight)</code>  
**Example**  
```js
console.log(tingbot.backlight.current_backlight);
```
<a name="tingbot.backlight.do_tween"></a>

#### backlight.do_tween : <code>Boolean</code>
Try to smooth brightness changes

**Kind**: static property of <code>[backlight](#tingbot.backlight)</code>  
**Default**: <code>false</code>  
**Example** *(enable smooth backlight changes:)*  
```js
tingbot.backlight.do_tween = true;
```
<a name="tingbot.backlight.tweenable"></a>

#### backlight.tweenable : <code>shifty</code>
Tween instance

**Kind**: static property of <code>[backlight](#tingbot.backlight)</code>  
<a name="tingbot.backlight.tween_duration"></a>

#### backlight.tween_duration : <code>number</code>
Tween duration in ms

**Kind**: static property of <code>[backlight](#tingbot.backlight)</code>  
**Default**: <code>400</code>  
<a name="tingbot.backlight.set_backlight"></a>

#### backlight.set_backlight(num, [cb])
Sets a new brightness value, tweens if do_tween is true

**Kind**: static method of <code>[backlight](#tingbot.backlight)</code>  
**Emits**: <code>[backlight](#tingbot+event_backlight)</code>  

| Param | Type | Description |
| --- | --- | --- |
| num | <code>number</code> | new brightness value |
| [cb] | <code>[setBrightnessCallback](#tingbot.backlight..setBrightnessCallback)</code> | callback when ready |

**Example** *(set backlight to maximum:)*  
```js
tingbot.backlight.set_backlight(tingbot.backlight.max_backlight, function(val){
	console.log('done', val);
});
```
<a name="tingbot.backlight..setBrightnessCallback"></a>

#### backlight~setBrightnessCallback : <code>function</code>
gets called when set_backlight is done.

**Kind**: inner typedef of <code>[backlight](#tingbot.backlight)</code>  

| Param | Type | Description |
| --- | --- | --- |
| tingbot_event | <code>object</code> |  |
| tingbot_event.type | <code>string</code> | is 'brightness' |
| tingbot_event.value | <code>number</code> | brightness value |

<a name="tingbot.buttons"></a>

### tingbot.buttons : <code>object</code>
The Buttons Module is available as `tingbot.buttons`, but normally you should just listen to events fired by it via `tingbot.on` or `tingbot.once`. It emits the following events:
<br><ul><li>
`button`: Emitted when any Button is pressed or released.
</li><li>
`button#[0-3]`: Emitted when Button number [0-3] (from left to right) is pressed or released.
</li><li>
`button-[name]`: Emitted when Button [name] is pressed or released. [name] can be `left`, `center-left`,  `center-right`, `right`.
</li><li>
`button-[pin]`: Emitted when Button on Pin number [pin] is pressed or released.<br /><br />
</li><li>
` :down`: can be appended to only get press events. `tingbot.on('button#3:down', function(){})`
</li><li>
` :up`: can be appended to only get release events. `tingbot.on('button-left:up', function(){})`
</li>
</ul>

**Kind**: static namespace of <code>[tingbot](#tingbot)</code>  
**Example**  
```js
//To listen to press/release events on one Button,
//you'll likely want to access it by name:
 tingbot.on('button-center-left', function (data) {
 	if (data.direction === 'up') { //do something when the button is released:
 		console.log(data.name + ' released:', data);
 	}
 });
 //… or by number:
 tingbot.on('button#0', function (data) {
 	if (data.direction === 'down') { //do something when the button is pressed:
 		console.log(data.name + ' pressed:', data);
 	}
 });
```

* [.buttons](#tingbot.buttons) : <code>object</code>
    * [.buttons](#tingbot.buttons.buttons) : <code>[Array.&lt;button&gt;](#tingbot+event_button)</code>
    * [.setPinCallback](#tingbot.buttons.setPinCallback)
    * [.simulateDown](#tingbot.buttons.simulateDown)
    * [.simulateUp](#tingbot.buttons.simulateUp)

<a name="tingbot.buttons.buttons"></a>

#### buttons.buttons : <code>[Array.&lt;button&gt;](#tingbot+event_button)</code>
Array of four current button states

**Kind**: static property of <code>[buttons](#tingbot.buttons)</code>  
<a name="tingbot.buttons.setPinCallback"></a>

#### buttons.setPinCallback
internal: set pin callback

**Kind**: static property of <code>[buttons](#tingbot.buttons)</code>  

| Param | Type | Description |
| --- | --- | --- |
| pin | <code>number</code> | pin number |
| number | <code>number</code> | button index |
| name | <code>string</code> | button name |

<a name="tingbot.buttons.simulateDown"></a>

#### buttons.simulateDown
Simulate a button press action. Remember to release the button afterwards. Will fire an event, if the button is already pressed. Might not actually move the physical button.

**Kind**: static property of <code>[buttons](#tingbot.buttons)</code>  

| Param | Type | Description |
| --- | --- | --- |
| number | <code>number</code> | Number of the button to be pressed (0-3) |

<a name="tingbot.buttons.simulateUp"></a>

#### buttons.simulateUp
Simulate a button release action. Will fire an event, if the button is already released. Might not actually move the physical button.

**Kind**: static property of <code>[buttons](#tingbot.buttons)</code>  

| Param | Type | Description |
| --- | --- | --- |
| number | <code>number</code> | Number of the button to be released (0-3) |

<a name="tingbot.set_backlight"></a>

### tingbot.set_backlight(num, [cb])
Sets a new brightness value, tweens if do_tween is true. Alias for [set_backlight](#tingbot.backlight.set_backlight)

**Kind**: static method of <code>[tingbot](#tingbot)</code>  
**Emits**: <code>[backlight](#tingbot+event_backlight)</code>  

| Param | Type | Description |
| --- | --- | --- |
| num | <code>number</code> | the new brightness value |
| [cb] | <code>[setBrightnessCallback](#tingbot.backlight..setBrightnessCallback)</code> | callback when ready, gets value as argument |

**Example** *(set backlight value)*  
```js
tingbot.backlight.set_backlight(99999, function(val){
	console.log('done', val);
});
```
<a name="tingbot.on"></a>

### tingbot.on(evname, cb)
Attaches Event listener to tingbot-node events.

**Kind**: static method of <code>[tingbot](#tingbot)</code>  

| Param | Type | Description |
| --- | --- | --- |
| evname | <code>string</code> | Event name, like 'button' |
| cb | <code>[onCallback](#tingbot..onCallback)</code> | callback function to be called with event specific argument payload |

**Example** *(listen to a release button event)*  
```js
tingbot.on('button-left:up',
 function(data) {
  console.log('button left released', data);
});
```
<a name="tingbot.once"></a>

### tingbot.once(evname, cb)
Attaches Event listener to tingbot-node events for only one event.

**Kind**: static method of <code>[tingbot](#tingbot)</code>  

| Param | Type | Description |
| --- | --- | --- |
| evname | <code>string</code> | Event name, like 'button' |
| cb | <code>[onCallback](#tingbot..onCallback)</code> | callback function to be called with event specific argument payload |

**Example** *(listen to a press button event once)*  
```js
tingbot.once('button#3:down', function(data) {
  console.log('button right pressed', data);
});
```
<a name="tingbot..onCallback"></a>

### tingbot~onCallback : <code>function</code>
This callback is displayed as a global member. Should, among optional event specific properties, always have 'type' and 'value'. Look at the specific Events for more Detail.

**Kind**: inner typedef of <code>[tingbot](#tingbot)</code>  

| Param | Type | Description |
| --- | --- | --- |
| tingbot_event | <code>object</code> |  |
| tingbot_event.type | <code>string</code> | Type of Event, eg 'button' |
| tingbot_event.value | <code>number</code> | value of Event, eg brightness |

