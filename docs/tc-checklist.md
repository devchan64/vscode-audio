# Audio Wave Editor 테스트 체크리스트

## 파일과 파형

- [ ] `FS-001` mono/stereo WAV가 정상적으로 열린다.
- [x] Extension Host에서 특수문자·한글 파일명을 텍스트로 표시하고 되돌린 뒤에도 유지하는지 확인한다.
- [ ] `FS-002` MP3가 디코드되고 실패 시 안내가 표시된다.
- [x] E2E가 `test/fixtures/ash-edge-instrumental.mp3`를 `Open With`로 열고 Webview의 디코드 완료 상태를 검증한다.
- [ ] `FS-003` 독립 Webview에서는 드롭한 파일로 기존 파일이 교체되고 커스텀 에디터에서는 제한을 명확히 안내한다.
- [x] 독립 Webview에서 잘못된 오디오를 디코드하면 기존 버퍼·재생 소스·클립보드를 유지하고 오류를 표시한다 (Extension Host 자동 테스트).
- [ ] `FS-004` 무음, 짧은 파일, 긴 파일의 파형이 표시된다.

## E2E 실행 환경

- 테스트 호스트는 `.vscode-test` 아래의 별도 사용자 데이터와 확장 디렉터리를 사용해 개인 설정과 설치된 확장의 영향을 줄인다. 독립 Webview의 간헐적 응답 시간 초과가 완전히 해소되었는지는 추가 반복 검증이 필요하다.
- `npm run test:e2e:screenshots`는 격리된 테스트 호스트에서 합성 오디오를 열고 README의 편집 화면과 Effects 메뉴 캡처를 `media/`에 저장한다. 캡처 전용 디버깅 포트는 기본 9227이며 `AUDIO_E2E_DEBUG_PORT`로 변경할 수 있다.
- [x] Extension Host에서 1440×900 편집 화면과 Effects 메뉴 캡처를 생성하고 README에서 참조한다. 실제 사용자 오디오는 사용하지 않는다.
- [ ] `npm install` 후 `npm run test:e2e`가 Extension Development Host를 실행한다.
- [x] 테스트가 MP3 픽스처와 커스텀 에디터를 활성화한다.
- [x] Webview가 Tracks, Selection, Transport, Mixer, Effects, Export UI를 초기화하고 디코드한 duration/sample rate/channel 정보를 확장 호스트에 전달한다.
- [ ] E2E 실패 시 Extension Development Host와 테스트 로그를 보존해 원인을 확인한다.
- [ ] 네트워크가 필요한 VS Code 다운로드 실패와 제품 기능 실패를 구분한다.

## 재생과 선택

