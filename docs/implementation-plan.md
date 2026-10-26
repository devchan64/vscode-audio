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

## 현재 착수 범위

MVP의 `WaveformCanvas`를 다채널 lane 렌더링과 클릭 기반 타임라인 선택으로 확장했다. 다음 구현은 frame 기반 편집 명령과 undo snapshot이다.
