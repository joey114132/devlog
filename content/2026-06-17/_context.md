# Devlog context — 2026-06-17

_Generated: 2026-06-17T09:39:48+09:00._

## Cursor terminals

### /home/joey
```
cd /home/joey/portfolio && python3 -m http.server 8765
127.0.0.1 - - [04/Jun/2026 11:57:23] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 11:57:23] "GET / HTTP/1.1" 304 -
127.0.0.1 - - [04/Jun/2026 11:57:23] "GET /css/style.css HTTP/1.1" 304 -
127.0.0.1 - - [04/Jun/2026 11:57:23] "GET /js/app.js HTTP/1.1" 304 -
127.0.0.1 - - [04/Jun/2026 11:57:23] "GET /js/maze-scene.js HTTP/1.1" 304 -
127.0.0.1 - - [04/Jun/2026 11:57:23] "GET /js/detail-scene.js HTTP/1.1" 304 -
127.0.0.1 - - [04/Jun/2026 11:57:23] "GET /js/i18n.js HTTP/1.1" 304 -
127.0.0.1 - - [04/Jun/2026 11:57:23] "GET /js/audio.js HTTP/1.1" 304 -
127.0.0.1 - - [04/Jun/2026 11:57:23] "GET /js/mesh-models.js HTTP/1.1" 304 -
127.0.0.1 - - [04/Jun/2026 11:57:23] "GET /js/player-robot.js HTTP/1.1" 304 -
127.0.0.1 - - [04/Jun/2026 11:57:23] "GET /js/models.js HTTP/1.1" 304 -
127.0.0.1 - - [04/Jun/2026 11:57:23] code 404, message File not found
127.0.0.1 - - [04/Jun/2026 11:57:23] "GET /favicon.ico HTTP/1.1" 404 -
127.0.0.1 - - [04/Jun/2026 11:57:31] code 404, message File not found
127.0.0.1 - - [04/Jun/2026 11:57:31] "GET /favicon.ico HTTP/1.1" 404 -
127.0.0.1 - - [04/Jun/2026 11:57:35] "GET /assets/gesto/arch.png HTTP/1.1" 304 -
127.0.0.1 - - [04/Jun/2026 11:57:35] "GET /assets/gesto/ui.jpg HTTP/1.1" 304 -
127.0.0.1 - - [04/Jun/2026 11:57:37] "GET /assets/gesto/landmarks.png HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 11:57:37] "GET /assets/gesto/training.png HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 11:57:37] "GET /assets/gesto/hero.png HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 11:57:37] "GET /assets/gesto/pipeline.jpg HTTP/1.1" 304 -
127.0.0.1 - - [04/Jun/2026 11:57:41] "GET /assets/iot/system.jpg HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 11:57:41] "GET /assets/iot/hero.jpg HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 11:57:42] "GET /assets/iot/image50.gif HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 11:57:42] "GET /assets/iot/image40.gif HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 11:57:42] "GET /assets/iot/gate.gif HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 11:57:42] "GET /assets/iot/image18.jpg HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 11:57:42] "GET /assets/iot/image66.gif HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 11:57:42] "GET /assets/iot/image57.gif HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 11:57:42] "GET /assets/iot/image34.png HTTP/1.1" 304 -
127.0.0.1 - - [04/Jun/2026 11:57:48] "GET /assets/shop/demo.jpg HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 11:57:48] "GET /assets/shop/arch.png HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 11:57:48] "GET /assets/shop/hero.jpg HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 12:17:33] "GET /css/style.css HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 12:18:32] "GET / HTTP/1.1" 304 -
127.0.0.1 - - [04/Jun/2026 12:18:34] code 404, message File not found
127.0.0.1 - - [04/Jun/2026 12:18:34] "GET /favicon.ico HTTP/1.1" 404 -
127.0.0.1 - - [04/Jun/2026 12:20:36] "GET /assets/shop/page-027.png HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 12:20:36] "GET /assets/shop/page-014.png HTTP/1.1" 200 -
```

### /home/joey/.cursor/mcp-servers/web-search-mcp
```
bash -c 'source /home/joey/.cursor/hooks/post-tool-use-tracker.sh 2>/dev/null; get_ros_colcon_command \"/home/joey/ros_ws/src/pinky_pro/package.xml\"'
```

