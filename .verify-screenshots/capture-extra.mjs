import { chromium } from 'playwright';
import path from 'path';

const OUT = path.dirname(new URL(import.meta.url).pathname);
const BASE = 'http://127.0.0.1:8780';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ colorScheme: 'dark' });

// Long post: sticky back-link after scroll
{
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(BASE + '/post.html?id=2026-06-09/all-projects-work-summary', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const top = await page.evaluate(() => {
    const back = document.querySelector('.back-link');
    const header = document.querySelector('.app-header');
    const r = (el) => el ? el.getBoundingClientRect() : null;
    return { scrollY: window.scrollY, back: r(back), header: r(header), backStyle: back ? getComputedStyle(back).position : null };
  });
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(400);
  const scrolled = await page.evaluate(() => {
    const back = document.querySelector('.back-link');
    const header = document.querySelector('.app-header');
    const r = (el) => el ? { top: Math.round(el.getBoundingClientRect().top), height: Math.round(el.getBoundingClientRect().height) } : null;
    return { scrollY: window.scrollY, back: r(back), header: r(header), progressVisible: document.querySelector('.reading-progress-wrap')?.classList.contains('is-visible') };
  });
  await page.screenshot({ path: path.join(OUT, 'post-long-scroll800.png') });
  console.log('LONG_POST_TOP', JSON.stringify(top));
  console.log('LONG_POST_SCROLL', JSON.stringify(scrolled));
  await page.close();
}

// Mobile post
{
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/post.html?id=2026-06-09/yesterday-devlog-followup', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'post-390x844.png') });
  await page.close();
}

// Edit mobile
{
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/edit.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, 'edit-390x844.png') });
  const layout = await page.evaluate(() => {
    const pick = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return { sel, missing: true };
      const r = el.getBoundingClientRect();
      return { sel, top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height), display: getComputedStyle(el).display };
    };
    return {
      grid: pick('.editor-layout'),
      scrum: pick('.editor-scrum'),
      meta: pick('.editor-meta'),
      tabs: pick('.editor-tabs'),
    };
  });
  console.log('EDIT_MOBILE_LAYOUT', JSON.stringify(layout));
  await page.close();
}

await browser.close();
