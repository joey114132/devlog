---
date: 2026-08-05
---

# robotics skills 공개 + SRT 취소표 사냥 + torchcodec 수정

오늘 제일 많이 한 건 robotics skill 4종 만들어서 GitHub에 올린 것. `robotics-advisor`, `ros2-master`, `robot-arm`, `robot-hand`를 죄 제작하고 `joey114132/claude-robotics-skills`로 public push했다. eval 돌렸더니 with-skill 100% vs baseline 83.8%, delta +16pp — 생각보다 차이가 뚜렷하게 났다.

근데 여기서 한번 혼났음. README에 clone+symlink 설치법을 써뒀더니 "왜 plugin marketplace 안 씀?" 지적이 들어왔다. `.claude-plugin/marketplace.json` + `plugin.json` 구조로 바꾸고 memory에도 박아뒀다. PDF 언급도 다 빼고 README 뜯어고쳤다.

점심 지나면서부터 SRT 예매 쪽으로 방향이 바뀌었다. 판교→광주송정 달라는 요청인데 판교엔 SRT가 안 서서 수서로 잡았다. 08/07(금) 저녁 전 편이 이미 매진이라 취소표 감시 스크립트 짰다 — `srt_watch.py`, SRT 615/665/617 60초 간격 감시.

문제가 생겼음. 13:32에 watcher가 스스로 죽었다. 원인 파보니 `SRTNetFunnelError`가 `SRTError` 하위 클래스가 아니어서 재로그인 branch를 안 타고 실패를 계속 쌓다가 10분 연속으로 죽어버린 것. `SRTNetFunnelError` 전용 handler 추가하고, NetFunnel 캐시 `_cached_key` 만료 시 재요청하도록 수정. backoff도 120초 → 60초대로 줄였다.

오후에는 LeRobot쪽. `dp3_lerobot.py`가 이미 녹화 → 데이터셋 쓰기까지 다 있는데 재생이 안 됐다. `lerobot-dataset-viz` 돌리면 `torchvision.io.VideoReader` 호출로 깨지는 것 — torchvision 0.26에서 삭제된 API라 `torchcodec` 폴백이 없으면 그냥 죽는다. `torchcodec` 설치하니까 `.rrd` 21.3MB 생성되고 Rerun 재생 됐다. 녹화→LeRobot 데이터셋→Rerun 전 구간 통과.

하드웨어도 건드렸다. Dynamixel 리더암 16서보 `Return_Delay_Time`이 7ms씩 박혀 있어서 0으로 다 썼다. 100Hz teleop에서 물림 원인이었는데 `leader_safety_setup.py`에 기능 추가해서 처리. EEPROM 재확인으로 유지됨 확인.

노트북 화면 꺼짐 건도 오전에 해결했다. X screensaver가 범인 — GNOME 설정의 blank screen이랑 완전 별개 장치라 설정에서 Never 놔도 꺼졌던 것. `xset s off` + `~/.config/autostart/disable-x-screensaver.desktop`으로 고정했다. 급사 대비용 온도 로거도 설치: `~/.local/bin/thermal-watch.sh` + `~/.config/systemd/user/thermal-watch.service`, 30초마다 thermal zone·AC·배터리·load 기록 확인.

`deux_gravity_impedance`, `deux_vr` 레포 신규 생성도 했고, VR teleop 추종 오차 509mm → 92mm (5.5배 개선)도 있었다. 하루가 꽤 길었음.
