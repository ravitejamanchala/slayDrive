const script = src => new Promise((resolve,reject) => {
  const element = document.createElement('script'); element.src=src;
  element.onload=resolve; element.onerror=()=>reject(new Error('Simulator could not load.'));
  document.head.append(element);
});
let libraries;
export async function createDrive(container) {
  libraries ||= script('/sim/vendor/three.min.js').then(()=>script('/sim/vendor/GLTFLoader.js'));
  await libraries;
  const [{buildNet},{buildWorld},{createPlayer,loadCarModel},{CARS}] = await Promise.all([
    import('./js/net.js'),import('./js/world.js'),import('./js/car.js'),import('./js/cars.js')
  ]);
  const T=window.THREE;
  const renderer=new T.WebGLRenderer({antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.outputEncoding=T.sRGBEncoding;
  const scene=new T.Scene();
  const camera=new T.PerspectiveCamera(72,9/16,.1,900);
  // A closed rounded circuit, rendered by the app's road and city builders.
  const points=[];
  for(const [cx,cz,start] of [[45,-45,-90],[45,45,0],[-45,45,90],[-45,-45,180]]) {
    for(let j=0;j<=45;j++) { const angle=(start+j*2)*Math.PI/180;points.push({x:cx+27*Math.cos(angle),z:cz+27*Math.sin(angle)}); }
  }
  const dense=[];
  for(let i=0;i<points.length;i++) {
    const a=points[i],b=points[(i+1)%points.length],count=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)));
    for(let j=0;j<count;j++)dense.push({x:a.x+(b.x-a.x)*j/count,z:a.z+(b.z-a.z)*j/count});
  }
  dense.push({...dense[0]});
  const flat=dense.flatMap(p=>[Math.round(p.x*10),Math.round(p.z*10)]);
  const net=buildNet({origin:[0,0],kx:1,kz:1,names:['Practice circuit'],classes:['residential'],ways:[[0,0,20,0,0,8,0,2]],nodes:[flat[0],flat[1]],edges:[[0,0,0,flat]],stops:[],zebras:[],giveways:[],minis:[],rbs:[],cycleRings:[]});
  const world=buildWorld(scene,net,{puffins:[],lightState:()=> 'G'});
  world.setShadows(false);
  const player=createPlayer(scene);
  const path=dense.slice(0,-1).map((p,i)=>{const q=dense[(i+1)% (dense.length-1)],d=Math.hypot(q.x-p.x,q.z-p.z)||1;return{x:p.x+(q.z-p.z)/d*1.8,z:p.z-(q.x-p.x)/d*1.8};});
  player.place(path[0].x,path[0].z,Math.atan2(-(path[1].x-path[0].x),-(path[1].z-path[0].z)));
  let running=false,frame=0,last=0,clock=0,token=0,nearest=0;
  const cache=new Map();
  async function select(id) {
    const spec=CARS.find(c=>c.id===id);if(!spec)throw new Error('Unknown car');
    const request=++token;
    if(!cache.has(id))cache.set(id,loadCarModel('/sim/'+spec.url,spec.supplied?{yaw:0,hide:null,maxWidth:1.8,wheel:m=>/Wheel/i.test(m.name)||/Wheel/i.test(m.parent?.name||'')}:{}).catch(error=>{cache.delete(id);throw error;}));
    const model=await cache.get(id);if(request!==token)return;
    player.setModel(model);player.sync(clock);render(1);return spec.title;
  }
  const target=new T.Vector3(),look=new T.Vector3();let first=true;
  function render(dt) {
    const fx=-Math.sin(player.th),fz=-Math.cos(player.th);
    target.set(player.x-fx*7,3.65,player.z-fz*7);
    const smoothing=first?1:1-Math.exp(-dt*7);
    camera.position.lerp(target,smoothing);
    target.set(player.x+fx*4,-1.6,player.z+fz*4);look.lerp(target,smoothing);camera.lookAt(look);first=false;
    world.updateChunks(player.x,player.z,1);world.updateSun(player.x,player.z);world.updateSignals(clock);
    renderer.render(scene,camera);
  }
  function step(dt) {
    let best=Infinity;
    for(let i=0;i<path.length;i++){const p=path[i],d=(p.x-player.x)**2+(p.z-player.z)**2;if(d<best){best=d;nearest=i;}}
    const q=path[(nearest+8)%path.length];let angle=Math.atan2(-(q.x-player.x),-(q.z-player.z))-player.th;
    while(angle>Math.PI)angle-=Math.PI*2;while(angle< -Math.PI)angle+=Math.PI*2;
    player.update(dt,{throttle:player.v<5? .65:0,brake:player.v>5.4?.25:0,steer:Math.max(-1,Math.min(1,angle*2))},'road');
    clock+=dt;player.sync(clock);
  }
  function tick(time) { if(!running)return;const dt=Math.min((time-last)/1000||.016,.05);last=time;step(dt);render(dt);frame=requestAnimationFrame(tick); }
  function setRunning(value){running=value;cancelAnimationFrame(frame);if(running){last=performance.now();frame=requestAnimationFrame(tick);}}
  function resize(){const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();render(1);}
  renderer.domElement.setAttribute('aria-label','Live simulator with the selected car in chase view');renderer.domElement.setAttribute('role','img');container.append(renderer.domElement);
  new ResizeObserver(resize).observe(container);
  await select('rx7');resize();
  return {select,setRunning,getState:()=>({x:player.x,z:player.z,speed:player.v,car:player.mesh.uuid}),dispose:()=>{setRunning(false);renderer.dispose();}};
}
