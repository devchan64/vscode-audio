# Audio Wave Editor for VS Code

An initial VS Code extension for basic WAV/MP3 editing: waveform visualization, playback selection, per-channel gain, 3-band EQ, normalize, stereo-to-mono mixing, and WAV export.

## Run

1. `npm install`
2. Open this folder in VS Code.
3. Press `F5` and run **Audio Wave Editor: Open** from the Command Palette, or right-click a `.wav`/`.mp3` file.

MP3 decoding uses the browser/WebView Web Audio implementation. Export is WAV (PCM16).
