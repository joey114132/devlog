---
date: 2026-06-09
---

# /devlog 슬래시 명령 붙임

오늘은 `/devlog` 치면 **오늘 날짜** 폴더에 다이어리 쓰게 하고 싶다고 해서 명령 파일 만들었음. `~/.cursor/commands/devlog.md` — Cursor가 `/devlog` 로 불러옴.

규칙은 간단함. 날짜는 `date +%Y-%m-%d` 로 오늘만, 경로는 `~/devlogs/오늘/daily.md`. 파일 있으면 덮어쓰지 말고 `---` 밑에 이어 쓰기. 톤은 전에 바꾼 dev diary 그대로 (보고서 형식 X).

`devlog-ko-markdown`이랑 `devlog-ko` 스킬에도 `/devlog` 섹션 넣었고, `skill-rules.json`에 `/devlog` 키워드 추가함.

이 파일이 `/devlog` 기본 타깃의 첫 샘플.

---

# MCP 네 개 붙이고 하네스 점검함

오늘 Cursor 하네스에 MCP를 더 달았음. `mcp.json`에 brave-search, puppeteer, sequential-thinking, filesystem 넣었고, `mcp-auto-use.mdc` 룰로 에이전트가 알아서 쓰게 해둠. Brave는 `run-brave-search-mcp.sh` 래퍼 만들었는데 `.zshrc` source 할 때 `set -u` 때문에 한번 터져서 `set +u`/`set -u` 감쌌음.

스모크는 sequential-thinking이랑 filesystem, puppeteer는 통과했고, brave는 API 키 없어서 에러 메시지만 확인함. `cli-config.json`에 `Mcp(**)` 넣었는데 Cursor가 한번 되돌려서 다시 넣음.

그다음 하네스가 “자동으로” 쓰이는지 감사해봤음. RTK랑 sessionStart, stop verify nudge 같은 훅은 진짜 자동인데, superpowers 프로세스 스킬이랑 MCP 호출은 룰만 있고 강제는 아님. `skill-rules.json`에는 devlog랑 리팩터 쪽 몇 개만 훅에 걸려 있고 brainstorming/debugging 같은 건 없음.

Brave 무료 티어 기대가 틀렸다고 해서 Serper/Tavily/Exa 비교해봤음. Serper는 2500 쿼리 일회성, Tavily는 월 1000 크레딧이 나을 것 같아서 Tavily 추천만 했고 아직 `mcp.json` 스왑은 안 함. `BRAVE_API_KEY`도 아직 없음.

커스텀 스킬/훅 뭐가 유용할지도 정리해달라고 해서 portfolio-ship, git safety hook, eduping-robotics 같은 후보 리스트 냈음. 구현은 아직 안 함.

devlog 스킬은 `devlog-ko-markdown` / `devlog-ko-prismic` / `devlog-ko` 만들어 두고 톤을 보고서 말고 다이어리로 바꿨음. 지금 이 `/devlog`가 append 동작 테스트하는 중.

---

# devlog 사이트 만들고 GitHub에 올림

devlog를 HTML/CSS로 보고 싶다고 해서 `~/devlog-site` 만들었음. `index.html`/`post.html`, 다이어리 느낌 CSS, `build.py`로 `~/devlogs` 읽어서 `data/posts.json` 만듦. repo `joey114132/devlog` 만들고 push했고 Pages 켜서 https://joey114132.github.io/devlog/ 에 뜨게 함.

`/devlog` 칠 때 GitHub에도 반영해 달라고 해서 `sync-github.sh` 붙였음. 이제 md 저장 → 빌드 → 바뀌었으면 commit/push까지가 기본 플로우.
