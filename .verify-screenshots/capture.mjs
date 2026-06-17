import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import path from 'path';

const OUT = path.dirname(new URL(import.meta.url).pathname);
const BASE = 'http://127.0.0.1:8780';

async function shot(page, name) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log('saved', file);
  return file;
}

async function waitReady(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ colorScheme: 'dark' });

// Index desktop
{
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await waitReady(page);
  await shot(page, 'index-1280x900.png');
  await page.close();
}

// Index mobile
{
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await waitReady(page);
  await shot(page, 'index-390x844.png');
  await page.close();
}

// Post top + scrolled
{
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  const url = BASE + '/post.html?id=2026-06-09/yesterday-devlog-followup';
  await page.goto(url, { waitUntil: 'networkidle' });
  await waitReady(page);
  await shot(page, 'post-top-1280x900.png');
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(400);
  await shot(page, 'post-scroll800-1280x900.png');

  const layout = await page.evaluate(() => {
    const pick = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        sel,
        top: Math.round(r.top),
        left: Math.round(r.left),
        width: Math.round(r.width),
        height: Math.round(r.height),
        position: s.position,
        display: s.display,
        visible: r.width > 0 && r.height > 0,
      };
    };
    return {
      scrollY: window.scrollY,
      article: pick('#article'),
      backLink: pick('.article-back'),
      stickyBack: pick('.article-back--sticky'),
      toc: pick('.article-toc'),
      scrum: pick('.post-scrum'),
      header: pick('.app-header'),
      progress: pick('.reading-progress-wrap'),
      overlaps: (() => {
        const nodes = [...document.querySelectorAll('.article-back, .article-toc, .post-scrum, .app-header, .reading-progress-wrap')];
        const rects = nodes.map((el) => ({ el: el.className, r: el.getBoundingClientRect() }));
        const hits = [];
        for (let i = 0; i < rects.length; i++) {
          for (let j = i + 1; j < rects.length; j++) {
            const a = rects[i].r;
            const b = rects[j].r;
            const overlap = !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
            if (overlap) hits.push([rects[i].el, rects[j].el]);
          }
        }
        return hits;
      })(),
    };
  });
  console.log('POST_LAYOUT', JSON.stringify(layout, null, 2));
  await page.close();
}

// Edit page
{
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(BASE + '/edit.html', { waitUntil: 'networkidle' });
  await waitReady(page);
  await shot(page, 'edit-1280x900.png');
  await page.close();
}

// Index layout metrics
{
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await waitReady(page);
  const layout = await page.evaluate(() => {
    const pick = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return { sel, missing: true };
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        sel,
        top: Math.round(r.top),
        left: Math.round(r.left),
        width: Math.round(r.width),
        height: Math.round(r.height),
        display: s.display,
        gridTemplate: s.gridTemplateColumns || s.gridTemplateAreas || null,
        gap: s.gap,
        marginTop: s.marginTop,
        marginBottom: s.marginBottom,
        innerText: el.innerText?.slice(0, 120),
      };
    };
    return {
      hero: pick('#site-hero'),
      scrum: pick('#today-scrum'),
      intro: pick('.index-intro'),
      tools: pick('.index-tools'),
      timeline: pick('#post-list'),
      firstCard: pick('.timeline-item'),
    };
  });
  console.log('INDEX_LAYOUT', JSON.stringify(layout, null, 2));
  await page.close();
}

await browser.close();
