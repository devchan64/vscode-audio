const { parentPort } = require('worker_threads');

parentPort.once('message', async input => {
  try {
    const bytes = Buffer.from(input);
    if (bytes.length < 44 || bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WAVE' || bytes.toString('ascii', 36, 40) !== 'data') throw new Error('Invalid PCM WAV data');
    const channels = bytes.readUInt16LE(22), rate = bytes.readUInt32LE(24), size = bytes.readUInt32LE(40);
    if (![1, 2].includes(channels)) throw new Error('MP3 export supports mono or stereo audio only');
    if (![8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000].includes(rate)) throw new Error('MP3 export does not support this sample rate');
    if (bytes.readUInt16LE(20) !== 1 || bytes.readUInt16LE(34) !== 16 || size > bytes.length - 44 || size % (channels * 2)) throw new Error('Invalid PCM WAV data');
    const { Mp3Encoder } = await import('@breezystack/lamejs');
    const encoder = new Mp3Encoder(channels, rate, rate >= 32000 ? 192 : rate >= 16000 ? 128 : 64);
    const frames = size / (channels * 2), chunks = [];
    for (let offset = 0; offset < frames; offset += 1152) {
      const count = Math.min(1152, frames - offset), left = new Int16Array(count), right = channels === 2 ? new Int16Array(count) : undefined;
      for (let i = 0; i < count; i++) {
        left[i] = bytes.readInt16LE(44 + ((offset + i) * channels) * 2);
        if (right) right[i] = bytes.readInt16LE(44 + ((offset + i) * channels + 1) * 2);
      }
      const result = channels === 2 ? encoder.encodeBuffer(left, right) : encoder.encodeBuffer(left);
      if (result.length) chunks.push(Buffer.from(result));
    }
    const tail = encoder.flush();
    if (tail.length) chunks.push(Buffer.from(tail));
    parentPort.postMessage({ data: Buffer.concat(chunks) });
  } catch (error) { parentPort.postMessage({ error: error.message || 'MP3 encoding failed' }); }
});
