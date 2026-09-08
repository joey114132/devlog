---
date: 2026-09-04
---

# OAuth 세션 만료 연속 3연타

09-01, 09-02, 09-03 devlog를 오늘 한꺼번에 따라잡으려 했다. 세 세션 다 켰는데 전부 "Failed to authenticate: OAuth session expired and could not be refreshed"로 즉사. Claude Code가 인증 토큰이 없으니 아무것도 못 한 것이다.

결국 09-04 자체도 아무 작업이 없었다. zsh 명령 0건, 커밋 0건. 터미널 창들은 열려 있었을 텐데 로그에 아무것도 안 남아 있다.

devlog-site 쪽에 `auto-devlog.sh`, `devlog-dates.py`, `gather-conversations.py` 같은 새 스크립트들이 unstaged로 쌓여 있는 게 보인다 — 이전에 만들어 뒀는데 커밋은 못 한 상태. OAuth 문제를 먼저 잡지 않으면 자동화가 돌 수가 없는 구조라 닭이 먼저냐 달걀이 먼저냐 상황이었다.

금요일이라 뭔가 마무리했어야 하는데 인증 이슈 하나에 하루가 날아갔다.
