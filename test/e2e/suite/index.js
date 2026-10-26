const assert = require('assert');
const path = require('path');
const Mocha = require('mocha');
const vscode = require('vscode');

const mocha = new Mocha({ ui: 'tdd', reporter: 'dot', timeout: 10000 });
mocha.suite.emit('pre-require', global, __filename, mocha);

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

  test('MP3 fixture can be opened by the extension command', async () => {
    const fixture = path.resolve(__dirname, '../../fixtures/ash-edge-instrumental.mp3');
    await vscode.commands.executeCommand('audioWaveEditor.open', vscode.Uri.file(fixture));
    await new Promise((resolve) => setTimeout(resolve, 250));
    assert.ok(vscode.window.tabGroups.all.length > 0);
  });

  test('MP3 fixture can be opened with the custom editor', async () => {
    const fixture = path.resolve(__dirname, '../../fixtures/ash-edge-instrumental.mp3');
    await vscode.commands.executeCommand('vscode.openWith', vscode.Uri.file(fixture), 'audioWaveEditor.editor');
    await new Promise((resolve) => setTimeout(resolve, 250));
    assert.ok(vscode.window.tabGroups.all.some((group) => group.tabs.some((tab) => tab.label.includes('ash-edge-instrumental'))));
  });
});

module.exports.run = () => new Promise((resolve) => {
  mocha.run((failures) => {
    if (failures) process.exitCode = 1;
    resolve();
  });
});
