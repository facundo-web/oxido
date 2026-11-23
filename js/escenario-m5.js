'use strict';
// Óxido · Escenario de la misión 5, Ciudad sin luna (estilo "Hondo", noche cerrada). Del Ilustrador de escenarios.
// Va DESPUÉS de js/escenario-base.js y de js/mision5.js / jefes5.js (envuelve los ganchos de M5_LVL; con ?esc=0 queda como antes).
// Guía: notas/arte/guia.md · ficha: notas/arte/fichas/escenarios.md (M5 e "Historia").
// CUIDADO DEL GUIÑO: la luz sale de ventanas y velas; NADA proyectado en las nubes. El reflector de la torre (mecánica de
// mision5.js / jefes5.js) se dibuja como haz que se apaga antes de llegar a las nubes, sin mancha ni figura en el cielo.
// La tuerca de Óxido sigue pintada en la torre (marca de los vecinos).
// Historia: ventanas que se prenden con una vela (el momento "LA CIUDAD SE PRENDE" las prende con ESC_M5.prender(x)),
// el dirigible desinflado sobre los techos, cables cortados que suben y "COMPRO TODO" pegado arriba de una vidriera.
// ESC_M5.prenderPantalla(x0, x1): prende (con vela) las ventanas que en este momento se ven entre x0 y x1 de la pantalla
// (unidades del juego, 0…VW). ESC_M5.todas(): las prende todas. Devuelven cuántas prendió.
const ESC_M5={ventanas:[],ancho:900,par:0.4,
  prenderPantalla(x0,x1){const ox=-camX*(typeof ESC_parFondo==='function'?ESC_parFondo(ESC_M5.par):ESC_M5.par),a=ESC_M5.ancho;let n=0;
    for(const v of ESC_M5.ventanas){if(v.on)continue;let x=((v.x+ox)%a+a)%a;for(;x<VW+a;x+=a)if(x>=x0&&x<=x1){v.on=true;n++;break;}else if(x>x1)break;}return n;},
  todas(){let n=0;for(const v of ESC_M5.ventanas)if(!v.on){v.on=true;n++;}return n;}};