### /home/joey/.cursor/vendor/Understand-Anything/understand-anything-plugin
```
GRAPH_DIR=\"/home/joey/Desktop/SAM3/sam3\" \\\nDASH=\"/home/joey/.cursor/vendor/Understand-Anything/understand-anything-plugin/packages/dashboard\" \\\nenv -i HOME=\"$HOME\" PATH=\"/usr/bin:/bin:/usr/local/bin\" USER=\"$USER\" \\\n  bash -lc \"cd \\\"$DASH\\\" && GRAPH_DIR=\\\"$GRAPH_DIR\\\" /usr/bin/npx vite --host 127.0.0.1\" 2>&1
  VITE v6.4.1  ready in 356 ms
  ➜  Local:   http://127.0.0.1:5173/
export UNDERSTAND_ACCESS_TOKEN=\"sam3-dashboard-$(date +%s)\"\necho \"TOKEN=$UNDERSTAND_ACCESS_TOKEN\" > /tmp/ua-dashboard-token.txt\nGRAPH_DIR=\"/home/joey/Desktop/SAM3/sam3\"\nDASH=\"/home/joey/.cursor/vendor/Understand-Anything/understand-anything-plugin/packages/dashboard\"\nenv -i HOME=\"$HOME\" PATH=\"/usr/bin:/bin:/usr/local/bin\" USER=\"$USER\" \\\n  UNDERSTAND_ACCESS_TOKEN=\"$UNDERSTAND_ACCESS_TOKEN\" GRAPH_DIR=\"$GRAPH_DIR\" \\\n  bash -lc \"cd \\\"$DASH\\\" && /usr/bin/npx vite --host 127.0.0.1\" 2>&1
  🔑  Dashboard URL: http://127.0.0.1:5173/?token=sam3-dashboard-1781576338
  VITE v6.4.3  ready in 707 ms
```

### /home/joey/daily-vision-lab
```
pkill -f \"vite.*5174\" 2>/dev/null; cd /home/joey/daily-vision-lab/days/2026-06-07-cooked-scanner && rtk npm run dev
pkill -f \"vite.*5174\" 2>/dev/null; cd /home/joey/daily-vision-lab/days/2026-06-06-blink-tide && rtk npm run dev
cd /home/joey/daily-vision-lab && rtk npm run dev:latest
# exit=137
cd /home/joey/daily-vision-lab/days/2026-06-05-gesture-constellation && rtk npm run preview -- --port 5175
> vite preview --port 5175
  ➜  Local:   http://localhost:5175/
  ➜  Network: use --host to expose
Killed
rtk curl -sI http://localhost:5175/ | head -2; kill 17465 2>/dev/null; sleep 1; cd /home/joey/daily-vision-lab/days/2026-06-05-gesture-constellation && rtk npm run dev
HTTP/1.1 200 OK
Vary: Origin
cd /home/joey/daily-vision-lab/days/2026-06-05-gesture-constellation && rtk npm run dev
fuser -k 5174/tcp 2>/dev/null; sleep 1; cd /home/joey/daily-vision-lab/days/2026-06-08-desk-well && rtk npm run dev
 37435> vite
  VITE v6.4.3  ready in 252 ms
  ➜  Local:   http://localhost:5174/
cd /home/joey/daily-vision-lab/days/2026-06-07-cooked-scanner && rtk npm run dev
> vite
  VITE v6.4.3  ready in 164 ms
fuser -k 5174/tcp 2>/dev/null; sleep 1; cd /home/joey/daily-vision-lab/days/2026-06-09-focus-ledger && rtk npm run dev
 40925> vite
  VITE v6.4.3  ready in 386 ms
3:10:27 PM [vite] (client) page reload index.html
3:10:29 PM [vite] (client) page reload src/strings.ts
3:10:34 PM [vite] (client) page reload src/main.ts
3:10:41 PM [vite] (client) hmr update /src/style.css
3:10:47 PM [vite] (client) page reload src/main.ts
```

### /home/joey/daily-vision-lab/days/2026-06-10-margin-notes
```
cd /home/joey/daily-vision-lab && node scripts/resolve-latest-day.mjs && fuser -k 5174/tcp 2>/dev/null; sleep 1 && node scripts/dev-latest.mjs
2026-06-10-margin-notes 43387Dev server: /home/joey/daily-vision-lab/days/2026-06-10-margin-notes
> margin-notes@1.0.0 dev
> vite
  VITE v6.4.3  ready in 600 ms
  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```