- [x] Extension Host에서 44.1/48 kHz mono/stereo의 프레임 선택 유지와 범위 제한, 핸들 키보드·드래그 경계 동작을 확인한다.
- [x] Shift+클릭으로 가까운 경계를 조정하고 Shift+드래그가 고정 경계를 넘어갈 수 있는지 Extension Host에서 확인한다.
- [x] Ctrl/Cmd+드래그로 선택 영역을 이동할 때 프레임 길이를 유지하고 문서의 양 끝에서 멈추는지 Extension Host에서 확인한다.
- [ ] `FS-011` 선택 시작점부터 재생되고 Stop 후 재생이 가능하다.
- [x] Extension Host에서 모의 오디오 시계로 Pause 위치, 이어 재생 오프셋과 Stop 위치를 확인한다.
- [x] 모의 오디오 시계로 재생 끝에 도달한 뒤 Pause를 눌렀을 때 완료 상태가 되고 다음 Play가 선택 시작점에서 재생되는지 확인한다.
- [ ] 실제 오디오 장치에서 Pause/Resume의 청감과 시간 동기화를 확인한다.
- [x] Extension Host에서 툴바와 Effects의 대상 채널 선택이 동기화되는지 확인한다.
- [x] 빈 선택 구간에서는 효과 적용 버튼이 비활성화되고 게인이 유지되며, 전체 문서 또는 유효한 선택에서는 다시 활성화된다 (Extension Host 자동 테스트).
- [x] 문서 전체 선택에서는 Cut/Delete가 비활성화되고 Copy는 유지되며 Delete 단축키에 이유가 표시된다. 부분·빈 선택의 버튼 상태도 확인한다 (Extension Host 자동 테스트).
- [ ] 실제 좁은 Webview에서 대상 채널을 확인·변경할 수 있는지 확인한다.
- [x] 커스텀 에디터에서 이력에 따라 Undo/Redo 메뉴 활성 상태가 바뀌는지 확인한다.
- [x] Extension Host에서 재생 소스가 있는 상태로 파일을 다시 열면 이전 소스가 중지되는지 확인한다.
- [ ] 파형과 분리된 상단 룰러의 시간 라벨과 파형 위치가 일치하며, 줌·이동과 채널 접기 후에도 정렬된다.
- [ ] 줌 후에도 커서 아래 시간과 선택 경계가 유지된다.
- [x] Extension Host에서 줌·Fit, 스크롤바 드래그·트랙 클릭·Home/End와 표시 범위 동기화를 확인한다.
- [x] 0.05초부터 10분까지의 합성 오디오에서 최대 확대 0.1초(짧은 파일은 전체 길이), 커서 기준점, 최소 크기 스크롤바 이동과 Fit을 확인한다.
- [x] 44.1/48 kHz mono/stereo에서 확대된 상태로 큰 구간을 삭제한 뒤 표시 범위·재생 위치·스크롤바와 Undo/Redo를 확인한다 (Extension Host 자동 테스트).
- [ ] 실제 화면에서 좁은 창과 확대 배율별 스크롤바 가독성을 확인한다.
- [ ] 재생 헤드가 실제 재생 시간과 동기화된다.
- [ ] mono/stereo 채널 lane과 0 dB 기준선이 올바르게 표시된다.
- [ ] mono와 stereo에서 각 채널과 모든 채널을 접고 펼쳐도 축소된 행이 보이고 시간축, 선택 구간, 재생과 편집 대상이 유지된다.
- [x] 스테레오 채널 하나를 접고 펼칠 때 접근성 상태와 선택 구간·편집 대상이 유지된다 (Extension Host 자동 테스트).
- [ ] 키보드로 채널 접기 버튼을 선택하고 Space 또는 Enter로 접고 펼칠 수 있다.
- [x] stereo에서 mono 믹싱과 Undo/Redo 후 채널 접기 컨트롤의 수가 채널 수와 일치한다 (Extension Host 자동 테스트). 파일 재열기는 별도 확인이 필요하다.
- [ ] 메뉴 아래 툴바의 재생·정지·모노 믹싱과 줌 아이콘이 다른 화면 요소에 가려지지 않는다.
- [x] 툴바 아이콘에 툴팁과 접근성 이름이 있고 재생 상태에 따라 Play/Pause 설명이 바뀐다.
- [x] mono에서는 Mix를 비활성화하고 stereo 복원·재적용 시 상태를 갱신하며 세 채널 이상에는 채널 제거를 안내한다 (Extension Host 자동 테스트).
- [ ] 파일을 열기 전 줌 버튼이 비활성화되고, 파일을 연 후 Zoom in/out과 View의 Fit timeline으로 룰러와 파형이 함께 확대·축소된다.
- [x] 다른 상단 메뉴를 열면 기존에 열린 메뉴가 닫힌다 (Extension Host 자동 테스트).
- [x] Extension Host에서 메뉴 내부 클릭은 메뉴를 유지하고 메뉴 밖 클릭은 닫는지 확인한다.
- [x] 열린 메뉴에서 Escape가 선택 구간을 지우지 않고 메뉴를 닫으며 포커스를 메뉴 제목으로 돌리는지 Extension Host에서 확인한다.
- [x] 메뉴에 포커스가 있을 때 Delete, Home, Ctrl+A가 타임라인 선택을 변경하지 않는지 Extension Host에서 확인한다.

- [ ] 우측 Channel mixer와 3-band equalizer를 각각 마우스와 키보드로 접고 펼쳐도 조절 값과 다른 패널의 상태가 유지된다.
- [x] Effects 메뉴에 대상 채널·범위와 Gain, Normalize, EQ, Fade 명령이 있고 기존 Effects 패널이 제거됐는지 Extension Host에서 확인한다.
- [x] Channel mixer를 클릭으로 접고 펼칠 때 게인 값과 다른 패널의 열린 상태가 유지된다 (Extension Host 자동 테스트).

## GUI 배치와 접근성 개선 검증

