'use strict';
// Óxido · Misión 3: música y sonidos del pantano
// Se carga después de audio.js. Composición original. Todos los nombres propios llevan prefijo MU3_.
//
// MÚSICA (usar con playMusic(nombre)):
//   'l3'    tema de la misión 3 (pantano). Do menor, 138 bpm, 8 compases (~13,9 s por vuelta).
//           Bajo ondulante raíz-quinta-octava, arpegio "burbujeante" en semicorcheas sueltas
//           y una batería rengueante con bombo adelantado (K..K). El acorde de Re bemol (C#) del
//           compás 6 le da el color turbio.
//   'plant' villano final (planta carnívora). Fa menor, 170 bpm, 8 compases (~11,3 s por vuelta).
//           Más denso que 'boss': bombo y redoblante casi continuos, bajo que martilla y un giro
//           frigio (Fa menor → Re bemol → Sol bemol) que suena a amenaza vegetal.
//
// SONIDOS NUEVOS (SFX.nombre()):
//   splash  pisar o caer en barro (chapoteo grave). Tiene freno propio: no suena más de una vez cada 90 ms.
//   bubble  burbujas de barro, avisa que va a salir una criatura (3 "blups").
//   emerge  la criatura sale del barro (succión que sube + golpe grave).
//   spit    escupitajo de una criatura o de una cabeza de la planta.
//   bite    mordida de la planta (dos chasquidos graves).
//   spores  nube de esporas (soplido suave y aireado).
//   roar    rugido vegetal grave (entrada del villano, cambio de fase, golpe fuerte).
//   hover   motor del aerodeslizador, golpe corto (~0,28 s). Pensado para repetirse cada ~15 cuadros;
//           tiene freno propio de 120 ms.
//   squelch muerte de una criatura del barro (aplaste húmedo).
// Todos respetan "muted" y no hacen nada si el audio no arrancó.

// ---------- música ----------
const MU3_SRC={
  l3:{bpm:138,
    chords:[['C2','m'],['G#1','M'],['F2','m'],['G1','M'],['C2','m'],['C#2','M'],['Bb1','M'],['G1','M']],
    drum:'K..KS.h.K..KS.hh',
    bass:'r.f.o.f.r.f.ofo.',
    arp:'1.53.8..5.1.83.5',
    lead:'C5 - . G4 C5 D5 D#5 D5  C5 - G#4 - . G4 G#4 C5  F5 - D#5 . C5 . G#4 C5  B4 - - . D5 . G5 F5  '+
         'D#5 . D5 C5 G5 - D#5 C5  C#5 - - . F5 G#5 F5 C#5  D5 . F5 . Bb5 - G#5 G5  G5 - F5 - D5 - B4 .'},
  plant:{bpm:170,
    chords:[['F2','m'],['C#2','M'],['F#2','M'],['C2','M'],['F2','m'],['C#2','M'],['Bb1','m'],['C2','M']],
    drum:'KhSKKhShKhSKKhSS',
    bass:'rrofrrorrrofrfor',
    arp:'1385831513858315',
    lead:'F5 F5 G#5 F5 C6 - G#5 F5  F5 - C#5 - G#4 C#5 F5 G#5  F#5 . F#5 . Bb5 - C#6 Bb5  G5 - - E5 - - C5 E5  '+
         'F5 . C5 F5 G#5 . F5 G#5  C6 - Bb5 G#5 F5 - C#5 F5  Bb5 . C#6 . F5 . Bb5 G#5  G5 - E5 - C5 E5 G5 .'}
};
for(const k in MU3_SRC){const s=MU3_SRC[k];SONGS[k]={...s,lead:parseLead(s.lead),steps:s.chords.length*16};}

