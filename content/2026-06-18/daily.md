---
date: 2026-06-18
project: smart-farm, game-portfolio
tags: [smart-farm, jetcobot, pinky-pro, portfolio, prismic]
---

# 게임 포트폴리오 클론하고 스마트팜 데모까지

오늘은 여러 갈래로 돌아갔다. 게임 포트폴리오 쪽부터 — `joey114132/Portfolio`를 `~/game-portfolio`에 클론했고, 프로필 사진을 Prismic CDN으로 올려서 히어로에 붙였다. 처음엔 `profile_id.jpg`였는데 나중에 `/home/joey/Downloads/이정우_증명사진.jpg`로 다시 올리고 About 섹션에 있던 두 번째 프로필 이미지는 빼서 히어로 하나만 남겼다. 첫 CDN 교체는 push까지 했고, 증명사진 버전도 레이아웃 손보면서 정리해 둠.

스마트팜이 오늘 메인이었다. `smart_farm_map_layout.png` 보고 `~/smart-farm-demo`를 새로 만들었다. JetCobot은 `jetcobot_ros2`의 MyCobot 280 Pi URDF, Pinky Pro는 포트폴리오 `pinky.urdf` 메쉬를 symlink로 물렸다. Three.js 3D랑 2D 탑다운 캔버스, 북쪽 프레임 밖 토마토 배드, 수확 사이클 애니메이션까지 넣고 `SMART_FARM.md`로 설명도 썼다.

처음 열었을 때 아무것도 안 나왔는데 원인은 import map에 `three/examples/jsm/`이 빠져서 `urdf-loader`가 통째로 죽은 거였다. 고치고 Playwright로 확인했다. Pinky Pro 경로도 요청대로 JetCobot 작업셀 바로 아래(y≈138cm) 통로로 바꿨다.

GitHub에는 `joey114132/smart-farm-demo`로 public repo 만들고 push했다. symlink는 GitHub에서 안 되니까 DAE 메쉬 ~68MB는 `assets/`에 벤더링해 넣었다. 그 뒤에도 레이아웃·로봇 자세·수확 애니·한국어 `SMART_FARM_KO.md` 같은 걸 더 손봤다.

집에 있는 보드 IP도 `~/.zshrc`에 추가했다. `pinky48` → `192.168.0.46`, `jetco6` → `192.168.6.6`, 둘 다 비번 1. `pinky48`은 SSH까지 `raspi`로 붙는 거 확인했는데 `jetco6`는 ping은 되는데 22번 포트가 막혀 있어서 아직 SSH는 안 됨.

어제 만든 `jetcobot_ros2/smart_farm` ROS 워크스페이스는 오늘 데모 쪽에서 URDF 소스로만 썼고, 실제 Pi에 arm 꽂아서 돌려보진 않았다.
