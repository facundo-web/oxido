'use strict';
// Óxido · Entrada de jefe "Hondo" (notas/arte/guia.md §6) — va después de arte-luz.js, antes de juego.js
// Reemplaza la página de historieta ("de a dos") y el cartel que rebota (dibujito.js): Código los apaga cuando ve
// window.JEFE_ENTRADA_NUEVA. El juego no se frena.
// · Bandas negras de 10 px arriba y abajo que entran en 8 cuadros (se dibujan ANTES del HUD: la barra del jefe y los
//   avisos quedan encima, nunca tapados).
// · La escena baja 30 % de brillo salvo el jefe, que recibe un halo fuerte del color cálido de la misión.
// · El nombre entra deslizando hasta el centro, arriba (debajo de la barra del jefe, y 33), en letra pixel 5 × 7, con una
//   línea fina del color cálido debajo y la línea del villano (Guion) en 3 × 5, hasta 2 renglones, centrada.
// · 2 s como mucho. Cualquier tecla, clic o toque la saltea (después de los primeros 12 cuadros).
// · MOVIMIENTO REDUCIDO: sin desliz; aparece y se va con fundido.
// Prefijo JE_.
window.JEFE_ENTRADA_NUEVA=true;
// letra pixel 5 × 7 (mayúsculas, números y signos; los acentos van en una fila arriba)
const JE_F={A:'01110100011000111111100011000110001',B:'11110100011000111110100011000111110',C:'01110100011000010000100001000101110',D:'11110100011000110001100011000111110',
  E:'11111100001000011110100001000011111',F:'11111100001000011110100001000010000',G:'01110100011000010111100011000101111',H:'10001100011000111111100011000110001',
  I:'01110001000010000100001000010001110',J:'00111000100001000010000101001001100',K:'10001100101010011000101001001010001',L:'10000100001000010000100001000011111',
  M:'10001110111010110101100011000110001',N:'10001110011010110011100011000110001',O:'01110100011000110001100011000101110',P:'11110100011000111110100001000010000',
  Q:'01110100011000110001101011001001101',R:'11110100011000111110101001001010001',S:'01111100001000001110000010000111110',T:'11111001000010000100001000010000100',
  U:'10001100011000110001100011000101110',V:'10001100011000110001100010101000100',W:'10001100011000110101101011101110001',X:'10001100010101000100010101000110001',
  Y:'10001100010101000100001000010000100',Z:'11111000010001000100010001000011111',
  0:'01110100011001110101110011000101110',1:'00100011000010000100001000010001110',2:'01110100010000100110010001000011111',3:'11110000010000101110000010000111110',
  4:'00010001100101010010111110001000010',5:'11111100001111000001000011000101110',6:'00110010001000011110100011000101110',7:'11111000010001000100010000100001000',
  8:'01110100011000101110100011000101110',9:'01110100011000101111000010001001100','!':'00100001000010000100001000000000100','¡':'00100000000010000100001000010000100',
  '?':'01110100010000100010001000000000100','-':'00000000000000011111000000000000000','·':'00000000000010001110001000000000000','.':'00000000000000000000000000000000100'};
