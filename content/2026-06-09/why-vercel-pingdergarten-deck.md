---
date: 2026-06-09
project: pingdergarten
tags: devlog, vercel, presentation, deploy
---

## Daily Scrum

### 어제 한 일
- devlog 에디터 본문 라이브 미리보기·미디어 삭제 (Vercel 언급은 editor 글에서 제거)

### 오늘 할 일
- 4번 프로젝트(pingdergarten) 덱이 **왜 Vercel**인지 repo 근거로 정리

### 공유할 거
- 라이브 덱: https://preso-slides-only.vercel.app/
- 소스: `physical-ai-repo-2/presentation/final-v3/`
- 포트폴리오 링크: `portfolio/js/config.js` → `pingdergartenDeck`

---

# pingdergarten 덱 — Vercel을 쓴 이유 (상세)

## 한 줄

Vercel은 **EduPing 로봇 앱 호스팅**이 아니라, **최종 Reveal.js 발표 덱만** 올리기 위한 **정적 URL**이다. repo 안에 `vercel.json` + `.vercelignore`가 있고, 프로젝트 이름도 `preso-slides-only`라 **슬라이드 전용 배포**가 의도적으로 분리돼 있음.

---

## 1. “4번 프로젝트”가 뭔지

Addinedu Physical AI 1기 포트폴리오 미로 기준 네 station:

| # | phase | 프로젝트 | 덱 URL (config) |
| --- | --- | --- | --- |
| 01 | DL | Gesto | Google Slides |
| 02 | IoT | 오주의 마법사 | Prismic CDN (PPTX) |
| 03 | ROS | ShopPinkki | Netlify `shoppinkki-presentation.netlify.app` |
| 04 | PAI | pingdergarten / EduPing | **Vercel** `preso-slides-only.vercel.app` |

4번 = **pingdergarten**. Vercel에 있는 건 **Vue teleop · ROS · depth 파이프라인 전체가 아님**.

실제 로봇/UI 코드는 `physical-ai-repo-2` 본 repo (로컬·랩). 공개 덱만 CDN에 올림.

---

## 2. Vercel에 올라간 것의 정체

경로: `presentation/final-v3/`

- **Reveal.js 5.1** + Tailwind (CDN) + Pretendard/Jua 폰트
- **빌드 단계 없음** — HTML fragment (`slides/*.html`)를 `js/main.js`의 `SLIDES` 배열로 로드
- 데모 영상·GIF·PNG는 `slides/assets/media/` (Confluence에서 `pull-assets.sh`로 받아옴)
- `reports/` 아래 Q&A 리포트 HTML도 같은 트리

README에도 “python3 -m http.server” 수준의 **순수 정적**이라고 명시.

→ 필요한 건 **HTTPS + 글로벌 CDN + (선택) deploy 시 파일 필터링** 뿐. SSR·DB·Functions 불필요.

---

## 3. Vercel을 고른 실무 이유 (repo에서 확인되는 것)

### 3.1 슬라이드만 따로 배포 (`slides-only`)

URL·프로젝트명 `preso-slides-only` = **발표용 슬라이드만** 배포.

이유:

- `physical-ai-repo-2`는 ROS 패키지, Vue 앱, 컨트롤러, Confluence Q&A, 여러 presentation 폴더(midterm, panel, final-v3…)가 한 repo에 섞여 있음
- 심사/교수/외부인에게 줄 링크는 **한 URL, 로딩 빠른 덱**이면 충분
- 전 repo를 통째로 호스팅하면 불필요한 바이너리·venv·로봇 설정까지 노출 위험

Vercel 프로젝트 root를 `presentation/final-v3/` (또는 그에 준하는 서브디렉터리)로 두면 **덱만** 나감.

### 3.2 `.vercelignore` — 배포 크기·시간 제어

`final-v3/.vercelignore` 패턴:

```text
slides/assets/media/**          # 미디어 전부 제외
!slides/assets/media/pov.mp4    # 슬라이드가 실제 참조하는 파일만 whitelist
!slides/assets/media/eduping/...
!slides/assets/media/noriarm/...
...
```

