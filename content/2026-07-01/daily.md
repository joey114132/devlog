---
date: 2026-07-01
project: openarm-stabilization / dynamixel_arm_ws
tags: [robotics, git, mujoco]
---

# 어제 만든 시연 영상 몽타주 마무리랑, jailbreak 프롬프트 거절한 아침

오늘 아침은 가볍게 어제 하던 걸 마무리하는 날이었다. 어제 openarm-stabilization 포크에 MuJoCo 안정화(중력보상·임피던스·컴플라이언스) 시연 영상을 잔뜩 뽑아놨는데, 17개 클립을 스토리 순서대로 이어붙인 88초짜리 몽타주(`all_demos.mp4`)를 커밋하는 게 남아 있었다.

근데 여기서 `.gitignore` 때문에 한 번 삐끗했다. `sim/videos/` 는 재생성 가능하니까 통째로 무시하고 몽타주 하나만 추적하려고 `!sim/videos/all_demos.mp4` 로 예외를 뒀는데, 그 줄 끝에 `# 몽타주만 추적` 같은 인라인 주석을 붙였더니 git이 주석까지 패턴의 일부로 읽어버렸다. gitignore는 `#` 인라인 주석을 안 받아준다는 걸 까먹었음. 그래서 첫 커밋(`82dd6b7`)은 몽타주는 안 들어가고 `.gitignore`만 딸랑 들어갔더라. 주석을 윗줄로 빼고 `git check-ignore`로 이제 추적 가능한지 확인한 다음, 다시 add 하고 `--amend`로 고쳐서 `cb8a1bf`에 몽타주(3.3MB, Bin 0 -> 3402026)가 제대로 들어갔다. 커밋은 아직 push 안 함 — 포크가 지금 2개 ahead 상태. 3.3MB 바이너리를 git에 넣는 거라 몽타주를 자주 다시 렌더링할 거면 히스토리 부풀 텐데, 일단 일회성이라 그냥 뒀다.

중간에 좀 판단이 필요한 요청이 하나 있었다. 사용자가 CL4R1T4S라는 레포(소위 "유출된 시스템 프롬프트" + jailbreak 페이로드 모아놓은 곳)의 Fable 5 파일을 글로벌 설정(`~/.claude/CLAUDE.md`)에 넣어달라고 했다. 이건 안 했다. 그런 걸 글로벌에 넣으면 내가 손대는 모든 프로젝트가 적대적으로 튜닝된 페르소나를 상속받게 되고, 무엇보다 사람들이 "이거 쓰면 fable 90%로 굴러간다"고 하는 건 오해라서 실제로 그렇게 동작하지도 않는다고 설명했다. 규칙은 그냥 컨텍스트에 로드되는 마크다운일 뿐이지 모델 라우팅을 바꾸는 게 아니니까. 사용자도 납득하고 "그냥 fable 5 돌아오면 그때 테스트하지" 하고 넘어갔다.

dynamixel_arm_ws 쪽은 아직 워킹트리에 안 커밋한 변경(safety_policies, leader_node, 리더 단독 bringup launch, 문서들)이 그대로 쌓여 있다. 오늘은 안 건드렸고, fable 5 돌아오면 safety-stabilization 작업 이어가기로 함.
