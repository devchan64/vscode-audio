# 프로젝트 작업 지침

## 제품 범위와 기준

- 이 저장소는 Web Audio API가 실제로 디코드할 수 있는 오디오 포맷만 열어 파형을 보고 기본 편집하는 VS Code 확장 `Audio Wave Editor`를 개발한다.
- 핵심 범위는 파일 열기, 파형 표시, 재생 구간 선택, 채널별 게인, 3-band EQ, Normalize, 믹싱, WAV 내보내기다.
- 기능 범위와 구현 상태의 기준 문서는 `docs/design.md`이며, 화면 구성은 `docs/ui-design.md`, 구현 순서는 `docs/implementation-plan.md`, 구현 계약과 처리 알고리즘은 `docs/detailed-design.md`에 둔다. 범위가 바뀌면 README와 설계 문서를 함께 갱신한다.
- 사용자의 명시적 요청은 이 문서보다 우선한다.

## 현재 코드 구조

- `extension.js`: VS Code 명령, Webview 생성, 파일 저장 메시지 처리.
- `src/extension/`: 확장 호스트 명령과 수명주기.
- `src/audio/`: 오디오 버퍼, WAV 인코더, 편집 연산.
- `src/webview/`: 파형 캔버스, 재생 컨트롤, 채널/EQ UI.
- `src/shared/`: Webview 메시지와 오디오 모델의 공유 타입.
- `test/`: 오디오 연산 단위 테스트와 Extension Development Host E2E 테스트.
- `docs/`: 설계, 기능 시나리오, 테스트 체크리스트.

현재 MVP는 루트 `extension.js`에 구현되어 있으며, 기능 확장 시 위 구조로 점진적으로 분리한다. 대규모 프레임워크를 도입하지 않는다.

## 구현 원칙

- 오디오 데이터는 `Float32Array`와 `AudioBuffer`를 기준으로 처리한다. 원본 버퍼를 직접 훼손하는 연산은 명시적인 편집 동작에서만 허용한다.
- 모든 입력은 Web Audio API의 `decodeAudioData` 성공 여부로 지원을 판정한다. 확장자나 MIME만으로 지원을 보장하지 않는다. 내보내기는 PCM WAV로 표시하며 MP3 인코딩은 지원하지 않는다.
- 채널 수, sample rate, 길이, 선택 구간을 보존하거나 변경할 때 사용자에게 상태를 표시한다.
- Webview는 nonce CSP를 사용한다. 메시지 타입과 숫자 범위를 검증하고 오류를 조용히 무시하지 않는다.
- Normalize는 peak 기준 0 dBFS를 넘지 않아야 한다. EQ와 채널 게인은 클리핑을 방지한다.
- UI 문구와 명령 이름은 영어로 작성하고, README와 `docs/`는 한국어를 기본으로 한다.
- 파일 경로, 원본 오디오, 사용자 데이터는 오류 메시지에 불필요하게 노출하지 않는다.

## 검증 기준

- JavaScript 변경: `node --check extension.js`.
- 오디오 처리 변경: 샘플레이트, mono/stereo, 무음, peak, clipping 경계 테스트를 추가한다.
- Webview 변경: 파형 표시, 재생, 선택 구간, 저장 메시지를 Extension Host에서 확인한다.
- 문서 변경: 링크와 코드 블록을 확인하고 `git diff --check`를 실행한다.
- 패키징은 `npm run package`로 수행하며 `.vsix`, `node_modules`, 빌드 산출물은 커밋하지 않는다.

## Git과 변경 규칙

- 기능·설계·테스트 시나리오가 바뀌면 관련 문서를 같은 변경에서 갱신한다.
- 기존 사용자 변경을 되돌리거나 삭제하지 않는다.
- 커밋 메시지는 한글 Conventional Commits 형식을 사용한다. 예: `feat: 채널별 게인 조절 추가`.
