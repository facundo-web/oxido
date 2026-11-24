'use strict';
// Óxido · Arte del terreno propio de cada misión (va ANTES de terreno.js; terreno.js usa TR_ARTE[tipo](z) si existe).
// Estilo "Hondo": píxeles enteros, tinta completa, nada liso. Prefijo TRA_ (y el objeto TR_ARTE del contrato).
// · M6 · RÍO DE DATOS (cinta): un canal hundido en el piso, con rodillos en las puntas que giran, y paquetes de datos
//   en forma de flecha ›› que corren para donde lleva. Se lee sin texto: las flechas dicen el sentido y la velocidad.
//   Colores de M6: violeta y magenta (el cian queda para P2 y los soldados de M6). Aviso (1 s antes de cambiar): las
//   mismas flechas y rieles pasan a ámbar y titilan entre dos ámbares (con MOVIMIENTO REDUCIDO, ámbar fijo). Con aire > 0: motas de datos que suben y se corren con la cinta, y un
//   brillo tenue en escalones arriba (lo que vuela bajo también es arrastrado).
//   z: {x0, x1, y (superficie del piso), dir (+1 / −1), fase (cuánto corrió), aviso (0/1), aire (px)}
// · M7 · SIN GRAVEDAD (gravedad): zona de todo el alto. Prendida: una tira de luces lilas en el techo (debajo del HUD)
//   con un cono de luz escalonado hacia abajo, postes de borde a los dos lados que marcan dónde empieza y termina, un
//   tinte lila tenue y cosas sueltas que flotan y se hamacan (tornillos, papeles que se dan vuelta de a 90°, gotas).
//   Aviso: luces y postes en ámbar, titilando (fijo con MOVIMIENTO REDUCIDO), y lo que flota tiembla. Apagada: luces
//   apagadas y las mismas cosas tiradas en el piso (se lee "volvió la gravedad").  z: {x0, x1, on, aviso, t}
// · M1 · ACEITE (aceite): charco negro de borde irregular con un brillo de colores en bandas de 3 px que se corre (sin
//   cian), una gota que brilla y un tambor volcado que gotea al lado. Ardiendo: llamas de píxel bajas en todo el ancho
//   (FX_llamas de arte-fx.js) que se achican con lo que le queda. Quemado: mancha de hollín que ya no brilla (y el tambor
//   chamuscado).  z: {x0, x1, y, t, arde (cuadros que le quedan, 240 como mucho), quemado}
// · M5 · VAPOR (vapor): encima de la rejilla de la calle (escenario-m5.js) va una tapa de píxel propia. Quieto: un hilito
//   de vapor de 2 bocanadas chicas. Aviso: las ranuras brillan ámbar y naranja (con halo), la tapa tiembla 1 px y salen
//   bocanadas de 2 px (fijo y sin temblor con MOVIMIENTO REDUCIDO). Chorro: columna blanca gruesa en 3 tonos de píxel,
//   con bordes que se mueven, que crece al salir, se deshace en bocanadas arriba y se afina al terminar; la rejilla al
//   blanco.  z: {cx, y, x0, x1, aire (alto de la columna), est ('quieto' | 'aviso' | 'chorro'), t, AV, CH}
// · M9 · LUZ (luz): el farol de M9 (mision9.js, cabeza en fx+3, piso−43) da una luz cálida: halo escalonado alrededor
//   de la cabeza, cono hacia abajo y un haz en escalones hacia cada plataforma sólida. La plataforma de ectoplasma es
//   verde pálido, con tinta, brillo arriba y gotas que cuelgan. Aviso: el vidrio del farol titila y la plataforma
//   parpadea entre dos verdes. Apagada (o la que no tiene el turno): solo un contorno tenue de rayas de 3 px.
//   z: {fx, on, aviso, plats [{x, y, w0}], turno, cual}
// · M2 · CORRIENTE (corriente): bajo el muelle. Estelas claras gris azuladas (sin cian) de 4–8 px con la punta más
//   clara que corren con la marea a 3 velocidades, burbujas de 2 px que suben y se corren, algas del fondo en tramos de
//   2 px que se inclinan para donde arrastra, y basura suelta (lata, botella) que se va dando vueltas de a 90°. Aviso: las
//   estelas se acortan y pasan a ámbar, y las algas se enderezan.  z: {x0, x1, sup, y (fondo), dir, fase, aviso}
const TRA_red=()=>typeof MOV_reducido==='function'&&MOV_reducido();
const TRA_C={tinta:'#17141f',canal:'#1a1240',borde:'#241a5a',riel:'#4a3a8a',rielL:'#6a5aaa',rod:'#5a4a8a',rodL:'#8a7ac0',eje:'#120c2c',
  dato:'#ff5ad0',datoL:'#ffc0ec',datoD:'#8a2a78',amb:'#ffb43a',ambL:'#ffe0a0',ambD:'#6a4a1a',ambM:'#c07a20',mota:'255,150,230'};
