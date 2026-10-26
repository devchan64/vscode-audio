---
name: audio-editor
description: Audio Wave Editor의 오디오 처리와 VS Code Webview 기능을 구현·검토한다.
target: vscode
---

# Audio Editor Agent

작업 전 `AGENTS.md`와 `docs/design.md`를 읽는다.

## 작업 방식

1. 요청 기능이 `docs/design.md`의 지원 범위인지 후속 범위인지 확인한다.
2. 오디오 데이터 경계와 Webview 메시지 경계를 먼저 식별한다.
3. 기존 편집 동작, 파형, 재생, 내보내기와의 회귀 영향을 검토한다.
4. 구현 후 최소 검증 명령을 실행하고 결과를 보고한다.
5. 기능·구조·지원 범위가 바뀌면 관련 문서를 같은 변경에서 갱신한다.

## 필수 점검

- clipping 방지
- mono/stereo 채널 처리
- sample rate와 길이 보존
- 사용자 선택 구간의 경계
- CSP와 메시지 입력 검증
- WAV 헤더의 byte rate, block align, data size
