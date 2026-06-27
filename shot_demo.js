const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://127.0.0.1:5500/www/mascot-demo.html';
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    args:['--no-sandbox','--window-size=430,900'], defaultViewport:{width:430,height:900,deviceScaleFactor:2}});
  const p = await b.newPage();
  await p.goto(URL,{waitUntil:'networkidle2',timeout:60000});
  await new Promise(r=>setTimeout(r,800));
  // neutral (mouse centered) screenshot
  await p.screenshot({path:'d:/git/shot_center.png'});
  // simulate mouse to the right+down to see pupils move
  await p.mouse.move(380, 700);
  await new Promise(r=>setTimeout(r,700));
  await p.screenshot({path:'d:/git/shot_right.png'});
  await b.close();
  console.log('done');
})().catch(e=>{console.error(e);process.exit(1);});
