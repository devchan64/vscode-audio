# Audio Wave Editor 테스트 체크리스트

## 파일과 파형

- [ ] `FS-001` mono/stereo WAV가 정상적으로 열린다.
- [x] Extension Host에서 특수문자·한글 파일명을 텍스트로 표시하고 되돌린 뒤에도 유지하는지 확인한다.
- [ ] `FS-002` MP3가 디코드되고 실패 시 안내가 표시된다.
- [x] E2E가 `test/fixtures/ash-edge-instrumental.mp3`를 `Open With`로 열고 Webview의 디코드 완료 상태를 검증한다.
- [ ] `FS-003` 독립 Webview에서는 드롭한 파일로 기존 파일이 교체되고 커스텀 에디터에서는 제한을 명확히 안내한다.
- [ ] `FS-004` 무음, 짧은 파일, 긴 파일의 파형이 표시된다.

## E2E 실행 환경

- [ ] `npm install` 후 `npm run test:e2e`가 Extension Development Host를 실행한다.
- [x] 테스트가 MP3 픽스처와 커스텀 에디터를 활성화한다.
- [x] Webview가 Tracks, Selection, Transport, Mixer, Effects, Export UI를 초기화하고 디코드한 duration/sample rate/channel 정보를 확장 호스트에 전달한다.
- [ ] E2E 실패 시 Extension Development Host와 테스트 로그를 보존해 원인을 확인한다.
- [ ] 네트워크가 필요한 VS Code 다운로드 실패와 제품 기능 실패를 구분한다.

## 재생과 선택

- [x] Extension Host에서 44.1/48 kHz mono/stereo의 프레임 선택 유지와 범위 제한, 핸들 키보드·드래그 경계 동작을 확인한다.
- [ ] `FS-011` 선택 시작점부터 재생되고 Stop 후 재생이 가능하다.
- [ ] Pause 후 같은 위치에서 이어 재생하고 Stop 후 선택 시작점에서 재생한다. 현재 Pause는 시작점으로 돌아가므로 개선이 필요하다.
- [ ] 좁은 Webview에서도 이펙트 대상 채널을 확인·변경할 수 있다. 현재 Tracks 패널은 1180px 이하에서 숨겨진다.
- [ ] 커스텀 에디터에서 Undo/Redo가 불가능할 때 적절한 상태 또는 안내가 표시된다.
- [x] Extension Host에서 재생 소스가 있는 상태로 파일을 다시 열면 이전 소스가 중지되는지 확인한다.
- [ ] 파형과 분리된 상단 룰러의 시간 라벨과 파형 위치가 일치하며, 줌·이동과 채널 접기 후에도 정렬된다.
- [ ] 줌 후에도 커서 아래 시간과 선택 경계가 유지된다.
- [x] Extension Host에서 줌·Fit, 스크롤바 드래그·트랙 클릭·Home/End와 표시 범위 동기화를 확인한다.
- [ ] 실제 화면에서 좁은 창과 확대 배율별 스크롤바 가독성을 확인한다.
- [ ] 재생 헤드가 실제 재생 시간과 동기화된다.
- [ ] mono/stereo 채널 lane과 0 dB 기준선이 올바르게 표시된다.
- [ ] mono와 stereo에서 각 채널과 모든 채널을 접고 펼쳐도 축소된 행이 보이고 시간축, 선택 구간, 재생과 편집 대상이 유지된다.
- [ ] 키보드로 채널 접기 버튼을 선택하고 Space 또는 Enter로 접고 펼칠 수 있다.
- [ ] 파일을 다시 열거나 mono로 믹싱한 뒤 채널 접기 컨트롤이 채널 수와 일치한다.
- [ ] 메뉴 아래 툴바의 재생·정지·모노 믹싱과 줌 아이콘이 다른 화면 요소에 가려지지 않는다.
- [x] 툴바 아이콘에 툴팁과 접근성 이름이 있고 재생 상태에 따라 Play/Pause 설명이 바뀐다.
- [ ] 파일을 열기 전 줌 버튼이 비활성화되고, 파일을 연 후 Zoom in/out과 View의 Fit timeline으로 룰러와 파형이 함께 확대·축소된다.
- [ ] 다른 상단 메뉴를 열면 기존에 열린 메뉴가 닫힌다.
- [x] Extension Host에서 메뉴 내부 클릭은 메뉴를 유지하고 메뉴 밖 클릭은 닫는지 확인한다.

