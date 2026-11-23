'use strict';
// Óxido · Enemigos propios de cada lugar ("pieles")
// El soldado, el dron, el granadero y el escudo se "visten" según la misión: hacen lo mismo y tienen la misma caja de
// golpe; cambian el dibujo, lo que tira el granadero, la chapa del escudo, el sonido y cómo mueren.
// Un mapa por misión (PIELES[índice de misión]); la misión 1 queda como siempre. Al empezar cada misión se arman los
// sprites (SPR.e, SPR.g y SPR.sh pasan a ser los de ese lugar) y el resto del juego los usa sin saberlo.
// Prefijo PI_.
const PI_BASE={e:SPR.e,g:SPR.g,sh:SPR.sh};
// paletas: sobre la del soldado de siempre (PAL_E). g y sh: lo que cambia para el granadero y el del escudo.
// chapa: colores del escudo (borde, frente, franja). muerte: color de lo que salta y sonido.
const PIELES=[
  {nombre:'Zona Óxido',sold:'Chatarrero',dron:'Dron oxidado',gran:'Tira tuercas',esc:'Puerta de auto'},
  {nombre:'Puerto Ceniza',sold:'Estibador',dron:'Gaviota mecánica',gran:'Tira barriles',esc:'Tapa de contenedor',
    pal:{h:'#2a3a5a',H:'#4a5e86',s:'#c98a5e',S:'#9a6440',e:'#1a1a1a',r:'#e0703a',v:'#e0703a',V:'#b04a20',p:'#3a4a5a',P:'#2a3442',b:'#2a2019'},
    g:{v:'#5a7a3a',V:'#3e5a28'},sh:{v:'#6a7480',V:'#4a525c'},chapa:['#1a2a3a','#3a6a8a','#d9a43a'],muerte:['#cfd6e0','#e0703a'],son:'graznido'},
  {nombre:'Pantano',sold:'Traje de goma',dron:'Libélula mutante',gran:'Tira frascos de barro',esc:'Tapa de tronco',
    pal:{h:'#c8b82a',H:'#f0e060',s:'#3a4a3a',S:'#2a3a2a',e:'#a6f05a',r:'#3a4a3a',v:'#c8b82a',V:'#9a8a1a',p:'#c8b82a',P:'#9a8a1a',b:'#2a2a2a'},
    g:{v:'#7a9a2a',V:'#5a7a1a'},sh:{v:'#8a8a3a',V:'#6a6a28'},chapa:['#2a1e10','#6a4a2a','#4a7a2a'],muerte:['#7ad040','#3a5a20'],son:'chapoteo'},
  {nombre:'Arenas del Rey',sold:'Nómada de arena',dron:'Dron momia',gran:'Tira vasijas',esc:'Lápida tallada',
    pal:{h:'#c8a878',H:'#e8d0a0',s:'#8a6a4a',S:'#6a4a32',e:'#1a1a1a',r:'#7a2a2a',v:'#b08a5a',V:'#8a6a3a',p:'#a8885a',P:'#806640',b:'#5a4a3a'},
    g:{v:'#8a4a2a',V:'#6a3218'},sh:{v:'#9a8a6a',V:'#7a6a4a'},chapa:['#3a2e1e','#b8a070','#7a2a2a'],muerte:['#e8d0a0','#c8a878'],son:'arena'},
  {nombre:'Ciudad sin luna',sold:'Con linterna',dron:'Gárgola a hélice',gran:'Tira bengalas',esc:'Cartel de calle',
    pal:{h:'#2a2a34',H:'#4a4a58',s:'#8a7a6a',S:'#6a5a4a',e:'#ffe066',r:'#4a4a58',v:'#3a3a48',V:'#2a2a36',p:'#2a2a34',P:'#1e1e26',b:'#141418'},
    g:{v:'#5a2a3a',V:'#3e1e28'},sh:{v:'#4a4a5a',V:'#34343e'},chapa:['#141418','#2a6a3a','#e8e8e8'],muerte:['#ffe066','#4a4a58'],son:'golpe',linterna:true},
  {nombre:'Ciudad de datos',sold:'Holograma',dron:'Cubo de píxeles',gran:'Tira bombas de código',esc:'Pantalla de luz',
    pal:{h:'#2a8ad0',H:'#aef4ff',s:'#5ac8f0',S:'#2a8ad0',e:'#ffffff',r:'#3ad8ff',v:'#2a9ad8',V:'#1a6aa8',p:'#2276b8',P:'#164a86',b:'#aef4ff'},
    g:{v:'#9a4ad8',V:'#6a2aa8'},sh:{v:'#2ad8a8',V:'#1aa880'},chapa:['#0c1640','#3ad8ff','#ffffff'],muerte:['#3ad8ff','#aef4ff'],son:'bip',alfa:0.8},
  {nombre:'Nave a la deriva',sold:'Casco espacial',dron:'Sonda de limpieza',gran:'Tira cápsulas',esc:'Compuerta',
    pal:{h:'#e8eef4',H:'#ffffff',s:'#9ad0ff',S:'#6aa6d8',e:'#ffffff',r:'#e07a2c',v:'#dfe6ee',V:'#a8b4c4',p:'#c8d0da',P:'#9aa4b2',b:'#5a6470'},
    g:{v:'#e0a02c',V:'#b07a1a'},sh:{v:'#a8b4c4',V:'#7a8696'},chapa:['#2a3240','#c8d0da','#e07a2c'],muerte:['#ffffff','#9ad0ff'],son:'sopla'},
  {nombre:'Valle del Trueno',sold:'Explorador',dron:'Lagarto volador',gran:'Tira huevos de piedra',esc:'Caparazón',
    pal:{h:'#8a7a4a',H:'#b0a070',s:'#c98a5e',S:'#9a6440',e:'#1a1a1a',r:'#6a5a3a',v:'#8a8a5a',V:'#6a6a40',p:'#7a6a4a',P:'#5a4a32',b:'#4a3a2a'},
    g:{v:'#6a4a2a',V:'#4a3218'},sh:{v:'#7a7a5a',V:'#5a5a40'},chapa:['#2a2a18','#6a7a3a','#c8c070'],muerte:['#9a8a6a','#6a7a3a'],son:'rugido'},
  {nombre:'Ciudad embrujada',sold:'Soldado fantasma',dron:'Calabaza voladora',gran:'Tira velas',esc:'Tapa de ataúd',
    pal:{h:'#b8a8d8',H:'#e0d8f4',s:'#d8d0ec',S:'#b0a4d0',e:'#3a2a5a',r:'#9888b8',v:'#a898c8',V:'#8878a8',p:'#9888b8',P:'#786898',b:'#685888'},
    g:{v:'#7a5a9a',V:'#5a3e7a'},sh:{v:'#8a7aa8',V:'#6a5a88'},chapa:['#1e1428','#4a2e3a','#b9a3d8'],muerte:['#e0d8f4','#b9a3d8'],son:'uuh',alfa:0.82,flota:true},
  {nombre:'Templo perdido',sold:'Guardián del templo',dron:'Máscara de piedra',gran:'Tira ídolos',esc:'Escudo de piedra',
    pal:{h:'#8a7a5a',H:'#c8a84a',s:'#7a6a50',S:'#5a4a38',e:'#ffd84a',r:'#c8a84a',v:'#9a8a6a',V:'#7a6a4a',p:'#6a5a40',P:'#4a3e2c',b:'#3a3024'},
    g:{v:'#7a5a2a',V:'#5a4018'},sh:{v:'#8a8070',V:'#6a6050'},chapa:['#2a2418','#8a8070','#e8b84a'],muerte:['#c8b890','#e8b84a'],son:'piedra'}];
