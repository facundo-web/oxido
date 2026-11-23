'use strict';
// Óxido · Escenario de la misión 6, Ciudad de datos (estilo "Hondo", noche de neón). Del Ilustrador de escenarios.
// Va DESPUÉS de js/escenario-base.js y de js/mision6.js / jefes6.js (envuelve los ganchos de M6_LVL; con ?esc=0 queda como antes).
// Guía: notas/arte/guia.md · ficha: notas/arte/fichas/escenarios.md (M6 e "Historia").
// Luz: neón magenta #ff5ad0 y violeta #a890ff. NUNCA cian: es del jugador 2 y del soldado de esta misión.
// Quedan de mision6.js: los anillos de datos (mecánica de REFLEJOS), la pantalla gigante (momento "LA LISTA"), las torres de
// enlace, el pasaje troncal, el andamio de servidores, los bloques del jefe, las coberturas y drawFx (cámara lenta, fallas).
// Historia: bloques de datos con el signo $, etiquetas que flotan como hologramas y "COMPRO TODO" que se corta con fallas.
(()=>{
const P=ESC_px,G=GROUND,LV=M6_LVL;
const C={
  cielo:[[0,'#120a30'],[40,'#1c1040'],[80,'#30185c'],[112,'#4a2278']],
  lejos:'#4a3a8a',lejosDk:'#3e3078',lejos2:'#3e2e7c',lejos2Dk:'#32266a',medio:'#2c2068',medioDk:'#221858',medioHi:'#3e2e82',
  niebla:'#6a4aaa',bruma:'#9a92d4',magenta:'#ff5ad0',violeta:'#a890ff',ambar:'#ffb43a',tinta:'#17141f',frente:'#06041a',
  gTop:'#a890ff',gSurf:'#24185a',g1:'#1a1248',g2:'#160f3e',g3:'#120c34',g4:'#0e0a2a',linea:'#4a36a0',lineaDk:'#2a1e6a',
};
const CIELOS={noche:C.cielo,tarde:[[0,'#1e1036'],[60,'#3a1c58'],[100,'#7a3a6a'],[112,'#9a4a6a']],amanecer:[[0,'#1a1240'],[60,'#3a2a64'],[100,'#7a5a8a'],[112,'#9a7a9a']],dia:[[0,'#2e2a6a'],[60,'#4a428a'],[100,'#7a70aa'],[112,'#9a90c0']]};
const Y0=-40;
const hsh=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
// torre de datos: escalonada, con líneas de luz verticales (violeta o magenta) y celdas
function torre(g,x,base,w,h,col,dk,luz,R){
  let y=base,ww=w,xx=x;for(let p=0;p<3;p++){const ph=Math.floor(h/3);P.R(g,xx,y-ph,ww,ph,col);P.R(g,xx,y-ph,ww,1,dk);
    for(let i=xx+2;i<xx+ww-2;i+=4)if(R()<0.5)P.R(g,i,y-ph+2,1,ph-4,dk);y-=ph;xx+=2;ww-=4;}
  if(luz)P.R(g,x+Math.floor(w/2),base-h+2,1,h-4,luz);
}
// bloque de datos con el signo $ (Historia), en el medio
function bloque$(g,x,y){P.R(g,x,y,12,12,'#2a1e6a');P.R(g,x,y,12,1,'#6a5ab0');P.R(g,x+11,y,1,12,'#1e1650');
  for(const[a,b]of[[1,0],[0,1],[1,1],[2,1],[0,2],[0,3],[1,3],[2,3],[2,4],[0,5],[1,5],[2,5],[1,6]])P.R(g,x+4+a,y+2+b,1,1,'#ffb43a');}
// bloque de datos (jefe y cobertura 'cubo'): tinta, celdas y borde violeta (no cian)
function bloque(g,w,h){const o=1;P.R(g,0,0,w+2,h+1,C.tinta);P.R(g,o,o,w,h,'#4c3d95');for(let r=4;r<h-1;r+=4)for(let c=2;c<w-2;c+=4)if(hsh(r*7+c)<0.3)P.R(g,o+c,o+r,3,1,'#4937a8');
  P.R(g,o,o,w,1,C.violeta);P.R(g,o,o,1,h,'#6a5ab0');P.R(g,o+w-2,o,2,h,'#43359d');}
// andamio de servidores: racks con celdas (se prenden en vivo) o andamio de caños con franja ámbar
function rack(g,w,h,mat){const o=1;
  if(mat==='andamio'){for(let i=2;i<w;i+=12)P.R(g,o+i,o+2,1,h-2,'#54369e');P.R(g,o,o+(h>>1),w,1,'#54369e');for(let i=2;i<w-12;i+=12)P.line(g,o+i,o+2,o+i+12,o+(h>>1),'#54369e');
    P.R(g,0,0,w+2,4,C.tinta);P.R(g,o,o,w,2,'#4b3a9f');for(let i=0;i<w;i+=6)P.R(g,o+i,o,3,1,C.ambar);return;}
  P.R(g,0,0,w+2,h+1,C.tinta);P.R(g,o,o,w,h,'#4a3a9f');for(let i=1;i<w-10;i+=12){P.R(g,o+i,o+1,11,h-1,'#4c3d95');for(let r=3;r<h-2;r+=3)P.R(g,o+i+1,o+r,7,1,'#4d3e8f');P.R(g,o+i+10,o+1,1,h-1,'#4b38a3');}
  P.R(g,o,o,w,1,C.violeta);}
// torre de enlace: mástil de reticulado y una plataforma con borde violeta
function torreEnlace(g,w,hh){const o=2,cx=o+(w>>1);P.line(g,cx-8,hh,cx-3,6,'#4836ac',2);P.line(g,cx+8,hh,cx+3,6,'#4836ac',2);
  for(let yy=12;yy<hh;yy+=10){const k=Math.round((hh-yy)/hh*5);P.line(g,cx-8+k,yy,cx+8-k,yy+10,'#4d399e');P.line(g,cx+8-k,yy,cx-8+k,yy+10,'#4d399e');}
  P.R(g,o-2,0,w+4,8,C.tinta);for(let i=0;i<6;i++)P.R(g,o-1+i,1+i,w+2-2*i,1,'#4b3a9f');P.R(g,o-1,1,w+2,1,C.violeta);P.R(g,o+5,6,w-10,1,'#6a5ab0');}
const BRUMA_PIE={noche:0.6,lluvia:1.03,amanecer:0.6,tarde:0.6,dia:0.52,otra:0.56}; /* franja 0,14 (Dirección: la tinta de los soldados de M6 la pone Personajes) */ // fuerza de la meseta de bruma al pie (se ajusta midiendo)
const def={
  halosAltos:{col:C.bruma,a:0.92,r:20,plano:true,alto:40}, // de noche, halo CORTO detrás de cada plataforma alta (sin bruma alta general)
  pix:1,nat:'noche',semilla:66,paso:'pixel',
  atm:{col:C.niebla,fuerza:0.03,pie:0},
  luzPersonajes:{calida:'#ff5ad0',lado:-1,fria:'#a890ff'},
  sombra:'#04031a',
  oscPersonajes:0,
  ambientes:{
    base:{oscuridad:0.12,oscCol:'#04031a'},
    amanecer:{tinte:'#c090c0',tinteA:0.1,modo:'overlay',luces:0.7,oscuridad:0.05},
    dia:{tinte:'#9a90d0',tinteA:0.2,modo:'screen',luces:0.5,oscuridad:0},
    tarde:{tinte:'#c08090',tinteA:0.1,modo:'overlay',luces:0.8,oscuridad:0.06},
    limpio:{reemplazar:true,tintes:[['screen','#3a2a7a',0.25]],oscuridad:0,luces:0.7},
  },
  capas:[
    // 1 · cielo: escalones, grilla lejana muy tenue y cubos de datos que flotan
    {id:'cielo',cielo:true,segunAmb:true,ancho:W,y:Y0,alto:G-Y0+4,dibujar(g,w,h,R,c,a){
      const hz=a&&CIELOS[a.hora]?a.hora:'noche',st=CIELOS[hz].map(([y,col])=>[y-Y0,col]);st.unshift([0,st[0][1]]);P.escalones(g,w,h,st,4);
      g.globalAlpha=0.18;for(let x=0;x<w;x+=24)P.R(g,x,0,1,h-40,'#6a5ab0');for(let y=20;y<h-40;y+=16)P.R(g,0,y,w,1,'#6a5ab0');g.globalAlpha=1;
      for(let i=0;i<9;i++){const x=Math.floor(hsh(i*3.1)*w),y=Math.floor(hsh(i*7.3)*60)-Y0+10,s=2+Math.floor(hsh(i)*3);P.R(g,x,y,s,1,C.violeta);P.R(g,x,y,1,s,C.violeta);P.R(g,x,y+s,s,1,'#6a5ab0');P.R(g,x+s,y,1,s+1,'#6a5ab0');}}},
    // 2 · lejos: torres con líneas de luz
    {id:'lejos',par:0.08,ancho:640,y:40,alto:G-40,pie:'auto',nieblaPie:0,luces:Array.from({length:6},(_,i)=>({x:40+i*105,y:30+(i%3)*12,r:5,col:i%2?C.magenta:C.violeta,fuerza:0.45,tipo:'neon'})),
      dibujar(g,w,h,R){let x=0;while(x<w){const bw=14+Math.floor(R()*20),bh=30+Math.floor(R()*60);torre(g,x,h-30,bw,bh,C.lejos,C.lejosDk,R()<0.4?(R()<0.5?'#c070c0':'#8a7ad0'):null,R);x+=bw+2+Math.floor(R()*10);}
        P.R(g,0,h-30,w,30,C.lejosDk);P.banda(g,w,h-70,h-26,C.niebla,0,0.32);}},
    // 3 · lejos 2: más torres, más cerca
    {id:'lejos 2',par:0.2,ancho:720,y:60,alto:G-60,pie:'auto',nieblaPie:0,dibujar(g,w,h,R){let x=0;while(x<w){const bw=18+Math.floor(R()*24),bh=24+Math.floor(R()*50);torre(g,x,h-16,bw,bh,C.lejos2,C.lejos2Dk,R()<0.3?'#b060c0':null,R);x+=bw+4+Math.floor(R()*14);}
      P.R(g,0,h-16,w,16,C.lejos2Dk);P.banda(g,w,h-50,h-12,C.niebla,0,0.28);}},
    // 4 · medio: torres de bloques con celdas, bloques $ que flotan, etiquetas holograma y el cartel COMPRO TODO con fallas
    {id:'medio',par:0.4,ancho:900,y:40,alto:G-40,pie:'auto',nieblaPie:0,lucesEncima:true,dibujar(g,w,h,R,c){
      const base=h-10;c.luces=[];let x=10;
      while(x<w-30){const bw=24+Math.floor(R()*24),bh=30+Math.floor(R()*50);P.R(g,x,base-bh,bw,bh+10,C.medio);P.R(g,x,base-bh,bw,1,C.medioHi);P.R(g,x+bw-1,base-bh,1,bh,C.medioDk);
        for(let wy=base-bh+4;wy<base-4;wy+=5)for(let wx=x+3;wx<x+bw-3;wx+=4){const v=R();P.R(g,wx,wy,2,2,v<0.06?C.magenta:v<0.12?C.violeta:C.medioDk);
          if(v<0.03)c.luces.push({x:wx+1,y:wy+1,r:4,col:C.magenta,fuerza:0.35,tipo:'ventana'});}
        x+=bw+6+Math.floor(R()*16);}
      P.R(g,0,base,w,10,C.medioDk);P.banda(g,w,base-30,base+4,C.niebla,0,0.18);},
      // COMPRO TODO: cartel de neón magenta en el medio, que se corta con fallas de imagen (quieto con MOVIMIENTO REDUCIDO)
      vivo(c2,ox,oy,c){ESC_cada(c,ox,380,60,x=>{const X=Math.round(x),Y=Math.round(oy+20),t=typeof pfLienzo==='function'?pfLienzo('COMPRO TODO','#ff5ad0'):null;if(!t)return;
        const falla=!ESC_reducido()&&hsh((T>>3)+7)<0.12;c2.fillStyle='#120a30';c2.fillRect(X-2,Y-2,t.width+4,t.height+3);
        if(falla){const k=2+Math.floor(hsh(T>>1)*3);c2.drawImage(t,0,0,t.width,k,X+2,Y,t.width,k);c2.drawImage(t,0,k,t.width,t.height-k,X-1,Y+k,t.width,t.height-k);}else c2.drawImage(t,X,Y);
        ESC_H.etiqueta(c2,X+t.width+2,Y-6);});
        // etiquetas $ que flotan como hologramas, subiendo despacio
        c2.globalAlpha=0.55;{const yy=Math.round(oy+30+((T*0.15)%50));ESC_cada(c,ox,700,10,x=>ESC_H.etiqueta(c2,Math.round(x),yy));}c2.globalAlpha=1;
        // un solo bloque de datos con el $ en toda la misión (no se repite con la capa)
        {const bx=1000+ox;if(bx>-20&&bx<VW+20){const g2=c2;const b=ESC_sprite(ESC_def(),'bloque$',12,12,(g)=>bloque$(g,0,0));g2.drawImage(b,Math.round(bx),Math.round(oy+24));}}}},
    // 5 · bruma al pie (regla 2): violeta azulado, nunca cian
    {id:'bruma',par:0.7,parY:1,ancho:W,y:88,alto:G-88+2,pie:'auto',niebla:0,nieblaPie:0,segunAmb:true,dibujar(g,w,h,R,c,a){
      // bruma al pie en MESETA (guía §9): 0 en y 88, llena en y 110 y pareja hasta el piso; apunta a 0,13–0,16 en la franja de los personajes
      const A=a&&a.hora==='noche'?BRUMA_PIE.noche*(a.clima==='lluvia'||a.clima==='tormenta'?BRUMA_PIE.lluvia:1):(a&&BRUMA_PIE[a.hora]!=null?BRUMA_PIE[a.hora]:BRUMA_PIE.otra);
      for(let y=0;y<h;y++){const u=Math.min(1,y/22),sm=u*u*(3-2*u);g.globalAlpha=A*sm;g.fillStyle=C.bruma;g.fillRect(0,y,w,1);}g.globalAlpha=1;}},
  ],
  // primer plano: antenas y cables en los costados, un cartel de espaldas arriba en una esquina; abajo, borde de vereda (vivo)
  frente:{par:1.4,parY:1.15,alfa:1,ancho:900,piezas:[
    {x:30,y:0,w:20,h:60,abajo:true,dibujar(g,w,h){P.line(g,4,h,10,0,C.frente,2);P.line(g,16,h,10,0,C.frente,2);for(let y=10;y<h;y+=10)P.R(g,6,y,8,1,C.frente);P.R(g,8,0,4,3,C.frente);}},
    {x:500,y:0,w:28,h:12,abajo:true,dibujar(g,w,h){P.R(g,0,4,28,8,C.frente);P.R(g,4,0,6,4,C.frente);P.R(g,18,2,6,2,C.frente);}},
    {x:260,y:0,w:56,h:26,arriba:true,dibujar(g,w,h){P.R(g,0,0,w,4,C.frente);P.R(g,10,4,2,6,C.frente);P.R(g,44,4,2,6,C.frente);P.R(g,4,10,48,16,C.frente);P.R(g,6,12,44,1,'#1a1240');}},
  ],
    vivo(c2,d,par,ac){const dx=camX*(1-par),bot=Math.floor(camY+VH),x0=camX-dx-20,x1=camX+VW-dx+20;c2.globalAlpha=ac;c2.fillStyle=C.frente;
      for(let k=Math.floor(x0/30);k<=x1/30;k++){if(hsh(k*2.3)<0.35)continue;const X=Math.round(k*30+dx),borde=Math.min(X-camX,camX+VW-X),h=borde>VW*0.15?3:7;c2.fillRect(X,bot-h,18,h);}
      c2.globalAlpha=1;}},
  // piso: vereda con borde violeta, calle con grilla luminosa fina en perspectiva y marcas ámbar; celdas que se encienden (sin cian)
  piso(c2,x0,x1){
    const bot=Math.max(H,Math.ceil(camY+VH)+2),w=x1-x0;
    P.R(c2,x0,G,w,1,C.gTop);P.R(c2,x0,G+1,w,4,C.gSurf);P.R(c2,x0,G+5,w,1,C.lineaDk);P.R(c2,x0,G+6,w,bot-G-6,C.g2);P.R(c2,x0,G+14,w,bot-G-14,C.g3);P.R(c2,x0,G+20,w,bot-G-20,C.g4);
    for(let x=Math.floor(x0/12)*12;x<x1;x+=12)P.R(c2,x,G+1,1,4,C.lineaDk);
    for(const y of[G+8,G+12,G+17,G+23])P.R(c2,x0,y,w,1,C.lineaDk);
    const cx=Math.round(camX+VW/2);for(let x=Math.floor(x0/16)*16-96;x<x1+96;x+=16)P.line(c2,x,G+6,cx+(x-cx)*1.9,H,C.linea);
    for(let x=Math.floor(x0/48)*48-48;x<x1+48;x+=48)P.R(c2,x+10,G+14,14,1,'#a07030');
    for(let t=Math.floor(x0/16);t<x1/16;t++){const h=hsh(t*31+((T>>4)|0));if(h<0.05){c2.fillStyle=h<0.015?C.ambar:C.violeta;c2.globalAlpha=0.35;c2.fillRect(t*16+4,G+9,10,2);c2.globalAlpha=1;}}
  },
  luces(lv){return lv.decor.filter(o=>o.k==='farol'||o.k==='cartel').map(o=>o.k==='farol'?{x:o.x+7,y:G-33,r:40,col:o.x%2?C.violeta:C.magenta,fuerza:0.55,tipo:'farol'}:{x:o.x+14,y:G-24,r:20,col:C.magenta,fuerza:0.4,tipo:'neon'});},
  decor(o,d){
    const g=G,x=Math.round(o.x),spr=(k,w,h,fn,dx,dy)=>ctx.drawImage(ESC_sprite(d,k,w,h,fn),x+dx,g+dy);
    switch(o.k){
    case 'farol':{const col=o.x%2?C.violeta:C.magenta;ESC_sombraContacto(d,x+4,6,g,0.6);
      spr('farol'+col,12,36,(s)=>{P.R(s,3,2,3,34,C.tinta);P.R(s,4,2,1,34,'#4e3d91');P.R(s,0,0,11,4,C.tinta);P.R(s,6,1,4,2,col);P.R(s,1,33,7,3,C.tinta);},-1,-36);return true;}
    case 'poste':ESC_sombraContacto(d,x+1,4,g,0.6);
      spr('poste',20,50,(s)=>{P.R(s,8,2,4,48,C.tinta);P.R(s,9,2,1,48,'#4e3d91');P.R(s,2,6,16,2,C.tinta);P.R(s,9,0,2,2,C.ambar);},-9,-50);
      {const ph=(T%80)/80;ctx.fillStyle=C.violeta;ctx.fillRect(Math.round(x+9+ph*40),Math.round(g-44+Math.sin(ph*Math.PI)*8),2,1);ctx.fillStyle='#4f389f';for(let i=0;i<40;i+=2)ctx.fillRect(x+9+i,Math.round(g-44+Math.sin(i/40*Math.PI)*8),2,1);}
      return true;
    case 'terminal':ESC_sombraContacto(d,x+6,12,g,0.6);
      spr('terminal',14,22,(s)=>{P.R(s,0,0,14,22,C.tinta);P.R(s,1,1,12,21,'#4c3f8c');P.R(s,1,1,12,1,'#4e3d91');P.R(s,3,3,8,7,'#1d1551');P.R(s,3,12,8,1,'#4836ac');P.R(s,3,14,8,1,'#4836ac');},-1,-22);
      for(let i=0;i<4;i++){const h=1+Math.floor(Math.abs(Math.sin(T/14+i*1.3+x))*5);ctx.fillStyle=i===2?C.ambar:C.violeta;ctx.fillRect(x+3+i*2,g-12-h,1,h);}return true;
    case 'antena':ESC_sombraContacto(d,x+5,10,g,0.6);
      spr('antena',12,56,(s)=>{P.line(s,1,56,6,4,C.tinta,2);P.line(s,11,56,6,4,C.tinta,2);for(let y=48;y>8;y-=8){const k=Math.floor((56-y)/56*5);P.line(s,1+k,y,11-k,y-8,'#4f389f');}},-1,-56);
      {ctx.fillStyle=(T>>3)%2?C.magenta:'#ffffff';ctx.fillRect(x+4,g-55,2,2);}return true;
    case 'cartel':ESC_sombraContacto(d,x+14,26,g,0.5);
      spr('cartelM6',28,30,(s)=>{P.R(s,4,12,2,18,C.tinta);P.R(s,22,12,2,18,C.tinta);P.R(s,0,0,28,12,C.tinta);P.R(s,1,1,26,10,'#1d1551');P.R(s,1,1,26,1,C.magenta);P.R(s,1,10,26,1,C.magenta);},0,-30);
      for(let i=0;i<4;i++){const ax=x+3+Math.floor((T*0.4+i*7)%22);ctx.fillStyle=i%2?C.ambar:C.violeta;ctx.fillRect(ax,g-25,1,3);ctx.fillRect(ax+1,g-24,1,2);}return true;
    }
    return false; // anillos de datos (REFLEJOS): son de mision6.js
  },
  plat(pl,d){
    if(pl.roof&&pl.roof.k==='troncal'){troncalFondo(pl,d);return true;}
    if(pl.ar||pl.salaAr||pl.roof||pl.hi==='pantalla')return false; // pantalla (momento "LA LISTA") y pasaje troncal: de mision6.js
    {const x=Math.round(pl.x),y=Math.round(pl.y),w=Math.round(pl.w),hh=G-y;
      if(pl.step){ESC_sombraContacto(d,x+w/2,w,G,0.6);ctx.drawImage(ESC_sprite(d,'bloqueM6'+w+'x'+hh,w+2,hh+1,(g)=>bloque(g,w,hh)),x-1,y-1);
        if(hash((x|0)+((T>>4)|0))<0.4){ctx.fillStyle=C.ambar;ctx.fillRect(x+3,y+2,2,1);}return true;}
      if(pl.pyr){const h=pl.pyr.dy;ctx.drawImage(ESC_sprite(d,'rack'+pl.mat+w+'x'+h,w+2,h+1,(g)=>rack(g,w,h,pl.mat)),x-1,y-1);
        if(pl.mat!=='andamio')for(let i=x+1,k=0;i<x+w-10;i+=12,k++)for(let r=y+3,j=0;r<y+h-2;r+=3,j++){const on=hash(((i*13+j*7)|0)+((T>>3)|0))<0.35;if(on){ctx.fillStyle=j%3===1?C.ambar:C.violeta;ctx.fillRect(i+8,r,1,1);}}
        return true;}
      if(pl.hi==='torre'){const cx=x+(w>>1);for(const lx of[cx-8,cx+8])ESC_sombraContacto(d,lx,3,G,0.5);
        ctx.drawImage(ESC_sprite(d,'torreEnlace'+w+'x'+hh,w+4,hh+2,(g)=>torreEnlace(g,w,hh)),x-2,y-1);
        if(!ESC_reducido()){const yy=Math.round(G-((T*1.2)%(hh-6)));ctx.fillStyle='#d0c0ff';ctx.fillRect(cx-1,yy,2,2);}
        for(let i=0;i<4;i++){ctx.fillStyle=((T>>3)+i)%4===0?C.ambar:'#54369e';ctx.fillRect(x+6+Math.round(i*(w-12)/3)-1,y+3,2,1);}
        return true;}}
    // pasarela de luz: losa con borde violeta sostenida por un haz violeta (no cian)
    const x=Math.round(pl.x),y=Math.round(pl.y),w=Math.round(pl.w),hh=G-y;
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.18;ctx.fillStyle=C.violeta;ctx.fillRect(x+(w>>1)-5,y+5,10,hh-5);ctx.globalAlpha=0.35;ctx.fillRect(x+(w>>1),y+5,1,hh-5);ctx.restore();
    if(!ESC_reducido())for(let i=0;i<3;i++){const yy=Math.round(y+6+((T*0.5+i*hh/3)%(hh-7)));ctx.fillStyle='#d0c0ff';ctx.fillRect(x+(w>>1)-2,yy,4,1);}
    ctx.drawImage(ESC_sprite(d,'losaM6'+w,w+2,7,(g)=>{P.R(g,0,0,w+2,7,C.tinta);P.R(g,1,1,w,4,'#4836ac');P.R(g,1,1,w,1,C.violeta);P.R(g,1,4,w,1,'#4837ab');for(let i=6;i<w;i+=8)P.R(g,1+i,2,1,2,'#4e3d91');}),x-1,y-1);
    return true;
  },
  // frente del pasaje troncal (gancho L.drawTunnelFront): velo leve, tubo de luz violeta (sin cian) y la losa
  tunelFrente(t,d){if(t.k!=='troncal')return false;const x=Math.round(t.x),w=Math.round(t.w),iy=Math.round(t.y)+9;
    ctx.fillStyle='rgba(12,8,40,0.18)';ctx.fillRect(x,iy,w,G-iy);ctx.fillStyle='rgba(12,8,40,0.3)';ctx.fillRect(x,iy,w,3);
    if(ESC_reducido()||hash(((T>>2)+7)|0)>0.05){ctx.fillStyle='#e0d4ff';ctx.fillRect(x+(w>>1)-10,iy+1,20,1);ctx.fillStyle='rgba(168,144,255,0.07)';ctx.fillRect(x+(w>>1)-20,iy+2,40,G-iy-2);}
    losaTroncal(x,Math.round(t.y),w,d);return true;},
  cobertura(c,d){if(c.vida<=0)return false;const x=Math.round(c.x),w=Math.round(c.w),h=Math.round(c.h),top=G-h;
    if(c.k==='barra'){ESC_sombraContacto(d,x+w/2,w,G,0.6); // barrera de luz: marco con franjas ámbar en escalones
      ctx.drawImage(ESC_sprite(d,'barraM6'+w+'x'+h,w+2,h+1,(g)=>{P.R(g,0,0,w+2,h+1,C.tinta);P.R(g,1,1,w,h-1,'#4a3c8c');P.R(g,1,1,w,1,'#e0d0a0');
        for(let i=0;i<w;i+=6)for(let k=0;k<h-4;k+=2)P.R(g,1+((i+(k>>1))%w),2+k,3,2,C.ambar);P.R(g,1,h-2,w,2,'#3a2e74');}),x-1,top-1);}
    else if(c.k==='pilar'){ESC_sombraContacto(d,x+w/2,w,G,0.6); // pilar de datos: celdas violetas que se prenden
      ctx.drawImage(ESC_sprite(d,'pilarM6'+w+'x'+h,w+2,h+1,(g)=>{P.R(g,2,0,w-2,h+1,C.tinta);P.R(g,0,0,w+2,4,C.tinta);P.R(g,1,1,w,2,'#5a48b0');P.R(g,1,1,w,1,C.violeta);
        P.R(g,3,3,w-4,h-3,'#54469c');P.R(g,3,3,1,h-3,'#6e5cc4');P.R(g,0,h-2,w+2,3,C.tinta);P.R(g,1,h-1,w,1,'#4a3c8c');}),x-1,top-1);
      for(let r=top+5;r<G-3;r+=3){const on=!ESC_reducido()&&hash(((r*3+x)|0)+((T>>4)|0))<0.4;ctx.fillStyle=on?C.violeta:'#6e5cc4';ctx.fillRect(x+4,r,w-8,1);}}
    else if(c.k==='cubo'){ESC_sombraContacto(d,x+w/2,w,G,0.6);ctx.drawImage(ESC_sprite(d,'cubo'+w+'x'+h,w+2,h+1,(g)=>bloque(g,w,h)),x-1,top-1);}
    else return false;
    if(c.vida<c.max*0.5){ctx.fillStyle=C.tinta;ctx.fillRect(x+Math.round(w*0.25),top+1,1,Math.round(h*0.5));ctx.fillRect(x+Math.round(w*0.7),top,2,2);}return true;},
  caja(c,d){return ESC_H.caja(c,d);},
};
// pasaje troncal por dentro (gancho L.drawPlat con roof): paredes de celdas, cables con pulsos ámbar y violeta (sin cian)
function troncalFondo(pl,d){const x=Math.round(pl.x),y=Math.round(pl.y),w=Math.round(pl.w),iy=y+9,ih=G-iy;
  ctx.drawImage(ESC_sprite(d,'troncal'+w+'x'+ih,w,ih,(g)=>{P.R(g,3,0,w-6,ih,'#463a8a');for(let r=2;r<ih-2;r+=5)for(let c=5;c<w-6;c+=7)P.R(g,c,r,6,4,'#54469c');
    for(const px of[2,(w>>1)-4,w-12]){P.R(g,px,0,10,ih,C.tinta);P.R(g,px+1,0,8,ih,'#4a3c8c');P.R(g,px+1,0,1,ih,'#7a68c8');}
    for(let k=0;k<3;k++)P.R(g,3,6+k*8,w-6,1,'#5a48b0');}),x,iy);
  if(!ESC_reducido())for(let k=0;k<3;k++){const ph=Math.floor((T*(1.2+k*0.4)+k*40)%(w-6));ctx.fillStyle=k===1?C.ambar:C.violeta;ctx.fillRect(x+3+ph,iy+6+k*8,4,1);}
  ctx.fillStyle=C.tinta;ctx.fillRect(x,y-6,w,5);ctx.fillStyle='#4a3c8c';ctx.fillRect(x,y-5,w,3);ctx.fillStyle=C.violeta;ctx.fillRect(x,y-5,w,1); // cable troncal arriba
  losaTroncal(x,y,w,d);}
function losaTroncal(x,y,w,d){ctx.drawImage(ESC_sprite(d,'losaTr'+w,w+2,10,(g)=>{P.R(g,0,0,w+2,10,C.tinta);P.R(g,1,1,w,7,'#4c3d95');P.R(g,1,1,w,1,C.violeta);P.R(g,1,6,w,2,'#3a2e74');
  for(let i=8;i<w;i+=16)P.R(g,1+i,3,10,2,'#5a48b0');for(let i=12;i<w;i+=32)P.R(g,1+i,4,2,1,C.ambar);}),x-1,y);}
ESC_registrar(LV,def);
})();
