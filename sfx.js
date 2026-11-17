// sfx.js — WebAudio で合成する効果音(銃声・爆発・エンジン)
export class Sfx{
  constructor(){this.ctx=null;this.enabled=true;this.engine=null;}
  ensure(){if(this.ctx)return;try{this.ctx=new(window.AudioContext||window.webkitAudioContext)();
    const c=this.ctx,n=c.sampleRate*2,buf=c.createBuffer(1,n,c.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=Math.random()*2-1;this.noise=buf;
    this.master=c.createGain();this.master.gain.value=.6;this.master.connect(c.destination);
    // engine: low pulsing sawtooth
    const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type='sawtooth';o.frequency.value=38;
    f.type='lowpass';f.frequency.value=220;g.gain.value=0;o.connect(f).connect(g).connect(this.master);o.start();
    this.engine={o,g};}catch(e){this.ctx=null;}}
  resume(){if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});}
  burst({dur=.15,freq=1200,q=1,gain=.5,type='bandpass'}){const c=this.ctx;if(!c||!this.enabled)return;
    const s=c.createBufferSource();s.buffer=this.noise;const f=c.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;
    const g=c.createGain(),t=c.currentTime;g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    s.connect(f).connect(g).connect(this.master);s.start(t);s.stop(t+dur+.05);}
  shot(){this.burst({dur:.12,freq:1500,q:.7,gain:.35,type:'highpass'});}
  explosion(big=false){const c=this.ctx;if(!c||!this.enabled)return;
    this.burst({dur:big?1.6:.8,freq:big?180:320,q:.5,gain:big?1:.7,type:'lowpass'});
    const o=c.createOscillator(),g=c.createGain(),t=c.currentTime;o.type='sine';
    o.frequency.setValueAtTime(big?90:120,t);o.frequency.exponentialRampToValueAtTime(30,t+(big?1.2:.5));
    g.gain.setValueAtTime(big?.9:.6,t);g.gain.exponentialRampToValueAtTime(.001,t+(big?1.4:.6));
    o.connect(g).connect(this.master);o.start(t);o.stop(t+1.6);}
  setEngine(throttle,on){if(!this.engine)return;const e=this.engine,c=this.ctx,t=c.currentTime;
    const tgt=(on&&this.enabled)?.08+.12*throttle:0;e.g.gain.setTargetAtTime(tgt,t,.08);
    e.o.frequency.setTargetAtTime(38+28*throttle,t,.15);}
}
