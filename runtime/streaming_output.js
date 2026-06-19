const EventEmitter = require('events');

class StreamingOutput extends EventEmitter {
  constructor() {
    super();
    this.buffer = [];
  }

  send(step, data) {
    const payload = { step, data, timestamp: Date.now() };
    this.buffer.push(payload);
    this.emit('update', payload);
  }

  flush() {
    while (this.buffer.length > 0) {
      const item = this.buffer.shift();
      process.stdout.write(`[STREAM] ${item.step}: ${JSON.stringify(item.data)}\n`);
    }
  }

  attachConsole() {
    this.on('update', () => this.flush());
  }
}

module.exports = StreamingOutput;
