'use strict';
// Óxido · Misión 10: música y sonidos del templo perdido
// Se carga después de audio.js. Composición original. Nombres propios con prefijo MU10_.
//
// MÚSICA (playMusic(nombre)): aventura épica con METALES (sierras filtradas que se abren, como bronces) y TAMBORES (toms).
//   'l10'     tema de la misión. Re menor, 132 bpm, 8 compases, marcha: bombo y redoblante, toms que preparan cada
//             compás, golpes de metales en el acorde y una melodía de saltos de cuarta y quinta que sube hasta el Re agudo.
//   'm10Roca' la persecución. Re menor, 176 bpm, 4 compases: galope de toms, bajo corrido y llamadas cortas de metales.
//   'm10Jefe' villano final (EL CUSTODIO). Mi frigio, 156 bpm, 8 compases: toms pesados, metales que martillan y una
//             línea que trepa por semitonos.
// Las canciones con m10:true suman metales, toms y golpes de acorde a la batería/bajo/arpegio de siempre: playStep()
// de audio.js queda envuelta (las otras canciones suenan igual que antes).
//
// SONIDOS (SFX.nombre()): m10Siseo (víbora), m10Mordida, m10VibMuere, m10Click (trampa que se arma), m10Dardo,
//   m10Rumor (piso que retumba), m10Pinchos, m10Cruje (piso que se raja), m10Derrumbe, m10Temblor, m10Cae (la roca se
//   suelta), m10Rueda (la roca rodando), m10Golpe (golpe de piedra grande), m10Piedra (piedra chica), m10Aplasta,
//   m10Crash (la roca se estrella), m10Motor, m10Taladro, m10Pala, m10Grito (el saqueador), m10Ensamble (bloques que
//   se juntan), m10Voz (EL CUSTODIO), m10Puno, m10Rayo (carga), m10RayoSale, m10Cohete, m10Fanfarria (final del juego).
// Todos respetan "muted" y no hacen nada si el audio no arrancó.

// ---------- instrumentos ----------
// metal: dos sierras apenas desafinadas por un filtro que se abre rápido y se cierra un poco (ataque de bronce)
function MU10_brass(midi,t,dur,vol,dest){
  const fr=mtof(midi),o1=actx.createOscillator(),o2=actx.createOscillator(),f=actx.createBiquadFilter(),g=actx.createGain();
  o1.type='sawtooth';o2.type='sawtooth';o1.frequency.setValueAtTime(fr,t);o2.frequency.setValueAtTime(fr*1.007,t);
  f.type='lowpass';f.Q.value=1.5;f.frequency.setValueAtTime(fr*1.1,t);f.frequency.linearRampToValueAtTime(Math.min(9000,fr*6),t+0.045);
  f.frequency.exponentialRampToValueAtTime(Math.min(6000,fr*2.4),t+Math.max(0.09,dur*0.5));
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+0.025);g.gain.setValueAtTime(vol*0.82,t+Math.max(0.03,dur*0.7));g.gain.exponentialRampToValueAtTime(0.0005,t+dur);
  o1.connect(f);o2.connect(f);f.connect(g).connect(dest);o1.start(t);o2.start(t);o1.stop(t+dur+0.03);o2.stop(t+dur+0.03);
}
// tom: seno que cae de tono + un poco de ruido
function MU10_tom(f0,t,dest,vol){
  const o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f0*0.45,t+0.2);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.24);o.connect(g).connect(dest);o.start(t);o.stop(t+0.26);
  const s=actx.createBufferSource();s.buffer=noiseBuf;const bf=actx.createBiquadFilter();bf.type='bandpass';bf.frequency.value=f0*3;bf.Q.value=1.2;
  const ng=actx.createGain();ng.gain.setValueAtTime(vol*0.35,t);ng.gain.exponentialRampToValueAtTime(0.001,t+0.06);s.connect(bf).connect(ng).connect(dest);s.start(t,Math.random()*0.5);s.stop(t+0.08);
}
const MU10_playStep0=playStep;
playStep=function(song,s,t,sd,dest){
  MU10_playStep0(song,s,t,sd,dest);
  if(!song||!song.m10)return;
  const bar=Math.floor(s/16)%song.chords.length,k=s%16,[rn,qual]=song.chords[bar],root=nm(rn),third=qual==='m'?3:4;
  const tm=song.tom&&song.tom[k];
  if(tm&&tm!=='.')MU10_tom(tm==='l'?92:tm==='m'?128:170,t,dest,0.3);
  const st=song.stab&&song.stab[k];
  if(st&&st!=='.'){const len=st==='X'?sd*5:sd*1.6;for(const d of[0,third,7])MU10_brass(root+24+d,t,len,0.016,dest);}
  for(const n of song.blead.byStep[s%song.blead.steps]||[])MU10_brass(n.midi,t,n.len*sd*0.95,0.034,dest);
};

