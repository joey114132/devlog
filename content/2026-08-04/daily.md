---
date: 2026-08-04
---

# DEUX 왼손 thumb 수정 + VR teleop 첫 시도 + 바탕화면 대청소

오늘 제일 속 시원했던 건 왼손 그리퍼 thumb 버그였다.

GUI 슬라이더로 그리퍼를 쥐면 오른손은 잘 말리는데 왼손 thumb만 끝마디가 반대 방향으로 꺾이는 문제가 오래됐었다. `src/deux/gui/teleop_gui.py`의 `_HAND_GRASP_LEFT["thumb"]` j3 값 부호가 잘못돼 있었다 — `-1.3`이어야 할 걸 그렇게 넣었는데, 실제론 `+1.3`이어야 맞았다. 고치고 mirror 판정 로직에 비대칭 게이트 + 축 비교도 추가했다. 검증은 MuJoCo EGL 오프스크린 렌더로 좌/우 닫힘을 2×2 이미지로 찍어서 확인. 닫힘 상태에서 thumb이 손바닥을 가로질러 넘어오고 두 손가락이 같은 방향으로 말리는 게 처음으로 맞아떨어졌다.

같은 세션에서 `scripts/follow.sh`의 CAN Up 버튼이 sudo 프롬프트에서 멈추는 버그도 잡았다. TTY 없는 상태에서 sudo 티켓이 만료되면 `sudo -v`가 비밀번호를 물어보며 멈추는 구조였다. `sudo -n ip link set can0` 같은 실제 허용된 명령을 직접 테스트하는 `can_sudo_ok` 함수로 게이트를 바꿔서 해결.

Dynamixel bringup 후 sim 창에서 왼팔 j6·j7, 오른팔 j4·j6·j7이 반대로 도는 현상도 오늘 고쳤다. `src/deux/leader/leaders.py`의 `UdpLeaderView.SIM_FLIP`에 dynamixel 항목이 빈 집합으로 되어 있었다. 주석에 "dynamixel은 보정 불필요"라고 적혀 있었는데 그 전제가 어느 시점에 깨진 것. feetech와 똑같이 `{"left": {6, 7}, "right": {4, 6, 7}}`로 채우고 `tests/test_feetech_flip.py`의 해당 테스트도 실측에 맞게 업데이트했다.

오후~저녁은 Quest 2로 MuJoCo VR 텔레오퍼레이션 도전이었다. Unity Hub 쓸 필요 없이 `teleop_xr`이 WebXR 기반이라 Quest 브라우저에서 바로 열린다는 걸 확인하고 `tools/vr/` 폴더를 새로 팠다 — `deux_robot.py`, `vr_mujoco.py`, `make_urdf.sh`, `requirements.txt`, `CLAUDE.md`. pyroki + JAX로 IK 돌리고 4443 포트에 WebXR 서버 띄우는 구조. GPU가 60배 느려서 JAX를 CPU에 고정(IK는 배치 크기가 작아서 GPU 이점이 없다). 초기 자세가 팔이 앞뒤로 뻗는 문제는 `xyz_deux.xml`의 j4 축이 URDF랑 달라서(`xyz_deux`만 우완 j4를 대칭으로 잡음) `DeuxRobot.get_default_config()`를 오버라이드해 잡았다. 근데 Quest에서 "disconnected"가 계속 뜨는 건 끝까지 해결 못 했다. WebXR 연결 문제, 내일 이어서 봐야 할 것 같다.

아침엔 바탕화면 대청소도 했다. 36GB가 22GB로, 최상위 항목 68개 → 25개. `SAM3.zip`(12.2GB, 이미 풀려 있었음)과 orca AppImage 07-28 체크포인트 7개(1.4GB)를 휴지통으로. `docs/`, `web/`, `images/`, `installers/` 폴더로 재분류.
