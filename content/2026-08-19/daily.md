---
date: 2026-08-19
---

# DEUX 리더 팔 검증 + Claude 이사 스크립트

오늘 가장 오래 걸린 건 DEUX 텔레옵 준비였다. `~/Downloads/XYZ_DEUX_BODY_v1.0_260731.xlsx`랑 `XYZ_DEUX_HAND_v1.0_260709.xlsx`를 읽어서 feetech leader arm으로 Damiao CAN-FD 팔을 돌릴 수 있는지 봤다. 결론은 됨 — 단 DEUX 쪽 controller 이름이 달라서 명령 받을 놈이 없었고, joint 제한 범위도 달라서 그냥 붙이면 충돌 날 뻔했다.

직접 연결해서 확인했다. bridge + leader만 올리고, DEUX는 아무것도 건드리지 않은 상태에서 손으로 팔을 움직였다. 오른팔 joint_2를 5.27도, 왼팔 joint_2를 6.29도 움직이니까 둘 다 잡혔다. 49.97Hz, 정지 jitter 0.0000도 — One-Euro filter + deadband이 완전히 잡고 있었다.

이후 `deux_leader_bridge` 패키지 안에 mapping 모듈을 TDD로 만들었다. 테스트 먼저(Red), 구현(Green), 11 passed. DEUX에 필요한 건 sign·offset·clamp·slew 넷뿐이라 600줄짜리 `leader_follower_bridge.py`를 통째로 fork하지 않고 필요한 것만 뽑았다.

`wono_total` 브랜치 문제도 나왔다. VS Code에서 폴더 구조가 달라 보인다고 했는데, local `wono_total`이 `main`이랑 같은 commit(`0162a52`)을 가리키고 있어서였다. 진짜 `origin/wono_total`은 `1c8f6bd`에 따로 있었음. merge 없이 기존 브랜치 rename 후 재생성하면 됨.

오후에는 Claude 설정 이사 스크립트를 만들었다. `~/claude-export.sh`랑 `~/claude-import.sh` 두 개. 근데 첫 tarball(14:21 생성, 342M)이 버그 버전이었다 — `~/.cursor/vendor/`를 빠뜨려서 `~/.agents/skills/` 아래 superpowers 42개 symlink가 전부 깨지는 구조. `node_modules` 빼면 71M이라 포함시키고 다시 뽑았다. 최종은 397M, 27,022 엔트리, symlink 814개, `gzip -t` 무결성 통과. 버그 버전은 `~/claude-migrate-20260819.tar.gz.OLD-BROKEN`으로 옆에 치워뒀다.

import script는 bash로 다시 썼다. `set -e` 상태에서 `A || B && C` 조합이 전부 false일 때 스크립트를 그냥 죽이는 지뢰가 있어서 루프로 교체했다. fake HOME(`/tmp/.../fakehome`)에 실제 복원을 돌려서 경로 재작성 로직까지 검증했다.

alwaysrec 쪽은 Groq rate limit 문제였다. ASPD(일일 오디오 초 한도) 28800초 중 26389초를 써버린 상태라 1시간짜리 세그먼트 7개가 전부 대기 중이었다. 모델을 `whisper-large-v3-turbo`로 바꾸고(DataStore protobuf 직접 편집), `GroqClient.kt`의 error message truncation을 200→600자로 늘렸다. Gemini API fallback도 추가 — 429일 때만 넘기고 5xx는 건드리지 않는 설계.

오늘 SSH key도 하나 새로 뽑았다. XYZ-joey용 ed25519 — `~/.ssh/id_ed25519_XYZ-joey`. GitHub 등록 후 `git clone git@github.com:XYZ-WONO/DEUX.git`까지 확인했다.
