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