// flecha de 3 × 3 (› mirando a la derecha); se espeja para la izquierda
function TRA_flecha(x,y,dir,c,cl){
  // cabeza clara en la punta, cuerpo en el color: 2 px de grosor para que no sea una línea de 1 px
  const P=[[0,0],[1,0],[1,1],[2,1],[0,2],[1,2]];
  for(const[dx,dy]of P){ctx.fillStyle=dx===2?cl:c;ctx.fillRect(dir>0?x+dx:x+2-dx,y+dy,1,1);}
}
function TRA_rodillo(cx,cy,fase,av){ // disco de píxel de radio 2 con un remache que da la vuelta (4 cuadros)
  ctx.fillStyle=TRA_C.tinta;ctx.fillRect(cx-3,cy-2,7,5);ctx.fillRect(cx-2,cy-3,5,7);
  ctx.fillStyle=TRA_C.rod;ctx.fillRect(cx-2,cy-1,5,3);ctx.fillRect(cx-1,cy-2,3,5);
  ctx.fillStyle=TRA_C.rodL;ctx.fillRect(cx-1,cy-2,2,1);
  const k=((Math.floor(fase/3)%4)+4)%4,p=[[1,-1],[1,1],[-1,1],[-1,-1]][k];
  ctx.fillStyle=av?TRA_C.amb:TRA_C.eje;ctx.fillRect(cx+p[0],cy+p[1],1,1);ctx.fillStyle=TRA_C.eje;ctx.fillRect(cx,cy,1,1);
}
// ---------- M7 · sin gravedad ----------
const TRA_G={luz:'#d8d0ff',luzL:'#ffffff',luzD:'#8a7ac0',off:'#3a3048',riel:'#2a2a34',rielL:'#4a4a58',poste:'#6a5aa0',
  tinte:'168,150,255',cono:'200,190,255',tor:'#8a8e9a',torL:'#c0c4cc',pap:'#e8e0d0',papD:'#a89e8a',gota:'#6a7aa8',gotaL:'#c0c8e8'};