const JE_ACENTO={Á:'A',É:'E',Í:'I',Ó:'O',Ú:'U',Ñ:'N'};
const JE_CACHE=new Map();
function JE_lienzo(s,col){
  const k=s+'|'+col;let c=JE_CACHE.get(k);if(c)return c;
  const chars=[...s.toUpperCase()],w=chars.reduce((a,ch)=>a+(ch===' '?4:6),0)+2;
  c=document.createElement('canvas');c.width=w;c.height=11;const g=c.getContext('2d'),px=[];
  let x=1;for(const ch of chars){if(ch===' '){x+=4;continue;}const base=JE_ACENTO[ch]||ch,b=JE_F[base];
    if(b){for(let i=0;i<35;i++)if(b[i]==='1')px.push([x+i%5,3+Math.floor(i/5)]);
      if(JE_ACENTO[ch])ch==='Ñ'?px.push([x+1,1],[x+2,1],[x+3,1]):px.push([x+2,1],[x+3,0]);}
    x+=6;}
  g.fillStyle='#120c18';for(const[a,b]of px)g.fillRect(a-1,b-1,3,3);g.fillStyle=col;for(const[a,b]of px)g.fillRect(a,b,1,1);
  if(JE_CACHE.size>40)JE_CACHE.clear();JE_CACHE.set(k,c);return c;
}
const JE={e:null,t:0,ref:null,vis:false};
// línea del villano (notas/guion/mision-N.md, "Entrada del villano"): hasta 2 renglones, '/' separa. Por misión; el
// jefe chico de M10 tiene la suya; EL CUSTODIO cambia si jugás con TUERCA.
const JE_FRASE=['¡CHATARRA, / A CASA!','¡TODO SE FUNDE / Y SE VENDE!','¡ÑAAAM!','¡EL TIEMPO / ES MÍO!','¡APAGUEN / TODO!',
  'SU PRECIO: / CERO.','¡CHSSSS!','¡BRRRUUUM!','¡NO SE TOCAN / MIS COSAS!','…LADRONES.'];
