# Audio Wave Editor for VS Code

Web Audio API로 디코드할 수 있는 오디오를 열어 파형을 확인하고 기본 편집을 수행하는 VS Code 확장이다. 파일 확장자만으로 디코드 지원을 보장하지 않는다. 내보내기는 PCM16 WAV이며 MP3 인코딩은 제공하지 않는다.

## 주요 기능

- 툴바에서 Play/Pause, Stop, mono 믹싱, 확대·축소와 대상 채널 선택을 제공한다. 최대 확대 시 표시 범위는 0.1초이며, 더 짧은 파일은 전체 길이를 표시한다.
- 공통 시간 룰러와 채널별 파형, 프레임 단위 선택, 경계 핸들과 가로 스크롤바를 제공한다. 선택 핸들은 채널 접기 버튼과 별도 영역에 있다.
- Effects 메뉴에서 대상 채널·범위를 선택하고 Gain, Normalize, EQ, Fade를 적용한다. Fade는 선택 구간에 적용한다.
- 채널 Gain/Pan/Mute/Solo와 3-band EQ를 실시간으로 미리 듣는다. 각 채널 파형과 우측 믹서·EQ 패널은 접고 펼칠 수 있다.
- 커스텀 에디터는 VS Code Undo/Redo와 수정 상태·백업을 사용하고, 독립 창은 자체 편집 이력을 사용한다.

## 실행과 검증

1. `npm install`을 실행한다.
2. VS Code에서 이 폴더를 열고 `F5`를 누른다.
3. Command Palette에서 **Audio Wave Editor: Open**을 실행하거나 오디오 파일의 **Open With... → Audio Wave Editor**를 선택한다.

확장 디버깅에는 `vscode-audio.code-workspace`를 사용한다. 별도의 `vscode-markdown` 워크스페이스에서 F5를 실행하지 않는다.

- `npm run check`: JavaScript 구문 검사
- `npm run test:unit`: 오디오 상태·내보내기 단위 테스트
- `npm run test:e2e`: Extension Development Host에서 디코드, 타임라인, 이력, 저장과 복구 검증
- `npm run package`: VSIX 패키지 생성

E2E는 `.vscode-test` 아래에 테스트 전용 사용자 데이터와 확장 디렉터리를 사용한다.

## 확장 식별자

현재 `package.json`의 식별자는 `local.vscode-audio-wave-editor`, 표시 이름은 `Audio Wave Editor`다. 2026-11-10에 설치된 확장과 VS Code Marketplace에서 동일 식별자를 찾지 못했다. 비슷한 이름의 다른 확장은 존재하며, 검색 결과가 없다는 사실은 Marketplace 게시 가능성이나 삭제된 이름의 재사용 가능성을 보장하지 않는다. 게시 전에 사용할 퍼블리셔를 정하고 식별자와 표시 이름을 다시 확인해야 한다.

## 저장과 내보내기

일반 저장은 WAV 원본에 편집된 샘플을 PCM16으로 기록한다. MP3 등 다른 형식으로 연 파일은 **Save As**로 `.wav` 파일을 지정해야 한다. 미적용 믹서·EQ 미리 듣기 설정을 포함한 결과물은 **File → Export WAV**를 사용한다. WAV가 아닌 확장자는 내보내기 대상으로 사용할 수 없다. 자동 백업은 편집 중인 오디오 상태를 보관한다.

## 설계 문서

- [기능 범위와 구현 상태](docs/design.md)
- [화면 구성](docs/ui-design.md)
- [구현 계획](docs/implementation-plan.md)
- [상세 설계와 처리 계약](docs/detailed-design.md)
- [기능 시나리오](docs/feature-scenarios.md)
- [테스트 체크리스트](docs/tc-checklist.md)
