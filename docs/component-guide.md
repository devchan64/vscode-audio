# Audio Wave Editor 컴포넌트 가이드

## 1. 컴포넌트 지도

| 컴포넌트 | 책임 | 상태 |
| --- | --- | --- |
| `EditorShell` | 전체 Webview 레이아웃과 상태 표시 | MVP 통합 구현 |
| `FileDropZone` | 파일 열기·드래그 앤 드롭 | MVP 통합 구현 |
| `WaveformCanvas` | 파형과 격자 렌더링 | MVP 통합 구현 |
| `TransportControls` | Play/Stop과 선택 구간 표시 | MVP 통합 구현 |
| `ChannelLevelPanel` | 채널별 게인 입력 | MVP 통합 구현 |
| `EqualizerPanel` | Low/Mid/High 보정 입력 | MVP 통합 구현 |
| `ProcessingActions` | Normalize와 Mix 명령 | MVP 통합 구현 |
| `WavExportAction` | 처리 버퍼를 확장 호스트에 저장 | MVP 통합 구현 |

## 2. 컴포넌트 규칙

- 컴포넌트는 오디오 모델을 직접 임의 변경하지 않고 명시적 명령을 사용한다.
- 처리 중에는 중복 Play/Export를 비활성화한다.
- 실패 상태는 `status` 영역에 원인과 다음 행동을 함께 표시한다.
- 컨트롤은 키보드로 조작 가능해야 하며, 숫자 값과 단위를 함께 제공한다.

## 3. Webview 메시지 계약

```ts
type HostMessage =
  | { type: 'save'; data: string }
  | { type: 'error'; message: string };
```

`save.data`는 PCM16 WAV 바이트의 Base64 문자열이다. 확장 호스트는 메시지 타입을 확인하고, 저장 대화상자 취소를 성공으로 처리하지 않는다.

## 4. 향후 분리 경계

현재 `extension.js`에 통합된 구현은 다음 단위로 분리한다.

- `WaveformRenderer`: AudioBuffer를 화면 폭에 맞게 envelope로 축약
- `AudioOperations`: gain, EQ, normalize, mix, clamp
- `WavEncoder`: RIFF/WAVE 헤더와 PCM16 직렬화
- `PlaybackController`: AudioContext와 BufferSource 수명주기
- `AudioEditorView`: Webview DOM 및 메시지 변환
