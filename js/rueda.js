'use strict';
// Óxido · Rueda de armas
// La tecla de arma (S en el teclado · △ o L1 en el joystick · △ en la pantalla):
//   tocar = la siguiente arma (como siempre) · mantener ~0,25 s = abre la rueda.
// Con la rueda abierta el juego va en cámara lenta (no se pausa). Flechas (y la cruz del joystick): cada toque pasa al
// gajo siguiente (→ ↓) o al anterior (← ↑), en el orden de los números. Palanca del joystick o táctil: por ángulo, 6 zonas
// parejas de 60° (palancaDe en input.js). El jugador no se mueve mientras tanto; se confirma al soltar. El avión es un gajo más: muestra lo que cuesta
// y si se puede pedir. Teclas 1–6 eligen directo (6 = avión). De a 2, cada uno tiene su rueda; la cámara lenta es una.
// Lo llama juego.js en cada cuadro real (ruedaFrame), antes de la cámara lenta, así responde aunque el juego vaya lento.
// Para la pantalla táctil (publicar/web/tactil.js): window.OXIDO_RUEDA (al final).
const RU_ITEMS=['pistol','heavy','shotgun','flame','rocket','avion'];  // el número de tecla es el índice + 1
const RU_ABRE=15,RU_LENTO=0.3,RU_RADIO=27;
const RU_ANG=RU_ITEMS.map((_,i)=>-Math.PI/2+i*Math.PI/3); // gajos en hexágono, empezando arriba, en el sentido del reloj
const RU=[0,1].map(()=>({t:0,open:false,sel:null,hov:null,o:0,ext:null}));
const RU_num=[];
// 1–9 (fila de números o teclado numérico) eligen directo para el jugador 1
addEventListener('keydown',e=>{const m=/^(?:Digit|Numpad)([1-9])$/.exec(e.code);if(!m||e.metaKey||e.ctrlKey||e.altKey)return;
  if(state==='play'){RU_num.push(+m[1]);e.preventDefault();}});
