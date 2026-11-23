'use strict';
// Óxido · historia (Guion, notas/guion/codigo-m1.md B): los globos de los personajes en cada misión. Prefijo HIS_.
// HIS_globo(clave, op): busca TX.historia.misiones[levelIdx][clave] (textos.js) y muestra la frase del que juega arriba de
// su cabeza 2,5 s, con globo() de globos.js (hasta 2 renglones). La frase puede ser una sola o una por personaje
// ({facu, jose, lauti, tuerca}).
//   · De a dos: primero el jugador 1; 0,8 s después, el jugador 2 con SU versión.
//   · Cada clave sale una sola vez por misión. En la VUELTA 2 en adelante, solo g1 y g3.
//   · Nunca encima de un aviso de ataque (prioCartel ≥ 4) y nunca con el villano peleando: espera. op.pelea=true lo deja
//     salir igual con el villano (g3: justo después de su entrada, antes del primer ataque).
// HIS_dice(s, x, y): un globo suelto de 2 s en (x, y) del mundo (DON BULÓN al perder, CHATARRA).
const HIS={dichos:new Set(),fila:[],activos:[],sueltos:[]},HIS_DUR=150,HIS_DE_A_DOS=48,HIS_VENCE=240; // un globo que espera más de 4 s se descarta
ON_START.push(()=>{HIS.dichos.clear();HIS.fila.length=0;HIS.activos.length=0;HIS.sueltos.length=0;});
// "JOSÉ" → "jose"
const HIS_nombre=p=>String((CHARS[p.ci]&&CHARS[p.ci].name)||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
function HIS_mision(){try{return TX.historia.misiones[levelIdx]||null;}catch(e){return null;}}
function HIS_frase(m,clave,p){const v=m&&m[clave];if(!v)return null;if(typeof v==='string')return v;return v[HIS_nombre(p)]||v.facu||null;}
function HIS_globo(clave,op){
  op=op||{};if(HIS.dichos.has(clave))return false;
  if(typeof vuelta==='number'&&vuelta>1&&clave!=='g1'&&clave!=='g3')return false;
  const m=HIS_mision();if(!m||!m[clave])return false;
  HIS.dichos.add(clave);
  players.filter(p=>!p.dead).forEach((p,i)=>{const s=HIS_frase(m,clave,p);if(s)HIS.fila.push({p,s,t:T+i*HIS_DE_A_DOS,t0:T+i*HIS_DE_A_DOS,pelea:!!op.pelea});});
  return true;
}
function HIS_dice(s,x,y,dur,grito){if(s)HIS.sueltos.push({s,x,y,t0:T,dur:dur||120,grito:!!grito});}
const HIS_espera=f=>(banner&&banner.t>0&&banner.prio>=4)||(!f.pelea&&bossRef&&!bossRef.gone&&bossRef.isVillain&&bossRef.state==='fight');
ON_STEP.push(()=>{
  if(state!=='play')return;
  for(let i=HIS.fila.length-1;i>=0;i--){const f=HIS.fila[i];if(T<f.t)continue;
    if(T-f.t0>HIS_VENCE){HIS.fila.splice(i,1);continue;} // esperó demasiado (la pelea del villano, por ejemplo): ya no viene al caso
    if(HIS_espera(f)){f.t=T+10;continue;}HIS.fila.splice(i,1);HIS.activos.push({p:f.p,s:f.s,t0:T});}
  for(let i=HIS.activos.length-1;i>=0;i--)if(T-HIS.activos[i].t0>HIS_DUR||HIS.activos[i].p.dead)HIS.activos.splice(i,1);
  for(let i=HIS.sueltos.length-1;i>=0;i--)if(T-HIS.sueltos[i].t0>HIS.sueltos[i].dur)HIS.sueltos.splice(i,1);
});
ON_DRAW.push(()=>{
  for(const a of HIS.activos){const o=a.p.ride||a.p;globo(a.s,o.x+(o.w||8)/2,o.y-2,{t:T-a.t0,dur:HIS_DUR});}
  for(const g of HIS.sueltos)globo(g.s,g.x,g.y,{t:T-g.t0,dur:g.dur,grito:g.grito});
});

// ---------- frase del primer prisionero de cada misión (codigo-m1.md G) ----------
// aliados.js la pide al liberar: la primera vez en la misión devuelve TX.historia.misiones[i].prisionero; después, la de siempre
function HIS_prisionero(siempre){if(HIS.dichos.has('prisionero'))return siempre;const m=HIS_mision();if(!m||!m.prisionero)return siempre;HIS.dichos.add('prisionero');return m.prisionero;}

// ---------- villano: frase al perder y dónde cayó (para el diente de la placa) · codigo-m1.md H e I ----------
let HIS_villano=null,HIS_vivo=null; // HIS_vivo: el villano que ya mostró vida (entra con hp 0 mientras se llena la barra)
ON_START.push(()=>{HIS_villano=null;HIS_vivo=null;});
ON_STEP.push(()=>{
  if(state!=='play'||HIS_villano||!bossRef||!bossRef.isVillain)return;
  if(bossRef.hp>0){HIS_vivo=bossRef;return;}
  if(HIS_vivo!==bossRef)return; // todavía entrando: no cayó
  const b=bossRef,x=b.x+(b.w||20)/2;HIS_villano={x,y:b.y,t:T,sx:b.sx};
  HIS.activos.length=0;HIS.fila.length=0; // cae el villano: los globos del jugador (g3 y lo que esperaba) se van; habla él
  const m=HIS_mision(),f=m&&m.pierde;if(f)HIS_dice(f,x,b.y-4,120);
});

// ---------- M1: el camión de la banda ("¡ESO ES NUESTRO!") · codigo-m1.md D ----------
// Arranca cuando termina la gracia de entrada (T 90), nunca durante la intro. El camión (ESC_M1.camion, en la capa de
// chatarra: x en pantalla = x - camX·0,7) entra por la izquierda y sale por la derecha en ~8 s; si el jugador sigue de largo,
// va 3 veces más rápido. No frena nada.
const HIS_M1={on:false,hecho:false,t:0,x0:0,etq:false};
ON_START.push(()=>{HIS_M1.on=false;HIS_M1.hecho=false;HIS_M1.t=0;HIS_M1.etq=false;
  if(levelIdx===0&&typeof ESC_M1!=='undefined')ESC_M1.camion=null;}); // hasta que arranca el momento, no se ve
function HIS_bocina(){try{tone('square',330,330,0.11,0.035);later(150,()=>tone('square',262,262,0.16,0.035));}catch(e){}}
ON_STEP.push(()=>{
  if(levelIdx!==0||state!=='play'||typeof ESC_M1==='undefined')return;
  if(typeof IN_activa==='function'&&IN_activa())return;
  const M=HIS_M1,par=0.7;
  // arranca ya a la derecha del portón (Guion: a los 2–3 s, brillo y globo con el camión a la vista, no detrás del cartel)
  if(!M.on&&!M.hecho&&T>=90){M.on=true;M.t=0;M.x0=P?P.x:0;ESC_M1.camion={x:camX*par+130,brillo:0,tasador:true};HIS_bocina();}
  if(!M.on)return;
  const k=ESC_M1.camion;if(!k){M.on=false;M.hecho=true;return;}
  M.t++;const apura=P&&P.x-M.x0>VW/2?3:1;
  k.x+=(VW+40-130)/440*apura+(camX-(M.cx??camX))*par;M.cx=camX; // avanza en pantalla aunque la cámara se mueva (sale a los ~8 s)
  if(M.t>=120)k.brillo=0.75+0.25*Math.sin(M.t/8);
  if(M.t===180||(apura>1&&M.t>60&&!HIS.dichos.has('g1')))HIS_globo('g1');
  // la etiqueta se le cae a la banda: sale a la altura del camión, del lado del jugador, y cae cerca de él
  if(!M.etq&&M.t>=300&&typeof TAS_soltarEtiqueta==='function'&&P){M.etq=true;const cx=camX+(k.x-camX*par)+18;TAS_soltarEtiqueta(clamp(cx,P.x-30,P.x+50),GROUND-44);}
  if(k.x-camX*par>VW+40){ESC_M1.camion=null;M.on=false;M.hecho=true;}
});

// el brillo dorado bajo la lona, fuerte y que late, para que se note desde lejos (Guion): halo sumando luz (arte-luz.js)
ON_DRAW.push(()=>{
  if(levelIdx!==0||typeof ESC_M1==='undefined'||!ESC_M1.camion||typeof LUZ_halo!=='function')return;const k=ESC_M1.camion;if(!(k.brillo>0.02))return;
  const x=camX+(k.x-camX*0.7)+18;LUZ_halo(x,GROUND-30,28,'#f0a830',Math.min(1,0.85*k.brillo));LUZ_halo(x,GROUND-29,10,'#ffc860',0.5*k.brillo); // dorado, no blanco (que no parezca un faro: Guion)
});
// ---------- M1: g2 al subirse a CHATARRA (no si lo rompen) · codigo-m1.md E ----------
ON_STEP.push(()=>{
  if(levelIdx!==0||state!=='play')return;
  for(const m of mechs)if(m.HI_suelto&&!m.HIS_visto){m.HIS_visto=true;if(m.ride&&!(m.dying>0)&&m.armor>0)HIS_globo('g2');}
});

// ---------- M1: g3 al terminar la entrada de DON BULÓN · codigo-m1.md F ----------
ON_STEP.push(()=>{
  if(state!=='play'||!bossRef||!bossRef.isVillain||HIS.dichos.has('g3')||HIS_villano)return; // ya cayó: g3 no viene al caso
  const e=typeof JE!=='undefined'&&JE.e;
  if(e&&e.b===bossRef&&e.t===1&&levelIdx===0&&mechs.some(m=>m.ride)){try{tone('square',140,110,0.3,0.04);}catch(er){}} // pitido grave de CHATARRA
  if(e&&e.b===bossRef&&e.t>=(typeof JE_DUR==='number'?JE_DUR:120))HIS_globo('g3',{pelea:true});
});

// ---------- M1: DON BULÓN chico y sentado, a la derecha de donde cayó (se achica, no se arrastra) · H e I ----------
const HIS_BULON={choque:0,hecho:false};
ON_START.push(()=>{HIS_BULON.choque=0;HIS_BULON.hecho=false;});
ON_DRAW.push(()=>{
  if(levelIdx!==0||!HIS_villano||T-HIS_villano.t<50||typeof HI_bulonChico!=='function')return;
  const x=HIS_villano.x+24;
  // CHATARRA entero: al pasar al lado de su papá, chocan las cabezas (dos pitidos y un ♥)
  if(!HIS_BULON.hecho&&mechs.some(m=>!(m.dying>0)&&m.armor>0&&Math.abs(m.x+(m.w||22)/2-x)<26)){HIS_BULON.hecho=true;HIS_BULON.choque=60;
    HIS_dice('♥',x,GROUND-30,70);try{tone('square',520,520,0.06,0.03);later(120,()=>tone('square',620,620,0.06,0.03));}catch(e){}}
  if(HIS_BULON.choque>0)HIS_BULON.choque--;
  HI_bulonChico(x,GROUND,{pose:HIS_BULON.choque>0?'choque':'sentado',cara:-1});
});

// ---------- placa de misión cumplida: el diente vuela al engranaje · codigo-m1.md I ----------
// El engranaje (HI_engranajeDibujar, arte-historia.js) va a la derecha del título con n = misión dientes; el último llega
// volando desde donde cayó el villano y hace ¡CLIC!.
const HIS_GEAR={x:262,y:44},HIS_VUELO=36,HIS_SALE=24;
ON_HUD.push(()=>{
  if(state!=='play'||typeof MC==='undefined'||!MC||!MC.ganada||typeof HI_engranajeDibujar!=='function')return;
  const n=levelIdx+1,t=MC.t,llega=HIS_SALE+HIS_VUELO;
  HI_engranajeDibujar(HIS_GEAR.x,HIS_GEAR.y,t>=llega?n:n-1,t>=llega?t-llega:-1);
  if(t===llega){try{tone('square',1800,1300,0.03,0.04);}catch(e){}}
  if(t>=HIS_SALE&&t<llega&&typeof HI_dienteDibujar==='function'){
    const k=(t-HIS_SALE)/HIS_VUELO,e=k*k*(3-2*k),v=HIS_villano;
    const x0=v?HX(v.x):W/2,y0=v?HY(v.y):HC/2;
    HI_dienteDibujar(Math.round(x0+(HIS_GEAR.x-x0)*e)-2,Math.round(y0+(HIS_GEAR.y-y0)*e-Math.sin(Math.PI*k)*30)-2);}
});

// ================== reglas de M2 en adelante (codigo-m2.md) ==================
// g2: la primera vez que alguien sube al vehículo de la misión (en M1 era al soltar a CHATARRA). g3, el primer prisionero,
// la frase al perder y el diente de la placa ya valen para todas (arriba).
ON_STEP.push(()=>{
  if(levelIdx<1||state!=='play'||HIS.dichos.has('g2'))return;
  if(players.some(p=>!p.dead&&p.ride&&!(p.ride.dying>0)))HIS_globo('g2');
});
// caminata: el villano chico se dibuja a la derecha de donde cayó (cada misión pone el suyo en HIS_CAMINATA[i])
const HIS_CAMINATA={};
ON_DRAW.push(()=>{const f=HIS_CAMINATA[levelIdx];if(f&&HIS_villano&&T-HIS_villano.t>=50)try{f(HIS_villano.x+24,T-HIS_villano.t-50);}catch(e){}});

// ================== M2: LA BARCAZA (codigo-m2.md D) ==================
// La barcaza (ESC_M2.barcaza, capa del agua, x en pantalla = x - camX·0,6): sube el cajón, lo baja a la cubierta, globo g1,
// una sola nota larga de bocina con humo, y se va al horizonte (se corre y se aclara en la bruma, sin escalar). Al doble si
// seguís de largo.
const HIS_M2={on:false,hecho:false,t:0,x0:0,b0:0};
ON_START.push(()=>{HIS_M2.on=false;HIS_M2.hecho=false;HIS_M2.t=0;
  if(levelIdx===1&&typeof ESC_M2!=='undefined')ESC_M2.barcaza={x:150,cajonY:-1,humo:0,se_va:0};});
if(typeof barcaza==='function'){const HIS_barcaza0=barcaza;barcaza=function(c2,x,y,b){ // se aclara al irse
  if(!b||!(b.se_va>0))return HIS_barcaza0.apply(this,arguments);
  const a=c2.globalAlpha;c2.globalAlpha=a*Math.max(0,1-b.se_va*0.9);try{return HIS_barcaza0.apply(this,arguments);}finally{c2.globalAlpha=a;}};}
ON_STEP.push(()=>{
  if(levelIdx!==1||state!=='play'||typeof ESC_M2==='undefined')return;
  const M=HIS_M2,b=ESC_M2.barcaza;
  if(!M.on&&!M.hecho&&T>=90&&b){M.on=true;M.t=0;M.x0=P?P.x:0;M.b0=b.x;b.cajonY=14;}
  if(!M.on)return;if(!b){M.on=false;M.hecho=true;return;}
  M.t+=P&&P.x-M.x0>VW/2?2:1;const t=M.t;
  if(t<120)b.cajonY=Math.max(0,Math.round(14-14*t/110));          // 0–2 s: la grúa sube el cajón (colgando)
  else b.cajonY=-1;                                               // 2 s: a la cubierta
  if(t>=180&&!HIS.dichos.has('g1'))HIS_globo('g1');               // 3 s
  if(t>=240&&!M.bocina){M.bocina=true;try{tone('sawtooth',98,92,1.1,0.035);}catch(e){}} // 4 s: UNA nota larga y grave
  if(t>=240)b.humo=Math.min(1,(t-240)/30);
  if(t>=240){b.se_va=Math.min(1,(t-240)/240);b.x=M.b0+b.se_va*70;} // 4–8 s: se va
  if(b.se_va>=1){ESC_M2.barcaza=null;M.on=false;M.hecho=true;M.bocina=false;}
});

// la luz dorada del cajón (mismo halo que el camión de M1, más chico): x en pantalla = x - camX·0,6 (capa del agua)
ON_DRAW.push(()=>{
  if(levelIdx!==1||typeof ESC_M2==='undefined'||!ESC_M2.barcaza||typeof LUZ_halo!=='function')return;const b=ESC_M2.barcaza;
  const sx=b.x-camX*0.6,x=camX+sx+(b.cajonY>=0?29:25),y=b.cajonY>=0?GROUND-26+b.cajonY+4:GROUND-17,a=Math.max(0,1-(b.se_va||0))*(0.55+0.15*Math.sin(T/9));
  LUZ_halo(x,y,14,'#f0a830',a);
});
// ================== M2: caminata (codigo-m2.md I) ==================
// SARGENTO CENIZA sentado en una bita, tosiendo anillos de humo; una gaviota mecánica cruza bajito y se lleva la máscara.
HIS_CAMINATA[1]=(x,t)=>{
  if(typeof CAM_ceniza!=='function')return;
  const gx=x-60+t*1.2,lleva=gx>=x-2; // la gaviota (dibujo de reserva) cruza de izquierda a derecha
  CAM_ceniza(x,GROUND,{mascara:!lleva,cara:-1});
  if(t%70===20&&typeof CAM_toser==='function')CAM_toser(x-2,GROUND-22,2+((t/70|0)%2));
  if(gx<x+VW){const gy=Math.round(GROUND-30-(lleva?Math.min(30,(gx-x)*0.4):0));
    if(typeof CAM_gaviota==='function')CAM_gaviota(gx+4,gy+1,{mascara:lleva,cara:1});} // la gaviota mecánica de M2 (Personajes)
};

// ================== M3: ALGO CRECE (codigo-m3.md D) ==================
// Al llegar a la barcaza hundida (x ≈ 900): burbujas en el barro, una dorada con ¡PLOP!, g1, la punta de la enredadera crece
// por el piso ~120 px hacia la derecha y se recoge con un "ñam" lejano. Si llega la arena del jefe chico, se recoge al toque.
const HIS_M3={on:false,hecho:false,t:0,punta:0,x:1030,vx:1032}; // x: burbujas (x−50); vx: donde arranca la enredadera, pasando el cajón (1010–1026) y el barro
ON_START.push(()=>{HIS_M3.on=false;HIS_M3.hecho=false;HIS_M3.t=0;HIS_M3.punta=0;});
ON_STEP.push(()=>{
  if(levelIdx!==2||state!=='play')return;const M=HIS_M3;
  if(!M.on&&!M.hecho&&P&&P.x>=900&&!lock){M.on=true;M.t=0;}
  if(!M.on)return;
  if(lock||(bossRef&&!bossRef.gone)){M.punta=0;M.on=false;M.hecho=true;return;} // nunca con un jefe en pantalla
  M.t++;const t=M.t;
  if(t===60)try{tone('sine',520,160,0.12,0.05);}catch(e){}                 // ¡PLOP!
  if(t===120)HIS_globo('g1');
  if(t>=180&&t<300)M.punta=Math.round(120*(t-180)/120);                  // 3–5 s: crece
  if(t===360)try{tone('sawtooth',70,55,0.35,0.04);}catch(e){}              // 6 s: "ñam" lejano
  if(t>=360)M.punta=Math.max(0,M.punta-6);
  if(t>=420){M.on=false;M.hecho=true;M.punta=0;}
});
ON_DRAW.push(()=>{
  if(levelIdx!==2||!HIS_M3.on)return;const M=HIS_M3,t=M.t,bx=M.x-50,g=GROUND;
  // burbujas en el barro (0–2 s) y la dorada (1 s)
  if(t<150)for(let i=0;i<4;i++){const a=((t+i*17)%50)/50,x=bx+i*9,y=Math.round(g-1-a*10);if(a<0.9){ctx.fillStyle='#17141f';ctx.fillRect(x-1,y-1,3,3);ctx.fillStyle='#8aa070';ctx.fillRect(x,y,1,1);}}
  if(t>=40&&t<70){const a=(t-40)/30,y=Math.round(g-2-a*14);ctx.fillStyle='#17141f';ctx.fillRect(bx+14,y-1,5,5);ctx.fillStyle='#ffd070';ctx.fillRect(bx+15,y,3,3);}
  if(t>=70&&t<78){ctx.fillStyle='#fff0b0';for(const[dx,dy]of[[-3,0],[3,0],[0,-3],[0,3]])ctx.fillRect(bx+16+dx,g-18+dy,1,1);}
  // la punta de la enredadera, con hojitas cada 9 px y una chispita dorada en la punta
  // (Guion: 2 px de alto, verde de hoja y no de borde de piso; arranca a la derecha del cajón y del barro, no detrás;
  // la punta con un brillo dorado chico que late, como si siguiera la luz)
  const largo=Math.min(M.punta,Math.floor(camX+VW-12-M.vx)); // la punta nunca se va de la pantalla: crece a medida que avanzás
  if(largo>0){const x0=M.vx;
    for(let i=0;i<largo;i++){const x=x0+i,y=g-2+Math.round(Math.sin(x/11)*0.6);ctx.fillStyle='#17141f';ctx.fillRect(x,y-1,1,4);
      ctx.fillStyle='#4e8a3a';ctx.fillRect(x,y,1,2);if(i%9===4){ctx.fillStyle='#8ac060';ctx.fillRect(x,y-1,1,1);ctx.fillRect(x+1,y-2,1,1);ctx.fillRect(x+2,y-3,1,1);}}
    const px=x0+largo,py=g-2+Math.round(Math.sin(px/11)*0.6),k=0.5+0.5*Math.sin(t/6);
    if(typeof LUZ_halo==='function')LUZ_halo(px+1,py+1,6,'#ffd070',0.35+0.3*k);
    ctx.fillStyle='#17141f';ctx.fillRect(px-1,py-1,4,4);ctx.fillStyle=k>0.5?'#fff0b0':'#ffd070';ctx.fillRect(px,py,2,2);}
});

// ================== M3: caminata (codigo-m3.md I) ==================
// MADRE YUYO queda como la maceta de medio bidón donde cayó; si está el gato, la huele y la planta suelta una hoja (estornudo).
// La etiqueta de 3 dibujitos se ve 1 s, grande, en un recuadro con borde de luz arriba a la derecha (nada de cómic).
function HIS_maceta(x,g){const R=(a,b,c,d,col)=>{ctx.fillStyle=col;ctx.fillRect(x+a,g-18+b,c,d);};
  R(1,9,12,9,'#17141f');R(2,10,10,7,'#4a5a3a');R(2,10,10,1,'#6a7a4a');R(2,13,10,1,'#405033');
  R(6,2,1,8,'#3e6a3e');R(3,4,3,2,'#6a9a4a');R(7,1,4,2,'#6a9a4a');R(4,6,3,1,'#3e6a3e');R(10,4,1,1,'#ffd070');}
let HIS_M3gato=false;ON_START.push(()=>{HIS_M3gato=false;});
HIS_CAMINATA[2]=(x,t)=>{
  const mx=Math.round(x-30);HIS_maceta(mx,GROUND);
  if(!HIS_M3gato&&typeof gato!=='undefined'&&gato&&Math.abs((gato.x||0)-mx)<24){HIS_M3gato=true;
    parts.push({k:'p',x:mx+8,y:GROUND-16,vx:0.3,vy:-0.4,g:0.04,life:80,maxl:80,size:2,col:'#6a9a4a'});try{tone('square',900,500,0.06,0.025);}catch(e){}}
};
function HIS_etiqueta3(x,y,k){const R=(a,b,c,d,col)=>{ctx.fillStyle=col;ctx.fillRect(x+a*k,y+b*k,c*k,d*k);};
  R(0,0,15,8,'#17141f');R(1,1,13,6,'#e8d8b0');R(2,4,1,1,'#17141f');R(3,3,1,2,'#17141f');R(4,4,1,1,'#17141f'); // pirámide
  R(6,2,2,3,'#17141f');R(5,5,4,1,'#a03a2a');                                                            // luna tachada
  R(10,2,3,3,'#17141f');R(11,3,1,1,'#7ad0ff');}                                                         // pantalla
ON_HUD.push(()=>{
  if(levelIdx!==2||state!=='play'||typeof MC==='undefined'||!MC||!MC.ganada)return;const t=MC.t;if(t<100||t>160)return;
  const k=3,w=15*k+6,h=8*k+6,x=W-w-8,y=58;ctx.globalAlpha=Math.min(1,(t-100)/6,(160-t)/6);
  ctx.fillStyle='rgba(12,9,18,0.82)';ctx.fillRect(x,y,w,h);ctx.fillStyle='#ffd58a';ctx.fillRect(x,y,w,1);ctx.fillRect(x,y,1,h);ctx.fillRect(x+w-1,y,1,h);ctx.fillRect(x,y+h-1,w,1);
  HIS_etiqueta3(x+3,y+3,k);ctx.globalAlpha=1;
});

// ================== M4: ALGO LOS ASUSTÓ (codigo-m4.md D) ==================
// Cerca de la tumba (x ≈ 1400, sin jefe en pantalla; si hay enemigos espera hasta 3 s): tres de la banda salen corriendo
// hacia la izquierda (decorado: no son enemigos), arena dorada que sube SIN forma, g1, el grito "¡MÍO!" desde adentro y la
// arena tapa la entrada (solo dibujo). Si el jugador entra a la tumba, termina en ese cuadro.
const HIS_M4={on:false,hecho:false,t:0,esp:0,x:1480,tapada:false};
ON_START.push(()=>{Object.assign(HIS_M4,{on:false,hecho:false,t:0,esp:0,tapada:false,solto:false});});
ON_STEP.push(()=>{
  if(levelIdx!==3||state!=='play')return;const M=HIS_M4;
  if(!M.on&&!M.hecho&&P&&P.x>=1400&&!lock&&!(bossRef&&!bossRef.gone)&&!(banner&&banner.t>0)){ // espera a que se vaya el aviso de arriba (Guion)
    const hay=enemies.some(e=>!e.gone&&!e.dying&&e.x+e.w>camX&&e.x<camX+VW);if(hay&&M.esp++<180)return;M.on=true;M.t=0;}
  if(!M.on)return;
  if(P&&P.x>=M.x+8){M.on=false;M.hecho=true;return;} // entró a la tumba: termina acá
  M.t++;const t=M.t;
  if(t===180)HIS_globo('g1');
  if(t===240){const m=HIS_mision();HIS_dice(m&&m.grito||'¡MÍO!',M.x+12,GROUND-22,90,true);try{tone('sawtooth',160,120,0.25,0.04);}catch(e){}}
  if(t>=360){M.on=false;M.hecho=true;M.tapada=true;}
});
function HIS_corredor(x,y,f){ // uno de la banda, vestido de nómada, corriendo a la izquierda (dibujo simple de reserva)
  x=Math.round(x);y=Math.round(y);const R=(a,b,c,d,col)=>{ctx.fillStyle=col;ctx.fillRect(x+a,y+b,c,d);};
  R(1,-1,8,19,'#17141f');R(2,0,6,6,'#d8c090');R(3,2,2,1,'#17141f');R(2,6,6,6,'#a88a5a');R(2,12,2,5,'#6a5a3a');R(6,12,2,5,'#6a5a3a');
  if(f)R(0,13,2,2,'#6a5a3a');else R(8,13,2,2,'#6a5a3a');}
ON_DRAW.push(()=>{
  if(levelIdx!==3)return;const M=HIS_M4,g=GROUND;
  if(M.on){const t=M.t;
    // huyen en desorden, no desfilan (Guion): salen de a uno cada 0,4–0,6 s, a velocidades distintas, y el del medio tropieza
    for(const[i,sale,vel]of[[0,0,2.4],[1,26,2.1],[2,62,1.6]]){const tt=t-sale;if(tt<0)continue;
      const trop=i===1&&tt>=20&&tt<32,x=M.x+6-Math.max(0,tt*vel-(i===1&&tt>=20?Math.min(12,tt-20)*vel:0)),y=g-(i===2?Math.round(Math.max(0,Math.sin(Math.min(Math.PI,tt/14))*6)):0)+(trop?1:0);
      if(x>camX-20){if(typeof CAM_corredor==='function')CAM_corredor(x+4,y,{t:trop?0:tt,i,cara:-1});else HIS_corredor(x,y-18,((T>>2)+i)%2);}} // el nómada de M4 (Personajes); el 3.º salta al salir
    if(t===10&&!M.solto){M.solto=true;if(typeof CAM_soltarPala==='function')CAM_soltarPala(M.x+4,GROUND-14,-1.1);if(typeof TAS_soltarEtiqueta==='function')TAS_soltarEtiqueta(M.x+8,GROUND-16);} // la pala y la etiqueta que sueltan
    if(t>=120&&t<330){for(let i=0;i<3;i++)parts.push({k:'p',x:M.x+3+Math.random()*20,y:g-2,vx:(Math.random()-0.5)*0.4,vy:-1-Math.random()*1.4,g:0.004,life:64,maxl:64,size:Math.random()<0.5?2:1,col:Math.random()<0.6?'#fff4c0':'#ffd060'});
      // contra el desierto naranja las partículas solas no se leían (Guion): un brillo dorado que late en la entrada, sumando luz
      if(typeof LUZ_halo==='function'){const k=Math.min(1,(t-120)/30,(330-t)/30);LUZ_halo(M.x+13,g-10,26,'#ffd060',k*(0.7+0.2*Math.sin(t/7)));}}} // se lee: algo dorado sale de la tumba (sin formar nada)
  if(M.tapada||(M.on&&M.t>=300)){const a=M.tapada?0.4:0.4*(M.t-300)/60;ctx.fillStyle=`rgba(40,26,12,${a.toFixed(2)})`;ctx.fillRect(M.x,g-26,26,26);}
});

// ================== M4: caminata (codigo-m4.md I) ==================
// REY POLVO vuelve a dormir: flota despacio hasta su sarcófago y la tapa se cierra sola, con un golpe suave.
HIS_CAMINATA[3]=(x,t)=>{
  if(typeof CAM_rey!=='function'||typeof CAM_sarcofago!=='function'||!HIS_villano)return;
  const sx=HIS_villano.sx??(x+20),dx=sx+13,dy=GROUND-30,x0=x-24,y0=HIS_villano.y+10,k=Math.min(1,t/120),e=k*k*(3-2*k);
  const cuadro=t<120?0:t<128?1:2;if(t===128)try{tone('sine',90,60,0.2,0.05);}catch(er){}
  CAM_sarcofago(sx,GROUND,cuadro);
  if(t<124)CAM_rey(x0+(dx-x0)*e,y0+(dy-y0)*e+Math.sin(t/10)*1.5,{cara:dx>x0?1:-1});
};

// ================== M5: LA CIUDAD SE PRENDE (codigo-m5.md D) ==================
// En la calle (x 1400–1900, sin arena), las ventanas se prenden con una vela SOLO DETRÁS del jugador, una cada 0,6 s
// (ESC_M5.prenderPantalla con una franja chica que va quedando atrás). g1 a los 3 s; a los 7 s, si está el gato, maúlla otro
// gato a lo lejos. Si seguís de largo, a los 3 s se prenden todas las de atrás y termina. El reflector no se toca.
const HIS_M5={on:false,hecho:false,t:0,x0:0};
ON_START.push(()=>{HIS_M5.on=false;HIS_M5.hecho=false;HIS_M5.t=0;HIS_M5.todas=false;});
ON_STEP.push(()=>{
  if(levelIdx!==4||state!=='play'||typeof ESC_M5==='undefined'||typeof ESC_M5.prenderPantalla!=='function')return;const M=HIS_M5;
  if(!M.on&&!M.hecho&&P&&P.x>=1400&&P.x<=1900&&!lock&&!(bossRef&&!bossRef.gone)&&!(banner&&banner.t>0)){M.on=true;M.t=0;M.x0=P.x;}
  if(!M.on)return;M.t++;const t=M.t,ps=P.x-camX; // dónde está el jugador en la pantalla
  if(t%36===1&&t<=360&&ps>30)ESC_M5.prenderPantalla(Math.max(0,ps-60),ps-20);
  if(t===180){HIS_globo('g1');if(P.x-M.x0>VW/2){ESC_M5.prenderPantalla(0,Math.max(0,ps-20));M.on=false;M.hecho=true;}}
  if(t===420&&typeof gato!=='undefined'&&gato)try{tone('triangle',1300,900,0.18,0.02);}catch(e){}
  if(t>=480){M.on=false;M.hecho=true;}
});

// ================== M5: caminata (codigo-m5.md I) ==================
// La ciudad entera se prende y DON NIEBLA se va flotando, colgado de su dirigible desinflado, chico y lejos, arriba a la izquierda.
HIS_CAMINATA[4]=(x,t)=>{
  if(!HIS_M5.todas&&typeof ESC_M5!=='undefined'&&ESC_M5.todas){HIS_M5.todas=true;ESC_M5.todas();}
  if(typeof CAM_niebla!=='function')return;
  CAM_niebla(Math.round(x-20-t*0.35),Math.round(GROUND-70-t*0.3));
};
