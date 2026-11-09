# 화면 구현 계획

## 목표

중앙 타임라인을 기준으로 채널별 파형을 표시하고, 선택 영역을 Cut/Copy/Paste 및 이펙트 적용의 공통 입력으로 만든다.

## 단계

1. **Timeline foundation** — 채널 lane, 공통 시간축, selection frame 모델, playhead
2. **Edit commands** — Cut, Copy, Paste, Delete, snapshot Undo/Redo
3. **Mixer** — 채널 Volume, Pan, Mute, Solo, peak meter, master strip
4. **Effects** — Selection/Track/Entire document 대상 선택, Normalize/Gain/EQ Apply
5. **Navigation** — 1/2/5 시간 눈금, 줌, 가로 스크롤, 키보드 조작
6. **Verification** — mono/stereo, 채널 정렬, 선택 경계, clipping, 저장 결과 E2E

## 완료 기준

- 모든 채널 lane이 동일한 시간 좌표계에 정렬된다.
- 선택 시작·끝이 frame 단위로 보존된다.
- Cut/Copy/Paste/Delete가 대상 채널 정책을 지킨다.
- 선택 영역 이펙트는 Apply 전 대상과 예상 peak를 보여준다.
- Undo로 마지막 편집을 되돌릴 수 있다.
- `npm run check`와 E2E 체크리스트가 통과한다.

## 현재 구현 범위

MVP의 `WaveformCanvas`를 다채널 lane 렌더링과 드래그 기반 타임라인 선택으로 확장했다. 트랙 대상 선택, 재생 헤드, 선택 구간 재생, master gain, channel gain 적용, -1 dBFS Normalize 대상 선택, 키보드 편집 단축키, snapshot Undo/Redo를 제공한다. 휠 기반 이동/줌, Fit, Reset mixer, 디코드 오류 피드백도 제공한다.

재생·정지, mono 믹싱과 확대·축소 컨트롤은 메뉴 아래 툴바에 두고, 시간 룰러는 파형과 분리한다. 채널별 파형과 우측 믹서·이펙트·이퀄라이저 패널을 각각 접거나 펼칠 수 있다. File/Edit/View 메뉴는 한 번에 하나만 열린다.

frame 단위 selection 모델, 경계 핸들, 선택 범위 EQ 직접 적용, 시간 룰러와 가로 스크롤바, OfflineAudioContext 기반 3-band EQ를 구현했다. 선택 이동·확장과 고급 EQ는 후속 기능이다.

커스텀 에디터는 VS Code 문서 이력과 저장·백업·되돌리기를 사용하고 독립 Webview는 자체 이력을 유지한다. Fade·Normalize·Gain·EQ 적용은 변경된 구간만 이력에 저장한다. Cut·Delete·Paste는 변경 구간을, mono 믹싱은 원본 채널을 이력에 저장한다. 메모리 예산과 디스크 보관, 대용량 성능 측정은 후속 개선 사항이다.
