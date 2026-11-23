'use strict';
// Óxido · Escenario de la misión 8, Valle del Trueno (estilo "Hondo", tarde de tormenta). Del Ilustrador de escenarios.
// Va DESPUÉS de js/escenario-base.js y de js/mision8.js (envuelve los ganchos de M8_LVL; con ?esc=0 queda como antes).
// Guía: notas/arte/guia.md · ficha: notas/arte/fichas/escenarios.md (M8: "conservar cascada y niebla") · Guion: mision-8.md.
// Luz: sol entre hojas #e8f0a0 (der.) y cielo de tormenta #a0c0c0. Relámpagos lejanos solo sin MOVIMIENTO REDUCIDO.
// Quedan de mision8.js (se llaman desde acá): el volcán (M8_volcan), las máquinas de pastar con cuello de grúa (M8_cuello, que
// levantan la pala en el momento de historia), los pájaros (M8.birds), y además el piso, los rayos de luz (drawFxFondo), las
// hojas de las esquinas y el polen (drawFx), el decorado, las plataformas, el tronco-túnel y las coberturas.
// Historia: al arrancar, el CAJÓN de la nave caído en un cráter que humea, vacío, con el hueco con forma de diente en la espuma,
// las marcas de la nave en la tierra y etiquetas $.
(()=>{
const P=ESC_px,G=GROUND,LV=M8_LVL;
const C={
  tinta:'#17141f',
  cielo:'#2a3a3a',cielo2:'#3e5250',cielo3:'#62786c',cielo4:'#9aa688',horizonte:'#d4c890',nube:'#22302e',nubeHi:'#3a4a46',
  lejos:'#9ab0a0',lejosHi:'#b2c4b2',lejosDk:'#80988a',roca:'#86a092',rocaDk:'#6e887a',agua:'#d0e8e4',
  claro:'#9aa880',claroDk:'#86967a',claroSol:'#c0bc84',
  medio:'#3a5034',medioC:'#46603e',medioHi:'#5a7848',tronco:'#2e3e28',liana:'#33482c',
  cerca:'#3e5634',cercaHi:'#56723e',
  niebla:'#d4dcb8',bruma:'#a8c0b0',sol:'#e8f0a0',calido:'#c8c878',frente:'#0c160e',
  // el cajón de la nave
  chapa:'#6a7484',chapaHi:'#9aa4b4',chapaDk:'#4a5262',espuma:'#d8d0b8',espumaDk:'#a89e86',tierraC:'#4a3a28',quemado:'#2e261e',
};
const hsh=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const CASC=[[178,22],[498,28]]; // cascadas en la capa lejana (x, arriba en y local)
const y0L=24;                    // la capa lejana empieza en y 24

// ---------- definición ----------
const def={
  pix:1,nat:'tarde',semilla:808,paso:'pixel',
  atm:{col:C.niebla,fuerza:0.03,pie:0.02},
  luzPersonajes:{calida:'#e8f0a0',lado:1,fria:'#a0c0c0'},
  sombra:'#0a120c',
  halosAltos:{col:C.bruma,a:0.55,r:30},
  ambientes:{
    base:{oscuridad:0.1,oscCol:'#060c08'},
    tarde:{tinte:'#ffd890',tinteA:0.14,modo:'overlay',luces:0.6},
    dia:{tinte:'#e8f0d8',tinteA:0.16,modo:'screen',luces:0.2,oscuridad:0},
    amanecer:{tinte:'#e0a0a0',tinteA:0.1,modo:'overlay',luces:0.5,oscuridad:0.04},
    lluvia:{tinte:'#6a7488',tinteA:0.2,modo:'multiply',nieblaMas:0.14,luces:1},
    limpio:{reemplazar:true,tintes:[['screen','#6a9a7a',0.18]],oscuridad:0,luces:0.4}},
  capas:[
    // 1 · cielo de tormenta: nubes pesadas arriba, claro hacia el horizonte; el volcán de mision8.js y relámpagos lejanos
    {id:'cielo',cielo:true,ancho:W,y:-40,alto:G+40,dibujar(g,w,h){
      const Y0=40;P.escalones(g,w,h,[[0,C.cielo],[Y0+30,C.cielo],[Y0+60,C.cielo2],[Y0+86,C.cielo3],[Y0+106,C.cielo4],[Y0+120,C.horizonte],[h,C.horizonte]],4);
      for(let r=30;r>10;r-=7){g.globalAlpha=0.12;P.disc(g,240,Y0+60,r,'#f0f0c0');}g.globalAlpha=0.5;P.disc(g,240,Y0+60,8,'#fff8d8');g.globalAlpha=1;   // sol tapado
      P.cresta(g,w,Y0+10,8,3,C.nube,1.4,0);P.R(g,0,0,w,Y0+6,C.nube);P.cresta(g,w,Y0+20,5,9,C.nubeHi,2.2,0);
      for(let i=0;i<5;i++)P.R(g,Math.floor(hsh(i*3.3)*w),Y0+30+i*6,30+Math.floor(hsh(i)*40),1,C.cielo2);},
      vivo(c2,ox,oy){
        if(typeof M8_volcan==='function')try{M8_volcan();}catch(e){}
        // relámpago lejano: rama de 1 px y un fogonazo en las nubes, cada tanto (nunca con MOVIMIENTO REDUCIDO)
        if(ESC_reducido())return;const per=420,t=T%per,k=Math.floor(T/per);if(t>9)return;
        const x0=30+Math.floor(hsh(k*1.7)*170),y=Math.round(oy+40+8);c2.save();c2.globalCompositeOperation='lighter';c2.imageSmoothingEnabled=true;
        c2.globalAlpha=0.35*(1-t/10);c2.drawImage(ESC_glow('#d8e8ff'),x0-40,y-24,80,48);c2.restore();
        if(t<5){c2.fillStyle='#e8f0ff';let x=x0;for(let yy=y;yy<y+34;yy+=2){c2.fillRect(x,yy,1,2);x+=hsh(k*9+yy)<0.5?-1:1;}}}},
    // 2 · montes lejanos con mesetas de roca y DOS CASCADAS (se conservan)
    {id:'lejos',par:0.08,ancho:720,y:y0L,alto:G-y0L,pie:'auto',niebla:0.14,dibujar(g,w,h){
      P.cresta(g,w,30,12,2,C.lejos,1.6);P.R(g,0,40,w,h-40,C.lejos);P.cresta(g,w,24,6,5,C.lejosHi,3,30);
      for(const[cx,top]of CASC){const mx=cx-27;P.R(g,mx,top,60,h-top,C.rocaDk);P.R(g,mx+1,top,58,h-top,C.roca);P.R(g,mx+1,top,58,2,C.lejosHi);
        for(let i=0;i<6;i++)P.R(g,mx+5+i*9,top+5,2,h-top-5,C.rocaDk);P.R(g,cx-1,top,6,h-top,'#a8c4c0');}
      for(let x=0;x<w;x+=6){const r=3+Math.floor(hsh(x*0.7)*4);P.disc(g,x,58+Math.floor(hsh(x)*6),r,hsh(x*3)<0.5?C.lejosDk:'#8aa494');}
      P.R(g,0,62,w,h-62,C.lejosDk);},
      vivo(c2,ox,oy,c){ // el agua que cae, en vivo (quieta con MOVIMIENTO REDUCIDO)
        const red=ESC_reducido();for(const[cx,top]of CASC)ESC_cada(c,ox,cx,12,x=>{const X=Math.round(x),t0=Math.round(oy+top),b=Math.round(oy+62);
          c2.fillStyle='rgba(208,232,228,0.75)';c2.fillRect(X,t0,4,b-t0);c2.fillStyle='#f0fcfa';
          for(let i=0;i<4;i++){const yy=t0+(red?i*12:Math.floor((T*0.9+i*13)%(b-t0)));c2.fillRect(X+(i%2)*2,yy,1,4);}
          c2.fillStyle='rgba(220,240,236,0.4)';c2.fillRect(X-6,b-1,16,2);});}},
    // 3 · el claro del fondo: las máquinas de pastar con cuello de grúa (mision8.js) y su prado
    {id:'claro',par:0.15,ancho:760,y:0,alto:G,pie:'auto',niebla:0.02,dibujar(g,w,h){
      P.cresta(g,w,h-36,2,7,C.claro,2);P.R(g,0,h-34,w,34,C.claro);for(let x=0;x<w;x+=3)if(hsh(x*0.53)<0.6)P.R(g,x,h-35+Math.floor(hsh(x*1.1)*2),2,1,C.claroSol);for(let x=0;x<w;x+=5)if(hsh(x*0.37)<0.4)P.R(g,x,h-34+Math.floor(hsh(x)*12),3,1,C.claroDk);},
      vivo(c2,ox,oy,c){if(typeof M8_cuello!=='function'||typeof M8_CUELLOS==='undefined')return;
        for(const m of M8_CUELLOS)ESC_cada(c,ox,m.x,50,x=>{try{M8_cuello(m,x,Math.round(oy+G-34));}catch(e){}});}},
    // 4 · niebla entre el claro y los árboles (se conserva)
    {id:'niebla media',par:0.2,ancho:W,y:G-76,alto:56,niebla:0,dibujar(g,w,h){for(let y=0;y<h;y++){g.globalAlpha=0.42*Math.pow(y/(h-1),1.1);P.R(g,0,y,w,1,C.niebla);}g.globalAlpha=1;}},
    // 5 · árboles del medio (#3a5034) con copas redondas, cícadas y lianas; los pájaros de mision8.js
    {id:'medio',par:0.3,ancho:900,y:0,alto:G,pie:'auto',niebla:0,dibujar(g,w,h){
      let x=6,i=0;while(x<w-10){const k=hsh(i*2.3),hh=60+Math.floor(hsh(i*5.1)*56),tx=x+8;i++;
        if(k<0.62){P.R(g,tx-2,h-hh,5,hh,C.tronco);P.R(g,tx-2,h-hh,1,hh,C.medio);
          const copas=[];for(let j=0;j<7;j++){const a=hsh(i*7+j)*6.28,r=7+Math.floor(hsh(i*3+j)*8),cx=tx+Math.round(Math.cos(a)*11),cy=h-hh+Math.round(Math.sin(a)*6);copas.push([cx,cy,r]);P.disc(g,cx,cy,r,j%3?C.medio:C.medioC);}
          for(let j=0;j<4;j++)P.disc(g,tx-8+j*6,h-hh-6,3,C.medioHi);
          for(const[cx,cy,r]of copas)for(let k=0;k<=r;k++){const yy=cy-Math.round(Math.sqrt(Math.max(0,r*r-k*k)));if(k>r*0.15)P.R(g,cx+k,yy,1,1,C.calido);} // borde cálido del lado del sol
          for(let j=0;j<3;j++){const lx=tx-9+Math.floor(hsh(i+j)*18),l=24+Math.floor(hsh(i*j+3)*30);P.R(g,lx,h-hh+6,1,l,C.liana);P.R(g,lx-1,h-hh+6+l,3,2,C.medioC);}}
        else{const h2=Math.round(hh*0.6);P.R(g,tx-2,h-h2,4,h2,C.tronco);for(let y=h-h2;y<h;y+=3)P.R(g,tx-2,y,4,1,C.medio);
          for(let j=0;j<7;j++){const a=-Math.PI+0.25+j*0.45;P.line(g,tx,h-h2,tx+Math.round(Math.cos(a)*18),h-h2-Math.round(Math.abs(Math.sin(a))*5)+5,C.medioC);}}
        x+=26+Math.floor(hsh(i*9.7)*34);}
      P.R(g,0,h-12,w,12,C.tronco);for(let x2=0;x2<w;x2+=5)P.disc(g,x2,h-12,3+Math.floor(hsh(x2)*3),C.medio);},
      vivo(c2){if(typeof M8==='undefined'||!M8.birds)return;c2.fillStyle='#14201a';
        for(const b of M8.birds){const w=Math.round(Math.sin(b.f)*1.6*b.s),x=Math.round(b.x),y=Math.round(b.y);c2.fillRect(x-2,y-w,2,1);c2.fillRect(x,y,1,1);c2.fillRect(x+1,y-w,2,1);}}},
    // 6 · matas y helechos cercanos (ya no casi negros)
    {id:'cerca',par:0.55,ancho:760,y:G-52,alto:52,pie:'auto',niebla:0,dibujar(g,w,h){
      for(let x=0;x<w;x+=11+Math.floor(hsh(x)*12)){const hh=14+Math.floor(hsh(x*1.3)*24);for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*0.42;const ex=x+Math.round(Math.cos(a)*hh*0.9),ey=h-Math.round(hh*Math.abs(Math.sin(a))*0.95);P.line(g,x,h-1,ex,ey,i%2?C.cerca:C.cercaHi);if(i>=3)P.R(g,ex,ey,1,1,C.calido);}}
      P.R(g,0,h-5,w,5,C.cerca);}},
    // 6b · haces de sol entre las hojas (#e8f0a0), en escalones de 4 px, delante de los árboles y detrás de la capa de juego
    {id:'haces',par:0.35,ancho:420,y:0,alto:G,niebla:0,dibujar(g,w,h){
      for(const[x0,ww]of[[60,12],[210,9],[330,14]])for(let y=0;y<h;y+=4){const t=y/h,x=Math.round(x0+y*0.45);g.globalAlpha=0.26*(1-t*0.5);P.R(g,x,y,Math.round(ww+4+t*12),4,C.sol);}
      g.globalAlpha=1;}},
    // 7 · bruma (regla 2): alta tenue y al pie, verde grisácea de valle
    ESC_brumaAlta(C.bruma,0.24,a=>a.hora!=='noche'?0.45:(a.clima==='lluvia'||a.clima==='tormenta'?1.4:1.1)),
    {id:'bruma',par:0.7,parY:1,ancho:W,y:104,alto:G-104+2,pie:'auto',niebla:0,nieblaPie:0,segunAmb:true,dibujar(g,w,h,R,c,a){const k=a&&a.hora==='noche'?(a.clima==='lluvia'||a.clima==='tormenta'?1.5:1.4):1;
      for(let y=0;y<h;y++){const u=Math.min(1,y/26),sm=u*u*(3-2*u),t=y/(h-1);g.globalAlpha=Math.min(0.7,(0.15*sm+0.22*t)*k);g.fillStyle=C.bruma;g.fillRect(0,y,w,1);}g.globalAlpha=1;}},
  ],
  // primer plano: hojas grandes y helechos abajo en los costados; una cortina de lianas arriba
  frente:{par:1.4,parY:1.15,alfa:1,ancho:980,bordesAbajo:true,piezas:[
    {x:24,y:0,w:40,h:10,abajo:true,dibujar(g,w,h){for(const[x,l]of[[2,18],[12,22],[24,16]]){P.line(g,x,h,x+l,0,C.frente);P.line(g,x+1,h,x+l+1,0,C.frente);P.oval(g,x+l-2,2,5,2,C.frente);}}},
    {x:560,y:0,w:30,h:8,abajo:true,dibujar(g,w,h){for(let i=0;i<30;i+=4){const l=3+Math.floor(hsh(i)*5);P.R(g,i,h-l,2,l,C.frente);}}},
    {x:320,y:0,w:58,h:34,arriba:true,dibujar(g,w,h){P.R(g,0,0,w,3,C.frente);for(const[x0,l]of[[6,28],[18,20],[30,32],[44,16],[52,24]]){let x=x0;for(let y=3;y<l;y++){P.R(g,x,y,1,1,C.frente);if(y%6===0)x+=(x0%2?1:-1);}P.oval(g,x,l+1,2,3,C.frente);}}},
  ],
    vivo(c2,d,par,ac){const dx=camX*(1-par),bot=Math.floor(camY+VH),x0=camX-dx-20,x1=camX+VW-dx+20;c2.globalAlpha=ac;c2.fillStyle=C.frente;
      for(let k=Math.floor(x0/28);k<=x1/28;k++){if(hsh(k*2.1)<0.5)continue;const X=Math.round(k*28+dx),borde=Math.min(X-camX,camX+VW-X),h=borde>VW*0.15?2:4;c2.fillRect(X,bot-h,12,h);c2.fillRect(X+3,bot-h-1,1,1);}
      c2.globalAlpha=1;}},
  // piso de mision8.js (tierra con musgo; el gigante del cruce) y encima raíces que se alejan en perspectiva
  piso(c2,x0,x1){
    if(LV.drawGround0)LV.drawGround0();
    const cx=Math.round(camX+VW/2);c2.globalAlpha=0.5;
    for(let x=Math.floor(x0/34)*34-60;x<x1+60;x+=34){if(hsh(x*0.21)<0.4)continue;const ex=cx+(x-cx)*1.8;P.line(c2,x,G+3,Math.round((x+ex)/2)+((x/34)%2?3:-3),Math.round((G+3+H)/2),'#3a2616');P.line(c2,Math.round((x+ex)/2)+((x/34)%2?3:-3),Math.round((G+3+H)/2),ex,H,'#3a2616');}
    c2.globalAlpha=1;
  },
  // Historia: el cráter con el cajón de la nave, al arrancar
  extras(lv){
    const duro=x=>(lv.covers||[]).some(c=>x>c.x-6&&x<c.x+c.w+6)||lv.decor.some(o=>o.k!=='helecho'&&o.k!=='huesos'&&x>o.x-8&&x<o.x+36)||
      lv.platforms.some(p=>!p.pyr&&x>p.x-4&&x<p.x+p.w+4)||(lv.crates||[]).some(c=>x>c.x-6&&x<c.x+20)||(lv.prisoners||[]).some(p=>!p.y&&x>p.x-10&&x<p.x+18);
    let x=60;while(x<200){let ok=true;for(let i=x;i<=x+50;i+=2)if(duro(i)){ok=false;break;}if(ok)break;x+=2;}
    return x<200?[{x,k:'crater'}]:[];
  },
  luces(){return[];},
  decor(o,d){
    if(o.k!=='crater')return false; // el resto del decorado es de mision8.js
    const x=Math.round(o.x);
    // marcas de la nave: dos surcos quemados en la tierra que vienen de la izquierda
    ctx.drawImage(ESC_sprite(d,'m8surcos',70,6,(s)=>{for(let i=0;i<70;i++){const k=i/70;P.R(s,i,1+Math.round(k*2),1,1,C.quemado);if(i%3)P.R(s,i,4,1,1,C.quemado);}}),x-58,G+1);
    // cráter: borde de tierra levantada y hueco
    ctx.drawImage(ESC_sprite(d,'m8crater',52,8,(s)=>{P.oval(s,26,6,26,3,C.tinta);P.oval(s,26,6,25,2,C.tierraC);P.oval(s,26,6,18,1,C.quemado);
      P.R(s,2,4,8,2,C.tierraC);P.R(s,42,4,8,2,C.tierraC);P.R(s,3,4,6,1,'#6a5438');P.R(s,43,4,6,1,'#6a5438');}),x,G-4);
    // el cajón roto, abierto, VACÍO: la espuma tiene el hueco con forma de diente
    ctx.drawImage(ESC_sprite(d,'m8cajon',30,22,(s)=>{
      P.R(s,2,6,26,16,C.tinta);P.R(s,3,7,24,14,C.chapa);P.R(s,3,7,24,1,C.chapaHi);P.R(s,3,19,24,2,C.chapaDk);
      for(let i=6;i<26;i+=6)P.R(s,3+i,8,1,10,C.chapaDk);
      P.R(s,6,8,18,8,C.espumaDk);P.R(s,7,9,16,6,C.espuma);
      P.R(s,12,10,6,4,C.espumaDk);P.R(s,13,9,4,1,C.espumaDk);P.R(s,11,11,1,2,C.espumaDk);P.R(s,18,11,1,2,C.espumaDk); // el hueco del diente (vacío)
      P.R(s,0,2,10,4,C.tinta);P.R(s,1,3,8,2,C.chapa);P.R(s,1,3,8,1,C.chapaHi);                                       // tapa arrancada
      P.R(s,24,0,2,6,C.tinta);ESC_H.etiqueta(s,19,8);}),x+12,G-22);
    // humo: bocanadas que suben (quietas con MOVIMIENTO REDUCIDO)
    const red=ESC_reducido();for(let i=0;i<5;i++){const a=red?i/5:((T*0.25+i*30)%150)/150,X=Math.round(x+26+a*14+Math.sin(a*5+i)*2),Y=Math.round(G-14-a*40),r=1+Math.floor(a*4);
      ctx.globalAlpha=0.35*(1-a);ctx.fillStyle='#8a948c';ctx.fillRect(X-r,Y-r,r*2,r*2);}ctx.globalAlpha=1;
    return true;
  },
  caja(c,d){return ESC_H.caja(c,d);},
};
ESC_registrar(LV,def);
})();