### /home/joey/daily-vision-lab/days/2026-06-11-breath-cadence
```
# exit=137
cd /home/joey/daily-vision-lab && node scripts/dev-latest.mjs
Dev server: /home/joey/daily-vision-lab/days/2026-06-11-breath-cadence
App title: Breath Cadence · Day 8
URL: http://localhost:5174/
> breath-cadence@1.0.0 dev
> vite
  VITE v6.4.3  ready in 272 ms
  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
Killed
```

### /home/joey/Desktop
```
cd /home/joey/Desktop && python3 -m http.server 8766 --bind 127.0.0.1
127.0.0.1 - - [09/Jun/2026 15:09:17] "GET /%ec%9d%b4%eb%a0%a5%ec%84%9c_Resume_%ec%9d%b4%ec%a0%95%ec%9a%b0.html HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 15:09:17] "GET /resume_assets/%EC%9D%B4%EC%A0%95%EC%9A%B0_Diploma.pdf HTTP/1.1" 200 -
# exit=1
Traceback (most recent call last):
  File "<frozen runpy>", line 198, in _run_module_as_main
  File "<frozen runpy>", line 88, in _run_code
  File "/usr/lib/python3.12/http/server.py", line 1314, in <module>
    test(
  File "/usr/lib/python3.12/http/server.py", line 1261, in test
    with ServerClass(addr, HandlerClass) as httpd:
  File "/usr/lib/python3.12/socketserver.py", line 457, in __init__
    self.server_bind()
  File "/usr/lib/python3.12/http/server.py", line 1308, in server_bind
    return super().server_bind()
  File "/usr/lib/python3.12/http/server.py", line 136, in server_bind
    socketserver.TCPServer.server_bind(self)
  File "/usr/lib/python3.12/socketserver.py", line 473, in server_bind
    self.socket.bind(self.server_address)
OSError: [Errno 98] Address already in use
test -f \"/home/joey/Desktop/resume_assets/이정우_Diploma.pdf\" && echo \"pdf:exists\" || echo \"pdf:missing\"; cd /home/joey/Desktop && python3 -m http.server 8766 --bind 127.0.0.1
pdf:exists
127.0.0.1 - - [09/Jun/2026 15:11:32] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 15:11:33] "GET /?debug=1&noboot=1 HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 15:11:35] "GET /%ec%9d%b4%eb%a0%a5%ec%84%9c_Resume_%ec%9d%b4%ec%a0%95%ec%9a%b0.html HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 15:11:35] "GET /resume_assets/%EC%9D%B4%EC%A0%95%EC%9A%B0_Diploma.pdf HTTP/1.1" 200 -
```

### /home/joey/devlog-site
```
# exit=1
cd /home/joey/devlog-site && python3 -m http.server 8780
Traceback (most recent call last):
  File "<frozen runpy>", line 198, in _run_module_as_main
  File "<frozen runpy>", line 88, in _run_code
  File "/usr/lib/python3.12/http/server.py", line 1314, in <module>
    test(
  File "/usr/lib/python3.12/http/server.py", line 1261, in test
    with ServerClass(addr, HandlerClass) as httpd:
  File "/usr/lib/python3.12/socketserver.py", line 457, in __init__
    self.server_bind()
  File "/usr/lib/python3.12/http/server.py", line 1308, in server_bind
    return super().server_bind()
  File "/usr/lib/python3.12/http/server.py", line 136, in server_bind
    socketserver.TCPServer.server_bind(self)
  File "/usr/lib/python3.12/socketserver.py", line 473, in server_bind
    self.socket.bind(self.server_address)
OSError: [Errno 98] Address already in use
cd /home/joey/devlog-site && zsh scripts/serve-dev.sh
Static site:  http://127.0.0.1:8780/
Editor page:  http://127.0.0.1:8780/edit.html
Save API:     http://127.0.0.1:8781/health
Press Ctrl+C to stop.
127.0.0.1 - "GET /health HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 11:52:08] "GET /edit.html HTTP/1.1" 200 -
cd /home/joey/devlog-site && python3 scripts/build.py && python3 -m http.server 8780
Wrote 4 posts to /home/joey/devlog-site/data/posts.json
Wrote RSS feed to /home/joey/devlog-site/feed.xml
127.0.0.1 - - [09/Jun/2026 11:46:38] "GET /index.html HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 11:46:38] "GET /feed.xml HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 11:46:38] "GET /data/posts.json HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 11:53:34] "GET /edit.html HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 11:53:34] "GET /index.html HTTP/1.1" 200 -
# exit=0
cd /home/joey/devlog-site && (curl -sf http://127.0.0.1:8780/css/style.css 2>/dev/null | grep -E 'sticky-offset|\\.back-link' | head -8) || (scripts/serve-dev.sh >/tmp/devlog-serve.log 2>&1 & sleep 2; rtk curl -sf http://127.0.0.1:8780/css/style.css | grep -E 'sticky-offset|\\.back-link' | head -8)
  --sticky-offset: 3.4rem;
    top: calc(var(--sticky-offset) + 2.75rem);
.back-link {
  top: var(--sticky-offset);
.back-link:hover {
```

