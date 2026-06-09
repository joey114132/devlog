---
date: 2026-06-08
project: cursor-harness
---

# Cursor에 devlog 스킬 붙인 날

오늘은 harness 쪽 정리 요청이었음. 어떤 스킬/훅이 쓸만한지 추천해 달라고 하고, refactor 관련 스킬 있는지 찾아달라고 했고, Prismic이나 md로 **한국어 개발일지** 남기는 스킬도 만들어 달라고 함.

`~/.cursor/hooks.json` 보니까 RTK, skill activation, verify nudge 이미 돌아가고 있었고 `skill-rules.json`은 트리거가 몇 개뿐이더라. refactor는 `code-refactoring`, `improve-codebase-architecture` skill이랑 `refactor-scout` subagent 쓰면 될 듯.

그래서 devlog 라우터(`devlog-ko`)랑 md용(`devlog-ko-markdown`), Prismic용(`devlog-ko-prismic`) 만들고 `skill-rules.json`에 키워드 트리거 넣음. 저장은 `~/devlogs/날짜/slug.md`로 정함.

grep이랑 json 파싱으로 스킬 파일 있는지 확인했음. Prismic에 devlog 문서 타입은 아직 없어서 publish는 안 함. deploy도 해당 없음.

나중에 Prismic 커스텀 타입 API ID 알면 prismic 스킬 필드 매핑만 채우면 될 것 같음.
