---
date: 2026-07-02
---

# xyz_deux 팔 첫 삽 + Confluence 문서 대작전 (그리고 529와의 싸움)

오늘은 두 가지를 동시에 했는데, 둘 다 예상보다 오래 걸렸다.

---

## xyz_deux 팔 프로젝트 시작

새 팔이 생겼다. Damiao 모터 기반의 "XYZ deux"로, OpenArm이랑 외형은 비슷하지만 링크 길이가 살짝 다르다. 실제로 재서 비교해보니 j1→j2가 2mm, j2→j3가 10mm, j3→j4가 2mm 더 짧고 나머지는 같다.

새 폴더 `~/xyz_deux_arm_dynamixel_lead/`를 만들고 OpenArm ROS2 스택을 포크했다. `openarm_ros2_ws/src/openarm_description`을 그대로 clone해서 `ros2/src/openarm_description`에 넣고, `config/arm/xyz_deux/kinematics.yaml`에 측정값 반영. colcon 빌드는 처음에 conda 환경이 끼어들어서 실패했고, `CONDA_PREFIX`, `PYTHONPATH`를 `unset`해야 풀렸다.

URDF는 처음에 메쉬 없이 만들었더니 몸통 프레임이 아예 없이 떠서 황당했다. OpenArm 몸통 프레임 그대로 가져다 쓰고, 링크는 cylinder + cube 조합으로 새로 그렸다. 가로폭 6.7cm, 전체 길이 54.3cm 기준. viewer에서 조인트가 비뚤게 기울어져 있어서 원점 정렬도 한 번 더 수정했다.

시뮬은 `sim/run_sim.py`로 돌렸고 13개 시나리오 영상 + 14/14 셀프체크 통과. 영상 일부는 벽 시나리오에서 팔이 화면 위로 사라지길래 카메라 위치 조정해서 재촬영했다.

초기 커밋(`4bd53cb 초기 커밋: XYZ deux 안정화 제어 + 시뮬레이션`) 이후 `joey114132/xyz_deux_openarm_description` 비공개 리포를 새로 만들고 `xyz-deux` 브랜치로 push했다.

---

## Confluence 문서 7개 일괄 리라이팅

`dynamixel_arm_ws` 세션에서는 Confluence 문서 톤을 전부 바꾸는 작업을 했다. 기준은 OpenArm 레퍼런스 페이지(CR/3463151658)인데, 개념을 먼저 딱 잡고 바로 옆에 괄호 주석으로 설명을 붙이는 방식이다("미리 공급(피드포워드)", "복원력(강성 K)").

대상은 7개: 연구 문서, Dynamixel Test Plan, 햅틱 원리, 햅틱 테스트 계획, 햅틱 결과 보고, Dynamixel 보고서 §1, feetech. §1 먼저 수작업으로 고치고(v26), 나머지 다섯은 병렬 에이전트로 돌렸다.

문제는 Claude API가 오전부터 **529 Overloaded**를 계속 뱉었다는 거다. 에이전트 5개가 0 tool use로 죽길 반복했다. 4분 대기 후 재시도, 또 죽으면 다시 대기. 결국 하나씩 한 번에 하나씩 올리니까 통과됐다. 최종 버전: 연구 문서 v9, Test Plan v12, 햅틱 원리 v12, 햅틱 테스트 계획 v9, 햅틱 결과 보고 v12.

도중에 내가 직접 Leader+Collision+Haptic 페이지(CR/3496181764)를 수정해서 "이렇게 써라" 가이드로 줬다. 그리고 "작은팔"이나 "큰팔" 같은 말을 쓰지 말고 **리더암 / 팔로워암**으로 통일하라고 잡아줬다.

Slack 보고용 문구도 하나 만들었는데, 처음에 PinkWink 대표님이 관여한 것처럼 써줘서 아니라고 다시 잡았다.

---

## 자잘한 것

Cursor에서는 스킬·훅이 자동으로 붙는데 왜 Claude Code는 안 그러냐고 물었다. 훅은 harness가 자동 실행하는 거고(SessionStart PONYTAIL 훅이 그 예시), CLAUDE.md 규칙도 자동 주입된다. 스킬은 컨텍스트 보고 내가 판단해서 호출해야 하는 구조. 파이프라인 끝에서 확인까지 했음.
