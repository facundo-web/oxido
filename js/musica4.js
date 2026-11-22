'use strict';
// Óxido · Misión 4: música y sonidos del desierto
// Se carga después de audio.js. Composición original. Nombres propios con prefijo MU4_.
//
// MÚSICA (playMusic(nombre)):
//   'l4'  tema de la misión 4. Escala de Re frigia dominante (Re, Mi bemol, Fa sostenido, Sol, La, Si bemol, Do):
//         la segunda aumentada (Mi bemol → Fa sostenido) le da el color de desierto. 128 bpm, 8 compases.
//         Batería de "dum-tek" con bombo corrido, bajo que pisa la tónica y un arpegio que va y viene como arena.
//   'rey' villano final. Mi frigia dominante, 166 bpm, 8 compases. Más denso, bajo que martilla y un lamento
//         que sube por la segunda aumentada.
//
// SONIDOS (SFX.nombre()): m4Arena (pisar arena movediza), m4Bicho (chasquido de escarabajo), m4Crack (escarabajo
//   reventado), m4Gemido (momia), m4Venda (venda que se rasga), m4Golpe (golpe seco de piedra), m4Soplo (bola de
//   polvo / soplido), m4Tapa (tapa de sarcófago que tiembla), m4Viento (ráfaga de viento larga), m4Rugido (la cara
//   de la tormenta), m4Aviso (aviso de ráfaga), m4Rafaga (pasa la ráfaga), m4Metal (bronce), m4Aullido (chacal),
//   m4Gruñido (chacal por saltar), m4Rey (voz del rey).
// Todos respetan "muted" y no hacen nada si el audio no arrancó.

// ---------- música ----------
const MU4_SRC={
  l4:{bpm:128,
    chords:[['D2','M'],['D#2','M'],['D2','M'],['C2','m'],['G1','m'],['D#2','M'],['C2','m'],['D2','M']],
    drum:'K..hS.h.K.KhS..h',
    bass:'r..or.f.r.r.o.f.',
    arp:'1.3.5.8.5.3.1...',
    lead:'A4 . D5 D#5 F#5 - D#5 D5  D#5 - - . G5 F#5 D#5 D5  F#5 . A5 . G5 F#5 D#5 F#5  D5 - - . C5 . D#5 .  '+
         'G5 . Bb5 A5 G5 . F#5 G5  A5 - Bb5 A5 G5 F#5 D#5 .  C5 . D#5 . G5 . F#5 D#5  D5 - - - A4 . D5 .'},
  rey:{bpm:166,
    chords:[['E2','M'],['F2','M'],['E2','M'],['D2','m'],['C2','M'],['F2','M'],['D2','m'],['E2','M']],
    drum:'KhSKKhShKhSKKSSh',
    bass:'rrorrfrorrorfrfo',
    arp:'1358531813585318',
    lead:'E5 F5 G#5 . B5 - A5 G#5  F5 - E5 - D5 - E5 .  G#5 . A5 B5 C6 - B5 A5  G#5 - F5 - E5 - . .  '+
         'A5 . G#5 F5 E5 . D5 E5  F5 - G#5 - B5 - A5 G#5  D5 . F5 . A5 - G#5 F5  E5 - - - B4 . E5 .'}
};
for(const k in MU4_SRC){const s=MU4_SRC[k];SONGS[k]={...s,lead:parseLead(s.lead),steps:s.chords.length*16};}

