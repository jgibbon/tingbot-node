const EventEmitter = require('events');

class Emitter extends EventEmitter {}

const standardEmitter = new Emitter();
// standardEmitter.on('event', () => {
//   console.log('an event occurred!');
// });
// standardEmitter.emit('event');
module.exports = standardEmitter;
