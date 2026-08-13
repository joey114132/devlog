---
date: 2026-08-07
---

# 금요일인데 네 가지를 동시에 했음

## Pinky 배너 루프 영상 — Seedance한테 쓴 맛 봄

오늘 제일 고생한 건 핑키 배너 루프 영상이다. `~/Downloads/핑키스튜디오_배너.mp4` 레퍼런스를 베이스로 "첫 프레임 = 마지막 프레임" 루프를 만들어야 했는데, AI 생성 클립을 끼워 넣는 방식으로 시작했다가 한참 돌아갔다.

처음엔 MiniMax 덜컹 삽입 — 흔들림이 너무 과해서 교체. 그다음 Seedance 2.0 으로 "로봇이 놀라서 덜컹, 바퀴 접지 유지"를 생성했는데 45 credits 쓰고 나온 결과가 **점프**였다. 공중부양. 스토리보드에 없는 거다. "바퀴가 바닥에서 절대 떨어지지 않는다"를 프롬프트에 반복 명시하고 재생성했더니 두 버전 중 하나는 또 점프, 하나만 접지 노즈딥으로 통과했다.

근데 QA에서 crossfade-out 마지막 스텝이 2.70 (주행 자연 스텝 ~2.0보다 튀는 값) 걸려서 수정까지 했다.

결국 가장 깔끔한 해법은 **레퍼런스 자체를 루프로 자르는 거**였다. f20..f218 구간이 MAE 1.94로 자연 인접 스텝에 가까워서, 거기서 트림 + f20 복사로 루프 완성. 색 보정 시도했다가 리샘플링 블러가 오히려 더 나빠져서(3.73 vs 원본 1.94) 빼고 순수 트림으로 정착했다. 최종 배포: `~/Downloads/pinky-banner/pinky-banner-{light,dark}-loop.mp4`.

## 모방학습 GUI 새로 만듦

`deux_leader_teleop`에서 모방학습 워크플로 GUI 를 새로 팠다. 기존 `teleop_gui.py`(2,417줄)는 손 하나도 안 대고 별도로 `src/deux/gui/il_gui.py` 를 만들었고, 테마를 `src/deux/gui/theme.py` 로 분리해서 두 창이 같은 "orbital control deck" 팔레트로 보이게 했다.

시작 전에 `~/gui_backup/teleop_gui_2026-08-06_working.py`로 백업 먼저 떠뒀다 (체크섬 `6a714763…` 확인). GUI가 하드웨어 핸들을 직접 안 잡고 전부 서브프로세스로 띄우는 설계 — CAN 버스 소유권 충돌을 원천 차단하는 거다.

ACT-2 도 조사했는데 Sunday Robotics 상용 foundation model이라 가중치 공개 안 됨. 99.1% 수치는 자기들 자체 보고라 참고만 하고, 우리 스택의 ACT는 따로 개선한다.

## Dynamixel 강의 슬라이드 문체 교정

`deux_leader_teleop/tools/build_lecture_deck.py` 에서 `인수인계` 섹션 제목을 `정리와 문제 해결`로 바꿨다. 내용은 그대로.

그 다음 한국어 문체 교정을 꽤 깊이 했다. 조사 앞 공백이 162곳 (`USB 를`, `LeRobot 이` 같은 패턴), em-dash 81개를 전수 판정해서 콜론·쉼표·줄임으로 바꿨다. 중간에 목차 `OpenRB-150에`가 한 덩어리로 뭉쳐서 줄바꿈 깨지는 레이아웃 버그가 생겨 되돌리기도 했다.

PinkLAB 강의자료(`~/PhysicalAI강의자료/OpenARM/*.html`) 분위기랑 비교해봤는데, 문장 자체는 짧고 구체적이고 괜찮았다. "AI가 썼다"는 인상의 원인이 내용이 아니라 **조사 띄어쓰기 + em-dash 남용** 두 개였다. 이 규칙을 `.claude/projects/.../memory/korean-prose-anti-ai-tells.md`에 남겨뒀다.

## 성수 이사 매물 조사

8/17~18 이사 예정이 8/29로 바뀌어서 여유가 생겼다. 국토부 실거래 데이터(성동·광진·동대문·중랑 4개 구, 2026년 6~7월, 빌라+오피스텔 월세)와 당근 API로 15개 동을 훑었다. `~/성수-rent/` 폴더에 정리: `raw/`(국토부+당근 원본), `scripts/compile_listings.py`, `매물목록.md`(29건), `listings.csv`, `README.md`.

왕십리역이 허브로 결론 — 수인분당선으로 청량리 2정거장, 수서(SRT) 직결, 2호선·5호선·경의중앙선 환승 가능. 1순위는 사근동(보증금 5,000만 열면 월세 중위값 기준).

ODsay API 키가 없어서 door-to-door 소요시간 실측은 못 했다. 네이버 부동산은 첫 요청부터 HTTP 429, IP 기반 차단이라 포기. `ntfy.sh/joey-seongsu` 로 shortlist URL을 발송 완료(HTTP 200, message id `em34JxFTricv`).
