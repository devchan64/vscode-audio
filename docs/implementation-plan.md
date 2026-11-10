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
- 선택 영역 이펙트는 Apply 전 대상을 보여준다. 예상 peak 표시는 미구현이다.
- Undo로 마지막 편집을 되돌릴 수 있다.
- `npm run check`와 E2E 체크리스트가 통과한다.

## 현재 구현 범위

MVP의 `WaveformCanvas`를 다채널 lane 렌더링과 드래그 기반 타임라인 선택으로 확장했다. 트랙 대상 선택, 재생 헤드, 선택 구간 재생, master gain, channel gain 적용, -1 dBFS Normalize 대상 선택, 키보드 편집 단축키, snapshot Undo/Redo를 제공한다. 휠 기반 이동/줌, Fit, Reset mixer, 디코드 오류 피드백도 제공한다.

재생·정지, mono 믹싱과 확대·축소 컨트롤은 메뉴 아래 툴바에 두고, 시간 룰러는 파형과 분리한다. 채널별 파형과 우측 믹서·이퀄라이저 패널을 각각 접거나 펼칠 수 있다. 효과 대상과 적용 명령은 Effects 메뉴에 두며, File/Edit/Effects/View 메뉴는 한 번에 하나만 열린다.

frame 단위 selection 모델, 경계 핸들, Shift+클릭·드래그를 통한 경계 조정, Ctrl/Cmd+드래그를 통한 선택 전체 이동, 선택 범위 EQ 직접 적용, 시간 룰러와 가로 스크롤바, OfflineAudioContext 기반 3-band EQ를 구현했다. 고급 EQ는 후속 기능이다.

커스텀 에디터는 VS Code 문서 이력과 저장·백업·되돌리기를 사용하고 독립 Webview는 자체 이력을 유지한다. Fade·Normalize·Gain·EQ 적용은 변경된 구간만 이력에 저장한다. Cut·Delete·Paste는 변경 구간을, mono 믹싱은 원본 채널을 이력에 저장한다. 메모리 예산과 디스크 보관, 대용량 성능 측정은 후속 개선 사항이다.


## 사용성 개선 진행 상태

- **구현**: Pause/Resume과 Stop 구분, 툴바·Effects의 채널 대상 선택, 커스텀 에디터의 파일 열기 안내, 커스텀 문서 Undo/Redo 메뉴 상태, EQ 적용 범위와 초기화 안내.
- **구현**: 320px 최소 너비와 760px 이하의 세로 배치, 선택 Start/End 레이블, 채널별 Gain/Pan 이름과 Mute/Solo 접근성 상태, Mix 버튼 그룹 구분.
- **구현**: 채널 믹서는 사용 가능한 너비에 따라 여러 열로 배치하고 공간이 부족하면 한 열로 전환한다.
- **구현**: 패널·메뉴·버튼·값 표시에서 VS Code 테마 색상을 사용하며 밝은 테마의 기본 컨트롤 색상 체계를 지원한다.
- **구현**: 재생 시 전체 버퍼를 미리 렌더링하는 대신 실시간 오디오 그래프를 사용하고 파형 정적 레이어를 캐시한다. 고정 설정의 재생 그래프와 WAV 처리 결과는 Extension Host에서 비교한다.
- **후속 검증**: 실제 긴 오디오의 처리 지연·프로세스 메모리, 좁은 창과 명암 테마의 화면 동선, 키보드·스크린 리더 사용성. Mix 아이콘의 직관성도 추가 검토한다.
- **후속 기능**: 효과 적용 전 예상 peak·clipping 안내, 이력 메모리 예산과 대용량 파일 처리 개선.

합성 2분 stereo(44.1 kHz, 무음) Extension Host 테스트 한 번에서 Float32 오디오 버퍼 크기는 42,336,000바이트, 재생 그래프 생성은 약 0.8ms, 첫 파형 그리기는 약 67ms, 캐시된 재그리기는 평균 약 0.34ms였다. 이는 특정 헤드리스 환경의 예시이며 프로세스 메모리 피크나 실제 파일 성능 측정치는 아니다.
