'use strict';
// Óxido · Los 2 vehículos nuevos (decisión de Facu, 23 nov): UNO CON RUEDAS y UNO QUE VUELA DE VERDAD. Más la CHATARRA.
// (Segundo programador. Va después de vehiculos.js y antes de juego.js. PROTOTIPO: la física y el manejo; el dibujo es
//  provisorio hasta que Facu elija los conceptos de Arte. Los nombres también los elige él: V2_NOM.)
//
// RUEDAS · velocidad y sensación de movimiento
//   · acelera y frena con inercia (tarda ~1 s en llegar a tope); soltar deja rodar; contramano frena fuerte y DERRAPA
//     (polvo, chispas y el chirrido) antes de dar vuelta.
//   · suspensión con resorte: rebota al caer y con los pozos; cae con peso (más gravedad bajando) y golpea al aterrizar.
//   · RAMPAS en sus misiones: a velocidad, salta lejos.
//   · la cámara se adelanta con la velocidad (más mundo por delante cuando va rápido).
//   · choca y empuja a los enemigos chicos (daño según la velocidad); cañón al frente; ESPECIAL: embestida a toda velocidad.
// VUELA · control libre en el aire
//   · sube, baja y avanza con las direcciones (sin mantener un botón para planear); SALTAR también sube.
//   · inercia suave al virar y se inclina hacia donde va.
//   · dispara en 8 direcciones (para donde apuntan las flechas; sin flechas, adelante); ESPECIAL: 3 bombas hacia abajo.
//   · COMBUSTIBLE: volar gasta; sin combustible cae despacio y recarga en el piso. Y un techo de 96 px sobre el suelo:
//     no puede pasar por arriba de todo el nivel.
// Los dos: subir con ↑, bajar con ↓ + saltar, blindaje propio y fusión I/II/III (fusion.js + carga de fusion-carga.js).
// Con CONTROLES SIMPLES: ↑ sube (o salta con las ruedas), DISPARAR, GRANADA = especial.
// Ganchos: envuelve mechJet, mechFire, mechCannon, updMech, drawMech, drawMechHUD, enterMech, mechBreak (como
// vehiculos.js); ON_START (tipo por misión y rampas), ON_STEP (cámara adelantada, empujones), ON_DRAW (rampas).
// window.V2_OFF = true: todas con la CHATARRA. Prefijo V2_.
const V2_NOM={ruedas:'RESORTE',vuela:'VENTARRÓN'}; // elegidos por Facu el 23 nov: el buggy (2A) y el de hélice (3B)
// qué vehículo va en cada misión (índice 0–9), confirmado por Dirección el 23 nov: CHATARRA en 1, 3 y 9 (en el pantano se
// hunde y frena en el barro, como el jugador: el vehículo no anula la mecánica del terreno), RUEDAS en 4, 5 y 8,
// VOLADOR en 2, 6, 7 y 10. Una sola clase por misión, con 2 unidades para la fusión. Aparece después de que el terreno
// se presentó a pie (las posiciones de L.mechs ya están pasado el primer tramo).
const V2_MISION=[0,'vuela',0,'ruedas','ruedas','vuela','vuela','ruedas',0,'vuela'];
// caja de golpe: la del arte si Arte la publica (V2_ARTE.TAM), si no la provisoria
const V2_TAM_0={ruedas:{w:28,h:20},vuela:{w:26,h:18}};
const V2_TAMde=t=>typeof V2_ARTE!=='undefined'&&V2_ARTE&&V2_ARTE.TAM&&V2_ARTE.TAM[t]||V2_TAM_0[t];
const V2_ON=()=>!window.V2_OFF;
const V2_t=m=>m&&m.v2?m.v2:null;
const V2_niv=m=>(m&&m.lvl)||1;
// números para ajustar la sensación
const V2_R={acel:0.055,frena:0.16,roce:0.022,max:[0,3.0,3.4,3.8],salto:5.4,peso:0.14,rampa:1.7,resorte:0.22,amort:0.78};
const V2_V={max:[0,2.2,2.5,2.8],maxY:1.8,inercia:0.075,inerciaY:0.14,gasto:1,caida:0.9,techo:96}; // techo: px sobre el piso (no se saltea el nivel por arriba)

