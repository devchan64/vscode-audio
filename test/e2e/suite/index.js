const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

function writeSilentWav(filePath) {
  const sampleRate = 8000;
  const frames = sampleRate;
  const bytes = Buffer.alloc(44 + frames * 2);
  bytes.write('RIFF', 0); bytes.writeUInt32LE(36 + frames * 2, 4); bytes.write('WAVE', 8);
  bytes.write('fmt ', 12); bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22); bytes.writeUInt32LE(sampleRate, 24); bytes.writeUInt32LE(sampleRate * 2, 28);
  bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34); bytes.write('data', 36);
  bytes.writeUInt32LE(frames * 2, 40); fs.writeFileSync(filePath, bytes);
}

async function activate() {
  const extension = vscode.extensions.getExtension('local.vscode-audio-wave-editor');
  if (extension) await extension.activate();
}

suite('Audio Wave Editor E2E', () => {
  test('extension activates and exposes open command', async () => {
    await activate();
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('audioWaveEditor.open'));
  });

  test('WAV fixture can be opened by the extension command', async () => {
    const workspace = process.env.AUDIO_E2E_WORKSPACE;
    const fixture = path.join(workspace, 'e2e-silence.wav');
    writeSilentWav(fixture);
    await vscode.commands.executeCommand('audioWaveEditor.open', vscode.Uri.file(fixture));
    await new Promise((resolve) => setTimeout(resolve, 250));
    assert.ok(vscode.window.tabGroups.all.length > 0);
  });
});
