---
date: 2026-06-09
project: ros2
tags: devlog, ros2, colcon, tutorial
---

## Daily Scrum

### 어제 한 일
- devlog 에디터 writing toolbox (H2/H3, bold, list, link, table…)

### 오늘 할 일
- ROS 2 패키지 직접 만드는 방법 정리 (내 repo 기준)

### 공유할 거
- 예시 패키지: `eduping_stethoscope`, `gogoping_msgs`
- 워크스페이스: `physical-ai-repo-2/controller/*/src/`

---

# ROS 2 패키지 직접 만드는 법 (내 기준)

Addinedu / pingdergarten 하면서 처음엔 남이 만든 패키지만 `colcon build` 했는데, **센서 브릿지·커스텀 msg** 쓰려면 결국 내 패키지를 하나 파야 함. ROS 1 `catkin_create_pkg` 말고 **ROS 2 + colcon + ament** 기준으로 정리.

---

## 0. 머릿속 그림

```
my_ws/
  src/
    my_robot_bringup/     ← launch 모음 (선택)
    my_robot_msgs/        ← .msg / .srv (인터페이스만)
    my_sensor_bridge/     ← rclpy 노드 (Python)
  build/ install/ log/    ← colcon이 만듦 (git에 넣지 말 것)
```

- **워크스페이스** = `src` 아래 여러 패키지 묶음
- **패키지** = `package.xml` + `setup.py`(Python) 또는 `CMakeLists.txt`(C++/msg) 한 덩어리
- 빌드 후 **`source install/setup.bash`** 안 하면 `ros2 run`이 패키지를 못 찾음

내 repo에서는 `eduping-controller/src/`, `gogoping-controller/src/` 가 각각 워크스페이스 `src` 역할.

---

## 1. 패키지 종류부터 고르기

| 만들려는 것 | build type | 명령 예 |
| --- | --- | --- |
| Python 노드 (센서, 브릿지, 상태머신) | `ament_python` | `ros2 pkg create --build-type ament_python my_pkg` |
| C++ 노드 / 플러그인 | `ament_cmake` | `ros2 pkg create --build-type ament_cmake my_pkg` |
| `.msg` / `.srv` / `.action` 정의만 | `ament_cmake` + `rosidl` | `--build-type ament_cmake`, CMake에서 `rosidl_generate_interfaces` |

**규칙:** msg 패키지랑 노드 패키지는 **분리**하는 게 편함. `gogoping_msgs` → 다른 패키지가 `depend`로 가져다 씀.

---

## 2. Python 패키지 — `eduping_stethoscope` 따라하기

실제로 EduPing에서 FSR 청진기 시리얼 → ROS topic 올릴 때 만든 패키지.

### 2.1 생성

```bash
cd ~/my_ws/src
ros2 pkg create eduping_stethoscope --build-type ament_python --dependencies rclpy std_msgs
```

생성되면 대략:

```
eduping_stethoscope/
  package.xml
  setup.py
  setup.cfg
  resource/eduping_stethoscope
  eduping_stethoscope/          # Python 패키지 (언더스코어 = import 이름)
    __init__.py
  test/
```

### 2.2 `package.xml` — 의존성 선언

```xml
<depend>rclpy</depend>
<depend>std_msgs</depend>
<depend>pyserial</depend>   <!-- pip 의존은 setup.py에도 -->

<export>
  <build_type>ament_python</build_type>
</export>
```

### 2.3 `setup.py` — **가장 자주 틀리는 부분**

1. **`entry_points`** → `ros2 run` 이름
2. **`data_files`** → launch / config / yaml 을 `share/`에 설치

```python
entry_points={
    'console_scripts': [
        'fsr_bridge_node=eduping_stethoscope.fsr_bridge_node:main',
    ],
},
data_files=[
    ('share/ament_index/resource_index/packages', ['resource/eduping_stethoscope']),
    ('share/eduping_stethoscope', ['package.xml']),
    ('share/eduping_stethoscope/launch', glob.glob('launch/*launch.*')),
    ('share/eduping_stethoscope/config', glob.glob('config/*.yaml')),
],
```

`console_scripts` 왼쪽 문자열 = executable 이름 (`ros2 run eduping_stethoscope fsr_bridge_node`).

### 2.4 노드 코드 최소 골격

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import Int32

class MyNode(Node):
    def __init__(self):
        super().__init__('my_node')
        self.declare_parameter('rate_hz', 10.0)
        self._pub = self.create_publisher(Int32, '/my/topic', 10)
        self.create_timer(1.0 / self.get_parameter('rate_hz').value, self._tick)

    def _tick(self):
        msg = Int32()
        msg.data = 42
        self._pub.publish(msg)

def main():
    rclpy.init()
    node = MyNode()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

`eduping_stethoscope`는 여기에 **시리얼 스레드**, `fake:=true` 파라미터(하드웨어 없이 UI 테스트)까지 붙여 둠.

### 2.5 launch (선택이지만 실전에선 거의 필수)

`launch/my.launch.py`:

