// renderer.js — WebGL2 描画(シャドウマップ・迷彩シェーダ・発光・焼け)
import {mul,ID,tr,sc,norm,persp,ortho,lookAt} from "./math.js";
import {Geo,sphere} from "./geometry.js";

const VS=`#version 300 es
layout(location=0) in vec3 aP;layout(location=1) in vec3 aN;layout(location=2) in vec4 aC;
uniform mat4 uM,uVP,uLVP;out vec3 vW,vL,vN;out vec4 vC,vS;
void main(){vec4 w=uM*vec4(aP,1.);vW=w.xyz;vL=aP;vN=mat3(uM)*aN;vC=aC;vS=uLVP*w;gl_Position=uVP*w;}`;
const FS=`#version 300 es
precision highp float;precision highp sampler2DShadow;
in vec3 vW,vL,vN;in vec4 vC,vS;
uniform vec3 uLight,uEye,uOff,uBg,uGcol,uEmis;uniform vec2 uCenter;
uniform float uCamo,uGround,uEmisK,uBurn,uEmisA;uniform sampler2DShadow uSh;
out vec4 o;
float h3(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
 return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fb(vec3 p){return vn(p)*.68+vn(p*2.3+5.1)*.32;}
vec3 camo(vec3 p){p=p*1.9+uOff;float a=fb(p),b=fb(p+17.3),c=fb(p+41.9)*.96;
 float m=max(a,max(b,c)),lo=min(a,min(b,c)),md=a+b+c-m-lo;
 vec3 col=m==a?vec3(.74,.62,.38):(m==b?vec3(.27,.35,.21):vec3(.43,.26,.17));
 return mix(vec3(.07,.07,.06),col,smoothstep(.012,.02,m-md));}
float shadow(){vec3 s=vS.xyz/vS.w*.5+.5;if(s.x<0.||s.x>1.||s.y<0.||s.y>1.||s.z>1.)return 1.;
 float r=0.,t=1./2048.;for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++)r+=texture(uSh,vec3(s.xy+vec2(i,j)*t,s.z-.0022));return r/9.;}
void main(){
 if(uEmisK>0.){vec3 N=normalize(vN);float rim=pow(1.-abs(dot(N,normalize(uEye-vW))),1.5);
  o=vec4(uEmis,uEmisA*(1.-rim*rim));return;}
 vec3 N=normalize(vN),alb;float sh=shadow();
 if(uGround>.5){vec2 q=vW.xz;
  float n=vn(vec3(q*.9,1.))*.6+vn(vec3(q*4.3,7.))*.3+vn(vec3(q*17.,3.))*.1;
  alb=uGcol*(.94+.12*n);}
 else{alb=mix(vC.rgb,camo(vL),uCamo*vC.a);
  float g=vn(vL*9.)*.5+vn(vL*37.)*.5;alb*=.9+.2*g;
  float dust=smoothstep(1.0,.0,vL.y)*.5*(.6+.8*vn(vL*3.1));
  alb=mix(alb,vec3(.52,.46,.36),clamp(dust,0.,.6));
  float soot=vn(vL*5.)*.5+vn(vL*13.)*.5;
  alb=mix(alb,vec3(.11,.095,.08)*(.5+.9*soot),uBurn*.85*smoothstep(.15,.85,soot*.7+.3));}
 alb=pow(alb,vec3(2.2));
 float ndl=max(dot(N,uLight),0.);
 vec3 amb=mix(vec3(.30,.27,.24),vec3(.52,.56,.62),N.y*.5+.5);
 vec3 V=normalize(uEye-vW),H=normalize(V+uLight);
 float sp=pow(max(dot(N,H),0.),28.)*(uGround>.5?0.:.22)*sh;
 vec3 c=alb*(amb*.95+vec3(1.,.95,.86)*1.55*ndl*sh)+sp;
 c=pow(c/(1.+c*.25),vec3(1./2.2));
 if(uGround>.5)c=mix(c,uBg,smoothstep(4.5,12.5,length(vW.xz-uCenter)));
 o=vec4(c,1.);}`;
const DVS=`#version 300 es
layout(location=0) in vec3 aP;uniform mat4 uM,uLVP;void main(){gl_Position=uLVP*uM*vec4(aP,1.);}`;
const DFS=`#version 300 es
precision mediump float;void main(){}`;

export const LDIR=norm([.55,1,.62]);

