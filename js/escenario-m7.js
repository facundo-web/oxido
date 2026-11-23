'use strict';
// Óxido · Escenario de la misión 7, Nave a la deriva (estilo "Hondo", interior). Del Ilustrador de escenarios.
// Va DESPUÉS de js/escenario-base.js y de js/mision7.js / jefes7.js (envuelve los ganchos de M7_LVL; con ?esc=0 queda como antes).
// Guía: notas/arte/guia.md · ficha: notas/arte/fichas/escenarios.md (M7 e "Historia").
// Luz: emergencia ÁMBAR #ffa040 (nunca roja: el rojo es peligro) y paneles fríos #c0d8ff.
// Quedan de mision7.js: el techo con el ducto (por ahí viajan los raspadores), las lámparas del techo, el piso con los avisos
// de caída, el decorado, las plataformas, las coberturas y drawFx. El piso suma encima la rejilla en perspectiva con luz de abajo.
// Historia: por las ventanas se ve, abajo, el valle verde con el volcán (es la misión 8); pulsos dorados que corren por los
// caños de la pared hacia el reactor; cajones de la banda atados con correas y etiquetas $.
(()=>{
const P=ESC_px,G=GROUND,LV=M7_LVL;
const C={
  espacio:'#05060c',nebulosa:'#3a2a5a',estrella:'#d8dcf0',valle:'#3a6a4a',valleDk:'#2a4e3a',volcan:'#4a4038',
  pared:'#3a3a46',paredHi:'#4e4e5c',paredDk:'#2a2a34',marco:'#24242e',lejos:'#4a4a5a',vapor:'#6a7080',bruma:'#8a90a4',
  ambar:'#ffa040',ambarC:'#ffd090',frio:'#c0d8ff',oro:'#ffd070',tinta:'#17141f',frente:'#06060a',
  piso:'#2a2d36',rejilla:'#1a1d24',luzAbajo:'#ffb060',
  // capa de juego (Hondo): chapa clara con borde de arriba, tinta de contorno, amarillo de seguridad; nada rojo salvo peligro
  metal:'#5a6274',metalHi:'#8a92a4',metalDk:'#454c5e',metalOsc:'#3e4456',seg:'#d9a43a',segDk:'#a87a28',vidrio:'#2e5a4a',verde:'#5af08a',
  gas:'#6a7a5a',gasHi:'#94a47a',gasDk:'#4e5c42',
};
const SPR=(d,k,w,h,fn)=>ESC_sprite(d,'m7h-'+k,w,h,fn);
// contenedores de la escalera de carga: cuerpo, borde claro y acanalado (todo ≥ 0,06; el rojo pasa a óxido)
const CONT7={'#8c3b2a':['#9a5040','#c8806a','#7a3c30'],'#2f6a8a':['#3e7090','#7aa8c4','#305a76'],'#b07a2a':['#a88040','#d8b068','#86642e'],'#5a6270':['#646c7c','#9aa2b2','#4e5666']};
const contCol=c=>CONT7[c]||CONT7['#5a6270'];
// tablero de pasarela Hondo: tinta, chapa con agujeros, borde claro arriba y franja amarilla abajo
function tablero(g,w){P.R(g,0,0,w+2,6,C.tinta);P.R(g,1,1,w,4,C.metal);P.R(g,1,1,w,1,C.metalHi);for(let i=4;i<w-2;i+=4)P.R(g,i,3,2,1,C.metalOsc);for(let i=1;i<w;i+=8)P.R(g,i,5,4,1,C.seg);}
const hsh=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const VENT=[[22,40,82,46],[150,40,82,46]]; // ventanas de cada tramo de pared (x, y, ancho, alto), tramo de 256
const def={
  pix:1,nat:'noche',semilla:77,paso:'pixel',
  atm:{col:C.vapor,fuerza:0.02,pie:0},
  luzPersonajes:{calida:'#ffa040',lado:-1,fria:'#c0d8ff'},
  sombra:'#040408',
  oscPersonajes:0,
  ambientes:{base:{oscuridad:0.1,oscCol:'#040408',luces:1},
    // interior: la hora casi no se nota (como clima.js)
    dia:{luces:1,oscuridad:0.06},amanecer:{luces:1},tarde:{luces:1},
    limpio:{reemplazar:true,tintes:[['screen','#3a3a5a',0.2]],oscuridad:0,luces:0.8}},
  capas:[
    // 1 · el espacio por las ventanas: estrellas, nebulosa, un planeta y, abajo, el valle verde con el volcán (misión 8)
    {id:'espacio',cielo:true,ancho:W,y:-40,alto:G+44,dibujar(g,w,h){
      P.R(g,0,0,w,h,C.espacio);
      for(let i=0;i<70;i++){g.fillStyle=hsh(i*9)<0.2?C.estrella:'#6a6e88';g.fillRect(Math.floor(hsh(i*3.1)*w),Math.floor(hsh(i*7.3)*110),1,1);}
      for(let y=0;y<24;y++){const ww=Math.round(120*Math.sqrt(1-Math.pow((y-12)/12,2)));g.globalAlpha=0.25;P.R(g,110-ww,90+y,ww*2,1,C.nebulosa);}g.globalAlpha=1;
      P.disc(g,250,110,22,'#5a3a5a');for(let i=0;i<5;i++)P.R(g,230,98+i*6,42,2,i%2?'#7a4a5a':'#6a3a52');P.disc(g,262,116,22,'rgba(5,6,12,0)');
      for(let dy=-22;dy<=22;dy++){const ww=Math.floor(Math.sqrt(484-dy*dy));g.globalAlpha=0.55;P.R(g,250+Math.floor(ww*0.2),110+dy,Math.ceil(ww*0.8),1,C.espacio);}g.globalAlpha=1;
      // el valle de abajo, con el volcán humeante (se ve por la parte baja de las ventanas)
      // (y local = y del mundo + 40: las ventanas van de y 40 a 86 del mundo, el valle asoma en su parte baja)
      P.cresta(g,w,116,8,8,C.valleDk,1.6);P.cresta(g,w,122,5,40,C.valle,2.4);P.R(g,0,124,w,h-124,C.valle);
      for(let i=0;i<14;i++)P.R(g,60-i*2,104+i,4+i*4,1,C.volcan);P.R(g,58,102,4,2,'#ff8a40');P.R(g,190-10,112,40,1,C.volcan);
      g.globalAlpha=0.4;for(let i=0;i<4;i++)P.disc(g,60+i*4,96-i*6,2+i,'#6a6a70');g.globalAlpha=1;},
      vivo(c2){if(typeof M7!=='undefined'&&M7.flick>0&&(ESC_reducido()||Math.floor(M7.flick/10)%2)){c2.fillStyle=ESC_reducido()?'rgba(0,0,0,0.2)':'rgba(0,0,0,0.35)';c2.fillRect(-2,camY-2,VW+4,G-camY+4);}}},
    // 2 · la pared del pasillo con las ventanas grandes: mamparos, remaches, caños con pulsos dorados y la luz de emergencia ámbar
    {id:'pared',par:0.5,ancho:256,y:0,alto:G,pie:'auto',niebla:0,nieblaPie:0,dibujar(g,w,h){
      P.R(g,0,0,w,h,C.pared);for(let x=0;x<w;x+=32){P.R(g,x,0,1,h,C.paredDk);P.R(g,x+1,0,1,h,C.paredHi);}
      for(const[x,y,ww,hh]of VENT){P.R(g,x-4,y-4,ww+8,hh+8,C.marco);P.R(g,x-4,y-4,ww+8,1,C.paredHi);for(const[rx,ry]of[[x-2,y-2],[x+ww+1,y-2],[x-2,y+hh+1],[x+ww+1,y+hh+1]])P.R(g,rx,ry,1,1,'#8a8a98');
        g.save();g.globalCompositeOperation='destination-out';g.fillStyle='#000';g.fillRect(x,y,ww,hh);g.restore();P.R(g,x+(ww>>1)-1,y,3,hh,C.marco);P.R(g,x+6,y+2,2,hh-4,'rgba(192,216,255,0.12)');}
      P.R(g,116,0,20,h,C.paredDk);P.R(g,116,0,2,h,C.paredHi);P.R(g,122,58,8,6,C.tinta); // costilla con el soporte de la baliza
      P.R(g,0,96,w,4,'#2e2e3a');P.R(g,0,96,w,1,C.paredHi);P.R(g,0,102,w,2,'#26262f'); // caños bajo las ventanas
      for(let x=4;x<w;x+=40){P.R(g,x,110,10,8,C.paredDk);P.R(g,x+2,112,6,1,C.frio);} // paneles fríos
      P.R(g,0,h-20,w,20,C.paredDk);},
      vivo(c2,ox,oy,c){
        // pulsos dorados por el caño, hacia el reactor (derecha)
        if(!ESC_reducido())for(let i=0;i<3;i++){const x=Math.round(((T*0.8+i*90)%(VW+40))-20);c2.fillStyle=C.oro;c2.fillRect(x,Math.round(oy+97),3,2);c2.fillStyle='#fff0b0';c2.fillRect(x+1,Math.round(oy+97),1,1);}
        // baliza de emergencia ámbar (una por tramo de pared); pulsa lento y quieta con MOVIMIENTO REDUCIDO
        ESC_cada(c,ox,126,40,x=>{const X=Math.round(x),Y=Math.round(oy+58),p=ESC_reducido()?0.6:0.5+0.5*Math.sin(T*0.05+x*0.01);
          c2.fillStyle=C.tinta;c2.fillRect(X-4,Y-4,8,6);c2.fillStyle=p>0.5?C.ambar:'#8a5020';c2.fillRect(X-3,Y-3,6,3);
          c2.save();c2.globalCompositeOperation='lighter';c2.imageSmoothingEnabled=true;c2.globalAlpha=0.22*p;c2.drawImage(ESC_glow(C.ambar),X-30,Y-30,60,60);c2.restore();});}},
    // 3 · caños y vigas cercanas, con vapor que sale de una junta
    {id:'canos',par:0.75,ancho:280,y:30,alto:G-30,pie:'auto',niebla:0,nieblaPie:0,dibujar(g,w,h){
      for(const x of[20,160]){P.R(g,x,0,10,h,C.tinta);P.R(g,x+1,0,8,h,'#26262f');P.R(g,x+1,0,2,h,'#3a3a46');for(let y=10;y<h;y+=24)P.R(g,x-2,y,14,4,'#30303a');}
      P.R(g,0,h-44,w,5,C.tinta);P.R(g,0,h-43,w,3,'#2a2a34');P.R(g,0,h-43,w,1,'#40404c');},
      vivo(c2,ox,oy,c){ESC_cada(c,ox,32,20,x=>{for(let k=0;k<4;k++){const a=(T*0.4+k*12)%48,al=0.25*(1-a/48);c2.globalAlpha=al;c2.fillStyle=C.vapor;c2.fillRect(Math.round(x+a*0.6),Math.round(oy+60-a*0.4),3+Math.floor(a/12),2);}c2.globalAlpha=1;});}},
    // 4 · vapor al pie (regla 2): gris azulado claro, encima de la pared y debajo del juego
    {id:'bruma',par:0.7,parY:1,ancho:W,y:90,alto:G-90+2,pie:'auto',niebla:0,nieblaPie:0,dibujar(g,w,h){for(let y=0;y<h;y++){const u=Math.min(1,y/26),sm=u*u*(3-2*u),t=y/(h-1);g.globalAlpha=0.52*sm+0.32*t;/* 0 en y 90: arriba los mamparos quedan oscuros */g.fillStyle=C.bruma;g.fillRect(0,y,w,1);}g.globalAlpha=1;}},
  ],
  // primer plano: tuberías y un marco de compuerta en los costados, cables que cuelgan en las esquinas de arriba
  frente:{par:1.4,parY:1.15,alfa:1,ancho:900,piezas:[
    {x:20,y:0,w:24,h:70,abajo:true,dibujar(g,w,h){P.R(g,0,0,8,h,C.frente);P.R(g,14,10,8,h-10,C.frente);P.R(g,0,20,22,4,C.frente);P.R(g,1,0,1,h,'#16161e');}},
    {x:480,y:0,w:30,h:10,abajo:true,dibujar(g,w,h){P.R(g,0,2,30,8,C.frente);P.R(g,4,0,8,2,C.frente);}},
    {x:250,y:0,w:50,h:30,arriba:true,dibujar(g,w,h){P.R(g,0,0,w,3,C.frente);for(const[x0,l]of[[8,22],[20,14],[34,26],[44,10]]){let x=x0;for(let y=3;y<l;y++){P.R(g,x,y,1,1,C.frente);if(y%5===0)x+=(x0%2?1:-1);}P.R(g,x-1,l,3,2,C.frente);}}},
  ],
    vivo(c2,d,par,ac){const dx=camX*(1-par),bot=Math.floor(camY+VH),x0=camX-dx-20,x1=camX+VW-dx+20;c2.globalAlpha=ac;c2.fillStyle=C.frente;
      for(let k=Math.floor(x0/36);k<=x1/36;k++){if(hsh(k*1.7)<0.4)continue;const X=Math.round(k*36+dx),borde=Math.min(X-camX,camX+VW-X),h=borde>VW*0.15?3:6;c2.fillRect(X,bot-h,22,h);c2.fillRect(X+4,bot-h-1,2,1);}
      c2.globalAlpha=1;}},
  // piso y techo de mision7.js (el ducto es la mecánica de los raspadores); encima, la rejilla en perspectiva con luz de abajo
  piso(c2,x0,x1){
    if(LV.drawGround0)LV.drawGround0();
    const cx=Math.round(camX+VW/2);c2.globalAlpha=0.55;
    for(let x=Math.floor(x0/12)*12-60;x<x1+60;x+=12)P.line(c2,x,G+2,cx+(x-cx)*1.9,H,C.rejilla);
    c2.globalAlpha=0.18;c2.fillStyle=C.luzAbajo;for(let x=Math.floor(x0/24)*24;x<x1;x+=24)if(hsh(x*0.37)<0.5)c2.fillRect(x+4,G+3,14,1);
    c2.globalAlpha=1;
  },
  extras(lv){
    const duro=x=>(lv.covers||[]).some(c=>x>c.x-6&&x<c.x+c.w+6)||lv.decor.some(o=>x>o.x-8&&x<o.x+22)||(lv.tunnels||[]).some(t=>x>t.x-8&&x<t.x+t.w+8)||
      (lv.pyramids||[]).some(p=>x>p.x-8&&x<p.x+p.w+8)||lv.platforms.some(p=>!p.roof&&!p.pyr&&!p.ar&&!p.salaAr&&x>p.x-4&&x<p.x+p.w+4)||(lv.crates||[]).some(c=>x>c.x-4&&x<c.x+18)||(lv.prisoners||[]).some(p=>!p.y&&x>p.x-8&&x<p.x+16);
    const busca=(x0,w,lim)=>{let x=x0;while(x<lim){let ok=true;for(let i=x;i<=x+w;i+=2)if(duro(i)){ok=false;break;}if(ok)return x;x+=2;}return -1;};
    const out=[];for(const x0 of[420,1500,2400]){const x=busca(x0,30,x0+500);if(x>=0)out.push({x,k:'cajonBanda'});}return out;
  },
  luces(){return[];},
  decor(o,d){
    if(o.k!=='cajonBanda')return decorNave(o,d); // bulbos y cables: de mision7.js (decorNave devuelve false)
    const x=Math.round(o.x);ESC_sombraContacto(d,x+14,28,G,0.6);
    ctx.drawImage(ESC_sprite(d,'cajonBanda',30,22,(s)=>{P.R(s,0,4,30,18,C.tinta);P.R(s,1,5,28,17,'#5a4a38');P.R(s,1,5,28,1,'#8a7050');for(let i=4;i<28;i+=6)P.R(s,i,6,1,15,'#3a2e22');
      P.R(s,1,9,28,2,'#2a2a34');P.R(s,1,16,28,2,'#2a2a34');P.R(s,8,9,2,2,'#8a8a98');P.R(s,20,16,2,2,'#8a8a98'); // correas con hebillas
      ESC_H.etiqueta(s,21,0);}),x,G-22);
    return true;
  },
  caja(c,d){return ESC_H.caja(c,d);},
  // ----- plataformas (gancho L.drawPlat) en estilo Hondo; el ducto grande (techo) queda de mision7.js -----
  plat(pl,d){
    if(pl.roof||pl.ar||pl.salaAr)return false;
    const x=Math.round(pl.x),y=Math.round(pl.y),w=Math.round(pl.w),hh=G-y;
    if(pl.pyr){const h=pl.pyr.dy,col=pl.mat,top=pl.tier===pl.pyr.n-1;
      ctx.drawImage(SPR(d,'cont'+w+'x'+h+col+(top?'t':''),w+2,h+1,(g)=>{const c=contCol(col);P.R(g,0,0,w+2,h+1,C.tinta);P.R(g,1,1,w,h-1,c[0]);P.R(g,1,1,w,1,c[1]);
        for(let i=4;i<w-1;i+=4)P.R(g,1+i,3,1,h-5,c[2]);P.R(g,1+(w>>1),2,1,h-3,c[2]);P.R(g,1,h-2,w,1,c[2]);
        const t=typeof pfLienzo==='function'?pfLienzo(String(10+pl.tier*13),'#e8e4d8'):null;if(t){g.globalAlpha=0.75;g.drawImage(t,7,5);g.globalAlpha=1;}
        if(top)for(let i=1;i<w;i+=8)P.R(g,i,1,4,1,C.seg);}),x-1,y);
      if(top){const on=ESC_reducido()?1:(Math.sin(T/14)+1)/2;ctx.fillStyle=C.tinta;ctx.fillRect(x+(w>>1)-2,y-3,4,3);ctx.fillStyle=on>0.5?C.ambar:'#8a5020';ctx.fillRect(x+(w>>1)-1,y-2,2,2);}
      return true;}
    if(pl.hi==='pasarela'){ // colgada del techo: barras, baranda y tablero
      ctx.drawImage(SPR(d,'colg'+w+'x'+(y-M7_DUCT),w+2,y-M7_DUCT+6,(g)=>{const hb=y-M7_DUCT;for(const bx of[3,w-4]){P.R(g,bx,0,3,hb,C.tinta);P.R(g,bx+1,0,1,hb,C.metalHi);}
        P.R(g,0,hb-8,w+2,1,C.metalHi);P.R(g,0,hb-4,w+2,1,C.metalHi);for(let i=0;i<=w;i+=10)P.R(g,i,hb-8,1,8,C.metal);
        g.save();g.translate(0,hb);tablero(g,w);g.restore();}),x-1,M7_DUCT);
      const on=ESC_reducido()||(T>>4)%4!==0;ctx.fillStyle=on?C.ambar:'#8a5020';ctx.fillRect(x+(w>>1)-1,y+5,2,1); // piloto ámbar (no rojo)
      return true;}
    if(pl.hi==='grua'){const cx=x+10;ESC_sombraContacto(d,cx,16,G,0.6);
      ctx.drawImage(SPR(d,'grua'+w+'x'+hh,w+2,hh+1,(g)=>{const o=1;P.R(g,cx-x-6+o,4,12,hh-4,C.tinta);P.R(g,cx-x-5+o,4,10,hh-4,C.metal);P.R(g,cx-x-5+o,4,2,hh-4,C.metalHi);
        for(let i=0;i<18;i+=6)for(let k=0;k<5;k++)P.R(g,cx-x-5+o+k*2,hh-20+i+k,2,2,C.seg); // franjas de seguridad en escalones
        P.R(g,cx-x-8+o,hh-3,16,3,C.tinta);P.R(g,cx-x-7+o,hh-2,14,2,C.metalDk);g.save();g.translate(0,0);tablero(g,w);g.restore();P.R(g,1,5,w,1,C.seg);}),x-1,y);
      const hy=Math.round(y+18+(ESC_reducido()?0:Math.sin(T/40)*1.5));ctx.fillStyle=C.tinta;ctx.fillRect(x+w-5,y+6,1,hy-y-6);ctx.fillStyle=C.metalHi;ctx.fillRect(x+w-7,hy,4,1);ctx.fillRect(x+w-7,hy,1,3);ctx.fillRect(x+w-4,hy,1,2);
      return true;}
    // pasarela baja sobre patas con riostras
    for(const lx of[x+4,x+w-5])ESC_sombraContacto(d,lx,4,G,0.6);
    ctx.drawImage(SPR(d,'pas'+w+'x'+hh,w+2,hh+1,(g)=>{if(hh>6){for(const px of[3,w-5]){P.R(g,px,4,4,hh-4,C.tinta);P.R(g,px+1,4,2,hh-4,C.metal);P.R(g,px+1,4,1,hh-4,C.metalHi);}
        if(hh>14){P.line(g,5,6,w-4,hh-2,C.metalDk);P.line(g,w-4,6,5,hh-2,C.metalDk);}P.R(g,2,hh-2,6,2,C.metalDk);P.R(g,w-6,hh-2,6,2,C.metalDk);}
      tablero(g,w);}),x-1,y);
    return true;
  },
  // ----- coberturas (gancho L.drawCover): consola, tanques y cajón, en estilo Hondo -----
  cobertura(c,d){
    if(c.vida<=0)return false;const x=Math.round(c.x),w=Math.round(c.w),top=Math.round(c.top),h=Math.round(c.h);
    if(c.k==='consola'){ESC_sombraContacto(d,x+w/2,w,G,0.6);
      ctx.drawImage(SPR(d,'consola'+w+'x'+h,w+2,h+1,(g)=>{P.R(g,0,4,w+2,h-3,C.tinta);P.R(g,4,0,w-2,5,C.tinta);for(let i=0;i<4;i++)P.R(g,4-i,i+1,1,1,C.tinta);
        P.R(g,1,5,w,h-5,C.metal);P.R(g,5,1,w-4,4,C.metal);P.R(g,5,1,w-4,1,C.metalHi);P.R(g,1,5,1,h-5,C.metalHi);
        P.R(g,7,3,w-8,5,C.tinta);P.R(g,8,4,w-10,3,C.vidrio);P.R(g,2,h-3,w-2,2,C.metalDk);}),x-1,top);
      const on=ESC_reducido()?1:(T>>3)%6;ctx.fillStyle=C.verde;for(let i=0;i<2;i++)if((on+i)%4)ctx.fillRect(x+8,top+4+i*2,Math.round((w-12)*(0.4+0.5*hash(i+x+(ESC_reducido()?0:on)))),1);
      ctx.fillStyle=C.ambar;ctx.fillRect(x+4,top+10,2,1);ctx.fillStyle=C.seg;ctx.fillRect(x+8,top+10,2,1);ctx.fillStyle='#6a9ad8';ctx.fillRect(x+12,top+10,2,1);}
    else if(c.k==='tanques'){ESC_sombraContacto(d,x+w/2,w,G,0.6);
      ctx.drawImage(SPR(d,'tanques'+w+'x'+h,w+2,h+2,(g)=>{for(const ox of[1,11]){P.R(g,ox,3,11,h-1,C.tinta);P.R(g,ox+1,2,9,1,C.tinta);P.R(g,ox+1,4,9,h-3,C.gas);P.R(g,ox+2,4,2,h-4,C.gasHi);P.R(g,ox+1,3,9,1,C.gasHi);
          P.R(g,ox+4,0,3,3,C.tinta);P.R(g,ox+5,1,1,1,C.metalHi);P.R(g,ox+1,8,9,1,C.seg);}
        P.R(g,0,10,w+2,2,C.tinta);P.R(g,1,10,w,1,'#7a6a48');}),x-1,top-2);}
    else if(c.k==='cajon'){ESC_sombraContacto(d,x+w/2,w,G,0.6);
      ctx.drawImage(SPR(d,'cajon'+w+'x'+h,w+2,h+1,(g)=>{P.R(g,0,0,w+2,h+1,C.tinta);P.R(g,1,1,w,h-1,C.metal);P.R(g,1,1,w,1,C.metalHi);
        for(let i=0;i<w-2;i+=6)for(let k=0;k<4;k++)P.R(g,3+i+k,4+3-k,2,1,C.seg);P.R(g,3,10,w-4,1,C.metalDk);P.R(g,(w>>1)-1,11,4,2,C.metalOsc);}),x-1,top);}
    else return false;
    if(c.vida<c.max*0.5){ctx.fillStyle=C.metalOsc;ctx.fillRect(x+Math.round(w*0.25),top+2,1,Math.round(h*0.5));ctx.fillRect(x+Math.round(w*0.7),top+1,2,2);}
    return true;
  },
};
// decorado de la nave en estilo Hondo (tinta, borde claro arriba, sombra de contacto; nada rojo salvo el cartel de peligro)
function decorNave(o,d){
  const x=Math.round(o.x),g=G;
  switch(o.k){
  case 'casillero':{ESC_sombraContacto(d,x+12,24,g,0.6);
    ctx.drawImage(SPR(d,'casillero',26,31,(s)=>{P.R(s,0,0,26,31,C.tinta);P.R(s,1,1,24,30,C.metalDk);for(let i=0;i<3;i++){P.R(s,2+i*8,2,7,28,C.metal);P.R(s,2+i*8,2,7,1,C.metalHi);for(let k=0;k<3;k++)P.R(s,3+i*8,5+k*2,5,1,C.metalOsc);P.R(s,7+i*8,14,1,2,C.metalHi);}}),x-1,g-31);
    // la puerta que se mueve (quieta con MOVIMIENTO REDUCIDO)
    const a=ESC_reducido()?0.3:0.3+Math.sin(T/50+x)*0.12,ww=Math.max(1,Math.round(7*Math.cos(a)));ctx.fillStyle=C.metalOsc;ctx.fillRect(x+17,g-29,7,28);ctx.fillStyle=C.tinta;ctx.fillRect(x+17,g-29,ww+1,28);ctx.fillStyle=C.metal;ctx.fillRect(x+17,g-29,ww,27);ctx.fillStyle=C.metalHi;ctx.fillRect(x+17,g-29,ww,1);
    return true;}
  case 'tubo':{ctx.drawImage(SPR(d,'tubo'+(g-M7_DUCT),12,g-M7_DUCT,(s)=>{const h=g-M7_DUCT;for(const px of[1,6]){P.R(s,px-1,0,5,h,C.tinta);P.R(s,px,0,3,h,C.metal);P.R(s,px,0,1,h,C.metalHi);}
      P.R(s,0,h-41,12,11,C.tinta);P.R(s,1,h-40,10,9,C.metal);P.R(s,1,h-40,10,1,C.metalHi);P.disc(s,6,h-35,3,'#d8dce6');}),x-2,M7_DUCT);
    const a=ESC_reducido()?-2.2:-2.2+Math.sin(T/40+x)*0.9;ctx.fillStyle=C.tinta;ctx.fillRect(Math.round(x+4+Math.cos(a)*2),Math.round(g-35+Math.sin(a)*2),1,1);ctx.fillRect(x+4,g-35,1,1); // aguja oscura (no roja)
    return true;}
  case 'vapor':{ctx.drawImage(SPR(d,'vapor'+(g-M7_DUCT),14,g-M7_DUCT,(s)=>{const h=g-M7_DUCT;P.R(s,1,0,6,h,C.tinta);P.R(s,2,0,4,h,C.metal);P.R(s,2,0,1,h,C.metalHi);
      P.R(s,1,h-33,11,6,C.tinta);P.R(s,2,h-32,9,4,C.metal);P.R(s,2,h-32,9,1,C.metalHi);P.R(s,10,h-34,3,8,C.tinta);
      P.R(s,0,h-23,10,3,C.tinta);P.R(s,1,h-22,8,1,C.seg);P.R(s,4,h-25,2,6,C.segDk);for(let y=12;y<h;y+=26)P.R(s,1,y,6,2,C.metalHi);}),x,M7_DUCT); // manija amarilla (no roja)
    return true;}
  case 'cartel':{ctx.drawImage(SPR(d,'cartel',20,20,(s)=>{P.R(s,0,0,20,17,C.tinta);P.R(s,1,1,18,15,C.metalDk);for(let i=0;i<12;i++)P.R(s,10-Math.round(i*0.6),3+i,Math.max(1,Math.round(i*1.2)),1,C.seg);
      P.R(s,9,6,2,5,C.tinta);P.R(s,9,13,2,1,C.tinta);for(let i=0;i<3;i++)P.R(s,1+i*6,17,4,2,C.seg);}),x-1,g-57);
    return true;}
  case 'rejaP':{ // rejilla de la pared: su estado (vibra / abierta) lo maneja mision7.js
    const st=typeof M7!=='undefined'&&M7.vents?M7.vents.get(o)||{shk:0,open:0}:{shk:0,open:0},j=st.shk&&!ESC_reducido()?Math.round(Math.sin(T*2.2)):0;
    ctx.drawImage(SPR(d,'rejaMarco',18,16,(s)=>{P.R(s,0,0,18,16,C.tinta);P.R(s,1,1,16,14,C.metal);P.R(s,1,1,16,1,C.metalHi);P.R(s,3,3,12,10,'#2a2e3a');}),x-2,g-16);
    if(st.shk){ctx.fillStyle=`rgba(190,90,230,${0.3+0.3*((T>>2)%2)})`;ctx.fillRect(x+1,g-13,12,10);
      if((T>>3)%2){ctx.fillStyle='#ffb050';ctx.fillRect(x+5,g-9,1,1);ctx.fillRect(x+8,g-9,1,1);}}
    if(st.open){ctx.fillStyle=C.tinta;ctx.fillRect(x+14,g-2,12,2);ctx.fillStyle=C.metal;ctx.fillRect(x+15,g-2,10,1);}
    else{ctx.fillStyle=C.metalHi;for(let i=0;i<4;i++)ctx.fillRect(x+1+j,g-13+i*3,12,1);}
    return true;}
  }
  return false;
}
ESC_registrar(LV,def);
})();
