const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:4173');
  
  await page.waitForSelector('button', { timeout: 10000 });
  const btns = await page.$$('button');
  
  for(let b of btns) {
    const text = await page.evaluate(el => el.textContent, b);
    if(text.includes('Bắt Đầu Khảo Sát Nhanh')) {
      console.log('Found button! Clicking...');
      await b.click();
      await new Promise(r => setTimeout(r, 2000));
      break;
    }
  }
  
  await browser.close();
  console.log('Test done');
})();
