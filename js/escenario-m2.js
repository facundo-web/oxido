'use strict';
// Óxido · Escenario de la misión 2, Puerto Ceniza (estilo "Hondo", noche). Del Ilustrador de escenarios.
// Va DESPUÉS de js/escenario-base.js y de js/caminos-m2.js (así su envoltorio de LEVELS[1].drawBG queda por fuera de
// los de guinos.js, momentos.js y caminos-m2.js; con ?esc=0 todo queda como antes).
// Guía: notas/arte/guia.md · ficha: notas/arte/fichas/escenarios.md (M2 e "Historia").
// Mirando al mar desde el muelle: cielo bajo con nubes, ciudad en la otra orilla, grúas de puerto y un portacontenedores,
// la barcaza de la banda, el muelle de enfrente con contenedores y la fundición, el agua cerca y la bruma al pie.
// Luz: faroles de sodio (derecha) con cono hacia abajo y reflejo en las tablas mojadas.
// Estado que puede mover el momento "LA BARCAZA" (momentos.js): ESC_M2.barcaza = {x, cajonY, humo, se_va}.
const ESC_M2={barcaza:{x:150,cajonY:-1,humo:0,se_va:0}};
(()=>{
const P=ESC_px,G=GROUND,LV=LEVELS[1];
const C={
  cielo:[[0,'#0a1022'],[40,'#101a34'],[80,'#1c2a4a'],[112,'#2a3a5e']],
  lejos:'#4a5a80',lejosVen:'#c8a070',lejos2:'#44547a',lejos2Dk:'#3a4870',niebla:'#5a6a90',
  medio:'#4a5a80',muelleEnf:'#40507a',mar:'#2a3858',marHi:'#3e5076',marHi2:'#5a6e96',bruma:'#96a6cc',
  nube:'#16203c',nubeHi:'#26324f',frente:'#05070e',tinta:'#17141f',juego:'#0e1424',
  sodio:'#ffb050',sodioC:'#ffd890',fundicion:'#ffa040',
  gTop:'#8a98b8',gSurf:'#3a4258',g1:'#262c40',g2:'#1e2334',g3:'#181c2a',g4:'#12151f',gLine:'#0c0f18',gHi:'#4a5470',
  hierro:'#46506a',hierroHi:'#6a7490',soga:'#8a7050',sogaDk:'#5b4731',
  mad:'#6f3d37',madHi:'#e8a060',madDk:'#66404f',amarillo:'#c9a43a',amarilloDk:'#6a5420',
};
// contenedores: los colores del juego, apagados hacia el azul de la noche
const CONT={'#8c3b2a':['#b06a58','#e0a080','#8a4a3e'],'#2f6a8a':['#3a5a78','#6a8cac','#2e4a66'],
  '#b07a2a':['#8a6a34','#b8964c','#6a5228'],'#3a7a4a':['#3a6450','#62907a','#2e5040']};
const contCol=c=>CONT[c]||CONT['#2f6a8a'];
const CIELOS={
  noche:C.cielo,
  tarde:[[0,'#1c1a3a'],[50,'#3a3050'],[90,'#8a5a5a'],[112,'#c87a5a']],
  amanecer:[[0,'#1a1e44'],[50,'#3a3a64'],[90,'#8a6a8a'],[112,'#d0908a']],
  dia:[[0,'#3a4a6a'],[50,'#5a6a88'],[90,'#8a98b0'],[112,'#a8b4c4']],
};
const Y0=-40;
const hsh=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
function tramo(st,y){let i=0;while(i<st.length-2&&y>=st[i+1][0])i++;const a=ESC_rgb(st[i][1]),b=ESC_rgb(st[i+1][1]),t=Math.min(1,Math.max(0,(y-st[i][0])/((st[i+1][0]-st[i][0])||1)));return`rgb(${a.map((v,k)=>Math.round(v+(b[k]-v)*t))})`;}
// grúa de puerto (pórtico): dos patas en A, viga larga hacia el mar, cabina y tirantes
function portico(g,x,base,h,col,dk){
  const top=base-h;P.R(g,x,top+10,2,h-10,col);P.R(g,x+18,top+10,2,h-10,col);
  P.line(g,x,base,x+9,top+20,col);P.line(g,x+19,base,x+10,top+20,col);
  for(let y=top+18;y<base-4;y+=10){P.line(g,x+1,y,x+18,y+8,dk);P.line(g,x+18,y,x+1,y+8,dk);}
  P.R(g,x-30,top+10,80,3,col);P.R(g,x-30,top+13,80,1,dk);
  P.R(g,x+6,top,8,10,col);P.line(g,x+10,top,x-28,top+10,col);P.line(g,x+10,top,x+48,top+10,col);
  P.R(g,x+2,top+14,6,5,col);P.R(g,x+3,top+15,2,1,'#c8a070');
  P.line(g,x-16,top+13,x-16,top+30,dk);P.R(g,x-19,top+30,7,4,col);
}
// barco portacontenedores: casco largo, contenedores apilados y el castillo con dos ventanas
function barco(g,x,base,col,dk){
  P.R(g,x,base-8,150,8,col);P.R(g,x-4,base-8,6,4,col);P.R(g,x+146,base-12,8,8,col);
  for(let i=0;i<11;i++){const hh=4+(i%3)*4;P.R(g,x+6+i*11,base-8-hh,10,hh,i%2?dk:col);P.R(g,x+6+i*11,base-8-hh,10,1,'#56668e');}
  P.R(g,x+122,base-26,18,18,col);P.R(g,x+124,base-24,4,2,'#c8a070');P.R(g,x+132,base-24,4,2,'#c8a070');P.R(g,x+130,base-32,2,6,col);
}
// la barcaza de la banda (Historia): casco bajo, una grúa chica y el cajón con luz dorada por las rendijas
function barcaza(c2,x,y,b){
  const ink=C.tinta,col='#2e3a56',dk='#222c44';
  c2.fillStyle=ink;c2.fillRect(x-1,y-6,62,7);c2.fillStyle=col;c2.fillRect(x,y-5,60,5);c2.fillStyle='#4a5878';c2.fillRect(x,y-5,60,1);
  c2.fillStyle=ink;c2.fillRect(x+44,y-14,12,9);c2.fillStyle=dk;c2.fillRect(x+45,y-13,10,8);c2.fillStyle='#c8a070';c2.fillRect(x+47,y-11,2,2);c2.fillRect(x+51,y-11,2,2);
  c2.fillStyle=dk;c2.fillRect(x+52,y-20,2,6); // chimenea
  if(b.tasador!==false)ESC_H.tasador(c2,x+34,y-19,'#141a2c'); // EL TASADOR en la cubierta
  // grúa de a bordo y el cajón (en cubierta o colgando)
  c2.fillStyle=dk;c2.fillRect(x+8,y-28,2,23);c2.fillRect(x+8,y-28,22,2);c2.fillRect(x+28,y-26,1,b.cajonY>=0?b.cajonY:6);
  const cy=b.cajonY>=0?y-26+b.cajonY:y-13,cx=b.cajonY>=0?x+24:x+20;
  c2.fillStyle=ink;c2.fillRect(cx-1,cy-1,12,10);c2.fillStyle='#5a3a2a';c2.fillRect(cx,cy,10,8);c2.fillStyle='#ffd070';
  for(let i=1;i<10;i+=3)c2.fillRect(cx+i,cy+2,1,4); // luz dorada por las rendijas
  // humo de la chimenea cuando toca la bocina o se va
  if(b.humo>0.02)for(let k=0;k<5;k++){const a=((T*0.4+k*9)%40)/40;c2.globalAlpha=b.humo*0.5*(1-a);c2.fillStyle='#5a6a90';c2.fillRect(Math.round(x+53+a*10),Math.round(y-21-a*14),2+Math.round(a*3),2);}
  c2.globalAlpha=1;
}

const BRUMA_PIE={noche:0.5,lluvia:1.0,amanecer:0.5,tarde:0.5,dia:0.38,otra:0.5}; // fuerza de la meseta de bruma al pie (se ajusta midiendo)
const def={
  halosAltos:{col:'#96a6cc',a:0.92,r:20,plano:true,alto:40}, // de noche, luz suave detrás de las plataformas altas (regla de Arte)
  pix:1,nat:'noche',semilla:22,paso:'pixel',
  atm:{col:C.niebla,fuerza:0.03,pie:0},
  luzPersonajes:{calida:'#ffb050',lado:1,fria:'#8aa0d0'},
  sombra:'#04060c',
  oscPersonajes:0.3,
  ambientes:{
    base:{oscuridad:0.14,oscCol:'#04060e'},
    amanecer:{tinte:'#d090a0',tinteA:0.1,modo:'overlay',luces:0.5,oscuridad:0.06},
    dia:{tinte:'#8a9ab8',tinteA:0.25,modo:'screen',luces:0.25,oscuridad:0},
    tarde:{tinte:'#c08060',tinteA:0.1,modo:'overlay',luces:0.7,oscuridad:0.08},
    // "sin óxido" para los créditos (Historia): colores limpios, sin bruma sucia
    limpio:{reemplazar:true,tintes:[['screen','#2a4a7a',0.25]],oscuridad:0,luces:0.6},
    // lluvia: el mismo tinte que la base, pero sin apagar las luces de la ciudad (blindaje de la franja de los personajes)
    lluvia:{tinte:'#6a7488',tinteA:0.22,modo:'multiply',nieblaMas:0.14,luces:1},
  },
  capas:[
    // 1 · cielo: escalones de 4 px y nubes bajas en escalones
    {id:'cielo',cielo:true,segunAmb:true,ancho:W,y:Y0,alto:G-Y0+4,dibujar(g,w,h,R,c,a){
      const hz=a&&CIELOS[a.hora]?a.hora:'noche',st=CIELOS[hz].map(([y,col])=>[y-Y0,col]);st.unshift([0,st[0][1]]);
      P.escalones(g,w,h,st,4);
      if(hz==='noche')for(let i=0;i<24;i++){g.fillStyle=hsh(i*9)<0.3?'#a8b0d8':'#5a6290';g.fillRect(Math.floor(hsh(i*3.1)*w),Math.floor(hsh(i*7.3)*40)-Y0,1,1);}
      // nubes bajas: franjas apiladas en escalones, con el borde de abajo un poco más claro
      const nube=hz==='dia'?'#7a88a4':hz==='noche'?C.nube:'#3a3454',hi=hz==='dia'?'#9aa6bc':hz==='noche'?C.nubeHi:'#5a4a64';
      for(let i=0;i<7;i++){const cy=6+i*9+Math.floor(hsh(i*5)*6)-Y0,cx=Math.floor(hsh(i*4)*w)-30,cw=60+Math.floor(hsh(i*2)*80);
        for(let k=0;k<3;k++){const ww=cw-k*18,xx=cx+k*9+Math.floor(hsh(i*7+k)*6);P.R(g,xx,cy-k*3,ww,3,nube);}
        P.R(g,cx+4,cy+3,cw-12,1,hi);}}},
    // 2 · lejos: la ciudad de la otra orilla, con pocas ventanas
    {id:'lejos',par:0.06,ancho:640,y:80,alto:G-80,pie:'auto',nieblaPie:0,dibujar(g,w,h,R){
      P.siluetas(g,w,R,44,4,22,C.lejos,0.04,C.lejosVen,[8,18],6);
      P.R(g,0,44,w,h-44,C.mar);
      P.banda(g,w,26,50,C.niebla,0,0.35);}},
    // 3 · lejos 2: grúas de puerto y un portacontenedores sobre el agua del horizonte
    {id:'lejos 2',par:0.16,ancho:800,y:40,alto:G-40,pie:'auto',nieblaPie:0,
      luces:[{x:76,y:52,r:4,col:'#c8a070',fuerza:0.4,tipo:'ventana'},{x:520,y:58,r:4,col:'#c8a070',fuerza:0.4,tipo:'ventana'}],
      dibujar(g,w,h){
        P.R(g,0,86,w,h-86,C.mar);for(let y=88;y<h;y+=3)P.R(g,0,y,w,1,y%2?C.marHi:C.mar);
        portico(g,60,90,72,C.lejos2,C.lejos2Dk);portico(g,330,90,64,C.lejos2,C.lejos2Dk);portico(g,700,90,76,C.lejos2,C.lejos2Dk);
        barco(g,400,92,C.lejos2,C.lejos2Dk);
        P.banda(g,w,60,96,C.niebla,0,0.3);},
},
    // 4 · medio: el muelle de enfrente con contenedores apilados (rótulos apagados) y la fundición de la banda
    {id:'medio',par:0.38,ancho:900,y:70,alto:G-70,pie:'auto',nieblaPie:0,lucesEncima:true,dibujar(g,w,h,R,c){
      const base=66;c.luces=[];
      P.R(g,0,base,w,5,C.muelleEnf);P.R(g,0,base,w,1,'#56648a');for(let x=4;x<w;x+=16)P.R(g,x,base+1,2,4,'#2a3450');
      let x=10;while(x<w-30){
        if(x>380&&x<470){ // la fundición: galpón, chimenea y la boca con crisoles al rojo naranja
          P.R(g,400,base-30,56,30,C.medio);P.R(g,396,base-34,64,4,C.medio);P.R(g,440,base-52,6,18,C.medio);
          P.R(g,412,base-18,24,18,'#1e2638');for(const cx of[416,424,432]){P.R(g,cx-2,base-8,5,5,'#5a3a2a');P.R(g,cx-1,base-9,3,1,C.fundicion);}
          P.R(g,412,base-18,24,1,'#ffb060');c.luces.push({x:424,y:base-8,r:30,col:C.fundicion,fuerza:0.55,tipo:'fuego'},{x:424,y:base-10,r:10,col:'#ffc070',fuerza:0.6,tipo:'fuego'});
          P.R(g,404,base-26,6,3,'#c8a070');P.R(g,446,base-26,6,3,'#c8a070');for(let i=0;i<5;i++){P.R(g,462+i*5,base-3,4,3,'#2a2a36');P.R(g,463+i*5,base-3,2,1,i<2?'#ffa040':'#5a4a3a');} // moldes de lingote
          x=480;continue;}
        const pilas=1+Math.floor(R()*4),ancho=20;
        for(let k=0;k<pilas;k++){const cols=[['#565a74','#6e7290'],['#34466a','#4a6088'],['#3e5648','#587262'],['#64503e','#806a52'],['#2e3854','#424e70']][Math.floor(R()*5)],
            yy=base-8*(k+1);P.R(g,x,yy,ancho,8,cols[0]);P.R(g,x,yy,ancho,1,cols[1]);for(let i=x+3;i<x+ancho;i+=3)P.R(g,i,yy+2,1,5,'#242e46');P.R(g,x+ancho-1,yy,1,8,'#242e46');
          if(R()<0.3)P.R(g,x+4,yy+3,6,2,'#2a3248');} // rótulo apagado
        x+=ancho+2+Math.floor(R()*10);}
      P.banda(g,w,base-30,base+6,C.niebla,0,0.18);}},
    // 5 · agua cerca: franjas de reflejo en escalones y brillos que se mueven (el periscopio del guiño va acá)
    {id:'agua',par:0.6,parY:0.7,ancho:640,y:136,alto:G-136+4,pie:'auto',niebla:0,nieblaPie:0,dibujar(g,w,h){
      P.R(g,0,0,w,h,C.mar);
      for(let y=1;y<h;y+=2){const n=Math.floor(w/9);for(let i=0;i<n;i++){const ll=3+Math.floor(hsh(i*3.7+y)*10),xx=Math.floor(hsh(i*5.3+y*1.7)*w);if(hsh(i+y*7)<0.45)P.R(g,xx,y,ll,1,y<6?C.marHi2:C.marHi);}}},
      vivo(c2,ox,oy,c){
        // la barcaza de la banda (momento "LA BARCAZA"), delante del muelle de enfrente: la mueve momentos.js con ESC_M2.barcaza
        {const b=ESC_M2.barcaza,x=b?b.x+ox:-999;if(b&&x>-70&&x<VW+20)barcaza(c2,Math.round(x),Math.round(oy+9),b);} // una sola
        // brillos que corren despacio (de a píxel entero)
        c2.fillStyle=C.marHi2;for(let i=0;i<10;i++){const y=Math.round(oy+3+(i*5)%16),x=Math.round(((i*67-T*0.2*(1+i%3)+ox*0.1)%(VW+20)+VW+20)%(VW+20))-10;c2.fillRect(x,y,4+i%4,1);}
        // el periscopio y el lomo del guiño (guinos.js): en el agua cerca, debajo del muelle
        if(typeof GU_periscopioFondo==='function'){c2.save();c2.translate(Math.round(ox-(-camX*0.3)),Math.round(oy-(GU_SEA+16)+8));try{GU_periscopioFondo();}catch(e){}c2.restore();}}},
    // 6 · bruma al pie (regla 2): la ilumina la ciudad; encima del agua y debajo del muelle
    {id:'bruma',par:0.7,parY:1,ancho:W,y:88,alto:G-88+2,pie:'auto',niebla:0,nieblaPie:0,segunAmb:true,dibujar(g,w,h,R,c,a){/* bruma al pie en MESETA (guía §9): 0 en y 88, llena en y 110 y pareja hasta el piso; 0,13–0,16 en la franja de los personajes */const A=a&&a.hora==='noche'?BRUMA_PIE.noche*(a.clima==='lluvia'||a.clima==='tormenta'?BRUMA_PIE.lluvia:1):(a&&BRUMA_PIE[a.hora]!=null?BRUMA_PIE[a.hora]:BRUMA_PIE.otra);g.fillStyle=C.bruma;for(let y=0;y<h;y++){const u=Math.min(1,y/22),sm=u*u*(3-2*u);g.globalAlpha=A*sm;g.fillRect(0,y,w,1);}g.globalAlpha=1;}},
  ],
  // primer plano: bitas, sogas y una cadena; abajo, una baranda baja de muelle (vivo)
  frente:{par:1.4,parY:1.15,alfa:1,ancho:900,piezas:[
    {x:40,y:0,w:16,h:14,abajo:true,dibujar(g,w,h){P.R(g,3,4,10,10,C.frente);P.R(g,1,2,14,3,C.frente);P.R(g,4,3,8,1,'#1a2030');P.line(g,0,8,15,11,'#2a2420');}},
    {x:300,y:0,w:34,h:60,abajo:true,dibujar(g,w,h){for(let y=0;y<h;y+=4){const x=Math.round(16+Math.sin(y/9)*3);P.R(g,x,y,3,3,C.frente);P.R(g,x+1,y+1,1,1,'#1a2030');}P.R(g,8,h-6,22,6,C.frente);}},
    {x:560,y:0,w:28,h:10,abajo:true,dibujar(g,w,h){P.oval(g,14,6,13,4,C.frente);P.oval(g,14,6,8,2,'#2a2420');P.oval(g,14,6,4,1,C.frente);}},
  ],
    // baranda baja: postes cada ~30 px con soga entre ellos; más altos cerca de los costados
    vivo(c2,d,par,ac){
      const dx=camX*(1-par),bot=Math.floor(camY+VH),x0=camX-dx-40,x1=camX+VW-dx+40;c2.globalAlpha=ac;c2.fillStyle=C.frente;
      let prev=null;
      for(let k=Math.floor(x0/30);k<=x1/30;k++){if(hsh(k*2.7)<0.3){prev=null;continue;}
        const X=Math.round(k*30+dx),borde=Math.min(X-camX,camX+VW-X),e=1+1.4*Math.max(0,1-borde/(VW*0.15)),h=borde>VW*0.15?4:Math.round(5*e); // en el centro, 4 px
        c2.fillRect(X,bot-h,2,h);c2.fillRect(X-1,bot-h,4,1);
        if(prev){const[px,ph]=prev,ya=bot-ph+1,yb=bot-h+1,yo=t=>Math.round(ya+(yb-ya)*t+3*4*t*(1-t));
          // la soga por tramos horizontales (de 3 px o más), sin píxeles sueltos
          let ini=px+2,yy=yo(0);for(let x=px+3;x<=X;x++){const y=yo((x-px)/(X-px));if((y!==yy&&x-ini>=3)||x===X){c2.fillRect(ini,yy,x-ini,1);ini=x;yy=y;}}}
        prev=[X,h];}
      c2.globalAlpha=1;}},
  // piso: tablones del muelle en perspectiva, mojados; los faroles se reflejan en franjas
  piso(c2,x0,x1,d){
    const bot=Math.max(H,Math.ceil(camY+VH)+2),w=x1-x0;
    P.R(c2,x0,G,w,1,C.gTop);P.R(c2,x0,G+1,w,3,C.gSurf);
    P.R(c2,x0,G+4,w,4,C.g1);P.R(c2,x0,G+8,w,6,C.g2);P.R(c2,x0,G+14,w,6,C.g3);P.R(c2,x0,G+20,w,Math.max(0,Math.min(bot,H+2)-G-20),C.g4);
    // juntas de los tablones (fijas en el mundo arriba, abiertas hacia abajo desde el centro de la pantalla)
    const cx=Math.round(camX+VW/2);
    for(let x=Math.floor(x0/10)*10-30;x<x1+30;x+=10){P.line(c2,x,G+1,x,G+3,C.gLine);P.line(c2,x,G+4,cx+(x-cx)*1.9,H,C.gLine);}
    P.R(c2,x0,G+9,w,1,C.gLine);P.R(c2,x0,G+16,w,1,C.gLine);
    // torres de las grúas de los caminos de arriba (caminos-m2.js deja de dibujarlas con el escenario activo)
    if(typeof CA2_TORRES!=='undefined')for(const tx of CA2_TORRES)if(tx>x0-20&&tx<x1+6)c2.drawImage(ESC_sprite(d,'torreGrua',16,G+52,torreGrua),tx-1,-48);
    for(let x=x0;x<x1;x++){const h=hsh(x*3.7);if(h<0.18){c2.fillStyle=h<0.06?C.gHi:C.gLine;c2.fillRect(x,G+5+Math.floor(hsh(x*9.1)*18),1,1);}}
    // reflejo de cada farol en las tablas mojadas: franjas cortas y cortadas, del color de la luz
    const k=(ESC.amb?ESC.amb.luces:1);if(k>0.05)for(const o of LV.decor){if(o.k!=='lamp'||o.x<x0-20||o.x>x1+20)continue;const lx=o.x+7;
      for(let y=G+1;y<G+22;y+=2){const a=(1-(y-G)/24)*0.55*k,ww=1+Math.floor(hsh(y*3+o.x)*3),jx=Math.floor((hsh(y*7+o.x+Math.floor(T/12))-0.5)*4);
        c2.globalAlpha=a;c2.fillStyle=y<G+4?C.sodioC:C.sodio;c2.fillRect(lx+jx-(ww>>1),y,ww,1);}}
    c2.globalAlpha=1;
  },
  // debajo del muelle (gancho L2.drawBajo de caminos-m2.js): agua más oscura y verdosa en escalones, pilotes con
  // algas, fondo de barro, paredes, superficie que se mueve de a píxel y el espesor de la tabla. Los huecos y carteles son de Código.
  bajo(b,d){
    const x0=Math.round(b.x0),x1=Math.round(b.x1),w=x1-x0,top=G+(typeof CA_DECK==='number'?CA_DECK:7),piso=Math.round(b.piso),yMax=LV.caminos?LV.caminos.yMax:piso+10,sup=Math.round(b.sup);
    const st=[[top,'#2a5a4e'],[sup+20,'#20483e'],[piso-30,'#173a32'],[piso,'#112c26']];
    for(let y=top;y<piso;y+=4){c2y(ctx,x0,y,w,Math.min(4,piso-y),tramo(st,y));}
    // haces de luz que bajan por los huecos (luz suave)
    if(LV.caminos)for(const h of LV.caminos.huecos){if(h.x<x0||h.x>x1)continue;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.08;ctx.fillStyle='#b4e0d0';
      ctx.beginPath();ctx.moveTo(h.x,sup);ctx.lineTo(h.x+h.w,sup);ctx.lineTo(h.x+h.w+16,piso);ctx.lineTo(h.x-16,piso);ctx.closePath();ctx.fill();ctx.restore();}
    // franjas de luz que bajan desde la superficie, en escalones: más claras arriba, se abren y se apagan hacia el fondo
    for(const[k,inc]of[[0.22,1],[0.52,-1],[0.8,1]]){const sx=x0+Math.round(w*k),paso=6,n=Math.ceil((piso-top)/paso);
      for(let i=0;i<n;i++){const y=top+i*paso,ww=6+i*2,xx=sx+inc*i*2-(ww>>1);ctx.globalAlpha=Math.max(0,0.34*(1-i/n));ctx.fillStyle=i<2?'#8ac8b0':i<5?'#6aa894':'#4a8a76';ctx.fillRect(xx,y,ww,Math.min(paso,piso-y));}}
    ctx.globalAlpha=1;
    // motas que flotan, de a píxel
    ctx.fillStyle='#4a7a6a';for(let i=0;i<Math.floor(w/14);i++){const mx=x0+Math.floor(hsh(i*7.1)*w),my=top+6+Math.floor(((hsh(i*3.3)*(piso-top-10))+T*0.05*(1+i%3))%(piso-top-10));ctx.fillRect(mx,my,1,1);}
    // pilotes con algas
    for(let x=x0+14;x<x1;x+=34){P.R(ctx,x-1,top,7,piso-top,C.tinta);P.R(ctx,x,top,5,piso-top,'#3a3228');P.R(ctx,x,top,1,piso-top,'#56483a');
      P.R(ctx,x-1,piso-14-(x%7),7,3,'#2a5a3a');P.R(ctx,x-1,piso-13-(x%7),7,1,'#3e7a4e');}
    // fondo: barro y piedras
    P.R(ctx,x0,piso,w,yMax-piso,'#1e1a12');P.R(ctx,x0,piso,w,1,'#3a3220');
    for(let x=x0+6;x<x1;x+=23){const h=hsh(x);if(h<0.4)continue;P.oval(ctx,x,piso+1,2+Math.floor(h*3),1,'#2e2a1e');}
    // paredes del tramo
    P.R(ctx,x0-3,G,3,yMax-G,'#0e1412');P.R(ctx,x1,G,3,yMax-G,'#0e1412');
    // superficie del agua (se ve en los huecos): una línea que ondula de a píxel
    ctx.fillStyle='#6a9a8a';for(let x=x0;x<x1;x+=2)ctx.fillRect(x,sup+Math.round(Math.sin(T/20+x/9)*0.6),2,1);
    // espesor de la tabla por debajo, con vigas
    P.R(ctx,x0,G+2,w,top-G-2,'#1c2026');for(let x=x0;x<x1;x+=12)P.R(ctx,x,G+2,1,top-G-2,'#101318');P.R(ctx,x0,top-1,w,1,'#101318');
    return true;
  },
  // decoración propia: el camión de la banda, vacío y con la lona tirada (Historia, continuidad de M1)
  extras(lv){
    const ocupado=x=>(lv.covers||[]).some(c=>x>c.x-70&&x<c.x+c.w+8)||(lv.crates||[]).some(c=>x>c.x-70&&x<c.x+20)||
      lv.decor.some(o=>x>o.x-70&&x<o.x+14)||lv.prisoners.some(p=>!p.y&&x>p.x-70&&x<p.x+16)||lv.platforms.some(p=>!p.roof&&!p.ca&&!p.hi&&p.y>100&&x>p.x-70&&x<p.x+p.w+4);
    let x=20;while(x<400&&ocupado(x))x+=8;return x<400?[{x,k:'camion'}]:[];
  },
  luces(lv){return lv.decor.filter(o=>o.k==='lamp').map(o=>({x:o.x+7,y:G-44,r:50,col:C.sodio,fuerza:0.6,tipo:'farol'}));},
  decor(o,d){
    const g=G,x=Math.round(o.x),spr=(k,w,h,fn,dx,dy)=>ctx.drawImage(ESC_sprite(d,k,w,h,fn),x+dx,g+dy);
    switch(o.k){
    case 'lamp':{ESC_sombraContacto(d,x+1,4,g,0.6);
      // cono de luz hacia abajo (luz suave: suma, a resolución de pantalla)
      const k=ESC.amb?ESC.amb.luces:1;if(k>0.05){ctx.save();ctx.globalCompositeOperation='lighter';ctx.imageSmoothingEnabled=true;ctx.globalAlpha=0.32*k;
        ctx.drawImage(cono(d),x+7-22,g-44,44,44);ctx.restore();}
      spr('farol',14,50,(s)=>{P.R(s,0,2,4,48,C.tinta);P.R(s,1,2,2,48,C.hierro);P.R(s,1,2,1,48,C.hierroHi);
        P.R(s,1,1,10,3,C.tinta);P.R(s,2,2,8,1,C.hierro);P.R(s,4,3,8,4,C.tinta);P.R(s,5,4,6,2,C.hierro);P.R(s,5,6,6,1,C.sodioC);},-1,-50);
      return true;}
    case 'bollard':ESC_sombraContacto(d,x+3,8,g,0.6);
      spr('bita',10,10,(s)=>{P.R(s,1,2,8,8,C.tinta);P.R(s,0,0,10,3,C.tinta);P.R(s,2,3,6,7,C.hierro);P.R(s,1,1,8,1,C.hierroHi);P.R(s,2,5,6,1,C.soga);P.R(s,2,6,6,1,C.sogaDk);},-2,-10);return true;
    case 'coil':ESC_sombraContacto(d,x+8,16,g,0.3);
      spr('rollo3',18,8,(s)=>{P.oval(s,9,4,9,4,'#4e3c2a');P.oval(s,9,4,8,3,C.sogaDk); // rollo de soga sin tinta: el jugador arranca delante (capa de juego ≥ 0,05)
        for(let i=0;i<3;i++)P.oval(s,9,6-i*2,7-i*2,1,i%2?C.sogaDk:C.soga);P.oval(s,9,2,2,1,C.sogaDk);P.R(s,5,1,8,1,'#c8a878');},-1,-8);return true;
    case 'barrel':ESC_sombraContacto(d,x+4,8,g,0.6);
      spr('tambor',10,13,(s)=>{P.R(s,0,0,10,13,C.tinta);P.R(s,1,1,8,11,'#324e5f');P.R(s,1,1,2,11,'#4a6a7a');P.R(s,7,1,2,11,'#324e62');P.R(s,1,4,8,1,'#324e62');P.R(s,1,8,8,1,'#324e62');},-1,-12);return true;
    case 'camion':ESC_sombraContacto(d,x+32,62,g,0.6);
      spr('camion',68,26,(s)=>{const ink=C.tinta;
        P.R(s,0,14,66,7,ink);P.R(s,1,15,64,5,'#484865'); // chasis
        P.R(s,44,4,20,12,ink);P.R(s,45,5,18,10,'#574557');P.R(s,45,5,18,1,'#6a5a6a');P.R(s,55,6,7,4,'#5a6a90');P.R(s,46,10,8,1,'#484864'); // cabina
        P.R(s,0,6,42,9,ink);P.R(s,1,7,40,7,'#504665');P.R(s,1,7,40,1,'#56486a');for(let i=4;i<40;i+=6)P.R(s,i,8,1,6,'#52446a'); // caja vacía
        for(let x2=-1;x2<14;x2++){const y=Math.round(6+x2*0.9+Math.sin(x2/2)*1);P.R(s,x2+1,y,1,Math.max(1,21-y),'#4a5a3a');} // lona tirada que cuelga
        P.R(s,0,14,14,1,'#5a6a46');
        for(const wx of[8,30,54]){P.disc(s,wx,21,4,ink);P.disc(s,wx,21,2,'#484864');}
        P.R(s,64,16,3,2,'#c8a070');},-1,-25);return true;
    }
    return false;
  },
  // ----- plataformas -----
  plat(pl,d){
    if(pl.ar||pl.salaAr)return false; // cornisas y sala secreta del arpón: las dibuja arpon.js
    const x=Math.round(pl.x),y=Math.round(pl.y),w=Math.round(pl.w),put=(k,sw,sh,fn,ox,oy)=>ctx.drawImage(ESC_sprite(d,k,sw,sh,fn),x+ox,y+oy);
    if(pl.ca==='grua'){
      if(pl.cuelga){P.line(ctx,x+4,y,x+(w>>1),y-12,C.hierro);P.line(ctx,x+w-4,y,x+(w>>1),y-12,C.hierro);ctx.fillStyle=C.hierro;ctx.fillRect(x+(w>>1),Math.min(-60,y-12),1,y-12-Math.min(-60,y-12));
        const col=contCol(['#8c3b2a','#2f6a8a','#b07a2a','#3a7a4a'][(pl.x/7|0)%4]);put('colgado'+w+col[0],w+2,14,(g)=>contenedor(g,w,12,col,false),-1,-1);return true;}
      put('viga'+w,w+2,10,(g)=>{const o=1;P.R(g,0,0,w+2,9,C.tinta);P.R(g,o,o,w,2,C.amarillo);P.R(g,o,o,w,1,'#e8c870');P.R(g,o,o+6,w,1,C.amarilloDk);
        for(let i=0;i<w-4;i+=8){P.line(g,o+i,o+2,o+i+4,o+6,C.amarilloDk);P.line(g,o+i+4,o+6,o+i+8,o+2,C.amarilloDk);}g.clearRect(o,o+3,1,3);},-1,-1);
      return true;}
    if(pl.roof){if(pl.roof.k!=='pier')return false;muelleAltoFondo(pl,d);return true;}
    if(pl.pyr){const h=pl.pyr.dy,m=pl.mat;
      if(m.startsWith('box:')){const col=contCol(m.slice(4));put('pc'+w+'x'+h+col[0],w+2,h+1,(g)=>contenedor(g,w,h,col,false),-1,-1);}
      else put('pp'+w+'x'+h,w+2,h+1,(g)=>tarimas(g,w,h),-1,-1);
      return true;}
    if(pl.hi==='crane'){
      P.line(ctx,x+2,y,x+(w>>1),y-30,C.hierro);P.line(ctx,x+w-2,y,x+(w>>1),y-30,C.hierro);ctx.fillStyle=C.hierro;ctx.fillRect(x+(w>>1),-2,1,y-30+2);
      put('pasarela'+w,w+2,12,(g)=>{const o=1;P.R(g,o,0,w,1,C.tinta);for(let i=0;i<=w;i+=8)P.R(g,o+Math.min(i,w-1),0,1,6,C.tinta);
        P.R(g,0,6,w+2,5,C.tinta);P.R(g,o,7,w,2,'#424a63');P.R(g,o,7,w,1,'#6a7898');for(let i=2;i<w-1;i+=3)P.R(g,o+i,8,1,1,C.tinta);
        for(let i=0;i<w;i+=6)P.R(g,o+i,9,3,1,C.amarillo);},-1,-6);
      return true;}
    if(pl.box){const col=contCol(pl.box),hh=G-y,idx=LV.platforms.filter(p=>p.box).indexOf(pl);
      ESC_sombraContacto(d,x+w/2,w,G,0.6);
      put('box3'+w+'x'+hh+col[0]+(idx<2?'t'+idx:''),w+2,hh+1,(g)=>{contenedor(g,w,hh,col,true);
        // Historia: "COMPRO TODO" con aerosol en los dos primeros, y la etiqueta $ de EL TASADOR
        if(idx===0||idx===1){const t=typeof pfLienzo==='function'?pfLienzo(idx===0?'COMPRO':'TODO','#e8e0c8'):null;if(t){g.globalAlpha=0.7;g.drawImage(t,Math.max(11,w-t.width-3),Math.min(hh-8,6));g.globalAlpha=1;}
          ESC_H.etiqueta(g,2,2);}},-1,-1); // la etiqueta a la izquierda: el jugador arranca delante de la puerta
      return true;}
    // plataforma de madera común y escalones del jefe (como en M1)
    const hh=G-y;
    for(const lx of[x+5,x+w-5])ESC_sombraContacto(d,lx,3,G,0.6);
    put('plat'+w+'x'+hh,w+2,hh+2,(g)=>{const o=1,P2=(a,b,c,e,col)=>P.R(g,a+o,b+o,c,e,col);
      if(hh>6){for(const px of[4,w-6]){P2(px-1,3,4,hh-3,C.tinta);P2(px,3,2,hh-3,'#4a4a60');}}
      P2(-1,-1,w+2,6,C.tinta);P2(0,0,w,4,C.mad);P2(0,0,w,1,C.madHi);P2(0,3,w,1,C.madDk);for(let i=7;i<w;i+=9)P2(i,1,1,2,C.madDk);},-1,-1);
    return true;
  },
  // frente del muelle alto, encima del jugador
  tunelFrente(t,d){if(t.k!=='pier')return false;const iy=t.y+t.th,x=Math.round(t.x),w=Math.round(t.w);
    ctx.fillStyle='rgba(4,6,14,0.28)';ctx.fillRect(x+2,iy,w-4,G-iy);
    losaMuelle(x,Math.round(t.y),w,d);
    // farol colgado debajo del muelle (luz cálida)
    const lx=x+(w>>1);ctx.fillStyle=C.tinta;ctx.fillRect(lx,iy,1,5);ctx.fillRect(lx-2,iy+5,5,2);ctx.fillStyle=C.sodioC;ctx.fillRect(lx-1,iy+7,3,1);
    return true;},
  // ----- coberturas -----
  cobertura(c,d){
    const x=Math.round(c.x),w=Math.round(c.w),h=Math.round(c.h),top=G-h;
    if(c.vida<=0){ESC_sombraContacto(d,x+w/2,w,G,0.5);
      ctx.drawImage(ESC_sprite(d,'escombro'+c.k+w,w+6,8,(g)=>{for(let i=0;i<w+2;i+=3){const hh=1+Math.floor(hsh(i*3.1+w)*4);P.R(g,i,7-hh-1,4,hh+1,C.tinta);P.R(g,i+1,7-hh,2,hh,c.k==='pallets'?'#7a5e36':'#3a5a78');}}),x-3,G-8);return true;}
    ESC_sombraContacto(d,x+w/2,w,G,0.6);
    if(c.k==='bollard'){ctx.drawImage(ESC_sprite(d,'bitaG'+w+'x'+h,w+2,h+1,(g)=>{const o=1;P.R(g,0,3,w+2,h-2,C.tinta);P.R(g,0,0,w+2,4,C.tinta);P.R(g,o+2,4,w-4,h-4,C.hierro);P.R(g,o,1,w,2,C.hierro);P.R(g,o,1,w,1,C.hierroHi);
      P.R(g,o+2,6,w-4,2,C.amarillo);P.R(g,o+3,9,w-6,1,C.soga);P.R(g,o+3,10,w-6,1,C.sogaDk);P.R(g,o,h-2,w,2,C.hierro);}),x-1,top-1);return true;}
    if(c.k==='lowbox'){const col=contCol('#2f6a8a');ctx.drawImage(ESC_sprite(d,'lowbox'+w+'x'+h,w+2,h+1,(g)=>contenedor(g,w,h,col,false)),x-1,top-1);}
    else if(c.k==='pallets'){ctx.drawImage(ESC_sprite(d,'tarimas'+w+'x'+h,w+2,h+1,(g)=>tarimas(g,w,h)),x-1,top-1);}
    else return false;
    if(c.vida<c.max*0.5){ctx.fillStyle=C.tinta;ctx.fillRect(x+Math.round(w*0.25),top+1,1,Math.round(h*0.5));ctx.fillRect(x+Math.round(w*0.7),top,2,2);}
    return true;
  },
  caja(c,d){return ESC_H.caja(c,d);},
};
// contenedor Hondo (lienzo w+2 × h+1): tinta, cuerpo, costillas, borde claro y, si es alto, las barras de la puerta
function contenedor(g,w,h,col,puerta,borde){const o=1;P.R(g,0,0,w+2,h+1,borde||C.tinta); // borde: contorno propio (el contenedor de la salida, detrás del jugador)
  P.R(g,o,o,w,h-1,col[0]);P.R(g,o,o,w,1,col[1]);
  for(let i=3;i<w-1;i+=3)P.R(g,o+i,o+2,1,h-4,col[2]);if(puerta&&w>16){P.R(g,o+w-7,o+2,1,h-4,col[2]);P.R(g,o+w-4,o+2,1,h-4,col[2]);} // juntas de la puerta en el oscuro del color (no tinta): la capa de juego no traga al jugador
  P.R(g,o,o+h-2,w,1,col[2]);}
function tarimas(g,w,h){const o=1;P.R(g,0,0,w+2,h+1,C.tinta);
  for(let r=0;r<h-1;r+=4){P.R(g,o,o+r,w,2,r?'#7a5e36':'#9a7a4a');P.R(g,o,o+r,w,1,r?'#8a6e44':'#c0a070');for(const px of[2,(w>>1)-1,w-4])P.R(g,o+px,o+r+2,2,2,'#5d472a');}}
let CONO=null;
function cono(d){if(CONO)return CONO;CONO=ESC_lienzo(44,44);const g=CONO.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,44);gr.addColorStop(0,ESC_rgba(C.sodio,0.9));gr.addColorStop(1,ESC_rgba(C.sodio,0));g.fillStyle=gr;
  g.beginPath();g.moveTo(19,2);g.lineTo(25,2);g.lineTo(44,44);g.lineTo(0,44);g.closePath();g.fill();return CONO;}
// muelle alto (pasaje de abajo): tablones arriba, pilotes de madera, fondo oscuro y verdoso
function losaMuelle(x,y,w,d){ctx.drawImage(ESC_sprite(d,'losaMuelle'+w,w+2,11,(g)=>{const o=1;P.R(g,0,0,w+2,10,C.tinta);P.R(g,o,o,w,5,'#5a4740');P.R(g,o,o,w,1,'#8a7060');
  for(let i=6;i<w;i+=11)P.R(g,o+i,o+1,1,4,'#5d453e');P.R(g,o,o+5,w,3,'#584741');for(let i=4;i<w;i+=11)P.R(g,o+i,o+6,1,1,'#8a8f96');}),x-1,y-1);}
function muelleAltoFondo(pl,d){const x=Math.round(pl.x),y=Math.round(pl.y),w=Math.round(pl.w),iy=y+8,ih=G-iy;
  ctx.drawImage(ESC_sprite(d,'muelleFondo'+w,w,ih+8,(g)=>{const R2=(a,b,c,e,col)=>P.R(g,a,b+8,c,e,col);
    R2(2,0,w-4,ih,'#374e58');R2(2,0,w-4,4,'#364f56');for(let i=6;i<w-6;i+=9)R2(i,0,1,ih>>1,'#374e5a');
    for(let px=4;px<w-2;px+=30){R2(px-1,0,6,ih,C.tinta);R2(px,0,4,ih,'#5a4a40');R2(px,0,1,ih,'#7a6a5a');R2(px-1,ih-14,6,3,'#3a5a44');}
    R2(2,ih-3,w-4,3,'#2d4f60');
    for(let px=2;px<w;px+=14)P.R(g,px,1,1,7,C.tinta);P.R(g,0,1,w,1,C.tinta);}),x,y-8);
  for(let px=x+6;px<x+w-2;px+=30)ESC_sombraContacto(d,px,4,G,0.5);
  losaMuelle(x,y,w,d);}

ESC_registrar(1,def);
})();
