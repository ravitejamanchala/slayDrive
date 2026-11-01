// Real gameplay recordings. Usage: node scripts/capture-hero-loops.mjs /path/to/simulator
// Requires ffmpeg, Chromium and installed simulator/website dependencies.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {spawn,execFileSync} from 'node:child_process';
const app=path.resolve(process.argv[2]),require=createRequire(path.join(app,'package.json'));
const {chromium}=require('playwright'),three=path.dirname(require.resolve('three/package.json'));
const {installAuthFixture}=await import(pathToFileURL(path.join(app,'tests/auth-fixture.mjs')));
const port=8916,url=`http://127.0.0.1:${port}`,out='public/media/current',fps=20,seconds=6;
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',app],{stdio:'ignore'});
let browser;
try {
 for(let i=0;i<100;i++){try{const r=await fetch(url);await r.arrayBuffer();if(r.ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [name,camera] of (process.argv.includes('--cockpit-only')?[['cockpit',1]]:[['chase',0],['cockpit',1]])){
  const page=await browser.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:1}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:three+'/build/three.min.js',contentType:'application/javascript'}));
  await page.route('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js',r=>r.fulfill({path:three+'/examples/js/loaders/GLTFLoader.js',contentType:'application/javascript'}));
  await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:['Fredoka','Geist'].map(n=>`@font-face{font-family:${n};font-weight:100 900;src:url('/capture-font-${n.toLowerCase()}.woff2')}`).join('')}));
  await page.route('**/capture-font-*.woff2',r=>{const n=/capture-font-(.*).woff2/.exec(r.request().url())[1];return r.fulfill({path:`node_modules/@fontsource-variable/${n}/files/${n}-latin-wght-normal.woff2`,contentType:'font/woff2'});});
  await installAuthFixture(page);await page.goto(url);await page.waitForFunction(()=>window.cambridgeDrive&&document.querySelector('#loadOv').hidden&&document.querySelector('#signInGate').hidden);await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(async camera=>{const a=cambridgeDrive;a.manual(true);await a.pick('mock','east-road',true);a.manual(true);a.setCam(camera);},camera);
  if(camera===1)await page.waitForFunction(()=>{cambridgeDrive.frame(1/20);return cambridgeDrive.cockpit;},{},{timeout:60000});
  await page.waitForTimeout(1000);
  await page.evaluate(()=>{
   const a=cambridgeDrive,p=a.player;
   a.addInput(()=>{const q=a.lanePoint(Math.min(a.test.route.len,a.test.sRoute+15));let angle=Math.atan2(-(q.x-p.x),-(q.z-p.z))-p.th;while(angle>Math.PI)angle-=2*Math.PI;while(angle< -Math.PI)angle+=2*Math.PI;return {throttle:p.v<6?0.65:0,brake:p.v>7?0.2:0,steer:a.steerFor(angle,3,p.v)};});
   a.look();for(let i=0;i<40;i++)a.frame(1/20);
  });
  const start=await page.evaluate(()=>({x:cambridgeDrive.player.x,z:cambridgeDrive.player.z}));
  const file=`${out}/${name}-loop.mp4`;
  const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(fps),'-i','-','-vf','scale=1280:800','-an','-c:v','libx264','-preset','veryfast','-crf','27','-pix_fmt','yuv420p','-movflags','+faststart',file],{stdio:['pipe','inherit','inherit']});
  const done=new Promise((resolve,reject)=>{ff.on('error',reject);ff.on('close',code=>code===0?resolve():reject(Error('ffmpeg '+code)));});
  for(let i=0;i<seconds*fps;i++){
   await page.evaluate(()=>cambridgeDrive.frame(1/20));
   const jpg=await page.screenshot({type:'jpeg',quality:86});
   if(!ff.stdin.write(jpg))await new Promise(r=>ff.stdin.once('drain',r));
   if(i%40===0)console.log(name,'frame',i);
  }
  ff.stdin.end();await done;
  const end=await page.evaluate(()=>({x:cambridgeDrive.player.x,z:cambridgeDrive.player.z}));
  if(Math.hypot(end.x-start.x,end.z-start.z)<10)throw Error('Vehicle did not drive: '+name);
  if(errors.length)throw Error(errors.join('; '));
  execFileSync('ffmpeg',['-y','-loglevel','error','-i',file,'-vf','fps=10,scale=480:300:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',`${out}/${name}-loop.gif`]);
  console.log('Recorded',name,fs.statSync(file).size,'bytes');await page.close();
 }
 fs.writeFileSync(`${out}/loops-provenance.json`,JSON.stringify({simulatorRepository:'ravitejamanchala/cambridge-learner-driv',commit:execFileSync('git',['rev-parse','HEAD'],{cwd:app,encoding:'utf8'}).trim(),seconds,fps,viewport:{width:1600,height:1000},video:{width:1280,height:800},files:['chase-loop.mp4','cockpit-loop.mp4','chase-loop.gif','cockpit-loop.gif'],method:'Actual East Road simulator gameplay with its vehicle physics, scripted steering/throttle input and isolated account fixtures. Captured at fixed 20 Hz, encoded as muted MP4 loops and downloadable GIFs. No synthetic gameplay or image generation.'},null,2)+'\n');
}finally{await browser?.close();server.kill();}
