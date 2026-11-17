// chiha.js — 九七式中戦車 チハ(初期型・57mm砲)の形状定義と車両仕様
import {M,ID,tr,sc,rx,ry,rz,AZ,AX} from "./math.js";
import {Geo,box,cyl,sphere,loft,rivet,rivLine,plate} from "./geometry.js";
import {trackPath} from "./track.js";
import {C} from "./model.js";

export function buildChiHa(){
/* ---------- layout ---------- */
const SPR={x:2.30,y:.56,r:.31};                 // 起動輪(前)
const IDL={x:-2.32,y:.50,r:.28};                // 誘導輪(後)
const RWX=[1.62,.95,.42,-.40,-.93,-1.62], RWY=.26, RWR=.255;   // 転輪 6
const RRX=[1.25,0,-1.25], RRY=.98, RRR=.09;     // 上部転輪 3
const ZT=.98, TW=.34;                           // 履帯中心の z、履帯幅
const SY=1.62;                                  // 戦闘室の天板高さ
const TUR={x:.45,y:SY,z:.10}, TH=.42;           // 砲塔(戦闘室の上、やや右寄り)
const W=.84;                                    // 車体半幅
const path=trackPath([SPR,IDL,{x:RWX[0],y:RWY,r:RWR},{x:RWX[5],y:RWY,r:RWR},
  ...RRX.map(x=>({x,y:RRY,r:RRR}))],.8);
const NL=Math.round(path.len/.17), PITCH=path.len/NL;

/* ---------- HULL ---------- */
const hull=new Geo();
// 車体本体(側面プロファイル)
loft(hull,ID,[[-2.75,1.12],[-2.62,.60],[-2.30,.46],[2.15,.46],[2.70,.74],[2.78,1.02],[2.55,1.26],[2.10,1.32],[-2.45,1.32],[-2.75,1.22]],W,C.paint);
// 戦闘室(砲塔はこの天板に載る。側面と前面は内傾)
loft(hull,ID,[[-.85,1.30,.84],[2.0,1.30,.84],[1.82,SY,.74],[-.6,SY,.74]],W,C.paint);
// 操縦手バイザー(右)と前方機銃(左)― 戦闘室前面
box(hull,M(tr(1.925,1.47,-.40),rz(.51)),.04,.14,.34,C.paint);
box(hull,M(tr(1.95,1.485,-.40),rz(.51)),.012,.016,.24,C.dark,0);
cyl(hull,M(tr(1.90,1.46,.40),rz(.51),AX),.13,.13,.05,16,C.paint);          // 機銃マウントの台座
// 機関室上面:ハッチ・ルーバー
for(const s of[-1,1]){box(hull,tr(-1.27,1.335,s*.42),.7,.014,.62,C.paint);
  for(const x of[-1.5,-1.05])cyl(hull,M(tr(x,1.35,s*.42),AX),.012,.012,.10,8,C.paint);
  box(hull,tr(-1.27,1.35,s*.14),.08,.018,.014,C.steel,0);}
for(let i=0;i<7;i++)box(hull,M(tr(-2.38+i*.1,1.335,0),rz(.45)),.035,.008,1.3,C.paint);
box(hull,tr(-2.08,1.332,0),.7,.004,1.3,C.dark,0);
// 砲塔リングと開口部
cyl(hull,tr(TUR.x,TUR.y-.02,TUR.z),.56,.56,.05,32,C.dark,0);
// 側面リベット列
for(const s of[-1,1]){const z=s*(W+.004);
  rivLine(hull,ID,[-2.3,.52,z],[2.1,.52,z],30);rivLine(hull,ID,[-2.4,1.27,z],[2.0,1.27,z],30);
  rivLine(hull,ID,[2.15,.55,z],[2.15,1.25,z],7);rivLine(hull,ID,[-2.3,.55,z],[-2.3,1.2,z],7);
  rivLine(hull,ID,[.3,.55,z],[.3,1.25,z],7);rivLine(hull,ID,[-1.2,.55,z],[-1.2,1.25,z],7);
  rivLine(hull,ID,[-.62,1.575,s*.757],[1.78,1.575,s*.757],18);rivLine(hull,ID,[-.8,1.345,s*.83],[1.95,1.345,s*.83],20);}
rivLine(hull,ID,[1.985,1.34,-.75],[1.985,1.34,.75],12);rivLine(hull,ID,[1.845,1.59,-.66],[1.845,1.59,.66],10);rivLine(hull,ID,[2.74,.78,-.75],[2.74,.78,.75],12);
// フェンダー(泥よけ)
for(const s of[-1,1]){box(hull,tr(0,1.12,s*ZT),4.9,.025,TW+.14,C.paint);
  box(hull,M(tr(2.65,1.03,s*ZT),rz(.6)),.45,.025,TW+.14,C.paint);box(hull,M(tr(-2.65,1.03,s*ZT),rz(-.6)),.45,.025,TW+.14,C.paint);
  for(let i=0;i<11;i++)box(hull,tr(-2.2+i*.44,1.135,s*(ZT-.12)),.04,.02,.2,C.paint);
  // 工具箱・ジャッキ
  box(hull,tr(-.6,1.24,s*(ZT+.02)),.7,.2,.26,C.paint);box(hull,tr(1.4,1.22,s*(ZT+.02)),.5,.16,.24,C.paint);
  cyl(hull,M(tr(.4,1.2,s*(ZT+.02)),AX),.05,.05,.5,10,C.steel,0);}
// 排気管(後部左右)
for(const s of[-1,1]){cyl(hull,M(tr(-2.55,1.08,s*.55),AX),.05,.05,.45,12,C.rust,0);
  box(hull,tr(-2.78,1.08,s*.55),.08,.2,.14,C.rust,0);}
// 前照灯、牽引具
cyl(hull,M(tr(2.42,1.37,-.62),AX),.09,.085,.14,14,C.paint);cyl(hull,M(tr(2.495,1.37,-.62),AX),.075,.075,.01,14,[.85,.85,.75],0);
for(const s of[-1,1])box(hull,tr(2.76,.70,s*.55),.14,.07,.05,C.steel,0);
// 足回り:ベルクランク式サスペンション
for(const s of[-1,1]){const z=s*ZT;
  box(hull,tr(0,.55,z),4.2,.10,.08,C.paint);                            // 下部フレーム
  for(const x of RWX){cyl(hull,M(tr(x,RWY,z),AZ),RWR,RWR,.09,20,C.steel,0);cyl(hull,M(tr(x,RWY,z),AZ),RWR-.05,RWR-.05,.13,20,C.paint);
    cyl(hull,M(tr(x,RWY,z),AZ),.07,.07,.17,10,C.steel,0);
    for(let k=0;k<6;k++)rivet(hull,ID,[x+Math.cos(k*1.047)*.13,RWY+Math.sin(k*1.047)*.13,z+s*.068],.012,C.steel,0);}
  for(const grp of[[1,2],[3,4]]){const xc=(RWX[grp[0]]+RWX[grp[1]])/2;      // ボギー腕と水平スプリング
    plate(hull,ID,[RWX[grp[0]],RWY],[xc,.62],.08,.07,C.paint,1,z+s*.06);plate(hull,ID,[RWX[grp[1]],RWY],[xc,.62],.08,.07,C.paint,1,z+s*.06);
    cyl(hull,M(tr(xc,.78,z-s*.06),AX),.065,.065,1.0,12,C.paint);box(hull,tr(xc,.7,z),.12,.18,.1,C.paint);}
  for(const i of[0,5]){const x=RWX[i];plate(hull,ID,[x,RWY],[x+(i?.35:-.35),.62],.08,.07,C.paint,1,z+s*.06);
    cyl(hull,M(tr(x+(i?.45:-.45),.78,z-s*.06),AX),.055,.055,.5,12,C.paint);}
  for(const x of RRX){cyl(hull,M(tr(x,RRY,z),AZ),RRR,RRR,.12,12,C.steel,0);box(hull,tr(x,RRY-.07,z-s*.1),.06,.14,.03,C.paint);}
  cyl(hull,M(tr(SPR.x,SPR.y,z-s*.12),AZ),.08,.08,.12,10,C.paint);cyl(hull,M(tr(IDL.x,IDL.y,z-s*.12),AZ),.07,.07,.12,10,C.paint);
  plate(hull,ID,[IDL.x,IDL.y],[IDL.x+.4,.62],.1,.08,C.paint,1,z-s*.14);}

/* ---------- TURRET ---------- */
const tur=new Geo();
// 砲塔本体(平面形:前が狭く後ろが広い非対称、側面は内傾)
cyl(tur,tr(0,TH/2,0),.60,.54,TH,20,C.paint,1,{flat:true});
cyl(tur,tr(0,TH+.012,0),.545,.53,.024,20,C.paint,1,{flat:true});
cyl(tur,tr(0,.01,0),.62,.62,.03,32,C.paint);
for(let i=0;i<20;i++){const a=i*Math.PI/10+Math.PI/20;
  for(let k=0;k<4;k++){const y=.07+k*.095,r=.60-.06*y/TH+.003;rivet(tur,ID,[Math.cos(a)*r,y,Math.sin(a)*r]);}
  rivet(tur,ID,[Math.cos(a)*.52,TH+.026,Math.sin(a)*.52]);}
// 防盾
box(tur,tr(.56,.21,0),.14,.30,.40,C.paint);
for(const s of[-1,1])for(const y of[.10,.32])rivet(tur,ID,[.635,y,s*.15],.013);
// 側面ビジョンスリット・ピストルポート
for(const a of[1.2,-1.2,2.4,-2.4]){box(tur,M(tr(Math.cos(a)*.565,.29,Math.sin(a)*.565),ry(-a)),.02,.016,.12,C.dark,0);
  cyl(tur,M(tr(Math.cos(a)*.575,.15,Math.sin(a)*.575),ry(-a),AX),.03,.03,.02,10,C.steel,0);}
// 後部ハッチ
box(tur,M(tr(-.57,.21,0),ry(0)),.02,.3,.40,C.paint);for(const y of[.1,.32])cyl(tur,M(tr(-.585,y,.21),AX),.012,.012,.05,8,C.paint);
// 車長キューポラ(後方左寄り)
const CX=-.16,CZ=-.18;
cyl(tur,tr(CX,TH+.11,CZ),.24,.23,.2,20,C.paint);
cyl(tur,tr(CX,TH+.215,CZ),.25,.25,.03,20,C.paint);
sphere(tur,M(tr(CX,TH+.23,CZ),sc(.23,.08,.23)),20,8,C.paint);
for(let k=0;k<6;k++){const a=k*1.047;box(tur,M(tr(CX+Math.cos(a)*.236,TH+.13,CZ+Math.sin(a)*.236),ry(-a)),.01,.012,.09,C.dark,0);}
// 装填手ハッチ(右前)
box(tur,tr(.12,TH+.03,.24),.34,.016,.28,C.paint);cyl(tur,M(tr(.12,TH+.045,.39),AX),.012,.012,.3,8,C.paint);
// 馬蹄形アンテナ(砲塔周囲)
{const R=.74,N=20;for(let i=0;i<N;i++){const a0=-2.5+5.0*i/N,a1=-2.5+5.0*(i+1)/N;
    const p0=[Math.cos(a0)*R,TH+.16,Math.sin(a0)*R],p1=[Math.cos(a1)*R,TH+.16,Math.sin(a1)*R];
    const mid=[(p0[0]+p1[0])/2,TH+.16,(p0[2]+p1[2])/2],dz=p1[2]-p0[2],dx=p1[0]-p0[0];
    cyl(tur,M(tr(...mid),ry(-Math.atan2(dz,dx)),AX),.012,.012,Math.hypot(dx,dz)*1.05,6,C.steel,0);}
  for(const a of[-2.3,-1.2,0,1.2,2.3]){cyl(tur,tr(Math.cos(a)*.5,TH+.09,Math.sin(a)*.5),.015,.015,.14,6,C.steel,0);
    plate(tur,M(tr(0,TH+.16,0),ry(-a)),[.5,0],[R,0],.012,.012,C.steel,0);}}
// 砲塔上の小部品
cyl(tur,tr(.3,TH+.04,-.13),.05,.05,.05,10,C.paint);

/* ---------- GUN 九七式五糎七戦車砲 ---------- */
const GUNP=[.62,.21,0];
const gun=new Geo();
cyl(gun,M(tr(.03,0,0),AX),.075,.072,.22,14,C.paint);
cyl(gun,M(tr(.25,0,0),AX),.058,.052,.26,14,C.gun,0);
cyl(gun,M(tr(.60,0,0),AX),.047,.042,.5,12,C.gun,0);
cyl(gun,M(tr(.86,0,0),AX),.045,.045,.04,12,C.gun,0);

/* ---------- 車体機銃 九七式車載重機関銃(ボールマウント) ---------- */
const mg=new Geo();
sphere(mg,sc(.1,.1,.1),14,8,C.paint);
cyl(mg,M(tr(.12,0,0),AX),.035,.03,.1,10,C.paint);
cyl(mg,M(tr(.24,0,0),AX),.02,.02,.26,10,C.gun,0);

/* ---------- wheels & track link ---------- */
const sprocket=new Geo();
cyl(sprocket,AZ,.29,.29,.07,24,C.paint);cyl(sprocket,AZ,.17,.17,.11,16,C.paint);
for(let k=0;k<14;k++)box(sprocket,M(rz(k*Math.PI/7),tr(.30,0,0)),.05,.06,.08,C.steel,0);
for(let k=0;k<6;k++){const a=k*Math.PI/3;cyl(sprocket,M(tr(Math.cos(a)*.22,Math.sin(a)*.22,0),AZ),.035,.035,.075,10,C.dark,0);}
const idler=new Geo();
cyl(idler,AZ,.28,.28,.09,24,C.steel,0);cyl(idler,AZ,.21,.21,.12,24,C.paint);
for(let k=0;k<6;k++){const a=k*Math.PI/3;cyl(idler,M(tr(Math.cos(a)*.14,Math.sin(a)*.14,0),AZ),.045,.045,.125,10,C.dark,0);}
const link=new Geo();
box(link,ID,PITCH*.92,.028,TW,C.track,0);
box(link,tr(0,.028,0),.035,.03,TW,C.track,0);                 // グローサー
for(const z of[-.06,.06])box(link,tr(0,-.035,z),.05,.05,.025,C.track,0);   // センターガイド

return {
  id:'chiha', name:'九七式中戦車 チハ', eyebrow:'Type 97 Chi-Ha · 1937', sub:'初期型・九七式五糎七戦車砲・馬蹄形アンテナ',
  specs:[['全長','5.55 m'],['全幅','2.33 m'],['全高','2.23 m'],['重量','約 15 t'],['乗員','4 名'],['武装','57 mm 戦車砲・7.7 mm 機銃 ×2'],['機関','三菱 V12 ディーゼル・170 hp'],['最高速度','約 38 km/h']],
  geo:{hull,tur,gun,mg,idler,sprocket,link},
  hullMG:{pos:[1.93,1.46,.40],muzzle:[.37,0,0],yawMax:.38,elevMin:-.17,elevMax:.3,off:[7.7,2.1,4.4]},
  IDL,SPR,ZT,TUR,GUNP,path,NL,PITCH,MUZZLE:[.90,0,0],
  camoOff:{tur:[3.1,7.3,2.7],gun:[5.2,1.4,8.9],idler:[1,4,7],sprocket:[2,6,3]},
  palette:[[.62,.52,.33],[.30,.38,.25],[.46,.30,.18]],
  maxHp:160,maxSpeed:5.0,turnRate:1.0,fireInterval:2.8,weapon:'gun',turretRate:.8,
  flyY:.36,camDist:10,elevMin:-8,elevMax:20,
};
}