### /home/joey/physical-ai-bootcamp-intro
```
# exit=1
cd /home/joey/physical-ai-bootcamp-intro/self-intro-web && python3 -m http.server 8791 --bind 127.0.0.1
Traceback (most recent call last):
  File "<frozen runpy>", line 198, in _run_module_as_main
  File "<frozen runpy>", line 88, in _run_code
  File "/usr/lib/python3.12/http/server.py", line 1314, in <module>
    test(
  File "/usr/lib/python3.12/http/server.py", line 1261, in test
    with ServerClass(addr, HandlerClass) as httpd:
  File "/usr/lib/python3.12/socketserver.py", line 457, in __init__
    self.server_bind()
  File "/usr/lib/python3.12/http/server.py", line 1308, in server_bind
    return super().server_bind()
  File "/usr/lib/python3.12/http/server.py", line 136, in server_bind
    socketserver.TCPServer.server_bind(self)
  File "/usr/lib/python3.12/socketserver.py", line 473, in server_bind
    self.socket.bind(self.server_address)
OSError: [Errno 98] Address already in use
```

### /home/joey/physical-ai-bootcamp-intro/self-intro-web
```
cd /home/joey/physical-ai-bootcamp-intro/self-intro-web && python3 -m http.server 8791 --bind 127.0.0.1
127.0.0.1 - - [09/Jun/2026 18:46:19] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:46:19] "GET /style.css HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:46:54] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:46:54] "GET /style.css HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:46:54] "GET /assets/eduping_sim.jpg HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:47:34] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:51:41] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:51:41] "GET /style.css HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:51:41] "GET /assets/eduping_sim.jpg HTTP/1.1" 304 -
127.0.0.1 - - [09/Jun/2026 18:51:41] "GET /main.js HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:42:11] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:42:41] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:42:41] "GET /style.css HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:42:41] "GET /assets/profile_id.jpg HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:43:18] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:43:19] "GET /assets/eduping_sim.jpg HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:43:19] "GET /assets/profile_id.jpg HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:43:19] "GET /style.css HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:43:19] "GET /main.js HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:43:19] code 404, message File not found
127.0.0.1 - - [09/Jun/2026 18:43:19] "GET /favicon.ico HTTP/1.1" 404 -
pkill -f \"http.server 8791\" 2>/dev/null; cd /home/joey/physical-ai-bootcamp-intro/self-intro-web && python3 -m http.server 8791 --bind 127.0.0.1
cd /home/joey/physical-ai-bootcamp-intro/self-intro-web && python3 -m http.server 8792
127.0.0.1 - - [09/Jun/2026 18:29:58] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:29:58] "GET /style.css HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:29:58] "GET /main.js HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:29:58] "GET /assets/eduping_sim.jpg HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:56:20] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:56:53] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:56:53] "GET /style.css HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:56:53] "GET /assets/eduping_sim.jpg HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:57:21] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:58:06] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:58:06] "GET /style.css HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 18:58:06] "GET /assets/eduping_sim.jpg HTTP/1.1" 304 -
127.0.0.1 - - [09/Jun/2026 18:58:06] "GET /main.js HTTP/1.1" 304 -
127.0.0.1 - - [09/Jun/2026 19:03:54] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 19:04:05] "GET /style.css HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 19:04:05] "GET /assets/eduping_sim.jpg HTTP/1.1" 200 -
```

