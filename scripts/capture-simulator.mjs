// Capture the real simulator UI with an isolated learner account, never a real user's data.
// Usage: node scripts/capture-simulator.mjs /absolute/path/to/simulator-checkout
import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {pathToFileURL} from 'node:url';import {spawn,execFileSync} from 'node:child_process';
const app=path.resolve(process.argv[2]||''),require=createRequire(path.join(app,'package.json'));
const {chromium}=require('playwright'),three=path.dirname(require.resolve('three/package.json'));
const {installAuthFixture}=await import(pathToFileURL(path.join(app,'tests/auth-fixture.mjs')));
const port=8914,base=`http://127.0.0.1:${port}`,out='public/media/current';fs.mkdirSync(out,{recursive:true});
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',app],{stdio:'ignore'});let browser;
try{
 for(let i=0;i<60;i++){try{const r=await fetch(base);await r.arrayBuffer();if(r.ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:1});page.setDefaultTimeout(60000);
 await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:three+'/build/three.min.js',contentType:'text/javascript'}));
 await page.route('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js',r=>r.fulfill({path:three+'/examples/js/loaders/GLTFLoader.js',contentType:'text/javascript'}));
 await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:['Fredoka','Geist'].map(font=>`@font-face{font-family:'${font}';font-style:normal;font-weight:100 900;src:url('https://capture.invalid/${font.toLowerCase()}.woff2') format('woff2')}`).join('')}));
 await page.route('https://capture.invalid/*.woff2',r=>{const font=new URL(r.request().url()).pathname.slice(1,-6);return r.fulfill({path:`node_modules/@fontsource-variable/${font}/files/${font}-latin-wght-normal.woff2`,contentType:'font/woff2'});});
 await installAuthFixture(page);
 await page.route('https://api.fixture.invalid/billing/config',r=>r.fulfill({json:{beta:{active:true,endsAt:'2026-12-01T00:00:00Z'},enabled:false}}));
 await page.route('https://api.fixture.invalid/api/billing',r=>r.fulfill({json:{beta:{active:true,endsAt:'2026-12-01T00:00:00Z'},full:true,enabled:false,hasCustomer:false}}));
 await page.goto(base);await page.waitForFunction(()=>window.cambridgeDrive&&document.querySelector('#loadOv').hidden&&document.querySelector('#signInGate').hidden);await page.evaluate(()=>document.fonts.ready);
 const shot=async name=>{await page.screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:88,animations:'disabled'});console.log('Captured',name);};
 await page.locator('#lobby [data-open="courseSheet"]').first().click();await shot('courses');await page.locator('#courseSheet [data-close]').click();
 await page.locator('#lobby [data-open="mockSheet"]').click();await shot('mock-tests');await page.locator('#mockSheet [data-close]').click();
 await page.locator('.sim-beta-badge').getByRole('button',{name:'Take a tour'}).click();await page.locator('.new-user-tour').getByRole('button',{name:'Show me around'}).click();await page.locator('.tour-ring').waitFor({state:'visible'});await shot('tour');await page.locator('.new-user-tour').getByRole('button',{name:'Skip tour'}).click();
 await page.evaluate(async()=>{const a=cambridgeDrive;await a.pick('mock','east-road',true);a.manual(true);a.setCam(1);for(let i=0;i<8;i++)a.frame(.1);});
 await page.waitForFunction(()=>cambridgeDrive.cockpit);await page.evaluate(()=>{for(let i=0;i<8;i++)cambridgeDrive.frame(.1);});await shot('cockpit');
 const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:app,encoding:'utf8'}).trim();
 fs.writeFileSync(`${out}/provenance.json`,JSON.stringify({simulatorRepository:'ravitejamanchala/cambridge-learner-driv',commit,viewport:{width:1600,height:1000},screenshots:['courses','mock-tests','tour','cockpit'],method:'Chromium screenshots of the actual simulator checkout. Authentication/account responses are isolated test fixtures; no real account data. Bundled East Road map. No retouching or generated UI.'},null,2)+'\n');
}finally{await browser?.close();server.kill();}
