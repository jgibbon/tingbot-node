const EventEmitter = require('events');

class Emitter extends EventEmitter {}

const standardEmitter = module.exports = new Emitter();