export class Renderer{
  constructor(canvas){
    this.cv=canvas;
    const gl=this.gl=canvas.getContext('webgl2',{antialias:true});
    if(!gl)throw new Error('no webgl2');
    this.P=this.prog(VS,FS);this.D=this.prog(DVS,DFS);
    // shadow map
    const SH=this.SH=2048,t=this.shTex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,SH,SH,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_MODE,gl.COMPARE_REF_TO_TEXTURE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_FUNC,gl.LEQUAL);
    this.shFB=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,this.shFB);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,t,0);gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    const gnd=new Geo(),s=40;
    gnd.tri(ID,[[-s,0,-s],[s,0,-s],[s,0,s]],[0,1,0],[1,1,1],0);gnd.tri(ID,[[-s,0,-s],[s,0,s],[-s,0,s]],[0,1,0],[1,1,1],0);
    this.mGnd=this.mesh(gnd);
    const sp=new Geo();sphere(sp,ID,18,10,[1,1,1],0);this.mSphere=this.mesh(sp);
  }
  prog(v,f){const gl=this.gl,p=gl.createProgram();
    for(const[t,s]of[[gl.VERTEX_SHADER,v],[gl.FRAGMENT_SHADER,f]]){const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);
      if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));gl.attachShader(p,sh);}
    gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
    const u={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);
    for(let i=0;i<n;i++){const nm=gl.getActiveUniform(p,i).name;u[nm]=gl.getUniformLocation(p,nm);}
    return{p,u};}
  mesh(g){const gl=this.gl,vao=gl.createVertexArray();gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.a),gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,40,0);
    gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,40,12);
    gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,4,gl.FLOAT,false,40,24);
    return{vao,n:g.a.length/10};}
  resize(){const cv=this.cv,r=Math.min(devicePixelRatio||1,2),w=Math.round(cv.clientWidth*r),h=Math.round(cv.clientHeight*r);
    if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}}
  /** items: [{mesh,mat,off,emis,emisK,burn}], particles: [{pos,size,color}] */
  draw({items,particles,eye,target,center,bg,gcol,camo}){
    const gl=this.gl,cv=this.cv,P=this.P,D=this.D;this.resize();
    const LVP=mul(ortho(-3.8,3.8,-3.2,3.2,1,26),lookAt([target[0]+LDIR[0]*13,target[1]+LDIR[1]*13,target[2]+LDIR[2]*13],target,[0,1,0]));
    gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
    gl.bindFramebuffer(gl.FRAMEBUFFER,this.shFB);gl.viewport(0,0,this.SH,this.SH);gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.useProgram(D.p);gl.uniformMatrix4fv(D.u.uLVP,false,LVP);
    gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1.5,2);
    for(const it of items){gl.uniformMatrix4fv(D.u.uM,false,it.mat);gl.bindVertexArray(it.mesh.vao);gl.drawArrays(gl.TRIANGLES,0,it.mesh.n);}
    gl.disable(gl.POLYGON_OFFSET_FILL);

    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,cv.width,cv.height);
    gl.clearColor(bg[0],bg[1],bg[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const asp=cv.width/cv.height,fov=asp<1?.62/Math.max(asp,.55)*.9:.62;
    const VP=mul(persp(Math.min(fov,1.25),asp,.2,90),lookAt(eye,target,[0,1,0]));
    gl.useProgram(P.p);gl.uniformMatrix4fv(P.u.uVP,false,VP);gl.uniformMatrix4fv(P.u.uLVP,false,LVP);
    gl.uniform3fv(P.u.uLight,LDIR);gl.uniform3fv(P.u.uEye,eye);gl.uniform3fv(P.u.uBg,bg);gl.uniform3fv(P.u.uGcol,gcol);
    gl.uniform2fv(P.u.uCenter,center);gl.uniform1f(P.u.uCamo,camo);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.shTex);gl.uniform1i(P.u.uSh,0);
    gl.uniform1f(P.u.uGround,0);gl.uniform1f(P.u.uEmisK,0);
    for(const it of items){gl.uniformMatrix4fv(P.u.uM,false,it.mat);gl.uniform3fv(P.u.uOff,it.off||[0,0,0]);
      gl.uniform1f(P.u.uBurn,it.burn||0);gl.bindVertexArray(it.mesh.vao);gl.drawArrays(gl.TRIANGLES,0,it.mesh.n);}
    gl.uniform1f(P.u.uGround,1);gl.uniform1f(P.u.uBurn,0);gl.uniformMatrix4fv(P.u.uM,false,tr(center[0],0,center[1]));
    gl.bindVertexArray(this.mGnd.vao);gl.drawArrays(gl.TRIANGLES,0,this.mGnd.n);
    gl.uniform1f(P.u.uGround,0);gl.uniform1f(P.u.uEmisK,1);gl.bindVertexArray(this.mSphere.vao);
    gl.enable(gl.BLEND);gl.depthMask(false);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
    // 加算合成(炎)→通常合成(煙)の順。奥→手前に並べる
    const sorted=particles.map(p=>{const d=p.pos[0]-eye[0],e=p.pos[1]-eye[1],f=p.pos[2]-eye[2];return[p,d*d+e*e+f*f];}).sort((a,b)=>b[1]-a[1]);
    for(const[p]of sorted){if(p.add)gl.blendFunc(gl.SRC_ALPHA,gl.ONE);else gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform3fv(P.u.uEmis,p.color);gl.uniform1f(P.u.uEmisA,p.alpha??1);
      gl.uniformMatrix4fv(P.u.uM,false,p.mat||mul(tr(p.pos[0],p.pos[1],p.pos[2]),sc(p.size,p.size,p.size)));
      gl.drawArrays(gl.TRIANGLES,0,this.mSphere.n);}
    gl.disable(gl.BLEND);gl.depthMask(true);gl.disable(gl.CULL_FACE);
  }
}
