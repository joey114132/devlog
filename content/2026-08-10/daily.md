---
date: 2026-08-10
---

# 강의 매뉴얼 전면 개편 + open-arms-mini 조립 매뉴얼

오늘은 거의 하루 내내 Dynamixel/Feetech 리더암 강의자료를 뜯어고쳤다.

아침 일찍 pinky-banner 대안 테이크 작업을 먼저 끝냈다. Higgsfield 크레딧이 73.5 남아 있어서 10초 Seedance 렌더를 하나 더 뽑았다(45 크레딧, 잔액 28.5). 첫 프레임과 끝 프레임 MAE가 11.33이라 루프가 안 붙는 문제가 있었는데, c17..c213 구간을 전수 탐색해서 더 나은 내부 루프를 찾았다 — MAE 0.67배, 업스케일 후 0.50배. 빈 화면이 79프레임(40%)이었는데 잘라내서 148프레임 6.17초로 만들었다. 다크 버전은 크레딧 안 쓰고 색 변환으로 처리. `Downloads/pinky-banner/preview.html`에 기존 2개 + 대안 2개 총 4개 비교 가능하게 붙였다.

그 다음은 오전에 `git clone git@github.com:pkooij/open-arms-mini.git` 하고 조립 매뉴얼 작업을 했다. STL/STEP 파일이 42개인데 전부 랜덤한 이름이라 `J<모터ID>_<기능>[_left|_right]` 규칙으로 리네임했다. 부품 렌더 이미지를 만들어야 했는데 matplotlib이 z-buffer 없어서 면이 서로 뚫리는 문제가 있었다. 그냥 직접 orthographic z-buffer rasterizer를 짰다(`tools/render_parts.py`). `images/parts/` 에 PNG 31개, `ASSEMBLY.md`(영문)와 `ASSEMBLY.ko.md`(한국어) 두 버전 다 만들었다. README에도 링크 걸었다.

오후의 대부분은 `deux_leader_teleop` 강의 자료 작업이었다. 정우님 피드백이 "강의자료 느낌 아니라 매뉴얼 느낌으로, roboseasy.ai 참고" 였다. roboseasy.ai/docs 벤치마킹하니 사이드바 구조(Setup → Start → Dataset → 부록)랑 한다체·개조식·두괄식이 포인트였다. `docs/manual-dynamixel.md` 726줄 전체를 그 톤으로 전환했고(780줄), feetech 판 별도로도 만들었다.

PinkLAB 강의 자료 `05. OpenArms Mini 세팅` 에 feetech 리더암 사진이 이미 12장 있었다 — 우리가 파는 것과 같은 물건이어서 다시 찍을 필요가 없었다. 여기서 5장을 추출해서 feetech 1강 덱에 붙였다(36→39→40장).

슬라이드 사진도 계속 추가했다. Confluence `pinkwink.atlassian.net`의 Dynamixel 리더암 페이지에서 관절 이름표와 리드암 사진 2장 추출, OpenARM 강의자료에서 PCAN-USB Pro FD 실물 사진과 배선도 이미지 추출. 준비물에 PCAN-USB Pro FD가 2CH CANFD라 한 장이 can0·can1을 담당한다는 것도 정정했다. 슬라이드 1강이 44→46→49장까지 늘었다.

`Dynamixel_leader_lecture` 저장소를 private으로 돌렸다. 공개 상태로 약 1시간 20분 있었는데 비밀정보 스캔 결과 0건이라 실질적 문제는 없었다. 배포 방식도 git clone(1.1GB)에서 zip 배포(29KB, `dynamixel_code.zip`)로 바꿨다 — 학생이 실제로 쓰는 건 plugin/과 scripts/ 두 폴더뿐이라 clone 자체가 필요 없었다.

촬영 목록도 조립 전제를 걷어냈다. 제품이 조립된 채로 나가는 거라 "조립하는 법"이 아닌 "정상 상태 대조용"으로 성격을 바꾸니 11장→9장으로 줄었다.

`deux_leader_teleop`에서 작업하고 `sync_lecture_repo.py`로 교육용 저장소에 올리는 구조를 계속 유지했다. 최종 배포물: dynamixel/feetech 각 0~3강 PDF 8개 + dynamixel_code.zip 29K.
