# 레포지터리 구조

## 현재 MVP

```text
.
├── AGENTS.md
├── README.md
├── package.json
├── extension.js
├── docs/
│   ├── design.md
│   └── repository-structure.md
└── .github/
    ├── agents/
    │   └── audio-editor.agent.md
    └── instructions/
        └── docs.instructions.md
```

## 목표 구조

```text
src/
├── extension.ts
├── audio/
│   ├── audioBufferModel.ts
│   ├── audioOperations.ts
│   ├── wavEncoder.ts
│   └── audioTypes.ts
├── webview/
│   ├── audioEditorView.ts
│   ├── waveformRenderer.ts
│   ├── playbackController.ts
│   └── components/
├── shared/
│   └── messages.ts
└── infrastructure/
    └── fileStore.ts
test/
├── unit/
├── ui/
└── fixtures/
docs/
├── design.md
├── feature-scenarios.md
├── component-guide.md
└── tc-checklist.md
```

분리는 기능이 실제로 커질 때 진행한다. 현재 단일 파일 MVP를 한 번에 전면 재작성하지 않고, 테스트 가능한 경계부터 옮긴다.