// ---------- cada misión con su vehículo ----------
const V2_rampas=[];
ON_START.push(()=>{
  V2_rampas.length=0;
  if(!V2_ON())return;const t=V2_MISION[levelIdx];if(!t)return;
  for(const m of mechs){const b=m.y+m.h,z=V2_TAMde(t);m.v2=t;m.tipo=0;m.w=z.w;m.h=z.h;m.y=b-m.h;m.v2v=0;m.v2vy=0;m.susp=0;m.suspV=0;m.incl=0;m.v2F=0;}
  // rampas de chatarra en el suelo, donde hay tramos largos (lejos de arenas y torretas)
  if(t==='ruedas'){const ar=L.arenas.map(a=>a.at);
    for(let x=500;x<LEVEL_END-400;x+=rand(380,520)){if(ar.some(a=>Math.abs(a-x)<260))continue;
      if(platforms.some(pl=>pl.x<x+40&&pl.x+pl.w>x-10&&pl.y>GROUND-40))continue;V2_rampas.push({x,w:34,h:12});}}
});

// ---------- vuelo (mechJet corre antes de la gravedad, que suma 0,28) ----------
const V2_VY=v=>v-0.28;
const V2_arriba=()=>held('jump')||(typeof simpleDe==='function'&&P&&simpleDe(P.slot)?heldRaw('up'):held('up'));
{const j0=mechJet;mechJet=function(m,want){
  const t=V2_t(m);if(!t||!V2_ON())return j0(m,want);
  if(t==='ruedas'){ // cae con peso; la suspensión la mueve updMech
    if(m.v2Rampa)m.v2Rampa=0;else if(m.vy<=-6.5&&m.vy>=-6.7)m.vy=-V2_R.salto; // el salto de grillo.js (−6,6): con ruedas, más pesado
    if(!m.onGround&&m.vy>0)m.vy+=V2_R.peso;
    m.fuel=Math.min(m.fmax,m.fuel+m.fmax/900);return false;}
  // VUELA: las direcciones mandan la velocidad vertical; sin combustible, cae despacio
  const U=V2_arriba(),D=held('down')&&!tapped('jump');
  const sinComb=m.fuel<=0;
  if(sinComb&&!m.jetLock){m.jetLock=true;setBanner('¡SIN COMBUSTIBLE!',50);tone('square',300,90,0.25,0.06);}
  if(m.jetLock&&m.fuel>=m.fmax*0.2)m.jetLock=false;
  let ty=0;if(U&&!m.jetLock)ty=-V2_V.maxY;else if(D)ty=V2_V.maxY;else if(m.jetLock)ty=V2_V.caida;
  if(m.onGround&&ty>=0){m.v2vy=0;m.fuel=Math.min(m.fmax,m.fuel+m.fmax/600);return false;} // en el piso: recarga
  m.v2vy+=(ty-m.v2vy)*V2_V.inerciaY;
  const volando=!m.onGround||ty<0;
  if(volando&&!m.jetLock){m.fuel=Math.max(0,m.fuel-V2_V.gasto*(ty<0?1.3:1));}
  m.onGround=false;m.plat=null;m.vy=V2_VY(m.v2vy);
  if((m.y<10||GROUND-(m.y+m.h)>V2_V.techo)&&m.v2vy<0){m.v2vy=0;m.vy=V2_VY(0);} // techo: arriba de la pantalla o 96 px sobre el suelo (solo frena lo que SUBE: con m.vy<0 bajar despacio o caer sin combustible contaba como subir y quedaba colgado para siempre, Pruebas)
  if(T%5===0)V2_soplo(m);
  return true;
};}
function V2_soplo(m){parts.push({k:'smoke',col:'200,200,210',x:m.x+m.w/2+rand(-6,6),y:m.y+m.h+1,vx:rand(-0.3,0.3),vy:rand(0.6,1.2),life:rand(14,22),maxl:22,size:rand(1.2,2)});}

