---
date: 2026-06-09
project: pingdergarten
tags: devlog, vercel, presentation
---

## Daily Scrum

### 어제 한 일
- devlog 에디터 본문 라이브 미리보기·미디어 삭제 UI
- devlog-site `main` push

### 오늘 할 일
- 포트폴리오 4번 프로젝트 덱이 왜 Vercel인지 정리해서 devlog에 남기기

### 공유할 거
- pingdergarten 최종 슬라이드: https://preso-slides-only.vercel.app/
- 포트폴리오 `config.js` → `pingdergartenDeck` 링크

---

# pingdergarten 덱은 왜 Vercel?

애디닝 Physical AI 네 프로젝트 중 **4번(pingdergarten / EduPing)** 덱 URL만 Vercel에 올라가 있음. 로봇 앱 전체가 Vercel에 있는 게 아니라, **Reveal.js 최종 발표 슬라이드**만 `preso-slides-only.vercel.app`에 static으로 서빙하는 구조.

## 네 프로젝트 덱 호스팅이 제각각인 이유

| 순서 | 프로젝트 | 덱 링크 |
| --- | --- | --- |
| 01 Gesto | DL | Google Slides |
| 02 오주의 마법사 | IoT | Prismic CDN (PPTX) |
| 03 ShopPinkki | ROS | Netlify (`shoppinkki-presentation.netlify.app`) |
| 04 pingdergarten | PAI | **Vercel** (`preso-slides-only.vercel.app`) |

팀마다 덱 형식이 달랐음. Gesto는 슬라이드가 Google에, IoT는 PPTX를 Prismic에, ShopPinkki는 HTML 덱을 Netlify에. pingdergarten은 `physical-ai-repo-2/presentation/final-v3/` 아래 **빌드 없는 정적 HTML + Reveal.js**라서, 발표 직전에 **공유 URL 하나**만 필요했고 그게 Vercel로 나감.

## Vercel을 쓴 실무적인 이유 (추정 + repo 근거)

1. **슬라이드만 따로 배포** — repo 이름/URL이 `preso-slides-only`인 것처럼, 로봇·ROS·Vue 앱과 분리한 **덱 전용** 배포.
2. **미디어가 무거움** — `final-v3/.vercelignore`로 `slides/assets/media/**` 대부분 제외하고, 슬라이드가 실제로 쓰는 mp4/gif/png만 whitelist. Netlify도 가능하지만, Vercel 쪽 ignore + 재배포로 덱 크기를 줄인 흔적.
3. **ShopPinkki는 이미 Netlify** — 3번 덱이 Netlify를 쓰고 있어서 4번은 Vercel 계정/프로젝트로 분리했을 가능성 (같은 호스트에 다 올릴 필요는 없었음).
4. **정적 호스팅이면 충분** — `vercel.json`은 `cleanUrls`랑 Cache-Control 정도. SSR·API 없음.

## Vercel이 *아닌* 것

- EduPing **브라우저 teleop**, depth 하이파이브, ROS — lab / 로컬 / GitHub 코드
- **포트폴리오 3D 미로** — Netlify (`joeyleeportfolio.netlify.app`)
- **devlog** — GitHub Pages

Prismic `images.prismic.io/joey`는 QnA·devlog **이미지 CDN**용이고, pingdergarten **슬라이드 사이트**랑은 별개.

## 정리

Vercel은 pingdergarten **로봇 플랫폼** 선택이 아니라, **최종 Reveal.js 덱을 가볍게 올릴 공개 URL**로 쓴 것. 포트폴리오 4번 스테이션 덱 링크도 그 URL(`pingdergartenDeck`)로 맞춰 둔 상태.