const PI_CACHE={};
const piel=()=>PIELES[levelIdx]||PIELES[0];
function PI_sets(i){
  if(PI_CACHE[i])return PI_CACHE[i];
  const p=PIELES[i];if(!p||!p.pal)return PI_CACHE[i]=PI_BASE;
  const e={...PAL_E,...p.pal};
  return PI_CACHE[i]={e:build(e),g:build({...e,...p.g}),sh:build({...e,...p.sh})};
}
ON_START.push(()=>{const s=PI_sets(levelIdx);SPR.e=s.e;SPR.g=s.g;SPR.sh=s.sh;});

// ---------- dibujo encima del soldado: chapa del escudo, linterna, transparencia ----------
const PI_drawSoldier0=drawSoldier;
drawSoldier=function(e){
  const p=piel();
  // hologramas (M6) y fantasmas (M9): opacos, para que el contorno sea tinta #17141f (con transparencia la tinta se
  // mezclaba con la bruma y el borde no llegaba a 3:1). Lo de holograma queda en un salto de 1 px cada tanto (quieto
  // con MOVIMIENTO REDUCIDO); los fantasmas siguen flotando.
  const PI_red=typeof MOV_reducido==='function'&&MOV_reducido();
  if(p.alfa||p.flota){ctx.save();if(p.alfa&&!p.flota&&!PI_red&&((T+(e.ph|0)*7)%110)<2)ctx.translate(((T>>0)%2)?1:-1,0);if(p.flota)ctx.translate(0,Math.round(Math.sin((T+e.ph)/14)*0.8)-1);}
  PI_drawSoldier0(e);
  if(p.alfa||p.flota)ctx.restore();
  if(e.flash)return;
  // chapa del escudo de este lugar (mismo lugar y tamaño que la de siempre)
  if(p.chapa&&e.type==='shield'&&e.shp>0){const pose=rigPose(e,e.ph),y=e.y+pose.uy,sx=(e.face>0?e.x+7:e.x-2.5)+pose.ux,[k1,k2,k3]=p.chapa;
    ctx.fillStyle=k1;ctx.fillRect(q(sx-0.5),q(y+3.5),4.5,15);ctx.fillStyle=e.sflash?'#e8f6ff':k2;ctx.fillRect(q(sx),q(y+4),3.5,14);
    ctx.fillStyle=k3;ctx.fillRect(q(sx),q(y+9),3.5,1.2);ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillRect(q(sx),q(y+4),1,14);
    if(e.shp<=4){ctx.fillStyle=k1;ctx.fillRect(q(sx+1),q(y+6),0.8,5);ctx.fillRect(q(sx+1.8),q(y+11),0.8,4);}}
  // linterna en la frente: foco de píxeles (3 × 3, centro claro, con tinta) con halo, y un cono de luz chico en escalones
  // de 3 px que suma luz (sin bordes suaves). En la pasada de tinta de arte-luz el cono no se dibuja (es transparente).
  if(p.linterna&&!e.dying){const pose=rigPose(e,e.ph),cx=Math.round(e.x+4+pose.ux),y=Math.round(e.y+pose.uy),f=e.face,lx=f>0?cx+2:cx-4,ly=y+1,cy=ly+1;
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,230,120,0.10)';
    for(let i=0;i<8;i++){const h=3+i*2,x=f>0?lx+3+i*3:lx-3*(i+1);ctx.fillRect(x,cy-(h>>1),3,h);}
    ctx.restore();
    ctx.fillStyle='#120c18';ctx.fillRect(lx-1,ly,5,3);ctx.fillRect(lx,ly-1,3,5);
    ctx.fillStyle='#ffe066';ctx.fillRect(lx,ly,3,3);ctx.fillStyle='#fff8d0';ctx.fillRect(lx+1,ly+1,1,1);
    if(!Object.prototype.hasOwnProperty.call(ctx,'fillRect')&&typeof LUZ_halo==='function')LUZ_halo(lx+1.5,ly+1.5,9,'#ffe8a0',0.4);}
};

