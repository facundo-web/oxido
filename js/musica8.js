'use strict';
// Óxido · Misión 8: música y sonidos del Valle del Trueno
// Se carga después de audio.js. Composición original. Nombres propios con prefijo MU8_.
//
// MÚSICA (playMusic(nombre)):
//   'l8'     tema de la misión. Mi menor, 112 bpm, 8 compases. Tambores graves sincopados, bajo en ostinato
//            y una melodía corta que sube por saltos y se queda colgada en la sensible (clima tenso de selva).
//   'trueno' villano (PISATRUENO). Re menor, 148 bpm, 8 compases, tambores casi continuos y arpegio que martilla.
//
// SONIDOS (SFX.nombre()):
//   m8paso(k)   pisada del gigante: golpe grave, más fuerte con k (0–1)   m8pajaros  bandada que sale volando
//   m8chillido  garra que chilla (distrae)       m8agazape  garra agazapada: tres chasquidos que suben (aviso)
//   m8salto     garra que salta                   m8resopla  resoplido (el gigante olfatea, el TOPADOR rasca)
//   m8rugido    rugido mecánico del gigante (vapor y chapa, sin muestras de nada conocido)
//   m8vapor     silbido de vapor (aviso de mordida)   m8mordida  la mandíbula de pistón que cierra
//   m8piedra    piedra que cae o golpe contra la roca  m8embiste el TOPADOR arranca a embestir
//   m8placa     placa de óxido que se suelta          m8gota     gotita del charco
// Todos respetan "muted" y no hacen nada si el audio no arrancó.

const MU8_SRC={
  l8:{bpm:112,
    chords:[['E2','m'],['E2','m'],['C2','M'],['B1','M'],['E2','m'],['D2','M'],['C2','M'],['B1','M']],
    drum:'K..k.S.K..k.KS.h',
    bass:'r..r.o.r..f.ro.r',
    arp:'1..5..8..5..3...',
    lead:'E5 - . B4 D5 E5 G5 -  F#5 E5 D5 - B4 . . .  C5 - E5 G5 - E5 C5 .  B4 - D#5 F#5 A5 - F#5 .  '+
         'G5 - F#5 E5 . B4 E5 G5  A5 - F#5 D5 - A4 D5 .  E5 . C5 . G4 - C5 E5  D#5 - - - B4 - . .'},
  trueno:{bpm:148,
    chords:[['D2','m'],['D2','m'],['Bb1','M'],['A1','M'],['D2','m'],['F2','M'],['G2','M'],['A1','M']],
    drum:'KhkSKhkSKhKSKkSS',
    bass:'rrorrforrrorrfor',
    arp:'1358135813581385',
    lead:'D5 . A4 D5 F5 - E5 D5  C#5 - A4 - E5 - D5 .  Bb4 - D5 F5 Bb5 - A5 F5  E5 - C#5 E5 A5 - - .  '+
         'D6 - A5 F5 D5 - F5 A5  C6 - A5 F5 C5 - A4 .  B4 . D5 G5 B5 - G5 D5  C#5 - E5 - A5 - C#6 .'}
};
for(const k in MU8_SRC){const s=MU8_SRC[k];SONGS[k]={...s,lead:parseLead(s.lead),steps:s.chords.length*16};}

// ---------- sonidos ----------
const MU8_gate={};
function MU8_ok(key,ms){const now=actx.currentTime*1000,last=MU8_gate[key];if(last!==undefined&&now>=last&&now-last<ms)return false;MU8_gate[key]=now;return true;}
function MU8_osc(type,f0,f1,at,dur,vol,atk){
  const t=actx.currentTime+at,o=actx.createOscillator(),g=actx.createGain();o.type=type;
  o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+(atk||0.005));g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.connect(g).connect(actx.destination);o.start(t);o.stop(t+dur+0.03);
}
function MU8_nz(ftype,f0,f1,q,at,dur,vol,atk){
  const t=actx.currentTime+at,s=actx.createBufferSource();s.buffer=noiseBuf;
  const f=actx.createBiquadFilter();f.type=ftype;f.Q.value=q;
  f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);
  const g=actx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+(atk||0.004));g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  s.connect(f).connect(g).connect(actx.destination);s.start(t,Math.random()*0.5);s.stop(t+dur+0.02);
}
const MU8_SFX={
  m8paso(k){k=clamp(k===undefined?1:k,0.05,1);
    MU8_osc('sine',58,26,0,0.55,0.06+0.26*k,0.006);MU8_osc('triangle',90,40,0,0.25,0.02+0.06*k,0.004);
    MU8_nz('lowpass',260,40,0.7,0,0.6,0.04+0.24*k,0.01);
    if(k>0.6)MU8_nz('bandpass',900,300,2,0.02,0.12,0.05*k);},
  m8gota(){if(!MU8_ok('gota',160))return;MU8_osc('sine',1500,900,0,0.09,0.03,0.003);},
  m8pajaros(){if(!MU8_ok('pajaros',900))return;
    for(let i=0;i<7;i++)MU8_nz('bandpass',2400+Math.random()*1400,1800,3,i*0.045,0.05,0.05,0.003);
    for(let i=0;i<4;i++){const f=2600+Math.random()*900;MU8_osc('square',f,f*1.25,0.08+i*0.09,0.05,0.012);}},
  m8chillido(){if(!MU8_ok('chillido',220))return;
    MU8_osc('sawtooth',1100,1750,0,0.13,0.03,0.01);MU8_osc('square',1700,760,0.12,0.16,0.022,0.005);MU8_nz('highpass',3000,5000,1,0,0.2,0.04);},
  m8agazape(){[640,780,940].forEach((f,i)=>MU8_osc('square',f,f*1.1,i*0.07,0.045,0.03));MU8_nz('bandpass',2000,2000,4,0,0.2,0.03);},
  m8salto(){MU8_nz('bandpass',700,2600,1.4,0,0.18,0.08,0.01);MU8_osc('triangle',400,800,0,0.1,0.025);},
  m8resopla(){MU8_nz('lowpass',1100,180,0.8,0,0.38,0.16,0.02);MU8_osc('sine',96,58,0,0.3,0.06,0.02);},
  m8rugido(){
    MU8_osc('sawtooth',150,62,0,1.2,0.09,0.06);MU8_osc('sawtooth',158,66,0,1.2,0.07,0.06);MU8_osc('square',75,40,0.05,1.0,0.03,0.08);
    MU8_nz('bandpass',700,220,1.6,0,1.15,0.18,0.08);MU8_nz('highpass',3500,7000,0.7,0.8,0.5,0.06,0.05);},
  m8vapor(){MU8_nz('highpass',3200,6500,0.8,0,0.45,0.07,0.03);},
  m8mordida(){MU8_osc('square',300,150,0,0.09,0.06);MU8_osc('triangle',1300,1100,0,0.12,0.04);MU8_nz('bandpass',1800,600,3,0,0.12,0.12);},
  m8piedra(){MU8_osc('sine',120,48,0,0.22,0.12,0.004);MU8_nz('lowpass',600,90,0.7,0,0.25,0.14);},
  m8embiste(){MU8_nz('lowpass',320,120,0.7,0,0.7,0.18,0.03);MU8_osc('sawtooth',62,48,0,0.6,0.05,0.04);},
  m8placa(){MU8_osc('triangle',900,640,0,0.32,0.05);MU8_osc('square',460,300,0.02,0.2,0.025);}
};
for(const k in MU8_SFX){const f=MU8_SFX[k];SFX[k]=(...a)=>{if(!actx||muted)return;f(...a);};}
