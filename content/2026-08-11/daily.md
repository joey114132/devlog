---
date: 2026-08-11
---

# 강의 매뉴얼 하루 종일

오늘은 Dynamixel_leader_lecture 교육자료를 하루 종일 손봤다. 두 판(feetech/dynamixel)이 별도로 있어서 같이 돌아가면서 고쳤다.

가장 먼저 한 건 feetech 판 음성 피드백 반영이다. 오전 10:57에 녹음해 둔 m4a 파일이 있었는데, whisper로 받아쓰기를 돌렸더니 23분짜리 210개 발화가 나왔다. GPU 돌려서 한 번에 뽑았다. 피드백 내용이 꽤 많아서 정리하고 반영하는 데 시간이 걸렸다.

주로 구조 문제였다. 소개·매뉴얼 사용법·진행 체크리스트·Visualization·부록 섹션을 전부 없애고, 구성품 표를 맨 앞으로 올렸다. 리드암 표기도 전부 "리더암"으로 통일했다. `deux_leader_teleop/wiki/lerobot-record-dynamixel.md`가 소스라서 거기서 편집하고 `sync_lecture_repo.py`로 빌드했다.

세부 수정은 꽤 많았다. Python 버전 기대 출력을 `Python 3.12.3`에서 `Python 3.12.x`로 바꿨고, 포트 확인 명령을 `ls /dev/serial/by-id/`에서 `ls -l /dev/ttyACM*`으로 교체했다. 케이블 장착 사진 4장은 방향이 제각각이었는데 아래서 위로 꽂는 구도로 통일했다. calibration 절도 LeRobot 소스(`openarm_mini.py`) 직접 확인해서 실제 프롬프트 문자열로 다시 썼다. 시연 영상은 Prismic CDN에 올리고 URL로 링크를 걸었다.

오후에는 dynamixel 판 쪽도 손봤다. 2-2-4. 서보 연결 확인 절에서:

- 시스템 python 설치 경고 블록 삭제
- 서보 번호 부여 절차에 육각렌치 사진(`fee-motor-hex.jpg`) 추가 — PIL로 스크래치 스크립트 만들어서 나사에 빨간 동그라미 그려 넣었음
- 정상 동작 영상 링크 → 실제 원격 조종 사진으로 교체

PDF 인쇄 레이아웃 버그도 잡았다. h3 절이 페이지 경계에서 잘리는 문제가 있어서 `<section>` 블록으로 감싸고 `page-break-inside: avoid`를 적용했다. h1도 쪽 끝에 걸리던 게 있어서 `page-break-before: always`로 처리했다.

가로 왜곡 버그도 하나 나왔다. 시작 자세 사진을 2배 확대했더니 가로로 쭉 늘어났다. 원인은 `figure img`에 `height: auto`만 있고 `width: auto`가 없어서였다. `max-height`가 높이를 깎아도 `width="960"` 속성값은 그대로 남아서 가로로 퍼진 것. 한 줄 추가로 고쳤다.

새 venv 만들어서 매뉴얼 명령 전체를 처음부터 돌려봤다. `~/venv/openarm_v1_check`에 LeRobot 0.5.2 소스 설치하고 `verify_lecture_commands.py --venv ~/venv/openarm_v1_check`로 42/42 PASS 확인. 검증 끝나고 바로 지웠다(6GB 회수).

저녁에는 korean-report-skills 플러그인을 설치했다. `github.com/JangHyun-bin/korean-report-skills`를 user scope로 전역 등록하고 빌드 deps도 다 챙겼다 — katex는 `~/node_modules`에, playwright 1.62.0과 chromium은 user site-packages에. 테스트 보고서를 실측 데이터로 뽑아서 `~/korean-report-test/`에 저장해 뒀다. QA exit 0.
