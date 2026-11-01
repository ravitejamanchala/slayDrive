// Fetch exactly the stylesheet declared by the simulator, including instrument fonts.
// Run capture scripts with node --use-env-proxy in managed cloud environments.
import fs from 'node:fs';
import path from 'node:path';
export async function captureFonts(app) {
 const html=fs.readFileSync(path.join(app,'index.html'),'utf8');
 const source=html.match(/href="(https:\/\/fonts\.googleapis\.com\/css2[^\"]+)"/)?.[1]?.replaceAll('&amp;','&');
 if(!source)throw Error('Simulator font stylesheet not found');
 const response=await fetch(source,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('Font stylesheet HTTP '+response.status);
 let css=await response.text();const files=new Map();
 for(const url of new Set([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map(m=>m[1]))){
  const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Font download HTTP '+r.status);
  const local='/capture-font-'+files.size+path.extname(new URL(url).pathname);
  files.set(local,Buffer.from(await r.arrayBuffer()));css=css.replaceAll(url,local);
 }
 return {source,async install(page){
  await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:css}));
  await page.route('**/capture-font-*',r=>{const key=new URL(r.request().url()).pathname;return r.fulfill({contentType:key.endsWith('.ttf')?'font/ttf':'font/woff2',body:files.get(key)});});
 },async ready(page){
  return page.evaluate(async()=>{
   const specs=['500 16px Fredoka','600 16px Fredoka','700 16px Fredoka','400 16px Geist','500 16px Geist','600 16px Geist','500 16px "Geist Mono"','600 16px "Geist Mono"'];
   for(const spec of specs){const faces=await document.fonts.load(spec);if(!faces.length||faces.some(f=>f.status!=='loaded'))throw Error('Capture font failed: '+spec);}
   await document.fonts.ready;return specs;
  });
 }};
}
