---
date: 2026-06-19
project: pingdergarten
tags: [pingdergarten, can, devlog]
---

# CAN 용어 더 물어보고 devlog만

어제 쓴 `robot-arm-can-basics-ko.md` 이어서 채팅으로만 더 파고들었다. CAN을 왜 쓰는지(우리가 골랐다기보다 OpenArm·DAMIAO가 CAN-FD라는 점), NoriArm Dynamixel·GogoPing Modbus·HTTP·ROS 같은 다른 통신이랑 층이 어떻게 다른지 다시 설명해 달라고 해서 정리해 줬다. CAN 2.0이랑 CAN-FD, SocketCAN이 헷갈린다고 해서 초보자 톤으로 풀어줬는데 — 버스 규칙 vs 리눅스 `can0` 인터페이스 vs MIT 모드 구분 — 아직 md에는 안 넣었다.

코드 수정이나 실물 `can0` 테스트는 오늘 안 함. 머신은 `sudo apt update && upgrade` 한 번 돌렸다. 어제 devlog append가 첫 sync에 안 잡혀서 한 번 더 push 했던 건 6/18 쪽이고, 오늘은 `/devlog`로 6/19 일지 새로 남기는 중.
