// Real gameplay recordings. Usage: node --use-env-proxy scripts/capture-hero-loops.mjs /path/to/simulator
// Requires ffmpeg, Chromium and installed simulator/website dependencies.
import fs from 'node:fs';
import {captureFonts} from './capture-fonts.mjs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {spawn,execFileSync} from 'node:child_process';
const app=path.resolve(process.argv[2]),require=createRequire(path.join(app,'package.json'));
const {chromium}=require('playwright'),three=path.dirname(require.resolve('three/package.json'));
const {installAuthFixture}=await import(pathToFileURL(path.join(app,'tests/auth-fixture.mjs')));
const port=8916,url=`http://127.0.0.1:${port}`,out='public/media/current',fps=30,seconds=6;
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',app],{stdio:'ignore'});
const fonts=await captureFonts(app);let loadedFonts;
let browser;
try {
 for(let i=0;i<100;i++){try{const r=await fetch(url);await r.arrayBuffer();if(r.ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [name,camera] of (process.argv.includes('--cockpit-only')?[['cockpit',1]]:[['chase',0],['cockpit',1]])){
  const page=await browser.newPage({viewport:{width:1920,height:1200},deviceScaleFactor:1}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:three+'/build/three.min.js',contentType:'application/javascript'}));
  await page.route('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js',r=>r.fulfill({path:three+'/examples/js/loaders/GLTFLoader.js',contentType:'application/javascript'}));
  await fonts.install(page);
  await installAuthFixture(page);await page.goto(url);await page.waitForFunction(()=>window.cambridgeDrive&&document.querySelector('#loadOv').hidden&&document.querySelector('#signInGate').hidden);loadedFonts=await fonts.ready(page);
  await page.evaluate(async camera=>{const a=cambridgeDrive;a.manual(true);await a.pick('mock','east-road',true);a.manual(true);a.setCam(camera);},camera);
  if(camera===1)await page.waitForFunction(()=>{cambridgeDrive.frame(1/30);return cambridgeDrive.cockpit;},{},{timeout:60000});
  await page.waitForTimeout(1000);
  await page.evaluate(()=>{
   const a=cambridgeDrive,p=a.player;
   a.addInput(()=>{const q=a.lanePoint(Math.min(a.test.route.len,a.test.sRoute+15));let angle=Math.atan2(-(q.x-p.x),-(q.z-p.z))-p.th;while(angle>Math.PI)angle-=2*Math.PI;while(angle< -Math.PI)angle+=2*Math.PI;return {throttle:p.v<6?0.65:0,brake:p.v>7?0.2:0,steer:a.steerFor(angle,3,p.v)};});
   a.look();for(let i=0;i<40;i++)a.frame(1/20);
  });
  const start=await page.evaluate(()=>({x:cambridgeDrive.player.x,z:cambridgeDrive.player.z}));
  const file=`${out}/${name}-loop-hd.mp4`;
  const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(fps),'-i','-','-an','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',file],{stdio:['pipe','inherit','inherit']});
  const done=new Promise((resolve,reject)=>{ff.on('error',reject);ff.on('close',code=>code===0?resolve():reject(Error('ffmpeg '+code)));});
  for(let i=0;i<seconds*fps;i++){
   await page.evaluate(()=>cambridgeDrive.frame(1/30));
   const frame=await page.screenshot({type:'png'});
   if(!ff.stdin.write(frame))await new Promise(r=>ff.stdin.once('drain',r));
   if(i%40===0)console.log(name,'frame',i);
  }
  ff.stdin.end();await done;
  const end=await page.evaluate(()=>({x:cambridgeDrive.player.x,z:cambridgeDrive.player.z}));
  if(Math.hypot(end.x-start.x,end.z-start.z)<10)throw Error('Vehicle did not drive: '+name);
  if(errors.length)throw Error(errors.join('; '));
  execFileSync('ffmpeg',['-y','-loglevel','error','-i',file,'-vf','fps=10,scale=480:300:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',`${out}/${name}-loop.gif`]);
  execFileSync('ffmpeg',['-y','-loglevel','error','-i',file,'-frames:v','1','-q:v','2',`${out}/${name}-hd.jpg`]);
  console.log('Recorded',name,fs.statSync(file).size,'bytes');await page.close();
 }
 fs.writeFileSync(`${out}/loops-provenance.json`,JSON.stringify({simulatorRepository:'ravitejamanchala/cambridge-learner-driv',commit:execFileSync('git',['rev-parse','HEAD'],{cwd:app,encoding:'utf8'}).trim(),seconds,fps,viewport:{width:1920,height:1200},video:{width:1920,height:1200,codec:"H.264",crf:18},fonts:{stylesheet:fonts.source,verified:loadedFonts},files:['chase-loop-hd.mp4','cockpit-loop-hd.mp4','chase-loop.gif','cockpit-loop.gif','chase-hd.jpg','cockpit-hd.jpg'],method:'Actual East Road simulator gameplay with its vehicle physics, scripted steering/throttle input and isolated account fixtures. Captured at fixed 30 Hz, lossless PNG frames encoded at native 1920×1200 as muted MP4 loops and downloadable GIFs. No synthetic gameplay or image generation.'},null,2)+'\n');
}finally{await browser?.close();server.kill();}