- [ ] 우측 Channel mixer, Effects, 3-band equalizer를 각각 마우스와 키보드로 접고 펼쳐도 조절 값과 다른 패널의 상태가 유지된다.

## GUI 배치와 접근성 개선 검증

- [ ] 좁은 편집기 그룹에서 가로 스크롤 없이 파형과 대상 채널 선택을 사용할 수 있다.
- [ ] 우측 패널을 접거나 전환할 때 Mixer·Effects·EQ 조절과 현재 값이 유지된다.
- [ ] 선택 시작·끝 슬라이더가 시각적으로 구분되고 채널 Gain/Pan이 채널별 접근성 이름을 제공한다.
- [ ] Mute/Solo의 켜짐 상태가 키보드와 보조 기술에 전달된다.
- [ ] 파일 로드 후 중복 표시가 줄어도 파일명과 파일 열기 방법을 확인할 수 있다.
- [ ] 툴바의 Mix 기능을 식별할 수 있고 모든 아이콘에 툴팁과 접근성 이름이 있다.
- [ ] 좁은 창과 넓은 창, 명암 테마에서 레이아웃과 대비를 직접 확인한다.

## 오디오 처리

- [ ] `FS-020` 채널별 게인이 서로 독립적으로 적용된다.
- [x] Extension Host에서 44.1/48 kHz mono/stereo 각 대역의 EQ 증폭·감쇠, 무음과 clipping 경계를 확인한다.
- [x] 선택 EQ 적용이 대상 외 채널·구간을 보존하고 빈 선택은 변경하지 않으며 Undo/Redo되는지 확인한다.
- [x] 동일 Webview HTML의 브라우저 화면에서 좁은 선택과 한 프레임 선택의 양쪽 핸들 드래그 및 타임라인 경계 표시를 확인한다.
- [x] Extension Host에서 한 프레임 핸들의 위치 분리와 범위 확장을 확인한다.
- [x] stereo 클립을 mono에 Paste할 때 양 채널 평균을 사용하고 Undo로 복원한다.
- [x] 긴 PCM WAV의 Base64 변환이 호출 스택 크기를 넘지 않는지 확인한다.
- [ ] `FS-022` Normalize 후 최대 절대 샘플값이 1.0 이하이다.
- [ ] 무음 Normalize가 NaN이나 Infinity를 만들지 않는다.
- [ ] `FS-023` stereo mix 결과가 mono이며 clipping하지 않는다.

## 처리 중 잠금

- [x] Extension Host에서 작업 중 진행 화면과 입력 잠금이 켜지고 완료·오류 후 해제되는지 확인한다.
- [ ] 실제 대용량 파일의 Undo/Redo·처리 중 화면 표시와 키보드 포커스를 확인한다.
- [ ] 긴 파일의 재생 준비 지연과 메모리를 측정하고 진행·취소 수단의 필요성을 확인한다.
- [ ] EQ 적용 전 범위·채널과 적용 후 EQ 초기화 동작을 사용자가 확인할 수 있다.

## 문서 이력과 복구

- [x] Extension Host에서 편집 후 VS Code Undo/Redo가 샘플을 복원하고 수정 상태가 바뀐다.
- [x] Extension Host에서 PCM WAV 저장, Save As, 백업으로 새 Webview 복구와 파일 되돌리기를 확인한다.
- [x] mono/stereo 부분 효과의 구간 이력과 변경되지 않은 채널, 독립 창의 Undo/Redo를 Extension Host에서 확인한다.
- [x] 44.1/48 kHz mono/stereo에서 Cut·Delete·Paste의 Undo/Redo와 stereo→mono 믹싱 복원 및 clipping 경계를 확인한다.
- [x] 커스텀 에디터에서 Cut·Delete·Paste가 변경 구간만, mono 믹싱이 원본 채널만 이력에 보관하는지 확인한다.
- [ ] 대용량 파일의 이력과 자동 백업 메모리 사용량을 확인한다.

## 저장

- [ ] `FS-030` WAV 헤더의 channel count, sample rate, byte rate가 일치한다.
- [ ] PCM16 변환에서 -1과 1 경계가 유효한 정수로 저장된다.
- [ ] 저장 취소와 저장 실패가 성공 상태로 표시되지 않는다.
- [ ] 생성된 `.wav`를 다시 열었을 때 duration과 채널 수가 유지된다.
