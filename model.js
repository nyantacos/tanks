// model.js — ルノーFTの形状定義(車体・砲塔・機銃・車輪・履帯リンク)
import {M,ID,tr,sc,rx,ry,rz,AZ,AX} from "./math.js";
import {Geo,box,cyl,sphere,loft,rivet,rivLine,plate} from "./geometry.js";

export const C={paint:[.42,.45,.34],steel:[.20,.20,.20],dark:[.045,.045,.045],track:[.24,.21,.19],
  wood:[.47,.32,.19],rust:[.37,.23,.15],gun:[.13,.13,.14]};

/* ---------- layout constants ---------- */
export const IDL={x:1.5,y:.60,r:.46}, SPR={x:-1.55,y:.42,r:.33}, RWY=.155, RWR=.09, ZT=.70;
export const RWX=[...Array(9).keys()].map(i=>-1.13+i*.26);
export const TUR={x:.15,y:1.45}, TH=.46;

/* ---------- track path (convex hull of wheel circles) ---------- */
export const path=(()=>{const pts=[];
  for(const c of[IDL,SPR,{x:RWX[0],y:RWY,r:.125},{x:RWX[8],y:RWY,r:.125}])
    for(let i=0;i<96;i++){const a=2*Math.PI*i/96;pts.push([c.x+c.r*Math.cos(a),c.y+c.r*Math.sin(a)]);}
  pts.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const lo=[],up=[];
  for(const p of pts){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
  for(const p of pts.slice().reverse()){while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}
  const h=lo.slice(0,-1).concat(up.slice(0,-1));          // counter-clockwise
  const cum=[0];let top=null,best=0;
  for(let i=0;i<h.length;i++){const a=h[i],b=h[(i+1)%h.length],l=Math.hypot(b[0]-a[0],b[1]-a[1]);cum.push(cum[i]+l);
    if((a[1]+b[1])/2>.7&&l>best){best=l;top=[a,b];}}
  const len=cum[h.length];
  const at=s=>{s=((s%len)+len)%len;let i=0;while(cum[i+1]<s)i++;const a=h[i],b=h[(i+1)%h.length],t=(s-cum[i])/(cum[i+1]-cum[i]);
    return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];};
  const topY=x=>top[0][1]+(top[1][1]-top[0][1])*(x-top[0][0])/(top[1][0]-top[0][0]);
  const slope=(top[1][1]-top[0][1])/(top[1][0]-top[0][0]);
  return{len,at,topY,slope};})();
export const NL=Math.round(path.len/.235), PITCH=path.len/NL;

