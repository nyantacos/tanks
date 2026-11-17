// panzer1.js — I号戦車 A型(Panzerkampfwagen I Ausf. A)の形状定義と車両仕様
import {M,ID,tr,sc,rx,ry,rz,AZ,AX} from "./math.js";
import {Geo,box,cyl,sphere,loft,rivet,rivLine,plate} from "./geometry.js";
import {trackPath} from "./track.js";
import {C as C0} from "./model.js";
const PG=[.30,.31,.32];                          // ダークグレー(単色塗装)
const C={...C0,paint:PG};

const rivetP=(g,m,p,r=.013,col=PG,pt=1)=>rivet(g,m,p,r,col,pt);
const rivLineP=(g,m,a,b,n,r)=>{for(let i=0;i<n;i++){const t=n===1?0:i/(n-1);rivetP(g,m,[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],r);}};

export function buildPanzer1(){
/* ---------- layout ---------- */
const SPR={x:1.70,y:.46,r:.22};                 // 起動輪(前)
const IDL={x:-1.80,y:.27,r:.27};                // 誘導輪(後・接地)
const RWX=[1.02,.40,-.30,-.95], RWY=.215, RWR=.215;   // 転輪 4(前2・後2でボギー)
const RRX=[1.12,.15,-.85], RRY=.62, RRR=.06;    // 上部転輪 3
const ZT=.90, TW=.28;                           // 履帯中心の z、履帯幅
const ROOF=1.16;                                // 戦闘室の天板高さ
const TUR={x:.12,y:ROOF,z:.27}, TH=.50;         // 砲塔(戦闘室の右寄り)
const path=trackPath([SPR,IDL,{x:RWX[0],y:RWY,r:RWR},{x:RWX[3],y:RWY,r:RWR},
  ...RRX.map(x=>({x,y:RRY,r:RRR}))],.5);
const NL=Math.round(path.len/.15), PITCH=path.len/NL;

/* ---------- HULL ---------- */
const hull=new Geo();
// 下部車体(側面プロファイル。前面は傾斜、後面はほぼ垂直)
loft(hull,ID,[[-2.00,.46],[-2.00,.93],[.95,.93],[1.40,.84],[1.98,.74],[1.98,.52],[1.72,.44],[-1.80,.44]],.72,C.paint);
// 戦闘室(側面は垂直、前面は傾斜、天板は平ら)
loft(hull,ID,[[-.62,.92],[.98,.92],[.98,1.02],[.74,ROOF],[-.62,ROOF]],.70,C.paint);
// 機関室(後部)上面:ルーバーと点検ハッチ
box(hull,tr(-1.30,.935,0),1.35,.014,1.30,C.paint);
for(let i=0;i<9;i++)box(hull,tr(-1.85+i*.12,.95,0),.05,.012,1.18,C.dark,0);
for(const s of[-1,1]){box(hull,tr(-1.02,.945,s*.40),.34,.016,.34,C.paint);cyl(hull,tr(-1.02,.96,s*.40),.03,.03,.02,10,C.steel,0);}
box(hull,tr(-.65,.935,0),.06,.03,1.3,C.paint);                         // 戦闘室後壁の裾
// 操縦手(左)バイザーとハッチ ― 戦闘室前面
box(hull,M(tr(.99,1.04,-.30),rz(.78)),.03,.12,.36,C.paint);
box(hull,M(tr(1.01,1.06,-.30),rz(.78)),.012,.016,.26,C.dark,0);
box(hull,tr(.52,ROOF+.012,-.30),.40,.024,.38,C.paint);                  // 操縦手ハッチ
cyl(hull,M(tr(.52,ROOF+.03,-.12),AX),.012,.012,.32,8,C.paint);
// 前面:傾斜板のボルト列と牽引フック、前照灯
rivLineP(hull,ID,[1.42,.835,-.62],[1.42,.835,.62],14);
rivLineP(hull,ID,[.985,1.0,-.62],[.985,1.0,.62],12);
for(const s of[-1,1]){box(hull,tr(1.99,.58,s*.50),.06,.10,.10,C.steel,0);}
for(const s of[-1,1])box(hull,tr(1.12,1.02,s*.62),.12,.10,.14,C.paint);   // 左右の隅の補強
cyl(hull,M(tr(1.58,.99,-.60),AX),.07,.065,.12,12,C.paint);cyl(hull,M(tr(1.64,.99,-.60),AX),.06,.06,.01,12,[.85,.85,.75],0);
// 側面:ボルト列と点検扉
for(const s of[-1,1]){const z=s*.724;
  rivLineP(hull,ID,[-1.9,.55,z],[1.85,.55,z],28);rivLineP(hull,ID,[-1.9,.88,z],[.9,.88,z],22);
  box(hull,tr(-.1,.72,s*.728),.5,.28,.012,C.paint);
  rivLineP(hull,ID,[-.3,.60,s*.738],[.1,.60,s*.738],5);rivLineP(hull,ID,[-.3,.84,s*.738],[.1,.84,s*.738],5);
  const zc=s*(.70+.004);
  rivLineP(hull,ID,[-.55,1.12,zc],[.9,1.12,zc],14);rivLineP(hull,ID,[-.55,.97,zc],[.9,.97,zc],14);
  // 泥よけ(薄いフェンダー)
  box(hull,tr(0,.80,s*ZT),3.6,.016,TW+.04,C.paint);
  box(hull,M(tr(1.98,.76,s*ZT),rz(-.35)),.34,.016,TW+.04,C.paint);
  // 工具:ジャッキとシャベル
  box(hull,tr(-.55,.82,s*(ZT-.03)),.55,.04,.1,C.steel,0);cyl(hull,M(tr(-1.30,.83,s*(ZT+.02)),AX),.02,.02,.4,8,C.steel,0);}
// 排気管(後部右)とマフラー
cyl(hull,M(tr(-1.97,.78,.46),AZ),.07,.07,.2,12,C.rust,0);
cyl(hull,M(tr(-2.06,.74,.46),AX),.06,.06,.5,12,C.rust,0);
// 後面の牽引具
for(const s of[-1,1])box(hull,tr(-2.04,.62,s*.5),.08,.1,.1,C.steel,0);
// 足回り:リーフスプリング式サスペンション
for(const s of[-1,1]){const z=s*ZT;
  box(hull,tr(.1,.47,z-s*.06),3.2,.07,.07,C.paint);                      // 下部フレーム
  for(const x of RWX){cyl(hull,M(tr(x,RWY,z),AZ),RWR,RWR,.08,22,C.steel,0);cyl(hull,M(tr(x,RWY,z),AZ),RWR-.04,RWR-.04,.12,22,C.paint);
    cyl(hull,M(tr(x,RWY,z),AZ),.06,.06,.15,10,C.steel,0);
    for(let k=0;k<6;k++)rivetP(hull,ID,[x+Math.cos(k*1.047)*.115,RWY+Math.sin(k*1.047)*.115,z+s*.062],.011,C.steel,0);}
  // ボギー:2輪ずつを腕で束ねて板ばねで吊る
  for(const grp of[[0,1],[2,3]]){const x0=RWX[grp[0]],x1=RWX[grp[1]],xc=(x0+x1)/2;
    plate(hull,ID,[x0,RWY],[xc,.58],.07,.06,C.paint,1,z+s*.07);plate(hull,ID,[x1,RWY],[xc,.58],.07,.06,C.paint,1,z+s*.07);
    for(let k=0;k<4;k++)box(hull,tr(xc,.64+k*.012,z-s*.04),.6-k*.1,.012,.08,C.steel,0);   // 板ばね
    box(hull,tr(xc,.60,z),.10,.12,.1,C.paint);}
  for(const x of RRX){cyl(hull,M(tr(x,RRY,z),AZ),RRR,RRR,.1,12,C.steel,0);box(hull,tr(x,RRY-.06,z-s*.08),.05,.12,.03,C.paint);}
  cyl(hull,M(tr(SPR.x,SPR.y,z-s*.10),AZ),.07,.07,.12,10,C.paint);cyl(hull,M(tr(IDL.x,IDL.y,z-s*.10),AZ),.06,.06,.12,10,C.paint);
  plate(hull,ID,[IDL.x,IDL.y],[IDL.x+.35,.50],.09,.07,C.paint,1,z-s*.12);}

/* ---------- TURRET ---------- */
const tur=new Geo();
// 砲塔本体(八角形・後部がやや大きい。側面は内傾)
cyl(tur,tr(0,TH/2,0),.45,.40,TH,8,C.paint,1,{flat:true,phase:Math.PI/8});
cyl(tur,tr(0,TH+.01,0),.405,.395,.02,8,C.paint,1,{flat:true,phase:Math.PI/8});
cyl(tur,tr(0,.01,0),.48,.48,.03,32,C.paint);
for(let i=0;i<8;i++){const a=i*Math.PI/4;
  for(let k=0;k<3;k++){const y=.09+k*.15,r=.43-.05*y/TH+.004;rivetP(tur,ID,[Math.cos(a)*r,y,Math.sin(a)*r],.011);}
  rivetP(tur,ID,[Math.cos(a+Math.PI/8)*.37,TH+.022,Math.sin(a+Math.PI/8)*.37],.01);}
// 防盾(2丁の機関銃の基部)
box(tur,tr(.45,.28,0),.12,.30,.46,C.paint);
box(tur,tr(.51,.28,0),.02,.20,.34,C.dark,0);
for(const s of[-1,1])for(const y of[.18,.38])rivetP(tur,ID,[.512,y,s*.19],.012);
// 照準用スリット(左右)とピストルポート
for(const a of[2.0,-2.0,2.8,-2.8]){box(tur,M(tr(Math.cos(a)*.41,.30,Math.sin(a)*.41),ry(-a)),.02,.014,.10,C.dark,0);}
cyl(tur,M(tr(-.40,.20,.0),AX),.03,.03,.02,10,C.steel,0);
// 天板のハッチ(観音開き)
box(tur,tr(-.06,TH+.034,.0),.30,.016,.20,C.paint);box(tur,tr(-.06,TH+.04,.0),.012,.008,.19,C.dark,0);
cyl(tur,M(tr(-.20,TH+.045,.0),AX),.012,.012,.2,8,C.paint);
// 後部の雑具箱
box(tur,tr(-.46,.20,0),.08,.22,.36,C.paint);

/* ---------- GUN 7.92mm MG13 連装(砲塔と共に動く) ---------- */
const GUNP=[.52,.28,0];
const gun=new Geo();
sphere(gun,sc(.07,.07,.12),14,8,C.paint);                    // 防盾内の球
for(const s of[-1,1]){const z=s*.075;
  cyl(gun,M(tr(.06,0,z),AX),.032,.03,.10,10,C.paint);
  cyl(gun,M(tr(.18,0,z),AX),.026,.024,.14,10,C.gun,0);
  cyl(gun,M(tr(.30,0,z),AX),.019,.017,.14,10,C.gun,0);       // 銃身
  for(let i=0;i<5;i++)cyl(gun,M(tr(.16+i*.018,0,z),AX),.035,.035,.008,12,C.gun,0);  // 放熱孔つき遮熱筒
  cyl(gun,M(tr(.385,0,z),AX),.022,.02,.04,10,C.gun,0);}     // 消炎器
box(gun,tr(.03,0,0),.04,.06,.2,C.paint);

/* ---------- wheels & track link ---------- */
const sprocket=new Geo();
cyl(sprocket,AZ,.23,.23,.07,24,C.paint);cyl(sprocket,AZ,.14,.14,.11,14,C.paint);
for(let k=0;k<12;k++)box(sprocket,M(rz(k*Math.PI/6),tr(.24,0,0)),.045,.05,.075,C.steel,0);
for(let k=0;k<6;k++){const a=k*Math.PI/3;cyl(sprocket,M(tr(Math.cos(a)*.17,Math.sin(a)*.17,0),AZ),.028,.028,.075,10,C.dark,0);}
const idler=new Geo();
cyl(idler,AZ,.27,.27,.08,28,C.steel,0);cyl(idler,AZ,.23,.23,.11,28,C.paint);
for(let k=0;k<6;k++){const a=k*Math.PI/3;cyl(idler,M(tr(Math.cos(a)*.15,Math.sin(a)*.15,0),AZ),.04,.04,.115,10,C.dark,0);}
cyl(idler,AZ,.07,.07,.15,12,C.paint);
const link=new Geo();
box(link,ID,PITCH*.92,.024,TW,C.track,0);
box(link,tr(0,.026,0),.03,.026,TW,C.track,0);               // グローサー
for(const z of[-.05,.05])box(link,tr(0,-.032,z),.045,.045,.022,C.track,0);   // センターガイド

return {
  id:'panzer1', name:'I号戦車 A型', eyebrow:'Panzerkampfwagen I Ausf. A · 1934', sub:'7.92 mm MG13 連装・クルップ空冷エンジン・ダークグレー',
  specs:[['全長','4.02 m'],['全幅','2.06 m'],['全高','1.72 m'],['重量','約 5.4 t'],['乗員','2 名'],['武装','7.92 mm MG13 ×2(連装)'],['機関','クルップ M305 直6・57 hp'],['最高速度','約 37 km/h']],
  geo:{hull,tur,gun,idler,sprocket,link},
  IDL,SPR,ZT,TUR,GUNP,path,NL,PITCH,MUZZLE:[.42,0,0],MUZZLES:[[.42,0,-.075],[.42,0,.075]],
  camoOff:{tur:[5.4,2.1,6.6],gun:[1.7,9.2,3.3],idler:[3,5,2],sprocket:[7,2,4]},
  palette:[PG,PG,PG],plain:true,
  maxHp:90,maxSpeed:4.9,turnRate:1.2,fireInterval:1/11,weapon:'mg',turretRate:1.0,
  flyY:.30,camDist:7.8,elevMin:-12,elevMax:22,
};
}
