'use strict';
// Óxido · Siluetas de los enemigos de cada lugar (va DESPUÉS de pieles.js)
// pieles.js les cambia los colores, el dron, lo que tira el granadero, la muerte y el sonido. Esto les cambia la FORMA
// al soldado, al granadero y al del escudo: cabeza (casco, gorro, capucha, escafandra…) y torso. Mismo tamaño de
// dibujo (7 filas de cabeza + 5 de torso, como HEAD y TORSO de sprites.js), así que la caja de golpe, las piernas y
// todo lo que se dibuja encima (arma, brazo, chapa del escudo, linterna) quedan en el mismo lugar.
// Cómo se engancha, sin tocar pieles.js: antes de que pieles.js arme los sprites de la misión (ON_START), deja armados
// en PI_CACHE[misión] los de este archivo; pieles.js los toma de ahí. Y envuelve drawSoldier solo para que el destello
// blanco del golpe tenga la misma silueta (si no, por un cuadro se vería el casco de siempre).
// Prefijo PA_.
// Letras de las filas: las de sprites.js (k contorno, h/H casco, s/S cara, e ojo, r cuello, v/V torso, p/P pantalón,
// b bota, m barba, z metal claro) + las de cada forma (pal).
const PA_FORMAS={
  0:{ // Zona Óxido · chatarrero: casco de olla con el mango para atrás, antiparras en la frente, chaleco remendado
    head:["....kkkkkk....","...kHHhhggk...","kkkhhhhhhhhk..","..kkkkkkkkkkk.","...ksssssesk..","...ksssssssk..","....kSSSSSk..."],
    torso:["...krrrrrrrk..","..kvvnnVvvvvk.","..kvvnnVvvvvk.","..kvvvvVvvzvk.","..kVVVVVVVVVk."],
    pal:{n:'#a0522d',g:'#9ad0ff'}},
  1:{ // Puerto Ceniza · estibador: gorro de lana con doblez, barba, pechera con tiradores
    head:["..............","....kkkkkk....","...khhhhhhk...","..kHHHHHHHHk..","...ksssssesk..","...ksssssssk..","....kmmmmmk..."],
    torso:["...krrrrrrrk..","..kvpvvVvvpvk.","..kvpvvVvvpvk.","..kvppppppppk.","..kPPPPPPPPPk."]},
  2:{ // Pantano · traje de goma: capucha cerrada, visor oscuro con el ojo que brilla y el filtro adelante
    head:["....kkkkkk....","...khHHhhhk...","..khhhhhhhhk..","..khhhkkkkkk..","..khhksssesk..","..khhkkkkkkSk.","...khhhhhhkk.."],
    torso:["...khhhhhhhk..","..kvvvvVvvvvk.","..kvvvvVvvvvk.","..kbbbbbbbbbk.","..kVVVVVVVVVk."]},
  3:{ // Arenas del Rey · nómada: turbante con la tela que cae atrás y la cara tapada, solo los ojos
    head:["....kkkkkk....","...kHHHHHHk...","..kHhhhhhhhk..",".khhhhkkkkkk..","khhhhksssesk..","khhhhhhhhhhk..",".kkkhhhhhhk..."],
    torso:["...khhhhhhhk..","..kvvvvrvvvvk.","..kvvvrvvvvvk.","..kvvrvvvvvvk.","..kVVVVVVVVVk."]},
  4:{ // Ciudad sin luna · con linterna: gorra con visera larga, cuello del sobretodo levantado, botones
    head:["..............","....kkkkkk....","...kHHHHhhk...","..khhhhhhhhkkk","...ksssssesk..","...ksssssssk..","...krrSSSSrk.."],
    torso:["..krrrrrrrrk..","..kvvvzVvvvvk.","..kvvvzVvvvvk.","..kvvvzVvvvvk.","..kVVVVVVVVVk."]},
  5:{ // Ciudad de datos · holograma: cabeza en bloque con antena y una banda de luz en vez de cara, torso en grilla
    head:[".....kk.......","....kHHkkk....","...kHhhhhhk...","..khhhhhhhhk..","..khheeeeeek..","..khhhhhhhhk..","...kkkkkkkk..."],
    torso:["...kHHHHHHHk..","..kvHvvHvvHvk.","..kHHHHHHHHHk.","..kvHvvHvvHvk.","..kVVVVVVVVVk."]},
  6:{ // Nave a la deriva · casco espacial: escafandra redonda con reflejo, aro en el cuello, caja de mandos en el pecho
    head:["....kkkkkk....","...kggggggk...","..kgggggggwk..","..kgsssssegk..","..kgsssssssk..","..kggggggggk..","..kHHHHHHHHk.."],
    torso:["...kHHHHHHHk..","..kvvvvVvvvvk.","..kvvrrrvvvvk.","..kvvrrrvvvvk.","..kVVVVVVVVVk."],
    pal:{g:'#9ad0ff',w:'#ffffff',s:'#d8a080',S:'#b07850'}},
  7:{ // Valle del Trueno · explorador: casco de safari de ala ancha, camisa con bolsillo y correa cruzada
    head:["..............",".....kkkkk....","....kHHhhhk...","..kkhhhhhhhkk.",".kkkkkkkkkkkkk","...ksssssesk..","....kSSSSSk..."],
    torso:["...krrrrrrrk..","..kvvbvVvvvvk.","..kvvvbVvzvvk.","..kvvvvbvvvvk.","..kVVVVVbVVVk."],
    pal:{h:'#cbb98a',H:'#e8dcae'}},
  8:{ // Ciudad embrujada · soldado fantasma: casco viejo, ojos huecos, mandíbula de dientes y el saco deshilachado
    head:["....kkkkkk....","...kHHhhhhk...","..khhhhhhhhk..",".kkkkkkkkkkkk.","...ksssksksk..","...ksssssssk..","....ksksksk..."],
    torso:["...krrrrrrrk..","..kvvvvVvvvvk.","..kvvvvVvvvvk.","..kvvvvVvvvvk.","..kVkVVkVVkVk."]},
  9:{ // Templo perdido · guardián: tocado de plumas de piedra con banda de oro, pechera con placas
    head:["...k.kk.k.....","..kHkHHkHk....","..kHHHHHHHHk..","..khhhhhhhhhk.","...ksssssesk..","...ksssssssk..","....kSSSSSk..."],
    torso:["...kHHHHHHHk..","..kvHvvVvvHvk.","..kvvvvVvvvvk.","..kvvvvVvvvvk.","..kVHVVHVVHVk."]}};
