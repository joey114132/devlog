---
date: 2026-08-27
---

# 뉴욕 횡단보도 버튼 대본, devlog-site 자동화 스크립트 추가

오늘 가장 긴 시간을 쓴 건 shorts 대본. 소재는 뉴욕 횡단보도 버튼 — 버튼 4개 중 3개가 실제로 아무 데도 연결이 안 돼 있는데, 시가 안 떼는 이유가 하나 떼는 데 수십만 원이라 전부 뜯으면 10억이 넘어간다는 내용이다. 최근 3편이 건물(에스컬레이터)·욕실(치약)·주방(케첩)이라 이동 계열을 골랐다.

`FORMAT.md` 읽고 소재 검증 통과한 뒤 `scripts/2026-08-27-crosswalk-button-caps.json`, `crosswalk-button-prompts.json` 생성. `python3 layout/script_check.py`와 `prompt_check.py` 돌렸을 때 속도 경고가 하나 났는데, 61.8초짜리 외부 영상을 기준 클립으로 물려서 생긴 것이었다. 역산해서 24초 기준으로 컷별 글자수 계산하니 전부 범위 안이었다. `layout/captions.py`도 돌려서 `scripts/2026-08-27-crosswalk-button.json` 최종 생성, `TOPICS.md` 소재 사용 처리. 대본 검수 스킬까지 돌리고 4-A 정지점에서 멈췄다. 클립은 생성하지 않았다.

devlog-site 쪽에서 자동화 스크립트 네 개가 추가됐다 — `auto-devlog.sh`, `gather-conversations.py`, `devlog-dates.py`, `auto-devlog.README.md`. `gather-context.sh`랑 `secrets.py`도 수정됨. `288b372 devlog 빌드 갱신 (2026-08-27)` 커밋이 하나 들어가 있고, feed.xml도 바뀐 상태라 아직 push는 안 된 것들이 쌓여 있다.

저녁 6시쪽에 하루 digest 정리 — `/home/joey/.claude/digest/.cron/2026-08-27.raw.md`를 읽어 `/home/joey/devlog/digest/2026-08-27.md`로 뽑았다. 원자료가 요청 4건(shorts 소재→대본→검수, devlog 작성)뿐이라 짧게 끝났다.
