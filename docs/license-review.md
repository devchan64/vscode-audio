# MP3 인코더와 프로젝트 라이선스 검토

검토일: 2026-11-12. 이 문서는 배포 준비를 위한 기술 검토이며 법률 자문이나 배포 적합성의 확정이 아니다.

## 인코더

- 확장은 `@breezystack/lamejs` 1.2.7을 고정해 MP3를 인코딩한다. [해당 버전의 패키지 메타데이터](https://raw.githubusercontent.com/shijinyu/lamejs/1fb0ef5fa177413107e2e107d054a9b994e3f79c/package.json)는 `LGPL-3.0`을 선언한다. [원본 LAME](https://lame.sourceforge.io/)도 LGPL을 안내한다. 무료로 사용할 수 있다는 사실만으로 배포 조건이 없어지는 것은 아니다.
- 위 버전의 [업스트림 LICENSE](https://raw.githubusercontent.com/shijinyu/lamejs/1fb0ef5fa177413107e2e107d054a9b994e3f79c/LICENSE)는 LGPL을 설명하는 짧은 안내문이다. 패키지 선언과 원본 고지의 적용 범위 및 정확한 권리자 고지는 배포 전 재확인한다.
- 확장은 인코더를 수정하지 않고 독립된 npm 패키지로 포함해 런타임에 불러온다. VSIX에 패키지의 원본 LICENSE, [서드파티 고지](../THIRD_PARTY_NOTICES.md), LGPL 3.0과 GPL 3.0 원문을 포함한다.

### 배포 조건과 확인할 사항

[LGPL 3.0 제4조](https://www.gnu.org/licenses/lgpl-3.0.html)와 [GPL 3.0 제6조](https://www.gnu.org/licenses/gpl-3.0.html)에 따라 배포 방식에 맞는 조건을 확인한다. 실제 조합물에 해당하는지와 충족 방식은 배포 형태를 기준으로 판단한다.

1. 각 배포본에서 라이브러리 사용과 라이선스를 명시하고, LGPL과 GPL 원문을 제공한다. 실행 중 저작권 고지를 표시하는 경우 제4조의 추가 고지 조건도 확인한다.
2. 수령자가 라이브러리를 수정하고 그 수정을 디버깅하기 위해 필요한 역분석을 할 수 있도록 확장에 적용되는 조건을 정한다. 프로젝트 라이선스나 별도 약관에서 이를 금지하지 않아야 한다.
3. 제4조가 적용되는 경우 대응 소스와 애플리케이션 코드를 제공해 재결합하도록 하는 방식 또는 적절한 공유 라이브러리 방식 중 해당 조건을 충족한다. 별도 디렉터리에 파일이 있다는 사실만으로 실제 교체 가능성을 입증하지 않는다. 해당하는 경우 설치 정보 제공 조건도 확인한다.
4. 배포하는 인코더에 대응하는 완전한 소스와 필요한 빌드·설치 제어 스크립트를 적절한 방법으로 제공한다. [패키지의 gitHead 소스](https://github.com/shijinyu/lamejs/tree/1fb0ef5fa177413107e2e107d054a9b994e3f79c)를 고지했으나, 이 소스가 배포 파일에 정확히 대응하고 충분한지와 장기적인 제공 방식은 아직 검증하지 않았다. [GNU FAQ](https://www.gnu.org/licenses/gpl-faq.en.html)도 라이브러리를 애플리케이션과 함께 배포할 때 소스 제공을 설명한다.

Marketplace 게시 전 남은 검증:

- 고정된 gitHead에서 배포된 `dist`를 재현할 수 있는지, 필요한 소스·도구 및 저작권 고지가 빠지지 않았는지 확인하고 지속 가능한 소스 제공 방법을 정한다.
- 설치된 VSIX의 `node_modules/@breezystack/lamejs`를 호환되는 수정 버전으로 교체하고 확장을 다시 불러와 MP3 인코딩이 실제 동작하는지 검증한다. 자동 업데이트나 배포 환경의 제약도 확인한다.
- 라이브러리 자체를 변경하면 변경분을 포함한 소스와 해당 고지를 관련 조건에 맞춰 제공한다.

## 프로젝트 자체 라이선스

저장소에는 프로젝트 자체를 위한 루트 `LICENSE`가 없고 `package.json`에도 `license` 필드가 없다. `LICENSES/`의 파일은 서드파티 인코더의 라이선스 원문이며 프로젝트 전체에 대한 라이선스 선언이 아니다. 공개 저장소라는 사실만으로 별도의 오픈소스 라이선스가 부여되는 것은 아니다. [GitHub 라이선스 안내](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)를 참고한다.

권리자가 사용 및 재배포 범위를 결정해야 한다. 폭넓은 재사용을 원하면 MIT를, 명시적인 특허 허락 조항이 필요하면 Apache-2.0을 후보로 검토할 수 있다. 어느 쪽이든 LGPL 인코더에는 그 라이선스가 별도로 적용된다. 결정을 임의로 대신하지 않으며, 결정 후 프로젝트 권리자와 기여물 권한을 확인하고 루트 `LICENSE`, `package.json`의 SPDX 식별자, README를 일치시킨다. 패키지에 포함되는 화면 이미지 등 별도 자산의 사용 권한도 확인한다.
