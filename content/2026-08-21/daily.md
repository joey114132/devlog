---
date: 2026-08-21
---

# alwaysrec digest → llm-wiki 파이프라인 완성 + 광주 출발일

오늘은 18:31 용산 출발 KTX 타는 날이라 낮에 빠르게 마쳐야 했다.

가장 큰 덩어리는 **always-on-recorder** 파이프라인. 폰에서 DigestWorker가 매일 21시에 만드는 다이제스트를 노트북 llm-wiki에 자동으로 올리는 흐름을 만들었다. 구조는 이렇다: DigestWorker.kt가 digest 생성 → SyncClient가 노트북 overlay에 밀어줌 → `alwaysrec_overlay.py`가 `status=digest` 패킷 받아서 `~/vaults/llm-wiki/raw/sources/alwaysrec-digest-YYYY-MM-DD.md`에 저장, `auto-commit.sh`로 push. TDD로 짰다 — SyncClient에 status 필드 추가해서 테스트 2건 red 확인 후 green. overlay는 `test_overlay.py` 유닛테스트 추가하고 /tmp 임시 vault로 E2E 세 번 검증했음.

parallel-code-review 4축 다 돌렸다. 실결함 하나 나왔고 — DigestWorker에 중복 helper 남아 있어서 SyncClient companion으로 통합. AndroidManifest에 cleartext 허용(`android:usesCleartextTraffic`)이 있어서 네트워크 보안 설정으로 대체. DigestWorker는 IO dispatcher로 이동. 다 정리하고 APK 빌드 → `alwaysrec-20260821.apk`, Desktop에 복사해 뒀음. overlay도 재기동 확인. llm-wiki에 `wiki/concepts/alwaysrec-digest-pipeline.md` 추가하고 commit+push까지.

**DEUX policy** — 어제 밀어 두었던 7 커밋 push 완료 (`58ac945..445c54f`, `deux_policy` private 유지 확인). 오늘 추가로 τ sweep (음성 결과 — 표본 분산이 병목 아님, τ 기본 1.0 유지), state-anchored flow v4, 관측 잡음 주입 v5, `benchmarks/closed_loop.py` 신규 작성. 71 tests passed. 그런데 체인 A/B가 exit 2로 죽었다 — `run_one.sh` unknown-policy 또는 argparse 문제로 추정, main 인스턴스 파편일 가능성 높음. 원인 확정은 못 했음.

Shorts는 치약 끝 색깔 네모 편 대본 완성. Snopes, Gulf News 원문 확인해서 사실 근거 잡고 `scripts/2026-08-21-toothpaste-square.json` 저장. 클립은 승인 전이라 생성 안 함.

KTX는 전날 잡은 표 두 장 — 8/21(금) 용산→광주송정 18:31→20:29, 8/24(월) 광주송정→용산 05:37→07:42. 감시 프로세스랑 cron 정리 완료.

Claude Desktop apt 패키지 설치 (`claude-desktop`) 도 오늘 했음.
