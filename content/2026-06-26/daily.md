---
date: 2026-06-26
---

# 양팔 텔레오퍼레이션 드디어 됐다

오늘의 메인 사건. `dynamixel_arm_ws`에서 며칠째 리더 팔이랑 GUI, 세이프티만 붙잡고 있었는데, 정작 **팔로워가 진짜로 움직이는지** 한 번도 확인을 안 했다는 걸 깨달았음. 그래서 둘을 갈라서 따로 테스트함.

먼저 `scripts/test_follower_move.py`를 만들어서 팔로워 관절에 직접 명령을 쐈는데, 처음엔 자꾸 `data=[]` 빈 배열이 나갔다. 알고 보니 `\` 줄바꿈이 `"{data: [...]}"` 인자를 먹어버린 거였음. 그래서 중괄호/대괄호 없이 `--side right --joint 1 --delta 0.3` 같은 플래그 방식으로 바꿨더니, +0.3 명령에 +0.271 rad 측정 — **팔로워 쪽은 멀쩡하다는 게 확정**됐다. 즉 문제는 100% 우리 브리지였던 것.

그래서 `scripts/teleop_doctor.py`(+`.sh`)를 짜서 텔레옵 체인 hop마다 Hz를 찍어봤음. 체인은 세이프티 필터까지 다 살아있는데 `state=IDLE` — 데드맨을 한 번도 안 켰던 거였다. 그리고 더 깊은 진짜 원인: USB에 부하 걸리니까 `sync read failed`가 쏟아지다가 `/dev/ttyACM0: No such file or directory` — **OpenRB-150이 USB 버스에서 통째로 떨어졌다가 `ttyACM1`로 다시 붙은 것**. 브리지는 이미 사라진 포트를 계속 열고 있었던 거임.

고친 건 두 가지. 하나는 `gui/leader_bus.py`에 by-id 심볼릭 링크 리졸버를 넣어서, 하드코딩된 ttyACM0 대신 `/dev/serial/by-id/usb-ROBOTIS_OpenRB-150_*-if00`을 잡게 한 거(`scripts/calibrate_leader.py`에도 연결). 다른 하나는 데드맨 양쪽 enable. 포트 잡히고 양쪽 켜니까 — **드디어 텔레옵 됨.** `Dynamixel_Teleop_Demo.mp4`로 확인했는데 잘 따라온다. 며칠 묵은 거라 좀 후련했음.

## 동작하고 나서 폴리싱

이제 디테일 손봄.

- 그리퍼 부드럽게: `finger_vel 0.15→0.06`, `finger_acc 2.0→0.8`, gripper `max_effort 5.0→2.0` (limits.yaml / follower_adapter_node.py). 근데 완전히 닫아도 살짝 벌어지는 싱크 문제가 남아서 양쪽 베스트 싱크 맞추는 걸 계속 만짐.
- 관절 충돌 박스가 너무 부풀어 있어서 줄였음. 단 그리퍼랑 손목 박스는 그대로 유지 (`gui/collision_boxes.py`).
- 리더 팔 햅틱 작업 시작. 끄거나 손 놨을 때 팔이 툭 떨어지는 걸 막으려고 `leader_node.py`에 항상-켜짐 약한 안티-드룹(`_apply_anti_droop`)을 넣음. 햅틱 월에 부딪혔을 때 빠져나오기가 너무 힘들길래 미는 힘도 줄였다 (`gui/haptic_wall.py`). 부수적으로 `scripts/leader_free.py`, `leader_reboot.py`, `teleop_direct.py`도 만듦.
- `scripts/follower.sh` 메뉴 4번 — feetech 쪽 bringup 방식 참고해서 bringup+follow 둘 다 돌게 손봤음.

## 문서 정리, 옵시디언 위키, 그리고 Confluence 보고서

설명 문서들 정리:

- `docs/teleop-tuning-rate-and-joint-sign.md` — Hz는 살짝 올리긴 했지만 그게 진짜 원인은 아니었다는 거랑, 일부 관절 부호가 뒤집힌 이유.
- `docs/dynamixel-leader-arm-setup.md`에 2026-06-26 항목 추가 — 리더(Dynamixel/시리얼/OpenRB-150) vs 팔로워(DAMIAO/CAN-FD/PEAK) 버스 비대칭을 ASCII 다이어그램까지 곁들여서.
- README 하드웨어 토폴로지 갱신, `docs/teleoperation-guide.md`에 텔레옵 전체 매뉴얼 + ros2/lerobot 각자 역할.

옵시디언이 처음이라, llm-wiki [[wiki/concepts/llm-wiki-pattern|패턴]]으로 프로젝트 안에 `teleop-wiki/` 볼트를 통째로 부트스트랩했음. concepts/entities/queries/reports 다 채워서 24~25페이지, lint 깨끗(broken link·orphan 0). conda를 왜 꺼야 ROS2가 도는지 물어봐서 `conda-vs-ros2.md`도 추가. git init 하고 `joey114132/teleop-wiki` private 레포로 푸시까지 함.

그리고 Confluence 보고서. 리더 암 테스트 플랜을 Part A(SR 플랜) + Part B(TC 부록) 합쳐 한국어로 만들었는데, 막힌 게 하나 있었음 — 내 Atlassian 커넥터는 robot8.atlassian.net만 인증돼 있고, 보고할 곳은 pinkwink.atlassian.net(CR 스페이스, 페이지 3499819093)이라 MCP로는 못 닿았다(`Cloud id ... isn't explicitly granted`). 그래서 새 API 토큰 받아 `push_confluence.py`로 직접 밀어넣음. 톤도 ~입니다/습니다 격식체로 바꾸고, "Part B §2.7 참조" 같은 게 실제 링크로 걸리게 목차 인덱스도 달았다. 옵시디언 미리보기용 페이지도 볼트에 넣었다가, 대외 보고서니까 `[[…]]` 크로스링크 6개랑 옵시디언 스테이징용 메타 콜아웃은 다 떼냈음. 토큰은 안 revoke할 거라고 해서 `.zshrc`에도 넣어달라고 함.
