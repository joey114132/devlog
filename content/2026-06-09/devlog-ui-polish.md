---
date: 2026-06-09
project: agent-harness
tags: devlog, ui
---

## Daily Scrum

### 어제 한 일
- devlog-site Playwright로 UI 깨짐 확인 — sticky 헤더, 제목 중복, 빈 스크럼 패널, 설정 버튼 대비 수정
- `← 목록`을 sticky 헤더로 옮기고 GitHub Pages 저장( PAT ) 플로우 정리
- index 레이아웃·에디터 모바일 스크럼 순서 손봄

### 오늘 할 일
- 상단 스크롤 progress bar + Inter/Source Serif 폰트 + 코드 하이라이트 대비 마무리
- 변경분 commit/push해서 live 반영
- 아래 스크럼·본문은 **글쓰기 → 수정**에서 마음대로 고치기 (에디터 Scrum 필드)

### 공유할 거
- https://joey114132.github.io/devlog/ — 로컬 `http://127.0.0.1:8780` 과 동일 UI
- Prismic CDN은 pingdergarten `.env` 준비되면 이미지 업로드 가능

---

# devlog UI 다듬는 중

브라우저로 직접 열어보니 레이아웃이 꽤 이상했음. 헤더가 스크롤하면 사라지고 back 링크만 둥둥 떠다니는 느낌, 제목이 두 번 나오고, 빈 스크럼 칸이 옆에 붙어 있고.

그래서 CSS `position: relative`가 sticky 헤더를 망가뜨리던 거 고치고, 목록 링크는 헤더에 고정. progress bar는 페이지 맨 위에 항상 보이게, 폰트는 Inter + Source Serif 4로 바꿈. 인라인 코드·태그 pill 색도 테마마다 대비 맞춤.

스크럼은 에이전트가 위에 Daily Scrum 블록으로 초안 써 둠. **수정** 버튼이나 `edit.html?id=2026-06-09/devlog-ui-polish` 로 들어가서 어제/오늘/공유 필드 편집하면 됨 — 저장하면 md + `posts.json` 갱신 플로우 그대로.
