const test = require('node:test');
const assert = require('node:assert/strict');
const { defaultWavPath, exportWav } = require('../../src/extension/export-wav');

test('export reports cancellation without writing', async () => {
  let wrote = false;
  const result = await exportWav('AA==', async () => undefined, async () => { wrote = true; });
  assert.deepEqual(result, { status: 'cancelled' });
  assert.equal(wrote, false);
});

test('export reports success only after writing decoded data', async () => {
  const target = { path: '/audio.wav' };
  let received;
  const result = await exportWav('AQID', async () => target, async (uri, bytes) => { received = { uri, bytes }; });
  assert.deepEqual(result, { status: 'saved', target });
  assert.equal(received.uri, target);
  assert.deepEqual(received.bytes, Buffer.from([1, 2, 3]));
});

test('export reports dialog and write failures', async () => {
  const error = new Error('failure');
  const dialogFailure = await exportWav('', async () => { throw error; }, async () => {});
  const writeFailure = await exportWav('', async () => ({ path: '/audio.wav' }), async () => { throw error; });
  assert.deepEqual(dialogFailure, { status: 'failed', error });
  assert.deepEqual(writeFailure, { status: 'failed', error });
});

test('export proposes a WAV name for source audio', () => {
  assert.equal(defaultWavPath('/music/source.mp3'), '/music/source.wav');
  assert.equal(defaultWavPath('/music/source.WAV'), '/music/source.WAV');
  assert.equal(defaultWavPath('/music/source'), '/music/source.wav');
});

test('export rejects non-WAV paths before writing', async () => {
  let wrote = false;
  const result = await exportWav('AA==', async () => ({ path: '/music/source.mp3' }), async () => { wrote = true; });
  assert.deepEqual(result, { status: 'invalidPath' });
  assert.equal(wrote, false);
});