// ---------- movimiento: inercia, derrape, suspensión, rampas, empujones ----------
{const u0=updMech;updMech=function(m){
  const t=V2_t(m);if(!t||!V2_ON())return u0(m);
  const x0=m.x,aire0=!m.onGround,vy0=m.vy;
  u0(m);if(!m.ride)return;
  const mv=(held('right')?1:0)-(held('left')?1:0),n=V2_niv(m);
  if(t==='ruedas'){
    const max=V2_R.max[n]*(L.speedMul?L.speedMul(m):1);
    let v=m.v2v;
    if(m.v2Dash>0){m.v2Dash--;v=m.face*max*1.35;V2_embiste(m,true);}
    else if(mv&&Math.sign(v)===-mv&&Math.abs(v)>0.6){ // contramano: frena fuerte y derrapa
      v+=mv*V2_R.frena;m.derrape=8;if(m.onGround&&T%2===0){V2_polvo(m,3);if(Math.abs(v)>1.5)spark(m.x+(v>0?m.w-2:2),m.y+m.h-1,'#ffd25a');}
      if(m.onGround&&T%7===0)tone('sawtooth',900,600,0.06,0.025);}
    else if(mv)v+=mv*V2_R.acel*(m.onGround?1:0.4);
    else if(m.onGround)v-=Math.sign(v)*Math.min(Math.abs(v),V2_R.roce);
    v=clamp(v,-max,max);m.v2v=v;
    // mira para donde va (al dar vuelta, después del derrape)
    if(Math.abs(v)>0.2)m.face=Math.sign(v);else if(mv)m.face=mv;
    if(m.derrape>0)m.derrape--;
    // rampas: a velocidad, sale volando
    if(m.onGround)for(const r of V2_rampas){const fx=m.face>0?m.x+m.w:m.x;
      if(fx>r.x&&fx<r.x+r.w&&v>1.2){ // las rampas miran a la derecha (para donde avanza la misión)
        m.vy=-Math.abs(v)*V2_R.rampa-1.2;m.v2Rampa=1;m.onGround=false;m.plat=null;m.suspV-=1.5;
        tone('square',220,520,0.15,0.05);for(let i=0;i<6;i++)spark(r.x+r.w,GROUND-r.h,'#ffd25a');break;}}
    m.x=x0+v;
    // polvo al andar rápido
    if(m.onGround&&Math.abs(v)>1.4&&T%3===0)V2_polvo(m,1);
    // aterrizaje con peso: la suspensión se aplasta, polvo y golpe
    if(aire0&&m.onGround){const g=Math.min(4,vy0);m.suspV+=g*0.9;V2_polvo(m,4+Math.round(g*2));if(g>3){shakeAt(m.x+m.w/2,m.y+m.h,2.5);noise(0.2,0.12,600);}}
    // empuja a los chicos (no a los jefes)
    if(Math.abs(v)>1)V2_embiste(m,false);
    // motor: el tono sube con la velocidad
    if(m.onGround&&T%8===0&&Math.abs(v)>0.3)tone('sawtooth',70+Math.abs(v)*40,80+Math.abs(v)*44,0.08,0.018);
  }else{ // VUELA: inercia suave al virar e inclinación
    const max=V2_V.max[n];m.v2v+=(mv*max-m.v2v)*V2_V.inercia;
    if(mv)m.face=mv;
    m.x=x0+m.v2v*(m.onGround&&!mv?0:1);
    m.incl+=((m.v2v/max)*0.32-m.incl)*0.15;
    if(T%10===0&&!m.onGround)tone('triangle',140+Math.abs(m.v2v)*30,150,0.06,0.012);
  }
  // suspensión (resorte amortiguado): el dibujo baja y sube
  m.suspV+=(-m.susp)*V2_R.resorte;m.suspV*=V2_R.amort;m.susp+=m.suspV;m.susp=clamp(m.susp,-3,5);
  m.x=clamp(m.x,camX+2-(typeof MC_margenIzq==='function'?MC_margenIzq():0),camX+VW-m.w-2+(typeof MC_margen==='function'?MC_margen():0));
  if(m.v2F>0)m.v2F--;if(m.v2Atk>0)m.v2Atk--;
  P.x=m.x+m.w/2-4;P.y=m.y+m.h-18;P.vx=m.v2v;
};}
function V2_polvo(m,n){const x=m.face>0?m.x+3:m.x+m.w-3;for(let i=0;i<n;i++)parts.push({k:'smoke',col:'200,160,120',x:x+rand(-3,3),y:m.y+m.h-1,vx:-m.face*rand(0.3,1.2),vy:rand(-0.6,-0.1),life:rand(14,26),maxl:26,size:rand(1.2,2.6)});}
// choca con los enemigos chicos: los empuja y les pega según la velocidad (la embestida, más fuerte)
function V2_embiste(m,fuerte){
  const v=Math.abs(m.v2v);m.v2Hit=m.v2Hit||new Map();
  for(const e of enemies){if(!hittable(e)||!overlap(m,e))continue;const ult=m.v2Hit.get(e)||-99;if(T-ult<20)continue;m.v2Hit.set(e,T);
    if(isBoss(e)){if(fuerte){killSrc='grillo';dmg(e,2*V2_mult(m));killSrc=null;m.v2v*=-0.4;m.v2Dash=0;shakeAt(e.x,e.y,3);}continue;}
    killSrc='grillo';hitFrom={dir:m.face,pow:1+v*0.4,fl:1.2+v*0.2,up:fuerte};dmg(e,(fuerte?4:v*0.9)*V2_mult(m));hitFrom=null;killSrc=null;
    e.kbx=clamp((e.kbx||0)+m.face*(1.5+v),-4,4);m.v2v*=fuerte?1:0.85;tone('square',180,90,0.08,0.05);spark(e.x+e.w/2,e.y+10,'#ffd25a',-m.face);}
  for(const c of crates)if(!c.gone&&overlap(m,c)&&(fuerte||v>2))dmgCrate(c,3);
}
const V2_mult=m=>1+0.35*(V2_niv(m)-1);

