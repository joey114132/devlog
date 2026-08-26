---
date: 2026-08-25
---

# alwaysrec overlay 9일째 죽어 있었음

오늘 제일 황당했던 거. `always-on-recorder` 세션 열고 "왜 llm-wiki에 폰 요약이 안 들어오지?" 하고 보니까 overlay가 **2026-08-16 이후로 완전히 죽어** 있었다. `ss -ltnp | grep 8777` 아무것도 없고, `~/.alwaysrec/summaries.jsonl` 마지막 줄도 08-16 테스트 1건뿐. `~/vaults/llm-wiki/raw/sources/alwaysrec-digest-*.md`는 0건.

원인은 단순했다. `alwaysrec_overlay.py`를 터미널에서 그냥 실행해뒀는데, 터미널 닫으면 같이 죽는 구조. 9일치 폰 다이제스트가 그냥 허공으로 날아간 것.

systemd unit 하나 만들어서 해결했다. `~/.config/systemd/user/alwaysrec-overlay.service` 신규로 만들고 `Restart=always` 걸고 `systemctl --user enable --now` 한 번. 그 다음에 `test_overlay.py` 4개 돌려서 수신→vault 저장 경로까지 전부 통과 확인했다. 실제 repo에는 아무것도 push 안 했고 임시 vault로만 테스트.

이제 폰이 밀면 자동으로 받아서 저장된다. 근데 날아간 9일치는 그냥 없는 거다.

---

devlog-site 쪽도 정리했다. `gather-conversations.py`, `auto-devlog.sh`, `devlog-dates.py` 세 파일을 새로 추가하고 `gather-context.sh`랑 `secrets.py`도 손봤다. 자동화 파이프라인을 좀 더 견고하게 만드는 중. 빌드 갱신 커밋 하나(`5ebdfc5`).

밀린 devlog도 두 개 썼다 — 08-21(금), 08-24(월). 어제는 Claude Code 대화도 없고 커밋도 없는 날이라 3줄로 끝냈다.

daily-vision-lab은 `pause-stamp` 새 날 폴더가 생겼다(`days/2026-06-13-pause-stamp/`). `generators/pause-stamp/`도 새로 추가됨.
