const test = require('node:test');
const assert = require('node:assert/strict');
const { versionBase, exportNextVersion } = require('../../src/extension/versioned-export');
const source = { path: '/project/audio/voice_v002.wav', with(change) { return { ...this, ...change }; } };

test('versioned exports increment existing versions and handle escaped names', async () => {
  assert.equal(versionBase(source.path), 'voice');
  const target = await exportNextVersion(source, 'wav', Buffer.from('x'), async () => ['voice_v001.wav', 'voice_v009.wav', 'voice_v003.mp3'], async () => {});
  assert.equal(target.path, '/project/audio/voice_v010.wav');
  const special = { ...source, path: '/project/audio/a[1].wav' };
  const other = await exportNextVersion(special, 'wav', Buffer.alloc(0), async () => ['a[1]_v002.wav'], async () => {});
  assert.equal(other.path, '/project/audio/a[1]_v003.wav');
});

test('concurrent collision retries without overwriting and errors propagate', async () => {
  const seen = [];
  const target = await exportNextVersion(source, 'mp3', Buffer.from('data'), async () => [], async uri => {
    seen.push(uri.path);
    if (seen.length === 1) throw Object.assign(new Error('exists'), { code: 'EEXIST' });
  });
  assert.deepEqual(seen, ['/project/audio/voice_v001.mp3', '/project/audio/voice_v002.mp3']);
  assert.equal(target.path, seen[1]);
  await assert.rejects(exportNextVersion(source, 'wav', Buffer.alloc(0), async () => [], async () => { throw new Error('denied'); }), /denied/);
});