// ---------- cámara: se adelanta con la velocidad (solo para adelante, como siempre; no en las arenas) ----------
ON_STEP.push(()=>{
  if(!V2_ON()||state!=='play'||lock)return;
  const p=leadP&&leadP(),m=p&&p.ride;if(!m||V2_t(m)!=='ruedas')return;
  const k=clamp(m.v2v/V2_R.max[V2_niv(m)],0,1),obj=Math.min(m.x-VW*(0.34-0.16*k),LEVEL_END-VW);
  if(obj>camX)camX+=Math.min(obj-camX,1+k*3);
});

// ---------- ataque y especial ----------
// dirección de las flechas (8 direcciones); sin flechas, adelante
function V2_dir(m){let dx=(held('right')?1:0)-(held('left')?1:0),dy=(held('down')?1:0)-((typeof simpleDe==='function'&&P&&simpleDe(P.slot)?heldRaw('up'):held('up'))?1:0);
  if(!dx&&!dy)dx=m.face;const l=Math.hypot(dx,dy);return{x:dx/l,y:dy/l};}
{const f0=mechFire;mechFire=function(m){
  const t=V2_t(m);if(!t||!V2_ON())return f0(m);
  if(m.fc>0&&m.fcO)return;if(m.v2F>0)return;
  const n=V2_niv(m),mu=V2_mult(m);m.v2Atk=6;
  if(t==='ruedas'){ // cañón al frente
    m.v2F=8;const bo=typeof V2_ARTE!=='undefined'&&V2_ARTE&&V2_ARTE.BOCA&&V2_ARTE.BOCA.ruedas||{x:m.w+2,y:7}; // punta del caño (Arte)
    const sx=m.face>0?m.x+bo.x:m.x+m.w-bo.x,sy=m.y+bo.y+Math.round(m.susp);tirosDisp++;
    pbul.push({x:sx,y:sy,vx:m.face*6.5,vy:0,k:'b',dmg:1.4*mu,life:70,heavy:true,w:'grillo',sh:1});
    if(n>=2){tirosDisp++;pbul.push({x:sx,y:sy+3,vx:m.face*6.5,vy:0.4,k:'b',dmg:1.2*mu,life:70,heavy:true,w:'grillo',sh:1});}
    parts.push({k:'flash',x:sx,y:sy,life:3,maxl:3,size:3.5});m.v2v-=m.face*0.05;SFX.heavy();
  }else{ // 8 direcciones
    m.v2F=6;const ce=typeof V2_ARTE!=='undefined'&&V2_ARTE&&V2_ARTE.CENTRO&&V2_ARTE.CENTRO.vuela||{x:m.w/2,y:m.h/2}; // centro de tiro (Arte)
    const d=V2_dir(m),cx=m.face>0?m.x+ce.x:m.x+m.w-ce.x,cy=m.y+ce.y,sx=cx+d.x*12,sy=cy+d.y*10;
    const tiro=(a,dm)=>{tirosDisp++;pbul.push({x:sx,y:sy,vx:Math.cos(a)*6.5,vy:Math.sin(a)*6.5,k:'b',dmg:dm,life:70,heavy:true,w:'grillo',sh:1});};
    const a=Math.atan2(d.y,d.x);tiro(a,1.1*mu);if(n>=2)tiro(a+0.12,0.9*mu);if(n>=3)tiro(a-0.12,0.9*mu);
    parts.push({k:'flash',x:sx,y:sy,life:3,maxl:3,size:3});SFX.heavy();
  }
};}
{const c0=mechCannon;mechCannon=function(m){
  const t=V2_t(m);if(!t||!V2_ON())return c0(m);
  if(m.fc>0&&m.fcO)return;m.shells--;m.v2Atk=12;
  if(t==='ruedas'){m.canCd=60;m.v2Dash=36;m.inv=Math.max(m.inv,40);m.v2Hit=new Map();noise(0.35,0.18,800);tone('sawtooth',90,420,0.35,0.06);}
  else{m.canCd=40;const k=V2_niv(m)>=3?4:3;
    for(let i=0;i<k;i++)later(i*90,()=>{if(!m.ride)return;grens.push({x:m.x+m.w/2,y:m.y+m.h,vx:m.v2v*0.6,vy:0.8,g:0.18,t:0,rot:Math.PI/2,mort:false,whistle:false,upd:grilloShellUpd,draw:grilloShellDraw});tone('square',400,200,0.08,0.03);});}
};}
{const e0=ejectMech;ejectMech=function(m,b){if(m&&V2_t(m)){m.v2Dash=0;m.v2v=0;m.v2vy=0;m.incl=0;}return e0(m,b);};}
{const en0=enterMech;enterMech=function(m){en0(m);if(V2_t(m)&&V2_ON())setBanner('¡A BORDO DEL '+V2_nombre(m)+'!',70);};}
{const mb0=mechBreak;mechBreak=function(m){mb0(m);if(V2_t(m)&&V2_ON())setBanner('¡EL '+V2_nombre(m)+' NO DA MÁS!',80);};}
function V2_nombre(m){return V2_NOM[V2_t(m)]+['',' II',' III'][Math.max(0,Math.min(2,V2_niv(m)-1))];}

