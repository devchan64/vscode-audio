'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { encodeBackup, decodeBackup, encodeWav } = require('../../src/audio/document-state');

for (const sampleRate of [44100, 48000]) {
  for (const channels of [1, 2]) {
    test(`backup and PCM WAV preserve ${sampleRate} Hz, ${channels} channels`, () => {
      const state = { sampleRate, channels, data: Array.from({ length: channels }, () => Float32Array.from([-2, -1, 0, 0.5, 1, 2])), start: 0, end: 1 };
      const restored = decodeBackup(encodeBackup(state));
      assert.deepEqual(restored, state);
      const wav = encodeWav(restored);
      assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
      assert.equal(wav.readUInt16LE(22), channels);
      assert.equal(wav.readUInt32LE(24), sampleRate);
      assert.equal(wav.readUInt32LE(40), 6 * channels * 2);
      assert.deepEqual([0, 1, 2, 3, 4, 5].map(i => wav.readInt16LE(44 + i * channels * 2)), [-32768, -32768, 0, 16383, 32767, 32767]);
    });
  }
}

test('rejects non-finite samples and invalid channel lengths', () => {
  assert.throws(() => encodeWav({ sampleRate: 48000, channels: 1, data: [Float32Array.of(NaN)] }));
  assert.throws(() => encodeBackup({ sampleRate: 48000, channels: 2, data: [Float32Array.of(0), Float32Array.of(0, 0)] }));
});
