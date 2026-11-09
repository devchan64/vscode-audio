# Audio Wave Editor for VS Code

An initial VS Code extension for basic WAV/MP3 and Web Audio-compatible format editing: waveform visualization, playback selection, per-channel gain, 3-band EQ, normalize, stereo-to-mono mixing, and WAV export.

메뉴 아래 툴바에서 재생·정지, 모노 믹싱과 타임라인 확대·축소를 실행할 수 있다. 3-band EQ는 실제 주파수 필터로 미리 듣기와 WAV 내보내기에 적용되며 선택한 구간과 채널에 직접 적용하고 Undo할 수 있다. 선택 범위는 프레임 단위로 저장하고 경계 핸들로 조절한다. 파형 위의 별도 룰러는 확대·축소와 이동에 맞춰 시간 눈금을 표시한다. 파형 아래 스크롤바는 전체 길이와 현재 표시 구간을 나타내며 드래그하거나 키보드로 이동할 수 있다. 각 채널의 파형은 상단 버튼으로 접고 펼칠 수 있으며, 접힌 상태는 재생이나 편집 결과에 영향을 주지 않는다. 우측 믹서·이펙트·이퀄라이저 패널도 각각 접을 수 있다. 파일 열기와 WAV 내보내기는 File 메뉴에서 사용할 수 있다.

## Run

1. `npm install`
2. Open this folder in VS Code.
3. Press `F5` and run **Audio Wave Editor: Open** from the Command Palette, or use **Open With... → Audio Wave Editor** on a supported audio file.

For extension debugging, open `vscode-audio.code-workspace` first. Do not start F5 from the separate `vscode-markdown` workspace.

`npm run check` validates JavaScript syntax, `npm run test:unit` runs audio-state tests, and `npm run package` creates the VSIX package.

## E2E tests

Run `npm install` once, then `npm run test:e2e`. This launches a VS Code Extension Development Host and verifies decoding, timeline controls, frame selection, EQ, undo/redo, save, backup, and restore using audio fixtures.

Only formats that the VS Code WebView can decode through Web Audio API are supported. The file extension alone does not guarantee support. Export is WAV (PCM16); MP3 encoding is not included.

## 실행 취소와 저장

커스텀 에디터에서 오디오 편집은 VS Code의 Undo/Redo 및 수정 상태와 연결된다. 명령으로 여는 독립 창은 자체 Undo/Redo를 사용한다. 일반 저장은 WAV 원본에 PCM16으로 기록하며, MP3 등 다른 형식으로 연 파일은 **Save As**로 `.wav` 파일을 지정해야 한다. 미적용 믹서·EQ 미리 듣기 설정을 포함한 결과물은 **Export WAV**를 사용한다. 자동 백업은 편집 중인 오디오 상태를 보관한다.
