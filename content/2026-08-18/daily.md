---
date: 2026-08-18
---

# 외장 모니터 스케일 삽질 + KTX 예약 + digest 자동화

오늘 오전에 외장 모니터 크기 줄이려다 한 시간 날렸다. `xrandr --output DP-1 --scale`이 조용히 씹혀서 왜 안 되나 했더니 출력 이름이 `DP-1-0`이었다 — dock/adapter가 DisplayPort MST로 실어 나르는 구조라 그렇다. 이름 잡고 나서 3x3 때렸더니 화면이 까맣게 꺼졌다. scaler 한계인 줄 알았는데 커널 로그 보니 `Failed to get link status / Sending link address failed with -5` — MST link가 끊긴 거였다. 진단 틀렸다고 바로 인정하고 `xrandr --output DP-1-0 --off; sleep 3; xrandr --output DP-1-0 --auto ...`로 재연결했다.

X11 GNOME은 per-monitor scale을 아예 못 한다는 것도 이때 알았다. mutter가 전역 scale 하나만 쓰기 때문에 `~/.local/bin/monitor-scale.sh`으로 외장에 xrandr transform만 따로 먹이는 hack을 썼다. 25% (8x)는 framebuffer 상한 16384를 넘어서 xrandr이 `desired size 19200x8640`으로 거부했다. 가로 배치 기준 실제로 걸 수 있는 상한이 6.5x (≈31%)라 거기서 정착했다. Wayland로 가면 per-monitor scale이 되니 `monitors.xml` 수정해두고 다음 로그인 때 "Ubuntu on Wayland" 고르라고 했다.

그 와중에 왼쪽 Alt가 Windows 키로 잡히는 문제도 들어왔다. Apple Aluminium 키보드 + F108Pro 동글이 `hid-apple` 드라이버로 물려 있어서 Mac 모드(`swap_opt_cmd=0`)였던 것. xkb 설정 문제가 아니라 드라이버 문제였다.

오전 11시쯤에 KTX 예약 요청이 들어왔다. 금요일(8/21) 서울→광주송정 19~21시가 전부 매진이라 예약을 못 했다. 일요일(8/23) 광주송정→광명은 예약대기 접수 완료 — 예약번호 `320260851586883`, KTX 432, 44,900원. 금요일 취소표 감시는 `~/.local/share/ktx-watch/watch.py`로 짜서 백그라운드로 띄웠다. 서울역 1순위, 용산 2순위로 5분 간격 폴링, 기존 ntfy topic `joey-srt-k4m9xq7v`에 붙였다.

오후에는 Dynamixel 리더암 강의 준비 코드 리뷰를 했다. 리더암 설명 첫 문장을 "각도 측정기입니다"로 정했다. deadband가 떨림을 잡았다고 처음에 말했다가 git log 뒤지다 틀렸다고 정정했다 — deadband 커밋(`5cb1297`, 7/28)은 POS_VEL 시절 수리였고, 지금 떨림이 없는 건 7/30에 MIT 모드로 바뀐 덕분이다. 코드 주석 그대로 옮긴 게 문제였다. `docs/manual-dynamixel.md` 5곳이 `~/Dynamixel_OpenArm_V1`을 쓰고 `docs/manual-feetech.md`는 다른 이름을 쓰는 것도 찾아냈다.

저녁 6시에 daily digest 자동화가 첫 실행됐다. `~/.claude/digest/collect.py`가 `~/.claude/projects/*/*.jsonl`에서 오늘치 대화를 긁고, `digest_daily.sh`가 요약을 `~/devlog/digest/2026-08-18.md`에 쓴 다음 `notify.py`가 ntfy에 압축 요약을 보낸다. topic은 `joey-digest-qq1rif9c5y` — 이동 중 폰으로 읽으려고 만든 것. cron은 `0 18 * * *`으로 걸었다.

밤에는 alwaysrec 앱이 "처리 대기 4건"을 보여줘서 들여다봤다. USB 디버깅 미승인으로 adb가 `unauthorized`로 튕겼고, 승인받고 나서 `dumpsys jobscheduler`를 뒤졌더니 upload job 143이 `30초 × 2⁸ = 7680초` backoff에 갇혀 있었다. 다음 시도까지 1시간 25분 남은 상태. 강제 실행도 "executing before schedule"로 튕겼다. 해결책은 `drainPending()` 함수 신규 추가 — TDD로 RED 확인(`Unresolved reference 'drainPending'`)하고 구현해서 GREEN, 61개 테스트 통과. udev 규칙(`/etc/udev/rules.d/51-android.rules`) 추가해서 권한 잡고 APK(versionCode 11, `1.8.1-drain`) 설치 완료. health job 147이 19:29에 뜨면 `kick()` → REPLACE → 업로드 흘러야 하는데, 그걸 기다리는 중에 세션 끝났다.
