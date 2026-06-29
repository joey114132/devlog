---
date: 2026-06-29
---

# devlog 자동화 + dynamixel_arm_ws 리포 오픈

오늘 주목할 게 두 개다.

첫 번째는 devlog 자동화. "노트북 열 때마다 전날 devlog가 자동으로 써지면 좋겠다"는 요청 하나에서 시작해서 스크립트 네 개 + systemd 타이머까지 완성했음.

- `devlog-site/scripts/gather-conversations.py` — Claude Code `.jsonl` 트랜스크립트에서 내 요청·어시스턴트 요약·주요 액션을 뽑아 `_context.md`에 넣는 추출기. Cursor 트랜스크립트는 포맷이 복잡해서 건너뛰고 Claude Code `.jsonl`만 파싱하기로 결정.
- `gather-context.sh` 수정 — 기존 git/파일 수집에 위 추출기 연결.
- `devlog-dates.py` — 날짜 결정 로직. 마지막 작성일 이후 평일 최대 7개까지 백필.
- `auto-devlog.sh` — 오케스트레이터. `DEVLOG_NO_PUSH=1` 플래그 있으면 push 안 하고 로컬만 씀.

진짜 불확실했던 건 headless `claude -p`가 TTY 없이 툴을 실제로 쓸 수 있냐는 거. 스파이크 두 단계로 확인했음: 먼저 `SPIKE_OK` 응답만 확인 → 그 다음 `/tmp` 경로에 파일 실제 쓰기. 둘 다 통과. 이후 systemd user 타이머 (`auto-devlog.service`, `auto-devlog.timer`) 등록하고 daemon-reload. 오케스트레이터로 2026-06-26 devlog 백필도 성공 확인했음. `wiki/devlog/` 섹션이 오늘 처음 생겼음 — `README.md` + index.md 진입점 세팅.

---

두 번째는 `dynamixel_arm_ws`. GitHub 리포 오늘 처음 만들었음 — `joey114132/dynamixel_arm_ws` (private). 텔레옵 워크스페이스 69개 파일로 초기 커밋, `teleop-wiki/`랑 `MUJOCO_LOG.TXT`는 gitignore 처리. README 한국어 번역 + `requirements.txt` 추가했음 (실제 import 뒤져서 확인한 conda 툴 의존성: mujoco, numpy, PyQt6, dynamixel_sdk, PyYAML).

리더암 소프트 리밋 전류 테이퍼도 오늘 넣었음. `leader_protect.py`에 조인트별 홀드 매니저 수학 짜고, `test_soft_limit.py`로 8개 케이스 전부 통과. `leader_node.py`에서 전역 불리언 anti-droop을 unified hold manager로 교체, `follow.launch.py`랑 `limits.yaml`도 같이 수정. 컴파일 OK, colcon test까지 돌렸음.

Atlassian 로그인 (`jwlee8403@pinklab.art`) 오늘 처음 연결. 아침에 `sudo apt update && sudo apt upgrade -y` 한 번 돌리고 시작.
