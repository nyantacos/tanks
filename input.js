// input.js — キーボードと画面ボタンを同じアクション名に束ねる
const KEYMAP={
  KeyW:'fwd',ArrowUp:'fwd',KeyS:'back',ArrowDown:'back',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',
  KeyQ:'turL',KeyE:'turR',KeyR:'elvUp',KeyF:'elvDn',Space:'fire',KeyH:'hit',Enter:'reset',KeyC:'camo',KeyV:'view',KeyX:'auto',
};
export class Input{
  constructor(){
    this.down=new Set();this.edge=new Set();this.listeners=[];
    addEventListener('keydown',e=>{const a=KEYMAP[e.code];if(!a||e.metaKey||e.ctrlKey||e.altKey)return;
      if(e.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;
      e.preventDefault();if(!this.down.has(a)){this.down.add(a);this.edge.add(a);}this.fire('gesture');});
    addEventListener('keyup',e=>{const a=KEYMAP[e.code];if(a)this.down.delete(a);});
    addEventListener('blur',()=>this.down.clear());
  }
  /** 画面上のボタンを押下中アクションとして登録 */
  bindButton(el,action){
    const on=e=>{e.preventDefault();el.setPointerCapture?.(e.pointerId);if(!this.down.has(action)){this.down.add(action);this.edge.add(action);}
      el.classList.add('held');this.fire('gesture');};
    const off=()=>{this.down.delete(action);el.classList.remove('held');};
    el.addEventListener('pointerdown',on);el.addEventListener('pointerup',off);el.addEventListener('pointercancel',off);el.addEventListener('lostpointercapture',off);
    el.addEventListener('contextmenu',e=>e.preventDefault());
  }
  held(a){return this.down.has(a);}
  /** 押された瞬間だけ true(1フレーム限り) */
  pressed(a){if(this.edge.has(a)){this.edge.delete(a);return true;}return false;}
  axis(neg,pos){return(this.held(pos)?1:0)-(this.held(neg)?1:0);}
  on(ev,f){this.listeners.push([ev,f]);}
  fire(ev){for(const[e,f]of this.listeners)if(e===ev)f();}
  endFrame(){this.edge.clear();}
}