// ---------- dibujo provisorio (hasta el arte elegido) ----------
ON_DRAW.push(()=>{if(!V2_ON())return;
  for(const r of V2_rampas){if(r.x+r.w<camX-10||r.x>camX+VW+10)continue;
    ctx.fillStyle='#120c18';ctx.beginPath();ctx.moveTo(r.x-1,GROUND);ctx.lineTo(r.x+r.w+1,GROUND);ctx.lineTo(r.x+r.w+1,GROUND-r.h-1);ctx.closePath();ctx.fill();
    ctx.fillStyle='#7a5a3a';ctx.beginPath();ctx.moveTo(r.x+1,GROUND);ctx.lineTo(r.x+r.w,GROUND);ctx.lineTo(r.x+r.w,GROUND-r.h);ctx.closePath();ctx.fill();
    ctx.fillStyle='#e8c040';for(let i=4;i<r.w;i+=6)ctx.fillRect(r.x+i,GROUND-r.h*i/r.w,2,1);}});
{const dm0=drawMech;drawMech=function(m){
  const t=V2_t(m);if(!t||!V2_ON())return dm0(m);if(!onScreen(m,40))return;
  // contrato con Arte y Dirección de arte (23 nov): nada de ctx.rotate (rompe la grilla nítida). Van como datos y el arte
  // elige el cuadro: inclina −1…1 (derecho / medio ~9° / lleno ~18°), susp 0–5 px enteros, altura sobre el piso (la sombra
  // se achica en escalones de 2 px), v velocidad, derrape, nivel 1–3.
  const piso=(()=>{let y=GROUND;for(const pl of platforms)if(!pl.roof&&m.x+m.w>pl.x&&m.x<pl.x+pl.w&&pl.y>=m.y+m.h-1&&pl.y<y)y=pl.y;return y;})();
  const op={nivel:V2_niv(m),t:T,inclina:clamp(m.incl/0.32,-1,1)*m.face,susp:clamp(Math.round(m.susp),0,5),altura:Math.max(0,Math.round(piso-(m.y+m.h))),
    v:m.v2v,derrape:m.derrape>0,flash:m.flash>0||(m.dying>0&&(T>>2)%2),jinete:m.ride?(m.by||P):null};
  if(typeof V2_ARTE!=='undefined'&&V2_ARTE&&V2_ARTE[t]){V2_ARTE[t](m,op);}
  else V2_provisorio(m,t);
  const parado=!m.ride&&!m.dying;
  if(parado&&m.cool<=0&&players.some(p=>!p.ride&&!p.dead&&Math.abs(p.x+4-(m.x+m.w/2))<44))txt('↑ SUBIR AL '+V2_nombre(m),m.x+m.w/2,m.y-12+Math.sin(T/8)*1.5,6,'#ffe08a','center');
};}
function V2_provisorio(m,t){
  const fl=m.flash>0||(m.dying>0&&(T>>2)%2),C=c=>fl?'#fff':c,K='#120c18',n=V2_niv(m);
  ctx.save();ctx.translate(q(m.x+m.w/2),q(m.y+m.h/2+(t==='ruedas'?Math.round(m.susp):0)));if(m.face<0)ctx.scale(-1,1); // sin rotar (grilla nítida)
  const w=m.w,h=m.h;
  if(t==='ruedas'){
    const rueda=(x,y,r)=>{ctx.fillStyle=K;circle(x,y,r+0.8);ctx.fillStyle=C('#2a2a30');circle(x,y,r);ctx.fillStyle=C('#6a6f7a');circle(x,y,r*0.45);
      const a=(m.x/r)%6.28;ctx.fillStyle=K;ctx.fillRect(x+Math.cos(a)*r*0.7-0.5,y+Math.sin(a)*r*0.7-0.5,1,1);};
    ctx.fillStyle=K;ctx.fillRect(-w/2-1,-h/2+3,w+2,h-8);ctx.fillStyle=C('#c08a2e');ctx.fillRect(-w/2,-h/2+4,w,h-10);
    ctx.fillStyle=C('#e0b050');ctx.fillRect(-w/2,-h/2+4,w,1.5);for(let i=0;i<5;i++){ctx.fillStyle=fl?'#fff':i%2?'#1d1a1c':'#e8c040';ctx.fillRect(-w/2+3+i*4,h/2-9,4,2);}
    ctx.fillStyle='rgba(140,220,225,0.5)';ctx.beginPath();ctx.arc(1,-h/2+4,5,Math.PI,0);ctx.fill();
    ctx.fillStyle=C('#2a2a30');ctx.fillRect(w/2-2,-h/2+6,6,2.5); // cañón
    if(m.ride){ctx.fillStyle=playerHelmet(m.by||P);ctx.fillRect(-1,-h/2-1,4,2);ctx.fillStyle='#efb88d';ctx.fillRect(-0.5,-h/2+1,3,2);}
    rueda(-w/2+5,h/2-3-m.susp*0.4,4);rueda(w/2-5,h/2-3-m.susp*0.4,4);
    if(n>=2){ctx.fillStyle=C('#c8ccd4');for(let i=0;i<n;i++){ctx.beginPath();ctx.moveTo(w/2+1,-2+i*3);ctx.lineTo(w/2+4,-0.5+i*3);ctx.lineTo(w/2+1,1+i*3);ctx.fill();}}
  }else{
    ctx.fillStyle=K;ctx.beginPath();ctx.ellipse(0,1,w/2+1,h/2-2,0,0,7);ctx.fill();ctx.fillStyle=C('#c08a2e');ctx.beginPath();ctx.ellipse(0,1,w/2,h/2-3,0,0,7);ctx.fill();
    ctx.fillStyle=C('#7a5418');ctx.fillRect(-w/2-4,0,6,2);
    for(let i=0;i<4;i++){ctx.fillStyle=fl?'#fff':i%2?'#1d1a1c':'#e8c040';ctx.fillRect(-7+i*3,4,3,1.5);}
    ctx.fillStyle='rgba(140,220,225,0.5)';ctx.beginPath();ctx.arc(4,-2,5,Math.PI,0);ctx.fill();
    if(m.ride){ctx.fillStyle=playerHelmet(m.by||P);ctx.fillRect(3,-6,4,2);ctx.fillStyle='#efb88d';ctx.fillRect(3.5,-4,3,2);}
    const r=(T>>1)%2?13:7;ctx.fillStyle=K;ctx.fillRect(-1,-h/2-1,2,3);ctx.fillStyle='rgba(225,225,235,0.8)';ctx.fillRect(-r,-h/2-2,r*2,1);
    if(n>=2){ctx.fillStyle='#ff3b30';ctx.fillRect(-w/2+2,-1,1,1);}
  }
  ctx.restore();
}
// ---------- HUD ----------
{const dh0=drawMechHUD;drawMechHUD=function(m){
  const t=V2_t(m);if(!t||!V2_ON())return dh0(m);
  const bx=W-56,bw=50,rs=P?P.slot:0,ar=RC_ver('ar'+rs,m.armor),nv=V2_niv(m),nom=V2_nombre(m),sl=P?P.slot:0;
  txt(nom,W-6,4,5,'#f3c969','right');
  const x0=W-6-hudTW(nom,5)-24;for(let k=0;k<3;k++){const x=x0+k*6;ctx.fillStyle='#120c18';ctx.fillRect(x-0.5,4.5,5,5);ctx.fillStyle=k<nv?'#ffd25a':'#3a2a40';ctx.fillRect(x,5,4,4);}
  ctx.fillStyle='#120c18';ctx.fillRect(bx-1,10,bw+2,6);ctx.fillStyle='#4a2730';ctx.fillRect(bx,11,bw,4);
  ctx.fillStyle=m.armor<=m.max*0.3?((T>>3)%2?'#ff5a3c':'#a02a1a'):'#e8c040';ctx.fillRect(bx,11,bw*Math.max(0,ar)/m.max,4);
  const f=t==='ruedas'?Math.abs(m.v2v)/V2_R.max[nv]:m.fuel/m.fmax;
  ctx.fillStyle='#120c18';ctx.fillRect(bx-1,16.5,bw+2,4.5);ctx.fillStyle='#1c2a38';ctx.fillRect(bx,17.5,bw,2.5);
  ctx.fillStyle=t==='ruedas'?(f>0.85?'#ff9a3c':'#ffd25a'):m.jetLock?'#ff5a3c':f<0.2?'#ff9a3c':'#6fd0ff';ctx.fillRect(bx,17.5,bw*clamp(f,0,1),2.5);
  txt(t==='ruedas'?'VELOC.':'COMB.',bx-3,16.5,4,'#9ad0ff','right',false);
  txt((t==='ruedas'?'EMBESTIDA ':'BOMBAS ')+m.shells+' ('+btn('bomb',sl)+')',W-6,22.5,5,m.shells?'#fff':'#ff6b5b','right');
  txt('↓+'+btn('jump',sl)+': BAJAR',W-6,28.5,4,'#aaa','right',false);
};}