### /home/joey/physical-ai-bootcamp-intro/self-intro-web/assets/games
```
# exit=1
cd /home/joey/physical-ai-bootcamp-intro/self-intro-web && python3 -m http.server 8791 --bind 127.0.0.1
Traceback (most recent call last):
  File "<frozen runpy>", line 198, in _run_module_as_main
  File "<frozen runpy>", line 88, in _run_code
  File "/usr/lib/python3.12/http/server.py", line 1314, in <module>
    test(
  File "/usr/lib/python3.12/http/server.py", line 1261, in test
    with ServerClass(addr, HandlerClass) as httpd:
  File "/usr/lib/python3.12/socketserver.py", line 457, in __init__
    self.server_bind()
  File "/usr/lib/python3.12/http/server.py", line 1308, in server_bind
    return super().server_bind()
  File "/usr/lib/python3.12/http/server.py", line 136, in server_bind
    socketserver.TCPServer.server_bind(self)
  File "/usr/lib/python3.12/socketserver.py", line 473, in server_bind
    self.socket.bind(self.server_address)
OSError: [Errno 98] Address already in use
```

### /home/joey/portfolio
```
cd /home/joey && python3 -m http.server 8766 2>&1
127.0.0.1 - - [04/Jun/2026 16:11:24] "GET /portfolio-twai/index.html HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:11:24] "GET /portfolio/js/i18n.js HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:12:21] "GET /portfolio-twai/ HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:12:21] "GET /portfolio/css/style.css HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:12:21] "GET /portfolio-twai/css/twai.css HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:12:21] "GET /portfolio-twai/js/app.js HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:12:21] code 404, message File not found
127.0.0.1 - - [04/Jun/2026 16:12:21] "GET /portfolio-twai/portfolio/js/i18n.js HTTP/1.1" 404 -
127.0.0.1 - - [04/Jun/2026 16:12:21] "GET /portfolio-twai/js/platform-scene.js HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:12:21] "GET /portfolio-twai/js/levels.js HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:12:21] "GET /portfolio-twai/js/narration.js HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:12:21] "GET /favicon.ico HTTP/1.1" 404 -
127.0.0.1 - - [04/Jun/2026 16:12:28] "GET /portfolio/index.html HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:12:28] "GET /portfolio/js/app.js HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:12:28] "GET /portfolio/js/i18n.js HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:12:28] "GET /portfolio/js/perf.js HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:12:28] "GET /portfolio/js/detail-scene.js HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:12:28] "GET /portfolio/js/maze-scene.js HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:12:28] "GET /portfolio/js/audio.js HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:12:28] "GET /portfolio/js/mesh-models.js HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:12:28] "GET /portfolio/js/player-robot.js HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:12:28] "GET /portfolio/js/models.js HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:12:32] "GET /portfolio-twai/index.html HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:12:32] code 404, message File not found
127.0.0.1 - - [04/Jun/2026 16:12:32] "GET /portfolio-twai/portfolio/js/i18n.js HTTP/1.1" 404 -
127.0.0.1 - - [04/Jun/2026 16:15:07] "GET /portfolio-twai/index.html HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:15:26] "GET /portfolio-twai/js/app.js HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:15:26] "GET /portfolio-twai/js/platform-scene.js HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:15:26] "GET /portfolio-twai/js/narration.js HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:15:26] "GET /portfolio-twai/js/minimap.js HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:15:26] "GET /portfolio-twai/js/levels.js HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:15:26] "GET /portfolio/js/i18n.js HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:15:32] "GET /portfolio/index.html HTTP/1.1" 304 -
127.0.0.1 - - [04/Jun/2026 16:15:33] "GET /portfolio/js/app.js HTTP/1.1" 304 -
127.0.0.1 - - [04/Jun/2026 16:15:33] "GET /portfolio/css/style.css HTTP/1.1" 304 -
127.0.0.1 - - [04/Jun/2026 16:15:33] "GET /portfolio/js/maze-scene.js HTTP/1.1" 304 -
127.0.0.1 - - [04/Jun/2026 16:15:33] "GET /portfolio/js/i18n.js HTTP/1.1" 304 -
127.0.0.1 - - [04/Jun/2026 16:15:34] "GET /portfolio-twai/index.html HTTP/1.1" 200 -
127.0.0.1 - - [04/Jun/2026 16:15:34] "GET /portfolio-twai/css/twai.css HTTP/1.1" 200 -
```