로컬 `slides/assets/media`는 대략 **~16MB, 27 files** (2026-06-09 기준). 개발 중엔 Confluence pull로 **안 쓰는 클립도 폴더에 쌓일 수 있음**. deploy 때 **참조하는 mp4/gif/png만** 올리게 설계.

- Netlify도 ignore 가능하지만, 이 repo는 **Vercel deploy ignore 문법으로 이미 정리**돼 있음
- 발표 직전 “용량 줄여서 재배포” 흐름에 맞춤

### 3.3 `vercel.json` — 캐시 정책

```json
"/(.*)"           → Cache-Control: max-age=300, must-revalidate   // HTML·슬라이드: 수정 반영 빠르게
"/assets/(.*)"    → max-age=31536000, immutable                    // 정적 asset 장기 캐시
cleanUrls: true
```

발표 준비 중 슬라이드 HTML은 자주 고치고, mp4/png는 바뀌지 않음 → **경로별 캐시**를 config로 박아 둠.

### 3.4 같은 repo에 presentation/panel도 Vercel 설정

`presentation/panel/vercel.json` — A1 포스터(`poster-a1.html`)용 redirect·asset cache.

→ 팀이 **발표 산출물(덱·포스터)을 Vercel 쪽에 모아 두는** 패턴. final-v3 덱만 유난히 Vercel인 게 아니라 **PAI 발표 아티팩트 호스팅**으로 Vercel을 쓴 셈.

### 3.5 ShopPinkki는 Netlify — “팀·시점마다 호스트가 달랐음”

3번 ROS 덱은 **별도 Netlify 사이트**. 4번을 꼭 같은 Netlify에 올릴 **기술적 필수**는 없음.

| 호스트 | 쓰인 곳 |
| --- | --- |
| Netlify | ShopPinkki 덱, Joey 포트폴리오 (`joeyleeportfolio.netlify.app`) |
| Vercel | pingdergarten final-v3 덱 (`preso-slides-only`) |
| Google Slides | Gesto |
| Prismic CDN | IoT PPTX |

**통일 플랫폼 정책**보다 **프로젝트/시점별로 가장 빨리 공유 URL 만드는 선택**에 가깝다.

### 3.6 정적 호스팅이면 Vercel/Netlify/GitHub Pages 다 가능

Reveal+CDN 구조라 **기능적으로 Vercel만 가능한 건 아님**. 선택 요인은:

1. 서브폴더만 deploy + ignore로 **가벼운 덱 URL**
2. 이미 panel 등 **Vercel 프로젝트 경험**
3. 발표 D-day **공유 링크 하나** (`preso-slides-only.vercel.app`)를 portfolio `pingdergartenDeck`에 박음

---

## 4. Vercel이 *아닌* 것 (헷갈리기 쉬운 것)

| 것 | 실제 호스팅 |
| --- | --- |
| EduPing 브라우저 teleop, Three.js UI | 로컬 dev / 랩 (Vue dev server, ROS) |
| Joey 3D 포트폴리오 미로 | Netlify |
| devlog | GitHub Pages |
| Confluence Q&A 본문 | Atlassian |
| Prismic `images.prismic.io/joey` | devlog·문서 **이미지 CDN** (슬라이드 사이트와 별개) |

---

## 5. 라이브 검증 (2026-06-09)

- `curl -I https://preso-slides-only.vercel.app/` → `server: Vercel`, HTML `max-age=300`
- `portfolio/js/config.js` → `pingdergartenDeck: "https://preso-slides-only.vercel.app/"`
- 소스 `presentation/final-v3/vercel.json`, `.vercelignore` 존재

---

## 6. 정리

**왜 Vercel?**

- **무엇을**: 최종 Reveal.js 덱만 (`preso-slides-only`)
- **왜 분리**: monorepo에서 발표 URL만 가볍게
- **어떻게**: `.vercelignore` whitelist + `vercel.json` 캐시
- **왜 Netlify가 아님**: 3번이 Netlify였을 뿐, 4번은 팀이 Vercel로 슬라이드·포스터 배포 라인을 택함 — 기능 차이보다 **deploy 편의·이미 쓰던 Vercel 프로젝트** 쪽에 가깝다

로봇 플랫폼 = lab. **발표 덱 = Vercel static.** 포트폴리오 4번 station은 그 덱 URL로 연결.