// ---------- sonidos ----------
const MU4_gate={};
function MU4_ok(key,ms){const now=actx.currentTime*1000,last=MU4_gate[key];if(last!==undefined&&now>=last&&now-last<ms)return false;MU4_gate[key]=now;return true;}
function MU4_osc(type,f0,f1,at,dur,vol,atk){
  const t=actx.currentTime+at,o=actx.createOscillator(),g=actx.createGain();o.type=type;
  o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+(atk||0.005));g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.connect(g).connect(actx.destination);o.start(t);o.stop(t+dur+0.03);
}
function MU4_nz(ftype,f0,f1,q,at,dur,vol,atk){
  const t=actx.currentTime+at,s=actx.createBufferSource();s.buffer=noiseBuf;
  const f=actx.createBiquadFilter();f.type=ftype;f.Q.value=q;
  f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);
  const g=actx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+(atk||0.004));g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  s.connect(f).connect(g).connect(actx.destination);s.start(t,Math.random()*0.5);s.stop(t+dur+0.02);
}
// voz grave: diente de sierra filtrado con temblor
function MU4_voz(f0,f1,cut,at,dur,vol,trem,depth){
  const t=actx.currentTime+at,o=actx.createOscillator(),lp=actx.createBiquadFilter(),g=actx.createGain(),am=actx.createGain();
  o.type='sawtooth';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  lp.type='lowpass';lp.frequency.value=cut;lp.Q.value=2;
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+dur*0.2);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  const l=actx.createOscillator(),lg=actx.createGain();l.type='sine';l.frequency.value=trem;lg.gain.value=depth;am.gain.value=1-depth;l.connect(lg).connect(am.gain);
  o.connect(lp).connect(g).connect(am).connect(actx.destination);o.start(t);o.stop(t+dur+0.03);l.start(t);l.stop(t+dur+0.03);
}
const MU4_SFX={
  m4Arena(){if(!MU4_ok('arena',110))return;const p=0.85+Math.random()*0.3;MU4_nz('lowpass',900*p,120,0.6,0,0.25,0.1,0.02);MU4_osc('sine',120*p,60,0,0.18,0.05);},
  m4Bicho(){if(!MU4_ok('bicho',70))return;for(let i=0;i<3;i++)MU4_nz('bandpass',3200+Math.random()*900,2600,6,i*0.035,0.025,0.06);},
  m4Crack(){MU4_nz('bandpass',2200,900,3,0,0.08,0.16);MU4_osc('square',600,180,0,0.06,0.025);},
  m4Gemido(){if(!MU4_ok('gemido',300))return;const p=0.9+Math.random()*0.2;MU4_voz(140*p,95*p,700,0,0.7,0.08,5,0.3);MU4_nz('lowpass',600,200,1,0,0.6,0.03,0.2);},
  m4Venda(){if(!MU4_ok('venda',80))return;MU4_nz('highpass',3000,5000,0.8,0,0.09,0.07);MU4_nz('bandpass',1800,1200,2,0.03,0.06,0.05);},
  m4Golpe(){MU4_nz('lowpass',700,60,0.8,0,0.32,0.22);MU4_osc('sine',90,38,0,0.3,0.16);},
  m4Soplo(){MU4_nz('bandpass',1200,500,1.2,0,0.35,0.12,0.06);MU4_osc('triangle',300,180,0,0.2,0.02);},
  m4Tapa(){if(!MU4_ok('tapa',150))return;for(let i=0;i<3;i++)MU4_nz('lowpass',400,150,1,i*0.06,0.08,0.09);MU4_osc('square',70,60,0,0.2,0.015);},
  m4Viento(){if(!MU4_ok('viento',600))return;MU4_nz('bandpass',400,1400,3,0,1.4,0.07,0.5);MU4_nz('bandpass',900,300,4,0.3,1.2,0.05,0.4);},
  m4Rugido(){MU4_voz(70,48,420,0,1.8,0.18,9,0.4);MU4_voz(74,50,300,0.05,1.7,0.12,6,0.3);MU4_nz('lowpass',500,90,0.7,0,1.6,0.14,0.3);},
  m4Aviso(){MU4_osc('square',1180,1180,0,0.05,0.03);MU4_osc('square',1180,1180,0.09,0.05,0.03);},
  m4Rafaga(){if(!MU4_ok('rafaga',120))return;MU4_nz('bandpass',2400,500,1.5,0,0.5,0.12,0.03);},
  m4Metal(){if(!MU4_ok('metal',90))return;const p=0.9+Math.random()*0.2;MU4_osc('square',520*p,470*p,0,0.12,0.03);MU4_osc('triangle',1310*p,1250*p,0,0.22,0.025);MU4_nz('bandpass',3000,2000,5,0,0.05,0.06);},
  m4Aullido(){MU4_osc('sawtooth',260,520,0,0.5,0.05,0.12);MU4_osc('sawtooth',520,380,0.5,0.7,0.05,0.02);MU4_osc('square',263,525,0,0.5,0.015,0.12);},
  'm4Gruñido'(){MU4_voz(80,70,500,0,0.5,0.1,22,0.5);},
  m4Rey(){MU4_voz(95,62,600,0,1.2,0.16,7,0.35);MU4_voz(143,93,900,0.04,1.1,0.06,4,0.2);MU4_nz('bandpass',700,300,1,0,1.0,0.08,0.3);}
};
for(const k in MU4_SFX){const f=MU4_SFX[k];SFX[k]=()=>{if(!actx||muted)return;f();};}
