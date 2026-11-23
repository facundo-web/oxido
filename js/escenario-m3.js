'use strict';
// Óxido · Escenario de la misión 3, Pantano tóxico (estilo "Hondo", noche de luna). Del Ilustrador de escenarios.
// Va DESPUÉS de js/escenario-base.js y de js/mision3.js (envuelve los ganchos de M3_LVL; con ?esc=0 todo queda como antes).
// Guía: notas/arte/guia.md · ficha: notas/arte/fichas/escenarios.md (M3 e "Historia").
// Luna grande y fría, árboles muertos claros lejos, la planta química, cabañas sobre pilotes con ventanas cálidas,
// agua quieta con el reflejo de la luna y bruma al pie. Luz cálida: faroles de gas colgados de postes (izquierda).
// Historia: la barcaza de M2 hundida y partida en el barro (antes del jefe chico), con cajones abiertos y etiquetas $,
// la enredadera con chispitas doradas que va hacia la arena de MADRE YUYO, la etiqueta con 3 dibujitos y la maceta de medio bidón.
(()=>{
const P=ESC_px,G=GROUND,LV=M3_LVL;
const C={
  cielo:[[0,'#0c1a14'],[40,'#12241a'],[80,'#22382a'],[112,'#3a5a40']],
  lejos:'#6a8a6a',lejosDk:'#5e7e60',planta:'#56765e',plantaDk:'#4a6a54',medio:'#3a5440',medioDk:'#2e4636',ven:'#e0b060',
  agua:'#1e3a2c',aguaHi:'#2e4e3c',luna:'#d8e4cc',lunaRef:'#a8c8a8',niebla:'#7a9a7a',bruma:'#8aa890',
  juego:'#365141',tinta:'#17141f',frente:'#050a07',musgo:'#3e6a3e',musgoC:'#5a8a4a',
  gTop:'#6a7a3a',gSurf:'#3a3a22',g1:'#2a2618',g2:'#221f14',g3:'#1a1810',g4:'#14120c',gLine:'#0e0c08',gHi:'#4a4a2a',
  barro:'#4a3818',barroDk:'#2a1e0c',barroMd:'#3a2a12',barroHi:'#9a7c3a',toxico:'#8fc23a',toxicoC:'#c0e870',
  mad:'#5e4a36',madHi:'#a88a58',madDk:'#5b4737',gas:'#e0d070',
};
const CIELOS={
  noche:C.cielo,
  tarde:[[0,'#1a2030'],[50,'#3a3a48'],[90,'#8a6a5a'],[112,'#b08a60']],
  amanecer:[[0,'#162230'],[50,'#34445a'],[90,'#8a8a8a'],[112,'#c0a888']],
  dia:[[0,'#3a5a5a'],[50,'#5a7a70'],[90,'#8aa890'],[112,'#a8c0a0']],
};
const Y0=-40,LUNA={x:72,y:46};
const CLARO=[1036,1212]; // franja de piso despejada para que se lea la enredadera dorada (momento "ALGO CRECE", pedido de Guion)
const enClaro=x=>x>CLARO[0]&&x<CLARO[1];
const hsh=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
// árbol muerto pixel: tronco y 3 o 4 ramas principales de 2 px; las ramitas finas solo en lo lejano (fino), y barba de musgo
function arbol(g,x,base,h,col,musgo,s,fino){
  P.R(g,x-1,base-h,fino?2:3,h,col);P.R(g,x-3,base-3,7,3,col);
  const n=3+(s%2);
  for(let i=0;i<n;i++){const t=0.4+i*0.17,by=Math.round(base-h*t),dir=(i+s)%2?1:-1,len=6+Math.round(hsh(s*7+i)*h*0.26);
    P.line(g,x,by,x+dir*len,by-Math.round(len*0.5),col,fino?1:2);
    if(fino)P.line(g,x+dir*Math.round(len*0.6),by-Math.round(len*0.3),x+dir*Math.round(len*0.75),by-Math.round(len*0.6),col);
    if(musgo){const mx=x+dir*Math.round(len*0.6),my=by-Math.round(len*0.3);P.R(g,mx,my+2,1,3+Math.round(hsh(s+i*3)*5),musgo);}}
}
// cabaña sobre pilotes: casa con techo a dos aguas, ventana cálida y escalera
function cabana(g,x,base,col,dk,c,ven){
  for(const px of[2,10,18])P.R(g,x+px,base-14,2,14,dk);
  P.R(g,x,base-30,22,16,col);for(let i=0;i<6;i++)P.R(g,x-2+i,base-30-i,26-2*i,1,dk);P.R(g,x+8,base-37,6,1,dk);
  P.R(g,x+4,base-26,6,5,'#1a2a20');if(ven){P.R(g,x+5,base-25,4,3,C.ven);c.luces.push({x:x+7,y:base-24,r:12,col:C.ven,fuerza:0.45,tipo:'ventana'});}
  P.R(g,x+14,base-24,5,10,dk);P.line(g,x+22,base-14,x+28,base,dk);
}
const BRUMA_PIE={noche:0.56,lluvia:1.0,amanecer:0.58,tarde:0.58,dia:0.52,otra:0.55}; // fuerza de la meseta de bruma al pie (se ajusta midiendo)
const def={
  // frente del canal del desagüe: velo leve, gotas verdes y la losa (gancho L.drawTunnelFront)
  tunelFrente(t,d){if(t.k!=='canal')return false;const x=Math.round(t.x),w=Math.round(t.w),iy=Math.round(t.y)+9;
    ctx.fillStyle='rgba(8,20,10,0.16)';ctx.fillRect(x,iy,w,G-iy);ctx.fillStyle='rgba(8,20,10,0.28)';ctx.fillRect(x,iy,w,3);
    if(!ESC_reducido())for(let i=0;i<5;i++){const dx=x+14+i*24+Math.floor(hash(i+7)*8),ph=(T+i*41)%70,yy=iy+Math.floor(ph*0.45);
      ctx.fillStyle='#a8e04a';if(yy<G-1)ctx.fillRect(dx,yy,1,2);else ctx.fillRect(dx-1,G-1,3,1);}
    losaCanal(x,Math.round(t.y),w,d);return true;},
  halosAltos:{col:C.bruma,a:0.92,r:20,plano:true,alto:40}, // de noche, luz suave detrás de las plataformas altas (regla de Arte)
  pix:1,nat:'noche',semilla:33,paso:'pixel',
  atm:{col:C.niebla,fuerza:0.03,pie:0},
  luzPersonajes:{calida:'#e0d070',lado:-1,fria:'#8ab0a0'},
  sombra:'#040805',
  oscPersonajes:0.3,
  ambientes:{
    base:{oscuridad:0.14,oscCol:'#030806'},
    amanecer:{tinte:'#c0a0a0',tinteA:0.1,modo:'overlay',luces:0.5,oscuridad:0.05},
    dia:{tinte:'#9ab8a0',tinteA:0.22,modo:'screen',luces:0.25,oscuridad:0},
    tarde:{tinte:'#c09060',tinteA:0.1,modo:'overlay',luces:0.7,oscuridad:0.06},
    limpio:{reemplazar:true,tintes:[['screen','#3a6a4a',0.25]],oscuridad:0,luces:0.5},
  },
  capas:[
    // 1 · cielo: escalones, estrellas, luna grande con halo frío, nubes finas
    {id:'cielo',cielo:true,segunAmb:true,ancho:W,y:Y0,alto:G-Y0+4,luces:[{x:LUNA.x,y:LUNA.y-Y0,r:38,col:'#b8d0c8',fuerza:0.2,tipo:'ventana'}],
      dibujar(g,w,h,R,c,a){
        const hz=a&&CIELOS[a.hora]?a.hora:'noche',st=CIELOS[hz].map(([y,col])=>[y-Y0,col]);st.unshift([0,st[0][1]]);P.escalones(g,w,h,st,4);
        if(hz==='noche')for(let i=0;i<50;i++){g.fillStyle=hsh(i*9)<0.3?'#c8e0d0':'#5a7a6a';g.fillRect(Math.floor(hsh(i*3.1)*w),Math.floor(hsh(i*7.3)*70)-Y0,1,1);}
        if(hz!=='dia'){P.disc(g,LUNA.x,LUNA.y-Y0,12,C.luna);P.R(g,LUNA.x-5,LUNA.y-Y0-4,3,2,'#bccab0');P.R(g,LUNA.x+3,LUNA.y-Y0+2,4,3,'#bccab0');P.R(g,LUNA.x-2,LUNA.y-Y0+6,2,2,'#bccab0');}
        g.globalAlpha=0.3;for(let i=0;i<5;i++){const y=24+i*13+Math.floor(hsh(i)*6)-Y0,x=Math.floor(hsh(i*4)*260)-20;P.R(g,x,y,50+Math.floor(hsh(i*2)*50),1,hz==='dia'?'#d0e0d0':'#5a7a6a');}
        g.globalAlpha=1;}},
    // 2 · lejos: hilera de árboles muertos claros
    {id:'lejos',par:0.07,ancho:640,y:70,alto:G-70,pie:'auto',nieblaPie:0,dibujar(g,w,h,R){
      P.cresta(g,w,58,6,12,C.lejosDk,2);
      for(let x=6;x<w;x+=14+Math.floor(R()*20))arbol(g,x,60,18+Math.floor(R()*26),C.lejos,null,Math.floor(R()*9),true);
      P.banda(g,w,30,62,C.niebla,0,0.35);}},
    // 3 · lejos 2: la planta química (tanques, chimeneas con humo quieto, una baliza verde)
    {id:'lejos 2',par:0.18,ancho:760,y:50,alto:G-50,pie:'auto',nieblaPie:0,luces:[{x:150,y:24,r:5,col:'#a8e070',fuerza:0.5,tipo:'neon'},{x:520,y:30,r:5,col:'#a8e070',fuerza:0.5,tipo:'neon'}],
      dibujar(g,w,h,R){
        P.R(g,0,78,w,h-78,C.plantaDk);
        for(const[x,k]of[[60,0],[140,1],[230,0],[420,0],[510,1],[600,0]]){
          if(k){P.R(g,x,26,10,54,C.planta);P.R(g,x-1,26,12,2,C.planta);for(let y=32;y<78;y+=7)P.R(g,x,y,10,1,C.plantaDk);
            g.globalAlpha=0.35;for(let i=0;i<5;i++)P.disc(g,x+5+i*2,22-i*5,2+Math.floor(i/2),'#4e6a58');g.globalAlpha=1;} // humo tenue (35 %): si pasa por delante de la luna, no la raja
          else{P.R(g,x,50,28,28,C.planta);for(let i=0;i<3;i++)P.R(g,x+i,50-3+i,28-2*i,1,C.planta);P.R(g,x,58,28,1,C.plantaDk);P.R(g,x,68,28,1,C.plantaDk);
            P.R(g,x+28,60,30,3,C.planta);}}
        P.banda(g,w,40,80,C.niebla,0,0.3);}},
    // 4 · medio: cabañas sobre pilotes con ventanas cálidas y árboles muertos con musgo (las luces atraviesan la bruma)
    {id:'medio',par:0.4,ancho:900,y:60,alto:G-60,pie:'auto',nieblaPie:0,lucesEncima:true,dibujar(g,w,h,R,c){
      c.luces=[];const base=76;
      P.R(g,0,base,w,h-base,C.medioDk);
      let x=20;while(x<w-40){if(R()<0.45){cabana(g,x,base,C.medio,C.medioDk,c,R()<0.7);x+=40+Math.floor(R()*40);}
        else{arbol(g,x,base,30+Math.floor(R()*30),C.medioDk,'#4a6a50',Math.floor(R()*9));x+=24+Math.floor(R()*30);}}
      P.banda(g,w,base-24,base+4,C.niebla,0,0.18);}},
    // 5 · agua del pantano: quieta, con lentejas y el reflejo de la luna en franjas (el reflejo sigue a la luna)
    {id:'agua',par:0.6,parY:0.7,ancho:640,y:136,alto:G-136+4,pie:'auto',niebla:0,nieblaPie:0,dibujar(g,w,h){
      P.R(g,0,0,w,h,C.agua);for(let y=2;y<h;y+=3)for(let i=0;i<w;i+=11){if(hsh(i*3.1+y)<0.4)P.R(g,i,y,2+Math.floor(hsh(i+y)*6),1,C.aguaHi);}
      for(let i=0;i<w;i+=23)if(hsh(i*7)<0.5){P.R(g,i,4+Math.floor(hsh(i)*10),4,1,'#3e5a32');P.R(g,i+1,3+Math.floor(hsh(i)*10),2,1,'#4e6a3a');}},
      vivo(c2,ox,oy,c,a){if(a&&a.hora==='dia')return;c2.fillStyle=C.lunaRef;
        for(let i=0;i<6;i++){const ww=10-i,yy=Math.round(oy+3+i*3),xx=LUNA.x-(ww>>1)+((T>>5)+i)%2;c2.fillRect(xx,yy,ww,1);}}},
    // 6 · bruma al pie (regla 2): la ilumina la luna
    {id:'bruma',par:0.7,parY:1,ancho:W,y:88,alto:G-88+2,pie:'auto',niebla:0,nieblaPie:0,segunAmb:true,dibujar(g,w,h,R,c,a){/* bruma al pie en MESETA (guía §9): 0 en y 88, llena en y 110 y pareja hasta el piso; 0,13–0,16 en la franja de los personajes */const A=a&&a.hora==='noche'?BRUMA_PIE.noche*(a.clima==='lluvia'||a.clima==='tormenta'?BRUMA_PIE.lluvia:1):(a&&BRUMA_PIE[a.hora]!=null?BRUMA_PIE[a.hora]:BRUMA_PIE.otra);g.fillStyle=C.bruma;for(let y=0;y<h;y++){const u=Math.min(1,y/22),sm=u*u*(3-2*u);g.globalAlpha=A*sm;g.fillRect(0,y,w,1);}g.globalAlpha=1;}},
  ],
  // primer plano: raíces abajo, ramas con musgo que cuelgan en las esquinas de arriba; juncos abajo (vivo)
  frente:{par:1.4,parY:1.15,alfa:1,ancho:900,piezas:[
    {x:30,y:0,w:40,h:16,abajo:true,dibujar(g,w,h){for(let i=0;i<5;i++)P.line(g,i*8,h,20+i*3,h-10+i,C.frente,2);P.R(g,0,h-3,w,3,C.frente);}},
    {x:420,y:0,w:30,h:12,abajo:true,dibujar(g,w,h){P.oval(g,15,h-4,14,4,C.frente);P.R(g,4,h-9,4,6,C.frente);P.R(g,20,h-11,3,8,C.frente);}},
    {x:200,y:0,w:70,h:34,arriba:true,dibujar(g,w,h){P.R(g,0,0,w,4,C.frente);P.line(g,0,3,w,8,C.frente,2);for(let i=6;i<w;i+=7){const l=8+Math.floor(hsh(i)*20);P.R(g,i,6,1,l,C.frente);if(i%3===0)P.R(g,i-1,6+l-3,3,2,C.frente);}}},
    {x:640,y:0,w:56,h:28,arriba:true,dibujar(g,w,h){P.R(g,0,0,w,3,C.frente);for(let i=4;i<w;i+=6){const l=6+Math.floor(hsh(i*3)*18);P.R(g,i,3,1,l,C.frente);}}},
  ],
    // juncos: matas con huecos, espigas arriba, más altos cerca de los costados de la pantalla
    vivo(c2,d,par,ac){
      const dx=camX*(1-par),bot=Math.floor(camY+VH),x0=camX-dx-12,x1=camX+VW-dx+12;c2.globalAlpha=ac;c2.fillStyle=C.frente;
      for(let k=Math.floor(x0/14);k<=x1/14;k++){if(hsh(k*3.3+1)<0.38)continue;
        const X=Math.round(k*14+Math.floor(hsh(k*5.1)*4)+dx);if(enClaro(X+4))continue; // sin juncos sobre la enredadera
        const borde=Math.min(X-camX,camX+VW-X),e=1+1.8*Math.max(0,1-borde/(VW*0.15));
        const centro=borde>VW*0.15;
        for(let b=0;b<7;b+=2){let h=Math.round((3+hsh(k*13+b)*4)*e);if(centro)h=Math.min(h,4);c2.fillRect(X+b,bot-h,1,h);if(!centro&&h>8)c2.fillRect(X+b-1+((T>>6)+b)%2,bot-h-3,2,4);}
        c2.fillRect(X-1,bot-1,9,1);}
      c2.globalAlpha=1;}},
  // piso: barro con borde de musgo, tablas sueltas, charquitos que reflejan la luna; los pozos de barro del juego en Hondo;
  // la enredadera dorada que va de la barcaza hundida a la arena de MADRE YUYO
  piso(c2,x0,x1,d){
    const bot=Math.max(H,Math.ceil(camY+VH)+2),w=x1-x0;
    P.R(c2,x0,G,w,1,C.gTop);P.R(c2,x0,G+1,w,3,C.gSurf);P.R(c2,x0,G+4,w,4,C.g1);P.R(c2,x0,G+8,w,6,C.g2);P.R(c2,x0,G+14,w,6,C.g3);P.R(c2,x0,G+20,w,bot-G-20,C.g4);
    for(let x=x0;x<x1;x++){const h=hsh(x*3.7);if(h<0.3){c2.fillStyle=h<0.08?C.gHi:C.gLine;c2.fillRect(x,G+5+Math.floor(hsh(x*9.1)*20),h<0.04?2:1,1);}if(h>0.86&&!enClaro(x)){c2.fillStyle=C.musgo;c2.fillRect(x,G-1-Math.floor(hsh(x*5)*2),1,2);}}
    const cx=Math.round(camX+VW/2);
    for(let x=Math.floor(x0/40)*40-40;x<x1+40;x+=40){if(hsh(x*0.37)<0.5)continue; // tablas sueltas que se alejan
      const xa=x,xb=cx+(x-cx)*1.5;P.line(c2,xa,G+5,xb,G+12,C.madDk,2);P.line(c2,xa,G+4,xb,G+11,C.mad);}
    for(let x=Math.floor(x0/90)*90;x<x1+90;x+=90){if(hsh(x*1.3)<0.55)continue;const px=x+Math.floor(hsh(x)*40); // charquitos con la luna
      P.oval(c2,px,G+10,8,1,'#1e3a2c');P.R(c2,px-3,G+10,5,1,C.lunaRef);}
    // pozos de barro (los del juego y los que abren las criaturas)
    for(const p of LV.pools)if(p.x<x1+4&&p.x+p.w>x0-4)pozo(c2,Math.round(p.x),Math.round(p.w),true);
    if(typeof M3!=='undefined')for(const o of M3.own)if(o.x<x1&&o.x+o.w>x0)pozo(c2,Math.round(o.x-6),Math.round(o.w+24),false);
    enredadera(c2,x0,x1,d);
  },
  extras(lv){
    const ocupado=x=>(lv.covers||[]).some(c=>x>c.x-12&&x<c.x+c.w+8)||(lv.crates||[]).some(c=>x>c.x-12&&x<c.x+20)||lv.decor.some(o=>x>o.x-14&&x<o.x+(o.k==='tree'?30:o.k==='boat'?40:16))||
      (lv.pools||[]).some(p=>x>p.x-10&&x<p.x+p.w+6)||(lv.tunnels||[]).some(t=>x>t.x-10&&x<t.x+t.w+10)||(lv.pyramids||[]).some(p=>x>p.x-10&&x<p.x+p.w+10)||
      lv.platforms.some(p=>!p.roof&&!p.pyr&&[p.x+4,p.x+p.w-6].some(px=>x>px-10&&x<px+8))||(lv.prisoners||[]).some(p=>!p.y&&x>p.x-10&&x<p.x+18);
    const out=[];
    // la barcaza hundida, antes del jefe chico (x ≈ 1000), con la etiqueta de 3 dibujitos y la maceta de medio bidón
    let bx=960;while(bx<1080&&[0,20,40,60].some(i=>ocupado(bx+i)))bx+=4;out.push({x:bx,k:'barcazaHundida'});
    let mx=bx+80;while(mx<1300&&ocupado(mx))mx+=4;out.push({x:mx,k:'maceta'});
    // faroles de gas colgados de postes, cada ~320 px
    for(let x=150;x<lv.end-150;x+=320){let k=0;while(k<10&&(ocupado(x+k*12)||out.some(o=>Math.abs(o.x-(x+k*12))<70)))k++;if(k<10)out.push({x:x+k*12,k:'gas'});}
    return out;
  },
  luces(lv,d){return ESC_extras(d).filter(o=>o.k==='gas').map(o=>({x:o.x+9,y:G-36,r:46,col:C.gas,fuerza:0.6,tipo:'farol'}))
    .concat(lv.decor.filter(o=>o.k==='tdrum').map(o=>({x:o.x+8,y:G-2,r:16,col:'#a8e070',fuerza:0.3,tipo:'fuego'})));},
  decor(o,d){
    const g=G,x=Math.round(o.x),spr=(k,w,h,fn,dx,dy)=>ctx.drawImage(ESC_sprite(d,k,w,h,fn),x+dx,g+dy);
    switch(o.k){
    case 'gas':ESC_sombraContacto(d,x+1,4,g,0.6);
      spr('gas',16,46,(s)=>{P.R(s,0,0,4,46,C.tinta);P.R(s,1,1,2,45,C.mad);P.R(s,1,1,1,45,C.madHi);P.R(s,1,4,14,3,C.tinta);P.R(s,2,5,12,1,C.mad);
        P.R(s,10,7,1,3,C.tinta);P.R(s,7,10,7,8,C.tinta);P.R(s,8,11,5,6,C.gas);P.R(s,8,11,5,1,'#fff0b0');P.R(s,9,18,3,1,C.tinta);},-1,-46);return true;
    case 'tree':ESC_sombraContacto(d,x+8,12,g,0.55);
      spr('arbol'+(x%3),60,80,(s)=>arbol(s,30,80,70,C.juego,C.musgo,x%3),-22,-80);return true;
    case 'reeds':{if(enClaro(x+9))return true; // la mata no tapa la enredadera
      const f=ESC_reducido()?0:((T>>5)+(x>>3))%2;
      spr('juncos'+f,18,24,(s)=>{for(let i=0;i<6;i++){const bx=2+i*3,hh=12+Math.floor(hsh(i*5)*10),lean=f&&i%2?1:0;P.R(s,bx,24-hh,1,hh,'#4a6a38');P.R(s,bx+lean,24-hh-4,2,5,'#6a4a2a');P.R(s,bx+lean,24-hh-4,1,1,'#8a6a3a');}},-2,-24);return true;}
    case 'warn':{ESC_sombraContacto(d,x+5,4,g,0.5);
      // en la arena de MADRE YUYO el aviso va en amarillo apagado: el diente dorado tiene que ser lo único dorado
      const jefe=(LV.arenas||[]).find(a=>a.boss),apagado=jefe&&o.x>=jefe.at-40,am=apagado?'#8a7a3a':'#c9a43a';
      spr('aviso'+(apagado?'A':''),16,26,(s)=>{P.R(s,6,10,3,16,C.tinta);P.R(s,7,10,1,16,'#4c4c3c');for(let i=0;i<7;i++){P.R(s,7-i,1+i,2*i+2,1,C.tinta);}for(let i=0;i<7;i++){P.R(s,7-i,8+i,2*i+2,1,C.tinta);}
        for(let i=1;i<7;i++){P.R(s,8-i,1+i,2*i,1,am);P.R(s,8-i,14-i,2*i,1,am);}P.R(s,7,5,2,4,C.tinta);P.R(s,7,10,2,2,C.tinta);},-3,-26);return true;}
    case 'tdrum':ESC_sombraContacto(d,x+8,16,g,0.55);
      spr('tamborToxico',22,10,(s)=>{P.R(s,0,0,14,10,C.tinta);P.R(s,1,1,12,8,'#4a5a3a');P.R(s,1,1,12,1,'#6a7a4a');P.R(s,4,1,1,8,'#405033');P.R(s,9,1,1,8,'#405033');P.oval(s,13,5,2,3,C.tinta);P.oval(s,13,5,1,2,C.toxico);
        P.R(s,14,8,8,2,C.toxico);P.R(s,15,8,5,1,C.toxicoC);},-1,-10);return true;
    case 'stump':ESC_sombraContacto(d,x+6,12,g,0.6);
      spr('tocon',14,10,(s)=>{P.R(s,1,0,12,10,C.tinta);P.R(s,2,1,10,9,C.mad);P.R(s,2,1,10,1,C.madHi);P.R(s,4,3,1,6,C.madDk);P.R(s,8,2,1,7,C.madDk);P.R(s,0,8,14,2,C.tinta);},-1,-10);return true;
    case 'boat':ESC_sombraContacto(d,x+18,34,g,0.5);
      spr('bote',40,12,(s)=>{for(let i=0;i<5;i++)P.R(s,2+i*2,2+i,34-i*4,1,C.tinta);P.R(s,3,3,32,2,'#5a4a34');P.R(s,3,3,32,1,'#8a7050');P.R(s,8,5,22,2,'#594836');P.R(s,0,9,40,3,'#2c5240');P.R(s,4,9,10,1,'#3a6450');},-2,-11);return true;
    case 'outfall':{ESC_sombraContacto(d,x+8,14,g,0.5);
      spr('cano',28,40,(s)=>{P.R(s,0,10,20,9,C.tinta);P.R(s,0,11,18,7,'#6a4a34');P.R(s,0,11,18,1,'#a0704a');P.R(s,16,9,6,11,C.tinta);P.R(s,17,10,4,9,'#664231');for(let i=2;i<16;i+=5)P.R(s,i,12,1,5,'#65432f');},-2,-36);
      const f=ESC_reducido()?0:(T>>2)%4;ctx.fillStyle=C.toxico;for(let y=0;y<28;y+=4){ctx.fillRect(x+20+Math.floor(y/9),g-26+y+((y/4+f)%2),2,3);}ctx.fillStyle=C.toxicoC;ctx.fillRect(x+21,g-26+f,1,2);
      ctx.fillRect(x+16,g-1,12,1);return true;}
    case 'barcazaHundida':ESC_sombraContacto(d,x+34,70,g,0.5);
      spr('barcazaHundida',80,30,(s)=>{const ink=C.tinta;
        // dos mitades del casco, inclinadas en escalones, medio enterradas
        for(let i=0;i<6;i++){P.R(s,2+i*3,14+i*2,30,2,ink);P.R(s,3+i*3,15+i*2,28,1,'#3b4a6d');}
        for(let i=0;i<6;i++){P.R(s,40+i,18-i*2,34,2,ink);P.R(s,41+i,19-i*2,32,1,'#3b4a6d');}
        P.R(s,40,20,36,10,'#544a35');
        // cajones abiertos con luz dorada adentro
        P.R(s,22,8,12,9,ink);P.R(s,23,9,10,7,'#664231');P.R(s,24,10,8,2,'#ffd070');P.R(s,50,4,11,9,ink);P.R(s,51,5,9,7,'#664231');P.R(s,52,6,7,1,'#c8a050');
        ESC_H.etiqueta(s,36,10);ESC_H.etiqueta(s,64,14);
        // la etiqueta con 3 dibujitos: pirámide, luna tachada, pantalla
        P.R(s,4,20,15,8,ink);P.R(s,5,21,13,6,'#e8d8b0');P.R(s,6,24,1,1,ink);P.R(s,7,23,1,2,ink);P.R(s,8,24,1,1,ink);
        P.R(s,10,22,2,3,ink);P.R(s,9,25,4,1,'#a03a2a');P.R(s,14,22,3,3,ink);P.R(s,15,23,1,1,'#7ad0ff');P.R(s,11,18,1,2,ink);},-6,-28);
      return true;
    case 'maceta':return true; // la maceta ES MADRE YUYO después de perder: durante la misión no se ve; va en la caminata (historia.js, Guion)
      ESC_sombraContacto(d,x+6,12,g,0.55);
      spr('maceta',16,18,(s)=>{P.R(s,1,9,12,9,C.tinta);P.R(s,2,10,10,7,'#4a5a3a');P.R(s,2,10,10,1,'#6a7a4a');P.R(s,2,13,10,1,'#405033');
        P.R(s,6,2,1,8,'#3e6a3e');P.R(s,3,4,3,2,C.musgoC);P.R(s,7,1,4,2,C.musgoC);P.R(s,4,6,3,1,'#3e6a3e');P.R(s,10,4,1,1,'#ffd070');},-1,-18);return true;
    }
    return false;
  },
  plat(pl,d){
    if(pl.roof&&pl.roof.k==='canal'){canalFondo(pl,d);return true;}
    if(pl.ar||pl.salaAr||pl.roof)return false; // arpón: queda con su dibujo
    const x=Math.round(pl.x),y=Math.round(pl.y),w=Math.round(pl.w),hh=G-y,put=(k,sw,sh,fn,ox,oy)=>ctx.drawImage(ESC_sprite(d,k,sw,sh,fn),x+ox,y+oy);
    if(pl.pyr){const h=pl.pyr.dy,m=pl.mat;put('pyr'+m+w+'x'+h,w+2,h+1,(g)=>escalon(g,w,h,m),-1,-1);return true;}
    if(pl.step){ESC_sombraContacto(d,x+w/2,w,G,0.6);put('tocon'+w+'x'+hh,w+2,hh+1,(g)=>{const o=1;P.R(g,0,0,w+2,hh+1,C.tinta);P.R(g,o,o,w,hh,C.mad);P.R(g,o,o,w,2,'#6a5038');
      P.R(g,o+3,o,w-6,1,C.madHi);for(let i=4;i<w;i+=5)P.R(g,o+i,o+3,1,hh-4,C.madDk);P.R(g,o+(w>>1)-2,o,4,1,C.madDk);},-1,-1);return true;}
    if(pl.hi==='lookout'){for(const lx of[x+3,x+w-4])ESC_sombraContacto(d,lx,4,G,0.55);
      put('mirador'+w+'x'+hh,w+6,hh+14,(g)=>{const o=3,t=12;for(const px of[0,w-3]){P.R(g,o+px-1,t+3,4,hh-3,C.tinta);P.R(g,o+px,t+3,2,hh-3,C.mad);}
        for(let y=t+10;y<t+hh-6;y+=14){P.line(g,o+1,y,o+w-2,y+12,C.madDk);P.line(g,o+w-2,y,o+1,y+12,C.madDk);}
        P.R(g,0,t-1,w+6,6,C.tinta);P.R(g,1,t,w+4,4,C.mad);P.R(g,1,t,w+4,1,C.madHi);
        for(const px of[1,w+3])P.R(g,px,0,2,t,C.tinta);for(let i=0;i<4;i++)P.R(g,i,i,w+6-2*i,1,C.tinta);P.R(g,4,1,w-2,2,'#3f502e');},-3,-12);return true;}
    if(pl.hi==='branch'){put('rama'+w,w+16,14,(g)=>{P.R(g,0,1,w+2,6,C.tinta);P.R(g,1,2,w,4,C.mad);P.R(g,1,2,w,1,C.madHi);P.R(g,w,0,16,14,C.tinta);P.R(g,w+1,1,14,13,C.madDk);
      for(let i=3;i<w;i+=7)P.R(g,i,6,1,3+Math.floor(hsh(i)*5),C.musgo);},-1,-2);return true;}
    // pasarela de tablones sobre pilotes, con musgo
    for(const lx of[x+4,x+w-4])ESC_sombraContacto(d,lx,3,G,0.6);
    put('pasarela'+w+'x'+hh,w+2,hh+2,(g)=>{const o=1;if(hh>6)for(const px of[3,w-6]){P.R(g,o+px-1,o+3,5,hh-3,C.tinta);P.R(g,o+px,o+3,3,hh-3,C.madDk);P.R(g,o+px,o+3,1,hh-3,C.mad);}
      P.R(g,0,0,w+2,6,C.tinta);P.R(g,o,o,w,4,C.mad);P.R(g,o,o,w,1,C.madHi);P.R(g,o,o+3,w,1,C.madDk);for(let i=6;i<w;i+=8)P.R(g,o+i,o+1,1,2,C.madDk);
      for(let i=2;i<w-1;i+=3)if(hsh(i+w)>0.55)P.R(g,o+i,o+4,1,1+Math.floor(hsh(i*3+w)*4),C.musgo);},-1,-1);
    return true;
  },
  cobertura(c,d){
    const x=Math.round(c.x),w=Math.round(c.w),h=Math.round(c.h),top=G-h;
    if(c.vida<=0){ESC_sombraContacto(d,x+w/2,w,G,0.5);ctx.drawImage(ESC_sprite(d,'escombro'+c.k+w,w+6,8,(g)=>{for(let i=0;i<w+2;i+=3){const hh=1+Math.floor(hsh(i*3.1+w)*4);P.R(g,i,7-hh-1,4,hh+1,C.tinta);P.R(g,i+1,7-hh,2,hh,c.k==='sacks'?'#7a6a4a':c.k==='drums'?'#4a5a3a':C.mad);}}),x-3,G-8);return true;}
    if(!['logs','drums','sacks'].includes(c.k))return false;
    ESC_sombraContacto(d,x+w/2,w,G,0.6);
    ctx.drawImage(ESC_sprite(d,'cob'+c.k+w+'x'+h,w+2,h+1,(g)=>cobertura(g,c.k,w,h)),x-1,top-1);
    if(c.vida<c.max*0.5){ctx.fillStyle=C.tinta;ctx.fillRect(x+Math.round(w*0.25),top+1,1,Math.round(h*0.5));ctx.fillRect(x+Math.round(w*0.7),top,2,2);}
    return true;
  },
  caja(c,d){return ESC_H.caja(c,d);},
};
// pozo de barro pixel: hoyo en escalones, borde brillante, espuma tóxica y burbujas que revientan
function pozo(c2,x,w,grande){
  const prof=grande?12:6;
  for(let i=0;i<prof;i+=2){const ins=Math.round(i*w/(prof*4)),col=i<2?C.barro:i<6?C.barroMd:C.barroDk;P.R(c2,x-2+ins,G+i,w+4-2*ins,2,col);}
  P.R(c2,x,G,w,1,'#6e5528');for(let i=4;i<w-4;i+=9){const h=hsh(i+x);P.R(c2,x+i+(((T>>4)+i)%3)-1,G+2+Math.floor(h*2),3+Math.floor(h*3),1,C.barroHi);}
  for(let i=0;i<w;i+=11){const h=hsh(i*3+x);if(h<0.5)P.R(c2,x+i+Math.floor(h*6),G,2+Math.floor(h*3),1,C.toxico);}
  P.R(c2,x-2,G-1,3,1,C.toxicoC);P.R(c2,x+w-1,G-1,3,1,C.toxicoC);
  for(let i=0;i<Math.max(1,w/16);i++){const h=hsh(x*7+i),ph=(T+h*300)%150,bx=Math.round(x+5+h*(w-10));
    if(ph<22){const r=ph<8?1:ph<16?2:3;P.R(c2,bx-r,G-1,2*r+1,1,'#9a7c3a');P.R(c2,bx-r+1,G-2,2*r-1,1,'#9a7c3a');}
    else if(ph<28){P.R(c2,bx-2,G-2-Math.floor((ph-22)/2),1,1,'#aa8c4a');P.R(c2,bx+2,G-2-Math.floor((ph-22)/3),1,1,'#aa8c4a');}}
}
// enredadera con chispitas doradas: sale de la barcaza hundida y va por el piso hasta la arena de la villana
function enredadera(c2,x0,x1,d){
  const b=ESC_extras(d).find(o=>o.k==='barcazaHundida');if(!b)return;const xa=b.x+70,xb=3110;
  const s=Math.max(xa,x0),e=Math.min(xb,x1);if(e<=s)return;
  for(let x=s;x<e;x++){if(LV.pools.some(p=>x>p.x-2&&x<p.x+p.w+2))continue;const y=G-1+Math.round(Math.sin(x/11)*0.6);
    if(hsh(Math.floor(x/30))<0.2)continue;c2.fillStyle='#2e5a2a';c2.fillRect(x,y,1,1);
    if(x%9===0){c2.fillStyle='#4e8a3a';c2.fillRect(x,y-1,2,1);}
    if(x%23===0&&!ESC_reducido()&&((T>>3)+x)%7<3){c2.fillStyle='#ffd070';c2.fillRect(x,y-2,1,1);}}
}
function escalon(g,w,h,m){const o=1,R2=(a,b,c,e,col)=>P.R(g,a+o,b+o,c,e,col);R2(-1,-1,w+2,h+1,C.tinta);
  if(m==='log'){R2(0,0,w,h,C.madDk);for(let y=0;y<h-3;y+=6)for(let i=2;i<w-4;i+=7){P.disc(g,o+i+3,o+y+3,3,C.tinta);P.disc(g,o+i+3,o+y+3,2,'#8a6a48');P.R(g,o+i+3,o+y+3,1,1,C.madDk);}}
  else if(m==='drum'){R2(0,0,w,h,C.madDk);for(let i=1;i<w-7;i+=9){R2(i,1,8,h-1,C.tinta);R2(i+1,1,6,h-1,'#4a5a3a');R2(i+1,1,2,h-1,'#6a7a4a');R2(i+1,Math.round(h*0.4),6,1,'#405033');R2(i+3,Math.round(h*0.6),2,2,C.toxico);}}
  else if(m==='sack'){R2(0,0,w,h,'#574933');for(let r=0;r<h-3;r+=5)for(let i=(r%10?3:0);i<w-6;i+=7){R2(i,r,7,5,C.tinta);R2(i+1,r+1,5,3,'#8a7a5a');R2(i+1,r+1,5,1,'#b4a07a');}}
  else{R2(0,0,w,h,C.mad);for(let r=4;r<h;r+=4)R2(0,r,w,1,C.madDk);R2(0,0,w,1,C.madHi);}
  R2(w-3,0,3,h,'rgba(5,10,7,0.3)');}
function cobertura(g,k,w,h){const o=1,R2=(a,b,c,e,col)=>P.R(g,a+o,b+o,c,e,col);
  if(k==='logs'){R2(-1,-1,w+2,h+1,C.tinta);R2(0,0,w,h,C.madDk);for(let y=h-5;y>=0;y-=5)for(let i=(y%10?3:0);i<w-4;i+=6){P.disc(g,o+i+2,o+y+2,2,C.tinta);P.disc(g,o+i+2,o+y+2,1,'#8a6a48');}}
  else if(k==='drums'){for(let i=0;i<w-6;i+=8){R2(i-1,-1,9,h+1,C.tinta);R2(i,0,7,h,'#4a5a3a');R2(i,0,2,h,'#6a7a4a');R2(i,Math.round(h*0.45),7,1,'#405033');R2(i+2,Math.round(h*0.65),2,2,C.toxico);}}
  else{const filas=Math.max(1,Math.round(h/5));for(let r=0;r<filas;r++){const y=h-5-r*5,n=Math.max(1,Math.floor((w-r*3)/7)),ox=Math.floor((w-n*7)/2);
    for(let i=0;i<n;i++){R2(ox+i*7-1,y-1,8,6,C.tinta);R2(ox+i*7,y,6,4,'#8a7a5a');R2(ox+i*7,y,6,1,'#b4a07a');}}}}

// canal del desagüe por dentro: pared de piedra húmeda, pilares con tinta y borde claro, charco verde que brilla abajo
function canalFondo(pl,d){const x=Math.round(pl.x),y=Math.round(pl.y),w=Math.round(pl.w),iy=y+9,ih=G-iy;
  ctx.drawImage(ESC_sprite(d,'canal'+w+'x'+ih,w,ih,(g)=>{P.R(g,3,0,w-6,ih,'#34463a');for(let r=3;r<ih-6;r+=6)for(let c=(r%12?4:8);c<w-8;c+=10)P.R(g,c,r,8,1,'#3e5040');
    for(let i=10;i<w-10;i+=12)P.R(g,i,0,1,6+Math.floor(hsh(i)*8),'#4a6a38'); // raíces que cuelgan
    for(const px of[2,(w>>1)-4,w-12]){P.R(g,px,0,10,ih,C.tinta);P.R(g,px+1,0,8,ih,'#5e6c5a');P.R(g,px+1,0,2,ih,'#8a9a84');P.R(g,px+1,ih-5,8,5,'#4e6a32');}
    P.R(g,3,ih-4,w-6,4,'#3e5a2a');P.R(g,20,ih-1,30,1,'#a8e04a');P.R(g,w-46,ih-1,22,1,'#a8e04a');}),x,iy);
  ctx.fillStyle=C.tinta;ctx.fillRect(x,y-7,w,7);ctx.fillStyle='#5e6c5a';ctx.fillRect(x+1,y-6,w-2,2);ctx.fillStyle='#8a9a84';ctx.fillRect(x+1,y-6,w-2,1);
  ctx.fillStyle='#7fc23a';ctx.fillRect(x+1,y-4,w-2,4); // el líquido del canal (atrás del que camina arriba)
  if(!ESC_reducido()){ctx.fillStyle='#b8f060';for(let i=0;i<w;i+=9){const o=Math.floor((T*0.4+i*3)%w);ctx.fillRect(x+1+Math.floor(o*0.98),y-3,3,1);}}
  losaCanal(x,y,w,d);}
function losaCanal(x,y,w,d){ctx.drawImage(ESC_sprite(d,'losaCanal'+w,w+2,10,(g)=>{P.R(g,0,0,w+2,10,C.tinta);P.R(g,1,1,w,7,'#6a7866');P.R(g,1,1,w,1,'#a0b09a');P.R(g,1,6,w,2,'#4e5a4a');
  for(let i=14;i<w;i+=26)P.R(g,1+i,2,1,4,'#4e5a4a');for(let i=2;i<w;i+=7){const hh=hsh(i+x*3);if(hh<0.4)continue;P.R(g,1+i,1,1,1+Math.floor(hh*5),'#8fc23a');}}),x-1,y);}
ESC_registrar(LV,def);
})();
