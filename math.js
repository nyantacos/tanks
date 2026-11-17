// math.js — 4x4 行列・ベクトル演算

export const mul=(a,b)=>{const o=new Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s;}return o;};
export const M=(...m)=>m.reduce(mul);
export const ID=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
export const tr=(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1];
export const sc=(x,y,z)=>[x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1];
export const rx=a=>{const c=Math.cos(a),s=Math.sin(a);return[1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1];};
export const ry=a=>{const c=Math.cos(a),s=Math.sin(a);return[c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1];};
export const rz=a=>{const c=Math.cos(a),s=Math.sin(a);return[c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1];};
export const xf=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
export const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export const norm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
export function nmat(m){const a=m[0],b=m[4],c=m[8],d=m[1],e=m[5],f=m[9],g=m[2],h=m[6],i=m[10];
  const C=[e*i-f*h,-(d*i-f*g),d*h-e*g,-(b*i-c*h),a*i-c*g,-(a*h-b*g),b*f-c*e,-(a*f-c*d),a*e-b*d];
  const s=(a*C[0]+b*C[1]+c*C[2])<0?-1:1;
  return n=>norm([s*(C[0]*n[0]+C[1]*n[1]+C[2]*n[2]),s*(C[3]*n[0]+C[4]*n[1]+C[5]*n[2]),s*(C[6]*n[0]+C[7]*n[1]+C[8]*n[2])]);}
export const persp=(fy,as,n,f)=>{const t=1/Math.tan(fy/2);return[t/as,0,0,0,0,t,0,0,0,0,(f+n)/(n-f),-1,0,0,2*f*n/(n-f),0];};
export const ortho=(l,r,b,t,n,f)=>[2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1];
export function lookAt(e,c,u){const z=norm(sub(e,c)),x=norm(cross(u,z)),y=cross(z,x);
  return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,e),-dot(y,e),-dot(z,e),1];}
export const AZ=rx(Math.PI/2), AX=rz(-Math.PI/2);   // turn a Y-axis primitive onto Z / X

