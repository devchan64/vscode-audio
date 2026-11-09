'use strict';

const v8 = require('v8');

function validateState(state) {
  if (!state || !Number.isInteger(state.sampleRate) || state.sampleRate < 3000 || state.sampleRate > 384000 ||
      !Number.isInteger(state.channels) || state.channels < 1 || state.channels > 32 ||
      !Array.isArray(state.data) || state.data.length !== state.channels ||
      !state.data.every(channel => channel instanceof Float32Array && channel.length > 0 && channel.length === state.data[0].length)) {
    throw new Error('Invalid audio document state');
  }
  for (const channel of state.data) {
    for (const sample of channel) {
      if (!Number.isFinite(sample)) throw new Error('Invalid audio sample');
    }
  }
  return state;
}

function encodeBackup(state) {
  return v8.serialize({ version: 1, state: validateState(state) });
}

function decodeBackup(bytes) {
  const backup = v8.deserialize(bytes);
  if (!backup || backup.version !== 1) throw new Error('Unsupported audio backup');
  return validateState(backup.state);
}

function encodeWav(state) {
  validateState(state);
  const { channels, sampleRate, data } = state;
  const frames = data[0].length;
  const dataSize = frames * channels * 2;
  if (dataSize > 0xffffffff - 36) throw new Error('Audio is too large for WAV export');
  const wav = Buffer.alloc(44 + dataSize);
  wav.write('RIFF', 0); wav.writeUInt32LE(36 + dataSize, 4); wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(channels, 22);
  wav.writeUInt32LE(sampleRate, 24); wav.writeUInt32LE(sampleRate * channels * 2, 28);
  wav.writeUInt16LE(channels * 2, 32); wav.writeUInt16LE(16, 34);
  wav.write('data', 36); wav.writeUInt32LE(dataSize, 40);
  let offset = 44;
  for (let frame = 0; frame < frames; frame++) {
    for (const channel of data) {
      const sample = Math.max(-1, Math.min(1, channel[frame]));
      wav.writeInt16LE(Math.trunc(sample < 0 ? sample * 32768 : sample * 32767), offset);
      offset += 2;
    }
  }
  return wav;
}

module.exports = { validateState, encodeBackup, decodeBackup, encodeWav };
