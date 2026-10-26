# Audio Wave Editor for VS Code

An initial VS Code extension for basic WAV/MP3 and Web Audio-compatible format editing: waveform visualization, playback selection, per-channel gain, 3-band EQ, normalize, stereo-to-mono mixing, and WAV export.

## Run

1. `npm install`
2. Open this folder in VS Code.
3. Press `F5` and run **Audio Wave Editor: Open** from the Command Palette, or use **Open With... → Audio Wave Editor** on a supported audio file.

For extension debugging, open `vscode-audio.code-workspace` first. Do not start F5 from the separate `vscode-markdown` workspace.

`npm run check` validates JavaScript syntax. `npm run package` creates the VSIX package.

## E2E tests

Run `npm install` once, then `npm run test:e2e`. This launches a VS Code Extension Development Host, creates a temporary WAV fixture, and verifies activation and command registration.

Only formats that the VS Code WebView can decode through Web Audio API are supported. The file extension alone does not guarantee support. Export is WAV (PCM16); MP3 encoding is not included.