// ---------- drones de cada lugar (16 × 9, el mismo lugar en pantalla) ----------
const PI_DRON={
  1:(e,x,y,w)=>{ // gaviota mecánica
    const al=(T>>3)%2?-3:2;ctx.fillStyle=w?'#fff':'#8a96a4';ctx.beginPath();ctx.moveTo(x+5,y+4);ctx.lineTo(x-1,y+4+al);ctx.lineTo(x+6,y+6);ctx.fill();
    ctx.beginPath();ctx.moveTo(x+11,y+4);ctx.lineTo(x+17,y+4+al);ctx.lineTo(x+10,y+6);ctx.fill();
    ctx.fillStyle=w?'#fff':'#e8ecf0';ctx.fillRect(x+3,y+3,10,5);ctx.fillStyle=w?'#fff':'#5a6470';ctx.fillRect(x+3,y+3,10,1);
    ctx.fillStyle='#e0a02c';ctx.fillRect(x+(e.face>0?13:1),y+5,2,1.5);ctx.fillStyle='#ff3b30';ctx.fillRect(x+(e.face>0?11:4),y+4,1.2,1.2);
    ctx.fillStyle='#3a4450';ctx.fillRect(x+6,y+8,1,1.5);ctx.fillRect(x+9,y+8,1,1.5);},
  2:(e,x,y,w)=>{ // libélula mutante
    const al=(T>>1)%2;ctx.fillStyle='rgba(200,255,200,0.45)';ctx.fillRect(x+2,y+1-al,6,2);ctx.fillRect(x+8,y+1-al,6,2);ctx.fillRect(x+3,y+3+al,5,1.5);ctx.fillRect(x+8,y+3+al,5,1.5);
    ctx.fillStyle=w?'#fff':'#4a8a2a';ctx.fillRect(x+1,y+4,14,2);ctx.fillStyle=w?'#fff':'#7ad040';ctx.fillRect(x+3,y+4,10,1);
    ctx.fillStyle='#a6f05a';ctx.fillRect(x+(e.face>0?13:1),y+3,2,2);ctx.fillStyle='#ff3b30';ctx.fillRect(x+(e.face>0?14:1),y+3.5,1,1);},
  3:(e,x,y,w)=>{ // dron momia: cuerpo sólido vendado (dos pliegues), ojo rojo bien visible y una venda que cuelga
    PI_dronBase(x,y,w,e);ctx.fillStyle=w?'#fff':'#c8b080';ctx.fillRect(x+3,y+2,10,7);ctx.fillRect(x+2,y+3,12,5);
    ctx.fillStyle=w?'#fff':'#e8dcb8';ctx.fillRect(x+3,y+2,10,1);
    ctx.fillStyle=w?'#fff':'#8a7448';ctx.fillRect(x+3,y+4,10,1);ctx.fillRect(x+3,y+7,10,1);
    ctx.fillStyle='#1a1a20';ctx.fillRect(x+6,y+4,4,3);ctx.fillStyle='#ff3b30';ctx.fillRect(x+7,y+5,2,1);ctx.fillStyle='#ffb0a0';ctx.fillRect(x+7,y+5,1,1);
    const s=Math.round(Math.sin(T/6)*1.5);ctx.fillStyle=w?'#fff':'#c8b080';ctx.fillRect(x+(e.face>0?1:13),y+8+s,2,2);},
  4:(e,x,y,w)=>{ // gárgola a hélice
    const rw=(T>>1)%2?7:3;ctx.fillStyle='rgba(225,225,235,0.75)';ctx.fillRect(x+8-rw/2,y-1,rw,1);ctx.fillStyle='#2a2a30';ctx.fillRect(x+7.5,y-0.5,1,2);
    ctx.fillStyle=w?'#fff':'#6a6a72';ctx.fillRect(x+3,y+2,10,6);ctx.fillRect(x+1,y+3,2,3);ctx.fillRect(x+13,y+3,2,3);
    ctx.fillStyle=w?'#fff':'#8a8a92';ctx.fillRect(x+4,y+1,1.5,2);ctx.fillRect(x+10.5,y+1,1.5,2);
    ctx.fillStyle='#ffe066';ctx.fillRect(x+5,y+4,1.5,1.2);ctx.fillRect(x+9.5,y+4,1.5,1.2);ctx.fillStyle='#2a2a30';ctx.fillRect(x+6,y+6,4,1);},
  5:(e,x,y,w)=>{ // cubo de píxeles
    ctx.fillStyle=w?'#fff':'#164a86';ctx.fillRect(x+3,y,10,9);ctx.fillStyle=w?'#fff':'#2a9ad8';ctx.fillRect(x+4,y+1,8,7);
    for(let i=0;i<5;i++){const h=hash(i*7+(T>>3));ctx.fillStyle=h<0.5?'#aef4ff':'#3ad8ff';ctx.fillRect(x+4+Math.floor(h*7),y+1+Math.floor(hash(i*3+(T>>3))*6),1,1);}
    ctx.fillStyle='#ffffff';ctx.fillRect(x+7,y+4,2,2);},
  6:(e,x,y,w)=>{ // sonda de limpieza
    ctx.fillStyle=w?'#fff':'#c8d0da';circle(x+8,y+4.5,4.5);ctx.fillStyle=w?'#fff':'#9aa4b2';ctx.fillRect(x+4,y+6,8,1.5);
    ctx.fillStyle='#3ad8ff';circle(x+8,y+4,1.5);ctx.fillStyle='#5a6470';ctx.fillRect(x+1,y+5,3,1);ctx.fillRect(x+12,y+5,3,1);
    const b=(T>>2)%2;ctx.fillStyle='#e0a02c';ctx.fillRect(x+(b?0:1),y+6,2,2);ctx.fillRect(x+(b?14:13),y+6,2,2);},
  7:(e,x,y,w)=>{ // lagarto volador
    const al=(T>>3)%2?-3:2;ctx.fillStyle=w?'#fff':'#5a7a3a';ctx.beginPath();ctx.moveTo(x+6,y+4);ctx.lineTo(x+2,y+1+al);ctx.lineTo(x+4,y+6);ctx.fill();
    ctx.beginPath();ctx.moveTo(x+10,y+4);ctx.lineTo(x+14,y+1+al);ctx.lineTo(x+12,y+6);ctx.fill();
    ctx.fillStyle=w?'#fff':'#7a9a4a';ctx.fillRect(x+3,y+4,10,3);ctx.fillRect(x+(e.face>0?12:1),y+3,3,2);ctx.fillRect(x+(e.face>0?0:13),y+6,3,1);
    ctx.fillStyle='#ffe066';ctx.fillRect(x+(e.face>0?13:2),y+3,1,1);},
  8:(e,x,y,w)=>{ // calabaza voladora
    ctx.fillStyle='#3a5a2a';ctx.fillRect(x+7.5,y-1,1.5,2);const rw=(T>>1)%2?6:3;ctx.fillStyle='rgba(225,225,235,0.6)';ctx.fillRect(x+8-rw/2,y-1.5,rw,0.8);
    ctx.fillStyle=w?'#fff':'#d8742a';ctx.fillRect(x+2,y+1,12,8);ctx.fillRect(x+3,y,10,9.5);ctx.fillStyle=w?'#fff':'#b85a1a';ctx.fillRect(x+6,y+1,1,8);ctx.fillRect(x+9,y+1,1,8);
    const g=(T>>3)%2?'#ffe066':'#ffb040';ctx.fillStyle=g;ctx.fillRect(x+4,y+3,2,2);ctx.fillRect(x+10,y+3,2,2);ctx.fillRect(x+5,y+6,6,1.5);ctx.fillStyle='#d8742a';ctx.fillRect(x+7,y+6,1,1.5);},
  9:(e,x,y,w)=>{ // máscara de piedra
    ctx.fillStyle=w?'#fff':'#6a6050';ctx.fillRect(x+3,y,10,9);ctx.fillRect(x+2,y+2,12,5);ctx.fillStyle=w?'#fff':'#8a8070';ctx.fillRect(x+4,y+1,8,1);
    ctx.fillStyle='#2a2418';ctx.fillRect(x+4,y+3,3,2);ctx.fillRect(x+9,y+3,3,2);ctx.fillRect(x+6,y+6,4,1.5);
    const g=(T>>2)%2?'#ffd84a':'#e8b84a';ctx.fillStyle=g;ctx.fillRect(x+5,y+3.5,1,1);ctx.fillRect(x+10,y+3.5,1,1);
    ctx.fillStyle='#e8b84a';ctx.fillRect(x+7,y-1,2,1.5);}};
