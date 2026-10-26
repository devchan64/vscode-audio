# Audio Wave Editor 테스트 체크리스트

## 파일과 파형

- [ ] `FS-001` mono/stereo WAV가 정상적으로 열린다.
- [ ] `FS-002` MP3가 디코드되고 실패 시 안내가 표시된다.
- [ ] E2E가 `test/fixtures/ash-edge-instrumental.mp3`를 실제로 열어 확장 명령을 검증한다.
- [ ] `FS-003` 드롭한 파일로 기존 파일이 교체된다.
- [ ] `FS-004` 무음, 짧은 파일, 긴 파일의 파형이 표시된다.

## E2E 실행 환경

- [ ] `npm install` 후 `npm run test:e2e`가 Extension Development Host를 실행한다.
- [ ] 테스트가 임시 mono PCM WAV 픽스처를 생성하고 확장 명령을 활성화한다.
- [ ] E2E 실패 시 Extension Development Host와 테스트 로그를 보존해 원인을 확인한다.
- [ ] 네트워크가 필요한 VS Code 다운로드 실패와 제품 기능 실패를 구분한다.

## 재생과 선택

- [ ] `FS-010` 시작/끝 역전 입력이 허용되지 않는다.
- [ ] `FS-011` 선택 시작점부터 재생되고 Stop 후 재생이 가능하다.
- [ ] 재생 중 버퍼를 다시 열어도 이전 소스가 남지 않는다.
- [ ] 타임라인 시간 라벨과 파형 위치가 일치한다.
- [ ] 줌 후에도 커서 아래 시간과 선택 경계가 유지된다.
- [ ] 재생 헤드가 실제 재생 시간과 동기화된다.
- [ ] mono/stereo 채널 lane과 0 dB 기준선이 올바르게 표시된다.

## 오디오 처리

- [ ] `FS-020` 채널별 게인이 서로 독립적으로 적용된다.
- [ ] `FS-021` EQ 값이 양·음 방향으로 반영된다.
- [ ] `FS-022` Normalize 후 최대 절대 샘플값이 1.0 이하이다.
- [ ] 무음 Normalize가 NaN이나 Infinity를 만들지 않는다.
- [ ] `FS-023` stereo mix 결과가 mono이며 clipping하지 않는다.

## 저장

- [ ] `FS-030` WAV 헤더의 channel count, sample rate, byte rate가 일치한다.
- [ ] PCM16 변환에서 -1과 1 경계가 유효한 정수로 저장된다.
- [ ] 저장 취소와 저장 실패가 성공 상태로 표시되지 않는다.
- [ ] 생성된 `.wav`를 다시 열었을 때 duration과 채널 수가 유지된다.
