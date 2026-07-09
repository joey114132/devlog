---
date: 2026-07-08
---

# fable-workflow SEO, clawde 마스코트, 로봇 GUI 대공사

하루 종일 여러 프로젝트를 동시에 달렸다. 세션이 세 개 이상 열렸고 그 중 로봇 세션이 제일 길었음.

---

## fable-workflow 검색 노출 작전

"fable workflow" 구글에 쳐서 내 리포가 나오게 하고 싶었다. Claude가 분석해보니 README는 이미 keyword 최적화가 잘 됐는데 GitHub Description이 없고 Topics도 없었던 게 문제였음.

`gh repo edit`으로 description 달고 topics 11개 세팅했다. `fable-workflow`, `claude-code`, `claude-code-skill`, `agentic-workflow`, `prompt-engineering`, `anthropic` 등.

소셜 프리뷰 이미지도 생성했다 — Chromium headless로 HTML 렌더링해서 2560×1280 PNG 뽑아 `~/fable-workflow-social-preview.png`에 저장. 앰버색 키워드 강조 + 우상단에 벤치마크 뱃지(+2→+18). 타그라인은 "Find the unknowns **before they find you.**"로 확정.

이어서 로컬 LLM으로 벤치마크도 돌렸다. Ollama에 qwen3.6 36B, qwen2.5 7b/3b, gemma3:4b, llama3가 올라와 있어서 n=3으로 태스크 돌리고 결과를 `benchmark/RESULTS.md`에 추가해 PR 올린 뒤 merge. CODE_OF_CONDUCT.md도 이 김에 만들어 push했음.

---

## Nate Herk "4 Upgrades Before You Build" 적용

X 아티클이 auth-wall이라 내용을 못 가져왔는데 웹 검색으로 내용 파악해서 핵심 두 가지를 글로벌 규칙으로 저장했다.

- `~/.claude/rules/verify-and-handoff.md` — "Done"의 기준: 파일 경로·실행 명령·증거·알려진 한계·다음 리뷰 포인트를 보고해야 "완료".
- `~/.claude/rules/stress-test-roast.md` — 빌드 전 5역할 로스트(반론자·구매자·시장조사자·퍼스트프린시플·판사) + 결정 양식.

다음 세션부터 적용된다고 함. 좋은 습관 강제기 생겼음.

---

## clawde — 터미널 떠돌이 마스코트

Claude 아이콘이 귀여우니까 터미널 안을 돌아다니게 만들고 싶다고 했다. 꽤 맹랑한 요청인데 만들어줬음.

`~/claude-mascot/clawde.py` 생성 — ANSI escape로 (◕ᴥ◕) 스프라이트를 터미널 경계 따라 돌아다니게 함. selftest도 통과. GitHub repo로 푸시하고 topics 달았다.

추가로:
- **GNOME Shell 확장** `~/claude-mascot/gnome-extension/clawde@joey114132.github.io/` — metadata.json + extension.js. Wayland라 `Alt+F2 r`로 hot-reload 안 됨, 로그아웃 필요.
- **VS Code 확장** `~/claude-mascot/vscode-extension/` — package.json + extension.js. 에디터 영역 위쪽 돌아다니는 개념.

실제로 터미널 margin 안에서 돌아다니는 데모는 아직 미완. 포털 텔레포트 애니메이션 요청했는데 거기까지는 못 갔음.

---

## 로봇 workspace 대공사 (xyz_deux_arm_dynamixel_lead)

이게 제일 길었다. 크게 두 파트.

### 플러그인/에이전트 세팅

전 세션 이월해서 superpowers 플러그인 설치 확인했다. `settings.json` 업데이트 후 재시작하니까 14개 스킬 전부 로드됨. 이어서:

- **0xfurai 서브에이전트 138개** → `~/.claude/vendor/claude-code-subagents`에 클론, `~/.claude/agents/0xfurai`로 심링크
- **horos 플러그인** — 한국 개발자가 만든 discipline harness. PreToolUse/Stop/SessionStart 훅으로 강제하는데, `.horos/` 마커 없는 프로젝트에서는 exit 0으로 무해함. `horos init xyz_deux_arm_dynamixel_lead` 실행해 적용
- **prompts.chat, impeccable** — 글로벌로 설치
- Karpathy 스타일 규칙 #5(한국어 colon 금지), #6(신규 소스파일 한 줄 헤더) → `working-style.md`, `code-quality.md`에 추가

### 텔레옵 GUI 포트 + feetech 호밍 오프셋 버그

`~/dynamixel_arm_ws/gui/` 에 있던 5파일짜리 GUI를 `xyz_deux_arm_dynamixel_lead/sim/teleop_gui.py` 단일 파일로 통합했다. 이전 버전은 `archive/teleop_gui_torque.py`로 보존.

feetech 리더 암이 이상하게 보이던 문제 — 실제 리더가 똑바로 내려가 있는데 시뮬은 접혀 있었음. 원인은 호밍 오프셋 디코딩 버그였다.

lerobot은 연결할 때 `Homing_Offset` EEPROM에 `pos_home - 2048`을 써서 하드웨어 레벨에서 centering이 된다. 그래서 `Present_Position` 읽으면 이미 home=2048 중심으로 들어옴. 근데 `sim/leaders.py`의 `FeetechLeader`는 raw scservo_sdk로 읽으면서 sign-magnitude 비트(Position 15번 비트, Homing_Offset 11번 비트)를 무시하고 있었음.

probe script 짜서 14개 서보 전체 확인 — `hw_home == json_home` 일치, `robust == lerobot` 정확히 같다는 걸 확인하고 `sim/leaders.py`의 FeetechLeader 디코딩 수정했다.

bringup+follow 버튼 추가했고, 새 터미널 창 뜨고 사라지는 문제(sudo PW 입력 타이밍)도 잡았다. ctrl+C로 bringup 중단 시 follow 암이 시작 포즈로 복귀하는 것도 추가 요청.

dynamixel 리더 암이 bringup 전에 들어올려져 있을 때 follow 암이 따라가지 못하는 문제 + feetech보다 dynamixel이 더 laggier한 문제는 계속 진행 중. 중력보상 로그에서 `grav=1.0 kp1=0.0 kd1=1.5`는 확인됐는데 tau_meas 전부 0.000이 이상해서 더 파봐야 함.