/* ---------- HULL ---------- */
export const hull=new Geo(), W=.51;
loft(hull,ID,[[-1.80,.90],[-1.72,.55],[-1.45,.42],[1.2,.42],[1.2,1.36],[1.05,1.45],[-.45,1.45],[-.62,1.30],[-1.70,1.02]],W,C.paint);
loft(hull,ID,[[1.2,.42,.51],[1.62,.62,.40],[1.80,.88,.32],[1.80,1.00,.32],[1.2,1.36,.51]],W,C.paint);
{ // glacis: driver's doors, top flap, hinges, slits
  const A=[1.80,1.00],u=[-.6/.6997,.36/.6997],n=[.5145,.8575],phi=Math.atan2(.36,-.6);
  const on=(t,off)=>[A[0]+u[0]*t+n[0]*off,A[1]+u[1]*t+n[1]*off];
  for(const s of[-1,1]){const c=on(.40,.012);
    box(hull,M(tr(c[0],c[1],s*.125),rz(phi)),.50,.022,.235,C.paint);
    for(const t of[.25,.55]){const q=on(t,.03);cyl(hull,M(tr(q[0],q[1],s*.25),rz(phi),AX),.014,.014,.07,8,C.paint);}
    const hd=on(.22,.035);box(hull,M(tr(hd[0],hd[1],s*.045),rz(phi)),.06,.02,.014,C.steel,0);
    for(let i=0;i<6;i++){const t=.05+i*.125,q=on(t,.004);rivet(hull,ID,[q[0],q[1],s*(.32+.19*t/.7-.035)]);}
    for(let i=0;i<5;i++){rivet(hull,ID,[1.807,.90+i*.02,s*(.06+i*.055)]);}
    box(hull,tr(1.84,.80,s*.2),.09,.05,.03,C.steel,0);          // tow hooks
    box(hull,tr(.95,1.33,s*.513),.15,.016,.01,C.dark,0);         // side vision slits
  }
  const f=on(.78,.014);box(hull,M(tr(f[0],f[1],0),rz(phi)),.15,.024,.5,C.paint);
  const sl=on(.76,.03);box(hull,M(tr(sl[0],sl[1],0),rz(phi)),.016,.01,.2,C.dark,0);
  for(const z of[-.17,.17]){const q=on(.76,.03);box(hull,M(tr(q[0],q[1],z),rz(phi)),.016,.01,.07,C.dark,0);}
}
{ // engine deck: hatches, louvres
  const R=[-1.70,1.02],L=1.1157,u=[1.08/L,.28/L],n=[-.251,.968],phi=Math.atan2(.28,1.08);
  const on=(t,off)=>[R[0]+u[0]*t+n[0]*off,R[1]+u[1]*t+n[1]*off];
  for(const s of[-1,1]){const c=on(.68,.012);box(hull,M(tr(c[0],c[1],s*.235),rz(phi)),.72,.022,.44,C.paint);
    for(const t of[.45,.9]){const q=on(t,.03);cyl(hull,M(tr(q[0],q[1],s*.015),rz(phi),AX),.013,.013,.08,8,C.paint);}
    const hd=on(.68,.035);box(hull,M(tr(hd[0],hd[1],s*.40),rz(phi)),.08,.02,.014,C.steel,0);
    for(let i=0;i<9;i++){const q=on(.04+i*.13,.004);rivet(hull,ID,[q[0],q[1],s*.47]);}}
  for(let i=0;i<5;i++){const q=on(.05+i*.052,.016);box(hull,M(tr(q[0],q[1],0),rz(phi+.5)),.045,.008,.78,C.paint);}
  const d=on(.15,.004);box(hull,M(tr(d[0],d[1],0),rz(phi)),.27,.006,.76,C.dark,0);
}
for(const s of[-1,1]){const z=s*(W+.004);  // side rivets, engine doors
  rivLine(hull,ID,[-1.4,.47,z],[1.15,.47,z],22);rivLine(hull,ID,[-.42,1.41,z],[1.0,1.41,z],13);
  rivLine(hull,ID,[-.68,1.245,z],[-1.66,.99,z],9);rivLine(hull,ID,[1.15,.55,z],[1.15,1.33,z],7);
  rivLine(hull,ID,[-.52,.55,z],[-.52,1.33,z],7);rivLine(hull,ID,[.4,.55,z],[.4,1.36,z],8);
  rivLine(hull,ID,[-1.75,.62,z],[-1.75,.94,z],4);
  box(hull,tr(-1.1,.76,s*(W+.008)),.7,.34,.016,C.paint);
  for(const x of[-1.32,-.88])cyl(hull,tr(x,.94,s*(W+.02)),.013,.013,.07,8,C.paint,1);
  box(hull,tr(-1.1,.64,s*(W+.022)),.09,.02,.014,C.steel,0);
}
// muffler (right side), exhaust pipe, crank
cyl(hull,M(tr(-1.05,1.03,.60),AX),.07,.07,.6,16,C.rust,0);
cyl(hull,M(tr(-1.47,1.03,.60),AX),.022,.022,.3,10,C.rust,0);
cyl(hull,M(tr(-.80,1.03,.555),AZ),.025,.025,.1,10,C.rust,0);
for(const x of[-1.25,-.85])box(hull,tr(x,1.03,.56),.03,.16,.06,C.steel,0);
cyl(hull,M(tr(-1.86,.72,0),AX),.014,.014,.2,8,C.steel,0);
box(hull,tr(-1.96,.67,0),.02,.12,.02,C.steel,0);
{ // tail skid
  const prof=[[-1.72,1.0],[-2.93,.80],[-3.0,.70],[-2.62,.52],[-2.2,.44],[-1.72,.46]];
  for(const s of[-1,1]){loft(hull,tr(0,0,s*.36),prof,.008,C.paint);
    for(let i=0;i<prof.length;i++){const a=prof[i],b=prof[(i+1)%prof.length],n=Math.max(3,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/.13));
      for(let k=1;k<n;k++){const t=k/n,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;
        rivet(hull,ID,[x+(-2.3-x)*.05,y+(.68-y)*.09,s*.372],.011);}}}
  for(let i=1;i<5;i++)plate(hull,ID,prof[i],prof[i+1],.72,.014,C.paint);
  plate(hull,ID,[-1.72,1.0],[-1.9,.97],.72,.014,C.paint);
  cyl(hull,M(tr(-2.93,.80,0),AZ),.022,.022,.76,10,C.paint);
  cyl(hull,M(tr(-2.3,.86,0),AZ),.018,.018,.72,10,C.paint);
}
// running gear frames (both sides)
for(const s of[-1,1]){const z=s*ZT;
  box(hull,tr(-.15,.40,z),2.45,.11,.06,C.paint);
  for(const grp of[[0,1],[2,3],[4,5],[6,8]]){const x0=RWX[grp[0]],x1=RWX[grp[1]],xc=(x0+x1)/2;
    for(const o of[-.065,.065])box(hull,tr(xc,.19,z+o),x1-x0+.15,.13,.018,C.paint);
    box(hull,tr(xc,.30,z),.07,.12,.05,C.paint);
    rivLine(hull,ID,[x0-.05,.235,z+s*.076],[x1+.05,.235,z+s*.076],grp[1]-grp[0]+3,.011);}
  for(const x of RWX){cyl(hull,M(tr(x,RWY,z),AZ),RWR,RWR,.09,18,C.steel,0);cyl(hull,M(tr(x,RWY,z),AZ),.026,.026,.17,8,C.steel,0);}
  for(const xc of[(RWX[0]+RWX[3])/2,(RWX[4]+RWX[8])/2-.08])
    for(let k=0;k<4;k++)box(hull,tr(xc,.468+k*.017,z),.78-k*.17,.014,.07,C.steel,0);
  // return-roller rail
  const ang=Math.atan(path.slope);
  box(hull,M(tr(-.2,path.topY(-.2)-.165,z),rz(ang)),2.35,.05,.05,C.paint);
  for(let i=0;i<6;i++){const x=-1.15+i*.4,y=path.topY(x)-.066;
    cyl(hull,M(tr(x,y,z),AZ),.05,.05,.12,12,C.steel,0);box(hull,tr(x,y-.05,z+s*.07),.03,.11,.012,C.paint);}
  for(const x of[-1.1,-.2,.7]){const yt=path.topY(x)-.165;box(hull,tr(x,(yt+.455)/2,z),.05,yt-.455,.04,C.paint);}
  // idler fork, axles
  for(const o of[-.095,.095])plate(hull,ID,[.92,.42],[IDL.x,IDL.y],.02,.08,C.paint,1,z+o);
  cyl(hull,M(tr(IDL.x,IDL.y,s*.56),AZ),.035,.035,.36,10,C.steel,0);
  cyl(hull,M(tr(SPR.x,SPR.y,s*.60),AZ),.06,.06,.24,12,C.paint);
  plate(hull,ID,[-1.3,.42],[SPR.x,SPR.y],.03,.1,C.paint,1,z-s*.08);
}

