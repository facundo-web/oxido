'use strict';
// Óxido · Misión 5: música y sonidos de la ciudad sin luna
// Se carga después de audio.js. Composición original (no cita ninguna melodía conocida). Prefijo MU5_.
//
// MÚSICA (playMusic(nombre)):
//   'l5'     tema de la misión. Si menor, 112 bpm, 8 compases (~17 s por vuelta). Bajo lento que camina,
//            arpegio que repica como una campana lejana y una melodía larga, con aire; el acorde de Do mayor
//            del compás 6 (segundo grado rebajado) le da el color de calle mojada.
//   'niebla' villano (DON NIEBLA). Mi menor con giro frigio (Fa), 152 bpm: batería apretada,
//            bajo que insiste en la tónica y una línea que sube a la octava como una bocina.
//
// SONIDOS NUEVOS (SFX.nombre()):
//   chillido   aviso del murciélago antes de tirarse (tres chirridos agudos).
//   picada     el murciélago se lanza (silbido que baja).
//   aleteo     aleteo suave (freno propio de 140 ms).
//   murcimuere murciélago derribado (chirrido que cae).
//   rotor      helicóptero de la LECHUZA, golpe corto (freno propio de 110 ms).
//   fija       el foco de la LECHUZA te encontró (dos pitidos).
//   cohete     salida de un cohete.
//   bocina     bocina de niebla del dirigible (grave, larga).
//   cadena     cadena de la garra (traqueteo metálico, freno de 90 ms).
//   suelta     se abre la escotilla y cae un bidón.
//   motor      motor del dirigible (zumbido grave corto).
//   reflector  se prende el reflector (golpe de arco eléctrico + zumbido).
//   apagon     se apaga el reflector (chispazo y zumbido que baja).
// Todos respetan "muted" y no hacen nada si el audio no arrancó.

const MU5_SRC={
  l5:{bpm:112,
    chords:[['B1','m'],['G1','M'],['E2','m'],['F#1','M'],['B1','m'],['C2','M'],['G1','M'],['F#1','M']],
    drum:'K..hS..hK.KhS..h',
    bass:'r..ro..rr..rf.o.',
    arp:'1...5...8...5.3.',
    lead:'B4 - - . D5 C#5 B4 F#4  G4 - B4 - D5 - . .  E5 - D5 . B4 . G4 B4  Bb4 - - - C#5 - F#4 .  '+
         'B4 . F#5 . E5 D5 C#5 D5  C5 - - . E5 . G5 E5  D5 . B4 . G4 B4 D5 G5  F#5 - - - Bb4 - C#5 .'},
  niebla:{bpm:152,
    chords:[['E2','m'],['F2','M'],['E2','m'],['D2','M'],['C2','M'],['B1','M'],['E2','m'],['F2','M']],
    drum:'KhShKhSKKhShKSSS',
    bass:'rroorrofrroorfor',
    arp:'1853185318531858',
    lead:'E5 . G5 . B5 - A5 G5  F5 - - . A5 . C6 A5  G5 . E5 . B4 E5 G5 B5  A5 - F#5 - D5 - . .  '+
         'E5 . G5 C6 B5 . G5 E5  D#5 - F#5 - B5 - A5 F#5  G5 . B5 . E6 - D6 B5  C6 - A5 - F5 - E5 .'}
};
for(const k in MU5_SRC){const s=MU5_SRC[k];SONGS[k]={...s,lead:parseLead(s.lead),steps:s.chords.length*16};}

// ---------- sonidos ----------
const MU5_gate={};
function MU5_ok(key,ms){const now=actx.currentTime*1000,last=MU5_gate[key];if(last!==undefined&&now>=last&&now-last<ms)return false;MU5_gate[key]=now;return true;}
function MU5_osc(type,f0,f1,at,dur,vol,atk){
  const t=actx.currentTime+at,o=actx.createOscillator(),g=actx.createGain();o.type=type;
  o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+(atk||0.005));g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.connect(g).connect(actx.destination);o.start(t);o.stop(t+dur+0.03);
}
function MU5_nz(ftype,f0,f1,q,at,dur,vol,atk){
  const t=actx.currentTime+at,s=actx.createBufferSource();s.buffer=noiseBuf;
  const f=actx.createBiquadFilter();f.type=ftype;f.Q.value=q;
  f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);
  const g=actx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+(atk||0.004));g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  s.connect(f).connect(g).connect(actx.destination);s.start(t,Math.random()*0.5);s.stop(t+dur+0.02);
}
function MU5_saw(f0,f1,cut,at,dur,vol,atk){
  const t=actx.currentTime+at,o=actx.createOscillator(),lp=actx.createBiquadFilter(),g=actx.createGain();
  o.type='sawtooth';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);lp.type='lowpass';lp.frequency.value=cut;
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+atk);g.gain.setValueAtTime(vol,t+dur*0.7);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.connect(lp).connect(g).connect(actx.destination);o.start(t);o.stop(t+dur+0.03);
}
const MU5_SFX={
  chillido(){for(let i=0;i<3;i++){const f=2400+Math.random()*500;MU5_osc('triangle',f,f*1.35,i*0.07,0.05,0.035,0.003);}MU5_nz('bandpass',4200,3000,6,0,0.2,0.025);},
  picada(){MU5_osc('triangle',2600,700,0,0.28,0.03,0.01);MU5_nz('bandpass',2400,900,2,0,0.25,0.03,0.02);},
  aleteo(){if(!MU5_ok('aleteo',140))return;MU5_nz('lowpass',700,200,0.8,0,0.08,0.03,0.01);MU5_nz('lowpass',700,200,0.8,0.09,0.08,0.025,0.01);},
  murcimuere(){MU5_osc('triangle',2200,500,0,0.22,0.04);MU5_nz('bandpass',1800,600,3,0,0.12,0.03);},
  rotor(){if(!MU5_ok('rotor',110))return;MU5_nz('lowpass',380,120,1.2,0,0.1,0.07,0.005);MU5_osc('sine',70,52,0,0.09,0.06);},
  fija(){MU5_osc('square',1320,1320,0,0.06,0.04);MU5_osc('square',1760,1760,0.09,0.08,0.04);},
  cohete(){MU5_nz('bandpass',1800,500,1.5,0,0.3,0.06,0.01);MU5_osc('sawtooth',300,900,0,0.2,0.025);},
  bocina(){MU5_saw(70,66,420,0,1.5,0.16,0.12);MU5_saw(105,99,420,0.02,1.45,0.1,0.14);MU5_nz('lowpass',300,90,0.7,0,1.3,0.05,0.2);},
  cadena(){if(!MU5_ok('cadena',90))return;for(let i=0;i<3;i++){MU5_nz('bandpass',3200+i*400,2400,8,i*0.035,0.03,0.05,0.002);MU5_osc('triangle',1900+i*170,1700,i*0.035,0.04,0.012);}},
  suelta(){MU5_osc('square',260,140,0,0.1,0.03);MU5_osc('triangle',900,300,0.05,0.35,0.025);},
  motor(){MU5_saw(55,58,260,0,0.6,0.05,0.1);},
  reflector(){MU5_nz('highpass',5000,3000,0.7,0,0.18,0.08);MU5_osc('square',120,120,0,0.8,0.02,0.05);MU5_osc('sine',60,60,0,0.9,0.06,0.1);},
  apagon(){MU5_nz('bandpass',3000,800,2,0,0.25,0.08);MU5_osc('sawtooth',120,30,0.05,0.9,0.04,0.02);}
};
for(const k in MU5_SFX){const f=MU5_SFX[k];SFX[k]=()=>{if(!actx||muted)return;f();};}
