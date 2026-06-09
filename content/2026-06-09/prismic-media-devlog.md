---
date: 2026-06-09
project: devlog-site
tags: devlog, prismic, media
---

## Daily Scrum

### 어제 한 일
- index 페이지 스크럼을 오른쪽 사이드 레일로 옮기고 타임라인은 왼쪽 컬럼에 고정
- sticky 헤더·progress·맨 위로 버튼·스크럼 테마 색 마무리

### 오늘 할 일
- devlog 본문에 Prismic CDN 이미지·GIF·영상 붙이는 렌더링 추가
- 새 글로 실제 `images.prismic.io/joey` URL이 잘 나오는지 확인
- pingdergarten `.env`에 `PRISMIC_TOKEN` 다시 넣으면 Asset API 업로드도 연결

### 공유할 거
- 로컬: http://127.0.0.1:8780/post.html?id=2026-06-09%2Fprismic-media-devlog
- Prismic repo `joey` CDN은 6월 초 QnA 덱 올릴 때 이미 쓰던 URL 그대로 동작함

---

# Prismic CDN 미디어 devlog에 붙임

오늘은 devlog 글에 **이미지·GIF·영상** 넣을 수 있게 손봤음. Prismic 문서 타입은 아직 없고, 예전에 EduPing QnA HTML 올릴 때 쓴 **`images.prismic.io/joey`** CDN URL만 md에 박으면 됨.

`.env` 열어보니 `PRISMIC_TOKEN` / `PRISMIC_REPOSITORY`는 지금 비어 있어서 **새 업로드는 못 함**. 대신 `~/Desktop/prismic_cdn_urls.tsv`에 URL 맵 있고, 아래는 그중에서 고름.

## 정적 JPG

EduPing 웹 UI 캡처. JPG는 `?auto=format,compress` 쿼리 그대로 둬도 됨.

![EduPing 웹 UI — Prismic CDN JPG](https://images.prismic.io/joey/ah548weQX7-eWhs0_web_eduping_ui.jpg?auto=format,compress)

## GIF (애니메이션)

하이파이브 시뮬 GIF. **GIF는 쿼리 빼야** 프레임이 살아 있음 — 렌더링할 때 JS가 `?auto=format,compress` 자동으로 떼 줌.

![MuJoCo 하이파이브 시뮬 GIF](https://images.prismic.io/joey/ah545AeQX7-eWhsl_hifive_sim.gif)

실기 로봇 GIF도 하나 더.

![실기 하이파이브 GIF](https://images.prismic.io/joey/ah544geQX7-eWhsk_hifive_real.gif)

## 영상 (HTML `<video>`)

`joey` repo에는 아직 mp4가 없어서, **같은 Prismic CDN**에서 팀 repo `minsung`에 올라간 webm으로 `<video>` 렌더만 검증함. 나중에 Asset API로 `joey`에 mp4 올리면 `source src`만 바꾸면 됨.

<figure class="devlog-media-wrap">
  <video class="devlog-media devlog-media--video" controls playsinline preload="metadata" poster="https://images.prismic.io/joey/ah546weQX7-eWhsr_report_ui2.jpg?auto=format,compress">
    <source src="https://images.prismic.io/minsung/aiEf9AeQX7-eWt7u_portal-demo.webm" type="video/webm" />
  </video>
  <figcaption>Prismic CDN webm 예시 (repo minsung). joey에 mp4 업로드 후에는 joey URL로 교체.</figcaption>
</figure>

나중에 `physical-ai-repo-2/scripts/prismic/upload.sh` 쓰려면 루트 `.env`에 토큰·`PRISMIC_REPOSITORY=joey` 채우면 됨. GIF 업로드 후 URL은 **쿼리 없이** md에 붙이기.

## 구현 메모

- `features.js`의 `enhanceMedia()` — lazy load, GIF URL 정규화, `alt` 있으면 `<figure>` + caption
- `style.css` — `.devlog-media` 반응형, 비디오 16:9 박스
- 에디터 미리보기도 같은 `enhanceArticle()` 타게 함

로컬 `:8780`에서 이 글 열어서 이미지·GIF 깨지는지 봤고, CDN HEAD 200 확인함. 새 Asset 업로드는 토큰 없어서 스킵.