// cosas sueltas (lugar fijo por índice): 0 tornillo 3×1 · 1 papel 3×2 / 2×3 · 2 gota 2×2
function TRA_suelta(tipo,x,y,cuadro){
  ctx.fillStyle=TRA_C.tinta;
  if(tipo===0){ctx.fillRect(x-1,y-1,5,3);ctx.fillStyle=TRA_G.tor;ctx.fillRect(x,y,3,1);ctx.fillStyle=TRA_G.torL;ctx.fillRect(x,y,1,1);}
  else if(tipo===1){const w=cuadro?2:3,h=cuadro?3:2;ctx.fillRect(x-1,y-1,w+2,h+2);ctx.fillStyle=TRA_G.pap;ctx.fillRect(x,y,w,h);ctx.fillStyle=TRA_G.papD;ctx.fillRect(x,y+h-1,w,1);}
  else{ctx.fillRect(x-1,y-1,4,4);ctx.fillStyle=TRA_G.gota;ctx.fillRect(x,y,2,2);ctx.fillStyle=TRA_G.gotaL;ctx.fillRect(x,y,1,1);}
}
function TRA_gravedad(z){
  const x0=Math.round(z.x0),x1=Math.round(z.x1),w=x1-x0,red=TRA_red(),av=!!z.aviso,on=!!z.on,blink=av&&(red||(T>>3)%2===0);
  const cy=typeof camY==='number'?camY:0,zo=typeof ZOOM==='number'?ZOOM:1,top=Math.round(cy+44/zo),piso=GROUND;
  const lit=on||av;
  // tinte de la zona (tenue) y cono de luz escalonado debajo de cada luz
  if(lit){ctx.fillStyle=`rgba(${TRA_G.tinte},${av?0.04:0.06})`;ctx.fillRect(x0,top+3,w,piso-top-3);
    ctx.save();ctx.globalCompositeOperation='lighter';
    for(let x=x0+6;x<x1-8;x+=14)for(let s=0;s<4;s++){ctx.fillStyle=blink?`rgba(255,180,58,${(0.07-s*0.015).toFixed(3)})`:`rgba(${TRA_G.cono},${(0.07-s*0.015).toFixed(3)})`;
      ctx.fillRect(x-s*2,top+3+s*5,6+s*4,5);}
    ctx.restore();}
  // postes de borde: columnas de 2 px en tramos de 4 con huecos de 3 (se ve dónde empieza y termina el tramo)
  for(const px of[x0,x1-2])for(let y=top+4;y<piso-2;y+=7){ctx.fillStyle=TRA_C.tinta;ctx.fillRect(px-1,y-1,4,6);
    ctx.fillStyle=!lit?TRA_G.off:blink?TRA_C.amb:av?TRA_C.ambM:TRA_G.poste;ctx.fillRect(px,y,2,4);}
  // la tira de luces del techo
  ctx.fillStyle=TRA_C.tinta;ctx.fillRect(x0-1,top-1,w+2,5);ctx.fillStyle=TRA_G.riel;ctx.fillRect(x0,top,w,3);ctx.fillStyle=TRA_G.rielL;ctx.fillRect(x0,top,w,1);
  for(let x=x0+6;x<x1-8;x+=14){ctx.fillStyle=TRA_C.tinta;ctx.fillRect(x-1,top+1,8,3);
    ctx.fillStyle=!lit?TRA_G.off:blink?TRA_C.amb:av?TRA_C.ambM:TRA_G.luz;ctx.fillRect(x,top+2,6,1);
    if(lit&&(on&&!av||blink)){ctx.fillStyle=blink?TRA_C.ambL:TRA_G.luzL;ctx.fillRect(x+2,top+2,2,1);}}
  // cosas sueltas: flotan y se hamacan (prendida) · tiemblan (aviso) · tiradas en el piso (apagada)
  const n=Math.max(4,Math.floor(w/22));
  for(let i=0;i<n;i++){const tipo=i%3,bx=x0+8+Math.round(((i*41)%(w-16))),alto=20+((i*29)%Math.max(10,piso-top-40));
    if(!lit){TRA_suelta(tipo,bx,piso-(tipo===1?2:tipo===2?2:1)-0,0);continue;}
    const fase=T*0.03+i*1.7,dy=red?0:Math.round(Math.sin(fase)*3),dx=red?0:Math.round(Math.sin(fase*0.6)*2),tb=av&&!red?((T>>1)%2?1:-1):0;
    TRA_suelta(tipo,bx+dx+tb,piso-alto+dy,red?0:Math.floor(fase/2)%2);}
}
// ---------- M1 · charcos de aceite ----------
const TRA_A={negro:'#0e0c12',borde:'#1d1a22',hollin:'#2a2428',hollinL:'#3a3236',banda:['#a678e8','#78cc8a','#e8964e','#dc7896'] /* un escalón más claras: es un peligro que se tiene que ver venir */,
  tambor:'#8a3b2a',tamborL:'#b3543a',tamborD:'#5a2418',aro:'#3a2a2a',quem:'#3a2a28'};
