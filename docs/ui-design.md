# Audio Wave Editor 화면 구성 설계

## 1. 화면 목표

편집자는 중앙 타임라인에서 오디오를 선택하고, Tracks 또는 툴바에서 대상 채널을 확인한다. 믹서와 EQ 미리 듣기는 우측 패널에서 조절한다. 효과는 Effects 메뉴에서 적용하며 EQ는 패널에서도 직접 적용할 수 있다.

## 2. 기본 레이아웃

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Header: 파일명 | File / Edit / Effects / View | 상태                │
│ Toolbar: Play / Stop / Mix | Zoom in / Zoom out                      │
├───────────────┬───────────────────────────────────┬──────────────────┤
│ Track panel   │ Timeline editor                   │ Mixer / EQ       │
│               │ time ruler (별도 영역)            │ (접기 가능)     │
│ CH 1          │ CH 1 waveform + fold              │ volume / pan     │
│ CH 2          │ CH 2 waveform + selection         │ mute / solo      │
│ All channels  │ selection + playhead              │ EQ preview       │
│               │ cut / copy / paste / delete       │ EQ bands         │
├───────────────┴───────────────────────────────────┴──────────────────┤
│ Status: selection time | sample rate | channels | messages          │
└──────────────────────────────────────────────────────────────────────┘
```

| 영역 | 책임 |
| --- | --- |
| Header | 파일명, File/Edit/Effects/View 메뉴, 상태 메시지 |
| Toolbar | 재생, 정지, mono 믹싱과 확대·축소 |
| Track panel | 전체 또는 개별 채널을 이펙트 대상으로 선택 |
| Timeline editor | 시간 눈금, 채널별 파형, 선택, playhead, 편집 명령 |
| Mixer / EQ | 채널별 볼륨·팬·뮤트·솔로와 EQ 미리 듣기 |
| Status | 선택 시작·끝, 프레임, sample rate, 채널 수, 길이, 메시지 |

### 웨이브 에디터 UI 원칙

- **Transport first**: 재생, 정지, 믹스다운과 줌 컨트롤을 메뉴 아래 툴바에 표시하고 파일 열기와 WAV 내보내기는 File 메뉴에 둔다.
- **Timeline center**: 파형과 시간 눈금이 가장 넓은 중앙 영역을 차지한다.
- **Track header left**: 전체 또는 채널을 선택해 선택 영역 이펙트의 대상을 분명히 한다.
- **Inspector**: 넓은 화면에서는 채널 믹서와 EQ를 우측에 두고 좁은 화면에서는 타임라인 아래에 배치한다.
- **Status always visible**: 파일 메타데이터·선택 범위·오류를 하단과 상단 상태 문구에서 확인한다.

## 3. 채널별 타임라인

각 채널은 동일한 시간축을 공유하는 수평 lane이다. lane 상단에 채널 접기 버튼을 표시하고 모든 lane의 선택 시작·끝을 수직으로 정렬한다. Mute와 Solo는 믹서에 있다. 선택한 대상 채널은 Gain·Normalize·Fade·EQ에 적용되며, Cut·Copy·Paste·Delete는 모든 채널의 시간축을 함께 편집한다.

## 4. 타임라인 선택

```ts
type TimelineSelection = {
  startFrame: number;
  endFrame: number;
  channelIds: number[] | 'all';
};
```

선택 시작과 끝을 sample frame으로 저장해 Cut/Copy/Paste에서 반올림 오차를 막는다. 타임라인 드래그는 새 선택, 선택 경계 핸들 드래그는 경계 이동이다. Shift+클릭 또는 Shift+드래그는 가까운 경계를 움직이고 반대쪽 경계를 고정하며, 고정 경계를 넘어가면 시작과 끝을 교환한다. 선택 영역 안에서 Ctrl/Cmd+드래그하면 길이를 유지한 채 선택 전체를 이동하고 문서 경계에서 멈춘다. 핸들에 포커스를 두고 좌우 방향키는 한 프레임, Shift+방향키는 10프레임 이동하며 핸들로 조절할 때 최소 한 프레임을 유지한다. 좁은 선택에서도 두 핸들을 세로로 분리하고 화면 경계에서 잘리지 않게 표시한다. Esc는 선택을 해제한다.

## 5. 편집 기능

### Cut / Copy / Paste / Delete

- Cut은 선택 구간을 클립보드에 저장하고 제거한다.
- Copy는 원본을 변경하지 않고 선택 샘플과 sample rate, channel 수, frame 수를 저장한다.
- Paste는 playhead 위치에 삽입한다. mono→stereo는 복제하고 stereo→mono는 평균 downmix한다.
- Delete는 클립보드를 갱신하지 않고 선택 구간만 제거한다.
- Cut·Copy·Paste·Delete는 대상 채널 설정과 무관하게 모든 채널에서 동일 frame 범위를 사용해 시간축을 유지한다.
- 오디오 편집의 Undo/Redo는 명령 단위로 구간 이력 또는 전체 snapshot을 사용한다. 커스텀 에디터에서는 VS Code의 이력과 연결하고 독립 창에서는 자체 이력을 사용한다.

## 6. 믹싱 패널

채널 스트립은 Gain(0–200%), Pan(-100–+100), Mute, Solo와 실시간 peak meter를 제공한다. Master는 0–200% gain을 조절하며 `Reset mixer`는 모든 채널, Master와 EQ를 초기화한다. Solo가 하나라도 켜지면 solo 채널만 재생한다. 믹서·EQ 미리 듣기 설정은 WAV/MP3 내보내기에 반영되지만 커스텀 문서의 일반 저장에는 반영되지 않는다.

## 7. 선택 영역 이펙트

Effects 메뉴에서 대상 채널과 범위 `Selection` 또는 `Entire document`를 선택하고 Gain, Normalize, EQ, Fade를 적용한다. 대상 채널은 Tracks와 툴바에서도 선택한다. 우측 EQ 패널은 미리 듣기 조절과 같은 대상·범위를 사용하는 Apply EQ 버튼을 제공한다.

- Normalize: 선택 또는 전체 영역의 peak를 -1 dBFS로 보정한다. 무음은 변경하지 않는다.
- Gain: 대상 채널의 선형 gain을 선택 또는 전체 영역에 적용하고 결과를 [-1, 1]로 제한한다.
- EQ: Low/Mid/High를 미리 듣기와 WAV 내보내기에 적용하거나 `Apply EQ`로 선택한 범위와 대상 채널에 직접 적용한다. 적용 후 미리 듣기 EQ를 0 dB로 초기화하며, 선택 시작점에서 필터 상태를 초기화한다. parametric band는 후속 기능이다.
- Apply 후에는 Undo가 가능해야 한다.

적용 전 예상 peak 표시와 clipping 사전 경고는 아직 구현되지 않았다.

## 8. 단축키

| 단축키 | 동작 |
| --- | --- |
| Space | 재생/일시정지 |
| Ctrl/Cmd+A | 전체 선택 |
| Ctrl/Cmd+X/C/V | Cut/Copy/Paste |
| Delete | Delete |
| Ctrl/Cmd+Z | Undo |
| Ctrl/Cmd+Shift+Z | Redo |
| + / - | 확대/축소 |
| Home / End | 시작/끝 이동 |

## 9. 현재 UI 동작

- 파일을 열거나 되돌리면 상단에 전체 경로가 아닌 파일명만 표시한다. 파일명이 없으면 `Untitled audio`를 사용하며, 드롭 영역에는 모드에 맞는 다른 파일 열기 방법을 표시한다.

- 상단 메뉴에서 다른 메뉴를 열거나 메뉴 밖을 클릭하면 기존에 열린 메뉴는 닫힌다. 메뉴 내부 클릭은 메뉴를 닫지 않는다. 열린 메뉴에서 Escape를 누르면 오디오 선택을 유지하며 메뉴를 닫고, 메뉴 안에 포커스가 있었다면 해당 메뉴 제목으로 돌려준다.
- 메뉴 아래 툴바에 Play/Pause, Stop, Mix to mono, Zoom in, Zoom out을 아이콘 버튼으로 배치한다. 각 버튼은 툴팁과 접근성 이름을 제공하며 재생 상태에 따라 Play/Pause 아이콘과 설명이 바뀐다. 줌 버튼은 파일을 연 뒤 사용할 수 있고 표시 중인 구간의 중심을 기준으로 동작한다. View 메뉴의 Fit timeline은 전체 구간을 표시한다.
- 시간 눈금은 파형 차트 위의 별도 룰러에 표시하며 줌과 이동 시 파형과 같은 시간 좌표를 유지한다.
- Undo/Redo, 파일 디코드, 오디오 편집·복원 및 WAV 내보내기 준비 중에는 진행 문구가 있는 잠금 화면을 표시한다. 작업 완료나 오류 시 잠금을 해제하고 이전 포커스를 복원한다.
- 각 채널 타임라인 상단의 버튼으로 파형을 접고 펼친다. 접힌 채널은 파형 대신 축소된 채널 행을 유지하며, 모든 채널을 접어도 각 행에서 다시 펼칠 수 있다. 접기는 표시만 바꾸며 오디오, 재생 및 편집 대상에는 영향을 주지 않는다.
- 상단 메뉴는 파형과 패널 위에 표시한다. 760px 이하에서는 오른쪽 패널이 타임라인 아래로 이동하고 작업 영역을 스크롤한다. Channel mixer와 3-band equalizer는 각각 제목을 눌러 접고 펼칠 수 있으며 조절 값은 유지된다.
- 좌측 Tracks 패널, 툴바의 Target 또는 Effects의 Target channel에서 Normalize, Gain, Fade와 EQ 적용 대상을 선택한다. Webview 너비가 1180px 이하이면 Tracks 패널은 숨겨지지만 툴바와 Effects에서 대상을 확인하고 변경할 수 있다.
- 타임라인을 드래그하면 프레임 단위 선택 구간을 만들고, 짧게 클릭하면 재생 위치를 만든다. 선택 경계 핸들은 룰러 아래와 파형 위의 별도 영역에 두어 채널 접기 버튼과 겹치지 않게 한다. 핸들은 드래그와 키보드로 조정하며 화면 아래에 선택 프레임을 표시한다.
- 재생은 현재 선택 구간을 수행하며, 선택이 없으면 재생 커서부터 파일 끝까지 수행한다. Pause는 현재 위치를 보존하고 다음 Play에서 이어 재생하며, Stop은 선택 시작점으로 이동한다. 선택을 변경하거나 오디오를 편집하면 일시정지 위치는 초기화된다. Play 전에 AudioContext를 resume해 브라우저 자동 재생 정책으로 인한 무음을 막고, 빨간 playhead로 위치를 표시한다.
- 효과 대상은 `Selection` 또는 `Entire document`로 선택한다. Cut/Delete/Paste는 채널의 시간축 정렬을 위해 항상 모든 채널에 적용한다.
- 문서 전체가 선택된 경우 오디오를 모두 제거할 수 없으므로 Cut과 Delete를 비활성화한다. 단축키로 시도하면 이유를 상태에 표시하며 Copy는 사용할 수 있다.
- 효과 범위가 `Selection`이고 선택이 비어 있으면 Apply gain, Normalize와 메뉴·패널의 Apply EQ를 비활성화한다. 구간을 선택하거나 `Entire document`로 전환하면 다시 사용할 수 있다.
- 파형 아래 스크롤바는 전체 오디오 대비 현재 표시 구간을 표시한다. 손잡이에는 최소 크기가 적용되므로 극단적인 확대에서는 표시 길이가 실제 비율보다 클 수 있다. 드래그·트랙 클릭·방향키·Page Up/Down·Home/End로 이동할 수 있다.
- Cut·Delete·Paste로 오디오 길이가 바뀌면 표시 범위를 새 길이 안으로 조정하고 재생 위치를 편집 시작점에 둔다. Undo/Redo 후에도 표시 범위와 스크롤바를 유효하게 유지한다.
- 휠은 가로 이동, Shift+휠 또는 Ctrl+휠은 커서 위치 기준 확대/축소다. `Fit`은 전체 오디오를 다시 표시한다.
- 최대 확대에서 표시 범위는 파일 길이와 관계없이 0.1초다. 파일이 0.1초보다 짧으면 전체 길이를 표시한다. 시간 눈금은 표시 범위에 맞춰 1/2/5 간격으로 조정하고 스크롤바 손잡이는 최소 크기를 유지한다.
- 재생 중 채널 gain/pan/mute/solo, master gain과 3-band EQ를 변경하면 실시간 미리 듣기에 반영된다. `Reset mixer`는 이 설정을 초기값으로 되돌린다. EQ 적용 전에는 선택 채널·범위와 적용 후 미리 듣기 EQ가 초기화된다는 안내를 표시한다.
- 채널 peak meter는 실시간 재생 상태를 표시하며 Pause·Stop·재생 종료 시 초기화된다. WAV 내보내기용 오프라인 렌더링은 미터 값을 변경하지 않는다.
- 디코드할 수 없는 파일은 기존 편집 상태를 보존하고, 드롭 영역과 상태바에 오류를 표시한다. 독립 Webview는 드롭을 지원하지만 커스텀 에디터에서는 드롭 대신 VS Code에서 파일을 열도록 안내한다.
- `Fade in`과 `Fade out`은 현재 선택 구간과 선택한 트랙 대상에 직접 적용하며 Undo로 되돌릴 수 있다.
- Space, Ctrl/Cmd+A/X/C/V/Z, Delete, Home/End, 좌우 화살표, +/- 단축키를 제공한다.
- 확대된 상태에서 Home/End나 좌우 방향키로 이동한 위치가 표시 구간 밖이면 현재 확대 배율을 유지하면서 해당 위치가 보이도록 타임라인을 이동한다.
- 정의되지 않은 Ctrl/Cmd·Alt 조합과 Shift+방향키/Home/End는 편집기 전역 단축키로 가로채지 않는다. 선택 경계 핸들에 포커스가 있을 때의 Shift+방향키는 해당 핸들을 10프레임 이동한다.
- 메뉴에 포커스가 있는 동안 타임라인 전역 단축키를 처리하지 않는다. Escape는 열린 메뉴를 닫는다.

## 10. GUI 개선 상태

- 최소 너비를 320px로 줄이고, 760px 이하에서 우측 패널을 타임라인 아래로 배치한다. 툴바와 Effects에서 대상 채널을 선택할 수 있다.
- 선택 슬라이더에는 `Range`, `Start`, `End`를 표시한다. 채널 Gain/Pan과 peak meter는 채널별 접근성 이름을 제공한다. Gain 값은 퍼센트, Pan 값은 방향과 퍼센트 또는 Center로 제공하며 Mute/Solo는 켜짐 상태를 제공한다.
- Master gain은 퍼센트, EQ는 dB 단위의 접근성 값을 제공하고 조절·초기화·EQ 적용 후 갱신한다.
- 선택 경계 핸들의 접근성 이름과 툴팁은 현재 프레임과 시간을 표시한다. 방향키는 1프레임, Shift와 방향키는 10프레임씩 경계를 이동하며 접근성 설명에도 이 조작을 안내한다.
- Mix는 재생 버튼과 시각적으로 구분하고 채널 수에 맞는 툴팁을 제공한다. mono에서는 버튼을 비활성화하며, 세 채널 이상에서는 처음 두 채널 외의 채널이 제거된다고 안내한다. Undo/Redo로 채널 수가 바뀌면 버튼 상태도 갱신한다.
- 채널 믹서는 사용 가능한 너비에 따라 스트립을 여러 열 또는 한 열로 배치해 세로 스크롤을 줄인다. 각 스트립의 컨트롤과 채널 순서는 유지한다.
- 패널, 버튼, 메뉴와 값 표시에 VS Code 테마 색상을 사용하고 밝은 테마에서는 기본 컨트롤도 밝은 색상 체계를 따른다. 파형 영역은 파형 색상의 가독성을 유지하기 위해 어두운 배경을 사용한다.
- 작은 창에서의 스크롤 동선과 다양한 테마의 실제 화면 대비는 추가 검토 대상이다. 현재 검증은 자동화 테스트 중심이며 실제 사용자 관찰은 수행하지 않았다.

## 11. 적용 순서

1. 공통 시간축과 selection model
2. multi-channel lane과 channel selection
3. Cut/Copy/Paste/Delete 및 snapshot Undo
4. Mixer strip과 preview 재생
5. 선택 영역 Normalize/Gain/EQ Apply
6. 줌·스크롤·peak meter·고급 EQ
