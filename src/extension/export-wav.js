const path = require('path');

function defaultWavPath(sourcePath) {
  const extension = path.posix.extname(sourcePath);
  return extension.toLowerCase() === '.wav' ? sourcePath : sourcePath.slice(0, sourcePath.length - extension.length) + '.wav';
}

async function exportWav(data, chooseTarget, writeFile) {
  try {
    const target = await chooseTarget();
    if (!target) return { status: 'cancelled' };
    if (typeof target.path !== 'string' || path.posix.extname(target.path).toLowerCase() !== '.wav') return { status: 'invalidPath' };
    await writeFile(target, Buffer.from(data, 'base64'));
    return { status: 'saved', target };
  } catch (error) {
    return { status: 'failed', error };
  }
}

module.exports = { defaultWavPath, exportWav };
