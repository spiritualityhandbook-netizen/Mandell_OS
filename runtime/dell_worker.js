const { parentPort } = require('worker_threads');
const DellExecutor = require('./core_dells.js');

const executor = new DellExecutor();

if (!parentPort) {
  throw new Error('Worker threads require parentPort.');
}

parentPort.on('message', task => {
  const { id, dellCode, payload } = task;
  try {
    const result = executor.execute(dellCode, payload);
    parentPort.postMessage({ id, result });
  } catch (error) {
    parentPort.postMessage({ id, error: error.message || String(error) });
  }
});
