---
date: 2026-06-09
project: devlog-site
tags: devlog, editor, media
---

## Daily Scrum

### 어제 한 일
- devlog 본문에 Prismic CDN 이미지·GIF 렌더링 붙임
- 에디터에 Prismic 업로드·textarea 드롭 위치 삽입까지 연결

### 오늘 할 일
- 본문 textarea 아래에서 이미지가 바로 보이게 (raw `![…](url)`만 보이던 문제)
- 미리보기 탭 제거, 업로드한 미디어 본문에서 삭제 UI
- GitHub Pages에 push

### 공유할 거
- 로컬: http://127.0.0.1:8780/edit.html
- 라이브: https://joey114132.github.io/devlog/edit.html
- 커밋 `91e4c51` — `main`에 push 완료

---

# 에디터 본문 라이브 미리보기 + 미디어 삭제

Prismic에 올리면 본문에는 `![alt](https://images.prismic.io/joey/…)` 마크다운만 들어가는데, textarea 안에서는 당연히 그 문자열만 보임. “이미지가 안 나온다”는 느낌이라 **본문 바로 아래**에 라이브 패널을 달았음. `marked` + `enhanceMedia()` 쓰니까 실제 글 페이지랑 같은 `<figure>` / `<img>` 로 렌더됨.

그다음 **미리보기** 탭은 역할이 겹쳐서 뺐음. 탭 없이 작성 화면 하나 + 아래 패널이면 충분함.

미디어 삭제도 넣음. 라이브 패널 이미지/영상 우상단 **삭제** 누르면 본문에서 해당 `![…](url)` 블록이 빠지고, 업로드 목록에 “본문에 삽입됨” 된 항목에도 **삭제**가 있음. Prismic CDN 파일 자체는 안 지우고 md만 정리 — 의도한 동작.

로컬 `:8780` / `:8781` grep·curl로 확인했고, `91e4c51` push 후 라이브 edit.html에도 `editor-body-live__label`, `removeMediaAtIndex` 들어간 거 curl로 봤음.

참고로 포트폴리오 4번째 프로젝트(pingdergarten) 덱 URL은 Vercel `preso-slides-only.vercel.app` — 로봇 앱이 아니라 Reveal.js 슬라이드만 올린 거. ShopPinkki 덱은 Netlify. devlog-site랑은 별개.
