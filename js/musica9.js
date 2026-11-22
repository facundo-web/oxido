'use strict';
// Óxido · Misión 9: música y sonidos de la ciudad embrujada
// Se carga después de audio.js. Composición original. Nombres propios con prefijo MU9_.
//
// MÚSICA (playMusic(nombre)):
//   'l9'        tema de la misión: misterio con swing oscuro. Re menor, 116 bpm, 8 compases. La batería va
//               "rengueando" (golpes en 1 y 4 de cada negra, como un swing), el bajo camina raíz-quinta-octava
//               y la melodía usa la quinta disminuida (La bemol) y una cadencia por Mi mayor que deja todo en el aire.
//   'm9Casero'  villano final (EL CASERO). Sol menor con Mi bemol y La bemol prestados, 148 bpm, bajo que
//               martilla en swing y una línea que sube a los saltos y se cae por cromatismos.
//
// SONIDOS (SFX.nombre()): m9Aparece (sale de una pared o del piso), m9Solido (se pone sólido: campanita de vidrio),
//   m9Embiste, m9Muere (se deshace), m9Lamento (gemido lejano), m9Atraviesa (la bala lo cruza), m9Persiana,
//   m9Cartel (chirrido), m9Tranvia (campana del tranvía), m9Farol (la llama se aviva), m9Llama (disparo del farol),
//   m9Cristal, m9Cadena, m9Plato (sale volando), m9Rompe (vajilla rota), m9Golpe (mueble contra el piso),
//   m9Puertas (ropero que se abre), m9Risa (el villano), m9Desarma, m9Rearma.
// Todos respetan "muted" y no hacen nada si el audio no arrancó.

// ---------- música ----------
const MU9_SRC={
  l9:{bpm:116,
    chords:[['D2','m'],['D2','m'],['G1','m'],['A1','M'],['D2','m'],['Bb1','M'],['E1','M'],['A1','M']],
    drum:'K..hS..hK..hS.hh',
    bass:'r..f.o.fr..f.o.f',
    arp:'1..5...8..5...3.',
    lead:'A4 - D5 - F5 - E5 D5  C#5 - - - A4 - . .  Bb4 - D5 - G5 - F5 D#5  E5 - - - C#5 - A4 .  '+
         'D5 . F5 . A5 G#5 A5 F5  D5 - Bb4 - F4 - G4 A4  G#4 - B4 - E5 - D5 B4  C#5 - - - E5 - A4 .'},
  m9Casero:{bpm:148,
    chords:[['G1','m'],['G1','m'],['D#2','M'],['D2','M'],['G1','m'],['C2','m'],['G#1','M'],['D2','M']],
    drum:'K..hS.hKK..hS.hS',
    bass:'r..fo..fr..fo.ff',
    arp:'1..5.8..1..5.3..',
    lead:'G4 . Bb4 . D5 - C#5 D5  G5 - F5 - D5 - Bb4 .  D#5 - G5 - Bb5 - G5 D#5  F#5 - - - D5 - A4 .  '+
         'G4 G4 Bb4 D5 F5 - D5 Bb4  C5 - D#5 - G5 - F5 D#5  C5 - D#5 - G#5 - G5 F5  F#5 - A5 - D5 - - .'}
};
for(const k in MU9_SRC){const s=MU9_SRC[k];SONGS[k]={...s,lead:parseLead(s.lead),steps:s.chords.length*16};}