```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='eduping_stethoscope',
            executable='fsr_bridge_node',
            name='fsr_bridge_node',
            output='screen',
            parameters=[{'fake': True}],
        ),
    ])
```

실행:

```bash
ros2 launch eduping_stethoscope stethoscope.launch.py fake:=true
```

---

## 3. 메시지 패키지 — `gogoping_msgs` 따라하기

팀 전용 topic/service 타입 필요할 때.

### 3.1 생성 & package.xml

```bash
ros2 pkg create gogoping_msgs --build-type ament_cmake
```

`package.xml` 핵심:

```xml
<buildtool_depend>ament_cmake</buildtool_depend>
<buildtool_depend>rosidl_default_generators</buildtool_depend>
<exec_depend>rosidl_default_runtime</exec_depend>
<member_of_group>rosidl_interface_packages</member_of_group>
<depend>std_msgs</depend>
<depend>geometry_msgs</depend>
```

### 3.2 `CMakeLists.txt`

```cmake
find_package(rosidl_default_generators REQUIRED)
rosidl_generate_interfaces(${PROJECT_NAME}
  "msg/Goal.msg"
  "srv/SetGoal.srv"
  "action/NavigateToVertex.action"
  DEPENDENCIES std_msgs geometry_msgs builtin_interfaces
)
ament_package()
```

`.msg` 파일 예 (`msg/Goal.msg`):

```
string name
geometry_msgs/PoseStamped pose
```

### 3.3 사용하는 쪽

Python 노드 패키지 `package.xml`에:

```xml
<depend>gogoping_msgs</depend>
```

Python 코드:

```python
from gogoping_msgs.msg import Goal
```

**msg 바꾸면 반드시 다시 `colcon build`** — 안 하면 import 에러 / 타입 불일치.

---

## 4. 빌드 · 실행 루틴 (zsh)

```zsh
cd ~/my_ws
set +u
source /opt/ros/jazzy/setup.zsh   # 배포판에 맞게 humble/jazzy
set -u

colcon build --symlink-install --packages-select eduping_stethoscope
# 또는 전체: colcon build --symlink-install

set +u
source install/setup.zsh
set -u

ros2 pkg list | grep eduping
ros2 run eduping_stethoscope fsr_bridge_node --ros-args -p fake:=true
ros2 topic echo /eduping/stethoscope/fsr_raw
```

`--symlink-install` → Python 수정 후 rebuild 없이 바로 반영되는 경우 많음 (launch/yaml도 편함).

---

## 5. 패키지 이름 짓기 (우리 팀 패턴)

| 접미사 | 역할 | 예 |
| --- | --- | --- |
| `_msgs` | msg/srv/action | `gogoping_msgs` |
| `_bringup` | launch + param 한방 | `gogoping_bringup`, `openarm_bringup` |
| `_description` | URDF/mesh | `openarm_description` |
| `_navigation` | Nav2 래퍼 | `gogoping_navigation` |
| (기능명) | 단일 기능 노드 | `eduping_stethoscope`, `eduarm` |

처음부터 `_bringup`까지 만들 필요 없음. **노드 하나 + launch 하나**로 시작해도 됨.

---

## 6. 자주 막히는 것

1. **`ros2 run`에 패키지 없음** → `source install/setup.zsh` 안 함 / 다른 터미널
2. **launch 파일 못 찾음** → `setup.py`의 `data_files`에 launch 경로 빠짐
3. **msg import 실패** → interface 패키지 build 안 함, 또는 depend 누락
4. **토픽은 있는데 타입 안 맞음** → `ros2 topic info /topic`으로 타입 확인
5. **udev / serial** → ROS 문제가 아니라 `/dev/ttyACM0` 권한·포트; `eduping_stethoscope`는 `/dev/eduping_stetho` udev 심볼릭 씀
6. **워크스페이스 안에 vendor repo** → `COLCON_IGNORE` 또는 `--packages-up-to` 로 내 패키지만 빌드

---

## 7. 최소 체크리스트 (새 패키지 만들 때)

1. `ros2 pkg create …` 로 뼈대
2. `package.xml` depend 정리
3. Python: `setup.py` entry_points + data_files
4. 노드 하나 + `main()` + `rclpy.spin`
5. `colcon build --packages-select …` → `source install/setup.zsh`
6. `ros2 run …` / `ros2 topic list` 로 확인
7. 필요하면 launch + yaml params
8. msg 필요해지면 **별도 `_msgs` 패키지**로 분리

---

## 8. 내 repo에서 보면 좋은 참고

| 패키지 | 경로 | 볼 것 |
| --- | --- | --- |
| `eduping_stethoscope` | `controller/eduping-controller/src/eduping_stethoscope/` | Python 노드, launch, params, fake mode |
| `gogoping_msgs` | `controller/gogoping-controller/src/gogoping/gogoping_msgs/` | msg/srv/action + CMakeLists |
| `gogoping_bringup` | 같은 트리 | 여러 노드 launch 묶기 |

ROS 1 경험만 있으면 “CMakeLists 지옥”이 무섭지만, **Python 브릿지 + msg 분리**만 익혀도 팀 프로젝트의 80%는 직접 패키지 만들 수 있음.
