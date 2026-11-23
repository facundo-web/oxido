'use strict';
// Óxido · Misión cumplida: un paso más, no el fin
// Al vencer al villano (winT de juego.js), el personaje (y el compañero, el gato, la CHATARRA) festeja un instante y
// SIGUE CAMINANDO solo hacia la derecha hasta salir de la pantalla; el jugador no controla nada en esos segundos.
// El mundo y el HUD se oscurecen un poco (menos donde caminan los personajes) y aparece, en secuencia y con el pop del
// cómic: "¡MISIÓN CUMPLIDA!" grande; los puntos de la misión contando (y la medalla de tiempo del jefe, cuando exista);
// el avance (misión n de 10) y si te superaste en esta misión ("¡MEJOR QUE TU RÉCORD…!" o "a N de tu récord"); los
// logros nuevos como íconos chicos con "+N LOGROS" (sacados de la cola de historial.js, así no salen dos veces). Abajo,
// chico: "SIGUIENTE: MISIÓN n · NOMBRE" con una barrita fina (5,5 s) y las teclas del control que se usa. Al llenarse
// pasa SOLA a la misión siguiente: el personaje entra por la izquierda. Blanco más dos colores (acento y gris).
// ENTER, ✕ o un clic adelantan. ESC abre la pausa de siempre (desde ahí se puede salir al menú).
// Al terminar un mundo (misiones 3, 6 y 9) dice "¡MUNDO n COMPLETO!". Movimiento reducido: fundidos en vez de pop.
// La misión 10 (la última de la vuelta) no pasa por acá: mantiene su festejo y la pantalla de fin de siempre.
// Prefijo MC_.
let MC=null,MC_entra=0;
const MC_FESTEJO=40,MC_BARRA=330,MC_LOGRO_EXTRA=45;
const MC_ganada=()=>!!(MC&&MC.ganada);                      // para el bot: la misión ya se ganó y corre la placa
const MC_activa=()=>!!MC||MC_entra>0;
// mientras corre, los controles los maneja esto: festejo (un saltito) y después caminar a la derecha
const MC_manda=()=>MC_activa()&&state==='play';
function MC_held(a){if(MC_entra>0)return a==='right';return!!MC&&MC.t>MC_FESTEJO&&a==='right';}
function MC_tapped(a){return!!MC&&a==='jump'&&MC.t===10;}
// cuánto pueden pasarse del borde derecho de la pantalla (los clamps de jugador, CHATARRA, aliados y gato)
const MC_margen=()=>MC?800:0;
const MC_margenIzq=()=>MC_entra>0?40:0; // y al entrar a la misión siguiente, desde afuera por la izquierda
ON_START.push(()=>{MC=null;MC_entra=0;}); // MC_siguiente lo vuelve a poner después de startLevel; una partida nueva arranca quieta
// lo llama juego.js en cada cuadro con winT (villano vencido); devuelve true si la placa se encarga (no la misión 10)
function MC_paso(){
  if(lastLevel())return false;
  if(!MC)MC={t:0,ganada:false,logros:[],barra:0,mundo:typeof MU_GUARDIAN!=='undefined'&&MU_GUARDIAN[levelIdx]?mundoDe(levelIdx):0};
  const m=MC;m.t++;
  if(m.t===50){jingle('win');finishWin(true);m.ganada=true;m.puntos=Math.max(0,score-(PC_mis?PC_mis.score0:0));
    m.resc=prisoners.filter(p=>p.state!=='tied').length;m.prisT=prisoners.length;m.gato=typeof CAT_vivo==='function'&&CAT_vivo();
    m.sig=LEVELS[levelIdx+1];MC_anotar(m);}
  if(!m.ganada)return true;
  toasts.length=0;banner=null; // con la placa no hay otros avisos (ni el del arma que junta al salir caminando)
  for(const pa of parts)if(pa.k==='txt')pa.life=Math.min(pa.life,1); // ni los números que flotan (+200, +50), que pasaban sobre la placa (Pruebas, W)
  if(typeof RC_chapas!=='undefined')for(const k of RC_chapas)k.fase=2; // las chapitas van ya al marcador
  {const t=m.t-50;if(t>=12&&t<52&&t%3===0&&m.puntos>0)tone('square',1300+t*8,1300+t*8,0.018,0.018);} // tic de los puntos que cuentan
  // los logros nuevos entran a la placa (y no salen después como cartelito suelto)
  for(let i=0;i<HIST_pops.length;)if(!HIST_pops[i].t0){m.logros.push({a:HIST_pops[i].a,t:0});HIST_pops.splice(i,1);}else i++; // en el orden en que se ganaron
  m.logros.forEach((l,i)=>{if(m.t-50>85+i*10)l.t++;}); // después del avance, de a uno
  const dur=MC_BARRA+Math.max(0,m.logros.length-2)*MC_LOGRO_EXTRA;
  if(m.t>95)m.barra=Math.min(1,m.barra+1/dur);
  // adelantar: ENTER, ✕ (salto) o clic (zona de la placa); no en los primeros cuadros, así un disparo apretado no la saltea
  if(m.t>95&&(pressed.start||pressed.jump||(typeof pressed2!=='undefined'&&(pressed2.start||pressed2.jump))))m.barra=1;
  if(m.barra>=1)m.ir=true; // juego.js pasa a la misión siguiente al empezar el próximo cuadro (no en el medio de este)
  return true;
}
function MC_adelantar(){if(MC&&MC.ganada)MC.barra=1;}
// la misión que sigue: arranca y el personaje entra caminando por la izquierda
function MC_siguiente(){
  const i=levelIdx+1;MC=null;startLevel(i,true);
  players.forEach((p,j)=>{const o=p.ride||p;o.x=camX-14-j*16;if(p.ride)P.x=o.x+7;});
  for(const a of allies)a.x=camX-30-Math.random()*20;
  if(typeof gato!=='undefined'&&gato)gato.x=camX-26;
  MC_entra=55;
}
ON_STEP.push(()=>{if(MC_entra>0&&!MC)MC_entra--;});
// ---------- mejor puntaje por misión (por dificultad), para saber si te superaste ----------
function MC_mejores(){try{return JSON.parse(store.get('oxido-mejor-mision')||'{}')||{};}catch(e){return{};}}
function MC_anotar(m){const b=MC_mejores(),k=difficulty+'|'+levelIdx;m.antes=b[k]||0;if(m.puntos>m.antes){b[k]=m.puntos;store.set('oxido-mejor-mision',JSON.stringify(b));}}
// accesibilidad (cuando exista la opción): movimiento reducido = fundido en vez de pop; texto grande = ×1,5
const MC_red=()=>typeof MOV_reducido==='function'&&MOV_reducido();
const MC_tk=()=>1; // TEXTO GRANDE lo aplica txt() (base.js)
const MC_ACENTO='#ffe066',MC_GRIS='#b9adc8';
// ---------- la placa: velo, título, puntos que cuentan, avance, logros, siguiente ----------
// Poca información y dos colores además del blanco. El mundo se oscurece un poco, menos donde caminan los personajes.
function MC_entrada(t,t0,red){const d=t-t0;if(d<0)return 0;if(red)return Math.min(1,d/10);return d<3?1.3*d/3:d<6?1.3-0.3*(d-3)/3:1;}
ON_HUD.push(()=>{
  const m=MC;if(!m||!m.ganada||state!=='play'&&state!=='pause')return;
  const t=m.t-50,red=MC_red(),tk=MC_tk();
  // 1 · velo con un hueco donde están los personajes (siguen bien a la vista mientras se van)
  // cada foco recorta su propio hueco (los recortes se suman): así, si el gato o un amigo están pegados al personaje,
  // donde sus focos se tocan no vuelve a quedar oscuro (con un solo recorte 'evenodd', la parte compartida se oscurecía)
  ctx.save();
  const hueco=o=>{const w=(o.w||8)*HZ(),h=(o.h||18)*HZ(),cx=HX(o.x)+w/2,cy=HY(o.y)+h/2;ctx.beginPath();ctx.rect(0,0,W,HC);ctx.moveTo(cx+w*0.9+4,cy);ctx.ellipse(cx,cy,w*0.9+4,h*0.7+3,0,0,Math.PI*2);ctx.clip('evenodd');}; // un foco redondo
  for(const p of players)if(!p.dead)hueco(p.ride||p);
  if(typeof gato!=='undefined'&&gato)hueco(gato);for(const al of allies)hueco(al);ctx.fillStyle='rgba(18,12,24,'+(Math.min(1,t/12)*0.5).toFixed(3)+')';ctx.fillRect(0,0,W,HC);ctx.restore();
  const capa=(k,fn,cy)=>{if(k<=0)return;ctx.save();if(red)ctx.globalAlpha=Math.min(1,k);else{ctx.translate(W/2,cy);ctx.scale(k,k);ctx.translate(-W/2,-cy);}fn();ctx.restore();};
  // 2 · el objetivo cumplido, grande y al centro, con el pop del cómic
  const tit=m.mundo?tx(TX.cumplida.mundo,{n:m.mundo}):TX.cumplida.mision;
  capa(MC_entrada(t,0,red),()=>txt(tit,W/2,40,Math.round(15*tk),'#ffffff','center'),48);
  // las alturas de cada renglón salen del tamaño real de la letra (TEXTO GRANDE) y de si hay línea de tiempo (reloj.js)
  const lt=typeof JT_lineaPlaca==='function'?JT_lineaPlaca():null;
  const yP=40+TXT_aj(15)+5,yT=yP+TXT_aj(8)+3,yM=(lt?yT+TXT_aj(4)+4:yT+2),yB=yM+TXT_aj(5)+3,yR=yB+6,yL=yR+(TXT_aj(4)+5),ySig=yL+12,yK=ySig+TXT_aj(4)+5;
  // 3 · los puntos de la misión, contando rápido (con tic), y la medalla de tiempo del jefe si la hay
  const kp=MC_entrada(t,12,red);
  if(kp>0){const n=Math.round(m.puntos*Math.min(1,(t-12)/40));
    capa(kp,()=>{const s=tx(TX.cumplida.puntos,{n});txt(s,W/2,yP,Math.round(8*tk),MC_ACENTO,'center');
      const med=typeof JT_medalla==='function'?JT_medalla():null; // (jefes con tiempo: cuando exista)
      if(med){const mx=W/2+txtW(s,Math.round(8*tk))/2+8;ctx.fillStyle=med.col||MC_ACENTO;circle(mx,yP+4,4);txt(med.n||'',mx,yP+2,4,'#120c18','center',false);}
      if(lt)txt(lt,W/2,yT,4,MC_GRIS,'center',false);},yP+4);} // "MISIÓN EN 1:04 · VILLANO EN 0:25 · ORO" (reloj.js)
  // 4 · avance: misión n de 10 (una barra) y si te superaste en esta misión
  const ka=MC_entrada(t,55,red);
  if(ka>0)capa(ka,()=>{const n=LEVELS.length,i=levelIdx+1,bw=120,bx=W/2-bw/2,by=yB,seg=bw/n;
    txt(tx(TX.cumplida.avance,{n:i,de:n})+(typeof NM_avance==='function'?NM_avance():''),W/2,yM,Math.round(5*tk),MC_GRIS,'center',false); // nota y mejor tiempo (nota.js)
    ctx.fillStyle='#120c18';ctx.fillRect(bx-1,by-1,bw+2,5);
    const llena=Math.min(1,Math.max(0,(t-58)/24)); // la de ahora se llena al final
    for(let j=0;j<n;j++){const f=j<i-1?1:j===i-1?llena:0;ctx.fillStyle='#3a2f40';ctx.fillRect(bx+j*seg+0.5,by,seg-1,3);
      if(f>0){ctx.fillStyle=j===i-1?'#ffffff':MC_ACENTO;ctx.fillRect(bx+j*seg+0.5,by,(seg-1)*f,3);}}
    if(t>=78&&m.antes>0){const mej=m.puntos>m.antes,s=mej?TX.cumplida.mejor:tx(TX.cumplida.cerca,{n:m.antes-m.puntos});
      txt(s,W/2,yR,Math.round(4*tk),mej?MC_ACENTO:MC_GRIS,'center',false);}},yB);
  // 5 · logros nuevos: solo los íconos en una fila y cuántos (el detalle, en LOGROS)
  const L=m.logros.filter(l=>l.t>0);
  if(L.length){const s=8,gap=3,lab=L.length===1?TX.cumplida.logro:tx(TX.cumplida.logros,{n:L.length}),lw=txtW(lab,Math.round(5*tk)),tot=Math.min(8,L.length)*(s+gap)+lw+4;let x=W/2-tot/2;
    L.slice(0,8).forEach(l=>{const k=MC_entrada(l.t,0,red);if(k<=0)return;ctx.save();if(red)ctx.globalAlpha=k;else{ctx.translate(x+s/2,yL+s/2);ctx.scale(k,k);ctx.translate(-x-s/2,-yL-s/2);}
      HIST_icon({...l.a,col:MC_ACENTO},x,yL,s,true);ctx.restore();x+=s+gap;});
    txt(lab,x+2,yL+1.5,Math.round(5*tk),MC_ACENTO,'left',false);}
  // 6 · abajo, chico: la misión que sigue con la barrita de espera, y las teclas del control que se usa
  const sig=m.sig?tx(TX.cumplida.siguiente,{n:levelIdx+2,nombre:(m.sig.short||m.sig.name).replace(/^\d+\s*·\s*/,'')}):'';
  if(t>=40){txt(sig,W/2,ySig,Math.round(4*tk),MC_GRIS,'center',false);
  ctx.fillStyle='rgba(255,255,255,0.18)';ctx.fillRect(W/2-50,yK-3,100,1);ctx.fillStyle=MC_ACENTO;ctx.fillRect(W/2-50,yK-3,100*m.barra,1);}
  if(t>45){const sg=onTouch()?TX.cumplida.toca:onPad()?btn('jump'):btn('start'),pa=onTouch()?'II':onPad()?btn('opt'):btn('back');
    txt(tx(TX.cumplida.seguir,{tecla:sg})+'  ·  '+tx(TX.cumplida.pausa,{tecla:pa}),W/2,yK,Math.round(4*tk),'#ffffff','center',false);}
  if(typeof zona==='function')zona(0,28,W,HC-28,{clic:MC_adelantar});
});
