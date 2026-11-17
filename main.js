// main.js — 各モジュールを結線:カメラ・HUD・ゲームループ
import {xf} from "./math.js";
import {buildFT} from "./model.js";
import {buildChiHa} from "./chiha.js";
import {Renderer} from "./renderer.js";
import {Input} from "./input.js";
import {Effects} from "./effects.js";
import {Tank} from "./tank.js";
import {Sfx} from "./sfx.js";

const $=id=>document.getElementById(id);
const cv=$('c');
let R;try{R=new Renderer(cv);}catch(e){$('err').style.display='flex';throw e;}
/* ---- vehicles ---- */
const VEHICLES=[{build:buildFT},{build:buildChiHa}];
function vehicle(i){const e=VEHICLES[i];if(!e.v){e.v=e.build();e.meshes={};for(const k in e.v.geo)e.meshes[k]=R.mesh(e.v.geo[k]);}return e;}
let cur=vehicle(0),meshes=cur.meshes;

const input=new Input(),fx=new Effects(),sfx=new Sfx(),tank=new Tank(cur.v);
function selectVehicle(i){cur=vehicle(i);meshes=cur.meshes;tank.setVehicle(cur.v);fx.clear();$('dead').classList.remove('show');
  cam.dist=cur.v.camDist;cam.goal=null;
  $('vName').textContent=cur.v.name;$('vEyebrow').textContent=cur.v.eyebrow;$('vSub').textContent=cur.v.sub;
  $('specs').innerHTML=cur.v.specs.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('');
  const g=cur.v.weapon==='gun',hm=!!cur.v.hullMG;
  $('keyFire').textContent=g?'主砲 発砲(装填 約3秒)':'機銃 発砲(連射)';$('keyElev').textContent=g?'主砲 上 / 下':'機銃 上 / 下';
  $('lblElev').textContent=g?'主砲':'機銃';$('bFire').textContent=g?'● 主砲':'● 発砲';
  $('keyMG').textContent=hm?'車体機銃 発砲(連射)':'機銃 発砲(Space と同じ)';
  document.querySelectorAll('.mgOnly').forEach(el=>el.style.display=hm?'':'none');
  document.querySelectorAll('[data-veh]').forEach((b,k)=>b.setAttribute('aria-pressed',k===i));}
document.querySelectorAll('[data-veh]').forEach((b,i)=>b.addEventListener('click',()=>selectVehicle(i)));
input.on('gesture',()=>{sfx.ensure();sfx.resume();});
addEventListener('pointerdown',()=>{sfx.ensure();sfx.resume();},{once:false});

/* ---- camera ---- */
const cam={yaw:.75,pitch:.26,dist:8.2,goal:null,drag:false,camo:1,camoT:1,auto:false,autoT:0};
const VIEWS=[[.75,.26,8.2],[1.5708,.06,8.2],[.0001,.08,7],[3.9,.3,8.2],[1.5708,1.45,9]];let viewIdx=0;
const setView=i=>{viewIdx=(i+VIEWS.length)%VIEWS.length;const[y,p,d]=VIEWS[viewIdx];cam.goal={y,p,d};
  document.querySelectorAll('[data-v]').forEach((b,k)=>b.setAttribute('aria-pressed',k===viewIdx));};
document.querySelectorAll('[data-v]').forEach((b,i)=>b.addEventListener('click',()=>setView(i)));
const ptrs=new Map();let pinch=0;
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,[e.clientX,e.clientY]);cam.drag=true;cam.goal=null;
  if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch=Math.hypot(a[0]-b[0],a[1]-b[1]);}});
cv.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;const p=ptrs.get(e.pointerId),dx=e.clientX-p[0],dy=e.clientY-p[1];
  ptrs.set(e.pointerId,[e.clientX,e.clientY]);
  if(ptrs.size===1){cam.yaw+=dx*.006;cam.pitch=Math.min(1.5,Math.max(.02,cam.pitch+dy*.005));}
  else if(ptrs.size===2){const[a,b]=[...ptrs.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch)cam.dist=Math.min(18,Math.max(3,cam.dist*pinch/d));pinch=d;}});
const up=e=>{ptrs.delete(e.pointerId);if(!ptrs.size)cam.drag=false;pinch=0;};
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('wheel',e=>{e.preventDefault();cam.goal=null;cam.dist=Math.min(18,Math.max(3,cam.dist*Math.exp(e.deltaY*.0012)));},{passive:false});
const dark=matchMedia('(prefers-color-scheme: dark)');

