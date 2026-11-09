const assert = require('assert');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const digest = a => crypto.createHash('sha256').update(Buffer.from(Float32Array.from(a).buffer)).digest('hex');
const { encodeWav, decodeBackup } = require('../../../src/audio/document-state');
const Mocha = require('mocha');
const vscode = require('vscode');

const mocha = new Mocha({ ui: 'tdd', reporter: 'dot', timeout: 10000 });
mocha.suite.emit('pre-require', global, __filename, mocha);

async function activate() {
  const extension = vscode.extensions.getExtension('local.vscode-audio-wave-editor');
  if (extension) await extension.activate();
}

async function waitForSamples(req, expected) {
  const deadline = Date.now() + 5000;
  let state;
  do { state = await req('getState'); if (digest(state.data[0]) === digest(expected)) return state; await new Promise(resolve => setTimeout(resolve, 100)); } while (Date.now() < deadline);
  throw new Error('Audio state did not reach expected samples');
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

  test('custom editor undo, redo, save, backup and revert synchronize audio', async function () {
    this.timeout(30000);
    const dir = process.env.AUDIO_E2E_WORKSPACE;
    const uri = vscode.Uri.file(path.join(dir, 'history-test.wav'));
    const backupUri = vscode.Uri.file(path.join(dir, 'history-test.backup'));
    const samples = Float32Array.from({ length: 48000 }, (_, i) => 0.5 * Math.sin(i / 30));
    const original = encodeWav({ sampleRate: 48000, channels: 1, data: [samples] });
    fs.writeFileSync(uri.fsPath, original);
    await vscode.commands.executeCommand('vscode.openWith', uri, 'audioWaveEditor.editor');
    await waitForWebviewState(uri, state => state.loaded);
    const req = (type, extra) => vscode.commands.executeCommand('audioWaveEditor.test.request', uri, type, extra);
    const operation = (name, arg) => vscode.commands.executeCommand('audioWaveEditor.test.provider', uri, name, arg);
    let viewport = await req('testScrollState');
    assert.ok(Math.abs(viewport.width - 100) < .01);
    await req('testScrollZoom');
    viewport = await req('testScrollState');
    assert.ok(Math.abs(viewport.width - 50) < .01);
    assert.ok(Math.abs(viewport.start / viewport.duration - .25) < .01);
    await req('testScrollKey', { key: 'End' });
    viewport = await req('testScrollState');
    assert.ok(Math.abs(viewport.end - viewport.duration) < .00001);
    await req('testScrollKey', { key: 'Home' });
    assert.ok(Math.abs((await req('testScrollState')).start) < .00001);
    await req('testScrollDrag', { fraction: .2 });
    viewport = await req('testScrollState');
    assert.ok(Math.abs(viewport.start / viewport.duration - .2) < .02);
    await req('testScrollPointer', { fraction: 1 });
    viewport = await req('testScrollState');
    assert.ok(Math.abs(viewport.end - viewport.duration) < .00001);
    assert.ok(viewport.label.includes('/'));
    await req('testScrollFit');
    assert.ok(Math.abs((await req('testScrollState')).width - 100) < .01);
    const eq = await req('testEQ');
    assert.strictEqual(eq.results.length, 12);
    assert.ok(eq.results.every(result => result.ratio > 2 && result.cutRatio < .6), 'each EQ band boosts and cuts its target frequency');
    assert.deepStrictEqual(await req('testLargeWav'), { bytes: 400044 });
    assert.ok(eq.silent, 'EQ keeps silence silent');
    assert.ok(eq.peak <= 1, 'EQ output is clipped to full scale');
    const toolbar = await req('testToolbar');
    assert.deepStrictEqual(toolbar.map(item => item.id), ['play', 'stop', 'mix', 'zoomIn', 'zoomOut']);
    assert.ok(toolbar.every(item => item.icon && item.label && item.title === item.label && item.text === '' && !item.disabled));
    assert.deepStrictEqual(await req('testPlayIcon'), { label: 'Pause playback (Space)', title: 'Pause playback (Space)', icon: true });
    const busy = req('testBusy');
    await new Promise(resolve => setTimeout(resolve, 100));
    assert.deepStrictEqual(await req('testLockStatus'), { locked: true, inert: true, visible: true, keyBlocked: true });
    await busy;
    assert.deepStrictEqual(await req('testLockStatus'), { locked: false, inert: false, visible: false, keyBlocked: false });
    await assert.rejects(req('testBusyError'));
    assert.deepStrictEqual(await req('testLockStatus'), { locked: false, inert: false, visible: false, keyBlocked: false });
    const before = await req('getState');
    const edited = await req('testEdit');
    assert.notStrictEqual(digest(edited.data[0]), digest(before.data[0]));
    await new Promise(resolve => setTimeout(resolve, 150));
    const stats = await operation('lastEdit');
    assert.strictEqual(stats.kind, 'range');
    assert.ok(stats.samples < before.data[0].length, 'short edit stores only its range');
    assert.ok(vscode.window.tabGroups.activeTabGroup.activeTab.isDirty, 'edit marks document dirty');
    await req('testUndo');
    await new Promise(resolve => setTimeout(resolve, 150));
    await waitForSamples(req, before.data[0]);
    await req('testRedo');
    await new Promise(resolve => setTimeout(resolve, 150));
    await waitForSamples(req, edited.data[0]);
    const deleted = await req('testDelete');
    await new Promise(resolve => setTimeout(resolve, 150));
    assert.strictEqual((await operation('lastEdit')).kind, 'snapshot');
    assert.ok(deleted.data[0].length < edited.data[0].length);
    await req('testUndo');
    await new Promise(resolve => setTimeout(resolve, 150));
    await waitForSamples(req, edited.data[0]);
    const saveAsUri = vscode.Uri.file(path.join(dir, 'history-copy.wav'));
    await operation('saveAs', saveAsUri);
    assert.deepStrictEqual(fs.readFileSync(saveAsUri.fsPath), encodeWav({ ...edited, data: edited.data.map(a => Float32Array.from(a)) }));
    await assert.rejects(operation('saveAs', vscode.Uri.file(path.join(dir, 'history-copy.mp3'))), /WAV/);
    await operation('backup', backupUri);
    assert.strictEqual(digest(decodeBackup(fs.readFileSync(backupUri.fsPath)).data[0]), digest(edited.data[0]));
    const recovered = await vscode.commands.executeCommand('audioWaveEditor.test.reopenBackup', uri, backupUri);
    assert.strictEqual(digest(recovered.data[0]), digest(edited.data[0]), 'reopened backup');
    await vscode.commands.executeCommand('vscode.openWith', uri, 'audioWaveEditor.editor');
    await vscode.commands.executeCommand('workbench.action.files.save');
    assert.ok(!vscode.window.tabGroups.activeTabGroup.activeTab.isDirty, 'save clears dirty state');
    assert.deepStrictEqual(fs.readFileSync(uri.fsPath), encodeWav({ ...edited, data: edited.data.map(a => Float32Array.from(a)) }));
    await req('testEdit');
    await new Promise(resolve => setTimeout(resolve, 150));
    await operation('restoreBackup', backupUri);
    await waitForSamples(req, edited.data[0]);
    await req('testEdit');
    await new Promise(resolve => setTimeout(resolve, 150));
    await vscode.commands.executeCommand('workbench.action.files.revert');
    const saved = fs.readFileSync(uri.fsPath);
    const savedSamples = Float32Array.from({ length: (saved.length - 44) / 2 }, (_, i) => saved.readInt16LE(44 + i * 2) / 32768);
    let reverted;
    const deadline = Date.now() + 5000;
    do { reverted = await req('getState'); if (reverted.data[0].length === savedSamples.length && reverted.data[0].every((sample, i) => Math.abs(sample - savedSamples[i]) <= 1 / 32768)) break; await new Promise(resolve => setTimeout(resolve, 100)); } while (Date.now() < deadline);
    assert.strictEqual(reverted.data[0].length, savedSamples.length);
    assert.ok(reverted.data[0].every((sample, i) => Math.abs(sample - savedSamples[i]) <= 1 / 32768), 'revert differs from saved PCM');
    await vscode.commands.executeCommand('workbench.action.revertAndCloseActiveEditor');
  });

  test('range undo preserves untouched stereo channel', async function () {
    this.timeout(20000);
    const uri = vscode.Uri.file(path.join(process.env.AUDIO_E2E_WORKSPACE, 'stereo-history.wav'));
    const data = [Float32Array.from({ length: 48000 }, (_, i) => .5 * Math.sin(i / 30)), Float32Array.from({ length: 48000 }, (_, i) => .4 * Math.cos(i / 40))];
    fs.writeFileSync(uri.fsPath, encodeWav({ sampleRate: 48000, channels: 2, data }));
    await vscode.commands.executeCommand('vscode.openWith', uri, 'audioWaveEditor.editor');
    await waitForWebviewState(uri, state => state.loaded);
    const req = (type, extra) => vscode.commands.executeCommand('audioWaveEditor.test.request', uri, type, extra);
    const before = await req('getState');
    const edited = await req('testChannelEdit');
    await new Promise(resolve => setTimeout(resolve, 150));
    assert.notStrictEqual(digest(edited.data[0]), digest(before.data[0]));
    assert.strictEqual(digest(edited.data[1]), digest(before.data[1]));
    const stats = await vscode.commands.executeCommand('audioWaveEditor.test.provider', uri, 'lastEdit');
    assert.strictEqual(stats.kind, 'range');
    assert.ok(stats.samples < before.data[0].length);
    await req('testUndo');
    await new Promise(resolve => setTimeout(resolve, 150));
    let restored;
    const undoDeadline = Date.now() + 5000;
    do { restored = await req('getState'); if (digest(restored.data[0]) === digest(before.data[0])) break; await new Promise(resolve => setTimeout(resolve, 100)); } while (Date.now() < undoDeadline);
    assert.strictEqual(digest(restored.data[0]), digest(before.data[0]));
    assert.strictEqual(digest(restored.data[1]), digest(before.data[1]));
    await vscode.commands.executeCommand('workbench.action.revertAndCloseActiveEditor');
  });

  test('frame selection handles and selection EQ preserve channels and undo', async function () {
    this.timeout(30000);
    const uri = vscode.Uri.file(path.join(process.env.AUDIO_E2E_WORKSPACE, 'selection-eq.wav'));
    const data = [Float32Array.from({ length: 48000 }, (_, i) => .1 * Math.sin(2 * Math.PI * 100 * i / 48000)), Float32Array.from({ length: 48000 }, (_, i) => .2 * Math.cos(i / 40))];
    fs.writeFileSync(uri.fsPath, encodeWav({ sampleRate: 48000, channels: 2, data }));
    await vscode.commands.executeCommand('vscode.openWith', uri, 'audioWaveEditor.editor');
    await waitForWebviewState(uri, state => state.loaded);
    const req = (type, extra) => vscode.commands.executeCommand('audioWaveEditor.test.request', uri, type, extra);
    let selection = await req('testSetFrames', { start: 1000, end: 10000 });
    assert.strictEqual(selection.start, 1000); assert.strictEqual(selection.end, 10000);
    selection = await req('testHandleKey', { which: 'start', key: 'ArrowRight' });
    assert.strictEqual(selection.start, 1001); assert.ok(!selection.startHidden && !selection.endHidden);
    selection = await req('testHandleKey', { which: 'end', key: 'ArrowRight', shift: true });
    assert.strictEqual(selection.end, 10010);
    selection = await req('testHandleDrag', { which: 'start', fraction: .9 });
    assert.strictEqual(selection.end - selection.start, 1, 'handles retain a one-frame selection');
    await req('testSetFrames', { start: 1000, end: 1001 });
    let layout = await req('testHandleLayout');
    assert.ok(!layout.start.hidden && !layout.end.hidden && layout.start.bottom <= layout.end.top, 'short selection handles remain distinct');
    selection = await req('testHandleDrag', { which: 'end', fraction: .3 });
    assert.ok(selection.end > selection.start + 1, 'one-frame range can be expanded');
    await req('testSetFrames', { start: 0, end: 1 });
    layout = await req('testHandleLayout');
    assert.ok(layout.start.left >= layout.canvas.left - 1 && layout.end.left >= layout.canvas.left - 1, 'start handles stay visible');
    await req('testSetFrames', { start: 1000, end: 10000 });
    const before = await req('getState');
    assert.strictEqual(before.startFrame, 1000); assert.strictEqual(before.endFrame, 10000);
    const after = await req('testApplySelectionEQ', { channel: 0, low: 12 });
    assert.notStrictEqual(digest(after.data[0].slice(1000, 10000)), digest(before.data[0].slice(1000, 10000)));
    assert.strictEqual(digest(after.data[0].slice(0, 1000)), digest(before.data[0].slice(0, 1000)));
    assert.strictEqual(digest(after.data[0].slice(10000)), digest(before.data[0].slice(10000)));
    assert.strictEqual(digest(after.data[1]), digest(before.data[1]));
    assert.ok(after.data[0].every(sample => Math.abs(sample) <= 1));
    await new Promise(resolve => setTimeout(resolve, 150));
    await req('testUndo');
    const undone = await waitForSamples(req, before.data[0]);
    assert.strictEqual(undone.startFrame, 1000); assert.strictEqual(undone.endFrame, 10000);
    await req('testRedo');
    await waitForSamples(req, after.data[0]);
    await req('testSetFrames', { start: 500, end: 500 });
    const empty = await req('testApplySelectionEQ', { channel: 0, low: 12 });
    assert.strictEqual(digest(empty.data[0]), digest(after.data[0]), 'empty selection is unchanged');
    const entire = await req('testApplySelectionEQ', { channel: 'all', target: 'document', low: 12 });
    assert.notStrictEqual(digest(entire.data[0].slice(0, 500)), digest(after.data[0].slice(0, 500)));
    assert.notStrictEqual(digest(entire.data[1]), digest(after.data[1]));
    await vscode.commands.executeCommand('workbench.action.revertAndCloseActiveEditor');
  });

  test('standalone editor restores range and length-changing edits', async function () {
    this.timeout(20000);
    const uri = vscode.Uri.file(path.join(process.env.AUDIO_E2E_WORKSPACE, 'standalone-history.wav'));
    fs.writeFileSync(uri.fsPath, encodeWav({ sampleRate: 48000, channels: 1, data: [Float32Array.from({ length: 48000 }, (_, i) => .5 * Math.sin(i / 30))] }));
    await vscode.commands.executeCommand('audioWaveEditor.test.openStandalone', uri);
    const req = type => vscode.commands.executeCommand('audioWaveEditor.test.standaloneRequest', type);
    let before;
    const deadline = Date.now() + 8000;
    while (!before && Date.now() < deadline) { try { before = await req('getState'); } catch (_) { await new Promise(resolve => setTimeout(resolve, 100)); } }
    assert.ok(before, 'standalone audio loaded');
    const edited = await req('testEdit');
    await new Promise(resolve => setTimeout(resolve, 100));
    await req('testUndo');
    assert.strictEqual(digest((await req('getState')).data[0]), digest(before.data[0]));
    await req('testRedo');
    await waitForSamples(req, edited.data[0]);
    await req('testDelete');
    await req('testUndo');
    await waitForSamples(req, edited.data[0]);
    const pasted = await req('testStereoPaste');
    assert.deepStrictEqual(pasted.data[0].slice(0, 2), [.25, 0], 'stereo paste is averaged for mono');
    await req('testUndo');
    await waitForSamples(req, edited.data[0]);
    assert.deepStrictEqual(await req('testReloadStops'), { ok: true, stopped: true, playing: false });
    const frameMatrix = await req('testSelectionFrameMatrix');
    assert.strictEqual(frameMatrix.length, 4);
    assert.ok(frameMatrix.every(item => item.exact && item.single && item.clamped));
    const matrix = await req('testApplyEQMatrix');
    assert.strictEqual(matrix.results.length, 8);
    assert.ok(matrix.results.every(item => item.outside && item.other && item.bounded && item.changed !== item.silent));
    assert.ok(matrix.emptyUnchanged, 'empty selection does not change samples');
    await vscode.commands.executeCommand('audioWaveEditor.test.closeStandalone');
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

module.exports.run = () => new Promise((resolve, reject) => {
  mocha.run(failures => failures ? reject(new Error(failures + ' E2E test(s) failed')) : resolve());
});