const TRA_borde=(x,s)=>{const h=((x*2654435761+s)>>>0)%7;return h<2?1:0;}; // bordes irregulares (fijos por x)
function TRA_tambor(x,y,quemado){ // tambor de aceite volcado (acostado), con la boca hacia el charco
  ctx.fillStyle=TRA_C.tinta;ctx.fillRect(x-1,y-8,12,9);
  ctx.fillStyle=quemado?TRA_A.quem:TRA_A.tambor;ctx.fillRect(x,y-7,10,7);
  if(!quemado){ctx.fillStyle=TRA_A.tamborL;ctx.fillRect(x,y-7,10,1);}
  ctx.fillStyle=TRA_A.aro;ctx.fillRect(x+3,y-7,1,7);ctx.fillRect(x+7,y-7,1,7);
  ctx.fillStyle=TRA_A.tamborD;ctx.fillRect(x+9,y-6,1,5);ctx.fillStyle=TRA_A.negro;ctx.fillRect(x+10,y-3,1,2); // la boca
}
function TRA_aceite(z){
  const x0=Math.round(z.x0),x1=Math.round(z.x1),y=Math.round(z.y),w=x1-x0,t=z.t|0,red=TRA_red();
  TRA_tambor(x0-12,y,!!z.quemado);
  if(z.quemado){ // mancha de hollín, sin brillo
    for(let x=x0;x<x1;x++){const e=TRA_borde(x,7);ctx.fillStyle=TRA_A.hollin;ctx.fillRect(x,y-2+e,1,4-e);}
    ctx.fillStyle=TRA_A.hollinL;for(let x=x0+5;x<x1-5;x+=11)ctx.fillRect(x,y-1,3,1);
    ctx.fillStyle='#1a1418';for(let x=x0+9;x<x1-5;x+=13)ctx.fillRect(x,y,4,1);
    return;}
  // el charco: tinta, negro de borde irregular, una fila de brillo arriba
  // (4 filas: y−2 a y+1, el charco se derrama sobre el borde del piso)
  for(let x=x0-1;x<=x1;x++){const e=TRA_borde(x,3);ctx.fillStyle=TRA_C.tinta;ctx.fillRect(x,y-3+e,1,5-e);}
  for(let x=x0;x<x1;x++){const e=TRA_borde(x,3);ctx.fillStyle=TRA_A.negro;ctx.fillRect(x,y-2+e,1,4-e);}
  ctx.fillStyle=TRA_A.negro;ctx.fillRect(x0-3,y-1,4,1); // el hilo que sale del tambor
  if(!z.arde){
    // brillo de colores: bandas de 3 px con huecos negros de 2, que se corren despacio
    const des=red?0:Math.floor(t/6)%20;
    // dos filas: la de abajo corrida 2 px y con el color que sigue (se lee como un arcoíris en diagonal)
    for(let x=x0+2;x<x1-5;x+=6){const k=Math.floor((x-x0+des)/6)%4;
      ctx.fillStyle=TRA_A.banda[k];ctx.fillRect(x,y-1,4,1);ctx.fillStyle=TRA_A.banda[(k+1)%4];ctx.fillRect(x+2,y,4,1);}
    const gx=x0+4+((Math.floor(t/40)*13)%Math.max(1,w-8));ctx.fillStyle='#f4eee0';if((t>>3)%4)ctx.fillRect(gx,y-1,1,1); // la gota que brilla
    return;}
  // ardiendo: llamas bajas en todo el ancho que se achican con lo que queda
  const k=Math.max(0.25,Math.min(1,z.arde/(typeof TR_ARDE==='number'?TR_ARDE:240)));
  if(typeof FX_llamas==='function')FX_llamas(x0,y,w,k*0.8,x0);
}
// ---------- M5 · vapor de las alcantarillas ----------
const TRA_V={tapa:'#3a3e4c',tapaL:'#5a5e70',ranura:'#14161e',amb:'#ffb43a',nar:'#ff7a2a',calor:'#fff0c0',v1:'#f4f4f8',v2:'#d4d4e0',v3:'#a8a8bc'};
function TRA_tapa(x,y,dx,ranura){ // tapa de 17 × 3 de píxel, con 5 ranuras
  ctx.fillStyle=TRA_C.tinta;ctx.fillRect(x-8+dx,y,17,4);ctx.fillRect(x-9+dx,y+1,19,2);
  ctx.fillStyle=TRA_V.tapa;ctx.fillRect(x-7+dx,y+1,15,2);ctx.fillStyle=TRA_V.tapaL;ctx.fillRect(x-7+dx,y+1,15,1);
  ctx.fillStyle=ranura;for(let i=-6;i<=6;i+=3)ctx.fillRect(x+i+dx,y+1,2,2);
}
function TRA_bocanada(x,y,s,c){ctx.fillStyle=c;ctx.fillRect(x,y,s,s);if(s>=3){ctx.fillRect(x-1,y+1,1,s-2);ctx.fillRect(x+s,y+1,1,s-2);}}
function TRA_vapor(z){
  const x=Math.round(z.cx),y=Math.round(z.y)-4,t=z.t|0,red=TRA_red(),est=z.est; // la tapa va sobre la rejilla del escenario (de y−4 a y−1)
  if(est==='aviso'){
    const dx=red?0:((T>>1)%2?1:-1),on=red||((T>>2)%2===0);
    TRA_tapa(x,y,dx,on?TRA_V.amb:TRA_V.nar);
    if(typeof LUZ_halo==='function')LUZ_halo(x,y+1,14,'#ff9a3c',0.28+0.12*(t/(z.AV||48)));
    for(let i=0;i<3;i++){const f=((t*1.4+i*9)%18)/18;if(f>0.85)continue;TRA_bocanada(x-5+i*4+dx,Math.round(y-1-f*10),2,f<0.5?TRA_V.v2:TRA_V.v3);}
    return;}
  if(est==='chorro'){
    const CH=z.CH||40,sube=Math.min(1,t/6),fin=Math.max(0,(t-(CH-10))/10),alto=Math.round((z.aire||100)*sube),solido=Math.round(alto*0.62);
    TRA_tapa(x,y,0,TRA_V.calor);
    if(typeof LUZ_halo==='function')LUZ_halo(x,y-4,18,'#fff0c0',0.3*(1-fin));
    // la columna: filas de píxel con el ancho que respira, centro blanco y bordes más grises
    for(let r=0;r<solido;r++){const yy=y-1-r,k=r/Math.max(1,solido),base=Math.round((7-fin*4)*(1-k*0.25));
      const ond=red?0:Math.round(Math.sin((r+T*1.5)/5)*1.2+Math.sin((r*3+T)/7)*0.8);if(base<1)break;
      const xa=x-base+ond,w=base*2+1;
      ctx.fillStyle=TRA_V.v3;ctx.fillRect(xa,yy,w,1);
      if(w>4){ctx.fillStyle=TRA_V.v2;ctx.fillRect(xa+1,yy,w-2,1);}
      if(w>6){ctx.fillStyle=TRA_V.v1;ctx.fillRect(xa+2,yy,Math.max(1,w-5),1);}}
    // arriba se deshace en bocanadas que suben y se apagan en 2 escalones
    for(let i=0;i<7;i++){const f=((t*2+i*13)%30)/30,yy=Math.round(y-solido-f*(alto-solido)-4),xx=x-6+((i*5)%13)+(red?0:Math.round(Math.sin((T+i*11)/6)*2));
      if(yy<y-alto||f>0.9)continue;TRA_bocanada(xx,yy,f<0.45?3:2,f<0.45?TRA_V.v2:TRA_V.v3);}
    return;}
  // quieto: la tapa y un hilito de vapor
  TRA_tapa(x,y,0,TRA_V.ranura);
  for(let i=0;i<3;i++){const f=((T*0.5+i*15+x)%44)/44;if(f>0.8)continue;TRA_bocanada(x-3+i*3+(red?0:Math.round(Math.sin((T+i*9)/10))),Math.round(y-1-f*16),2,f<0.3?TRA_V.v1:f<0.55?TRA_V.v2:TRA_V.v3);}
}
// ---------- M9 · plataformas de luz ----------
const TRA_L={ecto:'#bfffcc',ectoL:'#effff4',ectoD:'#7ac48e',ectoA:'#8ad8a0',raya:'rgba(160,230,180,0.32)',vidrio:'#ffd88a',vidrioOff:'#4a3a2a',luz:'255,214,140'};
function TRA_haz(x0,y0,x1,y1,w0,w1,a){ // haz de luz en escalones de 2 filas (de la cabeza del farol a la plataforma)
  const paso=y1<y0?-2:2;
  for(let y=y0;paso<0?y>y1:y<y1;y+=paso){const k=(y-y0)/(y1-y0),cx=x0+(x1-x0)*k,w=Math.round(w0+(w1-w0)*k);
    ctx.fillStyle=`rgba(${TRA_L.luz},${a.toFixed(3)})`;ctx.fillRect(Math.round(cx-w/2),paso<0?y-2:y,w,2);}
}
function TRA_ecto(p,i,blink){ // plataforma de ectoplasma sólida
  const x=Math.round(p.x),y=Math.round(p.y),w=Math.round(p.w0);
  ctx.fillStyle=TRA_C.tinta;ctx.fillRect(x-1,y-1,w+2,6);
  ctx.fillStyle=blink?TRA_L.ectoA:TRA_L.ecto;ctx.fillRect(x,y,w,4);
  ctx.fillStyle=TRA_L.ectoL;ctx.fillRect(x+1,y,w-2,1);ctx.fillStyle=TRA_L.ectoD;ctx.fillRect(x,y+3,w,1);
  // gotas que cuelgan y se estiran (de a 2 px de ancho, con tinta)
  const red=TRA_red();
  for(let k=0;k<3;k++){const gx=x+4+Math.round(k*(w-10)/2),l=red?2:2+((Math.floor(T/9)+k*3+i)%4);
    ctx.fillStyle=TRA_C.tinta;ctx.fillRect(gx-1,y+4,4,l+1);ctx.fillStyle=TRA_L.ectoD;ctx.fillRect(gx,y+4,2,l);}
}
function TRA_rayas(p){ // contorno tenue de rayas de 3 px con huecos de 2 (apagada)
  const x=Math.round(p.x),y=Math.round(p.y),w=Math.round(p.w0);ctx.fillStyle=TRA_L.raya;
  for(let k=0;k<w;k+=5){ctx.fillRect(x+k,y,Math.min(3,w-k),1);ctx.fillRect(x+k,y+3,Math.min(3,w-k),1);}
  ctx.fillRect(x,y,1,4);ctx.fillRect(x+w-1,y,1,4);
}
function TRA_luz(z){
  const red=TRA_red(),av=!!z.aviso,flick=av&&!red&&((T>>2)%2===1),prendida=!!z.on&&!flick;
  const hx=Math.round(z.fx)+3,hy=GROUND-43;
  if(prendida){
    if(typeof LUZ_halo==='function')LUZ_halo(hx,hy,av?38:46,'#ffd88a',av?0.32:0.42);
    ctx.save();ctx.globalCompositeOperation='lighter';
    TRA_haz(hx,hy+2,hx,GROUND,6,40,0.07); // cono hacia abajo
    z.plats.forEach((p,i)=>{if(z.turno&&i!==z.cual)return;TRA_haz(hx,hy-3,p.x+p.w0/2,p.y+4,4,p.w0-4,0.09);}); // haz hacia la plataforma
    ctx.restore();}
  // el vidrio del farol (encima del de mision9.js): prendido, titila en el aviso, apagado
  ctx.fillStyle=prendida?TRA_L.vidrio:TRA_L.vidrioOff;ctx.fillRect(hx-2,GROUND-46,2,5);ctx.fillRect(hx+1,GROUND-46,2,5);
  z.plats.forEach((p,i)=>{const ok=z.on&&(!z.turno||i===z.cual);if(ok)TRA_ecto(p,i,av&&((T>>2)%2===1)&&!red);else TRA_rayas(p);});
}
// ---------- M2 · corriente y marea bajo el muelle ----------
const TRA_M={est:'#7a90a8',estL:'#c0d0e0',amb:'#c08a4a',ambL:'#ffc070',burb:'#a8bcd0',burbL:'#e0ecf4',alga:'#4a7a5a',algaL:'#6a9a72',algaT:'#9ac8a0',algaB:'#2e4e3a',
  lata:'#8a3b2a',lataL:'#b3543a',bot:'#3a5a4a',botL:'#6a8a7a'};
