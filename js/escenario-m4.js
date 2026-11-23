'use strict';
// Óxido · Escenario de la misión 4, Arenas del Rey (estilo "Hondo", tarde). Del Ilustrador de escenarios.
// Va DESPUÉS de js/escenario-base.js y de js/mision4.js (envuelve los ganchos de M4_LVL; con ?esc=0 queda como antes).
// Guía: notas/arte/guia.md · ficha: notas/arte/fichas/escenarios.md (M4 e "Historia") · Guion: notas/guion/mision-4.md.
// Luz: sol grande a la derecha #fff0c0 y rebote de arena #ffb060 desde abajo. Bruma de calor #ffd8a0 al pie (regla 2).
// Quedan de mision4.js: la TORMENTA (veladura y pared de arena con el reloj: M4_drawFace, se llama desde la capa del medio),
// el piso con la arena movediza y las grietas, el decorado, las plataformas, la tumba y las coberturas.
// Historia: la excavación de la banda (palas tiradas y etiquetas $ en columnas y sarcófagos) y "COMPRO ORO" pintado en un
// bloque de la pirámide. La arena que sube (el momento de historia) no es de acá y nunca forma cara.
(()=>{
const P=ESC_px,G=GROUND,LV=M4_LVL;
const C={
  tinta:'#17141f',
  cielo:'#c86a48',cielo2:'#e08a5c',cielo3:'#f2b27a',horizonte:'#ffe0a0',sol:'#fff0c0',solHalo:'#ffe0a0',
  lejos:'#e8b880',lejosSol:'#f6d09a',lejosDk:'#cc945e',calor:'#ffd8a0',
  lejos2:'#d89a68',lejos2Dk:'#c4885a',
  medio:'#a8643e',medioSol:'#d0905e',medioDk:'#8a4e32',sombra:'#7e462e',
  cerca:'#c48452',cercaHi:'#dca068',pasto:'#8a6a3a',
  bruma:'#ffd8a0',brumaNoche:'#b2b6da',frente:'#2a140c',
  pala:'#8a8478',palaHi:'#c0b8a8',mango:'#7a5434',manDk:'#5a3c24',
  pintura:'#8a2a22',
};
const hsh=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const DEC0=LV.drawDecor; // el decorado de mision4.js (para colgarle etiquetas $ encima a columnas y sarcófagos)
// el cielo de noche: azul de desierto, luna a la derecha y estrellas (lo demás lo tiñe la tabla de la hora)
const NOCHE={cielo:[[0,'#0e1030'],[50,'#1c1c44'],[90,'#2e2a58'],[116,'#4a3e6a'],[999,'#5a4a72']]};

// ---------- piezas ----------
function piramide(g,x,b,w,h,cSol,cSom,lineas){const tx=x+(w>>1);
  for(let i=0;i<h;i++){const hw=Math.round((w/2)*(i+1)/h);P.R(g,tx-hw,b-h+i,hw,1,cSom);P.R(g,tx,b-h+i,hw,1,cSol);}
  if(lineas)for(let s=5;s<h;s+=5){const hw=Math.round((w/2)*s/h);P.R(g,tx-hw,b-h+s,hw*2,1,lineas);}}
function columna(g,x,b,h,pal,rota){P.R(g,x,b-h,8,h,pal.c);P.R(g,x+6,b-h,2,h,pal.sol);P.R(g,x,b-h,2,h,pal.dk);   // sol a la derecha
  for(let i=3;i<6;i+=2)P.R(g,x+i,b-h+3,1,h-3,pal.dk);
  if(!rota){P.R(g,x-2,b-h-3,12,3,pal.c);P.R(g,x+6,b-h-3,4,3,pal.sol);}else{P.R(g,x,b-h-2,3,2,pal.c);P.R(g,x+5,b-h-1,3,1,pal.c);}
  P.R(g,x-9,b-1,9,1,pal.sombra);}                                                                               // sombra corta y dura, hacia la izquierda
function obelisco(g,x,b,h,pal){for(let i=0;i<h;i++){const ww=Math.max(2,Math.round(8-i*3/h));P.R(g,x+((8-ww)>>1),b-i-1,ww,1,i>h-5?pal.sol:pal.c);P.R(g,x+((8-ww)>>1)+ww-1,b-i-1,1,1,pal.sol);}
  P.R(g,x+2,b-h-3,4,3,pal.sol);P.R(g,x-10,b-1,10,1,pal.sombra);}
function arco(g,x,b,h,pal){P.R(g,x,b-h,5,h,pal.c);P.R(g,x+24,b-h,5,h,pal.c);P.R(g,x+4,b-h,1,h,pal.sol);P.R(g,x+28,b-h,1,h,pal.sol);P.R(g,x-1,b-h-4,22,4,pal.c);P.R(g,x-1,b-h-4,22,1,pal.sol);
  P.R(g,x-12,b-1,12,1,pal.sombra);}
const PAL_M={c:C.medio,sol:C.medioSol,dk:C.medioDk,sombra:C.sombra};

// ---------- definición ----------
const def={
  pix:1,nat:'tarde',semilla:404,paso:'pixel',
  atm:{col:C.calor,fuerza:0.05,pie:0.04},
  luzPersonajes:{calida:'#fff0c0',lado:1,fria:'#ffb060'},
  sombra:'#2a1208',
  halosAltos:{col:C.bruma,a:0.55,r:30},
  ambientes:{
    base:{oscuridad:0.08,oscCol:'#140a08'},
    dia:{tinte:'#fff4dc',tinteA:0.18,modo:'screen',luces:0.1,oscuridad:0},
    amanecer:{tinte:'#ff9ab0',tinteA:0.12,modo:'overlay',luces:0.4,oscuridad:0.04},
    noche:{tinte:'#30306e',tinteA:0.5,modo:'multiply',nieblaCol:'#3a3a64',luces:1,oscuridad:0.24},
    limpio:{reemplazar:true,tintes:[['screen','#ffd8a0',0.18]],oscuridad:0,luces:0.4},
    lluvia:{tinte:'#6a7488',tinteA:0.22,modo:'multiply',nieblaMas:0.14,luces:1}},
  capas:[
    // 1 · cielo de la tarde con el sol grande a la derecha (de noche: luna y estrellas)
    {id:'cielo',cielo:true,segunAmb:true,ancho:W,y:-40,alto:G+40,dibujar(g,w,h,R,c,a){
      const noche=a&&a.hora==='noche',Y0=40;
      if(noche){P.escalones(g,w,h,NOCHE.cielo.map(([y,col])=>[Math.min(h,y+Y0),col]),4);
        for(let i=0;i<60;i++)P.R(g,Math.floor(hsh(i*3.3)*w),Math.floor(hsh(i*7.1)*(Y0+80)),1,1,hsh(i)<0.2?'#f0f0ff':'#9a9ac8');
        return;} // la luna va en vivo(): sin el tinte de la noche, así queda clara
      P.escalones(g,w,h,[[0,C.cielo],[Y0+20,C.cielo],[Y0+50,C.cielo2],[Y0+84,C.cielo3],[Y0+110,C.horizonte],[h,C.horizonte]],4);
      for(let r=32;r>14;r-=6){g.globalAlpha=0.16;P.disc(g,190,Y0+86,r,C.solHalo);}g.globalAlpha=1; // sol de radio 14 (guía 10–14): el halo y las franjas dan el tamaño
      P.disc(g,190,Y0+86,14,C.sol);P.disc(g,190,Y0+86,12,'#fff8e0');
      for(let i=0;i<4;i++)P.R(g,166,Y0+90+i*3,48,1+(i>>1),C.cielo3);                                       // franjas de calor sobre el sol
      for(let i=0;i<6;i++){const y=Y0+18+i*11,x=Math.floor(hsh(i*5.1)*w);P.R(g,x,y,40+Math.floor(hsh(i)*50),1,C.cielo2);}},
      vivo(c2,ox,oy,c,a){if(!a||a.hora!=='noche')return;const X=Math.round(ox+190),Y=Math.round(oy+80);
        c2.save();c2.globalCompositeOperation='lighter';c2.imageSmoothingEnabled=true;c2.globalAlpha=0.25;c2.drawImage(ESC_glow('#c8c8ff'),X-30,Y-30,60,60);c2.restore();
        c2.fillStyle='#e8e6f2';c2.beginPath();c2.arc(X,Y,11,0,7);c2.fill();c2.fillStyle='#cac6dc';c2.fillRect(X-5,Y-4,3,3);c2.fillRect(X+3,Y+3,2,2);}},
    // 2 · pirámides y dunas lejanas, casi del color del cielo, con bruma de calor
    {id:'lejos',par:0.08,ancho:420,y:0,alto:G,pie:'auto',niebla:0.04,dibujar(g,w,h){
      const b=126;piramide(g,40,b,130,62,C.lejosSol,C.lejosDk,null);piramide(g,190,b,80,38,C.lejosSol,C.lejosDk,null);piramide(g,300,b,150,70,C.lejosSol,C.lejosDk,null);
      P.cresta(g,w,b-2,5,3,C.lejos,1.5);P.R(g,0,b,w,h-b,C.lejos);
      for(let i=0;i<4;i++){g.globalAlpha=0.35-i*0.07;P.R(g,0,b-6+i*2,w,1,C.calor);}g.globalAlpha=1;}},
    // 3 · dunas y el campamento lejano de la excavación (carpas chicas)
    {id:'lejos 2',par:0.22,ancho:380,y:0,alto:G,pie:'auto',niebla:0,dibujar(g,w,h){
      P.cresta(g,w,134,7,5,C.lejos2,2);P.R(g,0,136,w,h-136,C.lejos2);
      for(const[x,s]of[[60,8],[74,6],[260,7]]){for(let i=0;i<s;i++)P.R(g,x+i,128-i+s,2*(s-i),1,i===0?C.lejos2Dk:'#e0aa78');P.R(g,x+s,126,1,4,C.lejos2Dk);}
      for(let x=0;x<w;x+=6)if(hsh(x*0.9)<0.3)P.R(g,x,134+Math.floor(hsh(x)*4),3,1,C.lejos2Dk);}},
    // 4 · ruinas y obeliscos del medio (sol a la derecha, sombras cortas a la izquierda); acá va la TORMENTA de mision4.js
    {id:'medio',par:0.45,ancho:320,y:0,alto:G,pie:'auto',niebla:0,dibujar(g,w,h){
      const b=h-6;P.cresta(g,w,b,4,4,'#c07c4e',2);P.R(g,0,b+1,w,h-b,'#c07c4e');
      columna(g,30,b,34,PAL_M,false);columna(g,48,b,22,PAL_M,true);obelisco(g,110,b,40,PAL_M);arco(g,170,b,24,PAL_M);
      columna(g,250,b,28,PAL_M,true);P.R(g,262,b-4,12,4,C.medioDk);P.R(g,262,b-4,12,1,C.medioSol);                 // tambor caído
      for(let x=0;x<w;x+=7)if(hsh(x*1.7)<0.25)P.R(g,x,b+2,2,1,C.medioDk);},
      vivo(){ // la tormenta de mision4.js: veladura y la pared de arena con el reloj (no forma cara)
        const tf=typeof M4!=='undefined'?M4.tf:null,dk=tf&&tf.k||0;
        if(dk>0){ctx.fillStyle=`rgba(46,20,14,${0.5*dk})`;ctx.fillRect(-2,camY-2,VW+4,G-camY+4);if(typeof M4_drawFace==='function')M4_drawFace();}}},
    // 5 · borde de duna cercano con matas secas
    {id:'cerca',par:0.7,ancho:280,y:0,alto:G,pie:'auto',niebla:0,dibujar(g,w,h){
      P.cresta(g,w,h-10,3,6,C.cerca,3);P.R(g,0,h-8,w,8,C.cerca);for(let x=0;x<w;x+=5)if(hsh(x*0.3)<0.5)P.R(g,x,h-10+Math.floor(hsh(x*2)*2),3,1,C.cercaHi);
      for(let x=10;x<w;x+=37){for(let k=0;k<4;k++)P.line(g,x+3,h-9,x+k*2,h-14-Math.floor(hsh(x+k)*4),C.pasto);}}},
    // 6 · bruma de calor (regla 2): alta tenue y al pie
    // (de noche la bruma es fría, de luna; de día, de calor)
    Object.assign(ESC_brumaAlta(C.bruma,0.2,{amanecer:0.35,tarde:0.3,dia:0.25,noche:0}),{id:'bruma alta calor'}),
    Object.assign(ESC_brumaAlta(C.brumaNoche,0.28,a=>a.hora!=='noche'?0:(a.clima==='lluvia'||a.clima==='tormenta'?1.35:1)),{id:'bruma alta luna'}),
    {id:'bruma',par:0.7,parY:1,ancho:W,y:100,alto:G-100+2,pie:'auto',niebla:0,nieblaPie:0,segunAmb:true,dibujar(g,w,h,R,c,a){const noche=a&&a.hora==='noche',col=noche?C.brumaNoche:C.bruma,k=noche?(a.clima==='lluvia'||a.clima==='tormenta'?1.4:1.25):1;
      for(let y=0;y<h;y++){const u=Math.min(1,y/26),sm=u*u*(3-2*u),t=y/(h-1);g.globalAlpha=Math.min(0.7,(0.24*sm+0.26*t)*k);g.fillStyle=col;g.fillRect(0,y,w,1);}g.globalAlpha=1;}},
  ],
  // primer plano: columna caída y palmera seca, solo en los costados
  frente:{par:1.4,parY:1.15,alfa:1,ancho:960,bordesAbajo:true,piezas:[
    {x:20,y:0,w:44,h:10,abajo:true,dibujar(g,w,h){P.R(g,0,2,40,h-2,C.frente);P.R(g,36,0,8,h,C.frente);for(let i=4;i<36;i+=6)P.R(g,i,1,2,1,C.frente);}},
    {x:520,y:0,w:24,h:8,abajo:true,dibujar(g,w,h){P.R(g,0,3,24,h-3,C.frente);P.R(g,4,1,8,2,C.frente);P.R(g,14,0,6,3,C.frente);}},
    {x:300,y:0,w:60,h:34,arriba:true,dibujar(g,w,h){P.R(g,26,0,4,8,C.frente);for(const[dx,l,s]of[[-1,30,1],[1,28,1],[-1,18,2],[1,20,2]]){let x=28,y=4;for(let i=0;i<l;i++){P.R(g,x,y,2,1,C.frente);x+=dx;if(i%s===0)y++;if(i%5===4)P.R(g,x,y+1,1,2,C.frente);}}}},
  ],
    vivo(c2,d,par,ac){const dx=camX*(1-par),bot=Math.floor(camY+VH),x0=camX-dx-20,x1=camX+VW-dx+20;c2.globalAlpha=ac;c2.fillStyle=C.frente;
      for(let k=Math.floor(x0/34);k<=x1/34;k++){if(hsh(k*1.9)<0.5)continue;const X=Math.round(k*34+dx),borde=Math.min(X-camX,camX+VW-X),h=borde>VW*0.15?2:4;c2.fillRect(X,bot-h,16,h);}
      c2.globalAlpha=1;}},
  // piso de mision4.js (arena movediza, grietas) y encima: ondas en perspectiva y huellas que van hacia la tumba
  piso(c2,x0,x1){
    if(LV.drawGround0)LV.drawGround0();
    const cx=Math.round(camX+VW/2),quick=LV.quick||[];
    c2.globalAlpha=0.22;for(let x=Math.floor(x0/20)*20-60;x<x1+60;x+=20)P.line(c2,x,G+3,cx+(x-cx)*1.7,H,'#9a6234');
    c2.globalAlpha=0.6;
    for(let x=Math.floor(x0/26)*26;x<x1;x+=26){if(hsh(x*0.13)<0.55||quick.some(q=>x>q.x-8&&x<q.x+q.w+8))continue;
      const y=G+4+Math.floor(hsh(x)*6);P.R(c2,x,y,2,1,'#8a5a2c');P.R(c2,x+5,y+2,2,1,'#8a5a2c');P.R(c2,x,y-1,2,1,'#e8b878');P.R(c2,x+5,y+1,2,1,'#e8b878');}
    c2.globalAlpha=1;
  },
  // Historia: palas tiradas de la excavación (lejos de la arena movediza y de lo que se toca)
  extras(lv){
    const duro=x=>(lv.covers||[]).some(c=>x>c.x-6&&x<c.x+c.w+6)||lv.decor.some(o=>x>o.x-10&&x<o.x+22)||(lv.quick||[]).some(q=>x>q.x-10&&x<q.x+q.w+10)||
      (lv.tunnels||[]).some(t=>x>t.x-8&&x<t.x+t.w+8)||(lv.pyramids||[]).some(p=>x>p.x-8&&x<p.x+p.w+8)||
      lv.platforms.some(p=>!p.pyr&&x>p.x-4&&x<p.x+p.w+4)||(lv.crates||[]).some(c=>x>c.x-6&&x<c.x+20)||(lv.prisoners||[]).some(p=>!p.y&&x>p.x-10&&x<p.x+18);
    const busca=(x0,w,lim)=>{let x=x0;while(x<lim){let ok=true;for(let i=x;i<=x+w;i+=2)if(duro(i)){ok=false;break;}if(ok)return x;x+=2;}return -1;};
    const out=[];for(const[x0,t]of[[1380,0],[1640,1],[2060,0]]){const x=busca(x0,20,x0+200);if(x>=0)out.push({x,k:'pala',t});}return out;
  },
  luces(lv){return lv.decor.filter(o=>o.k==='antorcha').map(o=>({x:o.x+2,y:G-28,r:50,col:'#ffaa50',fuerza:0.6,tipo:'fuego'}));},
  decor(o,d){
    if(o.k==='pala'){const x=Math.round(o.x);ESC_sombraContacto(d,x+10,20,G,0.4);
      ctx.drawImage(ESC_sprite(d,'m4pala'+o.t,22,8,(s)=>{ // pala tirada en la arena (la hoja con borde claro arriba)
        if(o.t===0){P.R(s,0,4,14,2,C.manDk);P.R(s,0,4,14,1,C.mango);P.R(s,13,2,7,5,C.tinta);P.R(s,14,3,5,3,C.pala);P.R(s,14,3,5,1,C.palaHi);}
        else{P.line(s,1,7,14,2,C.manDk);P.line(s,1,6,14,1,C.mango);P.R(s,14,0,7,6,C.tinta);P.R(s,15,1,5,4,C.pala);P.R(s,15,1,5,1,C.palaHi);}}),x,G-8);return true;}
    // etiquetas $ de EL TASADOR colgadas de algunos sarcófagos y columnas rotas (como mucho 1 o 2 por pantalla)
    if((o.k==='sarco'||o.k==='columnaR')&&DEC0){const r=DEC0.call(LV,o);
      if([760,1300,2566].includes(o.x)){const x=Math.round(o.x)+(o.k==='sarco'?14:4),y=G-(o.k==='sarco'?24:24);
        ctx.drawImage(ESC_sprite(d,'m4etq',10,12,(s)=>ESC_H.etiqueta(s,1,0)),x,y);}
      return r!==false;}
    return false;
  },
  // la pirámide: el dibujo de mision4.js y, en el bloque más grande de abajo, "COMPRO ORO" pintado a mano
  plat(pl,d){
    if(!pl.pyr||typeof M4_tier!=='function')return false;
    M4_tier(pl);
    const base=(LV.platforms||[]).concat(typeof platforms!=='undefined'?platforms:[]).filter(p=>p.pyr&&Math.abs(p.x-pl.x)<200);
    const masAncho=base.reduce((m,p)=>p.w>m.w?p:m,pl);
    if(masAncho===pl){const t=typeof pfLienzo==='function'?pfLienzo('COMPRO ORO','#3a2418'):null;
      if(t){ctx.globalAlpha=0.85;ctx.drawImage(t,Math.round(pl.x+(pl.w-t.width)/2),Math.round(pl.y+8));ctx.globalAlpha=1;}}
    return true;
  },
  caja(c,d){return ESC_H.caja(c,d);},
};
ESC_registrar(LV,def);
})();
