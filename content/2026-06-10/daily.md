---
date: 2026-06-10
---

# 오늘은 devlog만 돌림

Cursor에서 `/devlog` 치고 오늘 날짜 다이어리 쓰라고 해서 지금 이 파일 만드는 중. 이 세션에서는 딱 이거만 했음.

git 돌려봤는데 portfolio랑 devlog-site 쪽은 오늘 커밋 없음. devlog-site는 어제 손댄 `edit.html`이랑 CSS/JS가 아직 unstaged로 남아 있고, portfolio는 `.cursor/agents/`랑 `task-completion.mdc`가 untracked.

파일 mtime 보면 오늘 실제로 건드린 건 `physical-ai-bootcamp-intro/self-intro-web`의 `index.html`, `main.js`, `style.css` 정도. 뭐 바꿨는지 diff는 안 봤음.

어제 devlog-site 에디터 서버는 터미널에 아직 떠 있는 것 같긴 한데 오늘은 안 건드림. 저장 끝나면 `sync-github.sh`로 GitHub Pages에 올릴 예정.

---

# 다시 적어봄 — 오늘 실제로 한 일

위에 쓴 건 Cursor `/devlog` 돌릴 때 대충 짚은 거라, git이랑 diff 다시 보고 고침.

오전~낮엔 `physical-ai-bootcamp-intro/self-intro-web` 쪽을 꽤 오래 만졌음. 5분 자기소개 웹 슬라이드 deck인데, 오늘만 커밋이 다섯 개. 게임 갤러리 썸네일이 `object-fit: cover` 때문에 위아래 잘리던 거 `contain`으로 바꾸고, 스토리 슬라이드·프로젝트 슬라이드 세로 채움도 손봤음. `main.js`에 뷰포트 크롬/탑바 실측해서 CSS 변수 맞추는 `syncViewportInsets` 넣었고, `verify-slides.cjs`도 추가해 둠.

지금은 `index.html`이랑 `style.css`가 아직 unstaged. 졸업증명서를 스토리 블록에서 빼서 게임 그리드 2행 레이아웃(위 3게임, 아래 cert+게임 3개)으로 재배치하는 중. `main.js`는 마지막 커밋 기준으로 깨끗함.

`portfolio`는 오늘 커밋 없고, `.cursor/agents/`랑 `task-completion.mdc`만 untracked. `devlog-site`도 코드 커밋은 없고 `edit.html`/CSS/JS는 어제(6/9) 수정분이 unstaged로 남아 있음. 오늘 devlog-site에 올라간 건 `sync-github.sh`로 밀린 `e4ad017` (오늘 다이어리 첫 버전)뿐.

저녁엔 Cursor에서 `/devlog` 두 번 치고, 첫 기록이 부정확하다고 해서 지금 이 append 쓰는 중. devlog-site `editor-server.py`는 어제부터 터미널에 계속 떠 있음 — 오늘은 안 건드렸음.

---

# 브라우저 저장 막힘 → 스크립트로 밀기

devlog-site 에디터에서 저장 눌렀는데 버튼이 비활성이라 막혔음. GitHub Pages에서 PAT 없이 열었고, 로컬 `8781` 저장 API도 지금은 안 떠 있음 (`serve-dev.sh` 안 켠 상태). 그래서 Cursor에서 `~/devlogs/2026-06-10/daily.md` 확인하고 `sync-github.sh`로 GitHub에 올림.

브라우저에만 있고 아직 안 쓴 초안은 localStorage에 안 남기는 구조라, 에디터에 타이핑만 해둔 게 있으면 그건 못 가져옴 — md 다운로드나 PAT 연결 후 다시 저장해야 함.

---

# 저녁 이후 — PAT 빼고 에디터 다시 짜는 중

오늘 devlog-site 쪽에서 제일 큰 변화는 GitHub PAT 저장 플로우를 걷어낸 거임. `edit.html`에 있던 `github-auth` 섹션(토큰 입력·연결 버튼)이랑 `js/github-save.js` 스크립트 태그가 working tree에서 빠졌고, `js/github-save.js` 파일 자체는 삭제 상태로 남아 있음. 아직 커밋은 안 했고 unstaged.

대신 footer 문구가 “라이브: GitHub 토큰 연결 후 저장”에서 “라이브: 이 브라우저에 임시 저장”으로 바뀌었고, `editor.js`는 로컬 `8781` API가 없으면 localStorage 초안(`draft`) 모드로 떨어지게 손봤음. `features.js`도 같이 수정됐는데 아직 push 전.

Pages에서 PAT 없이 열었을 때 저장 버튼이 비활성이라 막혔던 건 위 내용이랑 맞음. 당시엔 `serve-dev.sh`도 안 떠 있어서 로컬 API 경로도 없었고, 결국 Cursor에서 `~/devlogs` md 확인하고 `sync-github.sh`로 밀었음. 오늘 devlog-site에 실제로 올라간 커밋은 sync 세 번(`e4ad017`, `c6e88c5`, `79db4df`)뿐이고, 에디터 코드 변경은 워킹트리에만 있음.

`physical-ai-bootcamp-intro/self-intro-web`은 오전~낮에 커밋 다섯 개(썸네일 contain, 슬라이드 레이아웃, viewport inset 등). 지금은 `index.html`·`style.css`가 unstaged — 졸업증명서를 스토리에서 빼고 게임 그리드를 2행(위 3게임, 아래 cert+게임 3개)으로 재배치하는 중. `8791`에서 `python3 -m http.server`로 미리보기 띄워 둔 터미널도 있음.

`portfolio`는 오늘 커밋 없음. `js/config.js` hero 카피 한 줄이랑 `i18n.js`·`app.js`가 unstaged로 남아 있고, `.cursor/agents/`랑 `presentation/` 폴더가 untracked.

터미널 로그 보면 devlog-site `8780` static serve랑 `serve-dev.sh`(8781)도 여러 세션에서 돌았고, portfolio `8766` serve, daily-vision-lab `2026-06-10-margin-notes` dev 서버(`5174`)도 있음. Terminator로 portfolio 테스트 띄운 명령은 터미널에만 보이고 GUI 상태는 여기서는 못 봤음.

`~/.zsh_history`는 EXTENDED_HISTORY 타임스탬프가 없어서 오늘 필터는 못 함. `gather-context.sh`는 아직 없어서 스크립트는 안 만들고, 다음에 필요하면 터미널 메타·git log·find mtime 묶는 짧은 셸 스크립트로 가면 될 듯.