function TRA_corriente(z){
  const x0=Math.round(z.x0),x1=Math.round(z.x1),sup=Math.round(z.sup),fondo=Math.round(z.y),w=x1-x0,h=fondo-sup,red=TRA_red();
  const dir=z.dir>0?1:-1,av=!!z.aviso,fase=red?Math.round(z.fase/3)*3:z.fase,cx=(typeof camX==='number'?camX:0);
  ctx.save();ctx.beginPath();ctx.rect(x0,sup,w,h);ctx.clip();
  const vis=xx=>xx>cx-12&&xx<cx+(typeof VW==='number'?VW:320)+12;
  // algas del fondo (en la vista): tallos de 2 px en tramos de 2 filas que se inclinan con la corriente
  // (verde medio con la punta clara y un borde verde oscuro, no tinta negra: a la altura del cuerpo nada casi negro;
  //  como mucho 6 px, por debajo de la rodilla del jugador)
  for(let ax=x0+10;ax<x1-6;ax+=26){if(!vis(ax))continue;const alto=4+((ax*7)%3)*1,lean=av?0:dir*(0.45+0.15*Math.sin((T+ax)/18));
    for(let k=0;k<alto;k+=2){const ox=Math.round(lean*k),yy=fondo-2-k;ctx.fillStyle=TRA_M.algaB;ctx.fillRect(ax+ox-1,yy-1,4,3);}
    for(let k=0;k<alto;k+=2){const ox=Math.round(lean*k),yy=fondo-2-k,top=k+2>=alto;ctx.fillStyle=top?TRA_M.algaT:k%4?TRA_M.algaL:TRA_M.alga;ctx.fillRect(ax+ox,yy,2,2);}}
  // estelas: 3 capas a distinta velocidad, de 4 a 8 px, con la punta clara del lado al que van
  const n=Math.floor(w/9);
  for(let i=0;i<n;i++){const capa=i%3,vel=1+capa*0.45,largo=av?3:4+((i*5)%5),yy=sup+5+((i*29)%Math.max(8,h-12));
    const xx=x0+(((i*67+fase*vel)%w)+w)%w;if(!vis(xx))continue;const X=Math.round(xx);
    ctx.fillStyle=av?TRA_M.amb:TRA_M.est;ctx.fillRect(dir>0?X-largo:X,yy,largo,1);
    ctx.fillStyle=av?TRA_M.ambL:TRA_M.estL;ctx.fillRect(dir>0?X:X-1,yy,1,1);}
  // burbujas: suben y se corren con la corriente
  for(let i=0;i<Math.floor(w/30);i++){const f=((T*0.5+i*23)%60)/60,bx=x0+(((i*53+fase*0.6)%w)+w)%w,by=Math.round(fondo-4-f*(h-8));
    if(!vis(bx)||f>0.92)continue;const X=Math.round(bx+Math.sin((T+i*7)/9));ctx.fillStyle=TRA_M.burb;ctx.fillRect(X,by,2,2);ctx.fillStyle=TRA_M.burbL;ctx.fillRect(X,by,1,1);}
  // basura suelta cerca del fondo: una lata y una botella que se van dando vueltas de a 90°
  for(let i=0;i<2;i++){const bx=x0+(((i*w/2+fase*0.7)%w)+w)%w,X=Math.round(bx),Y=fondo-6-i*7+Math.round(Math.sin((T+i*40)/16)),cuadro=red?0:Math.floor(Math.abs(fase)/8+i)%2;
    if(!vis(X))continue;const ww=cuadro?2:(i?4:3),hh=cuadro?(i?4:3):2;
    ctx.fillStyle=TRA_C.tinta;ctx.fillRect(X-1,Y-1,ww+2,hh+2);ctx.fillStyle=i?TRA_M.bot:TRA_M.lata;ctx.fillRect(X,Y,ww,hh);ctx.fillStyle=i?TRA_M.botL:TRA_M.lataL;ctx.fillRect(X,Y,ww,1);}
  ctx.restore();
}
const TR_ARTE={
  cinta(z){
    const x0=Math.round(z.x0),x1=Math.round(z.x1),y=Math.round(z.y),w=x1-x0,dir=z.dir>0?1:-1;
    const av=!!z.aviso,on=av&&(TRA_red()||(T>>3)%2===0),fase=TRA_red()?Math.round(z.fase/4)*4:z.fase;
    // brillo del aire (escalones de 4 px, cada vez más tenue) y motas que suben y se corren con la cinta
    if(z.aire>0){const a=z.aire;/* el brillo arranca arriba del canal (y−5) */
      ctx.save();ctx.globalCompositeOperation='lighter'; // suma luz: se ve sobre el violeta de M6
      for(let s=0;s*4<a-4;s++){const k=0.2*(1-s*4/a)**1.5;ctx.fillStyle=av?`rgba(255,180,58,${k.toFixed(3)})`:`rgba(255,90,208,${k.toFixed(3)})`;ctx.fillRect(x0,y-5-(s+1)*4,w,4);}
      ctx.restore();
      for(let i=0;i<Math.floor(w/6);i++){const f=((T*0.6+i*23)%60)/60,mx=x0+(((i*37+fase*1.2)%w)+w)%w,my=y-4-Math.round(f*(a-6));
        ctx.fillStyle=av?`rgba(255,180,58,${(0.9*(1-f)).toFixed(2)})`:`rgba(${TRA_C.mota},${(0.95*(1-f)).toFixed(2)})`;ctx.fillRect(Math.round(mx),my,1,i%3?1:2);}}
    // el canal: tinta, borde, rieles arriba y abajo, fondo oscuro
    // (las flechas van en y−2…y y los rieles en y−4 e y+2: siempre queda una fila oscura entre los dos, así no se funden)
    ctx.fillStyle=TRA_C.tinta;ctx.fillRect(x0-1,y-5,w+2,9);
    ctx.fillStyle=TRA_C.borde;ctx.fillRect(x0,y-4,w,7);
    ctx.fillStyle=TRA_C.canal;ctx.fillRect(x0+3,y-3,w-6,5);
    ctx.fillStyle=on?TRA_C.ambL:av?TRA_C.ambM:TRA_C.rielL;ctx.fillRect(x0+3,y-4,w-6,1); // riel de arriba (con la luz)
    ctx.fillStyle=on?TRA_C.amb:av?TRA_C.ambM:TRA_C.riel;ctx.fillRect(x0+3,y+2,w-6,1);
    // paquetes de datos: flechas ›› que corren con la cinta (de a dos, cada 12 px), y su estela de 2 px
    const paso=12,des=((fase%paso)+paso)%paso;
    ctx.save();ctx.beginPath();ctx.rect(x0+4,y-3,w-8,5);ctx.clip();
    for(let x=x0-paso+Math.round(des);x<x1+paso;x+=paso){
      const c=av?(on?TRA_C.amb:TRA_C.ambM):TRA_C.dato,cl=av?(on?TRA_C.ambL:TRA_C.amb):TRA_C.datoL; // en el aviso, las mismas flechas: titilan entre dos ámbares que se ven
      ctx.fillStyle=av?TRA_C.ambD:TRA_C.datoD;ctx.fillRect(dir>0?x-3:x+7,y-1,2,1);                 // estela
      TRA_flecha(dir>0?x:x+1,y-2,dir,c,cl);TRA_flecha(dir>0?x+3:x-2,y-2,dir,c,cl);}
    ctx.restore();
    // rodillos en las dos puntas
    TRA_rodillo(x0+1,y-1,fase,on);TRA_rodillo(x1-2,y-1,fase,on);
  },
  gravedad(z){TRA_gravedad(z);},
  aceite(z){TRA_aceite(z);},
  vapor(z){TRA_vapor(z);},
  luz(z){TRA_luz(z);},
  corriente(z){TRA_corriente(z);}
};
