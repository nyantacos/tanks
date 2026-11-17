// track.js — 車輪円群の凸包から履帯の経路を作る(共通)
export function trackPath(circles,topMinY=.7){const pts=[];
  for(const c of circles)for(let i=0;i<96;i++){const a=2*Math.PI*i/96;pts.push([c.x+c.r*Math.cos(a),c.y+c.r*Math.sin(a)]);}
  pts.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const lo=[],up=[];
  for(const p of pts){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
  for(const p of pts.slice().reverse()){while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}
  const h=lo.slice(0,-1).concat(up.slice(0,-1));          // counter-clockwise
  const cum=[0];let top=null,best=0;
  for(let i=0;i<h.length;i++){const a=h[i],b=h[(i+1)%h.length],l=Math.hypot(b[0]-a[0],b[1]-a[1]);cum.push(cum[i]+l);
    if((a[1]+b[1])/2>topMinY&&l>best){best=l;top=[a,b];}}
  const len=cum[h.length];
  const at=s=>{s=((s%len)+len)%len;let i=0;while(cum[i+1]<s)i++;const a=h[i],b=h[(i+1)%h.length],t=(s-cum[i])/(cum[i+1]-cum[i]);
    return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];};
  const topY=x=>top[0][1]+(top[1][1]-top[0][1])*(x-top[0][0])/(top[1][0]-top[0][0]);
  const slope=(top[1][1]-top[0][1])/(top[1][0]-top[0][0]);
  return{len,at,topY,slope};}
