'use strict';
// Óxido · Sonido y música sintetizados
// ================== audio (sintetizado) ==================
let actx=null,muted=false,noiseBuf=null,lastHitSfx=0,lastBoomSfx=-9,lastDownSfx=-9,lastPickSfx=-9;
// variación chica de tono para que los sonidos repetidos no suenen idénticos
const vary=(k=0.06)=>1+(Math.random()*2-1)*k;
function audioInit(){
  if(actx){if(actx.state!=='running')actx.resume();return;} // en iPhone puede quedar 'interrupted' tras una llamada
  try{actx=new(window.AudioContext||window.webkitAudioContext)();
    noiseBuf=actx.createBuffer(1,actx.sampleRate,actx.sampleRate);
    const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  }catch(e){actx=null;}
}
function tone(type,f0,f1,dur,vol){
  if(!actx||muted)return;const t=actx.currentTime;
  const o=actx.createOscillator(),g=actx.createGain();o.type=type;
  o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.connect(g).connect(actx.destination);o.start(t);o.stop(t+dur+0.02);
}
function noise(dur,vol,freq){
  if(!actx||muted)return;const t=actx.currentTime;
  const s=actx.createBufferSource();s.buffer=noiseBuf;
  const f=actx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(freq,t);f.frequency.exponentialRampToValueAtTime(60,t+dur);
  const g=actx.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  s.connect(f).connect(g).connect(actx.destination);s.start(t);s.stop(t+dur);
}
const later=(ms,f)=>setTimeout(f,ms);
// ---------- desbloqueo del sonido en iPhone y iPad ----------
// Safari solo deja sonar el audio si se crea o reanuda dentro de un gesto que "cuenta": levantar el dedo (touchend,
// pointerup, click) o una tecla. pointerdown solo no alcanza en iOS. Además:
// · un sonido mudo de 1 muestra en ese gesto termina de destrabarlo;
// · audioSession 'playback' (iOS 17+) hace que suene aunque el iPad o el iPhone estén en silencio;
// · al volver de segundo plano (o de una llamada) el contexto queda 'suspended' o 'interrupted' y se reanuda.
let audioOk=false;
function audioUnlock(){
  audioInit();if(!actx)return;
  if(actx.state!=='running'){try{const r=actx.resume();if(r&&r.catch)r.catch(()=>{});}catch(e){}}
  if(!audioOk){try{const b=actx.createBuffer(1,1,22050),s=actx.createBufferSource();s.buffer=b;s.connect(actx.destination);s.start(0);audioOk=true;}catch(e){}}
}
try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){}
for(const ev of ['touchend','pointerup','click','keydown'])addEventListener(ev,audioUnlock,{capture:true,passive:true});
function audioVolver(){if(!document.hidden&&actx&&actx.state!=='running'){try{const r=actx.resume();if(r&&r.catch)r.catch(()=>{});}catch(e){}}}
document.addEventListener('visibilitychange',audioVolver);addEventListener('pageshow',audioVolver);addEventListener('focus',audioVolver);
// clic mecánico corto y filtrado (recarga de la escopeta), programado en tiempo de audio
function clack(at,freq,vol){
  const s=actx.createBufferSource();s.buffer=noiseBuf;
  const f=actx.createBiquadFilter();f.type='bandpass';f.frequency.value=freq;f.Q.value=4;
  const g=actx.createGain();g.gain.setValueAtTime(0.0001,at);g.gain.linearRampToValueAtTime(vol,at+0.002);g.gain.exponentialRampToValueAtTime(0.001,at+0.035);
  s.connect(f).connect(g).connect(actx.destination);s.start(at,Math.random()*0.5);s.stop(at+0.05);
}
// escopeta: golpe grave (seno que cae) + cuerpo en triángulo + soplido de ruido corto y oscuro, y la recarga
function shotgunSfx(){
  if(!actx||muted)return;const t=actx.currentTime,v=vary(0.05);
  const o=actx.createOscillator(),g=actx.createGain();o.type='sine';
  o.frequency.setValueAtTime(170*v,t);o.frequency.exponentialRampToValueAtTime(50,t+0.15);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.24,t+0.004);g.gain.exponentialRampToValueAtTime(0.001,t+0.18);
  o.connect(g).connect(actx.destination);o.start(t);o.stop(t+0.22);
  tone('triangle',260*v,80,0.09,0.08);
  const n=actx.createBufferSource();n.buffer=noiseBuf;
  const lp=actx.createBiquadFilter();lp.type='lowpass';lp.Q.value=0.5;lp.frequency.setValueAtTime(2200,t);lp.frequency.exponentialRampToValueAtTime(150,t+0.12);
  const ng=actx.createGain();ng.gain.setValueAtTime(0.0001,t);ng.gain.linearRampToValueAtTime(0.28,t+0.003);ng.gain.exponentialRampToValueAtTime(0.001,t+0.13);
  n.connect(lp).connect(ng).connect(actx.destination);n.start(t,Math.random()*0.5);n.stop(t+0.15);
  clack(t+0.27,1300,0.16);clack(t+0.36,950,0.18);
}
// explosión en capas: golpe grave (seno que cae) + cuerpo de ruido filtrado; si llegan varias juntas, las de atrás van más bajas
function boomSfx(big){
  if(!actx||muted)return;const v=vary(0.08),soft=T-lastBoomSfx<4?0.45:1;lastBoomSfx=T;
  if(big){noise(1.2,0.4*soft,800*v);tone('sine',90*v,30,1,0.22*soft);noise(0.12,0.1*soft,3200);}
  else{noise(0.5,0.24*soft,1200*v);tone('sine',120*v,38,0.3,0.06*soft);}
}
const SFX={
  shoot:()=>{const v=vary(0.05);tone('square',900*v,280*v,0.06,0.045);},
  heavy:()=>{const v=vary(0.06);tone('sawtooth',480*v,110,0.07,0.045);noise(0.05,0.07,3000*v);},
  shotgun:()=>shotgunSfx(),
  flame:()=>noise(0.12,0.07,1800),
  rocket:()=>{const v=vary(0.05);tone('sawtooth',200*v,900*v,0.25,0.04);noise(0.25,0.06,1500);tone('sine',110,45,0.12,0.03);},
  eshoot:()=>{const v=vary(0.06);tone('square',380*v,180*v,0.08,0.03);},
  // impacto: chasquido cuadrado + cuerpo grave corto
  hit:()=>{if(T-lastHitSfx<3)return;lastHitSfx=T;const v=vary(0.08);tone('square',220*v,80,0.05,0.028);tone('sine',150*v,55,0.07,0.026);},
  // soldado que cae: golpe sordo contra el suelo
  down:()=>{if(T-lastDownSfx<4)return;lastDownSfx=T;const v=vary(0.08);tone('square',200*v,70,0.05,0.022);tone('sine',120*v,45,0.14,0.04);noise(0.09,0.035,700*v);},
  // dron derribado: silbido que cae
  fall:()=>{const v=vary(0.05);tone('triangle',760*v,140,0.5,0.03);},
  ping:()=>{if(T-lastHitSfx<3)return;lastHitSfx=T;tone('triangle',1800,1500,0.06,0.04);},
  boom:()=>boomSfx(false),
  bigboom:()=>boomSfx(true),
  thunder:()=>{noise(2,0.35,260);},
  jump:()=>tone('square',300,620,0.08,0.03),
  pick:()=>{if(Math.abs(T-lastPickSfx)<4)return;lastPickSfx=T;tone('square',600,1200,0.1,0.05);later(80,()=>tone('square',900,1800,0.1,0.05));},
  hurt:()=>tone('sawtooth',300,60,0.3,0.08),
  shield:()=>{tone('sine',1400,500,0.18,0.06);},
  toss:()=>tone('triangle',300,700,0.12,0.05),
  swap:()=>tone('square',700,900,0.04,0.03),
  step:()=>tone('triangle',110,50,0.08,0.05),
  alarm:()=>{tone('square',520,520,0.15,0.05);later(180,()=>tone('square',700,700,0.15,0.05));later(360,()=>tone('square',520,520,0.15,0.05));},
  radio:()=>{for(let i=0;i<3;i++)later(i*110,()=>tone('square',1300,1300,0.06,0.035));later(380,()=>{tone('sawtooth',75,68,2.4,0.05);tone('sawtooth',79,70,2.4,0.04);});},
  medal:()=>{[523,659,784,1047].forEach((f,i)=>later(i*90,()=>tone('square',f,f,0.12,0.05)));},
  // recolectar (recolectar.js): tintineo de chapita (sube por la escala con la racha), tic de la cuenta del HUD
  // (k de 0 a 1: sube de tono mientras cuenta) y el "tuc-tin" del premio que llega a su lugar
  rcChapa:n=>{const st=[0,2,4,7,9,12,14,16,19,21,24][Math.min(n,10)],f=1180*Math.pow(2,st/12)*vary(0.01);
    tone('triangle',f,f*0.985,0.08,0.03);tone('sine',f*2.76,f*2.7,0.045,0.01);},
  rcTic:k=>tone('triangle',1500+k*700,1420+k*700,0.022,0.018),
  // n: cuántos llegaron seguidos (0–3): cada uno un tono más arriba
  rcLlega:(n=0)=>{const k=Math.pow(2,[0,3,5,7][Math.min(n,3)]/12);tone('sine',380*k,760*k,0.07,0.04);later(35,()=>tone('triangle',1250*k,1400*k,0.05,0.02));}
};