function PI_dronBase(x,y,w,e){
  ctx.fillStyle='#1a1a20';ctx.fillRect(x,y+1,16,1);ctx.fillRect(x+1,y,1,2);ctx.fillRect(x+14,y,1,2);
  const rw=(T>>1)%2?7:3;ctx.fillStyle='rgba(225,225,235,0.75)';ctx.fillRect(x+1.5-rw/2,y-0.5,rw,1);ctx.fillRect(x+14.5-rw/2,y-0.5,rw,1);
  ctx.fillStyle=w?'#fff':'#2f303a';ctx.fillRect(x+2,y+3,12,4);ctx.fillRect(x+4,y+2,8,7);
}
const PI_drawDrone0=drawDrone;
drawDrone=function(e){const f=PI_DRON[levelIdx];if(!f||e.wreck)return PI_drawDrone0(e);
  if(e.face===undefined)e.face=-1;const px=players.length?nearestPlayer(e.x+8,e.y).x:e.x;e.face=px>e.x+8?1:-1;
  f(e,q(e.x),q(e.y),e.flash>0);};

// ---------- lo que tira el granadero ----------
const PI_GRAN={
  0:(b)=>{ctx.fillStyle='#7d8794';ctx.fillRect(q(b.x-2),q(b.y-2),4,4);ctx.fillStyle='#2a2a30';ctx.fillRect(q(b.x-0.7),q(b.y-0.7),1.4,1.4);}, // tuerca
  1:(b)=>{ctx.fillStyle='#6a3a1a';ctx.fillRect(q(b.x-2),q(b.y-2.5),4,5);ctx.fillStyle='#3a2a1a';ctx.fillRect(q(b.x-2),q(b.y-1),4,0.8);ctx.fillRect(q(b.x-2),q(b.y+1),4,0.8);}, // barril
  2:(b)=>{ctx.fillStyle='#5a3a1a';ctx.fillRect(q(b.x-1.5),q(b.y-1),3,3.5);ctx.fillStyle='#7ad040';ctx.fillRect(q(b.x-1.5),q(b.y+0.5),3,2);ctx.fillStyle='#c8b080';ctx.fillRect(q(b.x-0.7),q(b.y-2.5),1.4,1.5);}, // frasco de barro
  3:(b)=>{ctx.fillStyle='#b86a3a';ctx.fillRect(q(b.x-2),q(b.y-1),4,3.5);ctx.fillRect(q(b.x-1),q(b.y-2.5),2,1.5);ctx.fillStyle='#7a2a2a';ctx.fillRect(q(b.x-2),q(b.y),4,0.8);}, // vasija
  4:(b)=>{ctx.fillStyle='#d93a2b';ctx.fillRect(q(b.x-0.8),q(b.y-2.5),1.6,5);if((T>>1)%2){ctx.fillStyle='#ffe066';ctx.fillRect(q(b.x-1.2),q(b.y-3.5),2.4,1.5);}}, // bengala
  5:(b)=>{ctx.fillStyle='#164a86';ctx.fillRect(q(b.x-2),q(b.y-2),4,4);ctx.fillStyle=(T>>2)%2?'#3ad8ff':'#aef4ff';ctx.fillRect(q(b.x-1.5),q(b.y-1),1,1);ctx.fillRect(q(b.x+0.5),q(b.y),1,1);}, // bomba de código
  6:(b)=>{ctx.fillStyle='#e8eef4';ctx.fillRect(q(b.x-2.5),q(b.y-1.2),5,2.4);ctx.fillStyle='#e07a2c';ctx.fillRect(q(b.x-2.5),q(b.y-1.2),1.5,2.4);if((T>>2)%2){ctx.fillStyle='#ff3b30';ctx.fillRect(q(b.x+1.5),q(b.y-0.5),1,1);}}, // cápsula
  7:(b)=>{ctx.fillStyle='#8a8478';circle(b.x,b.y,2.4);ctx.fillStyle='#5a544a';ctx.fillRect(q(b.x-1),q(b.y-0.5),0.8,0.8);ctx.fillRect(q(b.x+0.6),q(b.y+0.6),0.8,0.8);}, // huevo de piedra
  8:(b)=>{ctx.fillStyle='#e8e0d0';ctx.fillRect(q(b.x-1),q(b.y-1.5),2,4);ctx.fillStyle=(T>>1)%2?'#ffe066':'#ff9a3c';ctx.fillRect(q(b.x-0.6),q(b.y-3),1.2,1.5);}, // vela
  9:(b)=>{ctx.fillStyle='#e8b84a';ctx.fillRect(q(b.x-1.5),q(b.y-2),3,4);ctx.fillRect(q(b.x-2),q(b.y-0.5),4,1);ctx.fillStyle='#7a5a2a';ctx.fillRect(q(b.x-0.8),q(b.y-1.2),0.6,0.6);ctx.fillRect(q(b.x+0.3),q(b.y-1.2),0.6,0.6);}}; // ídolo
