'use strict';
// Óxido · Misión 7: música y sonidos de la nave a la deriva
// Se carga después de audio.js. Composición original. Nombres propios con prefijo MU7_.
//
// MÚSICA (playMusic(nombre)):
//   'l7'     tema de la misión. La menor con acordes prestados (Do menor, Mi bemol) que dejan todo en suspenso.
//            100 bpm, 8 compases: bombo espaciado, un pulso de bajo grave, arpegio lento y una melodía de notas largas
//            que cae por semitonos.
//   'm7Jefa' villano final (LA MARAÑA). Do menor con Re bemol (frigio), 150 bpm, 8 compases, bajo que martilla
//            y una línea que sube y se quiebra.
//
// SONIDOS (SFX.nombre()): m7Raspa(vol) metal que se arrastra en el ducto (más fuerte cuanto más cerca),
//   m7Reja rejilla que vibra, m7Cae la rejilla que se abre, m7Chillido del raspador, m7Salto, m7Muere, m7Golpe golpe
//   metálico, m7Bulbo chisporroteo, m7Vapor, m7Zumbido (dron), m7Laser, m7Soplete, m7Remache, m7Tentaculo,
//   m7Escupe, m7Rugido (la masa).
// Todos respetan "muted" y no hacen nada si el audio no arrancó.

// ---------- música ----------
const MU7_SRC={
  l7:{bpm:100,
    chords:[['A1','m'],['A1','m'],['F1','M'],['E1','M'],['A1','m'],['C2','m'],['D#2','M'],['E1','M']],
    drum:'K.......h.....S.',
    bass:'r.......r...o...',
    arp:'1...5...8...5...',
    lead:'A4 - - - C5 - B4 .  E5 - - - D#5 - - .  F5 - E5 - C5 - - .  B4 - - - G#4 - - .  '+
         'A4 - C5 - E5 - F5 .  G5 - - - D#5 - D5 .  D#5 - - - Bb4 - G4 .  G#4 - - - B4 - E5 .'},
  m7Jefa:{bpm:150,
    chords:[['C2','m'],['C#2','M'],['C2','m'],['G1','M'],['C2','m'],['G#1','M'],['F1','m'],['G1','M']],
    drum:'K.hKS.hhK.hKS.hS',
    bass:'r.ror.rfr.ror.fo',
    arp:'1.5.8.5.1.5.8.3.',
    lead:'C5 . D#5 . G5 - F5 D#5  C#5 - - . C5 - G4 .  C5 . D#5 . G5 . G#5 G5  B4 - - - D5 - G4 .  '+
         'D#5 . G5 . C6 - B5 G#5  G5 - - . D#5 . C5 .  F5 . G#5 . C6 - G#5 F5  G5 - D5 - B4 - G4 .'}
};
for(const k in MU7_SRC){const s=MU7_SRC[k];SONGS[k]={...s,lead:parseLead(s.lead),steps:s.chords.length*16};}

