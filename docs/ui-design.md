# Audio Wave Editor 화면 구성 설계

## 1. 화면 목표

편집자는 중앙 타임라인에서 오디오를 정확히 선택하고, 좌측 트랙 목록에서 채널을 확인하며, 우측 패널에서 믹싱·이펙트를 조절한다. 모든 편집 명령은 현재 선택 영역과 대상 채널을 표시한 뒤 실행한다.

## 2. 기본 레이아웃

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Header: 파일명 | File / Edit / View | 상태                           │
│ Toolbar: Play / Stop / Mix | Zoom in / Zoom out                      │
├───────────────┬───────────────────────────────────┬──────────────────┤
│ Track panel   │ Timeline editor                   │ Mixer / Effects  │
│               │ time ruler (별도 영역)            │ (접기 가능)     │
│ CH 1          │ CH 1 waveform + fold              │ volume / pan     │
│ CH 2          │ CH 2 waveform + selection         │ mute / solo      │
│ All channels  │ selection + playhead              │ Normalize / EQ   │
│               │ cut / copy / paste / delete       │ Apply selection  │
├───────────────┴───────────────────────────────────┴──────────────────┤
│ Status: selection time | sample rate | channels | peak | messages   │
└──────────────────────────────────────────────────────────────────────┘
```

| 영역 | 책임 |
| --- | --- |
| Header | 파일명, File/Edit/View 메뉴, 상태 메시지 |
| Toolbar | 재생, 정지, mono 믹싱과 확대·축소 |
| Track panel | 전체 또는 개별 채널을 이펙트 대상으로 선택 |
| Timeline editor | 시간 눈금, 채널별 파형, 선택, playhead, 편집 명령 |
| Mixer / Effects | 채널별 볼륨·팬·뮤트·솔로와 선택 영역 이펙트 |
| Status bar | 선택 길이, 현재 시간, sample rate, peak, 오류 |

### 웨이브 에디터 UI 원칙

- **Transport first**: 재생, 정지, 믹스다운과 줌 컨트롤을 메뉴 아래 툴바에 표시하고 파일 열기와 WAV 내보내기는 File 메뉴에 둔다.
- **Timeline center**: 파형과 시간 눈금이 가장 넓은 중앙 영역을 차지한다.
- **Track header left**: 전체 또는 채널을 선택해 선택 영역 이펙트의 대상을 분명히 한다.
- **Inspector right**: 채널 믹서, 효과 범위, EQ를 우측에 고정해 재생·편집과 충돌하지 않게 한다.
- **Status always visible**: 파일 메타데이터·선택 범위·오류를 하단과 상단 상태 문구에서 확인한다.

## 3. 채널별 타임라인

각 채널은 동일한 시간축을 공유하는 수평 lane이다. lane 왼쪽에 채널명·번호·mute·solo를 표시하고, 모든 lane의 선택 시작·끝을 수직으로 정렬한다. 채널을 지정하면 해당 채널에만 편집하고, 지정하지 않으면 모든 채널에 적용한다. 채널별 스크롤은 금지하고 타임라인 전체를 함께 스크롤한다.

## 4. 타임라인 선택

```ts
type TimelineSelection = {
  startFrame: number;
  endFrame: number;
  channelIds: number[] | 'all';
};
```

선택 시작과 끝을 sample frame으로 저장해 Cut/Copy/Paste에서 반올림 오차를 막는다. 타임라인 드래그는 새 선택, 선택 경계 핸들 드래그는 경계 이동이다. 핸들에 포커스를 두고 좌우 방향키는 한 프레임, Shift+방향키는 10프레임 이동하며 경계는 서로 넘어가지 않으며 핸들로 조절할 때 최소 한 프레임을 유지한다. 좁은 선택에서도 두 핸들을 세로로 분리하고 화면 경계에서 잘리지 않게 표시한다. Esc는 선택을 해제한다. 선택 이동과 Shift+클릭 확장은 후속 기능이다.

## 5. 편집 기능

### Cut / Copy / Paste / Delete

- Cut은 선택 구간을 클립보드에 저장하고 제거한다.
- Copy는 원본을 변경하지 않고 선택 샘플과 sample rate, channel 수, frame 수를 저장한다.
- Paste는 playhead 위치에 삽입한다. mono→stereo는 복제하고 stereo→mono는 평균 downmix한다.
- Delete는 클립보드를 갱신하지 않고 선택 구간만 제거한다.
- 대상 채널이 `all`이면 모든 채널에서 동일 frame 범위를 변경해 시간축을 유지한다.
- 오디오 편집의 Undo/Redo는 명령 단위로 구간 이력 또는 전체 snapshot을 사용한다. 커스텀 에디터에서는 VS Code의 이력과 연결하고 독립 창에서는 자체 이력을 사용한다.

## 6. 믹싱 패널

채널 스트립은 Volume(-∞–+6 dB), Pan(-100–+100), Mute, Solo, Peak meter, Reset을 제공한다. Master strip에는 master volume, peak meter, clipping 표시를 둔다. Solo가 하나라도 켜지면 solo 채널만 재생한다. preview용 Mute/Solo와 실제 내보내기 파라미터는 분리한다.

## 7. 선택 영역 이펙트

Effects 패널은 범위 `Selection` 또는 `Entire document`를 표시한다. 대상 채널은 Tracks에서 선택한다.

- Normalize: 선택 또는 전체 영역의 peak를 target dBFS로 보정하고 예상 peak를 표시한다.
- Gain: 선택 영역에 dB 또는 선형 gain을 적용하고 clipping을 경고한다.
- EQ: Low/Mid/High를 미리 듣기와 WAV 내보내기에 적용하거나 `Apply EQ`로 선택한 범위와 대상 채널에 직접 적용한다. 적용 후 미리 듣기 EQ를 0 dB로 초기화하며, 선택 시작점에서 필터 상태를 초기화한다. parametric band는 후속 기능이다.
- Apply 후에는 Undo가 가능해야 한다.

초기 MVP는 preview와 Apply를 통합할 수 있지만, 상태 모델은 비파괴 preview와 적용 결과를 분리할 수 있게 설계한다.

## 8. 단축키

| 단축키 | 동작 |
| --- | --- |
| Space | 재생/정지 |
| Ctrl/Cmd+A | 전체 선택 |
| Ctrl/Cmd+X/C/V | Cut/Copy/Paste |
| Delete | Delete |
| Ctrl/Cmd+Z | Undo |
| Ctrl/Cmd+Shift+Z | Redo |
| + / - | 확대/축소 |
| Home / End | 시작/끝 이동 |

## 9. 현재 UI 동작

- 파일을 열거나 되돌리면 상단과 드롭 영역에 전체 경로가 아닌 파일명만 표시한다. 파일명이 없으면 `Untitled audio`를 사용한다.

- 상단 메뉴에서 다른 메뉴를 열거나 메뉴 밖을 클릭하면 기존에 열린 메뉴는 닫힌다. 메뉴 내부 클릭은 메뉴를 닫지 않는다.
- 메뉴 아래 툴바에 Play/Pause, Stop, Mix to mono, Zoom in, Zoom out을 아이콘 버튼으로 배치한다. 각 버튼은 툴팁과 접근성 이름을 제공하며 재생 상태에 따라 Play/Pause 아이콘과 설명이 바뀐다. 줌 버튼은 파일을 연 뒤 사용할 수 있고 표시 중인 구간의 중심을 기준으로 동작한다. View 메뉴의 Fit timeline은 전체 구간을 표시한다.
- 시간 눈금은 파형 차트 위의 별도 룰러에 표시하며 줌과 이동 시 파형과 같은 시간 좌표를 유지한다.
- Undo/Redo, 파일 디코드, 오디오 편집·복원 및 WAV 내보내기 준비 중에는 진행 문구가 있는 잠금 화면을 표시한다. 작업 완료나 오류 시 잠금을 해제하고 이전 포커스를 복원한다.
- 각 채널 타임라인 상단의 버튼으로 파형을 접고 펼친다. 접힌 채널은 파형 대신 축소된 채널 행을 유지하며, 모든 채널을 접어도 각 행에서 다시 펼칠 수 있다. 접기는 표시만 바꾸며 오디오, 재생 및 편집 대상에는 영향을 주지 않는다.
- 상단 메뉴는 파형과 패널 위에 표시하고, 오른쪽 오디오 조절 패널은 높이가 부족하면 스크롤한다. Channel mixer, Effects, 3-band equalizer는 각각 제목을 눌러 접고 펼칠 수 있으며 조절 값은 유지된다.
- 좌측 Tracks 패널에서 전체 또는 개별 채널을 선택해 Normalize, Gain, Fade와 EQ 적용의 대상을 정한다. 현재 Webview 너비가 1180px 이하이면 패널이 숨겨지지만 기존 대상 선택은 유지된다.
- 타임라인을 드래그하면 프레임 단위 선택 구간을 만들고, 짧게 클릭하면 재생 위치를 만든다. 선택 경계 핸들은 드래그와 키보드로 조정하며 화면 아래에 선택 프레임을 표시한다.
- 재생은 현재 선택 구간을 수행하며, 선택이 없으면 재생 커서부터 파일 끝까지 수행한다. 현재 Pause는 소스를 중지하고 선택 시작점으로 돌아가며 이어 재생하지 않는다. Play 전에 AudioContext를 resume해 브라우저 자동 재생 정책으로 인한 무음을 막고, 빨간 playhead로 위치를 표시한다.
- 효과 대상은 `Selection` 또는 `Entire document`로 선택한다. Cut/Delete/Paste는 채널의 시간축 정렬을 위해 항상 모든 채널에 적용한다.
- 파형 아래 스크롤바는 전체 오디오 대비 현재 표시 구간을 비례해 표시한다. 표시 구간을 드래그하거나 트랙을 클릭해 이동하고, 포커스한 상태에서 방향키·Page Up/Down·Home/End로 이동할 수 있다.
- 휠은 가로 이동, Shift+휠 또는 Ctrl+휠은 커서 위치 기준 확대/축소다. `Fit`은 전체 오디오를 다시 표시한다.
- `Reset mixer`는 master gain, 채널 gain/pan/mute/solo와 3-band EQ를 초기값으로 되돌린다.
- 디코드할 수 없는 파일은 기존 편집 상태를 보존하고, 드롭 영역과 상태바에 오류를 표시한다. 독립 Webview는 드롭을 지원하지만 커스텀 에디터에서는 드롭 대신 VS Code에서 파일을 열도록 안내한다.
- `Fade in`과 `Fade out`은 현재 선택 구간과 선택한 트랙 대상에 직접 적용하며 Undo로 되돌릴 수 있다.
- Space, Ctrl/Cmd+A/X/C/V/Z, Delete, Home/End, 좌우 화살표, +/- 단축키를 제공한다.

## 10. GUI 검토 결과와 개선 목표

현재 Webview는 좁은 화면에서 `Tracks`를 숨기고 최소 너비를 유지하며, 우측 패널은 세로 스크롤한다. 이 때문에 좁은 편집기 그룹에서 대상 채널이 보이지 않거나 가로·세로 스크롤이 필요할 수 있다. 다음 항목은 **미구현 개선 목표**다.

- 어느 폭에서도 효과 대상 채널을 확인하고 변경할 수 있게 하고, 좁은 창에서는 우측 패널의 접기 또는 탭 배치를 검토한다.
- 선택 범위 슬라이더에 `Start`와 `End`를 각각 표시한다.
- 채널별 Gain/Pan에 채널을 포함한 접근성 이름을 제공하고, Mute/Solo의 켜짐 상태를 접근성 정보로 전달한다.
- 채널 스트립과 우측 패널의 세로 밀도를 개선하고 파일명·드롭 영역의 정보 중복을 줄인다.
- Mix 아이콘과 툴바 그룹의 식별성을 개선하면서 툴팁과 접근성 이름을 유지한다.

이 검토는 코드와 앞서 확인한 브라우저 화면을 기준으로 했으며 실제 사용자 관찰이나 모든 창 크기·테마에서의 검증은 포함하지 않는다.

## 11. 적용 순서

1. 공통 시간축과 selection model
2. multi-channel lane과 channel selection
3. Cut/Copy/Paste/Delete 및 snapshot Undo
4. Mixer strip과 preview 재생
5. 선택 영역 Normalize/Gain/EQ Apply
6. 줌·스크롤·peak meter·고급 EQ