ON_STEP.push(()=>{const f=PI_GRAN[levelIdx];if(!f)return;for(const b of eproj)if(b.kind==='egren'&&!b.draw)b.draw=f;});

// ---------- muerte y sonido de cada lugar ----------
const PI_SON={
  graznido:()=>{tone('square',900,600,0.08,0.03);later(70,()=>tone('square',700,450,0.08,0.025));},
  chapoteo:()=>{noise(0.18,0.12,900);tone('sine',200,90,0.12,0.04);},
  arena:()=>{noise(0.3,0.1,2400);},
  golpe:()=>{noise(0.08,0.12,600);},
  bip:()=>{tone('square',1200,300,0.12,0.03);later(60,()=>tone('square',1600,1600,0.03,0.02));},
  sopla:()=>{noise(0.25,0.08,3200);tone('sine',500,1200,0.15,0.02);},
  rugido:()=>{tone('sawtooth',160,70,0.2,0.035);},
  uuh:()=>{tone('sine',420,300,0.3,0.03);},
  piedra:()=>{noise(0.15,0.15,400);tone('square',120,60,0.1,0.04);}};
{const kill0=kill;kill=function(e){
  const p=piel(),tipo=e.type,x=e.x+e.w/2,y=e.y+e.h/2;kill0(e);
  if(!p.muerte||!['soldier','grenadier','shield','drone'].includes(tipo))return;
  for(let i=0;i<7;i++)parts.push({k:'p',x,y,vx:rand(-1.6,1.6),vy:rand(-2.6,-0.6),g:0.14,life:rand(18,30),maxl:30,size:i%3?1:1.6,col:p.muerte[i%2]});
  try{(PI_SON[p.son]||(()=>{}))();}catch(err){}
};}

// ---------- vaivén de los soldados al caminar, en cuadros (reemplaza el vaivén rotado de dibujito.js) ----------
// Todos al mismo compás (~2 por segundo): el torso se corre 1 px hacia adelante y vuelve, de a cuadros enteros (nada se
// gira ni se corre medio píxel). Quieto con MOVIMIENTO REDUCIDO. Solo soldados, granaderos y escudos, caminando.
const PI_VAIVEN={soldier:1,grenadier:1,shield:1};
if(typeof rigPose==='function'){const PI_rigPose0=rigPose;rigPose=function(o){
  const r=PI_rigPose0.apply(this,arguments);
  try{if(o&&PI_VAIVEN[o.type]&&!o.dying&&o.onGround&&Math.abs(o.vx||0)>0.05&&!(typeof MOV_reducido==='function'&&MOV_reducido())&&(T/15|0)%2)
    {r.ux=Math.round((r.ux||0)+(o.face<0?-1:1));r.vaiven=true;}}catch(e){} // vaiven: arte-luz arma torso y piernas juntos y les pone la tinta sobre el cuadro ya corrido
  return r;};}