// ---------- música ----------
const MU10_SRC={
  l10:{bpm:132,
    chords:[['D2','m'],['Bb1','M'],['F2','M'],['C2','M'],['D2','m'],['G1','m'],['A1','M'],['A1','M']],
    drum:'K..hS.hhK.K.S.hS',
    tom: '..........l.m.ml',
    stab:'X.........x.....',
    bass:'r.o.r.f.r.o.f.o.',
    arp:'1...5...8...5...',
    blead:'D5 - A4 . D5 . E5 F5  G5 - - . F5 E5 D5 .  C5 - F5 . A5 - G5 F5  E5 - - - C5 - - .  '+
          'D5 . F5 . A5 - D6 .  C6 - Bb5 A5 G5 - D5 .  E5 . G5 . A5 - C#6 -  A5 - - - E5 . A4 .'},
  m10Roca:{bpm:176,
    chords:[['D2','m'],['C2','M'],['Bb1','M'],['A1','M']],
    drum:'K.h.S.h.K.h.S.hS',
    tom: 'l.ml.ml.l.ml.mlm',
    stab:'x.......x...x...',
    bass:'rrorrrorrrorrfof',
    arp:null,
    blead:'A5 . A5 . F5 . D5 .  G5 . G5 . E5 . C5 .  F5 . F5 . D5 . Bb4 .  E5 - C#5 - A4 - E5 -'},
  m10Jefe:{bpm:156,
    chords:[['E2','m'],['F2','M'],['E2','m'],['D2','m'],['C2','M'],['F2','M'],['D2','m'],['E2','M']],
    drum:'K.hKS.hhK.hKS.SS',
    tom: 'l...l...l.m.mmll',
    stab:'X.......x.x.....',
    bass:'r.ror.rfr.ror.fo',
    arp:'1.5.8.5.1.5.8.5.',
    blead:'E5 . G5 . B5 - A5 G5  F5 - - . E5 . C5 .  E5 . G5 . C6 - B5 A5  F5 - - - D5 - A4 .  '+
          'G5 . A5 . B5 . C6 B5  A5 - G5 - F5 - E5 .  D5 . F5 . A5 - G#5 F5  E5 - - - B4 . E5 .'}
};
for(const k in MU10_SRC){const s=MU10_SRC[k];SONGS[k]={...s,m10:true,lead:{byStep:{},steps:16},blead:parseLead(s.blead),steps:s.chords.length*16};}

