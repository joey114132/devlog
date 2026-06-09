---
date: 2026-06-09
project: pingdergarten
tags: devlog, ncnn, cnn, yolo, onnx, edge-inference
---

## Daily Scrum

### 어제 한 일
- ROS 2 howto에 Tab 자동완성 §4.5 추가

### 오늘 할 일
- **ncnn vs CNN** 헷갈리는 지점 정리 (팀/로봇 배포 맥락)

### 공유할 거
- 지금 perception은 `yolov8n.pt` + **CUDA** (`gogoping_perception/config.py`)
- 웹 wakeword는 **ONNX** (`robot-web/public/models/wakeword/*.onnx`)
- ncnn은 repo에 아직 안 붙였지만 Ultralytics export 경로는 있음

---

# ncnn vs CNN — 이름부터 분리하기

처음에 나도 "ncnn이랑 CNN 중에 뭐 쓸까?" 이렇게 말했는데, 사실 **같은 층위 비교가 아님**.

- **CNN (Convolutional Neural Network)** = **모델 구조/학습 패러다임**. YOLO도 ResNet도 결국 CNN 계열.
- **ncnn** = Tencent 만든 **추론(inference) 런타임**. 이미 학습된 CNN(또는 변환된 그래프)을 **폰·임베디드 CPU**에서 돌리게 해 주는 **엔진**.

비유하면: CNN = 레시피, PyTorch = 주방에서 연습하는 도구, ncnn = 도시락 통에 넣어 현장에서 데워 먹는 **휴대용 버너**.

---

## 1. 우리 파이프라인에서 CNN이 나오는 곳

| 단계 | 뭐 쓰는지 | 우리 repo |
| --- | --- | --- |
| 학습·튜닝 | PyTorch / Ultralytics YOLO | `yolov8n.pt`, gogoping perception |
| ROS 실시간 추론 | `.pt` + ultralytics, **GPU** | `YoloRunner`, `YOLO_DEVICE = "cuda:0"` |
| Wakeword (브라우저) | **ONNX** | `eduping.onnx`, `gogoping.onnx` … |
| 실험용 ONNX export | onnx 파일들 | `~/onnxExtraction_robot/models/` |

`config.py`에 적어 둔 것처럼, **YOLO를 CPU PyTorch로 돌리면** yolov8n@640도 **~1.3s/frame (0.8fps)** 근처라 follow/proximity가 사실상 망가짐. 그래서 지금은 GPU 고정.

CNN 자체가 느린 게 아니라, **어떤 런타임·어디서 돌리느냐**가 문제.

---

## 2. ncnn이 뭘 해 주는지

ncnn은 모델을 **`model.ncnn.param` + `model.ncnn.bin`** 으로 떨구고, C++ / Android / Raspberry Pi 쪽에서 **PyTorch 없이** forward만 함.

특징:

- **ARM CPU**에 맞춘 연산 커널 (Vulkan 옵션도 있음)
- 런타임 의존성 가벼움 — 로봇 보드·앱에 실을 때 유리
- 학습은 안 함. **변환 → 배포** 전용

Ultralytics 쪽은 대략:

```bash
yolo export model=yolov8n.pt format=ncnn imgsz=640
# → yolov8n_ncnn_model/ 디렉터리 (param, bin, …)
```

(`pdg` conda env에 ultralytics ncnn export 경로 있음 — 아직 gogoping perception에는 미연결.)

---

## 3. CNN “그냥” vs ncnn — 비교表

| | PyTorch `.pt` (CNN 그대로) | ONNX Runtime | ncnn |
| --- | --- | --- | --- |
| **정체** | 학습 + 추론 프레임워크 | 중간 교환 + 범용 추론 | 경량 추론 전용 |
| **어디서** | 노트북, GPU 서버, ROS 노드 | 서버, WASM, 일부 엣지 | 모바일, 임베디드, CPU 엣지 |
| **속도 (CPU)** | 보통 느림 (우리 측정 ~0.8fps) | 중간 | 상대적으로 빠른 편 |
| **속도 (GPU)** | CUDA 최적 | CUDA EP 가능 | GPU는 Vulkan 등 — 케이스별 |
| **우리 사용** | gogoping YOLO **현재** | wakeword | **아직 미도입** |

**ONNX vs ncnn:** 둘 다 “배포용”. ONNX는 생태계 넓고 브라우저·ONNX Runtime·TensorRT로 이어지기 쉬움. ncnn은 **CPU 엣지에 박아 넣기**에 더 특화된 느낌.

---

## 4. 언제 뭘 고르면 되는지 (내 기준)

**CNN + PyTorch (.pt)**  
- 아직 가중치 바꾸고, `track()`, MediaPipe 후처리 붙이고, ROS에서 디버깅할 때.  
- **GPU 있는 Jetson/노트북** — 지금 gogoping perception.

**ONNX**  
- 브라우저·크로스 플랫폼, wakeword처럼 **작은 모델** 여러 개.  
- TensorRT / ORT로 서버 GPU 가속도 같은 파일에서 갈림.

**ncnn**  
- **GPU 없거나**, PyTorch 올리기 싫은 **보드 CPU only**.  
- 앱(APK) / 임베디드에 YOLO person detector만 얇게 실을 때 후보.  
- 대신 export·전처리·후처리(ByteTrack, Pose)는 **직접 C++/Python glue** 필요 — ROS 노드 전체가 자동으로 ncnn으로 바뀌진 않음.

---

## 5. pingdergarten / gogoping에 대입

현재 perception 노드는:

```
카메라 → YoloRunner (.pt, CUDA) → ByteTrack → (Pose) → ReID → ROS topic
```

ncnn으로 가려면 **YOLO forward 한 덩어리만** ncnn으로 바꾸는 그림이 현실적:

```
카메라 → ncnn YOLO → bbox numpy → (기존 Python tracker/pose 그대로)
```

또는 보드가 너무 약하면 **person detector만 ncnn**, 나머지는 x86 edge에서 처리.

Wakeword는 이미 ONNX로 갈라져 있어서 ncnn과 경쟁 관계라기보다 **역할이 다름** (음성 vs vision).

---

## 6. 아직 안 해본 것 / 다음에 해볼 것

- [ ] `yolov8n.pt` → ncnn export 후 **Jetson CPU vs GPU vs ncnn CPU** fps 한 줄 비교
- [ ] gogoping perception에 ncnn backend 붙일지 — Ultralytics `NCNNBackend` 참고
- [ ] `onnxExtraction_robot` wakeword ONNX랑 ncnn 변환 난이도 비교 (작은 MLP/CNN이면 둘 다 가벼움)

지금 단계에선 **학습·디버그는 CNN+PyTorch**, **브라우저는 ONNX**, **CPU-only 보드가 생기면 ncnn 후보** — 이렇게 기억하면 됨.

---

## 7. 한 줄 정리

**CNN**은 “무슨 네트워크냐”, **ncnn**은 “그 네트워크를 어디서 어떻게 돌리냐”. ncnn vs CNN이 아니라 **ncnn vs PyTorch/ONNX Runtime** 질문에 가깝고, 우리는 아직 ROS perception은 전자(GPU PyTorch), wakeword는 ONNX 쪽.
