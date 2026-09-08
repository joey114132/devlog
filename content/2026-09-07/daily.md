---
date: 2026-09-07
---

# kids-video 프로젝트 시작 + Fable 5.1 모델 고정

오늘 하루의 핵심은 `~/kids-video/` 였다. Higgsfield로 CoComelon 스타일 kids song 영상을 long-form으로 만드는 파이프라인을 처음부터 세웠고, Song 01 "Brush Brush Brush"를 끝까지 완성했다.

처음 요청은 두 가지였는데 — CoComelon류 애니메이션, 또는 김정은·트럼프 같은 실존 정치인이 나오는 바이럴 영상. 정치인 쪽은 바로 잘랐다. Higgsfield 자체가 실존 인물 impersonation을 막고 있고, 합성 국가원수 영상은 코미디 의도와 무관하게 manipulated media 규제에 걸린다. 그래서 토끼 캐릭터 Bobo의 하루를 따라가는 키즈 컴필레이션으로 확정.

가장 삽질한 부분이 `seed_audio`였다. 문서에는 2048자 한도라고 적혀 있는데 실제 backend는 그보다 낮다. 2031자 prompt를 HTTP 422로 세 번 다 거부당했고, 이분 탐색으로 좁혀 보니 1551자 통과·2020자 거부. 결론은 **1550자 이하**로 써야 함. `songs/01-brush/song_prompt.short.txt`로 다시 써서 validator 통과 (`tools/validate_song_prompt.py` — 17줄 전부 8 syllable, 112 BPM, 1303자). 곡 생성은 한 번에 됐고 정확히 120.000초, 10.4 크레딧 소모, 잔액 1044.1.

style key 1장 + 캐릭터·배경·소품 asset 7장(Bobo·Puppy·Kitty·욕실·침실·칫솔·치약)은 13.5 크레딧으로 먼저 완료했다. 칫솔 v1에 얼굴이 생겨서 agent가 잡고 v2로 교체한 게 인상적이었음.

`tools/` 아래에 만든 것들:
- `validate_song_prompt.py` — syllable·byte validator
- `extract_frames.sh` — ffmpeg로 scene 경계 프레임 추출
- `assemble_song.sh` — block들 이어 붙이기
- `boundary_sheet.sh` — 경계 확인용 montage
- `qa-rubric.md` — 검수 rubric

Song 01은 12 block × 10초, 2K(2560×1440), 재생성 3회를 거쳐서 최종 조립까지 마쳤다. `boundary_sheet.sh`로 경계 이미지도 확인 완료.

---

다른 건 Fable 5.1 고정. Claude Code `/model` 피커에 Fable 5.1이 안 보이는 이유를 파고들었다. 바이너리(`~/.local/share/claude/versions/2.1.263`) strings를 뜯어보니 `txe()` 함수에 label "Fable" 항목은 있는데 피커 UI에서 노출이 안 되는 구조였다. 접근 권한 자체는 있어서 — `claude -p "say ok" --model claude-fable-5-1`이 정상 응답함 — `~/.claude/settings.json` 의 `model` 키를 직접 `claude-fable-5-1`로 바꿨다. 원본은 `settings.json.bak-20260907-172403`에 보관.

오늘 새로 발견한 제약 하나: `higgsfield-seed-audio-prompt-limit` — seed_audio 실제 한도는 ~1551자. 메모리에 기록해 뒀다.
