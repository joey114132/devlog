---
date: 2026-06-17
project: jetcobot_ros2
tags: [ros2, jazzy, mycobot, smart-farm]
---

# jetcobot_ros2 훑고 smart_farm 폴더 깔았음

`jetcobot_ros2` 레포 구조부터 뜯어봤다. 예전 BOLT 과정 산출물이라 MoveIt + pymycobot 브릿지 패턴은 괜찮은데 arm STL 메쉬가 빠져 있고, `bringup_all`이 레포 밖 패키지(`jetcobot_moveit_picker`, `pinky_description` 등)를 물고 있어서 그대로는 깨질 부분이 있다는 걸 정리해 뒀음.

스마트팜에 마이코봇 280 두 대로 토마토 수확하려면 공식 URDF가 낫다고 해서 Elephant `mycobot_ros2` humble 브랜치랑 Jazzy용으로는 Addison `mycobot_ros2` 쪽을 짚어 줬고, 사용자가 Pi 5 + Jazzy로 폴더 만들어 달라고 해서 실제로 `smart_farm/` 아래에 작업 공간을 만들었다.

`smart_farm/vendor`에 Elephant 공식 `mycobot_description` shallow clone 스크립트 넣었고, `mycobot_280_pi5_bringup`이랑 `mycobot_280_pi5_moveit_config` 패키지를 새로 썼다. 조인트 이름은 예전 `1_Joint` 대신 공식 `joint2_to_joint1` 계열로 맞췄고, URDF는 `mycobot_280_pi_adaptive_gripper` 쓰게 했다. `joint_control` / `joint_state_switcher`는 jetcobot에서 가져오되 시리얼 포트 파라미터랑 네임스페이스(`arm_left` / `arm_right`) 대비해 뒀다. 로컬 Jazzy에서 `colcon build` 세 패키지 다 통과했고 launch `--show-args`랑 xacro 펼치기까지는 확인했다. 실제 Pi에 arm 꽂아서 움직여 보지는 않았음.

레거시 `jetcobot_*` 패키지는 안 건드렸고 `.gitignore`에 `smart_farm/vendor/`, `install/` 추가해 둠. 아직 커밋은 안 함.