// ---------- sonidos ----------
const MU7_gate={};
function MU7_ok(key,ms){const now=actx.currentTime*1000,last=MU7_gate[key];if(last!==undefined&&now>=last&&now-last<ms)return false;MU7_gate[key]=now;return true;}
function MU7_osc(type,f0,f1,at,dur,vol,atk){
  const t=actx.currentTime+at,o=actx.createOscillator(),g=actx.createGain();o.type=type;
  o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+(atk||0.005));g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.connect(g).connect(actx.destination);o.start(t);o.stop(t+dur+0.03);
}
function MU7_nz(ftype,f0,f1,q,at,dur,vol,atk){
  const t=actx.currentTime+at,s=actx.createBufferSource();s.buffer=noiseBuf;
  const f=actx.createBiquadFilter();f.type=ftype;f.Q.value=q;
  f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);
  const g=actx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+(atk||0.004));g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  s.connect(f).connect(g).connect(actx.destination);s.start(t,Math.random()*0.5);s.stop(t+dur+0.02);
}
// voz grave húmeda: diente de sierra filtrado con temblor
function MU7_voz(f0,f1,cut,at,dur,vol,trem,depth){
  const t=actx.currentTime+at,o=actx.createOscillator(),lp=actx.createBiquadFilter(),g=actx.createGain(),am=actx.createGain();
  o.type='sawtooth';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  lp.type='lowpass';lp.frequency.value=cut;lp.Q.value=3;
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+dur*0.2);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  const l=actx.createOscillator(),lg=actx.createGain();l.type='sine';l.frequency.value=trem;lg.gain.value=depth;am.gain.value=1-depth;l.connect(lg).connect(am.gain);
  o.connect(lp).connect(g).connect(am).connect(actx.destination);o.start(t);o.stop(t+dur+0.03);l.start(t);l.stop(t+dur+0.03);
}
const MU7_SFX={
  // raspado: ruido de banda angosta que sube y baja, con tres "pasos" metálicos; v de 0 a 1 según la distancia
  m7Raspa(v){if(!MU7_ok('raspa',150))return;v=v===undefined?0.6:v;const p=0.9+Math.random()*0.2;
    MU7_nz('bandpass',1500*p,2600*p,9,0,0.22,0.07*v,0.05);MU7_nz('bandpass',700*p,500*p,5,0.08,0.16,0.05*v,0.03);
    for(let i=0;i<3;i++)MU7_osc('square',190*p+i*30,160*p,i*0.06,0.03,0.012*v);},
  m7Reja(){if(!MU7_ok('reja',80))return;for(let i=0;i<4;i++)MU7_nz('bandpass',2600+Math.random()*800,2000,8,i*0.025,0.02,0.07);MU7_osc('square',410,380,0,0.08,0.012);},
  m7Cae(){MU7_osc('triangle',900,820,0,0.25,0.04);MU7_osc('square',1350,1290,0,0.18,0.015);MU7_nz('bandpass',2500,1200,3,0,0.2,0.1);},
  m7Chillido(){if(!MU7_ok('chilla',160))return;const p=0.9+Math.random()*0.25;
    MU7_osc('sawtooth',1300*p,2400*p,0,0.09,0.025);MU7_osc('sawtooth',2200*p,1500*p,0.09,0.12,0.02);MU7_nz('highpass',4000,6000,1,0,0.15,0.04);},
  m7Salto(){MU7_nz('bandpass',3000,5500,2,0,0.16,0.06,0.02);MU7_osc('triangle',500,900,0,0.12,0.02);},
  m7Muere(){MU7_nz('bandpass',1800,500,3,0,0.14,0.14);MU7_osc('square',700,140,0,0.12,0.03);MU7_osc('sine',220,90,0.02,0.16,0.05);},
  m7Golpe(){MU7_nz('lowpass',900,80,0.8,0,0.28,0.2);MU7_osc('sine',110,45,0,0.26,0.14);MU7_osc('triangle',520,470,0,0.15,0.02);},
  m7Bulbo(){if(!MU7_ok('bulbo',90))return;for(let i=0;i<5;i++)MU7_nz('highpass',4000+Math.random()*2000,3000,2,i*0.03+Math.random()*0.01,0.015,0.05);MU7_osc('square',120,118,0,0.12,0.012);},
  m7Vapor(){if(!MU7_ok('vapor',500))return;MU7_nz('highpass',3500,2500,0.7,0,0.7,0.05,0.04);},
  m7Zumbido(){if(!MU7_ok('zumb',250))return;MU7_osc('sawtooth',96,92,0,0.32,0.018,0.05);MU7_osc('square',192,186,0,0.32,0.008,0.05);},
  m7Laser(){MU7_osc('square',1800,300,0,0.22,0.035);MU7_osc('sine',2400,600,0,0.2,0.03);},
  m7Soplete(){if(!MU7_ok('sopl',120))return;MU7_nz('bandpass',5000,4200,1.5,0,0.18,0.06,0.01);MU7_osc('sawtooth',60,60,0,0.18,0.02);},
  m7Remache(){for(let i=0;i<3;i++){MU7_osc('square',900,300,i*0.05,0.04,0.035);MU7_nz('bandpass',3000,1500,3,i*0.05,0.03,0.08);}},
  m7Tentaculo(){MU7_nz('bandpass',400,1500,2,0,0.4,0.08,0.15);MU7_voz(90,70,500,0,0.4,0.05,12,0.4);},
  m7Escupe(){MU7_nz('lowpass',1200,300,2,0,0.3,0.12,0.02);MU7_osc('sine',260,90,0,0.25,0.06);},
  m7Rugido(){MU7_voz(62,44,380,0,1.6,0.17,8,0.45);MU7_voz(93,66,600,0.06,1.4,0.07,5,0.3);MU7_nz('lowpass',700,90,0.8,0,1.4,0.12,0.3);}
};
for(const k in MU7_SFX){const f=MU7_SFX[k];SFX[k]=(...a)=>{if(!actx||muted)return;f(...a);};}