const ruAbierta=()=>RU.some(r=>r.open);
const ruAbiertaDe=s=>!!(RU[s]&&RU[s].open);
function ruCerrar(){for(const r of RU){r.open=false;r.t=0;r.o=0;r.ext=null;}RU_num.length=0;}
// se puede elegir: el avión siempre (si no alcanza, callAir avisa); un arma si la tenés y no vas en el Grillo
function ruOk(p,it){if(it==='avion')return true;if(p.ride)return false;return it==='pistol'||p.weapons[it]>0;}
function ruAplicar(p,it){
  if(!it)return;
  withP(p,()=>{
    if(it==='avion'){callAir();return;}
    if(!ruOk(p,it)){SFX.hit();parts.push({k:'txt',s:p.ride?'EN LA CHATARRA NO':'NO TENÉS '+WEAPONS[it].name,x:p.x+4,y:p.y-8,life:45,maxl:45});return;}
    if(p.weapon!==it){p.weapon=it;SFX.swap();}
  });
}
// gajo más cercano a un ángulo (un pelito corrido para que → y ← no queden justo entre dos)
function ruCerca(a){let best=0,bd=9;RU_ANG.forEach((g,i)=>{const d=Math.abs(angDiff(a+0.01,g));if(d<bd){bd=d;best=i;}});return RU_ITEMS[best];}
function ruedaFrame(){
  const k=inSlot;
  for(const p of players){
    const r=RU[p.slot];
    if(p.dead||winT){r.open=false;r.t=0;r.o=0;continue;}
    inSlot=p.slot;
    if(heldRaw('air')||heldRaw('swap')){
      r.t++;
      if(r.t===RU_ABRE){r.open=true;r.sel=r.hov=p.ride?'avion':p.weapon;r.o=0;tone('triangle',520,660,0.06,0.025);
        r.kSig=heldRaw('right')||heldRaw('down');r.kAnt=heldRaw('left')||heldRaw('up');} // lo que ya venía apretado no cuenta como toque
    }else{
      if(r.open)ruAplicar(p,r.sel);
      else if(r.t>0&&r.t<RU_ABRE&&!p.ride)withP(p,()=>{nextWeapon();SFX.swap();});
      r.open=false;r.t=0;r.ext=null;
    }
    if(r.open){
      r.o=Math.min(1,r.o+0.25);
      // palanca táctil (ángulo que manda tactil.js) o palanca del joystick: por ángulo, 6 zonas de 60° parejas
      const pj=r.ext===null?palancaDe(p.slot):null;
      const a=r.ext!==null?r.ext:pj?Math.atan2(pj.y,pj.x):null;
      if(a!==null){const it=ruCerca(a);if(it!==r.hov&&ruOk(p,it))tone('square',800,900,0.025,0.02);r.hov=it;if(ruOk(p,it))r.sel=it;}
      else{
        // flechas (y la cruz del joystick): cada toque pasa al gajo siguiente (→ o ↓) o al anterior (← o ↑), en el orden
        // de los números y dando la vuelta; salta los que no se pueden elegir
        const sig=heldRaw('right')||heldRaw('down'),ant=heldRaw('left')||heldRaw('up');
        const d=sig&&!r.kSig?1:ant&&!r.kAnt?-1:0;r.kSig=sig;r.kAnt=ant;
        if(d){const i0=RU_ITEMS.indexOf(r.sel);for(let j=1;j<=RU_ITEMS.length;j++){const it=RU_ITEMS[(i0+d*j+RU_ITEMS.length*2)%RU_ITEMS.length];
          if(ruOk(p,it)){r.sel=r.hov=it;tone('square',900,1000,0.03,0.025);break;}}}
      }
    }
  }
  inSlot=k;
  // números: el jugador 1 (es el del teclado)
  const p1=players[0];
  for(const n of RU_num){const it=RU_ITEMS[n-1];if(!it||!p1||p1.dead)continue;ruAplicar(p1,it);if(RU[0].open)RU[0].sel=RU[0].hov=it;}
  RU_num.length=0;
}
// ---------- dibujo (en el HUD, alrededor de cada jugador) ----------
function ruDibujar(p){
  const r=RU[p.slot];if(!r.open)return;
  const o=r.o,e=1-(1-o)*(1-o),R=RU_RADIO*(0.6+0.4*e),c=pCenter(p);
  // arriba de la cabeza, así se sigue viendo al jugador (si no entra, lo más arriba posible sin pisar el marcador)
  const cx=clamp(HX(c.x),R+16,W-R-16),cy=clamp(HY(c.y)-R-26,R+44,HC-R-16);
  const num=p.slot===0&&!onTouch()&&!onPad(0);
  ctx.globalAlpha=e;
  ctx.fillStyle='rgba(12,8,18,0.55)';circle(cx,cy,R+14);
  ctx.strokeStyle=P_COL[p.slot];ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,R+14,0,7);ctx.stroke();
  RU_ITEMS.forEach((it,i)=>{
    const x=cx+Math.cos(RU_ANG[i])*R,y=cy+Math.sin(RU_ANG[i])*R,ok=ruOk(p,it),on=it===r.sel,hov=it===r.hov&&!on;
    const map=HUD_ICONS[it==='avion'?'plane':it],iw=hudIW(map),ih=hudIH(map);
    ctx.fillStyle=on?'rgba(243,201,105,0.95)':ok?'rgba(42,31,48,0.95)':'rgba(30,22,34,0.7)';
    ctx.fillRect(x-10,y-7,20,14);
    if(on||hov){ctx.strokeStyle=on?'#fff6c8':'#ff8a7a';ctx.lineWidth=1;ctx.strokeRect(x-10.5,y-7.5,21,15);}
    ctx.globalAlpha=e*(ok?1:0.35);hudPix(map,x-iw/2,y-ih/2-1,1,it==='flame'?{...HUD_PAL,b:'#ff9a3c'}:HUD_PAL);ctx.globalAlpha=e;
    // munición o costo, chiquito abajo
    let s,col;
    if(it==='avion'){s=air?'EN VUELO':flares>0?'×'+flares:'−1♥';col=air?'#8a7f92':flares>0?'#9ad0ff':withP(p,airReady)?'#ddd':'#ff8a7a';}
    else if(it==='pistol'){s='∞';col='#ddd';}
    else{s=ok?String(p.weapons[it]):'—';col=ok?'#ddd':'#6a5f72';}
    txt(s,x,y+3.2,4,on?'#120c18':col,'center',false);
    if(num)txt(String(i+1),x-9,y-6.5,4,on?'#120c18':'#ffe08a','left',false);
  });
  // en el medio: el nombre de lo que está marcado (o por qué no se puede)
  const it=r.hov||r.sel,ok=ruOk(p,it);
  let s=it==='avion'?(air?'AVIÓN EN VUELO':flares>0?'AVIÓN GRATIS':withP(p,airReady)?'AVIÓN · −1 ♥':'AVIÓN · NECESITÁS 2 ♥'):ok?WEAPONS[it].name:p.ride?'EN LA CHATARRA NO':'NO TENÉS';
  txt(s,cx,cy-2.5,4,ok?'#ffe08a':'#ff8a7a','center',false);
  ctx.globalAlpha=1;
}
ON_HUD.push(()=>{if(state!=='play'||!players.length)return;for(const p of players)ruDibujar(p);});
ON_START.push(ruCerrar);
// ---------- API para la pantalla táctil ----------
// OXIDO_RUEDA.abierta(j)        → true si la rueda del jugador j (0 o 1, por defecto 0) está abierta
// OXIDO_RUEDA.apuntar(ang, j)   → ángulo de la palanca en radianes (0 = derecha, π/2 = abajo); null = usar las flechas
// OXIDO_RUEDA.elegir(cual, j)   → elige directo: 'pistol' 'heavy' 'shotgun' 'flame' 'rocket' 'avion' (o 1–6)
// OXIDO_RUEDA.items             → los gajos, en orden (índice + 1 = tecla)
// Abrir y cerrar no hace falta: △ en pantalla manda la acción 'air'; mantenerla abre la rueda y soltarla confirma.
window.OXIDO_RUEDA={
  items:RU_ITEMS.slice(),
  abierta:(j=0)=>ruAbiertaDe(j),
  apuntar:(a,j=0)=>{if(RU[j])RU[j].ext=typeof a==='number'&&isFinite(a)?a:null;},
  elegir:(c,j=0)=>{const it=typeof c==='number'?RU_ITEMS[c-1]:c,p=players.find(q=>q.slot===j);if(p&&!p.dead&&RU_ITEMS.includes(it)){ruAplicar(p,it);if(RU[j].open)RU[j].sel=RU[j].hov=it;}}
};
