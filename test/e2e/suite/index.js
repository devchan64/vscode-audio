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

async function waitForWebviewState(uri, predicate = (state) => Boolean(state)) {
  const deadline = Date.now() + 8000;
  let latest;
  while (Date.now() < deadline) {
    const state = await vscode.commands.executeCommand('audioWaveEditor.test.getWebviewState', uri);
    latest = state;
    if (state && predicate(state)) return state;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Audio editor Webview did not report the expected state: ${JSON.stringify(latest)}`);
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
    const uri = vscode.Uri.file(fixture);
    await vscode.commands.executeCommand('vscode.openWith', uri, 'audioWaveEditor.editor');
    await waitForWebviewState(uri, (value) => value.ready === true);
    const state = await waitForWebviewState(uri, (value) => value.loaded === true);
    const tabs = vscode.window.tabGroups.all.flatMap((group) => group.tabs);
    const tab = tabs.find((candidate) => candidate.label.includes('ash-edge-instrumental'));
    assert.ok(tab);
    assert.strictEqual(tab.input.viewType, 'audioWaveEditor.editor');
    assert.strictEqual(state.ready, true);
    assert.strictEqual(state.loaded, true);
    assert.ok(state.duration > 0);
    assert.ok(state.sampleRate > 0);
    assert.ok(state.channels > 0);
    assert.deepStrictEqual(state.controls, ['tracks', 'selection', 'transport', 'mixer', 'effects', 'export']);
  });
});

module.exports.run = () => new Promise((resolve) => {
  mocha.run((failures) => {
    if (failures) process.exitCode = 1;
    resolve();
  });
});
