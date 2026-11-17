// tank.js — 戦車の状態機械(走行・砲塔・射撃・耐久力・大破)。車両仕様 v は model.js / chiha.js が返すオブジェクト
import {M,ID,tr,ry,rx,rz,xf,norm,sub} from "./math.js";
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const rnd=(a,b)=>a+Math.random()*(b-a);
export class Tank{
  constructor(vehicle){this.setVehicle(vehicle);}
  setVehicle(v){this.v=v;this.reset();}
  reset(){
    const v=this.v;this.maxHp=v.maxHp;this.maxSpeed=v.maxSpeed;this.turnRate=v.turnRate;this.fireInterval=v.fireInterval;
    this.pos=[0,0,0];this.heading=0;this.speed=0;this.yawRate=0;
    this.turret=-25*Math.PI/180;this.elev=4*Math.PI/180;
    this.hp=this.maxHp;this.state='ok';this.hits=0;this.mgHits=0;this.shots=0;this.mgYaw=0;this.mgElev=0;this.mgCd=0;
    this.dist=0;this.fireCd=0;this.recoil=0;this.shake=0;this.flinch=0;
    this.fly=null;this.burn=0;this.listTilt=0;this.sd={'-1':0,'1':0};
  }
  get alive(){return this.state==='ok';}
  get matrix(){const sh=this.shake>0?[rnd(-1,1)*.03*this.shake,rnd(0,1)*.02*this.shake,rnd(-1,1)*.03*this.shake]:[0,0,0];
    return M(tr(this.pos[0]+sh[0],this.pos[1]+sh[1],this.pos[2]+sh[2]),ry(this.heading),rx(this.listTilt),rz(-this.flinch*.05));}
  forward(){return[Math.cos(this.heading),0,-Math.sin(this.heading)];}
  /** 銃口のワールド座標と射線 */
  gunWorld(){const m=this.gunMatrix();return{pos:xf(m,this.v.MUZZLE),dir:norm(sub(xf(m,[1,0,0]),xf(m,[0,0,0])))};}
  turretMatrix(){const T=this.v.TUR;
    if(this.fly)return M(tr(...this.fly.pos),rx(this.fly.rot[0]),ry(this.fly.rot[1]),rz(this.fly.rot[2]),tr(0,-.2,0));
    return M(this.matrix,tr(T.x,T.y,T.z||0),ry(this.turret));}
  gunMatrix(){const G=this.v.GUNP,rc=this.v.weapon==='gun'?.18:.06;return M(this.turretMatrix(),tr(G[0]-this.recoil*rc,G[1],G[2]),rz(this.elev));}
  update(dt,input,fx,sfx){
    this.fireCd=Math.max(0,this.fireCd-dt);this.recoil=Math.max(0,this.recoil-dt*(this.v.weapon==='gun'?4:8));
    this.shake=Math.max(0,this.shake-dt*2.5);this.flinch*=Math.exp(-dt*6);
    if(this.alive){
      const th=input.axis('back','fwd'),st=input.axis('right','left');
      const tgt=th*this.maxSpeed*(th<0?.5:1);
      this.speed+=clamp(tgt-this.speed,-dt*2.5,dt*2.5);
      this.yawRate+=clamp(st*this.turnRate-this.yawRate,-dt*3,dt*3);
      this.heading+=this.yawRate*dt;const f=this.forward();
      this.pos[0]+=f[0]*this.speed*dt;this.pos[2]+=f[2]*this.speed*dt;
      this.dist+=this.speed*dt;for(const s of[-1,1])this.sd[s]+=-s*this.yawRate*.85*dt;   // 旋回時は左右の履帯速度が違う
      this.turret=((this.turret+input.axis('turR','turL')*this.v.turretRate*dt+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;
      this.elev=clamp(this.elev+input.axis('elvDn','elvUp')*.7*dt,this.v.elevMin*Math.PI/180,this.v.elevMax*Math.PI/180);
      if(input.held('fire')&&this.fireCd<=0){this.fireCd=this.fireInterval;this.fire(fx,sfx);}
      const h=this.v.hullMG;this.mgCd=Math.max(0,this.mgCd-dt);
      if(h){this.mgYaw=clamp(this.mgYaw+input.axis('mgR','mgL')*.8*dt,-h.yawMax,h.yawMax);
        this.mgElev=clamp(this.mgElev+input.axis('mgDn','mgUp')*.6*dt,h.elevMin,h.elevMax);
        if(input.held('fireMG')&&this.mgCd<=0){this.mgCd=1/8;this.fireHullMG(fx,sfx);}}
      else if(this.v.weapon==='mg'&&input.held('fireMG')&&this.fireCd<=0){this.fireCd=this.fireInterval;this.fire(fx,sfx);}
      sfx.setEngine(Math.abs(this.speed)/this.maxSpeed+Math.abs(this.yawRate)*.5,true);
    }else{
      this.speed*=Math.exp(-dt*3);this.yawRate=0;sfx.setEngine(0,false);
      if(this.fly&&!this.fly.landed){const F=this.fly;F.vel[1]-=9.8*dt;for(let i=0;i<3;i++){F.pos[i]+=F.vel[i]*dt;F.rot[i]+=F.ang[i]*dt;}
        if(F.pos[1]<this.v.flyY&&F.vel[1]<0){F.pos[1]=this.v.flyY;F.landed=true;F.rot[0]=Math.round(F.rot[0]/(Math.PI/2))*(Math.PI/2)+.35;F.rot[2]=.2;
          fx.explosion([F.pos[0],.1,F.pos[2]],false);sfx.burst({dur:.3,freq:400,q:.6,gain:.5,type:'lowpass'});}}
      this.burn=Math.min(1,this.burn+dt*.6);
      const T=this.v.TUR;fx.burning(xf(this.matrix,[T.x,T.y,T.z||0]),dt);
    }
  }
  fire(fx,sfx){const g=this.gunWorld();this.recoil=1;this.shots++;
    if(this.v.weapon==='gun'){fx.cannon(g.pos,g.dir);sfx.cannon();this.shake=Math.max(this.shake,.5);}
    else{fx.muzzle(g.pos,g.dir);sfx.shot();}}
  mgMatrix(){const h=this.v.hullMG;return M(this.matrix,tr(...h.pos),ry(this.mgYaw),rz(this.mgElev));}
  fireHullMG(fx,sfx){const m=this.mgMatrix(),h=this.v.hullMG;this.shots++;
    fx.muzzle(xf(m,h.muzzle),norm(sub(xf(m,[1,0,0]),xf(m,[0,0,0]))));sfx.shot();}
  /** 機銃弾の被弾:装甲で跳ね返る。ごくまれに 1 ダメージ */
  hitMG(impact,fx,sfx){
    if(!this.alive)return 0;this.mgHits++;fx.ricochet(impact);sfx.ping();
    const d=Math.random()<.15?1:0;this.hp-=d;if(this.hp<0)this.destroy(fx,sfx);return d;
  }
  /** 砲弾の被弾:ダメージ適用。0 を割り込むと大破 */
  hit(impact,fx,sfx,dmg){
    if(!this.alive)return;dmg=dmg??Math.round(rnd(18,34));this.hp-=dmg;this.hits++;this.shake=1;this.flinch=1;
    fx.explosion(impact,false);sfx.explosion(false);
    if(this.hp<0)this.destroy(fx,sfx);
    return dmg;
  }
  destroy(fx,sfx){
    this.state='destroyed';const T=this.v.TUR,c=xf(this.matrix,[T.x,T.y+.3,T.z||0]);
    fx.explosion(c,true);sfx.explosion(true);this.shake=2.5;this.listTilt=rnd(-1,1)*.06;
    const tm=this.turretMatrix(),p=xf(tm,[0,.2,0]);
    this.fly={pos:p,vel:[rnd(-1.5,1.5),rnd(5.5,7.5),rnd(-1.5,1.5)],rot:[0,this.heading+this.turret,0],ang:[rnd(-4,4),rnd(-3,3),rnd(-4,4)],landed:false};
  }
  /** 描画ノード一覧 */
  items(meshes){
    const v=this.v,co=v.camoOff,mT=this.matrix,out=[{mesh:meshes.hull,mat:mT,off:[0,0,0],burn:this.burn}];
    out.push({mesh:meshes.tur,mat:this.turretMatrix(),off:co.tur,burn:this.burn*.8},{mesh:meshes.gun,mat:this.gunMatrix(),off:co.gun,burn:this.burn*.8});
    if(v.hullMG)out.push({mesh:meshes.mg,mat:this.mgMatrix(),off:v.hullMG.off,burn:this.burn});
    for(const s of[-1,1]){const d=this.dist+this.sd[s];
      out.push({mesh:meshes.idler,mat:M(mT,tr(v.IDL.x,v.IDL.y,s*v.ZT),rz(-d/v.IDL.r)),off:co.idler,burn:this.burn});
      out.push({mesh:meshes.sprocket,mat:M(mT,tr(v.SPR.x,v.SPR.y,s*v.ZT),rz(-d/v.SPR.r)),off:co.sprocket,burn:this.burn});
      for(let i=0;i<v.NL;i++){const a=v.path.at(i*v.PITCH-d),b=v.path.at((i+1)*v.PITCH-d);
        let tx=b[0]-a[0],ty=b[1]-a[1];const l=Math.hypot(tx,ty);tx/=l;ty/=l;
        out.push({mesh:meshes.link,mat:M(mT,[tx,ty,0,0,ty,-tx,0,0,0,0,-1,0,(a[0]+b[0])/2,(a[1]+b[1])/2,s*v.ZT,1]),off:[0,0,0],burn:this.burn});}}
    return out;
  }
}
