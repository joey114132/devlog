---
date: 2026-08-13
---

# Isaac Sim 첫 삽

오늘은 Isaac Sim 설치에 거의 하루를 썼다. 강의 자료(`강좌 01 - IsaacSim & IsaacLab 환경 설정.html`, PDF 버전도 있었음)를 훑고 그대로 따라가도 되는지 먼저 검증했다. gcc-11이 Ubuntu 24.04 noble-updates에 실제로 있는지, IsaacLab v2.3.2 태그가 실존하는지, PinkWink 튜토리얼 저장소가 살아있는지 — 전부 통과. 근데 디스크가 문제였다. Isaac Sim 50GB 최소 요건인데 여유가 37GB밖에 없었음.

pip cache purge 하나로 26GB가 날아갔다. 6,293개 파일. conda clean 2.5GB 더. 37G → 63G. Docker 이미지도 정리했다 — `physical-ai-repo-2-cosyvoice:latest`(39.4GB), `zonos-zonos:latest`(29.1GB). 둘 다 컨테이너 없는 미사용이고 Dockerfile이 로컬에 있어서 재빌드 가능. `shoppinkki_mysql`은 DB가 살아 있어서 안 건드렸다.

근데 63G 확보했다 싶었더니 갑자기 3.3G로 뚝 떨어졌다. 당황했는데 알고 보니 사용자가 그 사이 다른 터미널에서 Isaac Sim 설치를 이미 시작하고 있었던 거다. `~/isaac/env_isaaclab`이 60GB를 빨아먹고 있었음. docker rmi 두 개가 아슬아슬하게 구조해준 셈이었다.

`OMNI_KIT_ACCEPT_EULA=YES` 설정하고 `./isaaclab.sh -i` 돌렸다. 스모크 테스트(`create_empty.py --headless`)를 백그라운드로 돌렸는데 3분 만에 종료됐고, GPU PCI-e 링크 폭 확인(부하 중 x16), PinkWink `isaacsim_tutorials` 클론(`~/isaac/isaacsim_tutorials`, 36개 강좌 폴더)도 했다.

오전에는 홈 디렉터리에 빈 `.git` repo가 붙어있는 것도 발견해서 scratchpad으로 옮기고(`/tmp/.../home-dotgit-backup`) `git@github.com:PinkWink/isaacsim_tutorials.git` 클론하는 별도 작업도 있었다.

매뉴얼도 만들었다. 처음에 `.md`로 썼다가 "스킬 써서 만들어"라고 해서 `korean-manual` 스킬로 다시 작성했다. 파일은 `~/isaac/manual/isaac-sim-manual.md`. `check.py` 돌리고 PDF로 빌드해서 쪽 경계까지 검사했다.

STL 쪽은 `~/Downloads/feetech/` 30개 파일 정리. md5 해시 전수 확인했더니 완전 중복은 0개였다. 최신/구버전 분리해서 `v2/`(21개)·`v1/`(9개) 폴더 구조로 바꾸고 파일명에서 v1/v2 표기는 제거했다.

Dynamixel 조립 가이드 쪽에서는 사진 208장을 단계별로 배분했다. j1_link 3D 렌더링 Y축이 −30°로 맞았고, 나사 체결 정보(m2·m3·와셔 나사 구별) 추가랑 표시 원 그리는 작업도 계속 이어졌다.