// ================== música (composición original, chiptune sintetizado) ==================
const NOTE={C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,Bb:10,B:11};
function nm(s){const m=/^([A-G](?:#|b)?)(\d)$/.exec(s);return 12*(+m[2]+1)+NOTE[m[1]];}
const mtof=m=>440*Math.pow(2,(m-69)/12);
function parseLead(str){
  const byStep={};let s=0,cur=null;
  for(const tk of str.trim().split(/\s+/)){
    if(tk==='-'){if(cur)cur.len+=2;}
    else if(tk==='.')cur=null;
    else{cur={midi:nm(tk),len:2};(byStep[s]=byStep[s]||[]).push(cur);}
    s+=2;
  }
  return{byStep,steps:s};
}
const SONGS_SRC={
  title:{bpm:96,chords:[['A2','m'],['F2','M'],['C3','M'],['E2','M']],drum:'K.......S.......',bass:'r.......f.......',arp:'1.3.5.8.5.3.1.3.',
    lead:'E5 - - - A4 - C5 -  D5 - C5 - A4 - - -  G4 - C5 - E5 - D5 -  B4 - - - G#4 - - -'},
  l1:{bpm:140,chords:[['A2','m'],['F2','M'],['C3','M'],['G2','M'],['A2','m'],['F2','M'],['G2','M'],['E2','M']],drum:'K.h.S.h.K.K.S.hh',bass:'r.r.o.r.r.r.o.f.',arp:null,
    lead:'A4 . C5 E5 D5 C5 B4 C5  A4 - - . F4 A4 C5 A4  G4 . E4 G4 C5 B4 C5 D5  B4 - - . G4 . D5 .  E5 . D5 C5 B4 C5 D5 E5  F5 - E5 D5 C5 - A4 .  B4 . D5 . G5 - F5 D5  E5 - - - G#4 - B4 .'},
  l2:{bpm:150,chords:[['D2','m'],['Bb1','M'],['C2','M'],['A1','M'],['D2','m'],['Bb1','M'],['C2','M'],['A1','M']],drum:'K.hKS.h.K.hKS.hS',bass:'r.ror.r.r.ror.fo',arp:'1.5.8.5.1.5.8.5.',
    lead:'D5 . F5 . A5 G5 F5 E5  D5 - - . Bb4 D5 F5 D5  E5 . C5 E5 G5 F5 E5 C5  C#5 - - . A4 . E5 .  F5 E5 D5 . A4 D5 F5 A5  Bb5 - A5 G5 F5 - D5 .  G5 . E5 . C5 E5 G5 Bb5  A5 - - - C#5 - E5 .'},
  boss:{bpm:162,chords:[['E2','m'],['C2','M'],['A1','m'],['B1','M']],drum:'KhKhShKhKhKhShSS',bass:'rrorrrorrrorrfof',arp:'1358531813585318',
    lead:'E5 . E5 . G5 . F#5 E5  E5 - D5 - C5 - B4 -  A4 . C5 . E5 . D5 C5  B4 - D#5 - F#5 - B5 -'}
};
const SONGS={};for(const k in SONGS_SRC){const s=SONGS_SRC[k];SONGS[k]={...s,lead:parseLead(s.lead),steps:s.chords.length*16};}
const mus={name:null,song:null,step:0,t:0,gain:null,on:store.get('oxido-musica')!=='0',paused:false};
function musicGain(){if(!mus.gain&&actx){mus.gain=actx.createGain();mus.gain.gain.value=0.5;mus.gain.connect(actx.destination);}return mus.gain;}
function playMusic(name){if(mus.name===name)return;mus.name=name;mus.song=SONGS[name];mus.step=0;mus.t=0;}
function stopMusic(){mus.name=null;mus.song=null;}
function osc(type,midi,t,dur,vol,dest){
  const o=actx.createOscillator(),g=actx.createGain();o.type=type;o.frequency.setValueAtTime(mtof(midi),t);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+0.006);g.gain.exponentialRampToValueAtTime(vol*0.55,t+dur*0.6);g.gain.exponentialRampToValueAtTime(0.0005,t+dur);
  o.connect(g).connect(dest);o.start(t);o.stop(t+dur+0.03);
}
function drumAt(kind,t,dest){
  if(kind==='k'){const o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(40,t+0.12);
    g.gain.setValueAtTime(0.35,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.16);o.connect(g).connect(dest);o.start(t);o.stop(t+0.2);return;}
  const s=actx.createBufferSource();s.buffer=noiseBuf;const f=actx.createBiquadFilter();f.type='highpass';
  const g=actx.createGain();const snare=kind==='s';f.frequency.value=snare?1200:7000;
  g.gain.setValueAtTime(snare?0.16:0.045,t);g.gain.exponentialRampToValueAtTime(0.001,t+(snare?0.13:0.035));
  s.connect(f).connect(g).connect(dest);s.start(t,Math.random()*0.5);s.stop(t+0.15);
  if(snare)osc('triangle',nm('G3'),t,0.06,0.06,dest);
}
function playStep(song,s,t,sd,dest){
  const bar=Math.floor(s/16)%song.chords.length,k=s%16,[rn,qual]=song.chords[bar],root=nm(rn),third=qual==='m'?3:4;
  const d=song.drum[k];
  if(d!=='.'){if(d==='k'||d==='K')drumAt('k',t,dest);if(d==='s'||d==='S')drumAt('s',t,dest);if(d==='h'||d==='K'||d==='S')drumAt('h',t,dest);}
  const b=song.bass[k];
  if(b!=='.'){const off={r:0,o:12,f:7}[b];osc('triangle',root+off,t,sd*1.7,0.17,dest);osc('square',root+off+12,t,sd*0.8,0.018,dest);}
  if(song.arp){const a=song.arp[k];if(a!=='.'){const deg={1:0,3:third,5:7,8:12}[a];osc('square',root+24+deg,t,sd*0.8,0.017,dest);}}
  for(const n of song.lead.byStep[s%song.lead.steps]||[]){osc('square',n.midi,t,n.len*sd*0.95,0.042,dest);osc('triangle',n.midi-12,t,n.len*sd*0.95,0.03,dest);}
}
setInterval(()=>{
  if(!actx||!mus.song||muted||!mus.on||mus.paused)return;
  const g=musicGain(),sd=60/mus.song.bpm/4;
  if(mus.t<actx.currentTime-0.1)mus.t=actx.currentTime+0.03;
  while(mus.t<actx.currentTime+0.15){playStep(mus.song,mus.step,mus.t,sd,g);mus.step=(mus.step+1)%mus.song.steps;mus.t+=sd;}
},25);
function jingle(kind){
  stopMusic();if(!actx||muted||!mus.on)return;const g=musicGain(),t=actx.currentTime+0.05;
  if(kind==='win'){['C5','E5','G5','C6'].forEach((n,i)=>osc('square',nm(n),t+i*0.11,0.14,0.05,g));
    ['C5','E5','G5','C4'].forEach(n=>osc(n==='C4'?'triangle':'square',nm(n),t+0.5,1.1,n==='C4'?0.15:0.035,g));drumAt('k',t+0.5,g);}
  else{['A4','F4','D4','A3'].forEach((n,i)=>{osc('square',nm(n),t+i*0.26,0.3,0.045,g);osc('triangle',nm(n)-12,t+i*0.26,0.3,0.1,g);});}
}