- [x] 밝은 테마 색상을 모의 적용했을 때 패널·버튼·메뉴·값의 계산된 색상과 기본 컨트롤 색상 체계를 확인한다 (Extension Host 자동 테스트). 실제 테마의 시각적 대비 확인은 남아 있다.
- [x] 채널 믹서의 두 스트립이 충분한 너비에서는 나란히 표시되고 좁은 너비에서는 한 열로 표시되며 가로로 넘치지 않는다 (Extension Host 자동 레이아웃 테스트).
- [x] 선택 경계 핸들의 접근성 이름이 키보드 이동 후 현재 프레임과 시간을 반영하고 조작 설명을 제공한다 (Extension Host 자동 테스트). 실제 스크린 리더에서의 안내는 별도 확인이 필요하다.
- [x] 타임라인 시작의 한 프레임 선택에서 두 핸들이 채널 라벨과 겹치지 않으며 접힌 채널에서도 분리되는지 Extension Host 레이아웃 검사로 확인한다. 실제 화면 확인은 별도 수행한다.
- [x] 정의되지 않은 Ctrl+방향키, Alt+Home, Shift+End가 선택 구간을 변경하거나 기본 동작을 차단하지 않는지와 일반 Home 동작을 Extension Host에서 확인한다.
- [x] 확대된 타임라인에서 Home/End로 이동하면 확대 배율을 유지하고 이동한 위치가 보이도록 표시 구간이 이동한다 (Extension Host 자동 테스트).

- [ ] 좁은 편집기 그룹에서 가로 스크롤 없이 파형과 대상 채널 선택을 사용할 수 있다.
- [ ] 우측 패널을 접거나 전환할 때 Mixer·Effects·EQ 조절과 현재 값이 유지된다.
- [x] 채널 Gain/Pan 접근성 이름과 Mute/Solo 상태를 Extension Host에서 확인한다.
- [x] 채널 Gain의 퍼센트, Pan의 좌·우·중앙 값과 peak meter 이름이 접근성 속성으로 제공되고 입력에 따라 갱신되는지 Extension Host에서 확인한다. 실제 스크린 리더 검증은 남아 있다.
- [x] Master와 EQ의 접근성 값이 입력·초기화·EQ 적용 시 퍼센트와 dB 단위로 갱신되는지 Extension Host에서 확인한다.
- [ ] 실제 화면에서 선택 시작·끝 슬라이더의 시각적 구분을 확인한다.
- [ ] Mute/Solo의 켜짐 상태가 실제 스크린 리더에 전달되는지 확인한다.
- [ ] 파일 로드 후 중복 표시가 줄어도 파일명과 파일 열기 방법을 확인할 수 있다.
- [ ] 툴바의 Mix 기능을 식별할 수 있고 모든 아이콘에 툴팁과 접근성 이름이 있다.
- [ ] 좁은 창과 넓은 창, 명암 테마에서 레이아웃과 대비를 직접 확인한다.

## 오디오 처리

- [x] `FS-020` 44.1/48 kHz mono/stereo에서 Gain 적용이 대상 외 채널과 선택 구간 밖을 보존하고 clipping 및 Undo/Redo를 유지한다 (Extension Host 자동 테스트).
- [x] Extension Host에서 44.1/48 kHz mono/stereo 각 대역의 EQ 증폭·감쇠, 무음과 clipping 경계를 확인한다.
- [x] 선택 EQ 적용이 대상 외 채널·구간을 보존하고 빈 선택은 변경하지 않으며 Undo/Redo되는지 확인한다.
- [x] 이퀄라이저 패널의 Apply EQ가 메뉴와 같은 대상·범위를 사용하고 미리 듣기 초기화와 Undo/Redo를 수행하는지 Extension Host에서 확인한다.
- [x] 동일 Webview HTML의 브라우저 화면에서 좁은 선택과 한 프레임 선택의 양쪽 핸들 드래그 및 타임라인 경계 표시를 확인한다.
- [x] Extension Host에서 한 프레임 핸들의 위치 분리와 범위 확장을 확인한다.
- [x] stereo 클립을 mono에 Paste할 때 양 채널 평균을 사용하고 Undo로 복원한다.
- [x] 긴 PCM WAV의 Base64 변환이 호출 스택 크기를 넘지 않는지 확인한다.
- [x] Webview WAV 인코더가 RIFF 크기 경계를 검사하고 초과 시 출력 버퍼를 할당하거나 샘플을 읽기 전에 실패하는지 확인한다 (Extension Host 자동 테스트).
- [ ] `FS-022` Normalize 후 최대 절대 샘플값이 1.0 이하이다.
- [x] 44.1/48 kHz mono/stereo 무음 Normalize가 샘플과 이력을 변경하지 않으며, 유음 Normalize는 -1 dBFS와 Undo 복원을 유지한다 (Extension Host 자동 테스트).
- [x] 44.1/48 kHz mono/stereo에서 100% Gain의 변경 없는 적용은 이력을 만들지 않고, 범위 밖 샘플은 클리핑 후 Undo로 복원한다 (Extension Host 자동 테스트).
- [x] 44.1/48 kHz mono/stereo에서 무음 Fade는 이력과 Redo를 유지하고, 유음 Fade와 Undo는 정상 동작한다. 한 프레임 선택에는 Fade가 비활성화된다 (Extension Host 자동 테스트).
- [ ] `FS-023` stereo mix 결과가 mono이며 clipping하지 않는다.

