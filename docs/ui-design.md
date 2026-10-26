# Audio Wave Editor 화면 구성 설계

## 1. 화면 목표

편집자는 중앙 타임라인에서 오디오를 정확히 선택하고, 좌측 트랙 목록에서 채널을 확인하며, 우측 패널에서 믹싱·이펙트를 조절한다. 모든 편집 명령은 현재 선택 영역과 대상 채널을 표시한 뒤 실행한다.

## 2. 기본 레이아웃

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Header: 파일명 | Undo | Redo | Save | Zoom | 재생 상태               │
├───────────────┬───────────────────────────────────┬──────────────────┤
│ Track panel   │ Timeline editor                   │ Mixer / Effects  │
│ CH 1  M S     │ time ruler                         │ volume / pan     │
│ CH 2  M S     │ CH 1 waveform + selection         │ mute / solo      │
│ Add / hide    │ CH 2 waveform + playhead          │ Normalize / EQ   │
│               │ cut / copy / paste / delete       │ Apply selection  │
├───────────────┴───────────────────────────────────┴──────────────────┤
│ Status: selection time | sample rate | channels | peak | messages   │
└──────────────────────────────────────────────────────────────────────┘
```

| 영역 | 책임 |
| --- | --- |
| Header | 파일, Undo/Redo, 저장, 줌, 재생 상태 |
| Track panel | 채널 선택, mute/solo, 표시/숨김, 채널 이름 |
| Timeline editor | 시간 눈금, 채널별 파형, 선택, playhead, 편집 명령 |
| Mixer / Effects | 채널별 볼륨·팬·뮤트·솔로와 선택 영역 이펙트 |
| Status bar | 선택 길이, 현재 시간, sample rate, peak, 오류 |

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

시간이 아니라 sample frame을 저장해 Cut/Copy/Paste에서 반올림 오차를 막는다. 빈 타임라인 드래그는 새 선택, 선택 드래그는 이동, 핸들 드래그는 경계 이동이다. Shift+클릭은 선택 확장, Esc는 해제, Shift+방향키는 선택 확장에 사용한다.

## 5. 편집 기능

### Cut / Copy / Paste / Delete

- Cut은 선택 구간을 클립보드에 저장하고 제거한다.
- Copy는 원본을 변경하지 않고 선택 샘플과 sample rate, channel 수, frame 수를 저장한다.
- Paste는 playhead 위치에 삽입한다. mono→stereo는 복제하고 stereo→mono는 평균 downmix한다.
- Delete는 클립보드를 갱신하지 않고 선택 구간만 제거한다.
- 대상 채널이 `all`이면 모든 채널에서 동일 frame 범위를 변경해 시간축을 유지한다.
- Undo/Redo 초기 구현은 명령 단위 snapshot으로 제공한다.

## 6. 믹싱 패널

채널 스트립은 Volume(-∞–+6 dB), Pan(-100–+100), Mute, Solo, Peak meter, Reset을 제공한다. Master strip에는 master volume, peak meter, clipping 표시를 둔다. Solo가 하나라도 켜지면 solo 채널만 재생한다. preview용 Mute/Solo와 실제 내보내기 파라미터는 분리한다.

## 7. 선택 영역 이펙트

Effects 패널은 적용 대상 `Selection`, `Track`, `Entire document`를 항상 표시한다.

- Normalize: 선택 또는 전체 영역의 peak를 target dBFS로 보정하고 예상 peak를 표시한다.
- Gain: 선택 영역에 dB 또는 선형 gain을 적용하고 clipping을 경고한다.
- EQ: Low/Mid/High를 제공하며 후속으로 parametric band를 추가한다.
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

## 9. 적용 순서

1. 공통 시간축과 selection model
2. multi-channel lane과 channel selection
3. Cut/Copy/Paste/Delete 및 snapshot Undo
4. Mixer strip과 preview 재생
5. 선택 영역 Normalize/Gain/EQ Apply
6. 줌·스크롤·peak meter·고급 EQ
