const path = require('path');

function versionBase(sourcePath) {
  const name = path.posix.basename(sourcePath);
  const ext = path.posix.extname(name);
  return (ext ? name.slice(0, -ext.length) : name).replace(/_v\d+$/i, '');
}

async function exportNextVersion(source, format, bytes, list, create) {
  if (!source || typeof source.path !== 'string') throw new Error('Source path is not available');
  if (!['wav', 'mp3'].includes(format)) throw new Error('Unsupported export format');
  const base = versionBase(source.path);
  if (!base) throw new Error('Invalid source name');
  const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp('^' + escaped + '_v(\\d+)\\.' + format + '$', 'i');
  let next = 1;
  for (const name of await list(source)) {
    const match = pattern.exec(name);
    if (match) {
      const version = Number(match[1]);
      if (Number.isSafeInteger(version)) next = Math.max(next, version + 1);
    }
  }
  for (let tries = 0; tries < 10000; tries++, next++) {
    if (!Number.isSafeInteger(next)) throw new Error('Version number is too large');
    const name = `${base}_v${String(next).padStart(3, '0')}.${format}`;
    const target = source.with({ path: path.posix.join(path.posix.dirname(source.path), name), query: '', fragment: '' });
    try { await create(target, bytes); return target; }
    catch (error) { if (error?.code !== 'EEXIST' && error?.code !== 'FileExists') throw error; }
  }
  throw new Error('Could not find an available version');
}

module.exports = { versionBase, exportNextVersion };