// 砲塔リング(大破で砲塔が飛んだ後に見える開口部)
cyl(hull,tr(TUR.x,TUR.y-.03,0),.50,.50,.06,32,C.dark,0);

/* ---------- TURRET (Berliet octagonal, riveted) ---------- */
export const tur=new Geo(), CA=Math.cos(Math.PI/8), SA=Math.sin(Math.PI/8);
export const tr_r=y=>.56-.04*y/TH;
cyl(tur,tr(0,TH/2,0),.56,.52,TH,8,C.paint,1,{flat:true,phase:Math.PI/8});
cyl(tur,tr(0,TH+.0125,0),.535,.51,.025,8,C.paint,1,{flat:true,phase:Math.PI/8});
cyl(tur,tr(0,.012,0),.585,.585,.03,32,C.paint);
export const face=(i,u,y,out=0)=>{const th=i*Math.PI/4,a=tr_r(y)*CA+out;return[Math.cos(th)*a-Math.sin(th)*u,y,Math.sin(th)*a+Math.cos(th)*u];};
export const faceM=(i,u,y,out)=>{const p=face(i,u,y,out);return M(tr(p[0],p[1],p[2]),ry(-i*Math.PI/4));};
for(let i=0;i<8;i++){
  for(const s of[-1,1])for(let k=0;k<6;k++){const y=.07+k*.064;rivet(tur,ID,face(i,s*(tr_r(y)*SA-.035),y,.003));}
  for(const y of[.045,.425])for(let k=0;k<3;k++)rivet(tur,ID,face(i,(k-1)*.085,y,.003));
  for(let k=0;k<3;k++){const th=i*Math.PI/4,u=(k-1)*.1,a=.46;rivet(tur,ID,[Math.cos(th)*a-Math.sin(th)*u,TH+.027,Math.sin(th)*a+Math.cos(th)*u]);}
  if(i!==0&&i!==4)box(tur,faceM(i,0,.335,.004),.012,.014,.13,C.dark,0);
}
box(tur,faceM(0,0,.23,.02),.05,.31,.25,C.paint);                    // mantlet
for(const s of[-1,1])for(const y of[.10,.23,.36])rivet(tur,ID,face(0,s*.10,y,.047));
box(tur,faceM(0,-.075,.35,.047),.008,.012,.05,C.dark,0);             // sight slot
for(const s of[-1,1]){                                              // rear doors
  box(tur,faceM(4,s*.098,.225,.01),.018,.35,.185,C.paint);
  for(const y of[.12,.33])cyl(tur,faceM(4,s*.195,y,.022),.013,.013,.06,8,C.paint);
  for(const y of[.09,.225,.36])rivet(tur,ID,face(4,s*.03,y,.021),.011);}
