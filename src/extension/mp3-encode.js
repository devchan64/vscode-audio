const path = require('path');
const { Worker } = require('worker_threads');

function encodeMp3(wav) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'mp3-worker.js'));
    let settled = false;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      worker.terminate().catch(() => {});
      error ? reject(error) : resolve(Buffer.from(value));
    };
    worker.once('message', result => result.error ? finish(new Error(result.error)) : finish(null, result.data));
    worker.once('error', error => finish(error));
    worker.once('exit', code => { if (!settled) finish(new Error(`MP3 encoder exited (${code})`)); });
    worker.postMessage(wav);
  });
}
module.exports = { encodeMp3 };