// el granadero lleva además un morral colgado a la cintura (dos píxeles de bolsa sobre la fila 3 del torso)
const PA_morral=t=>t.map((f,j)=>j===3?f.slice(0,9)+'bb'+f.slice(11):f);
// paleta blanca del destello con todas las letras que usa una forma
function PA_blanca(f){const p={};for(const r of [...f.head,...f.torso,...PA_morral(f.torso)])for(const ch of r)if(ch!=='.')p[ch]='#ffffff';
  for(const ch of 'khHsSercyvVpPbg')p[ch]='#ffffff';return p;}
const PA_HECHO={},PA_W={};
// arma (una vez) los sprites de la misión i y los deja donde pieles.js los busca
function PA_armar(i){
  if(PA_HECHO[i]||typeof PI_CACHE==='undefined')return;PA_HECHO[i]=true;
  const f=PA_FORMAS[i],p=typeof PIELES!=='undefined'&&PIELES[i];if(!f||!p)return;
  try{
    const e={...PAL_E,...(p.pal||{}),...(f.pal||{})};
    const g=p.g?{...e,...p.g}:{...e,h:PAL_G.h,H:PAL_G.H,v:PAL_G.v,V:PAL_G.V,...(f.pal||{})};
    const sh=p.sh?{...e,...p.sh}:{...e,h:PAL_SH.h,H:PAL_SH.H,v:PAL_SH.v,V:PAL_SH.V,p:PAL_SH.p,P:PAL_SH.P,...(f.pal||{})};
    PI_CACHE[i]={e:build(e,f.head,f.torso),g:build(g,f.head,PA_morral(f.torso)),sh:build(sh,f.head,f.torso)};
    PA_W[i]=build(PA_blanca(f),f.head,f.torso);
  }catch(err){console.error('pieles-arte',err);}
}
// va primero en ON_START, así pieles.js ya encuentra los sprites armados
ON_START.unshift(()=>{try{PA_armar(levelIdx);}catch(err){}});
{const PA_drawSoldier0=drawSoldier;
drawSoldier=function(e){
  const w=e.flash&&PA_W[levelIdx];if(!w)return PA_drawSoldier0(e);
  const viejo=SPR.w;SPR.w=w;try{PA_drawSoldier0(e);}finally{SPR.w=viejo;}
};}
// M10 · el granadero tira máscaras de barro que giran en el aire, no ídolos dorados (pedido de Dirección: que no se
// parezca a nada conocido, App Store 5.2). Distintas de la máscara de piedra del dron: chicas, de barro cocido.
const PA_mascara=b=>{
  const f=(T>>2)%4,w=f===0?5:f===2?4:3,x=q(b.x-w/2),y=q(b.y-3);
  ctx.fillStyle=AV_TINTA_PA;ctx.fillRect(x-0.5,y-0.5,w+1,7);
  ctx.fillStyle=f===2?'#8a4a28':'#b86a3a';ctx.fillRect(x,y,w,6);
  ctx.fillStyle=f===2?'#a05a30':'#e09a5a';ctx.fillRect(x,y,w,1);
  if(f===0){ctx.fillStyle='#2a1810';ctx.fillRect(x+1,y+2,1,1);ctx.fillRect(x+3,y+2,1,1);ctx.fillRect(x+1.5,y+4,2,1);}
  else if(f!==2){ctx.fillStyle='#2a1810';ctx.fillRect(x+(f===1?1:1),y+2,1,1);}
};
const AV_TINTA_PA='#120c18';
if(typeof PI_GRAN!=='undefined')PI_GRAN[9]=PA_mascara;
if(typeof PIELES!=='undefined'&&PIELES[9])PIELES[9].gran='Tira máscaras de barro';
