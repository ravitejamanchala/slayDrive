// Capture the real simulator UI with an isolated learner account, never a real user's data.
// Usage: node --use-env-proxy scripts/capture-simulator.mjs /absolute/path/to/simulator-checkout [--routes-only|--chase-only]
import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {pathToFileURL} from 'node:url';import {spawn,execFileSync} from 'node:child_process';
const app=path.resolve(process.argv[2]||''),require=createRequire(path.join(app,'package.json'));
const {chromium}=require('playwright'),three=path.dirname(require.resolve('three/package.json'));
const {installAuthFixture}=await import(pathToFileURL(path.join(app,'tests/auth-fixture.mjs')));
const {encode,measure}=await import(pathToFileURL(path.join(app,'js/personal/geometry.js')));
const source=JSON.parse(fs.readFileSync('scripts/fixtures/cambridge-showcase-route.json','utf8')),coordinates=source.routes[0].geometry.coordinates;
const recipe={version:1,id:'cambridge-showcase',title:'Cambridge · Station to city centre',createdAt:1793552400000,start:coordinates[0],end:coordinates.at(-1),snappedStart:source.waypoints[0].location,snappedEnd:source.waypoints[1].location,geometry:encode(coordinates),distance:measure(coordinates).length,duration:source.routes[0].duration,provider:'OSRM',attribution:'© OpenStreetMap contributors (ODbL)'};
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
 await page.addInitScript(recipe=>localStorage.setItem('slaydrive.personal-routes.v1',JSON.stringify({version:1,routes:[recipe]})),recipe);
 const tiles=new Map();
 await page.route('https://tile.openstreetmap.org/**',async route=>{
  const url=route.request().url();
  // Fetch only tiles requested by the visible map; retain them during this capture.
  if(!tiles.has(url))tiles.set(url,fetch(url,{headers:{'User-Agent':'SlayDrive website capture (https://slaydrive.com; info@slaydrive.com)'},signal:AbortSignal.timeout(20000)}).then(async response=>{if(!response.ok)throw Error('Map tile request failed: '+response.status);return Buffer.from(await response.arrayBuffer());}));
  try{await route.fulfill({contentType:'image/png',body:await tiles.get(url)});}catch{await route.abort();}
 });
 await page.route('https://api.fixture.invalid/billing/config',r=>r.fulfill({json:{beta:{active:true,endsAt:'2026-12-01T00:00:00Z'},enabled:false}}));
 await page.route('https://api.fixture.invalid/api/billing',r=>r.fulfill({json:{beta:{active:true,endsAt:'2026-12-01T00:00:00Z'},full:true,enabled:false,hasCustomer:false}}));
 await page.goto(base);await page.waitForFunction(()=>window.cambridgeDrive&&document.querySelector('#loadOv').hidden&&document.querySelector('#signInGate').hidden);await page.evaluate(()=>document.fonts.ready);
 const shot=async name=>{await page.screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:88,animations:'disabled'});console.log('Captured',name);};
 if(!process.argv.includes('--routes-only')&&!process.argv.includes('--chase-only')){
 await page.locator('#lobby [data-open="courseSheet"]').first().click();await shot('courses');await page.locator('#courseSheet [data-close]').click();
 await page.locator('#lobby [data-open="mockSheet"]').click();await shot('mock-tests');await page.locator('#mockSheet [data-close]').click();
 }
 if(!process.argv.includes('--chase-only')){
 await page.locator('#myRoutesBtn').click();await page.locator('#personalSavedRoutes').getByRole('button',{name:'View',exact:true}).click();await page.locator('#routePlace').fill('Cambridge, UK');
 await page.waitForFunction(()=>{const map=document.querySelector('#personalRouteMap'),tiles=[...map.querySelectorAll('img.leaflet-tile')];return tiles.length>0&&tiles.every(img=>img.complete&&img.naturalWidth>0)&&document.querySelector('#routeReady').hidden===false;});
 await page.waitForTimeout(600);await shot('my-routes');await page.locator('#personalRoutesSheet .x').click();
 }
 if(!process.argv.includes('--routes-only')){
 await page.evaluate(async()=>{const a=cambridgeDrive;await a.pick('mock','east-road',true);a.manual(true);a.setCam(0);for(let i=0;i<8;i++)a.frame(.1);});
 await shot('chase');
 if(!process.argv.includes('--chase-only')){
 await page.evaluate(()=>{cambridgeDrive.setCam(1);for(let i=0;i<8;i++)cambridgeDrive.frame(.1);});
 await page.waitForFunction(()=>cambridgeDrive.cockpit);await page.evaluate(()=>{for(let i=0;i<8;i++)cambridgeDrive.frame(.1);});await shot('cockpit');
 }
 }
 const commit=execFileSync('git',['rev-parse','HEAD'],{cwd:app,encoding:'utf8'}).trim();
 fs.writeFileSync(`${out}/provenance.json`,JSON.stringify({simulatorRepository:'ravitejamanchala/cambridge-learner-driv',commit,viewport:{width:1600,height:1000},screenshots:['chase','cockpit','courses','mock-tests','my-routes'],method:'Chromium screenshots of the actual simulator checkout. Authentication/account responses are isolated test fixtures; no real account data. Bundled East Road map. My routes uses a real OSRM route from routing.openstreetmap.de captured on 2026-11-01 and visible OpenStreetMap tiles, with attribution. No retouching or generated UI.'},null,2)+'\n');
}finally{await browser?.close();server.kill();}