const JE_FRASE_MINI={9:'¡LOS LLEVO / A TODOS!'};
function JE_frase(b){
  const i=typeof levelIdx==='number'?levelIdx:0;
  // primero de textos.js (TX.historia.misiones[i]: entrada, entradaTuerca, tatuEntrada para el jefe chico de M10), con
  // '\n' entre renglones; si falta, la frase de acá (Guion, codigo-m1.md C: la fuente no tiene "…")
  try{const m=TX.historia.misiones[i];if(m){
    const tuerca=typeof players!=='undefined'&&players.some(p=>typeof CHARS!=='undefined'&&CHARS[p.ci]&&CHARS[p.ci].name==='TUERCA');
    const f=b.mini?m.tatuEntrada:(tuerca&&m.entradaTuerca)||m.entrada;if(f)return f.replace(/\n/g,' / ');}}catch(e){}
  if(b.mini)return JE_FRASE_MINI[i]||null;
  if(i===9&&typeof players!=='undefined'&&players.some(p=>typeof CHARS!=='undefined'&&CHARS[p.ci]&&CHARS[p.ci].name==='TUERCA'))return '¿…TUERCA? / ¿CON ELLOS?';
  return JE_FRASE[i]||null;
}
const JE_DUR=120,JE_red=()=>typeof MOV_reducido==='function'&&MOV_reducido();
const JE_calida=()=>{try{const l=typeof LUZ_luz==='function'&&LUZ_luz();if(l&&l.calida)return l.calida;}catch(e){}return '#ffb46a';};
const JE_visible=b=>b&&!b.gone&&onScreen(b,-8)&&b.y+b.h>camY+20&&b.y<camY+VH;
ON_START.push(()=>{JE.e=null;JE.ref=null;});
ON_STEP.push(()=>{
  if(typeof bossRef==='undefined')return;
  if(bossRef&&bossRef!==JE.ref&&JE_visible(bossRef)){JE.ref=bossRef;const b=bossRef;
    const fr=JE_frase(b);
    JE.e={b,t:0,nombre:String(b.name||(typeof bossName==='function'?bossName():'')||'').toUpperCase(),
      lineas:fr?fr.split('/').map(x=>x.trim()).slice(0,2):[b.guardian?'GUARDIÁN DEL MUNDO '+b.guardian:b.mini?'¡CUIDADO!':'EL JEFE']};}
  if(!bossRef)JE.ref=null;
  const e=JE.e;if(!e)return;e.t++;
  // cualquier tecla, clic o toque la saltea (si no es al toque de aparecer)
  if(e.t>12&&e.t<JE_DUR-12){const algo=Object.values(pressed).some(Boolean)||(typeof pressed2!=='undefined'&&Object.values(pressed2).some(Boolean));if(algo)e.t=JE_DUR-12;}
  if(e.t>JE_DUR||e.b.gone)JE.e=null;
});
// cuánto está puesta (0..1): entra en 8 cuadros y sale en 12
const JE_k=e=>Math.max(0,Math.min(1,e.t/8,(JE_DUR-e.t)/12));
// en el mundo: la escena baja 30 % salvo el jefe, que recibe un halo cálido fuerte
function JE_mundo(){
  const e=JE.e;if(!e||typeof state==='undefined'||state!=='play')return;const k=JE_k(e),b=e.b;if(k<=0)return;
  const cx=typeof camX==='number'?camX:0,vw=typeof VW==='number'?VW:W,vh=(typeof camY==='number'?camY:0)+(typeof VH==='number'?VH:H);
  const x0=Math.round(b.x)-2,y0=Math.round(b.y)-2,x1=Math.round(b.x+b.w)+2,y1=Math.round(b.y+b.h)+2;
  ctx.fillStyle=`rgba(10,8,20,${(0.3*k).toFixed(3)})`;
  ctx.fillRect(cx-10,-300,x0-(cx-10),vh+600);ctx.fillRect(x1,-300,cx+vw+10-x1,vh+600);   // izquierda y derecha del jefe
  ctx.fillRect(x0,-300,x1-x0,y0+300);ctx.fillRect(x0,y1,x1-x0,vh+300-y1);               // arriba y abajo del jefe
  if(typeof LUZ_halo==='function')LUZ_halo(b.x+b.w/2,b.y+b.h/2,Math.min(60,Math.max(b.w,b.h)*1.1),JE_calida(),(JE_red()?0.15:0.25)*k); // como mucho 25 %: el jefe se destaca por el −30 % del resto, no por quedar blanco
}
// en pantalla: bandas, nombre y línea del villano (antes del HUD). Arriba al centro, debajo de la barra del jefe
// (y 34 a 52 del juego), lejos del jugador, que casi siempre está abajo a la izquierda.
function JE_pantalla(){
  const e=JE.e;if(!e||typeof state==='undefined'||state!=='play')return;const red=JE_red(),k=JE_k(e);if(k<=0)return;
  const HCv=typeof HC==='number'?HC:H,banda=Math.round(10*(red?1:k));
  ctx.save();if(red)ctx.globalAlpha=k;
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,banda);ctx.fillRect(0,HCv-banda,W,banda);
  const col=JE_calida(),img=JE_lienzo(e.nombre,'#f4eee0'),y=33,xc=Math.round(W/2-img.width/2);
  // el nombre desliza desde la izquierda hasta el centro en 14 cuadros (sin desliz con MOVIMIENTO REDUCIDO)
  const ent=red?1:Math.min(1,e.t/14),xn=Math.round(xc-(1-ent)*(xc+img.width+10));
  ctx.drawImage(img,xn,y);
  const lw=Math.round((img.width+16)*ent),lx=Math.round(W/2-lw/2);
  ctx.fillStyle='#120c18';ctx.fillRect(lx-1,y+11,lw+2,3);ctx.fillStyle=col;ctx.fillRect(lx,y+12,lw,1);
  if(typeof pfTxt==='function'&&ent>=1)e.lineas.forEach((t,i)=>pfTxt(t,W/2,y+15+i*7,col,'center','#120c18'));
  ctx.restore();
}
// ganchos: el oscurecido va encima del mundo (después del primer plano, antes de balas); bandas y nombre, antes del HUD
if(typeof drawForeground==='function'){const JE_fg0=drawForeground;drawForeground=function(){const r=JE_fg0.apply(this,arguments);try{JE_mundo();}catch(e){}return r;};}
if(typeof drawHUD==='function'){const JE_hud0=drawHUD;drawHUD=function(){try{if(typeof LUZ_halosDibujar==='function')LUZ_halosDibujar();JE_pantalla();}catch(e){}return JE_hud0.apply(this,arguments);};}