box(tur,faceM(4,.03,.225,.026),.016,.02,.07,C.steel,0);
{ // cupola + mushroom dome
  const cx=-.06,y0=TH+.025;
  cyl(tur,tr(cx,y0+.065,0),.205,.20,.13,24,C.paint);
  for(let k=0;k<5;k++){const a=(k-2)*Math.PI/4;box(tur,M(tr(cx+Math.cos(a)*.203,y0+.075,Math.sin(a)*.203),ry(-a)),.008,.012,.085,C.dark,0);}
  for(let k=0;k<12;k++){const a=k*Math.PI/6+.26;rivet(tur,ID,[cx+Math.cos(a)*.206,y0+.022,Math.sin(a)*.206],.01);}
  sphere(tur,M(tr(cx,y0+.13,0),sc(.25,.088,.25)),28,10,C.paint);
}
export const GUNP=[tr_r(.23)*CA+.05,.23,0];
export const gun=new Geo();
sphere(gun,sc(.082,.082,.082),18,10,C.paint);
cyl(gun,M(tr(.10,0,0),AX),.05,.042,.14,16,C.paint);
cyl(gun,M(tr(.25,0,0),AX),.027,.027,.18,12,C.gun,0);
for(let i=0;i<5;i++)cyl(gun,M(tr(.185+i*.024,0,0),AX),.042,.042,.011,16,C.gun,0);
cyl(gun,M(tr(.40,0,0),AX),.015,.015,.16,10,C.gun,0);
cyl(gun,M(tr(.485,0,0),AX),.021,.019,.03,10,C.gun,0);

/* ---------- wheels & track link ---------- */
export const idler=new Geo();
cyl(idler,AZ,.44,.44,.11,40,C.steel,0);cyl(idler,AZ,.40,.40,.128,40,C.wood,0);cyl(idler,AZ,.10,.10,.18,16,C.paint);
for(let k=0;k<6;k++){const a=k*Math.PI/3;
  for(const s of[-1,1]){box(idler,M(rz(a),tr(.255,0,s*.066)),.30,.036,.008,C.steel,0);
    rivet(idler,ID,[Math.cos(a+.52)*.33,Math.sin(a+.52)*.33,s*.066],.016,C.steel,0);
    rivet(idler,ID,[Math.cos(a)*.14,Math.sin(a)*.14,s*.07],.014,C.steel,0);}}
export const sprocket=new Geo();
cyl(sprocket,AZ,.275,.275,.07,32,C.paint);cyl(sprocket,AZ,.09,.09,.15,14,C.paint);
for(let k=0;k<16;k++)box(sprocket,M(rz(k*Math.PI/8),tr(.285,0,0)),.06,.05,.085,C.steel,0);
for(let k=0;k<6;k++){const a=k*Math.PI/3;cyl(sprocket,M(tr(Math.cos(a)*.175,Math.sin(a)*.175,0),AZ),.048,.048,.074,12,C.dark,0);
  for(const s of[-1,1])rivet(sprocket,ID,[Math.cos(a+.52)*.11,Math.sin(a+.52)*.11,s*.077],.012);}
export const link=new Geo();
box(link,ID,PITCH*.94,.022,.34,C.track,0);
box(link,tr(PITCH*.22,.022,0),.03,.028,.34,C.track,0);
cyl(link,M(tr(-PITCH*.5,0,0),AZ),.016,.016,.34,6,C.track,0);
for(const z of[-.088,.088])box(link,tr(0,-.03,z),.07,.04,.026,C.track,0);

