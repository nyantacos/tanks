// geometry.js — プリミティブ生成(箱・円柱・球・押し出し・リベット)
import {M,ID,tr,sc,rz,xf,sub,cross,dot,norm,nmat} from "./math.js";

export class Geo{constructor(){this.a=[];}
  tri(m,ps,ns,col,pt){const N=nmat(m);for(let k=0;k<3;k++){const p=xf(m,ps[k]),n=N(ns.length===3&&Array.isArray(ns[0])?ns[k]:ns);
    this.a.push(p[0],p[1],p[2],n[0],n[1],n[2],col[0],col[1],col[2],pt);}}}
export function box(g,m,sx,sy,sz,col,pt=1){const h=[sx/2,sy/2,sz/2];
  for(let d=0;d<3;d++)for(const s of[-1,1]){const u=(d+1)%3,v=(d+2)%3,n=[0,0,0];n[d]=s;
    const P=(a,b)=>{const p=[0,0,0];p[d]=s*h[d];p[u]=a*h[u];p[v]=b*h[v];return p;};
    g.tri(m,[P(-1,-1),P(1,-1),P(1,1)],n,col,pt);g.tri(m,[P(-1,-1),P(1,1),P(-1,1)],n,col,pt);}}
export function cyl(g,m,rb,rt,h,n,col,pt=1,o={}){const ph=o.phase||0,flat=o.flat,k=(rb-rt)/h;
  for(let i=0;i<n;i++){const a0=ph+2*Math.PI*i/n,a1=ph+2*Math.PI*(i+1)/n,am=(a0+a1)/2;
    const c0=Math.cos(a0),s0=Math.sin(a0),c1=Math.cos(a1),s1=Math.sin(a1);
    const b0=[rb*c0,-h/2,rb*s0],b1=[rb*c1,-h/2,rb*s1],t0=[rt*c0,h/2,rt*s0],t1=[rt*c1,h/2,rt*s1];
    const nA=flat?[Math.cos(am),k,Math.sin(am)]:[c0,k,s0],nB=flat?nA:[c1,k,s1];
    g.tri(m,[b0,t0,t1],[nA,nA,nB],col,pt);g.tri(m,[b0,t1,b1],[nA,nB,nB],col,pt);
    if(o.caps!==false){g.tri(m,[[0,h/2,0],t0,t1],[0,1,0],col,pt);g.tri(m,[[0,-h/2,0],b0,b1],[0,-1,0],col,pt);}}}
export function sphere(g,m,ns,nr,col,pt=1){
  const P=(i,j)=>{const th=2*Math.PI*i/ns,ph=-Math.PI/2+Math.PI*j/nr,c=Math.cos(ph);return[c*Math.cos(th),Math.sin(ph),c*Math.sin(th)];};
  for(let j=0;j<nr;j++)for(let i=0;i<ns;i++){const a=P(i,j),b=P(i+1,j),c=P(i+1,j+1),d=P(i,j+1);
    if(j>0)g.tri(m,[a,b,c],[a,b,c],col,pt);if(j<nr-1)g.tri(m,[a,c,d],[a,c,d],col,pt);}}
export function earclip(p){const n=p.length,idx=[...Array(n).keys()],out=[];
  const ar=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  let guard=0;
  while(idx.length>3&&guard++<999){let done=false;
    for(let i=0;i<idx.length;i++){const ia=idx[(i+idx.length-1)%idx.length],ib=idx[i],ic=idx[(i+1)%idx.length];
      if(ar(p[ia],p[ib],p[ic])<=1e-9)continue;let ok=true;
      for(const j of idx){if(j===ia||j===ib||j===ic)continue;
        if(ar(p[ia],p[ib],p[j])>=0&&ar(p[ib],p[ic],p[j])>=0&&ar(p[ic],p[ia],p[j])>=0){ok=false;break;}}
      if(ok){out.push([ia,ib,ic]);idx.splice(i,1);done=true;break;}}
    if(!done)break;}
  if(idx.length===3)out.push(idx);return out;}
// extruded profile in x-y; each point may carry its own half-width (3rd value)
export function loft(g,m,pts,w,col,pt=1){let p=pts.map(q=>[q[0],q[1],q[2]===undefined?w:q[2]]);
  let A=0;for(let i=0;i<p.length;i++){const q=p[(i+1)%p.length];A+=p[i][0]*q[1]-q[0]*p[i][1];}
  if(A<0)p.reverse();
  for(const t of earclip(p))for(const s of[-1,1]){const v=t.map(i=>[p[i][0],p[i][1],s*p[i][2]]);
    let n=norm(cross(sub(v[1],v[0]),sub(v[2],v[0])));if(n[2]*s<0)n=n.map(x=>-x);g.tri(m,v,n,col,pt);}
  for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];
    const q=[[a[0],a[1],-a[2]],[b[0],b[1],-b[2]],[b[0],b[1],b[2]],[a[0],a[1],a[2]]];
    const hint=[b[1]-a[1],-(b[0]-a[0]),0];
    for(const t of[[0,1,2],[0,2,3]]){const v=t.map(i=>q[i]);let n=cross(sub(v[1],v[0]),sub(v[2],v[0]));
      if(Math.hypot(...n)<1e-9)continue;n=norm(n);if(dot(n,hint)<0)n=n.map(x=>-x);g.tri(m,v,n,col,pt);}}}
export function rivet(g,m,p,r=0.013,col=[.42,.45,.34],pt=1){sphere(g,M(m,tr(p[0],p[1],p[2]),sc(r,r,r)),6,3,col,pt);}
export function rivLine(g,m,a,b,n,r){for(let i=0;i<n;i++){const t=n===1?0:i/(n-1);rivet(g,m,[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],r);}}
// thin plate laid along a 2D segment (x-y), spanning `wid` in z
export function plate(g,m,a,b,wid,th,col,pt=1,z=0){const dx=b[0]-a[0],dy=b[1]-a[1];
  box(g,M(m,tr((a[0]+b[0])/2,(a[1]+b[1])/2,z),rz(Math.atan2(dy,dx))),Math.hypot(dx,dy),th,wid,col,pt);}

