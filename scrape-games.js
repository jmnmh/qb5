// scripts/scrape-games.js
// Requires Node >= 16 and puppeteer
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const TARGET = 'https://www.fares.top/'; // المصدر
  const OUTFILE = path.join(__dirname, '..', 'games.json');

  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);

  try {
    await page.goto(TARGET, { waitUntil: 'networkidle2' });

    // ✏️ IMPORTANT: قد تحتاج تعديل الـ selectors بناءً على بنية fares.top
    // مثال عام يحاول التقاط عناصر الألعاب (عدل حسب الصفحة الحقيقية)
    const games = await page.evaluate(() => {
      // اختر selector المناسب لكل لعبة - هذه أمثلة عامة
      const items = Array.from(document.querySelectorAll('.game, .product, .card, .item'));
      if (!items.length) {
        // محاولات بديلة
        const alt = Array.from(document.querySelectorAll('.post, .entry, .listing'));
        return alt.map(el => {
          const a = el.querySelector('a');
          return {
            title: (el.querySelector('h2')?.innerText || a?.innerText || 'Unknown').trim(),
            pageUrl: a ? a.href : window.location.href,
            thumbnail: el.querySelector('img')?.src || null,
            description: el.querySelector('p')?.innerText || '',
          };
        });
      }

      return items.map(el => {
        const a = el.querySelector('a');
        return {
          title: (el.querySelector('h2')?.innerText || el.querySelector('h3')?.innerText || a?.innerText || 'Untitled').trim(),
          pageUrl: a ? a.href : window.location.href,
          thumbnail: el.querySelector('img')?.src || null,
          description: el.querySelector('p')?.innerText || ''
        };
      });
    });

    // Optional: for each game, try to open its page and extract direct download link
    for (let g of games) {
      try {
        if (!g.pageUrl) continue;
        const pg = await browser.newPage();
        await pg.goto(g.pageUrl, { waitUntil: 'networkidle2' });
        // حاول إيجاد رابط تحميل واضح
        const dl = await pg.evaluate(() => {
          // أمثلة منطقية للروابط: زر تحميل، رابط به text "download" أو امتدادات ملفات
          const link = Array.from(document.querySelectorAll('a'))
            .find(a => /download|direct|dl|zip|exe|rar|game/i.test(a.innerText + ' ' + a.href));
          if (link) return link.href;
          // بحث عن أول رابط يمسك ملف مباشر
          const fileLink = Array.from(document.querySelectorAll('a'))
            .find(a => /\.(zip|rar|exe|apk|7z|tar\.gz)$/i.test(a.href));
          return fileLink ? fileLink.href : null;
        });
        g.downloadLink = dl || null;
        await pg.close();
        // احترام الموقع: تأخير بسيط
        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        g.downloadLink = null;
      }
    }

    // احفظ بحالة مرتبة
    const out = {
      source: TARGET,
      fetchedAt: new Date().toISOString(),
      count: games.length,
      games
    };

    fs.writeFileSync(OUTFILE, JSON.stringify(out, null, 2), 'utf8');
    console.log('Saved', OUTFILE);
  } catch (err) {
    console.error('Scrape error:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