(()=>{
const P=ESC_px,G=GROUND,LV=M5_LVL;
const C={
  cielo:[[0,'#0a0a14'],[50,'#10101e'],[90,'#18182a'],[112,'#1e1e34']],
  nube:'#16162a',nubeHi:'#22223a',lejos:'#2e2e4a',lejosVen:'#c89060',lejos2:'#2c2c4c',lejos2Dk:'#22223e',
  medio:'#2a2a4c',medioDk:'#20203c',medioHi:'#3a3a62', /* vuelven a la noche cerrada de la guía (la luz la dan las ventanas) */niebla:'#3a3a5a',bruma:'#a2a2c8',
  vela:'#ffc070',velaC:'#ffe0a0',farol:'#ffc080',farolC:'#ffe8b0',juego:'#0c0c18',tinta:'#17141f',frente:'#05050c',
  gTop:'#5a5e76',gSurf:'#2c2e3a',g1:'#20212c',g2:'#1a1b25',g3:'#15161e',g4:'#101118',gLine:'#0a0a12',gHi:'#3a3e50',raya:'#8a7a40',
  hierro:'#474960',hierroHi:'#6a6e86',ladrillo:'#62424c',ladrilloHi:'#6a4448',toldo:['#6a3a4a','#3a4a6a','#4a5a3a'],
};
// neones de los negocios (sin rojo y sin el celeste del jugador 2)
const NEON=[{c:'#e07ab0',t:'HOTEL'},{c:'#8ae0b0',t:'BAR'},{c:'#ffc860',t:'24 H'}];
const CIELOS={noche:C.cielo,tarde:[[0,'#16142a'],[60,'#2e2840'],[100,'#6a4a4a'],[112,'#8a5a4a']],amanecer:[[0,'#141832'],[60,'#2e3050'],[100,'#6a5a72'],[112,'#8a7080']],dia:[[0,'#3a3e58'],[60,'#5a5e78'],[100,'#80849c'],[112,'#9a9cb0']]};
const Y0=-40;
const hsh=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
// torre del reflector (mecánica de mision5.js): misma posición que M5_tower(), con la tuerca pintada
function torre(c2){
  if(typeof M5_tower!=='function')return;const t=M5_tower(),x=Math.round(t.x),ink=C.tinta,col='#1e2034',hi='#30324a';
  c2.fillStyle=ink;c2.fillRect(x-7,63,14,G-63);c2.fillStyle=col;c2.fillRect(x-6,64,12,G-64);c2.fillStyle=hi;c2.fillRect(x-6,64,1,G-64);
  c2.fillStyle=ink;c2.fillRect(x-5,56,10,8);c2.fillStyle=col;c2.fillRect(x-4,57,8,6);c2.fillRect(x-8,62,16,2);
  for(let y=72;y<G-30;y+=9){c2.fillStyle='#3a3a52';c2.fillRect(x-2,y,1,2);}
  // la tuerca de Óxido pintada (hexágono gastado con agujero), abajo, lejos de la lente
  const ty=G-34;c2.fillStyle='#8a5a3a';c2.fillRect(x-2,ty-3,5,1);c2.fillRect(x-3,ty-2,7,5);c2.fillRect(x-2,ty+3,5,1);c2.fillStyle=col;c2.fillRect(x,ty,1,1);c2.fillRect(x-1,ty-1,3,3);c2.fillStyle='#8a5a3a';c2.fillRect(x-1,ty-1,1,1);
  // la lente
  const sl=typeof M5!=='undefined'?M5.sl:null,a=sl?(sl.mode==='off'?(typeof M5_slA==='function'?M5_slA():0):1):1;
  c2.fillStyle=ink;c2.fillRect(x-4,50,9,7);c2.fillStyle='#2a2e40';c2.fillRect(x-3,51,7,5);c2.fillStyle=a>0.5?'#fff4d0':'#3a3426';c2.fillRect(x-2,50,5,2);
}
// haces del reflector: al cielo (se apaga antes de las nubes: nada proyectado), al dirigible del jefe y a la calle
function haces(c2){
  if(typeof M5==='undefined'||typeof M5_tower!=='function')return;const sl=M5.sl,t=M5_tower(),tx=t.x,ty=50;
  c2.save();c2.globalCompositeOperation='lighter';c2.imageSmoothingEnabled=true;
  const haz=(x2,y2,w0,w1,a)=>{if(a<=0.01)return;const g=c2.createLinearGradient(tx,ty,x2,y2);g.addColorStop(0,ESC_rgba('#fff0c8',0.16*a));g.addColorStop(1,ESC_rgba('#fff0c8',0));
    c2.fillStyle=g;const dx=x2-tx,dy=y2-ty,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;c2.beginPath();c2.moveTo(tx+nx*w0,ty+ny*w0);c2.lineTo(x2+nx*w1,y2+ny*w1);c2.lineTo(x2-nx*w1,y2-ny*w1);c2.lineTo(tx-nx*w0,ty-ny*w0);c2.closePath();c2.fill();};
  const sa=(sl.mode==='boss'?0:(typeof M5_slA==='function'?M5_slA():1))*(1-sl.k);
  if(sa>0.01){const sw=typeof M5_sweep==='function'?M5_sweep():0;haz(tx+sw*50,ty-44,2,10,sa);} // corto: se apaga a mitad de camino
  if(sl.mode==='boss'&&sl.tx!==undefined&&sl.a>0.01)haz(sl.tx-camX,sl.ty,2,8,sl.a*1.2);
  if(sl.k>0.01)haz(sl.gx-camX,G,2,20,sl.k);
  c2.restore();
}
// el dirigible desinflado, caído sobre los techos (Historia)
function dirigible(g,x,base){const ink=C.tinta,col='#4a3e52',dk='#3a3044',hi='#5a4e64';
  for(let i=0;i<14;i++){const w=60-Math.abs(i-6)*5+Math.floor(hsh(i*3)*4),y=base-14+i,xx=x+Math.floor((60-w)/2)+(i>8?(i-8)*2:0);P.R(g,xx,y,w,1,i<2?hi:i>10?dk:col);}
  for(let i=6;i<60;i+=9)P.R(g,x+i,base-12,1,10,dk);P.R(g,x+50,base-4,14,4,col);P.R(g,x+62,base-8,4,8,dk);
  P.R(g,x+20,base-1,18,3,'#2a2232');for(const cx of[22,34])P.R(g,cx+x,base-6,1,6,ink);}
// edificio de la calle de enfrente con ventanas (algunas se van a prender con una vela)
function edificio(g,x,base,w,h,R,ventanas,ox){
  P.R(g,x,base-h,w,h,C.medio);P.R(g,x,base-h,w,1,C.medioHi);P.R(g,x-1,base-h-2,w+2,2,C.medioDk);
  for(let wy=base-h+5;wy<base-8;wy+=8)for(let wx=x+3;wx<x+w-4;wx+=6){P.R(g,wx,wy,3,4,'#2a2a44');P.R(g,wx,wy+4,3,1,C.medioDk);
    if(R()<0.22)ventanas.push({x:wx+ox,y:wy,on:R()<0.25,s:Math.floor(R()*999)});}
}
const BRUMA_PIE={noche:0.6,lluvia:1.03,amanecer:0.6,tarde:0.6,dia:0.57,otra:0.57}; // fuerza de la meseta de bruma al pie (se ajusta midiendo)
const def={
  // frente del puente del tren: velo leve, goteo (M5_drips de mision5.js) y la viga (gancho L.drawTunnelFront)
  tunelFrente(t,d){if(t.k!=='tren')return false;const x=Math.round(t.x),w=Math.round(t.w),iy=Math.round(t.y)+9;
    ctx.fillStyle='rgba(8,8,20,0.16)';ctx.fillRect(x,iy,w,G-iy);ctx.fillStyle='rgba(8,8,20,0.28)';ctx.fillRect(x,iy,w,3);
    if(typeof M5_drips==='function'&&!ESC_reducido())try{M5_drips(t.x,t.w,iy,5,(t.x|0)+31);}catch(e){}
    vigaTren(x,Math.round(t.y),w,d);return true;},
  halosAltos:{col:C.bruma,a:0.92,r:20,plano:true,alto:40}, // de noche, halo CORTO detrás de cada plataforma alta (sin bruma alta general)
  pix:1,nat:'noche',semilla:55,paso:'pixel',
  atm:{col:C.niebla,fuerza:0.03,pie:0},
  luzPersonajes:{calida:'#ffc080',lado:1,fria:'#7080b0'},
  sombra:'#030308',
  oscPersonajes:0.3,
  ambientes:{
    base:{oscuridad:0.16,oscCol:'#030308'},
    amanecer:{tinte:'#a090b0',tinteA:0.1,modo:'overlay',luces:0.6,oscuridad:0.08},
    dia:{tinte:'#8a8ea8',tinteA:0.2,modo:'screen',luces:0.3,oscuridad:0},
    tarde:{tinte:'#b08070',tinteA:0.1,modo:'overlay',luces:0.8,oscuridad:0.1},
    limpio:{reemplazar:true,tintes:[['screen','#3a3a6a',0.25]],oscuridad:0,luces:0.6},
  },
  capas:[
    // 1 · cielo: escalones, sin luna, nubes apenas más claras; relámpagos de mision5.js
    {id:'cielo',cielo:true,segunAmb:true,ancho:W,y:Y0,alto:G-Y0+4,dibujar(g,w,h,R,c,a){
      const hz=a&&CIELOS[a.hora]?a.hora:'noche',st=CIELOS[hz].map(([y,col])=>[y-Y0,col]);st.unshift([0,st[0][1]]);P.escalones(g,w,h,st,4);
      const nube=hz==='dia'?'#6a6e88':C.nube,hi=hz==='dia'?'#8a8ea6':C.nubeHi;
      for(let i=0;i<7;i++){const cy=8+i*10+Math.floor(hsh(i*5)*6)-Y0,cx=Math.floor(hsh(i*4)*w)-30,cw=60+Math.floor(hsh(i*2)*80);
        for(let k=0;k<3;k++)P.R(g,cx+k*9+Math.floor(hsh(i*7+k)*6),cy-k*3,cw-k*18,3,nube);P.R(g,cx+4,cy+3,cw-12,1,hi);}},
      vivo(c2,ox,oy){const fl=typeof M5_flashA==='function'?M5_flashA():0;
        if(fl>0&&!ESC_reducido()){c2.fillStyle=`rgba(150,160,215,${(0.35*fl).toFixed(3)})`;c2.fillRect(-2,camY-2,VW+4,G-camY+4);if(typeof M5_drawBolt==='function'&&M5.bolt)try{M5_drawBolt(fl);}catch(e){}}}},
    // 2 · lejos: la ciudad apagada (pocas ventanas), cables cortados que suben, la torre del reflector y sus haces
    {id:'lejos',par:0.04,ancho:640,y:60,alto:G-60,pie:'auto',nieblaPie:0,dibujar(g,w,h,R){
      P.siluetas(g,w,R,58,10,40,C.lejos,0.03,C.lejosVen,[10,24],10);
      for(let i=0;i<7;i++){const x=Math.floor(R()*w),y=58-10-Math.floor(R()*30);P.line(g,x,y,x+Math.floor((R()-0.5)*30),y-20-Math.floor(R()*20),'#3a3a58');}
      P.banda(g,w,30,62,C.niebla,0,0.3);},
      vivo(c2){torre(c2);haces(c2);}},
    // 3 · lejos 2: el tren elevado (pasa con las ventanas prendidas) y el dirigible desinflado sobre un techo
    {id:'lejos 2',par:0.2,ancho:720,y:60,alto:G-60,pie:'auto',nieblaPie:0,dibujar(g,w,h,R){
      P.siluetas(g,w,R,70,6,26,C.lejos2,0.02,C.lejosVen,[14,30],20);dirigible(g,420,48);
      P.R(g,0,58,w,3,C.lejos2Dk);for(let x=0;x<w;x+=46){P.R(g,x,58,2,h-58,C.lejos2Dk);P.line(g,x+2,61,x+8,61,C.lejos2Dk);P.line(g,x+2,61,x+2,67,C.lejos2Dk);}
      P.banda(g,w,40,72,C.niebla,0,0.28);},
      vivo(c2,ox,oy){if(typeof M5==='undefined'||M5.train<0)return;const tx=Math.round(-130+M5.train),y=Math.round(oy+58);
        for(let k=0;k<4;k++){const cx=tx+k*28;c2.fillStyle=C.tinta;c2.fillRect(cx-1,y-9,28,9);c2.fillStyle='#24243c';c2.fillRect(cx,y-8,26,8);c2.fillStyle=C.vela;for(let i=0;i<5;i++)c2.fillRect(cx+2+i*5,y-6,3,2);}
        c2.fillStyle='#fff4d0';c2.fillRect(tx+110,y-5,2,2);}},
    // 4 · medio: la calle de enfrente; edificios con ventanas apagadas, algunas con vela (lucesEncima: atraviesan la bruma)
    {id:'medio',par:0.4,ancho:900,y:50,alto:G-50,pie:'auto',nieblaPie:0,lucesEncima:true,dibujar(g,w,h,R,c){
      ESC_M5.ventanas.length=0;const base=86;let x=0,reloj=false;
      while(x<w-20){const bw=30+Math.floor(R()*30),bh=34+Math.floor(R()*44);
        if(!reloj&&x>300){reloj=true; // torre del reloj (una sola)
          P.R(g,x,base-86,22,86,C.medio);P.R(g,x-2,base-88,26,3,C.medioDk);for(let i=0;i<6;i++)P.R(g,x+i*2,base-94+i,22-4*i>0?22-4*i:1,1,C.medioDk);
          P.disc(g,x+11,base-74,5,'#c8b890');P.R(g,x+11,base-78,1,4,C.tinta);P.R(g,x+11,base-74,3,1,C.tinta);x+=34;continue;}
        edificio(g,x,base,bw,bh,R,ESC_M5.ventanas,0);x+=bw+2+Math.floor(R()*6);}
      P.R(g,0,base,w,h-base,C.medioDk);P.banda(g,w,base-30,base+4,C.niebla,0,0.16);
      c.luces=[];},
      // velas en las ventanas: titilan apenas (quietas con MOVIMIENTO REDUCIDO) y dan luz que atraviesa la bruma
      vivo(c2,ox,oy,c){c.luces.length=0;
        for(const v of ESC_M5.ventanas){if(!v.on)continue;const f=ESC_reducido()?0:((T>>3)+v.s)%5===0?1:0;
          ESC_cada(c,ox,v.x,4,x=>{c2.fillStyle=C.vela;c2.fillRect(Math.round(x),Math.round(oy+v.y),3,4);c2.fillStyle=C.velaC;c2.fillRect(Math.round(x)+1,Math.round(oy+v.y)+2-f,1,2);});
          c.luces.push({x:v.x+1.5,y:v.y+2,r:7,col:C.vela,fuerza:0.5,tipo:'fuego'});}}},
    // 5 · bruma al pie (regla 2): la ilumina la ciudad
    {id:'bruma',par:0.7,parY:1,ancho:W,y:88,alto:G-88+2,pie:'auto',niebla:0,nieblaPie:0,segunAmb:true,dibujar(g,w,h,R,c,a){
      // bruma al pie en MESETA (guía §9): 0 en y 88, llena en y 110 y pareja hasta el piso; apunta a 0,13–0,16 en la franja de los personajes
      const A=a&&a.hora==='noche'?BRUMA_PIE.noche*(a.clima==='lluvia'||a.clima==='tormenta'?BRUMA_PIE.lluvia:1):(a&&BRUMA_PIE[a.hora]!=null?BRUMA_PIE[a.hora]:BRUMA_PIE.otra);
      for(let y=0;y<h;y++){const u=Math.min(1,y/22),sm=u*u*(3-2*u);g.globalAlpha=A*sm;g.fillStyle=C.bruma;g.fillRect(0,y,w,1);}g.globalAlpha=1;}},
  ],
  // primer plano: rejas en los costados, un toldo roto arriba en una esquina, cables; abajo, cordón de la vereda (vivo)
  frente:{par:1.4,parY:1.15,alfa:1,ancho:900,bordesAbajo:true,piezas:[ // bordesAbajo: la reja y los bloques de abajo solo en los costados
    {x:20,y:0,w:30,h:18,abajo:true,dibujar(g,w,h){P.R(g,0,4,w,2,C.frente);P.R(g,0,h-3,w,3,C.frente);for(let i=1;i<w;i+=5){P.R(g,i,2,2,h-2,C.frente);P.R(g,i,0,2,2,C.frente);}}},
    {x:460,y:0,w:30,h:12,abajo:true,dibujar(g,w,h){P.R(g,2,2,10,10,C.frente);P.R(g,0,0,14,3,C.frente);P.R(g,16,6,12,6,C.frente);}},
    {x:250,y:0,w:64,h:20,arriba:true,dibujar(g,w,h){for(let i=0;i<6;i++)P.R(g,0,i*2,w-i*6,2,C.frente);for(let i=4;i<w-30;i+=8)P.R(g,i,12,2,4+(i%3)*2,C.frente);}},
    {x:700,y:0,w:70,h:14,arriba:true,dibujar(g,w,h){P.R(g,0,0,w,2,C.frente);let y=2;for(let x=0;x<w;x+=4){P.R(g,x,y,4,1,C.frente);if(x<w/2)y++;else y--;}}},
  ],
    vivo(c2,d,par,ac){const dx=camX*(1-par),bot=Math.floor(camY+VH),x0=camX-dx-20,x1=camX+VW-dx+20;c2.globalAlpha=ac;c2.fillStyle=C.frente;
      for(let k=Math.floor(x0/26);k<=x1/26;k++){if(hsh(k*2.9)<0.4)continue;const X=Math.round(k*26+dx),borde=Math.min(X-camX,camX+VW-X),h=borde>VW*0.15?2:4;c2.fillRect(X,bot-h,14,h);}
      c2.globalAlpha=1;}},
  // piso: asfalto mojado con la raya amarilla apagada y el reflejo de cada luz en franjas verticales cortas;
  // charcos que espejan, alcantarillas con calor y los pilares de las cornisas
  piso(c2,x0,x1,d){
    const bot=Math.max(H,Math.ceil(camY+VH)+2),w=x1-x0;
    P.R(c2,x0,G,w,1,C.gTop);P.R(c2,x0,G+1,w,3,C.gSurf);P.R(c2,x0,G+4,w,4,C.g1);P.R(c2,x0,G+8,w,6,C.g2);P.R(c2,x0,G+14,w,6,C.g3);P.R(c2,x0,G+20,w,bot-G-20,C.g4);
    const cx=Math.round(camX+VW/2);for(let x=Math.floor(x0/24)*24-48;x<x1+48;x+=24){const xb=cx+(x-cx)*1.5;P.line(c2,x,G+13,xb,G+16,C.raya);} // raya de la calle
    for(let x=Math.floor(x0/16)*16-32;x<x1+32;x+=16)P.line(c2,x,G+4,cx+(x-cx)*1.9,H,C.gLine);
    for(let x=x0;x<x1;x++){const h=hsh(x*3.7);if(h<0.16){c2.fillStyle=h<0.05?C.gHi:C.gLine;c2.fillRect(x,G+5+Math.floor(hsh(x*9.1)*18),1,1);}}
    for(const p of LV.puddles||[])if(p.x<x1+4&&p.x+p.w>x0-4)charco(c2,Math.round(p.x),Math.round(p.w));
    for(const gx of LV.grates||[])if(gx>x0-12&&gx<x1+12)rejilla(c2,Math.round(gx));
    const k=ESC.amb?ESC.amb.luces:1;
    if(k>0.05)for(const o of LV.decor){const col=o.k==='farol'?C.farol:o.k==='neon'?NEON[o.v||0].c:o.k==='cabina'?'#c8d8a0':null;if(!col||o.x<x0-20||o.x>x1+20)continue;
      const lx=o.x+(o.k==='farol'?8:5);for(let y=G+2;y<G+22;y+=2){const a=(1-(y-G)/24)*0.5*k,ww=1+Math.floor(hsh(y*3+o.x)*3),jx=Math.floor((hsh(y*7+o.x+Math.floor(T/12))-0.5)*4);
        c2.globalAlpha=a;c2.fillStyle=col;c2.fillRect(lx+jx-(ww>>1),y,ww,1);}}
    c2.globalAlpha=1;
    for(const pl of platforms)if(pl.hi==='cornisa'&&pl.x<x1+10&&pl.x+pl.w>x0-10)pilar(c2,pl);
  },
  extras(lv){
    const duro=x=>(lv.covers||[]).some(c=>x>c.x-4&&x<c.x+c.w+4)||lv.decor.some(o=>x>o.x-6&&x<o.x+20)||(lv.tunnels||[]).some(t=>x>t.x-8&&x<t.x+t.w+8)||
      (lv.pyramids||[]).some(p=>x>p.x-8&&x<p.x+p.w+8)||lv.platforms.some(p=>!p.roof&&!p.pyr&&!p.ar&&!p.salaAr&&x>p.x-4&&x<p.x+p.w+4)||(lv.crates||[]).some(c=>x>c.x-4&&x<c.x+18);
    const cw=(typeof pfW==='function'?pfW('COMPRO TODO'):48)+16,libre=x=>{for(let i=x;i<=x+cw;i+=2)if(duro(i))return false;return true;};
    const out=[];let n=0;for(const x0 of[350,1500,2400]){if(n>=2)break;let x=x0;while(x<x0+500&&!libre(x))x+=2;if(x<x0+500){out.push({x,k:'compro',w:cw});n++;}}
    return out;
  },
  luces(lv){return lv.decor.filter(o=>o.k==='farol'||o.k==='neon'||o.k==='cabina').map(o=>o.k==='farol'?{x:o.x+8,y:G-46,r:48,col:C.farol,fuerza:0.6,tipo:'farol'}
    :o.k==='neon'?{x:o.x+5,y:G-34,r:24,col:NEON[o.v||0].c,fuerza:0.4,tipo:'neon'}:{x:o.x+6,y:G-14,r:18,col:'#c8d8a0',fuerza:0.35,tipo:'farol'});},
  decor(o,d){
    const g=G,x=Math.round(o.x),spr=(k,w,h,fn,dx,dy)=>ctx.drawImage(ESC_sprite(d,k,w,h,fn),x+dx,g+dy);
    switch(o.k){
    case 'farol':ESC_sombraContacto(d,x+3,6,g,0.6);
      spr('farol',16,50,(s)=>{P.R(s,2,6,4,44,C.tinta);P.R(s,3,6,2,44,C.hierro);P.R(s,3,6,1,44,C.hierroHi);P.R(s,1,46,6,4,C.tinta);
        P.R(s,4,4,10,4,C.tinta);P.R(s,6,2,8,9,C.tinta);P.R(s,7,3,6,6,C.farol);P.R(s,7,3,6,1,C.farolC);P.R(s,9,0,2,2,C.tinta);},-2,-50);return true;
    case 'neon':{const n=NEON[o.v||0],tw=typeof pfW==='function'?pfW(n.t)+6:26;ESC_sombraContacto(d,x+5,4,g,0.5);
      spr('neon'+(o.v||0),Math.max(14,tw),44,(s)=>{P.R(s,4,14,3,30,C.tinta);P.R(s,5,14,1,30,C.hierroHi);P.R(s,0,0,tw,12,C.tinta);P.R(s,1,1,tw-2,10,'#484866');
        const t=typeof pfLienzo==='function'?pfLienzo(n.t,n.c):null;if(t)s.drawImage(t,3,3);},-3,-44);return true;}
    case 'hidrante':ESC_sombraContacto(d,x+4,8,g,0.6);
      spr('hidrante',10,12,(s)=>{P.R(s,1,2,8,10,C.tinta);P.R(s,2,3,6,9,'#6a5a3a');P.R(s,2,3,6,1,'#9a8a5a');P.R(s,0,5,10,3,C.tinta);P.R(s,3,0,4,3,C.tinta);},-1,-12);return true;
    case 'tacho':ESC_sombraContacto(d,x+5,10,g,0.6);
      spr('tachoBasura',14,14,(s)=>{P.R(s,1,3,10,11,C.tinta);P.R(s,2,4,8,10,'#454b5b');P.R(s,2,4,8,1,'#5a5e70');for(let i=3;i<9;i+=2)P.R(s,i,6,1,7,'#484a5c');P.R(s,0,1,12,3,C.tinta);P.R(s,9,0,5,6,'#4a4a54');P.R(s,10,1,3,3,'#4a4a57');},-1,-14);return true;
    case 'cabina':ESC_sombraContacto(d,x+7,14,g,0.6);
      spr('cabina',16,40,(s)=>{P.R(s,0,0,16,40,C.tinta);P.R(s,1,1,14,39,'#3e5064');P.R(s,1,1,14,3,'#5a6e84');P.R(s,3,6,10,24,'#c8d8a0');P.R(s,3,6,10,24,'rgba(0,0,0,0)');P.R(s,4,7,8,22,'#8a9a70');P.R(s,7,6,1,24,C.tinta);P.R(s,3,17,10,1,C.tinta);},-1,-40);return true;
    case 'kiosco':ESC_sombraContacto(d,x+10,22,g,0.6);
      spr('kiosco',26,30,(s)=>{P.R(s,0,4,26,26,C.tinta);P.R(s,1,5,24,25,'#3e4f3e');for(let y=10;y<28;y+=2)P.R(s,2,y,22,1,'#3b503b');P.R(s,0,0,26,6,C.tinta);for(let i=0;i<6;i++)P.R(s,1+i*4,1,2,4,i%2?'#5a6a4a':'#7a6a4a');},-2,-30);return true;
    case 'gargola':ESC_sombraContacto(d,x+8,18,g,0.6);
      spr('gargola',22,30,(s)=>{P.R(s,2,16,18,14,C.tinta);P.R(s,3,17,16,13,'#4e4e62');P.R(s,3,17,16,1,'#72728a');P.R(s,5,6,12,11,C.tinta);P.R(s,6,7,10,10,'#5a5a70');P.R(s,2,8,4,4,C.tinta);P.R(s,16,8,4,4,C.tinta);P.R(s,8,10,2,1,'#8a8aa0');P.R(s,12,10,2,1,'#8a8aa0');},-2,-30);return true;
    case 'compro':{const w=o.w||64;ESC_sombraContacto(d,x+w/2,w,g,0.4);
      // vidriera cerrada con persiana, y el cartel de la banda pegado arriba (borde de abajo en G−24)
      spr('vidriera'+w,w,26,(s)=>{P.R(s,0,0,w,26,C.tinta);P.R(s,1,1,w-2,25,'#494962');for(let y=3;y<25;y+=3)P.R(s,1,y,w-2,1,'#494962');P.R(s,1,1,w-2,1,'#494960');},0,-26);
      ctx.drawImage(ESC_H.chapa(d,'COMPRO TODO',w),x,g-46);return true;}
    }
    return false;
  },
  plat(pl,d){
    if(pl.roof&&pl.roof.k==='tren'){trenFondo(pl,d);return true;}
    if(pl.ar||pl.salaAr||pl.roof)return false; // arpón: queda con su dibujo
    const x=Math.round(pl.x),y=Math.round(pl.y),w=Math.round(pl.w),hh=G-y,put=(k,sw,sh,fn,ox,oy)=>ctx.drawImage(ESC_sprite(d,k,sw,sh,fn),x+ox,y+oy);
    if(pl.pyr){const h=pl.pyr.dy,m=pl.mat;put('pyr'+m+w+'x'+h,w+2,h+1,(g)=>escalon(g,w,h,m),-1,-1);return true;}
    if(pl.step){ESC_sombraContacto(d,x+w/2,w,G,0.6);put('pedestal'+w+'x'+hh,w+2,hh+1,(g)=>{const o=1;P.R(g,0,0,w+2,hh+1,C.tinta);P.R(g,o,o,w,hh,'#494960');P.R(g,o,o,w,2,'#5a5a6c');for(let yy=6;yy<hh;yy+=6)P.R(g,o,o+yy,w,1,'#494962');},-1,-1);return true;}
    if(pl.hi==='cornisa'){put('cornisa'+w,w+6,12,(g)=>{P.R(g,0,0,w+6,7,C.tinta);P.R(g,1,1,w+4,5,'#494960');P.R(g,1,1,w+4,1,'#6a6a80');for(let i=4;i<w;i+=8)P.R(g,i,6,3,5,C.tinta);},-3,-1);return true;}
    if(pl.m5==='toldo'){const col=C.toldo[(x>>3)%3];
      put('toldo'+w+col,w+4,10,(g)=>{P.R(g,0,0,w+4,8,C.tinta);for(let i=0;i<w+2;i+=6){P.R(g,1+i,1,3,6,col);P.R(g,4+i,1,3,6,'#c8c0a8');}P.R(g,1,1,w+2,1,'#e8e0c8');for(let i=1;i<w+3;i+=6)P.R(g,i,7,3,2,C.tinta);},-2,-1);
      for(const lx of[x+3,x+w-4]){ctx.fillStyle=C.tinta;ctx.fillRect(lx,y+7,1,6);}
      return true;}
    // descanso de escalera de incendio: rejilla de hierro, barandas y escalera que baja
    for(const lx of[x+2,x+w-3])ESC_sombraContacto(d,lx,3,G,0.5);
    put('escalera'+w+'x'+hh,w+2,hh+8,(g)=>{const o=1,t=7;for(const px of[0,w-2]){P.R(g,o+px,t,2,hh,C.hierro);}
      for(let yy=t+8;yy<t+hh-4;yy+=6)P.line(g,o+4,yy+5,o+w-6,yy,C.hierro);
      P.R(g,o,0,1,t,C.tinta);P.R(g,o+w-1,0,1,t,C.tinta);P.R(g,o,1,w,1,C.tinta);
      P.R(g,0,t-1,w+2,4,C.tinta);P.R(g,o,t,w,2,C.hierro);P.R(g,o,t,w,1,C.hierroHi);for(let i=2;i<w;i+=3)P.R(g,o+i,t+1,1,1,C.tinta);},-1,-7);
    return true;
  },
  cobertura(c,d){
    const x=Math.round(c.x),w=Math.round(c.w),h=Math.round(c.h),top=G-h;
    if(c.vida<=0){ESC_sombraContacto(d,x+w/2,w,G,0.5);ctx.drawImage(ESC_sprite(d,'escombro'+c.k+w,w+6,8,(g)=>{for(let i=0;i<w+2;i+=3){const hh=1+Math.floor(hsh(i*3.1+w)*4);P.R(g,i,7-hh-1,4,hh+1,C.tinta);P.R(g,i+1,7-hh,2,hh,'#4a4a5c');}}),x-3,G-8);return true;}
    if(!['m5barrera','m5volqueta','m5tachos'].includes(c.k))return false;
    ESC_sombraContacto(d,x+w/2,w,G,0.6);
    ctx.drawImage(ESC_sprite(d,'cob'+c.k+w+'x'+h,w+2,h+1,(g)=>{const o=1,R2=(a,b,cc,e,col)=>P.R(g,a+o,b+o,cc,e,col);
      if(c.k==='m5barrera'){R2(-1,-1,w+2,h+1,C.tinta);R2(0,0,w,h,'#5a5a70');R2(0,0,w,1,'#8a8aa0');for(let i=2;i<w-4;i+=6){R2(i,3,2,1,'#c07a48');R2(i+1,4,2,1,'#c07a48');R2(i+2,5,2,1,'#c07a48');}R2(Math.floor(w/2),1,1,h-1,'#494960');}
      else if(c.k==='m5volqueta'){R2(-1,-1,w+2,h+1,C.tinta);R2(0,0,w,h,'#3a5a4a');R2(0,0,w,1,'#5a7a6a');for(let i=3;i<w;i+=4)R2(i,2,1,h-3,'#2f5240');R2(-1,-3,w+2,3,C.tinta);R2(0,-2,w,1,'#4a6a5a');}
      else{for(let i=0;i<w-6;i+=8){R2(i-1,1,9,h,C.tinta);R2(i,2,7,h-2,'#454b5b');R2(i,2,7,1,'#5a5e70');R2(i-1,0,9,2,C.tinta);}}}),x-1,top-1);
    if(c.vida<c.max*0.5){ctx.fillStyle=C.tinta;ctx.fillRect(x+Math.round(w*0.25),top+1,1,Math.round(h*0.5));ctx.fillRect(x+Math.round(w*0.7),top,2,2);}
    return true;
  },
  caja(c,d){return ESC_H.caja(c,d);},
};
// charco: espejo oscuro con franjas de las luces de los neones y anillos de gota de a píxel
function charco(c2,x,w){P.oval(c2,x+(w>>1),G+3,w>>1,2,'#0a1020');P.R(c2,x+5,G+2,w-10,1,'#3a4a6a');
  for(let i=0;i<w/6-1;i++){const h=hsh(x+i*7);if(h<0.5)continue;const col=h>0.85?NEON[0].c:h>0.7?NEON[1].c:C.farol;c2.globalAlpha=0.4;c2.fillStyle=col;c2.fillRect(x+4+i*6,G+2+Math.floor(h*2),2+Math.floor(h*2),1);}
  c2.globalAlpha=1;for(let i=0;i<Math.max(1,w/22);i++){const h=hsh(x*3+i),ph=((T+h*200)%40)/40,px=Math.round(x+6+h*(w-12)),r=Math.round(1+ph*4);if(ph<0.8){c2.fillStyle='#8a9ac0';c2.fillRect(px-r,G+3,1,1);c2.fillRect(px+r,G+3,1,1);}}}
function rejilla(c2,x){P.oval(c2,x,G+3,8,2,C.tinta);P.oval(c2,x,G+3,7,1,'#3a3e4c');for(let i=-6;i<=6;i+=3)P.R(c2,x+i,G+2,1,2,'#14161e');
  c2.globalAlpha=0.25;c2.fillStyle='#ff9040';c2.fillRect(x-4,G+3,9,1);c2.globalAlpha=1;}
function pilar(c2,pl){const cx=Math.round(pl.x+pl.w/2),y=Math.round(pl.y+6);P.R(c2,cx-6,y,12,G-y,C.tinta);P.R(c2,cx-5,y,10,G-y,'#474a71');P.R(c2,cx-5,y,1,G-y,'#575a81');
  for(let yy=y+3;yy<G;yy+=4){P.R(c2,cx-5,yy,10,1,'#3c4060');P.R(c2,cx-2+((yy>>2)%2)*4,yy-3,1,3,'#3c4060');}
  P.line(c2,cx-5,y+16,Math.round(pl.x)+2,y,'#42485c');P.line(c2,cx+5,y+16,Math.round(pl.x+pl.w)-2,y,'#42485c');}
function escalon(g,w,h,m){const o=1,R2=(a,b,c,e,col)=>P.R(g,a+o,b+o,c,e,col);R2(-1,-1,w+2,h+1,C.tinta);
  if(m==='ladrillo'){R2(0,0,w,h,C.ladrillo);for(let r=0;r<h;r+=4){R2(0,r,w,1,'#614251');for(let i=(r%8?3:0);i<w;i+=7)R2(i,r,1,4,'#614251');}R2(0,0,w,1,C.ladrilloHi);}
  else if(m==='bolsas'){R2(0,0,w,h,'#4b4b4b');for(let r=0;r<h-3;r+=5)for(let i=(r%10?3:0);i<w-6;i+=7){R2(i,r,7,5,C.tinta);R2(i+1,r+1,5,3,'#8a8478');R2(i+1,r+1,5,1,'#aaa498');}}
  else{R2(0,0,w,h,'#484864');for(let i=0;i<w;i+=10){R2(i,0,2,h,'#6a6a7c');}R2(0,0,w,2,'#6a6a7c');R2(0,h-2,w,2,'#5a5a6c');for(let i=0;i<w-10;i+=10)P.line(g,o+i+2,o+2,o+i+10,o+h-2,'#4a4a5c');}
  R2(w-3,0,3,h,'rgba(3,3,8,0.3)');}
// debajo del puente del tren: pared de ladrillo en penumbra, pilares de acero remachados y una lámpara que ilumina el piso
function trenFondo(pl,d){const x=Math.round(pl.x),y=Math.round(pl.y),w=Math.round(pl.w),iy=y+9,ih=G-iy;
  ctx.drawImage(ESC_sprite(d,'tren'+w+'x'+ih,w,ih,(g)=>{P.R(g,3,0,w-6,ih,'#3e4256');for(let r=2;r<ih;r+=4)for(let c=(r%8===2?3:9);c<w-6;c+=12)P.R(g,c,r,11,1,'#464a5e');
    for(const px of[2,(w>>1)-14,w-12]){P.R(g,px,0,10,ih,C.tinta);P.R(g,px+1,0,8,ih,'#5a6074');P.R(g,px+1,0,1,ih,'#8a90a4');for(let yy=3;yy<ih-4;yy+=6){P.R(g,px+3,yy,1,1,'#9aa0b4');P.R(g,px+6,yy,1,1,'#9aa0b4');}P.R(g,px,ih-3,10,3,'#454c5e');}}),x,iy);
  const lx=x+(w>>1)+12,on=ESC_reducido()||((T>>2)%29!==0&&(T>>2)%31!==0);
  ctx.fillStyle=C.tinta;ctx.fillRect(lx,iy,1,7);ctx.fillStyle=on?'#ffe2a0':'#6a5a42';ctx.fillRect(lx-1,iy+7,3,2);
  if(on){ctx.fillStyle='rgba(255,220,150,0.08)';ctx.beginPath();ctx.moveTo(lx,iy+8);ctx.lineTo(lx-22,G);ctx.lineTo(lx+22,G);ctx.fill();ctx.fillStyle='rgba(255,220,150,0.16)';ctx.fillRect(lx-16,G-1,32,1);}
  vigaTren(x,y,w,d);}
function vigaTren(x,y,w,d){ctx.drawImage(ESC_sprite(d,'vigaTren'+w,w+2,10,(g)=>{P.R(g,0,0,w+2,10,C.tinta);P.R(g,1,1,w,7,'#5a6074');P.R(g,1,1,w,1,'#9aa0b4');P.R(g,1,6,w,2,'#454c5e');
  for(let i=4;i<w;i+=8)P.R(g,1+i,3,1,1,'#9aa0b4');for(let i=0;i<w-8;i+=16){P.line(g,1+i,2,1+i+8,6,'#454c5e');P.line(g,1+i+8,6,1+i+16,2,'#454c5e');}}),x-1,y);}
ESC_registrar(LV,def);
})();
