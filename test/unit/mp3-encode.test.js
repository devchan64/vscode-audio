const test = require('node:test');
const assert = require('node:assert/strict');
const { encodeWav } = require('../../src/audio/document-state');
const { encodeMp3 } = require('../../src/extension/mp3-encode');

for (const rate of [44100, 48000]) for (const channels of [1, 2]) {
  test(`MP3 encode ${rate} Hz ${channels} channels`, async () => {
    const data = Array.from({ length: channels }, (_, c) => Float32Array.from({ length: rate / 10 }, (_, i) => .5 * Math.sin(2 * Math.PI * (440 + c * 100) * i / rate)));
    const bytes = await encodeMp3(encodeWav({ sampleRate: rate, channels, data }));
    assert.ok(bytes.length > 100);
    assert.equal(bytes[0], 0xff);
    assert.equal(bytes[1] & 0xe0, 0xe0);
  });
}
test('MP3 rejects unsupported channels and sample rates', async () => {
  await assert.rejects(encodeMp3(encodeWav({ sampleRate: 44100, channels: 3, data: Array.from({ length: 3 }, () => new Float32Array(100)) })), /mono or stereo/);
  await assert.rejects(encodeMp3(encodeWav({ sampleRate: 44101, channels: 1, data: [new Float32Array(100)] })), /sample rate/);
});

for (const [rate, index, version] of [[8000, 8, 0], [16000, 12, 2], [44100, 11, 3]]) {
  test(`MP3 uses the supported bitrate for ${rate} Hz silence`, async () => {
    const bytes = await encodeMp3(encodeWav({ sampleRate: rate, channels: 1, data: [new Float32Array(rate / 10)] }));
    assert.equal((bytes[1] >> 3) & 3, version);
    assert.equal((bytes[2] >> 4) & 15, index);
  });
}
