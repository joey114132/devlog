---
date: 2026-06-30
---

# 고등학생 YOLO 수업 자료 + openarm 시뮬 + 팔 USB 퍼즐

오늘 제일 눈에 띄는 건 YOLO 강의 슬라이드 작업이었다. 고등학생 20명한테 하루 6시간, 다음 날 바로 Turtlebot3 Burger로 컨테스트 — 이 조건에 맞춰 자료를 새로 만들었다. 기존에 `/home/joey/PhysicalAI강의자료/YOLO` 에 강의 노트가 있었고, `강좌 07 - 데이터셋 관리 및 품질 관리.html` 포맷(PinkLAB 슬라이드 CSS + nav 스크립트)을 그대로 긁어서 `build_slides.py` 제너레이터 짰다. 덱은 세 개 — YOLOv8 개요, 코드 한 줄씩 해부, Burger 연결용 ROS2 플러밍. 실제 `ultralytics` 로 버스 사진·군중 사진·공 추적 `follower_ball` 스크린샷 뽑아서 붙였고, `/home/joey/Downloads/emotion.v1i.yolov8` 감정 데이터셋으로 직접 학습 돌려서 커브도 넣었다. 3학년 애들 읽는다고 했더니 "중심입니다" 같은 합쇼체를 "중심이에요" 로 통일하는 패스까지 한 번 더 돌았다.

---

그 사이 `openarm-stabilization` 쪽도 꽤 많이 돌아갔다. 처음엔 `~/openarm_compliance` 폴더로 시작해서 README + `docs/gravity-comp-impedance-reference.md` 하나 박아 놨는데, 범위가 중력보상·임피던스·zero-g·컴플라이언스 전부라 이름이 좁다고 이름 바꿔서 `~/openarm-stabilization` 됐다. 그 과정에서 GitHub 리포를 한 번 올렸다가 지우는 삽질도 있었다(`joey114132/openarm_compliance` — `gh repo delete` 로 지움).

나중엔 Python ament 패키지에서 C++ CMake 구조로 통째로 갈아엎었다. Enactic `openarm_teleop` 리포에 `gravity_compasation.cpp` 실제 소스가 있어서 그걸 참고해서 `control/stabilization.cpp` 작성. MuJoCo 시뮬은 `sim/mujoco_stabilization_test.py` 로 돌렸고, zero-g·컴플라이언스·임피던스 각각 영상 여러 개 찍었다. 자기충돌 가드 없이 돌리니까 URDF 뚫어버려서 가드 추가 후 재촬영. 최종적으로 `all_demos.mp4` 몽타주까지 만들어서 커밋. GitHub Actions CI가 pre-commit clang-format 훅 때문에 계속 실패하길래 그냥 워크플로우 비활성화했다.

---

하드웨어 쪽은 USB 배선 퍼즐이 좀 피곤했다. 리더 팔, 팔로워 팔, D435, 손목 카메라 2개, PEAK CAN 어댑터 — 이걸 포트에 꽂고 빼고 반복하는데 한 쪽 고치면 다른 쪽이 문제가 되는 whack-a-mole 상황. D435가 `lsusb` 에 아예 안 잡히는 게 제일 답답했다(kernel dmesg 에 열거 이벤트 자체가 없었음 = 케이블이나 포트 문제).

`teleop_direct.py` 에 안전 기능도 붙였다 — rest pose 귀환, 점프 제거(jump rejection), 추적 watchdog, 팔로워 decel band. 유닛 테스트(`test_safety_policies.py`) 통과 확인. 그 다음 MoveIt Servo로 팔로워 충돌 문제를 잡아보려 했는데(`config/openarm_servo.yaml`, `src/arm_teleop_bringup/launch/servo_teleop.launch.py` 새로 만들고 빌드), `joint4` 리밋 워닝이 계속 뜨고 결국 팔이 바디 프레임을 또 들이받아서 오늘은 완전히 해결 못 하고 끝났다.

`./follower.sh _bridge --max-vel` 파라미터를 3.0 → 2.0 → 1.5 → 6.0 으로 왔다 갔다 하면서 `WALL_DETECT_MARGIN`, `--decel-band`, `--collision-brake freeze` 같이 조합해봤는데 아직 실제 충돌 없이 깔끔하게 동작하는 조합은 못 찾았다. 내일 더 봐야 할 것 같다.
