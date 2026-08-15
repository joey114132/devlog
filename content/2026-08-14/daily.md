---
date: 2026-08-14
---

# 할아버지 할머니 영상, 마우스 깜빡임 원인, Claude 설정 대청소

오늘 제일 감정 실린 작업은 할아버지 할머니 연대기 영상이었다. Downloads 폴더에 있던 사진 7장(`3554~3579.jpg`)으로 "전생에도 인연, 지금도 인연" 컨셉 영상을 만들기로 했는데, 제일 오래된 사진이 할아버지 중년 사진 하나뿐이라 "어릴적부터"가 물리적으로 불가능한 상황이었다. 그걸 오히려 "얼굴 없는 전생 → 얼굴 있는 현생"으로 역이용하기로 방향 틀었고, fal.ai genmedia CLI로 AI 이미지 생성하는 파이프라인을 잡았다.

`~/chronicle-video/` 에 `build_photos.sh` 먼저 짜서 실사 6장 파트 42초 렌더링 완성했다. Ken Burns 효과, 세로 사진 블러 채움, 한글 자막, 필름 그레이딩 다 정상이었다. 그런데 AI 파트 돌리려고 `genmedia balance` 찍었더니 잔액이 바닥나 있었다. API 키를 채팅에 붙여넣지 말고 터미널에서 직접 넣으라고 했는데 사용자가 그냥 채팅에 붙였다(나중에 폐기하고 새로 발급해야 한다고 알렸다). 재충전 후 재개. `genmedia upload` 에서 `.url` 필드로 받으려다 실제로는 `.cdn_url` 이라 업로드 실패하는 버그 있었고, `gen_ai.sh` 안의 `jq -r '.url'` 를 `.cdn_url` 로 고쳐서 해결했다.

할아버지 사진 업스케일(`fal-ai/topaz/upscale/image`)로 986→1972px 로 뻥튀기하고 얼굴이 살아났다. Kling video(`fal-ai/kling-video/v2.5-turbo/pro/image-to-video`)로 이미지-투-비디오 생성도 걸어뒀다. 결국 스크립트만 `gen_ai.sh`, `animate_all.sh`, `assemble.sh` 등 여러 개 만들었고 v3 어셈블리까지 갔는데, 세션 끝에는 AI 생성 영상이 다 나온 건지 명확하게 확인이 안 된 채 끝났다.

오전에는 마우스 커서 깜빡임 원인 추적에 꽤 시간 썼다. 처음에는 전날 Isaac Sim 프로세스 잔여인 줄 알았는데 GPU 0%, 15MiB로 확인 배제됐다. Docker 보니까 `pingdergarten-pgweb` 컨테이너가 2개월 반 동안 **5,438번** 재시작 반복 중이었다(`pgweb`가 `postgres:5432` 못 찾는 루프). `docker update --restart no` 로 중지시켰는데 깜빡임은 그래도 계속됐다. 결국 원인은 **X11 fractional scaling** — `mutter experimental = ['x11-randr-fractional-scaling']` 켜진 채로 Xft.dpi=192(200%), 실제 프레임버퍼가 `8960x2160`이라 화면(3840x2160)보다 크게 잡혀 있었다. Intel Iris Xe가 노트북 패널 구동하고 NVIDIA가 렌더링만 하는 구조라 하드웨어 커서가 배율에 못 따라가는 거였다. `xrandr --fb 3840x2160 --output eDP-1 --scale 1x1` 로 테스트하면 바로 잡힌다고 안내했는데, 근본 수정은 `SWcursor` 설정이다.

저녁에는 Claude Code 설정을 꽤 건드렸다. 사용자가 "유용한 스킬이랑 에이전트 세팅 다 찾아서 적용해봐"라고 해서 조사했는데, 이미 843개 깔려 있어서 새로 설치할 게 없었다. 대신 자기 robotics 스킬 3개가 깨져 있는 걸 발견했다 — `~/.claude/rules/robotics-skills.md`는 robotics 주제면 무조건 auto-invoke하라고 강제하는데 `robot-marine`, `robot-medical`, `robot-perception` 심링크가 잘못 걸려 있었다. `~/.claude/skills/`에 올바른 심링크로 재연결하고, `settings.json`의 `extraKnownMarketplaces`에 robotics-skills를 plugin으로 제대로 등록했다.

그 다음 context 최적화도 했다. 매 세션 자동 로드 분량이 10,076 words였는데, `ecc/common` 에서 내용이 실제 환경이랑 안 맞는 파일 6개(`agents.md` — 나열한 agent 11개 전부 `~/.claude/agents/`에 없음, `coding-style.md` — camelCase 강제하는데 우리 스택은 snake_case)를 `claudeMdExcludeFiles` 에 추가해서 6,527 words로 줄였다 (-36%, ~4,700 tokens/session). `~/.claude/hooks/ros-zsh-guard.sh` 도 새로 만들었다 — `source setup.bash` 쓰면 "zsh 세션이니 setup.zsh 써라"고 경고하는 PreToolUse hook이다.

오전 제일 앞에는 Android 녹음 앱 스파이크도 있었다. 1시간 단위 녹음 → Gemini API로 화자 분리 요약 → 요약 전달 후 녹음 삭제하는 앱. Plaud.ai UI를 레퍼런스로 잡고 APK 빌드까지 했는데, Flash-Lite 모델 써서 월 비용이 크게 안 나온다고 추산했다. "이걸 팔고 싶으면?"이라는 질문도 나왔는데, MVP 먼저 쓰고 유료화 전략은 그 뒤로 미뤘다.
