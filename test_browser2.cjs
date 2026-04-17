const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:4173');
  
  await page.waitForSelector('button', { timeout: 10000 });
  const btns = await page.$$('button');
  
  let clicked = false;
  for(let b of btns) {
    const text = await page.evaluate(el => el.textContent, b);
    if(text.includes('Bắt Đầu Khảo Sát Nhanh')) {
      console.log('Found button! Clicking...');
      await b.click();
      clicked = true;
      break;
    }
  }
  
  if (!clicked) console.log("Button not found! HTML:", await page.content());

  await new Promise(r => setTimeout(r, 2000));
  
  const content = await page.content();
  console.log("Root element content length:", (await page.$eval('#root', el => el.innerHTML)).length);
  
  await browser.close();
})();