## 처리 중 잠금

- [x] Extension Host에서 작업 중 진행 화면과 입력 잠금이 켜지고 완료·오류 후 해제되는지 확인한다.
- [ ] 실제 대용량 파일의 Undo/Redo·처리 중 화면 표시와 키보드 포커스를 확인한다.
- [x] 합성 2분 stereo 버퍼로 그래프 준비와 파형 캐시 재그리기를 측정하고, 재생 그래프와 오프라인 결과를 비교한다.
- [x] WAV 내보내기용 오프라인 렌더링이 실시간 재생 미터의 값과 clipping 상태를 덮어쓰지 않는지 Extension Host에서 확인한다.
- [ ] 실제 대용량 파일의 재생 지연과 프로세스 메모리 피크를 측정한다.
- [x] EQ 적용 범위·대상 선택과 EQ 초기화 안내 문구가 제공되는지 자동 확인한다.
- [ ] 실제 화면에서 EQ 대상과 안내의 가독성을 확인한다.

## 문서 이력과 복구

- [x] Extension Host에서 편집 후 VS Code Undo/Redo가 샘플을 복원하고 수정 상태가 바뀐다.
- [x] Extension Host에서 PCM WAV 저장, Save As, 백업으로 새 Webview 복구와 파일 되돌리기를 확인한다.
- [x] mono/stereo 부분 효과의 구간 이력과 변경되지 않은 채널, 독립 창의 Undo/Redo를 Extension Host에서 확인한다.
- [x] 44.1/48 kHz mono/stereo에서 Cut·Delete·Paste의 Undo/Redo와 stereo→mono 믹싱 복원 및 clipping 경계를 확인한다.
- [x] 독립 Webview의 mono 믹싱이 원본 채널 배열을 재사용하고 새 버퍼 변경에도 보존하며 2·3채널 Undo/Redo를 수행하는지 확인한다. 프로세스 메모리 피크는 별도 측정이 필요하다.
- [x] 커스텀 에디터에서 Cut·Delete·Paste가 변경 구간만, mono 믹싱이 원본 채널만 이력에 보관하는지 확인한다.
- [ ] 대용량 파일의 이력과 자동 백업 메모리 사용량을 확인한다.

## 저장

- [x] Extension Host에서 동시 WAV 버전 내보내기가 기존 파일과 원본을 보존하고, MP3 버전을 다시 디코드해 채널·길이와 미리 듣기 Master gain 반영을 확인한다.
- [x] 44.1/48 kHz mono/stereo MP3 인코딩, 무음 비트레이트, 지원하지 않는 채널·샘플레이트를 단위 테스트한다.
- [ ] 원격 파일 시스템 제공자별 덮어쓰기 금지 rename의 동시성 보장과 실제 대용량 MP3 인코딩을 확인한다.
- [x] MP3 인코더의 라이선스 선언과 VSIX에 포함되는 고지·라이선스 원문을 확인한다.
- [ ] Marketplace 배포 전 프로젝트 자체 라이선스를 권리자가 결정하고, 인코더의 대응 소스 제공과 설치된 확장에서 수정된 라이브러리 교체를 검증한다. 상세 사항은 [라이선스 검토](license-review.md)를 참고한다.
- [x] `FS-030` Webview가 생성한 44.1/48 kHz mono/stereo WAV의 헤더, byte rate와 data 길이를 Extension Host에서 확인한다.
- [x] Webview PCM16 변환에서 -1과 1이 각각 -32768과 32767로 저장되는지 확인한다.
- [x] WAV 내보내기 취소·선택 실패·쓰기 실패와 쓰기 완료를 구분한다 (단위 테스트). Extension Host Webview에서 각 결과의 상태 문구도 확인한다. 실제 저장 대화상자 조작은 별도 확인이 필요하다.
- [x] 커스텀 문서 Save As에서 WAV 외 확장자·취소·쓰기 실패가 파일을 만들거나 편집 오디오와 수정 상태를 잃지 않는지 Extension Host에서 확인한다.
- [x] WAV가 아닌 원본의 기본 내보내기 이름이 `.wav`이며 WAV 외 확장자는 파일을 쓰지 않고 거부한다 (단위 테스트).
- [x] 생성된 WAV를 Web Audio로 다시 디코드해 채널 수와 리샘플링 허용 오차 내 duration을 확인한다 (Extension Host 자동 테스트).
