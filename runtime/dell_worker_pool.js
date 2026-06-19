const { Worker } = require('worker_threads');
const path = require('path');

class DellWorkerPool {
  constructor(size = Math.max(2, require('os').cpus().length - 1)) {
    this.size = size;
    this.workerFile = path.resolve(__dirname, 'dell_worker.js');
    this.workers = [];
    this.queue = [];
    this.nextWorker = 0;

    for (let i = 0; i < this.size; i += 1) {
      this.workers.push(this.createWorker());
    }
  }

  createWorker() {
    const worker = new Worker(this.workerFile, { env: process.env });
    worker.busy = false;
    worker.on('message', message => {
      if (message && message.id && this.queue[message.id]) {
        const { resolve, reject } = this.queue[message.id];
        delete this.queue[message.id];
        worker.busy = false;
        if (message.error) reject(new Error(message.error));
        else resolve(message.result);
      }
    });
    worker.on('error', error => {
      worker.busy = false;
      console.error('Worker pool error:', error.message || error);
    });
    return worker;
  }

  async run(dellCode, payload) {
    const idleWorker = this.workers.find(w => !w.busy) || this.workers[this.nextWorker];
    this.nextWorker = (this.nextWorker + 1) % this.workers.length;
    const id = Date.now() + Math.random().toString(36).slice(2);

    return new Promise((resolve, reject) => {
      this.queue[id] = { resolve, reject };
      idleWorker.busy = true;
      idleWorker.postMessage({ id, dellCode, payload });
    });
  }

  async destroy() {
    await Promise.all(this.workers.map(worker => worker.terminate()));
    this.workers = [];
  }
}

module.exports = DellWorkerPool;