### /home/joey/portfolio/.worktrees/review
```
# exit=143
cd ~/portfolio/.worktrees/review && python3 -m http.server 8766
127.0.0.1 - - [09/Jun/2026 09:49:46] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:49:46] "GET /?noboot=1 HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:49:46] "GET /css/style.css HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:49:46] "GET /js/app.js HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:49:46] "GET /js/config.js HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:49:46] "GET /js/maze-scene.js HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:49:46] "GET /js/detail-scene.js HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:49:46] "GET /js/i18n.js HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:49:46] "GET /js/audio.js HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:49:46] "GET /js/perf.js HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:49:46] "GET /js/mesh-models.js HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:49:46] "GET /js/player-robot.js HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:49:46] "GET /js/models.js HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:49:46] "HEAD /assets/about/hri-lab.webm HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:49:46] "HEAD /assets/about/high-five-demo.mp4 HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:49:46] "HEAD /assets/about/high-five-sim.webm HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:49:46] "GET /assets/about/high-five-demo.mp4 HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:49:46] "GET /assets/about/hri-lab.webm HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:49:46] "GET /assets/about/high-five-sim.webm HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:49:49] "GET /index.html HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:50:12] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:50:12] "GET /css/style.css HTTP/1.1" 304 -
127.0.0.1 - - [09/Jun/2026 09:50:12] "GET /js/app.js HTTP/1.1" 304 -
127.0.0.1 - - [09/Jun/2026 09:50:12] "GET /js/config.js HTTP/1.1" 304 -
127.0.0.1 - - [09/Jun/2026 09:50:12] "GET /js/i18n.js HTTP/1.1" 304 -
127.0.0.1 - - [09/Jun/2026 09:50:12] "GET /js/detail-scene.js HTTP/1.1" 304 -
127.0.0.1 - - [09/Jun/2026 09:50:12] "GET /js/maze-scene.js HTTP/1.1" 304 -
127.0.0.1 - - [09/Jun/2026 09:50:12] "GET /js/audio.js HTTP/1.1" 304 -
127.0.0.1 - - [09/Jun/2026 09:50:12] "GET /js/perf.js HTTP/1.1" 304 -
127.0.0.1 - - [09/Jun/2026 09:50:12] "GET /js/mesh-models.js HTTP/1.1" 304 -
127.0.0.1 - - [09/Jun/2026 09:50:12] "GET /js/player-robot.js HTTP/1.1" 304 -
127.0.0.1 - - [09/Jun/2026 09:50:12] "GET /js/models.js HTTP/1.1" 304 -
127.0.0.1 - - [09/Jun/2026 09:50:12] "HEAD /assets/about/high-five-sim.webm HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:50:12] "HEAD /assets/about/high-five-demo.mp4 HTTP/1.1" 304 -
127.0.0.1 - - [09/Jun/2026 09:50:12] "HEAD /assets/about/hri-lab.webm HTTP/1.1" 304 -
127.0.0.1 - - [09/Jun/2026 09:50:12] "GET /assets/about/high-five-sim.webm HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:50:12] "HEAD /assets/about/profile.jpg HTTP/1.1" 200 -
127.0.0.1 - - [09/Jun/2026 09:50:12] "HEAD /assets/gesto/deck-demo-ui.png HTTP/1.1" 200 -
```

### /home/joey/smart-farm-demo
```
cd /home/joey/smart-farm-demo && python3 -m http.server 8767
```

## Zsh commands

_No zsh commands for 2026-06-17._

## Git

### portfolio — `/home/joey/portfolio`
**log (today):**
```
(no commits)
```
**status:**
```
## main...origin/main
```

### devlog-site — `/home/joey/devlog-site`
**log (today):**
```
log_out=''
(no commits)
```
**status:**
```
## main...origin/main
 M css/style.css
 M data/posts.json
 M edit.html
 M feed.xml
 M js/editor.js
 M js/features.js
 D js/github-save.js
 M scripts/editor-server.py
?? .verify-screenshots/
?? scripts/gather-context.sh
```

### daily-vision-lab — `/home/joey/daily-vision-lab`
**log (today):**
```
log_out=''
(no commits)
```
**status:**
```
## main...origin/main
 M README.md
 M catalog/days.json
 M days/2026-06-12-scope-box/TEST_PLAN.md
 M state/progress.json
 M state/repos.json
?? days/2026-06-13-pause-stamp/
?? generators/pause-stamp/
```

## Files

### /home/joey/devlogs
```
/home/joey/devlogs/2026-06-17/_context.md
```

### /home/joey/portfolio
```
```

### /home/joey/devlog-site
```
```

### /home/joey/physical-ai-bootcamp-intro
```
```

### /home/joey/daily-vision-lab
```
```