// ---------- sonidos ----------
const MU3_gate={};
// devuelve false si el mismo sonido sonó hace menos de "ms" (tiempo de audio)
function MU3_ok(key,ms){
  const now=actx.currentTime*1000,last=MU3_gate[key];
  if(last!==undefined&&now>=last&&now-last<ms)return false;
  MU3_gate[key]=now;return true;
}
// oscilador con barrido de frecuencia y envolvente con ataque suave; at = segundos desde ahora
function MU3_osc(type,f0,f1,at,dur,vol,atk){
  const t=actx.currentTime+at,o=actx.createOscillator(),g=actx.createGain();o.type=type;
  o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+(atk||0.005));g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.connect(g).connect(actx.destination);o.start(t);o.stop(t+dur+0.03);
  return o;
}
// ruido filtrado con barrido del filtro (lowpass o bandpass)
function MU3_nz(ftype,f0,f1,q,at,dur,vol,atk){
  const t=actx.currentTime+at,s=actx.createBufferSource();s.buffer=noiseBuf;
  const f=actx.createBiquadFilter();f.type=ftype;f.Q.value=q;
  f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);
  const g=actx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+(atk||0.004));g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  s.connect(f).connect(g).connect(actx.destination);s.start(t,Math.random()*0.5);s.stop(t+dur+0.02);
}
// motor o garganta: diente de sierra por un pasabajos, con temblor (LFO) sobre el volumen
function MU3_growl(f0,f1,cut,at,dur,vol,atk,trem,depth){
  const t=actx.currentTime+at,o=actx.createOscillator(),lp=actx.createBiquadFilter(),g=actx.createGain(),am=actx.createGain();
  o.type='sawtooth';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  lp.type='lowpass';lp.frequency.value=cut;lp.Q.value=1.2;
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+atk);g.gain.setValueAtTime(vol,t+dur*0.55);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  const l=actx.createOscillator(),lg=actx.createGain();l.type='sine';l.frequency.value=trem;lg.gain.value=depth;
  am.gain.value=1-depth;l.connect(lg).connect(am.gain);
  o.connect(lp).connect(g).connect(am).connect(actx.destination);
  o.start(t);o.stop(t+dur+0.03);l.start(t);l.stop(t+dur+0.03);
}
function MU3_splash(){
  if(!MU3_ok('splash',90))return;
  const p=0.85+Math.random()*0.3;
  MU3_nz('lowpass',1100*p,90,0.7,0,0.2,0.12);
  MU3_osc('sine',190*p,65,0,0.12,0.06);
  MU3_nz('bandpass',700*p,300,3,0.05,0.12,0.05,0.01);
}
function MU3_bubble(){
  for(let i=0;i<3;i++){
    const at=i*0.09+Math.random()*0.05,f=170+Math.random()*120;
    MU3_osc('sine',f,f*2.3,at,0.07,0.06,0.004);
  }
  MU3_nz('lowpass',500,80,0.5,0,0.3,0.05,0.05);
}
function MU3_emerge(){
  MU3_nz('lowpass',180,1100,1.5,0,0.45,0.14,0.2);
  MU3_osc('sine',60,150,0,0.42,0.1,0.15);
  MU3_nz('lowpass',900,80,0.7,0.38,0.22,0.14);
  MU3_osc('sine',140,50,0.38,0.16,0.12);
}
function MU3_spit(){
  MU3_nz('bandpass',1500,500,2.5,0,0.12,0.18);
  MU3_osc('triangle',520,190,0,0.09,0.05);
  MU3_nz('lowpass',600,80,0.7,0.02,0.1,0.06);
}
function MU3_bite(){
  for(const at of [0,0.075]){
    MU3_osc('square',170,55,at,0.08,0.035);
    MU3_nz('bandpass',900,300,2,at,0.07,0.2);
  }
  MU3_osc('sine',110,45,0.075,0.14,0.12);
}
function MU3_spores(){
  MU3_nz('bandpass',1800,700,1.1,0,0.5,0.12,0.08);
  MU3_nz('lowpass',900,200,0.6,0.05,0.4,0.06,0.1);
  for(let i=0;i<3;i++)MU3_osc('triangle',600+i*90,500+i*60,0.08+i*0.07,0.08,0.012,0.01);
}
function MU3_roar(){
  MU3_growl(88,52,520,0,1.15,0.2,0.12,17,0.45);
  MU3_growl(93,55,380,0.02,1.1,0.14,0.15,11,0.35);
  MU3_nz('lowpass',600,120,0.8,0,1.0,0.12,0.15);
}
function MU3_hover(){
  if(!MU3_ok('hover',120))return;
  MU3_growl(96,104,650,0,0.28,0.06,0.03,28,0.4);
  MU3_osc('square',192,200,0,0.26,0.012,0.03);
  MU3_nz('lowpass',700,300,0.6,0,0.26,0.03,0.03);
}
function MU3_squelch(){
  MU3_nz('lowpass',1400,70,0.9,0,0.3,0.2);
  MU3_osc('sine',230,55,0,0.22,0.08);
  MU3_nz('bandpass',500,200,4,0.08,0.16,0.07,0.02);
}
const MU3_SFX={splash:MU3_splash,bubble:MU3_bubble,emerge:MU3_emerge,spit:MU3_spit,bite:MU3_bite,
  spores:MU3_spores,roar:MU3_roar,hover:MU3_hover,squelch:MU3_squelch};
for(const k in MU3_SFX){const f=MU3_SFX[k];SFX[k]=()=>{if(!actx||muted)return;f();};}