/* ---- on-screen buttons ---- */
document.querySelectorAll('[data-k]').forEach(b=>input.bindButton(b,b.dataset.k));
const toggles={camo:$('tCamo'),auto:$('tAuto'),snd:$('tSnd')};
const setToggle=(k,v)=>{toggles[k].setAttribute('aria-pressed',v);if(k==='camo')cam.camoT=v?1:0;if(k==='auto')cam.auto=v;if(k==='snd')sfx.enabled=v;};
for(const k in toggles)toggles[k].addEventListener('click',()=>setToggle(k,toggles[k].getAttribute('aria-pressed')!=='true'));
$('bReset').addEventListener('click',()=>doReset());
$('bReset2').addEventListener('click',()=>doReset());
$('bHit').addEventListener('click',()=>callHit());$('bHitMG').addEventListener('click',()=>callHitMG());
selectVehicle(0);

/* ---- game actions ---- */
function callHit(){if(!tank.alive)return;
  const T=tank.v.TUR,c=xf(tank.matrix,[(Math.random()-.5)*2.2,T.y-.4+Math.random()*.5,(Math.random()-.5)*1.1]);
  fx.incoming(c,p=>{const d=tank.hit(p,fx,sfx);if(d!==undefined)flashDmg(d);});}
function hitPoint(){const T=tank.v.TUR;return xf(tank.matrix,[(Math.random()-.5)*2.6,T.y-.6+Math.random()*.9,(Math.random()-.5)*1.2]);}
function callHitMG(){if(!tank.alive)return;
  fx.incomingBurst(hitPoint,8,p=>{const d=tank.hitMG(p,fx,sfx);if(d>0)flashDmg(d);});}
function doReset(){tank.reset();fx.clear();$('dead').classList.remove('show');cam.goal=null;}
function flashDmg(d){const el=$('dmg');el.textContent='-'+d;el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');}

/* ---- HUD ---- */
const hpBar=$('hpBar'),hpNum=$('hpNum'),stat=$('stat'),odo=$('odo');
function hud(){const r=Math.max(0,tank.hp)/tank.maxHp;hpBar.style.width=(r*100)+'%';
  hpBar.className=r>.5?'':(r>.25?'warn':'crit');hpNum.textContent=Math.max(0,tank.hp)+' / '+tank.maxHp;
  stat.textContent=tank.alive?(Math.abs(tank.speed)>.05?'走行中':'待機'):'大破';
  odo.textContent=`被弾 砲弾 ${tank.hits}・機銃弾 ${tank.mgHits} · 発射 ${tank.shots} 発 · 走行 ${tank.dist.toFixed(0)} m`;
  if(!tank.alive&&!$('dead').classList.contains('show')){$('dead').classList.add('show');$('deadMsg').textContent=`耐久力が 0 を割り込みました(砲弾 ${tank.hits} 発・機銃弾 ${tank.mgHits} 発)`;}}

/* ---- loop ---- */
let last=0;
function frame(t){
  const dt=Math.min(.05,(t-(last||t))/1000);last=t;
  if(input.pressed('reset'))doReset();
  if(input.pressed('hit'))callHit();
  if(input.pressed('hitMG'))callHitMG();
  if(input.pressed('camo'))setToggle('camo',cam.camoT<.5);
  if(input.pressed('auto'))setToggle('auto',!cam.auto);
  if(input.pressed('view'))setView(viewIdx+1);
  if(input.pressed('veh'))selectVehicle((VEHICLES.indexOf(cur)+1)%VEHICLES.length);
  if(cam.auto&&tank.alive){cam.autoT-=dt;if(cam.autoT<=0){cam.autoT=2+Math.random()*3;if(Math.random()<.5)callHit();else callHitMG();}}
  tank.update(dt,input,fx,sfx);fx.update(dt);input.endFrame();

  if(cam.goal){const g=cam.goal,k=1-Math.exp(-dt*6);let dy=g.y-cam.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));
    cam.yaw+=dy*k;cam.pitch+=(g.p-cam.pitch)*k;cam.dist+=(g.d-cam.dist)*k;
    if(Math.abs(dy)<.002&&Math.abs(g.p-cam.pitch)<.002)cam.goal=null;}
  cam.camo+=(cam.camoT-cam.camo)*(1-Math.exp(-dt*7));
  const h=tank.heading,ty=tank.v.TUR.y*.65,target=[tank.pos[0]-.45*Math.cos(h),ty,tank.pos[2]+.45*Math.sin(h)];
  const yaw=cam.yaw-h;                                  // カメラは車体に追従
  const asp=cv.clientWidth/cv.clientHeight,dd=cam.dist*(asp<1?1+(1-asp)*.8:1),cp=Math.cos(cam.pitch);
  const eye=[target[0]+dd*cp*Math.cos(yaw),target[1]+dd*Math.sin(cam.pitch),target[2]+dd*cp*Math.sin(yaw)];
  const bg=dark.matches?[.098,.102,.106]:[.863,.847,.808],gcol=dark.matches?[.26,.25,.235]:[.74,.722,.68];
  R.draw({items:tank.items(meshes),particles:fx.render(),eye,target,center:[tank.pos[0],tank.pos[2]],bg,gcol,camo:cam.camo,palette:tank.v.palette});
  hud();requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.__ft={tank,fx,cam,input,setView,selectVehicle};   // デバッグ用
