'use strict';
// Óxido · Misión 6: música y sonidos de la ciudad de datos
// Se carga después de audio.js. Composición original. Nombres propios con prefijo MU6_.
//
// MÚSICA (playMusic(nombre)):
//   'l6'    tema de la misión. Fa sostenido menor, 132 bpm, 8 compases. Bajo que late en semicorcheas,
//           arpegio en corcheas y una melodía que sube por saltos de cuarta y quinta y cae por grados.
//   'placa' villano (PLACA MADRE). Re menor con giro frigio (Mi bemol), 164 bpm, 8 compases, batería casi continua.
//
// SONIDOS (SFX.nombre()):
//   m6lento   entra la cámara lenta (barrido que cae)     m6rapido  sale (barrido que sube)
//   m6latido  latido grave mientras dura la cámara lenta  m6arma    un vigía se arma de píxeles
//   m6paso    el vigía se corre de costado                m6carga   el vigía apunta (pitido que sube)
//   m6falla   falla de imagen (un vigía cae)              m6anillo  anillo de datos encendido
//   m6carga2  atravesaste un anillo                       m6zumbido motor del MOSCARDÓN (golpe corto)
//   m6mira    mira láser que se arma                      m6haz     barrido de la PLACA MADRE
//   m6prende  pantallas que se prenden                    m6copia   la PLACA MADRE se copia
// Todos respetan "muted" y no hacen nada si el audio no arrancó.

const MU6_SRC={
  l6:{bpm:132,
    chords:[['F#2','m'],['D2','M'],['E2','M'],['C#2','m'],['F#2','m'],['A1','M'],['B1','m'],['C#2','M']],
    drum:'K.hkS.hhK.hkS.hS',
    bass:'rrorrrofrrorrfor',
    arp:'1.5.8.5.3.5.8.5.',
    lead:'F#5 . C#5 F#5 A5 - G#5 F#5  E5 - D5 . A4 D5 F#5 A5  G#5 - - . E5 G#5 B5 G#5  E5 . C#5 . G#4 - B4 C#5  '+
         'A5 . F#5 A5 C#6 - B5 A5  G#5 - E5 . C#5 E5 A5 C#6  B5 . D6 . F#5 . B5 A5  G#5 - F5 - C#5 - G#4 .'},
  placa:{bpm:164,
    chords:[['D2','m'],['D#2','M'],['C2','M'],['D2','m'],['Bb1','M'],['C2','M'],['D2','m'],['A1','M']],
    drum:'KhSKKhShKKShKhSS',
    bass:'rrrorrorrrrorfof',
    arp:'1385831513858315',
    lead:'D5 D5 F5 D5 A5 - G5 F5  D#5 - G5 . Bb5 - G5 D#5  E5 . C5 E5 G5 . E5 C5  D5 - - . A4 D5 F5 A5  '+
         'Bb5 . F5 Bb5 D6 - C6 Bb5  A5 - G5 . E5 G5 C6 .  D6 . A5 . F5 . D5 F5  E5 - C#5 - A4 - E5 .'}
};
for(const k in MU6_SRC){const s=MU6_SRC[k];SONGS[k]={...s,lead:parseLead(s.lead),steps:s.chords.length*16};}

// ---------- sonidos ----------
const MU6_gate={};
function MU6_ok(key,ms){const now=actx.currentTime*1000,last=MU6_gate[key];if(last!==undefined&&now>=last&&now-last<ms)return false;MU6_gate[key]=now;return true;}
function MU6_osc(type,f0,f1,at,dur,vol,atk){
  const t=actx.currentTime+at,o=actx.createOscillator(),g=actx.createGain();o.type=type;
  o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+(atk||0.005));g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.connect(g).connect(actx.destination);o.start(t);o.stop(t+dur+0.03);
}
function MU6_nz(ftype,f0,f1,q,at,dur,vol,atk){
  const t=actx.currentTime+at,s=actx.createBufferSource();s.buffer=noiseBuf;
  const f=actx.createBiquadFilter();f.type=ftype;f.Q.value=q;
  f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);
  const g=actx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+(atk||0.004));g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  s.connect(f).connect(g).connect(actx.destination);s.start(t,Math.random()*0.5);s.stop(t+dur+0.02);
}
const MU6_SFX={
  m6lento(){MU6_osc('sine',520,60,0,0.55,0.12,0.02);MU6_osc('triangle',1040,120,0,0.4,0.03,0.02);MU6_nz('lowpass',3000,120,0.8,0,0.5,0.12,0.03);},
  m6rapido(){MU6_osc('sine',70,480,0,0.32,0.09,0.03);MU6_nz('bandpass',300,2600,1.2,0,0.3,0.08,0.05);},
  m6latido(){MU6_osc('sine',62,40,0,0.16,0.18,0.004);MU6_osc('sine',58,38,0.16,0.14,0.12,0.004);},
  m6arma(){if(!MU6_ok('arma',150))return;for(let i=0;i<5;i++)MU6_osc('square',520+i*180,560+i*180,i*0.05,0.04,0.018);MU6_nz('highpass',2000,6000,0.7,0,0.25,0.03,0.05);},
  m6paso(){MU6_nz('bandpass',3200,600,2,0,0.12,0.12);MU6_osc('square',1400,700,0,0.05,0.02);},
  m6carga(){MU6_osc('square',600,1500,0,0.22,0.022,0.01);MU6_osc('sine',1500,1500,0.22,0.05,0.03);},
  m6falla(){for(let i=0;i<5;i++){const f=200+Math.random()*1800;MU6_osc('square',f,f*(0.5+Math.random()),i*0.03,0.03,0.025);}MU6_nz('bandpass',1500,400,3,0,0.18,0.08);},
  m6anillo(){if(!MU6_ok('anillo',200))return;MU6_osc('triangle',880,880,0,0.18,0.03);MU6_osc('triangle',1320,1320,0.09,0.2,0.025);},
  m6carga2(){[660,880,1100,1320,1760].forEach((f,i)=>MU6_osc('square',f,f,i*0.06,0.1,0.035));MU6_osc('sine',220,440,0,0.4,0.08,0.05);},
  m6zumbido(){if(!MU6_ok('zumbido',110))return;MU6_osc('sawtooth',110,118,0,0.24,0.035,0.03);MU6_osc('square',220,228,0,0.22,0.01,0.03);MU6_nz('lowpass',900,400,0.6,0,0.22,0.03,0.03);},
  m6mira(){MU6_osc('sine',1800,2400,0,0.35,0.03,0.02);},
  m6haz(){MU6_osc('sawtooth',160,90,0,0.5,0.08,0.01);MU6_osc('square',640,320,0,0.45,0.03,0.01);MU6_nz('bandpass',2400,800,1.5,0,0.5,0.12,0.01);},
  m6prende(){MU6_osc('sine',40,1800,0,0.25,0.04,0.01);MU6_nz('highpass',4000,8000,0.5,0,0.2,0.04,0.01);},
  m6copia(){for(let i=0;i<3;i++){MU6_osc('square',300+i*150,1200+i*300,i*0.12,0.18,0.035);}MU6_nz('bandpass',800,3000,2,0,0.5,0.1,0.05);}
};
for(const k in MU6_SFX){const f=MU6_SFX[k];SFX[k]=()=>{if(!actx||muted)return;f();};}
