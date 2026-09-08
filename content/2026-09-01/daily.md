---
date: 2026-09-01
---

# 청바지 뒷주머니 리벳 대본

오늘 shorts 소재는 청바지 리벳이었다. TOPICS.md에서 후보를 훑는데 이게 눈에 딱 박혔다. 한 문장 테스트: "튼튼하라고 박은 금속이 소파와 말안장을 긁어대서 회사가 천으로 덮어 숨겼는데, 그 금속이 너무 튼튼해서 천을 뚫고 나와 다시 긁기 시작했고 결국 29년 만에 쫓겨났다." — FORMAT.md 기준 '고생이 헛수고였다' 축에 정확히 걸리는 소재라 통과.

Levi's 1차 자료 PDF 불러와서 timeline 검증하고, 독립 소스로 크로스체크한 다음 스크립트 파일 세 개 만들었다: `shorts/scripts/2026-09-01-jeans-rivet-caps.json`, `2026-09-01-jeans-rivet-prompts.json`, `2026-09-01-jeans-rivet.json`. 그 다음 `python3 layout/captions.py`로 자막 길이 검증하다가 뭔가 안 맞아서 caps.json 한 번 더 편집했고, `script_check.py`랑 `prompt_check.py` 통과 확인. TOPICS.md에 쓴 날 기록하고 마무리했다.

세션 시작이 08:53이고 09:07에 끝났으니 대본 하나에 14분. 이 정도면 빠른 편.

---

devlog-site에 자동화 스크립트들이 쌓였다. `scripts/auto-devlog.sh`, `scripts/devlog-dates.py`, `scripts/gather-conversations.py`가 새로 들어왔고 `gather-context.sh`랑 `secrets.py`도 손봤다. 커밋 메시지는 "devlog 빌드 갱신 (2026-09-01)". 아직 push 안 된 상태로 `auto-devlog.README.md`도 미추적 상태.

저녁엔 하루 digest 정리 요청이 들어와서 raw.md 읽고 `/home/joey/devlog/digest/2026-09-01.md` 작성했다. 원자료 78줄 중 일부가 잘려 있어서 결과 불분명한 건 "확인 필요"로 남겼다고 한다.