// ---------- sonidos ----------
const MU9_gate={};
function MU9_ok(key,ms){const now=actx.currentTime*1000,last=MU9_gate[key];if(last!==undefined&&now>=last&&now-last<ms)return false;MU9_gate[key]=now;return true;}
function MU9_osc(type,f0,f1,at,dur,vol,atk){
  const t=actx.currentTime+at,o=actx.createOscillator(),g=actx.createGain();o.type=type;
  o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+(atk||0.005));g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.connect(g).connect(actx.destination);o.start(t);o.stop(t+dur+0.03);
}
function MU9_nz(ftype,f0,f1,q,at,dur,vol,atk){
  const t=actx.currentTime+at,s=actx.createBufferSource();s.buffer=noiseBuf;
  const f=actx.createBiquadFilter();f.type=ftype;f.Q.value=q;
  f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);
  const g=actx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+(atk||0.004));g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  s.connect(f).connect(g).connect(actx.destination);s.start(t,Math.random()*0.5);s.stop(t+dur+0.02);
}
// voz fantasma: seno con vibrato lento (sube y baja como un gemido)
function MU9_voz(f0,f1,at,dur,vol,vib,depth,type){
  const t=actx.currentTime+at,o=actx.createOscillator(),g=actx.createGain(),l=actx.createOscillator(),lg=actx.createGain();
  o.type=type||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  l.type='sine';l.frequency.value=vib;lg.gain.value=depth;l.connect(lg).connect(o.frequency);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+dur*0.3);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.connect(g).connect(actx.destination);o.start(t);o.stop(t+dur+0.03);l.start(t);l.stop(t+dur+0.03);
}
const MU9_SFX={
  m9Aparece(){if(!MU9_ok('apar',140))return;MU9_nz('bandpass',300,1400,3,0,0.45,0.06,0.2);MU9_voz(220,330,0,0.5,0.025,5,8);},
  // aviso de ataque: dos notas de vidrio que suben y un brillo de ruido agudo
  m9Solido(){if(!MU9_ok('sol',90))return;MU9_osc('triangle',1568,1560,0,0.25,0.035);MU9_osc('sine',2349,2340,0.07,0.3,0.03);
    MU9_osc('sine',3136,3120,0.07,0.18,0.012);MU9_nz('highpass',6000,8000,1,0,0.2,0.025);},
  m9Embiste(){MU9_nz('bandpass',600,2200,2,0,0.3,0.09,0.05);MU9_voz(300,520,0,0.3,0.03,9,14,'triangle');},
  m9Muere(){MU9_voz(660,180,0,0.5,0.045,7,20);MU9_nz('highpass',3000,1200,1,0,0.4,0.05,0.02);MU9_osc('sine',1320,1300,0,0.12,0.02);},
  m9Lamento(v){if(!MU9_ok('lam',900))return;v=v===undefined?0.6:v;const p=0.9+Math.random()*0.2;MU9_voz(260*p,200*p,0,1.1,0.03*v,4,10);},
  m9Atraviesa(){if(!MU9_ok('atr',120))return;MU9_osc('sine',900,1400,0,0.08,0.015);MU9_nz('bandpass',2500,4000,4,0,0.08,0.02);},
  m9Persiana(v){if(!MU9_ok('pers',200))return;v=v===undefined?1:v;MU9_nz('lowpass',1400,120,1,0,0.16,0.18*v);MU9_osc('square',140,80,0,0.08,0.03*v);
    MU9_nz('bandpass',900,600,4,0.07,0.06,0.06*v);},
  m9Cartel(v){if(!MU9_ok('cart',600))return;v=v===undefined?0.5:v;MU9_osc('sawtooth',620,540,0,0.32,0.008*v,0.08);MU9_osc('sawtooth',660,590,0.02,0.3,0.006*v,0.08);},
  m9Tranvia(){if(!MU9_ok('tran',1500))return;for(const at of[0,0.32]){MU9_osc('triangle',1180,1170,at,0.5,0.03);MU9_osc('sine',2950,2940,at,0.3,0.012);}
    MU9_nz('lowpass',300,120,0.7,0,1.2,0.05,0.3);},
  m9Farol(){if(!MU9_ok('far',120))return;MU9_nz('bandpass',800,2600,1.5,0,0.3,0.07,0.08);MU9_osc('sine',523,784,0,0.28,0.02);},
  m9Llama(){MU9_nz('bandpass',1200,500,2,0,0.25,0.08,0.01);MU9_voz(500,380,0,0.25,0.025,12,20,'triangle');},
  m9Cristal(){if(!MU9_ok('cris',70))return;for(let i=0;i<4;i++){const f=2400+Math.random()*1800;MU9_osc('sine',f,f*0.99,i*0.035+Math.random()*0.02,0.12,0.012);}},
  m9Cadena(){if(!MU9_ok('cad',160))return;for(let i=0;i<5;i++)MU9_nz('bandpass',2200+Math.random()*900,1800,6,i*0.045,0.03,0.06);},
  m9Plato(){MU9_nz('bandpass',1800,3200,3,0,0.2,0.05,0.04);MU9_osc('sine',1700,2100,0,0.15,0.01);},
  m9Rompe(){if(!MU9_ok('romp',60))return;for(let i=0;i<5;i++){const f=3000+Math.random()*2500;MU9_osc('triangle',f,f*0.8,i*0.025,0.08,0.02);}MU9_nz('highpass',3000,2000,1,0,0.15,0.08);},
  m9Golpe(){MU9_nz('lowpass',700,70,0.8,0,0.32,0.22);MU9_osc('sine',90,40,0,0.3,0.16);MU9_osc('triangle',240,200,0,0.12,0.03);},
  m9Puertas(){MU9_osc('sawtooth',180,240,0,0.35,0.012,0.1);MU9_osc('sawtooth',190,250,0.03,0.3,0.01,0.1);MU9_nz('lowpass',500,200,1,0.3,0.12,0.12);},
  m9Risa(){for(let i=0;i<4;i++)MU9_voz(150-i*9,120-i*9,i*0.17,0.16,0.07,6,6,'sawtooth');MU9_nz('lowpass',600,200,1,0,0.7,0.04,0.1);},
  m9Desarma(){MU9_nz('bandpass',400,3000,1,0,0.6,0.12,0.05);MU9_voz(200,600,0,0.6,0.04,7,30);for(let i=0;i<4;i++)MU9_osc('square',300+i*80,120,i*0.08,0.06,0.02);},
  m9Rearma(){MU9_nz('bandpass',3000,300,1,0,0.6,0.1,0.3);MU9_voz(600,180,0,0.6,0.04,7,30);}
};
for(const k in MU9_SFX){const f=MU9_SFX[k];SFX[k]=(...a)=>{if(!actx||muted)return;f(...a);};}
