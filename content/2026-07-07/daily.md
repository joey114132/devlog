---
date: 2026-07-07
---

# 팔 모드 설계·Fable 스킬 공개·YOLO 버거→와플 전환

오늘 세션 세 개가 거의 동시에 돌아갔다. xyz_deux 팔 작업이 아침부터 밤까지 제일 길었고, 낮에 Fable 스킬 하나 공개로 올렸고, 저녁에 YOLO_Lesson 덱을 뒤집었다.

---

## xyz_deux arm — kp=0 모드 설계 + Cartesian servo

제일 핵심은 **모드를 kp=0 기준으로 재설계한 것**이다. 기존에는 gravity comp·compliance·impedance가 kp 크기로 구분됐는데, 사용자 요청이 "모드 전부 최대한 부드럽게, 스프링백 없이"였다. 그래서 lock 빼고 나머지 soft mode는 전부 kp=0으로 잡고, damping(kd)으로만 차이를 뒀다. zero-g는 kd=5(멀리 떠내려가 멈춤), compliance는 kd=25, impedance는 kd=50(거의 제자리) 식으로.

`config/gain.yaml` 고치고, MuJoCo sim에서 `scripts/record_modes.py`로 영상 생성해서 확인했다. 숫자로 보면 zero-g가 20cm 표류·정지, compliance 5cm, impedance 3cm — 다 STAY(plateau)고 lock만 spring-back. `sim/out/modes/deux_modes_reference.mp4`(21.9초)로 저장됐다.

실물 쪽은 `feetech_arm_ws/src/feetech_openarm_ros2/openarm_bringup/scripts/mode.py` 동기화했다.

### Cartesian servo 추가

Confluence 페이지(CR 3470786591, OpenArm Moveit Servo)를 읽고 같은 방식으로 구현했다. GUI에 CARTESIAN JOG 버튼, `scripts/servo_bridge.py`가 UDP로 EE twist 받아서 관절 명령 내보내는 구조. `forward_velocity_controller`가 실물에도 있는 걸 확인(`openarm_bimanual_controllers.yaml`)하고 wiring했다.

### 오른쪽 리더암 sign 버그

오른팔 joint_1이랑 joint_7 방향이 반대였다. `config/leaders/dynamixel_leader.json`이랑 `~/dynamixel_arm_ws/calibration/leader.json`에서 sign 뒤집었고, `sim/leaders.py`도 맞게 수정했다.

### 브링업 시 팔이 혼자 움직이는 버그

리드암 먼저 들고 브링업하면 팔로워가 갑자기 급격히 따라오는 문제. j6, j7이 혼자 돌아가는 현상도 있었다. 원인 추적하다가 `dynamixel_arm_ws/src/dynamixel_leader_driver/dynamixel_leader_driver/leader_node.py`랑 `feetech_arm_ws/sim/leader_follower_bridge.py` 손댔다. 완전히 잡혔는지는 아직 실기 확인 필요.

### 기타

- 슬라이더 스크롤로 모드 바뀌는 문제 → QComboBox/QSlider에 wheel event 막기 처리
- Show Side 단일 UI 제거(양손 동시 추적 위해)
- Jira OAE 보드에 한국어 티켓 생성 시도 — 리스트에는 뜨는데 보드 칸에 안 보이는 문제 발생, 미해결

---

## Fable workflow 스킬 공개

낮에 Anthropic Fable 5 영상("Field Guide to Fable", Thariq Shihipar)을 yt-dlp로 자막(3,535단어) 받아서 분석했다. 설치 튜토리얼이 아니라 "일하는 방식" 가이드여서 스킬도 그 방향으로 만들었다.

`~/.agents/skills/fable-workflow/SKILL.md` + `prompts.md` 작성 후 `~/.claude/skills/fable-workflow`로 심링크 연결. 그리고 `joey114132/fable-workflow-skill` 리포 만들어서 push했다. 처음엔 private으로 만들었다가 public으로 바꿨다.

실제 로컬 모델 벤치(gemma3:4b, ollama)도 돌렸고, PIL로 벤치마크 차트랑 배너 이미지도 직접 생성했다. `integrations/cursor/fable-workflow.mdc`로 Cursor 연동 파일도 추가했고, CLAUDE.md 전역 설정에 fable-workflow 기본 사용 명시했다.

---

## YOLO_Lesson — 연구사례 → 와플 Pi 전환

저녁에 YOLO_Lesson 작업. 요청 두 가지: (1) deck 05 연구사례 제거하고 아기 이미지 감지 시 정지 데모로 교체, (2) 전체를 Turtlebot3 Burger → Waffle Pi로 전환.

`build_slides.py`를 splice 스크립트로 패치했다. 덱 05 새 이름은 "정지와 출발 데모"(23 슬라이드). 카메라는 USB webcam(VideoCapture) 대신 Raspberry Pi camera 2.1 + Picamera2 라이브러리 사용으로 변경. `picam_publisher.py`가 새 퍼블리셔.

덱 00, 03에 남아있던 "버거" 참조 4개도 제거하고, 6개 덱 전부 headless Chrome으로 렌더 검증했다 — JS console error 0.

`강의 대본.md`의 05 섹션 전면 재작성, `CLAUDE.md`도 업데이트. Google Drive 링크는 private이라 접근 못했고, Confluence 페이지 업데이트는 API 호출 시도했으나 완전히 마무리 못함.

`turtlebot3` GitHub jazzy 브랜치에서 `camera.launch.py` 직접 확인해서 토픽 이름, `camera_ros` 의존성 여부 체크했다.

---

오늘은 세 프로젝트가 동시에 돌아가서 컨텍스트 전환이 많았다. xyz_deux 브링업 버그는 실기 검증이 남아있고, Jira 보드 문제도 미해결. YOLO Confluence는 내일 마저 해야겠다.