// ---------- sonidos ----------
const MU10_gate={};
function MU10_ok(key,ms){const now=actx.currentTime*1000,last=MU10_gate[key];if(last!==undefined&&now>=last&&now-last<ms)return false;MU10_gate[key]=now;return true;}
function MU10_osc(type,f0,f1,at,dur,vol,atk){
  const t=actx.currentTime+at,o=actx.createOscillator(),g=actx.createGain();o.type=type;
  o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+(atk||0.005));g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.connect(g).connect(actx.destination);o.start(t);o.stop(t+dur+0.03);
}
function MU10_nz(ftype,f0,f1,q,at,dur,vol,atk){
  const t=actx.currentTime+at,s=actx.createBufferSource();s.buffer=noiseBuf;
  const f=actx.createBiquadFilter();f.type=ftype;f.Q.value=q;
  f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);
  const g=actx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+(atk||0.004));g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  s.connect(f).connect(g).connect(actx.destination);s.start(t,Math.random()*0.5);s.stop(t+dur+0.02);
}
function MU10_brassFx(midi,at,dur,vol){MU10_brass(midi,actx.currentTime+at,dur,vol,actx.destination);}
const MU10_SFX={
  m10Siseo(){if(!MU10_ok('siseo',220))return;MU10_nz('highpass',5200,4200,0.8,0,0.32,0.06,0.04);MU10_nz('bandpass',7000,6500,3,0.05,0.2,0.03,0.04);},
  m10Mordida(){MU10_osc('square',600,180,0,0.07,0.03);MU10_nz('bandpass',2500,900,2,0,0.07,0.08);},
  m10VibMuere(){MU10_nz('highpass',4500,1500,1,0,0.25,0.07);MU10_osc('triangle',420,120,0,0.18,0.04);},
  m10Click(){if(!MU10_ok('click',90))return;MU10_osc('square',1800,1700,0,0.025,0.03);MU10_osc('square',1200,1150,0.05,0.025,0.025);},
  m10Dardo(){MU10_nz('bandpass',3200,1200,4,0,0.14,0.09);MU10_osc('triangle',900,300,0,0.08,0.02);},
  m10Rumor(){if(!MU10_ok('rumor',200))return;MU10_nz('lowpass',300,90,0.7,0,0.35,0.1,0.06);},
  m10Pinchos(){if(!MU10_ok('pinchos',120))return;for(let i=0;i<3;i++)MU10_osc('square',900+i*220,700+i*200,i*0.02,0.05,0.022);MU10_nz('highpass',4000,3000,1,0,0.08,0.05);},
  m10Cruje(){for(let i=0;i<5;i++)MU10_nz('bandpass',1400+Math.random()*900,600,3,i*0.06+Math.random()*0.03,0.05,0.07);},
  m10Derrumbe(){MU10_nz('lowpass',1200,80,0.8,0,0.6,0.22,0.01);MU10_osc('sine',90,40,0,0.5,0.15);for(let i=0;i<4;i++)MU10_nz('bandpass',900,400,2,0.08+i*0.07,0.06,0.08);},
  m10Temblor(){if(!MU10_ok('temblor',400))return;MU10_nz('lowpass',180,60,0.6,0,1.1,0.2,0.2);MU10_osc('sine',48,38,0,1.1,0.12,0.2);},
  m10Cae(){MU10_nz('lowpass',600,100,1,0,0.5,0.16,0.02);MU10_osc('sine',160,55,0,0.45,0.1);},
  m10Rueda(){if(!MU10_ok('rueda',150))return;MU10_nz('lowpass',220,90,0.8,0,0.26,0.16,0.03);MU10_osc('sine',60+Math.random()*8,44,0,0.24,0.1);
    if(Math.random()<0.4)MU10_nz('bandpass',1100,700,4,0.1,0.04,0.05);},
  m10Golpe(){MU10_nz('lowpass',700,60,0.8,0,0.35,0.24);MU10_osc('sine',100,38,0,0.32,0.18);},
  m10Piedra(){if(!MU10_ok('piedra',60))return;MU10_nz('lowpass',1500,200,1,0,0.14,0.13);MU10_osc('triangle',220,90,0,0.1,0.05);},
  m10Aplasta(){MU10_nz('lowpass',900,70,0.8,0,0.4,0.25);MU10_osc('square',180,60,0,0.25,0.05);MU10_osc('sine',80,35,0,0.35,0.16);},
  m10Crash(){MU10_nz('lowpass',2400,50,0.7,0,1.3,0.35,0.005);MU10_osc('sine',70,26,0,1.1,0.22);for(let i=0;i<8;i++)MU10_nz('bandpass',700+Math.random()*900,300,2,0.1+i*0.08+Math.random()*0.05,0.08,0.1);},
  m10Motor(){if(!MU10_ok('motor',300))return;for(let i=0;i<4;i++)MU10_osc('sawtooth',62+i*2,58,i*0.07,0.07,0.035);MU10_nz('lowpass',500,200,1,0,0.3,0.05);},
  m10Taladro(){if(!MU10_ok('taladro',140))return;MU10_osc('sawtooth',320,520,0,0.25,0.025,0.05);MU10_osc('square',160,260,0,0.25,0.012,0.05);MU10_nz('bandpass',3000,4500,3,0,0.25,0.04);},
  m10Pala(){MU10_nz('lowpass',1300,300,1,0,0.25,0.12);MU10_osc('triangle',300,180,0,0.15,0.04);MU10_osc('square',520,500,0.12,0.08,0.02);},
  m10Grito(){MU10_osc('sawtooth',500,900,0,0.18,0.03);MU10_osc('sawtooth',880,420,0.18,0.25,0.03);},
  m10Ensamble(){MU10_nz('lowpass',900,150,1,0,0.2,0.14);MU10_osc('triangle',300+Math.random()*120,150,0,0.16,0.05);MU10_osc('sine',1300,1250,0.02,0.2,0.02);},
  m10Voz(){if(!MU10_ok('voz',500))return;MU10_osc('sawtooth',55,46,0,1.2,0.07,0.2);MU10_osc('sawtooth',82,70,0.05,1.1,0.05,0.2);MU10_nz('lowpass',500,90,0.8,0,1,0.1,0.25);MU10_osc('sine',660,620,0.2,0.8,0.015,0.2);},
  m10Puno(){MU10_nz('bandpass',600,1600,2,0,0.25,0.08,0.05);MU10_osc('triangle',140,260,0,0.22,0.05);},
  m10Rayo(){MU10_osc('sine',300,1400,0,0.7,0.04,0.3);MU10_osc('triangle',600,2200,0,0.7,0.015,0.3);},
  m10RayoSale(){MU10_osc('sawtooth',900,500,0,0.45,0.04);MU10_nz('bandpass',3000,2000,1,0,0.45,0.08);MU10_osc('sine',1800,1200,0,0.45,0.03);},
  m10Cohete(){if(!MU10_ok('cohete',180))return;MU10_nz('highpass',3000,6000,1,0,0.2,0.04,0.05);MU10_nz('lowpass',900,100,0.8,0.22,0.3,0.12);MU10_osc('sine',1200+Math.random()*600,900,0.22,0.2,0.02);},
  // fanfarria original para el final del juego: Re mayor que sube, Si bemol, Do y cierra en Re con todo
  m10Fanfarria(){
    const seq=[['D4',0,0.14],['F#4',0.15,0.14],['A4',0.3,0.14],['D5',0.45,0.5],['C5',1.0,0.18],['D5',1.2,0.18],['E5',1.4,0.18],['F#5',1.6,1.1]];
    for(const [n,at,d] of seq)MU10_brassFx(nm(n),at,d,0.05);
    for(const [n,at] of[['Bb3',1.0],['C4',1.2],['D4',1.6]]){MU10_brassFx(nm(n),at,at===1.6?1.1:0.2,0.03);MU10_brassFx(nm(n)+7,at,at===1.6?1.1:0.2,0.02);}
    for(const at of[0,0.45,1.0,1.2,1.4,1.6])MU10_tom(at===1.6?80:120,actx.currentTime+at,actx.destination,0.35);}
};
for(const k in MU10_SFX){const f=MU10_SFX[k];SFX[k]=(...a)=>{if(!actx||muted)return;f(...a);};}
