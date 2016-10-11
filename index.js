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

const TingbotNode = function tingbot(options) {
	this.options = options || {};
	//start those modules
	this.options.modules = this.options.modules || ['buttons', 'backlight'];
	this.init();
}
TingbotNode.prototype.init = function () {
	//load modules
	for (let i = 0; i < this.options.modules.length; i++) {
		console.log('module start:', this.options.modules[i]);
		this[this.options.modules[i]] = modules[this.options.modules[i]](this);
	};
	this.init = function () {};
};
TingbotNode.prototype.on = function (evname, cb) {
	ev.on(evname, cb);
};
TingbotNode.prototype.once = function (evname, cb) {
	ev.once(evname, cb);
};

module.exports = TingbotNode;
//
// module.exports = {
// 	backlight: backlight,
// 	buttons: buttons,
// 	on: function(evname, cb) {
// 		ev.on(evname, cb);
// 		return this;
// 	},
// 	once: function(evname, cb) {
// 		ev.on(evname, cb);
// 		return this;
// 	}
//
// }
