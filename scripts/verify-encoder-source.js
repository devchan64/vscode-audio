const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const manifest = require(path.join(root, 'package.json'));
const encoder = require(path.join(root, 'node_modules/@breezystack/lamejs/package.json'));
if (manifest.dependencies['@breezystack/lamejs'] !== '1.2.7' || encoder.version !== '1.2.7') {
  throw new Error('Update the bundled encoder source, notices and verification hashes for this encoder version');
}
const hashes = {
  'third_party/lamejs-1.2.7/source.tar.gz': '98baaa9c0122e90098f014982ba035c565d4b8903aa0bc10ef53abdc71a598b0',
  'third_party/lamejs-1.2.7/package-lock.json': 'dc2fd1dcfa67603e72b2ae122962faaee8b7ece0a0bde0bc9c37f48d6d3b2a8c',
  'node_modules/@breezystack/lamejs/dist/lamejs.js': '1c5f944911ccf2f6e29ab36c2e568363210ab16f50c0d76077060f40ecf91d28',
  'node_modules/@breezystack/lamejs/dist/lamejs.iife.js': '0be202ec162aa3042d5c5c4e6288ad326cff8cec7312c2894a0a91ad2f9aeda1'
};
for (const [name, expected] of Object.entries(hashes)) {
  const actual = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, name))).digest('hex');
  if (actual !== expected) throw new Error(`Encoder distribution verification failed: ${name}`);
}
for (const name of ['THIRD_PARTY_NOTICES.md', 'LICENSES/LGPL-2.0.txt', 'LICENSES/LGPL-2.1.txt', 'LICENSES/LGPL-3.0.txt', 'LICENSES/GPL-2.0.txt', 'LICENSES/GPL-3.0.txt']) {
  fs.accessSync(path.join(root, name), fs.constants.R_OK);
}
console.log('Encoder source, build lock, notices and distributed encoder hashes verified.');
