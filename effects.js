// effects.js — パーティクル(発砲炎・曳光弾・爆発・煙・飛来砲弾)
import {M,tr,sc,ry,rz,norm,sub} from "./math.js";
const rnd=(a,b)=>a+Math.random()*(b-a);
const BG_SMOKE=[.30,.29,.28];
export class Effects{
  constructor(){this.ps=[];this.shells=[];}
  /** 発砲炎 + 曳光弾。dir は正規化済みワールド方向 */
  muzzle(pos,dir){
    this.ps.push({pos:[...pos],vel:[0,0,0],life:.07,max:.07,s0:.18,s1:.05,kind:'flash'});
    this.ps.push({pos:[...pos],vel:dir.map(d=>d*55),life:1.6,max:1.6,s0:.045,s1:.045,kind:'tracer',dir});
    for(let i=0;i<3;i++)this.ps.push({pos:[...pos],vel:[dir[0]*rnd(1,3)+rnd(-.6,.6),rnd(.6,1.6),dir[2]*rnd(1,3)+rnd(-.6,.6)],
      life:rnd(.4,.8),max:.8,s0:.05,s1:.14,kind:'smoke'});
  }
  /** 戦車砲の発砲:大きな発砲炎・砲弾・発砲煙 */
  cannon(pos,dir){
    this.ps.push({pos:[...pos],vel:[0,0,0],life:.1,max:.1,s0:.45,s1:.15,kind:'flash'});
    this.ps.push({pos:[pos[0]+dir[0]*.3,pos[1]+dir[1]*.3,pos[2]+dir[2]*.3],vel:dir.map(d=>d*2),life:.12,max:.12,s0:.2,s1:.5,kind:'fire'});
    this.ps.push({pos:[...pos],vel:dir.map(d=>d*70),life:2.5,max:2.5,s0:.07,s1:.07,kind:'tracer',dir,shell:true,grav:2});
    for(let i=0;i<10;i++)this.ps.push({pos:[...pos],vel:[dir[0]*rnd(2,6)+rnd(-1.2,1.2),rnd(.4,1.8),dir[2]*rnd(2,6)+rnd(-1.2,1.2)],
      life:rnd(.8,1.6),max:1.6,s0:.12,s1:.5,kind:'smoke',delay:rnd(0,.08)});
    for(let i=0;i<8;i++)this.ps.push({pos:[...pos],vel:[dir[0]*rnd(6,14)+rnd(-3,3),rnd(1,4),dir[2]*rnd(6,14)+rnd(-3,3)],life:rnd(.2,.4),max:.4,s0:.03,s1:.01,kind:'spark',grav:9});
  }
  /** 爆発:火球 → 火花 → 立ち上る煙 */
  explosion(pos,big=false){
    const k=big?2.2:1;
    for(let i=0;i<(big?14:7);i++)this.ps.push({pos:[pos[0]+rnd(-.2,.2)*k,pos[1]+rnd(-.1,.3)*k,pos[2]+rnd(-.2,.2)*k],
      vel:[rnd(-1.2,1.2)*k,rnd(.5,2.5)*k,rnd(-1.2,1.2)*k],life:rnd(.25,.5)*k,max:.5*k,s0:.25*k,s1:.55*k,kind:'fire'});
    for(let i=0;i<(big?40:16);i++){const a=rnd(0,6.283),e=rnd(.2,1.4);
      this.ps.push({pos:[...pos],vel:[Math.cos(a)*Math.cos(e)*rnd(3,9)*k,Math.sin(e)*rnd(4,10)*k,Math.sin(a)*Math.cos(e)*rnd(3,9)*k],
        life:rnd(.5,1.3),max:1.3,s0:.035,s1:.01,kind:'spark',grav:9});}
    for(let i=0;i<(big?22:9);i++)this.ps.push({pos:[pos[0]+rnd(-.3,.3)*k,pos[1],pos[2]+rnd(-.3,.3)*k],
      vel:[rnd(-.8,.8),rnd(1.2,2.8),rnd(-.8,.8)],life:rnd(1.5,3.2)*k,max:3.2*k,s0:.22*k,s1:.9*k,kind:'smoke',delay:rnd(0,.25)});
  }
  /** 機銃弾の連射が飛来。targetFn() が各弾の着弾点を返す */
  incomingBurst(targetFn,n,onHit){
    const a=rnd(0,6.283),d=rnd(13,18),t0=targetFn(),from=[t0[0]+Math.cos(a)*d,t0[1]+rnd(.5,2.5),t0[2]+Math.sin(a)*d];
    for(let i=0;i<n;i++)this.shells.push({pos:from,target:i?targetFn():t0,t:-i*.075,dur:.11,arc:0,bullet:true,onHit});
  }
  /** 跳弾:小さな閃光と火花だけ */
  ricochet(pos){
    this.ps.push({pos:[...pos],vel:[0,0,0],life:.06,max:.06,s0:.09,s1:.03,kind:'flash'});
    for(let i=0;i<5;i++)this.ps.push({pos:[...pos],vel:[rnd(-4,4),rnd(0,5),rnd(-4,4)],life:rnd(.15,.4),max:.4,s0:.022,s1:.008,kind:'spark',grav:9});
  }
  /** 着弾の土煙 */
  puff(pos){for(let i=0;i<4;i++)this.ps.push({pos:[...pos],vel:[rnd(-.5,.5),rnd(.8,1.8),rnd(-.5,.5)],life:rnd(.4,.8),max:.8,s0:.05,s1:.22,kind:'smoke',dust:true});
    for(let i=0;i<3;i++)this.ps.push({pos:[...pos],vel:[rnd(-2,2),rnd(2,4),rnd(-2,2)],life:.4,max:.4,s0:.02,s1:.01,kind:'spark',grav:9});}
  /** 大破後に立ち上り続ける黒煙 */
  burning(pos,dt){
    if(Math.random()<dt*14)this.ps.push({pos:[pos[0]+rnd(-.25,.25),pos[1],pos[2]+rnd(-.25,.25)],vel:[rnd(-.3,.3),rnd(.9,1.8),rnd(-.3,.3)],
      life:rnd(2,3.5),max:3.5,s0:.12,s1:.75,kind:'smoke',dark:true});
    if(Math.random()<dt*6)this.ps.push({pos:[pos[0]+rnd(-.2,.2),pos[1]-.05,pos[2]+rnd(-.2,.2)],vel:[0,rnd(.6,1.4),0],
      life:rnd(.2,.4),max:.4,s0:.12,s1:.02,kind:'fire'});
  }
  /** 飛来する敵砲弾。到達時に onHit(impactPos) を呼ぶ */
  incoming(target,onHit){
    const a=rnd(0,6.283),d=rnd(14,20),h=rnd(5,9);
    const from=[target[0]+Math.cos(a)*d,target[1]+h,target[2]+Math.sin(a)*d];
    this.shells.push({pos:from,target:[...target],t:0,dur:rnd(.55,.75),onHit});
  }
  update(dt){
    for(const s of this.shells){s.t+=dt;if(s.t<0){s.cur=null;continue;}const u=Math.min(1,s.t/s.dur);
      s.cur=[s.pos[0]+(s.target[0]-s.pos[0])*u,s.pos[1]+(s.target[1]-s.pos[1])*u-Math.sin(u*Math.PI)*(s.arc??1.5),s.pos[2]+(s.target[2]-s.pos[2])*u];
      if(u>=1){s.done=true;s.onHit(s.target);}}
    this.shells=this.shells.filter(s=>!s.done);
    for(const p of this.ps){if(p.delay>0){p.delay-=dt;continue;}
      p.life-=dt;if(p.grav)p.vel[1]-=p.grav*dt;
      if(p.kind==='smoke'){p.vel[0]*=1-dt*.8;p.vel[2]*=1-dt*.8;p.vel[1]+=dt*.3;}
      for(let i=0;i<3;i++)p.pos[i]+=p.vel[i]*dt;
      if(p.kind==='tracer'&&p.pos[1]<=0){p.life=0;if(p.shell)this.explosion([p.pos[0],.05,p.pos[2]],false);else this.puff([p.pos[0],.02,p.pos[2]]);}
      if(p.kind==='spark'&&p.pos[1]<0){p.pos[1]=0;p.vel[1]*=-.3;p.vel[0]*=.5;p.vel[2]*=.5;}}
    this.ps=this.ps.filter(p=>p.life>0);
    if(this.ps.length>900)this.ps.splice(0,this.ps.length-900);
  }
  /** 描画用リスト [{pos,size,color,mat?}] */
  render(){
    const out=[];
    for(const p of this.ps){if(p.delay>0)continue;const u=1-p.life/p.max,size=p.s0+(p.s1-p.s0)*u;let color,alpha=1,add=false;
      switch(p.kind){
        case 'flash':color=[1,.85,.45];add=true;alpha=.9;break;
        case 'tracer':color=[1,.7,.25];add=true;
          out.push({pos:p.pos,size,color,add,alpha,mat:M(tr(...p.pos),ry(-Math.atan2(p.dir[2],p.dir[0])),rz(Math.asin(Math.max(-1,Math.min(1,p.dir[1])))),sc(p.shell?.3:.5,size,size))});continue;
        case 'fire':color=u<.3?[1,.8,.35]:(u<.65?[1,.42,.1]:[.5,.15,.05]);add=true;alpha=.85*(1-u*u);break;
        case 'spark':color=u<.5?[1,.8,.4]:[.9,.35,.1];add=true;break;
        default:{if(p.dust){color=[.58-.1*u,.52-.1*u,.42-.08*u];}else{const g=p.dark?.1+.08*u:.28+.22*u;color=[g*1.02,g,g*.97];}
          alpha=(p.dark?.55:.42)*(1-u)*(1-u)+.05;}
      }
      out.push({pos:p.pos,size,color,alpha,add});}
    for(const s of this.shells)if(s.cur){if(s.bullet){out.push({pos:s.cur,size:.04,color:[1,.8,.4],add:true});continue;}out.push({pos:s.cur,size:.07,color:[.15,.14,.13]});
      out.push({pos:s.cur,size:.16,color:[.5,.5,.5],alpha:.3});}
    return out;
  }
  clear(){this.ps.length=0;this.shells.length=0;}
}
