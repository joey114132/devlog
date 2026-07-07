---
date: 2026-07-06
---

# YOLO Confluence 7페이지 완성 + xyz_deux 리팩토링 + woolimi 리포 해부

월요일인데 진이 빠지는 하루였음.

오전에 YOLO 수업 4일차 Confluence 페이지 작업부터 시작했다. `pinkwink.atlassian.net/wiki/spaces/CR/pages/3480027144` 아래 빈 페이지를 채우는 건데, 사용자가 원하는 건 5일차 형식 — 섹션별로 별도 하위 페이지. 처음엔 하나짜리 합본 페이지로 올렸다가 "이건 5일차랑 달라" 라고 혼났고, 그 다음엔 6개 하위 페이지로 쪼갰는데 이번엔 톤이 반말이라고 또 혼났다. 존댓말(`~합니다/~됩니다`)로 전부 다시 써야 했다. 거기다 Page 00이 빠른 병렬 업데이트 도중 실제로 삭제되어서 다시 만들었다. 이미지/gif/영상 포함도 안 해놨다고 혼났는데, Atlassian MCP가 파일 업로드를 못 한다는 걸 직접 확인하고서야 사용자한테 솔직하게 말할 수 있었다. 결국 7개 페이지(인덱스+00~05 하위) 완성. 같은 실수를 왜 반복하냐고 꽤 직접적으로 혼났고, `korean-docs-jondaetmal.md`랑 `confluence-no-clobber.md` 메모리 파일도 이 과정에서 새로 만들었다.

---

오후는 `~/xyz_deux_arm_dynamixel_lead` 거의 하루 종일. 두 세션이 동시에 돌아갔는데 한 세션은 워크스페이스 리팩토링, 다른 하나는 GUI + 시뮬 영상 작업이었다.

리팩토링 쪽은 꽤 많이 바뀌었다. `tools/` 폴더를 `scripts/`로 통째로 옮겼고, URDF 파일들을 `ros2/` 대신 `urdf/` 디렉토리 아래로 이동했다(`xyz_deux_cad.urdf`, `xyz_deux_fork.urdf` 등). MJCF 모델 변형 파일 5개는 `archive/model_variants/`로 밀어넣었다. `CLAUDE.md`도 파일맵 + 에이전트 반-스프롤 규칙으로 새로 썼다. 바뀐 경로는 `sim/teleop_gui.py`, `bringup/follow.sh`, `scripts/make_cad_urdf.py`, `scripts/viz.py` 등에서 일일이 grep해서 고쳤다.

woolimi의 사설 리포 5개(`caring_openarm`, `_ros2`, `_description`, `_can`, `_mujoco`)를 `/tmp` 스크래치패드에 클론해서 실소스를 직접 읽었다. `openarm_hardware/src` 아래 하드웨어 인터페이스 코드를 보니 MIT식 `τ = kp(q_cmd−q) + kd(q̇_cmd−q̇) + τ_ff`, `τ_ff = G(q)(KDL ChainDynParam) + τ_bias + Coriolis + 사용자 토크피드포워드`로 동작하고, 중력 보상은 항상 켜진 채로 kp/kd 슬롯만 바꿔서 모드 전환하는 구조였다. 이걸 vault에 `wiki/concepts/caring-openarm-architecture.md`로 정리했고, index.md와 log.md에도 추가했다.

GUI 쪽은 텔레옵 GUI(`sim/teleop_gui.py`)를 대규모로 손댔다. 아침에 바로 segfault(`python3 teleop_gui.py` → core dumped)가 났고, can0도 아직 안 올라와 있어서 `sudo ip link set can0 up type can bitrate 1000000` 먼저 해줘야 했다. feetech/dynamixel 리더암 상태 확인용 `scripts/leader_check.py`도 새로 만들었다. GUI에 leader_check 버튼도 달고, CAN 헬스체크도 setup 단계에 끼워 넣었다.

시뮬 영상 렌더링은 `scripts/record_safety.py`랑 `scripts/record_obstacle.py`로 세트 작업. brake 클립이 의도한 링크(elbow vs forearm)를 잘못 targeting해서 여러 번 재렌더링했다. `T_PRED`를 0.15→0.22→0.15로 왔다 갔다 하면서 장애물 회피 파라미터도 조정했다. 결국 barrage 14개 전부 회피(+5.4 cm 여유), 안전 릴 8개 클립 concatenate까지 완성.

마지막으로 시뮬 뷰포트가 창 최대화해도 검은 여백이 생기는 문제 — 오프스크린 렌더러를 실제 창 크기에 맞춰 리사이즈하도록 고쳤다. floor geom이 group 0이라 충돌 메시 토글 때 숨겨지던 것도 group 2로 바꿔서 잡았다.

하드웨어는 팔로워 팔이 리더를 따라가지 않는 문제가 아직 완전히 해결된 건 아니다. 실물 bringup 후 텔레옵이 안 되는 부분은 아직 더 봐야 한다.
