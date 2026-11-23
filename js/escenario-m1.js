'use strict';
// Óxido · Escenario de la misión 1, Zona Óxido (estilo "Hondo", hora azul). Del Ilustrador de escenarios.
// Va después de js/escenario-base.js. Guía: notas/arte/guia.md · ficha: notas/arte/fichas/escenarios.md.
// Todo a 1 px = 1 px del lienzo (pix:1). Lo lejano frío, claro y con niebla; lo cercano cálido por los tachos con fuego.
// Estado que puede mover el momento "¡ESO ES NUESTRO!" (momentos.js): el camión de la banda en la loma del fondo.
// ESC_M1.camion = {x (en la capa de chatarra), brillo 0..1 (el diente bajo la lona), tasador (silueta arriba)}; null = no se dibuja.
const ESC_M1={camion:{x:250,brillo:1,tasador:true}};
(()=>{
const P=ESC_px,G=GROUND;
// paleta "hondo" (guía, sección 4)
const C={
  cielo:[[0,'#121630'],[30,'#1c2246'],[54,'#2c3060'],[74,'#46447a'],[90,'#6a5a88'],[102,'#9a7090'],[112,'#c88a84']],
  lejos:'#8a8ab8',lejos2:'#7072a2',ciudad:'#6466a0',ciudadVen:'#c89070',medio:'#5a5c8c',medioVen:'#ffb070',medio2:'#4e5082',
  chatarra:'#4a4878',chatarraHi:'#6a6898',juego:'#49476e',niebla:'#9a96c8',bruma:'#a8a4d0',frente:'#07060e',tinta:'#17141f',
  gTop:'#c88a6a',gSurf:'#4a3040',g1:'#2c2034',g2:'#24192e',g3:'#1c1428',g4:'#140f20',gHi:'#4a3448',gDk:'#0e0a18',gLine:'#120d1e',
  fuego:['#ff5a2a','#ffae3a','#fff0a0'],metal:['#4a4a5a','#5a5a6c','#30303e'],
  // madera y estructuras de la capa de juego (guía Hondo)
  mad:'#6f3d37',madHi:'#e8a060',madDk:'#60434b',poste:'#64414e',posteDk:'#604252',
  horm:'#6a6680',hormHi:'#9a96b4',hormDk:'#4c4763',bolsa:'#8a7a5a',bolsaHi:'#b4a07a',bolsaDk:'#5a4a3a',
  chapa:'#4a4a62',chapaHi:'#8a8ab0',chapaDk:'#48486b',oxido:'#7a3a30',oxidoHi:'#b0604a',oxidoDk:'#743942',
};
// cielo de cada hora: la natural es la hora azul (tarde); de noche más oscuro y con más estrellas
const CIELOS={
  tarde:C.cielo,
  noche:[[0,'#080a1a'],[40,'#10142c'],[80,'#1c1e40'],[104,'#2c2a50'],[118,'#3e3458']],
  amanecer:[[0,'#1c2048'],[40,'#3a3a6a'],[80,'#8a6a90'],[104,'#e09a8a'],[118,'#f4c0a0']],
  dia:[[0,'#3a5a96'],[40,'#5a78b0'],[80,'#8aa0c8'],[104,'#c0b8c8'],[118,'#e0c8b8']],
};
const Y0=-40; // el cielo empieza 40 px por arriba del mundo (cámara alta, jetpack)
// camión de la banda (fondo): cabina, caja con lona, brillo dorado por debajo y EL TASADOR arriba
function camionBanda(c2,x,y,k){
  const ink=C.tinta,col='#3e3654',dk='#2c2640';
  c2.fillStyle=ink;c2.fillRect(x-1,y-12,54,11);c2.fillStyle=col;c2.fillRect(x,y-11,36,9);c2.fillStyle='#4a5a3a';c2.fillRect(x,y-13,36,3);c2.fillRect(x-1,y-10,2,6); // lona
  c2.fillStyle=dk;c2.fillRect(x+37,y-16,15,14);c2.fillStyle='#5a6a90';c2.fillRect(x+44,y-14,6,4);
  c2.fillStyle=ink;for(const wx of[6,26,46])c2.fillRect(x+wx-2,y-3,5,4);
  if(k.brillo>0.02){c2.globalAlpha=k.brillo;c2.fillStyle='#ffd070';for(let i=2;i<34;i+=5)c2.fillRect(x+i,y-4,2,1);c2.fillStyle='#fff0a0';c2.fillRect(x+16,y-5,3,1);c2.globalAlpha=1;
    c2.save();c2.globalCompositeOperation='lighter';c2.imageSmoothingEnabled=true;c2.globalAlpha=0.35*k.brillo;c2.drawImage(ESC_glow('#ffc060'),x+2,y-16,32,20);c2.restore();}
  if(k.tasador)ESC_H.tasador(c2,x+12,y-27,'#141224');
}
// cables de alta tensión: 2 por torre, solo de torre a torre, en el valor de la capa media (no negro)
let TORRES=null;
function cables(c2,x0,x1){
  if(!TORRES)TORRES=LEVELS[0].decor.filter(d=>d.k==='pylon').map(d=>d.x+8).sort((a,b)=>a-b);
  const top=G-92;c2.fillStyle=C.medio;
  for(let i=0;i<TORRES.length-1;i++){const a=TORRES[i],b=TORRES[i+1];if(b<x0||a>x1)continue;
    for(const[dxa,dy]of[[12,9],[-9,17]]){const xa=a+dxa,xb=b+dxa,ya=top+dy,sag=26,xs=Math.max(xa,x0),xe=Math.min(xb,x1);
      // la curva se dibuja por tramos horizontales: nunca queda un píxel suelto
      let ini=xs,yy=Math.round(ya+sag*4*((xs-xa)/(xb-xa))*(1-(xs-xa)/(xb-xa)));
      for(let x=xs+1;x<=xe;x++){const t=(x-xa)/(xb-xa),y=Math.round(ya+sag*4*t*(1-t));if(y!==yy||x===xe){c2.fillRect(ini,yy,x-ini,1);ini=x;yy=y;}}}}
}
// color del cielo a una altura (para tapar la luna y hacer la medialuna del mismo tono)
function cieloEn(st,y){let i=0;while(i<st.length-2&&y>=st[i+1][0])i++;const a=ESC_rgb(st[i][1]),b=ESC_rgb(st[i+1][1]),t=Math.min(1,Math.max(0,(y-st[i][0])/((st[i+1][0]-st[i][0])||1)));
  const yy=Math.floor(y/4)*4;return`rgb(${a.map((v,k)=>Math.round(v+(b[k]-v)*Math.min(1,Math.max(0,(yy-st[i][0])/((st[i+1][0]-st[i][0])||1)))))})`;}
const hsh=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};

// colores de cada cobertura: [cuerpo, luz]
const COB={sandbags:['#8a7a5a','#b4a07a'],concrete:['#6a6680','#9a96b4'],tires:['#3a3448','#56506a'],container:['#7a3a30','#b0604a']};
// escalón de la pirámide de chatarra (tablones, chapa o tambores), con contorno de tinta
function escalon(g,w,h,m){const o=1,R2=(a,b,c,e,col)=>P.R(g,a+o,b+o,c,e,col);
  R2(-1,-1,w+2,h+1,C.tinta);
  if(m==='sheet'){R2(0,0,w,h,C.chapa);for(let i=1;i<w;i+=3)R2(i,2,1,h-2,C.chapaDk);for(let i=0;i<w;i+=17){const k=hsh(i+w);R2(i+Math.floor(k*8),3+Math.floor(k*6),3+Math.floor(k*4),2,C.oxido);}R2(0,0,w,1,C.chapaHi);}
  else if(m==='drum'){R2(0,0,w,h,C.madDk);for(let i=1;i<w-7;i+=9){R2(i,1,8,h-1,C.tinta);R2(i+1,1,6,h-1,C.metal[0]);R2(i+1,1,2,h-1,C.metal[1]);R2(i+5,1,2,h-1,C.metal[2]);R2(i+1,Math.round(h*0.3),6,1,C.metal[2]);R2(i+1,Math.round(h*0.7),6,1,C.metal[2]);}R2(0,0,w,1,'#7a7a90');}
  else{R2(0,0,w,h,C.mad);for(let r=4;r<h;r+=4)R2(0,r,w,1,C.madDk);for(let r=0;r<h;r+=4){const o2=(r*7)%23;for(let i=o2;i<w-2;i+=23)R2(i,r,1,4,C.madDk);}R2(0,0,w,1,C.madHi);}
  R2(w-3,0,3,h,'rgba(10,6,20,0.3)');}
// cobertura dibujada a píxel (lienzo de w+2 × h+1: 1 px de tinta alrededor)
function cobertura(g,k,w,h){const o=1,R2=(a,b,c,e,col)=>P.R(g,a+o,b+o,c,e,col);
  if(k==='sandbags'){const filas=Math.max(1,Math.round(h/5));
    for(let r=0;r<filas;r++){const y=h-5-r*5,n=Math.max(1,Math.floor((w-r*3)/7)),ox=Math.floor((w-n*7)/2);
      for(let i=0;i<n;i++){R2(ox+i*7-1,y-1,8,6,C.tinta);R2(ox+i*7,y,6,4,(i+r)%2?C.bolsa:C.bolsaHi);R2(ox+i*7,y,6,1,C.bolsaHi);R2(ox+i*7,y+3,6,1,C.bolsaDk);}}}
  else if(k==='concrete'){for(let y=-1;y<h;y++){const ins=y<h-4?Math.max(0,3-Math.floor((y+1)*3/Math.max(1,h-4))):0;R2(ins-1+(y<0?1:0),y,w-2*ins+2-(y<0?2:0),1,C.tinta);}
    for(let y=0;y<h;y++){const ins=y<h-4?Math.max(0,3-Math.floor((y+1)*3/Math.max(1,h-4))):0;R2(ins,y,w-2*ins,1,y===0||y===h-4?C.hormHi:C.horm);R2(w-ins-2,y,2,1,C.hormDk);}
    for(let i=2;i<w-4;i+=6){R2(i,3,2,1,'#c07a48');R2(i+1,4,2,1,'#c07a48');R2(i+2,5,2,1,'#c07a48');}
    R2(Math.floor(w/2),1,1,h-1,C.hormDk);}
  else if(k==='tires'){const n=Math.max(1,Math.round(h/5));for(let r=0;r<n;r++){const y=h-5*(r+1),ox=r%2;R2(ox-1,y,w-1,5,C.tinta);R2(ox,y+1,w-3,3,'#4f4760');R2(ox,y+1,w-3,1,'#5a546e');for(let i=ox+1;i<ox+w-3;i+=3)R2(i,y+2,1,2,'#4d4764');R2(ox+Math.floor(w*0.35),y+1,Math.floor(w*0.25),1,'#4e485d');}}
  else if(k==='container'){R2(-1,-1,w+2,h+1,C.tinta);R2(0,0,w,h,C.oxido);for(let i=2;i<w-1;i+=3)R2(i,2,1,h-3,C.oxidoDk);R2(0,0,w,1,C.oxidoHi);R2(w-6,2,1,h-3,C.tinta);R2(w-3,2,1,h-3,C.tinta);}
}
// losa de la autopista caída (atrás y adelante del jugador)
function losa(x,y,w,d){ctx.drawImage(ESC_sprite(d,'losa'+w,w+8,12,(g)=>{const R2=(a,b,c,e,col)=>P.R(g,a+1,b+1,c,e,col);
  R2(-1,-1,w+2,11,C.tinta);R2(0,0,w,9,C.horm);R2(0,0,w,1,C.hormHi);R2(0,7,w,2,C.hormDk);
  for(let i=8;i<w-14;i+=16)R2(i,4,6,1,'#a08a5a');R2(22,2,1,4,C.hormDk);R2(70,1,1,3,C.hormDk);
  R2(w-3,0,3,4,'rgba(0,0,0,0)');g.clearRect(w-2,1,4,4);R2(w,5,2,1,C.tinta);R2(w+1,6,1,3,C.tinta);R2(w-1,9,1,2,C.tinta);}),x-1,y-1);}
function autopistaFondo(pl,d){const x=Math.round(pl.x),y=Math.round(pl.y),w=Math.round(pl.w),iy=y+9,ih=G-iy;
  ctx.drawImage(ESC_sprite(d,'auto-fondo'+w,w,ih+8,(g)=>{const R2=(a,b,c,e,col)=>P.R(g,a,b+8,c,e,col);
    R2(3,0,w-6,ih,'#4b466d');R2(3,0,w-6,5,'#4b4572');R2(30,10,14,1,'#5a4a6a');R2(33,12,9,1,'#5a4a6a');
    for(const px of[2,Math.round(w/2)-4,w-12]){R2(px-1,0,12,ih,C.tinta);R2(px,0,10,ih,C.horm);R2(px,0,2,ih,C.hormHi);R2(px+8,0,2,ih,C.hormDk);R2(px-1,0,12,2,C.hormDk);}
    for(let px=3;px<w-10;px+=12){P.R(g,px,2,1,6,C.tinta);}P.R(g,0,1,w-12,2,C.hormHi);P.R(g,0,3,w-12,1,C.tinta);}),x,y-8);
  for(const px of[x+7,x+Math.round(w/2)+1,x+w-7])ESC_sombraContacto(d,px,10,G,0.6);
  losa(x,y,w,d);}

const BRUMA_PIE={noche:0.6,lluvia:1.0,amanecer:0.4,tarde:0.4,dia:0.27,otra:0.35}; // fuerza de la meseta de bruma al pie (se ajusta midiendo)
const def={
  halosAltos:{col:'#9aa4cc',a:0.92,r:20,plano:true,alto:40}, // de noche, luz suave detrás de las plataformas altas (regla de Arte)
  pix:1,nat:'tarde',semilla:11,paso:'pixel', // las capas de fondo avanzan de a píxel entero (la suavidad la da la cámara)
  atm:{col:C.niebla,fuerza:0.03,pie:0},
  luzPersonajes:{calida:'#ffc07a',lado:-1,fria:'#b8ccff'},
  sombra:'#05040c',
  oscPersonajes:0.3,
  ambientes:{
    base:{oscuridad:0.12,oscCol:'#06050f'},
    amanecer:{tinte:'#ff9ab0',tinteA:0.1,modo:'overlay',luces:0.5,oscuridad:0.04},
    dia:{tinte:'#8aa0d0',tinteA:0.25,modo:'screen',luces:0.3,oscuridad:0},
    noche:{tinte:'#1e2050',tinteA:0.45,modo:'multiply',nieblaCol:'#3a3a66',luces:1,oscuridad:0.28},
    // "sin óxido" para los créditos (Historia): colores limpios, sin bruma sucia
    limpio:{reemplazar:true,tintes:[['screen','#5a6aa0',0.2]],oscuridad:0,luces:0.5},
  },
  capas:[
    // 1 · cielo (fijo): escalones de 4 px, estrellas, luna fina, nubes finas
    {id:'cielo',cielo:true,segunAmb:true,ancho:W,y:Y0,alto:G-Y0+4,
      luces:[{x:205,y:58-Y0,r:22,col:'#aab4ff',fuerza:0.28,tipo:'ventana'}],
      dibujar(g,w,h,R,c,a){
        const hz=a&&CIELOS[a.hora]?a.hora:'tarde',st=CIELOS[hz].map(([y,col])=>[y-Y0,col]);
        st.unshift([0,st[0][1]]);P.escalones(g,w,h,st,4);
        const n=hz==='noche'?90:hz==='tarde'?44:hz==='amanecer'?14:0;
        for(let i=0;i<n;i++){g.fillStyle=hsh(i*9)<0.3?'#c8c8f0':'#6a6aa0';g.fillRect(Math.floor(hsh(i*3.1)*w),Math.floor(hsh(i*7.3)*(hz==='noche'?90:70))-Y0,1,1);}
        if(hz!=='dia'){const mx=205,my=58-Y0;P.disc(g,mx,my,6,'#e8e4f4');P.disc(g,mx+3,my-2,5,cieloEn(st,my-2));}
        // nubes finas en escalones
        g.globalAlpha=hz==='dia'?0.25:0.35;
        for(let i=0;i<6;i++){const y=30+i*11+Math.floor(hsh(i)*6)-Y0,x=Math.floor(hsh(i*4)*260)-20,col=hz==='dia'?'#d8dcef':'#8a7aa8';
          P.R(g,x,y,40+Math.floor(hsh(i*2)*50),1,col);P.R(g,x+8,y+1,20+Math.floor(hsh(i*6)*30),1,col);}
        g.globalAlpha=1;}},
    // 2 · lejos: montañas frías y una franja de niebla
    {id:'lejos',par:0.08,ancho:640,y:60,alto:G-60,pie:'auto',nieblaPie:0,dibujar(g,w,h){
      P.cresta(g,w,62,22,40,C.lejos,0.8);
      P.banda(g,w,40,70,C.niebla,0,0.3);
      P.cresta(g,w,72,16,170,C.lejos2,1.2);}},
    // 3 · lejos 2: ciudad de chatarra con 5 % de ventanas y niebla encima
    {id:'lejos 2',par:0.18,ancho:720,y:90,alto:G-90,pie:'auto',nieblaPie:0,dibujar(g,w,h,R){
      P.siluetas(g,w,R,46,8,26,C.ciudad,0.05,C.ciudadVen,[10,22]);
      P.banda(g,w,20,50,C.niebla,0,0.35);}},
    // 4 · medio: edificios rotos con ventanas cálidas y dos grúas torre
    {id:'medio',par:0.4,ancho:960,y:56,alto:G-56,pie:'auto',nieblaPie:0,dibujar(g,w,h,R,c){
      P.banda(g,w,56,89,C.niebla,0,0.25);
      const v=P.siluetas(g,w,R,90,14,44,C.medio,0.12,C.medioVen,[14,30]);
      P.grua(g,96,90,78,C.medio);P.grua(g,610,90,70,C.medio);
      P.banda(g,w,68,94,C.niebla,0,0.3);
      P.siluetas(g,w,R,94,4,18,C.medio2,0.06,C.medioVen,[18,36]);
      // algunas ventanas tienen un halo chico (una cada ~80 px)
      let ult=-99;c.luces=[];for(const[x,y]of v.sort((a,b)=>a[0]-b[0]))if(x-ult>80&&y>40){c.luces.push({x:x+0.5,y:y+1,r:4,col:C.medioVen,fuerza:0.35,tipo:'ventana'});ult=x;}}},
    // 5 · medio cercano: montañas de chatarra (autos apilados, cubiertas) con brillos
    {id:'chatarra',par:0.7,ancho:760,y:G-40,alto:40,pie:'auto',nieblaPie:0,niebla:0,
      // el camión de la banda arriba de la loma, con la lona y el brillo dorado del diente (Historia)
      vivo(c2,ox,oy,c){const k=ESC_M1.camion,x=k?k.x+ox:-999;if(k&&x>-80&&x<VW+20)camionBanda(c2,Math.round(x),Math.round(oy+14),k);}, // uno solo, no se repite con la capa
      dibujar(g,w,h,R){
      const b=h;let cx=30;
      while(cx<w+40){const mw=50+R()*60,mh=12+R()*16;
        for(let x=Math.round(cx-mw/2);x<cx+mw/2;x++){const t=1-Math.abs(x-cx)/(mw/2),hh=Math.round(mh*Math.sqrt(t)+hsh(x*2.1)*3),X=((x%w)+w)%w;
          P.R(g,X,b-hh,1,hh,C.chatarra);if(hsh(x*4.4)<0.12)P.R(g,X,b-hh,1,1,C.chatarraHi);}
        for(let k=0;k<4;k++){const x=Math.round(cx-mw/3+R()*mw*0.6),y=b-Math.round(mh*0.5+R()*mh*0.4),X=((x%w)+w)%w;
          P.R(g,X,y,10,4,C.chatarra);P.R(g,X+2,y-2,6,2,C.chatarra);P.R(g,X,y,10,1,C.chatarraHi);}
        // una cubierta parada de vez en cuando
        if(R()<0.5){const x=Math.round(cx+mw*0.35)%w;P.disc(g,x,b-4,4,C.chatarra);P.R(g,x-1,b-5,2,2,C.chatarraHi);}
        cx+=mw*0.8+30+R()*70;}}},
    // 6 · bruma al pie (guía §3, regla 2): detrás de la acción el fondo no baja de luminancia 0,13.
    // Va encima de las capas medias y debajo de la capa de juego; plataformas, cajas y torres siguen oscuras.
    {id:'bruma',par:0.7,parY:1,ancho:W,y:88,alto:G-88+2,pie:'auto',niebla:0,nieblaPie:0,segunAmb:true,dibujar(g,w,h,R,c,a){/* bruma al pie en MESETA (guía §9): 0 en y 88, llena en y 110 y pareja hasta el piso; 0,13–0,16 en la franja de los personajes */const A=a&&a.hora==='noche'?BRUMA_PIE.noche*(a.clima==='lluvia'||a.clima==='tormenta'?BRUMA_PIE.lluvia:1):(a&&BRUMA_PIE[a.hora]!=null?BRUMA_PIE[a.hora]:BRUMA_PIE.otra);g.fillStyle=(a&&a.hora==='noche'?'#9aa4cc':C.bruma);for(let y=0;y<h;y++){const u=Math.min(1,y/22),sm=u*u*(3-2*u);g.globalAlpha=A*sm;g.fillRect(0,y,w,1);}g.globalAlpha=1;}},
  ],
  // primer plano casi negro, solo en los bordes; pegado al borde de abajo de la pantalla
  frente:{par:1.4,parY:1.15,alfa:1,ancho:900,piezas:[
    {x:20,y:0,w:36,h:54,abajo:true,dibujar(g,w,h){for(let t=0;t<5;t++)P.line(g,t,h-54+20,30+t,h,C.frente);P.R(g,0,h-30,12,30,C.frente);P.line(g,6,h-30,18,h-38,C.frente,2);}},
    {x:520,y:0,w:26,h:12,abajo:true,dibujar(g,w,h){P.oval(g,13,h-4,12,4,C.frente);P.oval(g,13,h-4,7,1,'#141224');P.oval(g,9,h-8,8,3,C.frente);}},
    {x:700,y:0,w:42,h:20,abajo:true,dibujar(g,w,h){for(let x=0;x<w;x++){const t=Math.round(4+Math.sin(x/6)*3+x*0.2);P.R(g,x,t,1,h-t,C.frente);}P.line(g,2,6,w-2,12,'#1a1626');}},
  ],
    // pasto seco por matas, con huecos (~35 % del ancho) y más alto cerca de los costados de la pantalla
    vivo(c2,d,par,ac){
      const dx=camX*(1-par),bot=Math.floor(camY+VH),x0=camX-dx-12,x1=camX+VW-dx+12;c2.globalAlpha=ac;c2.fillStyle=C.frente;
      for(let k=Math.floor(x0/12);k<=x1/12;k++){if(hsh(k*3.3)<0.35)continue;
        const lx=k*12+Math.floor(hsh(k*5.1)*4),ancho=5+Math.floor(hsh(k*7.7)*6),X=Math.round(lx+dx),
          borde=Math.min(X-camX,camX+VW-X),e=1+1.6*Math.max(0,1-borde/(VW*0.15));
        for(let b=0;b<ancho;b+=2){let h=Math.round((2+hsh(k*13+b)*4)*e*(1-Math.abs(b-ancho/2)/ancho*0.8));if(borde>VW*0.15)h=Math.min(h,4); // en el centro, como mucho 4 px
          const lean=hsh(k+b)<0.5?-1:1,m=Math.floor(h/2);c2.fillRect(X+b,bot-m,1,m);if(h-m>0)c2.fillRect(X+b+(h>4?lean:0),bot-h,1,h-m);}
        c2.fillRect(X-1,bot-1,ancho+2,1);}
      c2.globalAlpha=1;}},
  // piso con espesor: borde claro, superficie y cara de frente con durmientes que se alejan hacia el centro
  piso(c2,x0,x1){
    const bot=Math.max(H,Math.ceil(camY+VH)+2),w=x1-x0;
    P.R(c2,x0,G,w,1,C.gTop);P.R(c2,x0,G+1,w,3,C.gSurf);
    P.R(c2,x0,G+4,w,4,C.g1);P.R(c2,x0,G+8,w,6,C.g2);P.R(c2,x0,G+14,w,6,C.g3);P.R(c2,x0,G+20,w,bot-G-20,C.g4);
    for(let x=x0;x<x1;x++){const h=hsh(x*3.7);if(h<0.35){c2.fillStyle=h<0.12?C.gHi:C.gDk;c2.fillRect(x,G+5+Math.floor(hsh(x*9.1)*20),h<0.06?2:1,1);}}
    // durmientes: fijos en el mundo arriba, abiertos hacia abajo desde el centro de la pantalla
    const cx=Math.round(camX+VW/2);
    for(let x=Math.floor(x0/14)*14-28;x<x1+28;x+=14){const xb=cx+(x-cx)*1.86;P.line(c2,x,G+4,xb,H,C.gLine);}
    P.R(c2,x0,G+9,w,1,C.gLine);P.R(c2,x0,G+16,w,1,C.gLine);
    cables(c2,x0,x1);
  },
  // decoración propia: tachos con fuego cada ~250 px donde no estorban
  extras(lv){
    const ocupado=x=>(lv.covers||[]).some(c=>x>c.x-16&&x<c.x+c.w+8)||(lv.crates||[]).some(c=>x>c.x-14&&x<c.x+22)||
      lv.decor.some(d=>x>d.x-14&&x<d.x+(d.k==='car'?56:d.k==='pylon'?40:20))||(lv.tunnels||[]).some(t=>x>t.x-12&&x<t.x+t.w+12)||
      (lv.pyramids||[]).some(p=>x>p.x-12&&x<p.x+p.w+12)||(lv.prisoners||[]).some(p=>!p.y&&x>p.x-12&&x<p.x+20)||(lv.vaults||[]).some(v=>x>v.x-16&&x<v.x+40)||
      lv.platforms.some(p=>!p.roof&&!p.pyr&&[p.x+4,p.x+p.w-6].some(px=>x>px-14&&x<px+8));
    // Historia: el portón de la familia en la primera pantalla y una o dos chapas "COMPRO ORO" de la banda.
    // Las chapas se ubican primero (necesitan ~60 px libres de estructuras, cajas y postes); después los tachos las esquivan.
    const out=[{x:10,k:'porton'}];
    const duro=x=>(lv.covers||[]).some(c=>x>c.x-4&&x<c.x+c.w+4)||lv.decor.some(o=>x>o.x-6&&x<o.x+(o.k==='car'?54:o.k==='pylon'?24:14))||
      (lv.tunnels||[]).some(t=>x>t.x-8&&x<t.x+t.w+8)||(lv.pyramids||[]).some(p=>x>p.x-8&&x<p.x+p.w+8)||
      lv.platforms.some(p=>!p.roof&&!p.pyr&&!p.ar&&!p.salaAr&&x>p.x-4&&x<p.x+p.w+4)||(lv.crates||[]).some(c=>x>c.x-4&&x<c.x+18)||(lv.vaults||[]).some(v=>x>v.x-8&&x<v.x+24);
    const libre=(x,w)=>{for(let i=x;i<=x+w;i+=2)if(duro(i))return false;return true;};
    const cw=(typeof pfW==='function'?pfW('COMPRO ORO'):44)+16;
    let n=0;for(const x0 of[330,1000,1930,2900]){if(n>=2)break;let x=x0;while(x<x0+500&&!libre(x,cw))x+=2;if(x<x0+500&&!out.some(o=>o.k==='chapa'&&Math.abs(o.x-x)<400)){out.push({x,k:'chapa',w:cw});n++;}}
    const ocupa2=x=>ocupado(x)||out.some(o=>o.k==='chapa'&&x>o.x-14&&x<o.x+o.w+6)||x<100;
    for(let x=140;x<lv.end-120;x+=250){let k=0;while(k<8&&ocupa2(x+k*14))k++;if(k<8)out.push({x:x+k*14,k:'tacho'});}
    return out;
  },
  luces(lv,d){return ESC_extras(d).filter(o=>o.k==='tacho').map(o=>({x:o.x+4,y:G-16,r:60,col:'#ff8240',fuerza:0.6,tipo:'fuego'}));},
  // ----- plataformas (gancho L.drawPlat): madera con borde claro, postes y cruces; carteles altos; pirámide; autopista -----
  plat(pl,d){
    if(pl.ar||pl.salaAr)return false; // cornisas y sala secreta del arpón: las dibuja arpon.js
    const x=Math.round(pl.x),y=Math.round(pl.y),w=Math.round(pl.w),put=(k,sw,sh,fn,ox,oy)=>ctx.drawImage(ESC_sprite(d,k,sw,sh,fn),x+ox,y+oy);
    if(pl.roof){if(pl.roof.k!=='overpass')return false;autopistaFondo(pl,d);return true;}
    if(pl.pyr){const h=pl.pyr.dy,m=pl.mat;put('pyr'+m+w+'x'+h,w+2,h+1,(g)=>escalon(g,w,h,m),-1,-1);return true;}
    if(pl.hi==='sign'){const hh=G-y;
      for(const lx of[x+9,x+w-10])ESC_sombraContacto(d,lx,4,G,0.6);
      put('cartel'+w+'x'+hh,w+8,hh+2,(g)=>{const o=4,P2=(a,b,c,e,col)=>P.R(g,a+o,b+1,c,e,col);
        for(const lx of[7,w-12]){P2(lx,24,5,hh-24,C.tinta);P2(lx+1,24,3,hh-24,C.poste);P2(lx+1,24,1,hh-24,'#644150');}
        P.line(g,o+10,1+40,o+w-10,1+62,C.posteDk);P.line(g,o+w-10,1+40,o+10,1+62,C.posteDk);
        P2(-1,3,w+2,23,C.tinta);P2(0,4,w,21,'#644150');
        P.disc(g,o+Math.round(w*0.3),1+14,5,'#8a5a50');P2(Math.round(w*0.3)-6,15,12,1,'#644150');P2(Math.round(w*0.3)-6,17,12,1,'#644150');
        P2(Math.round(w*0.55),8,Math.round(w*0.35),2,'#7a4a58');P2(Math.round(w*0.55),12,Math.round(w*0.25),2,'#7a4a58');
        for(let i=3;i<w-2;i+=6)P2(i,4,1,3+Math.floor(hsh(i*7+w)*10),'#683e56');
        P2(w-13,4,11,8,'#653f59');
        P2(-3,-1,w+6,5,C.tinta);P2(-2,0,w+4,3,C.mad);P2(-2,0,w+4,1,C.madHi);P2(-2,2,w+4,1,C.madDk);
        P2(4,3,2,1,'#ffd58a');P2(w-6,3,2,1,'#ffd58a');},-4,-1);
      return true;}
    // plataforma de madera común (y los escalones del jefe)
    const hh=G-y;
    for(const lx of[x+5,x+w-5])ESC_sombraContacto(d,lx,3,G,0.6);
    put('plat'+w+'x'+hh,w+2,hh+2,(g)=>{const o=1,P2=(a,b,c,e,col)=>P.R(g,a+o,b+o,c,e,col);
      if(hh>6){for(const px of[4,w-6]){P2(px-1,3,4,hh-3,C.tinta);P2(px,3,2,hh-3,C.poste);}
        if(hh>14){P.line(g,o+5,o+6,o+w-6,o+hh-2,C.posteDk);P.line(g,o+w-5,o+6,o+6,o+hh-2,C.posteDk);}}
      P2(-1,-1,w+2,6,C.tinta);P2(0,0,w,4,C.mad);P2(0,0,w,1,C.madHi);P2(0,3,w,1,C.madDk);
      for(let i=7;i<w;i+=9)P2(i,1,1,2,C.madDk);},-1,-1);
    return true;
  },
  // frente de la losa de la autopista caída, encima del jugador (gancho L.drawTunnelFront)
  tunelFrente(t,d){if(t.k!=='overpass')return false;const iy=t.y+t.th;
    ctx.fillStyle='rgba(12,8,24,0.22)';ctx.fillRect(Math.round(t.x)+3,iy,Math.round(t.w)-6,G-iy);
    ctx.fillStyle='rgba(12,8,24,0.3)';ctx.fillRect(Math.round(t.x)+3,iy,Math.round(t.w)-6,3);
    losa(Math.round(t.x),Math.round(t.y),Math.round(t.w),d);return true;},
  // ----- coberturas (gancho L.drawCover) -----
  cobertura(c,d){
    const x=Math.round(c.x),w=Math.round(c.w),h=Math.round(c.h),top=G-h;
    if(c.vida<=0){ESC_sombraContacto(d,x+w/2,w,G,0.5);
      ctx.drawImage(ESC_sprite(d,'escombro'+c.k+w,w+6,8,(g)=>{const col=COB[c.k]||COB.concrete;
        for(let i=0;i<w+2;i+=3){const hh=1+Math.floor(hsh(i*3.1+w)*4);P.R(g,i,7-hh-1,4,hh+1,C.tinta);P.R(g,i+1,7-hh,2,hh,col[0]);if(hh>2)P.R(g,i+1,7-hh,2,1,col[1]);}}),x-3,G-8);
      return true;}
    if(!COB[c.k])return false;
    ESC_sombraContacto(d,x+w/2,w,G,0.6);
    ctx.drawImage(ESC_sprite(d,'cob'+c.k+w+'x'+h,w+2,h+1,(g)=>cobertura(g,c.k,w,h)),x-1,top-1);
    if(c.vida<c.max*0.5){ctx.fillStyle=C.tinta;ctx.fillRect(x+Math.round(w*0.25),top+1,1,Math.round(h*0.5));ctx.fillRect(x+Math.round(w*0.25),top+Math.round(h*0.5),3,1);ctx.fillRect(x+Math.round(w*0.7),top,2,2);}
    return true;
  },
  // ----- cajas (combate.js; el escenario las dibuja con def.caja) -----
  caja(c,d){return ESC_H.caja(c,d);},
  decor(o,d){
    const g=G,x=Math.round(o.x),spr=(k,w,h,fn,dx,dy)=>ctx.drawImage(ESC_sprite(d,k,w,h,fn),x+dx,g+dy);
    switch(o.k){
    case 'tacho':case 'barrel':{
      ESC_sombraContacto(d,x+4,8,g,0.6);
      spr('tacho',10,13,(s)=>{P.R(s,0,0,10,13,C.tinta);P.R(s,1,1,8,11,C.metal[0]);P.R(s,1,1,2,11,C.metal[1]);P.R(s,7,1,2,11,C.metal[2]);P.R(s,1,4,8,1,C.metal[2]);P.R(s,1,8,8,1,C.metal[2]);P.R(s,1,1,8,1,'#7a7a90');},-1,-12);
      if(o.k==='tacho'){const f=ESC_reducido()?0:((T>>3)+Math.floor(o.x/7))%3;
        spr('llama'+f,9,11,(s)=>{const sh=[[0,10,7],[1,7,5],[2,4,3],[3,2,1]],off=f===1?1:f===2?-1:0;
          for(const[k,dy,w]of sh)P.R(s,4-Math.floor(w/2)+((k&1)?1:0)+(k>1?off:0),dy-1,w,3,C.fuego[0]);
          P.R(s,2,7,4,3,C.fuego[1]);P.R(s,3,4+(f===2?1:0),2,3,C.fuego[1]);P.R(s,3,8,2,2,C.fuego[2]);},0,-23);}
      return true;}
    case 'porton':ESC_sombraContacto(d,x+8,6,g,0.6);ESC_sombraContacto(d,x+78,6,g,0.6);
      spr('porton',88,62,(s)=>{const ink=C.tinta;
        for(const px of[4,74]){P.R(s,px,8,8,54,ink);P.R(s,px+1,9,6,53,'#5c4452');P.R(s,px+1,9,1,53,'#7a5a66');P.R(s,px,6,8,3,ink);}
        // hoja del portón abierta: barrotes de 2 px cada 4 px y un travesaño (nada de trama)
        P.R(s,12,24,20,38,ink);P.R(s,13,25,18,1,'#55455c');for(let bx=14;bx<30;bx+=4)P.R(s,bx,25,2,36,'#55455c');P.R(s,13,40,18,2,'#55455c');P.R(s,13,59,18,2,'#55455c');
        // cartel pintado a mano
        P.R(s,0,10,88,15,ink);P.R(s,1,11,86,13,'#8a4a34');P.R(s,1,11,86,1,'#c87a4a');for(let i=6;i<84;i+=11)P.R(s,i,20,1,3,'#76392f');
        const t=typeof pfLienzo==='function'?pfLienzo('DESARMADERO','#e8d8b0'):null;if(t)s.drawImage(t,Math.round((88-t.width)/2),13);
        // etiqueta "VENDIDO": recta, colgada de una sola esquina; el hilo llega al borde de arriba, nunca entra en las letras
        {const v=typeof pfLienzo==='function'?pfLienzo('VENDIDO','#5e462f'):null,tw=v?v.width:28,bw=tw+6,bx=84-bw,by=4;
          P.R(s,bx,by,bw,10,ink);P.R(s,bx+1,by+1,bw-2,8,'#e8d8b0');if(v)s.drawImage(v,bx+3,by+2);
          P.R(s,bx+1,by-1,1,1,'#d8c8a0');P.R(s,bx,by-2,1,1,'#d8c8a0');P.R(s,bx-1,by-3,1,1,'#d8c8a0');P.R(s,bx-2,by-4,2,1,ink);}
        },-4,-62);return true;
    case 'chapa':{const w=o.w||58;for(const px of[x+5,x+w-7])ESC_sombraContacto(d,px+1,3,g,0.55);
      // en alto, sobre dos postes: el borde de abajo en y = G−24 (por encima de la cabeza de los personajes)
      spr('postes'+w,w,26,(s)=>{for(const px of[4,w-8]){P.R(s,px,0,4,26,C.tinta);P.R(s,px+1,0,2,26,'#5b4452');P.R(s,px+1,0,1,26,'#5f434c');}},0,-26);
      ctx.drawImage(ESC_H.chapa(d,'COMPRO ORO',w),x,g-46);return true;}
    case 'car':ESC_sombraContacto(d,x+24,46,g,0.6);
      spr('auto',50,18,(s)=>{P.R(s,0,9,50,8,C.tinta);P.R(s,1,10,48,6,'#4e4868');P.R(s,1,10,48,1,'#7a7498');P.R(s,12,3,26,7,C.tinta);P.R(s,13,4,24,6,'#4d4669');
        P.R(s,15,5,8,3,'#5a6a90');P.R(s,26,5,9,3,'#46547a');P.R(s,40,11,8,2,'#6a4a3a');P.disc(s,10,16,2,C.tinta);P.disc(s,40,16,2,C.tinta);},0,-17);return true;
    case 'pylon':ESC_sombraContacto(d,x+8,20,g,0.5);
      spr('torre',30,100,(s)=>{P.torre(s,14,100,92,C.juego);},-6,-100);return true;
    case 'sign':ESC_sombraContacto(d,x+6,4,g,0.5);
      spr('cartel',14,26,(s)=>{P.R(s,5,8,3,18,C.tinta);P.R(s,6,8,1,18,'#5b4452');P.R(s,0,0,14,10,C.tinta);P.R(s,1,1,12,8,'#8a4a34');P.R(s,1,1,12,1,'#c87a4a');
        for(let i=0;i<4;i++)P.R(s,2+i*3,3,1,5,'#76392f');},-1,-26);return true;
    case 'tire':ESC_sombraContacto(d,x+5,10,g,0.6);
      spr('cubierta',12,10,(s)=>{P.oval(s,6,5,5,4,C.tinta);P.oval(s,6,5,4,3,'#4f4760');P.oval(s,6,5,1,1,C.g2);P.R(s,3,2,3,1,'#4f4760');},-1,-10);return true;
    }
    return false;
  },
};
ESC_registrar(0,def);
})();
