---
date: 2026-08-12
---

# llm-wiki에 _claude 영역 심고, devlog 파이프라인 살려냄

오전엔 Dynamixel 리더암 메뉴얼 손봤다. 구성품 표에 리더암·서보 두 행이 따로 있던 걸 feetech 판처럼 한 행(`리더암 | 1대 | Dynamixel XL330-M288 (5.0V)`)으로 합쳤고, `korean-manual` 스킬 `check.py` 돌려서 전수 검사도 했다. 수량 단위 `1장` → `1개` 수정, 그리고 코드베이스 곳곳에 남아있던 `리드암`을 `리더암`으로 111곳 전부 바꿨다 — `tools/build_lecture_deck.py` 79건, `tools/sync_lecture_repo.py` 7건 포함. 슬라이드 6벌 + 메뉴얼 2벌 재생성 완료.

오후는 Feetech랑 LeRobot 쪽. Dynamixel/Feetech 메뉴얼이 같은 소스에서 나오다 보니 한쪽 수정이 다른 쪽을 덮어쓰는 복붕 문제가 있었다. 소스를 분리했다: `wiki/lerobot-record-dynamixel.md`는 Dynamixel 전용, `wiki/manual-feetech.md`는 Feetech 전용. LeRobot `lerobot-record` 첫 촬영 시도도 했는데 오류 4개를 순서대로 잡았다 — 환경변수 미설정(`HF_LEROBOT_HOME`, CAN 포트), 카메라 fps 불일치(top 30fps vs wrist 25fps), 카메라 이름과 실제 배정이 역전(`USB Camera` = 내장, `Intel` = 손목), 폴더 경로 오류. Dynamixel_OpenArm_V1 저장소도 정리했다 — 커밋 5개를 커밋 1개(`82df009`)로 통합하고 force push, 예전 히스토리는 `backup-old-history` 브랜치로 남겼다.

저녁에 llm-wiki Obsidian vault에 `_claude/` 영역을 만들었다. Claude Code 세션 876개를 파싱해서 실제 사용자 대화는 59건이었다 — 339건은 compaction 요약, 477건은 subagent 사이드카라 걸러냄. `_claude/sync-sessions.py` 작성, `_claude/Sessions.base` (Obsidian Bases 뷰 4개), 월별 목차 생성까지.

작업하다가 devlog 자동화 파이프라인이 2026-07-08 이후로 완전히 멈춰있었다는 걸 발견했다. 근본 원인은 `deux_il` 저장소가 커밋이 하나도 없어서 `git log`가 exit code 128로 죽고, `gather-context.sh`에 `set -e`+`pipefail` 조합이 있어서 스크립트 전체가 종료되는 거였다. `gather_git_repos` 안 git 호출 3곳을 수정하고 rc=0 확인, context 103KB/141KB 정상 생성 검증했다.

Obsidian 실렌더는 헤드리스 환경(`DISPLAY=:1`)에서 xdotool + ffmpeg으로 스크린샷 떠서 확인했다. Bases 뷰 59 results + 월별 목차까지는 정상 확인. lint orphan 0, frontmatter 83/83 파싱, secrets 이상 없음.
