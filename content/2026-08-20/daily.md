---
date: 2026-08-20
---

# DEUX GUI 전부 죽어 있었고, KTX는 겨우 잡았다

오늘 하루 DEUX 잡고 있었다. 그러다가 저녁에 KTX 감시 스크립트가 진짜 이변을 일으켰다.

## DEUX

GUI 버튼들 — CAN Up, Bringup+Follow, Stop, E-STOP — 배선 확인하다가 전부 죽어 있는 걸 발견했다. `src/deux_gui/scripts/` 폴더 자체가 없었고, 세 버튼이 죄다 존재하지 않는 `follow.sh`를 부르고 있었다. 원 저장소에서 GUI만 복사해오면서 스크립트를 안 들고 온 것. E-STOP은 아예 버튼이 없었다.

shim `follow.sh` 먼저 만들어 세 버튼 경로 이어주고, E-STOP은 `/deux/estop`을 발행하는 `estop.py`로 TDD하며 추가했다. 5 passed. GUI 툴바에 붙이고 카메라 피드 깨지는 문제(rclpy.init 순서)도 같이 잡았다.

모드 토글도 죽어 있었다. `_send_real_mode`가 UDP :47925로 옛 스택의 `mode.py --serve`에 쏘고 있는데 DEUX엔 그 서버가 없었다. ROS 발행으로 갈아끼우면서 프리셋 이름도 정리했다 (`gravity-hold` vs `gravity_hold` 불일치). 33 passed.

gravity/kp/kd 스핀박스들은 `/tmp/deux_*` 마커 파일에 쓰고 있었다 — 옛 스택이 폴링하던 방식이고 DEUX는 읽는 놈이 없었다. `deux_gravity`에 `scale_gains()` 붙이고 GUI에서 ROS 파라미터로 연결했다. 최종 79 tests passed.

j7 관절 부호도 오늘 잡았다. 시뮬레이터 리더 양손 j7이 반전돼 있었는데 feetech/UDP 두 경로 다 고쳤다.

canup.sh는 Thor 내장 CAN(팔로워 양팔)과 CANivore USB(스워브) 분리해서 새로 짰다. `src/deux_tools/scripts/canup.sh`. vcan 모듈 있어서 가상 CAN 검증은 가능한데 실 하드웨어는 아직 없다.

rosbag → LeRobot 변환도 실제로 돌렸다. 9.6초짜리 bag (팔로워 916 + 리더 960 메시지) 가져다 `bag_to_lerobot.py`로 변환하고, dataset 읽어서 학습 파이프라인까지 라운드트립 확인했다. 이미지 처리는 아직 없다 — bag_to_lerobot.py 109줄에 `image`/`cam`/`rgb` 한 건도 없음.

ACT-2 얘기도 나왔는데, 결론은 "직접 못 만든다". Tony Zhao의 Sunday Robotics Memo 전용 모델이고 아키텍처 공개된 적 없다. 대신 deux-act2.md 스펙을 `.planning/specs/`에 써뒀다 — lerobot의 플러그인 경로(`factory.py`)로 우리 저장소 안에 얹는 방식.

텔레옵 문서 HTML 아티팩트는 탭 5개로 늘었다. 텔레옵 스택 · clone 직후 · 패키지 안 · 노트북↔Thor · 리더 저장소.

## KTX

감시가 33시간 동안 멈춰 있었다. 로그가 `08-19 00:57:46`에서 끊겼고 자식 프로세스(`search 서울 광주송정`)가 1일 9시간째 매달려 있었다. subprocess 타임아웃 없이 쏜 게 원인. 

고치고 돌리는데 오전 10:35에 서울 19:29 KTX 433 취소표를 잡았다. 구입기한이 10:45였는데 내가 폰 못 봐서 놓쳤다.

저녁에 용산 18:31 KTX 431 취소표가 떴다. 17:44에 예약번호 320260854191259 잡았고, 구입기한이 17:52. 내가 17:44에 코레일톡 확인해서 직접 결제했다 — 46,800원, 9호차 14C. 오늘 아침 놓쳤던 거 만회한 셈.

그 직후 감시가 서울 19:29 취소표를 또 하나 잡아놨다(18:14 기한). 이건 결제 안 하고 두면 알아서 사라진다.

crontab으로 `*/10` 재시작 장치 붙여뒀다. `.done` 파일 있거나 8/23 지나면 안 뜬다.
