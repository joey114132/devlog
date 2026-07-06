---
date: 2026-07-03
---

# xyz_deux STL로 URDF 처음부터 만든 날

오늘 제일 큰 일은 `~/Downloads/xyz_deux_stl/` 에 넣어 둔 CAD STL 파일들로 14-DOF 양팔 URDF를 처음부터 만든 것. 예전엔 기존 OpenArm URDF에 메시 교체하는 식이었는데, 이번엔 완전히 내 CAD 기반으로 새로 짰다.

trimesh로 각 메시 bounding box + centroid 재봤더니 공유 어셈블리 프레임(mm, Y-up)이었다 — 즉 메시들이 이미 실제 위치 그대로 앉아 있는 구조라 URDF 원점 계산이 훨씬 쉬웠음. 그래서 `tools/make_cad_urdf.py` 만들어서 `ros2/xyz_deux_cad.urdf` 생성. MuJoCo에 올려보니 14 DOF, 조립 깔끔하게 서 있었다.

근데 그 다음이 고생이었다. 관절 축이 죄다 틀렸음.

j2가 Z 축으로 빠지는(옆으로 abduction) 이상한 움직임이 첫 번째 신호였고, j4·j6·j7 방향 반전, j3 잘못 매핑… 하나 고치면 다른 게 또 이상하고. 결국 OpenArm reference URDF(`ros2/xyz_deux.urdf`)에서 FK 돌려서 홈 자세 기준 world 축을 직접 계산했다. roll이 j1/j3/j5, pitch가 j2·j6(X 축), j4·j7(Y 축)으로 교차되는 패턴. 내 CAD 팔이 −Y 방향으로 매달린 구조라 OpenArm 기준 축 매핑을 전부 다시 했다. OBB로 j2 모터 확인하니 81.6mm 대칭축이 X 방향 — 맞았다.

GUI(`sim/teleop_gui.py`)도 신형 URDF에 맞게 joint 이름 컨벤션 교체(`j1_left…` → `left_joint1…`)하고 카메라 프레이밍까지 조정. offscreen 연기 테스트에서 14개 관절 resolve 되고 feetech 리더 양쪽 live 읽기 확인했다.

오후엔 실제 하드웨어 텔레옵 붙이는 작업으로 넘어갔다. feetech `~/feetech_arm_ws/` 브링업 방식 참고해서 `scripts/follow.sh`랑 `scripts/README.md` 만들고, conda `xyz` 환경 새로 cloning (`dynamixel` 기반), `~/.zshrc`에 `xyz` alias 추가.

zsh 히스토리 보면 `./follow.sh` + `tmux kill-server` 가 엄청 많이 반복됐다 — 뭔가 계속 안 됐다는 뜻. 정확히 어디서 막혔는지는 오늘 안에 해결 못 했음. `feetech_arm_ws/sim/leader_follower_bridge.py`랑 `openarm_ros2_ws/.../openarm_mini.py`도 편집했는데 실제로 follower가 따라오는 데까지는 아직 못 봤다.

---

아침엔 Confluence에 한국어 진행 공유글 세 개 썼다. Thor USB-C 포트 인식 이슈(force recovery 겸용 OTG 포트 문제), Dynamixel 리더암 텔레옵 테스트 계획/진행 보고, Feetech 보고까지. 원래 thor 이슈 리포트 형식 참고해서 비슷하게 맞춰서 썼다.

---

옆에서 skill 정리도 했다. Spartan toolkit 22개 설치, 중복 generic/process 스킬 17개 `~/.agents/skills_archive/`로 뺐다. 로봇 관련 스킬 6개(`docker-ros2-development`, `robot-bringup`, `robot-perception` 등) 새로 설치해서 `skill-rules.json` 키워드 훅에 연결. rtk도 0.42.4 → 0.43.0 공식 인스톨러로 업그레이드 했다. `rtk-ai`는 실재하지 않는 패키지라 설치 안 함 — npm/pip/cargo 전부 확인했다.

`karpathy-guidelines` 스킬도 추가했는데 기존 Ponytail이랑 90% 겹쳐서 priority medium으로 낮춰서 SUGGESTED에만 뜨게 해둠.
