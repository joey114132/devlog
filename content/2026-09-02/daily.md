---
date: 2026-09-02
---

# OAuth 세션 만료로 아무것도 못 한 날

아침에 Claude Code 켰더니 OAuth 세션이 만료돼서 바로 뻗었다. 08:53에 쇼츠 작업 세션, 09:01에 전날 devlog 쓰려는 세션 — 둘 다 "Failed to authenticate: OAuth session expired and could not be refreshed" 뜨고 즉시 종료. 실제로 뭔가 해 보기도 전에 끝났다.

당일 zsh 명령도 없고, git 커밋도 없다. Claude Code 작업 건수 0.

devlog-site 쪽에 `auto-devlog.sh`, `auto-devlog.README.md`, `devlog-dates.py`, `gather-conversations.py` 네 파일이 untracked으로 떠 있고, `gather-context.sh`랑 `secrets.py`도 수정된 상태. 아마 전날 만들어 두고 커밋을 못 한 것들 — 오늘 인증이 막혀서 그대로 방치됐다.

조용한 하루. 인증 문제 하나가 하루를 통째로 날린 경우.
