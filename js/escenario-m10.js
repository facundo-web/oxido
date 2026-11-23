'use strict';
// Óxido · Escenario de la misión 10, Templo perdido (estilo "Hondo"). Del Ilustrador de escenarios.
// Va DESPUÉS de js/escenario-base.js y de js/mision10.js (envuelve los ganchos de M10_LVL; con ?esc=0 queda como antes).
// Guía: notas/arte/guia.md · ficha: notas/arte/fichas/escenarios.md (M10 e "Historia") · Guion: notas/guion/mision-10.md.
// La misión empieza en la SELVA y entra al TEMPLO (M10_GATE): las capas de selva se apagan y las del templo se prenden con la
// misma curva que usaba mision10.js (M10_ease, de camX 360 a 640). Hacia el final el templo se pone dorado (M10_gold).
// Luz: antorchas #ff9a40 (der.) y haces de arriba #fff0b0; polvo dorado #d8c890 al pie (regla 2).
// Quedan de mision10.js: techo, piso, pozos, la rueda y su aviso, los rayos por las juntas del techo, el dosel de la selva,
// el decorado (estatuas, antorchas, braseros, portal), las plataformas y las coberturas.
// Historia: la fachada del templo con un engranaje de piedra SIN dientes (10 huecos que brillan apenas) y el campamento de la
// banda en la selva, con cajones vacíos y etiquetas $. Nada de ídolo en un pedestal.
(()=>{
const P=ESC_px,G=GROUND,LV=M10_LVL;
const C={
  tinta:'#17141f',
  // selva
  copa:'#2e4a2a',copaHi:'#3e5e34',luz:'#c8d8a0',selvaLejos:'#7e9a78',selvaLejos2:'#92ac88',tronco:'#3e4e34',troncoHi:'#5a6c4a',troncoDk:'#30402a',
  liana:'#3a5a2a',hoja:'#4a7a3a',hojaHi:'#6a9a4a',brumaSelva:'#c0d0a0',
  // templo
  sala:'#1e2a26',salaHi:'#2c3c34',lejos:'#4a6a5a',lejosDk:'#3a5448',medio:'#5a6a4a',medioDk:'#4a583e',medioHi:'#6e7e5a',musgo:'#4e7040',
  oro:'#c8963a',oroHi:'#ffd070',oroMedio:'#7e7450',oroMedioHi:'#9a8c5c',oroMedioDk:'#6a6040',
  haz:'#fff0b0',polvo:'#d8c890',antorcha:'#ff9a40',
  piedra:'#6e6858',piedraHi:'#8e8670',piedraDk:'#4e4a3c',frente:'#0e100c',
  // campamento
  lona:'#8a7a5a',lonaHi:'#aa9a70',lonaDk:'#6a5c44',mad:'#7a443c',madHi:'#e8a060',madDk:'#603c4a',interior:'#4a3438',
};
const hsh=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const kT=()=>typeof M10_ease==='function'?M10_ease((camX-360)/280):(camX>500?1:0);   // 0 selva … 1 templo
const kOro=()=>typeof M10_gold==='function'?M10_gold(camX+VW/2):0;                   // 0 piedra … 1 oro
const FACHADA_X=290; // x de la fachada en la capa del medio de la selva (se ve al llegar a la entrada)

// ---------- piezas ----------
// engranaje de piedra sin dientes: aro, rayos, cubo y 10 huecos donde irían los dientes
function engranaje(g,cx,cy,r,pal){
  P.disc(g,cx,cy,r+2,pal.dk);P.disc(g,cx,cy,r,pal.c);P.disc(g,cx,cy,r-5,pal.dk);P.disc(g,cx,cy,r-6,pal.fondo);
  for(let i=0;i<5;i++){const a=i*Math.PI/5;P.line(g,Math.round(cx-Math.cos(a)*(r-6)),Math.round(cy-Math.sin(a)*(r-6)),Math.round(cx+Math.cos(a)*(r-6)),Math.round(cy+Math.sin(a)*(r-6)),pal.c);}
  P.disc(g,cx,cy,7,pal.dk);P.disc(g,cx,cy,6,pal.c);P.disc(g,cx,cy,2,pal.dk);
  for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,x=Math.round(cx+Math.cos(a)*(r+1)),y=Math.round(cy+Math.sin(a)*(r+1));P.R(g,x-2,y-2,5,5,pal.dk);P.R(g,x-1,y-1,3,3,pal.hueco);}
  P.R(g,cx-r+3,cy-r+8,4,1,pal.hi);P.R(g,cx-r+1,cy-4,1,8,pal.hi); // luz de arriba a la izquierda
}
const HUECOS=(cx,cy,r)=>Array.from({length:10},(_,i)=>{const a=i*Math.PI/5-Math.PI/2;return[Math.round(cx+Math.cos(a)*(r+1)),Math.round(cy+Math.sin(a)*(r+1))];});
function fachada(g){ // 120 × 120: pared de bloques con el engranaje gigante, musgo y raíces
  const w=120,h=120;
  for(let y=0;y<h;y+=10)for(let x=-((y/10)%2)*12;x<w;x+=24){P.R(g,x,y,24,10,C.piedraDk);P.R(g,x+1,y+1,22,8,C.piedra);P.R(g,x+1,y+1,22,1,C.piedraHi);}
  P.R(g,0,0,w,4,C.piedraDk);P.R(g,0,0,w,1,C.piedraHi);
  engranaje(g,60,52,34,{c:'#8e8870',dk:'#4a4638',hi:'#b4ac90',fondo:'#625e4c',hueco:'#2a261e'});
  for(let i=0;i<9;i++){const x=Math.floor(hsh(i*3.3)*w);P.R(g,x,0,3+Math.floor(hsh(i)*4),2,C.musgo);}
  for(const[x,l]of[[14,40],[98,56],[106,30]]){let xx=x;for(let y=0;y<l;y++){P.R(g,xx,y,1,1,C.liana);if(y%7===0)xx+=(x%2?1:-1);}}
  P.R(g,0,h-6,w,6,C.musgo);for(let x=0;x<w;x+=5)P.R(g,x,h-8-Math.floor(hsh(x)*3),2,3,C.hoja);
}
// columnas, friso y relieves de engranajes (piedra o dorado)
function sala(g,w,h,pal){
  // friso arriba, con un meandro de dientes
  P.R(g,0,14,w,16,pal.dk);P.R(g,0,15,w,14,pal.c);P.R(g,0,15,w,1,pal.hi);P.R(g,0,28,w,1,pal.dk);
  for(let x=2;x<w;x+=12){P.R(g,x,18,8,2,pal.dk);P.R(g,x+3,20,2,5,pal.dk);P.R(g,x,25,8,1,pal.dk);}
  // zócalo abajo
  P.R(g,0,h-22,w,22,pal.dk);P.R(g,0,h-21,w,21,pal.c);P.R(g,0,h-21,w,1,pal.hi);for(let x=0;x<w;x+=32)P.R(g,x,h-21,1,21,pal.dk);
  // relieves de engranajes chicos entre columnas (apagados)
  // (dos por tramo, chicos y en bajo relieve: no compiten con el engranaje del jefe)
  for(const[x,y,r]of[[90,74,7],[218,66,6]]){P.disc(g,x,y,r+1,pal.dk);P.disc(g,x,y,r,pal.c);P.disc(g,x,y,r-3,pal.dk);P.disc(g,x,y,r-4,pal.c);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;P.R(g,Math.round(x+Math.cos(a)*(r+1)),Math.round(y+Math.sin(a)*(r+1)),1,1,pal.dk);}}
  // columnas
  for(const x of[20,150]){P.R(g,x-5,30,28,7,pal.dk);P.R(g,x-4,30,26,6,pal.c);P.R(g,x-4,30,26,1,pal.hi);   // capitel
    P.R(g,x,37,18,h-59,pal.dk);P.R(g,x+1,37,16,h-59,pal.c);P.R(g,x+1,37,2,h-59,pal.hi);P.R(g,x+13,37,4,h-59,pal.dk);
    for(let i=6;i<13;i+=4)P.R(g,x+i,40,1,h-65,pal.dk);
    P.R(g,x-4,h-28,26,6,pal.dk);P.R(g,x-3,h-28,24,5,pal.c);P.R(g,x-3,h-28,24,1,pal.hi);                 // basa
    if(pal.musgo){P.R(g,x-4,29,9,2,pal.musgo);P.R(g,x+14,36,4,3,pal.musgo);P.R(g,x+1,h-31,5,3,pal.musgo);}}
}
// la selva de día y de noche (luz de luna azul, dosel más oscuro); el templo es interior y queda igual a toda hora
const SELVA={dia:{cielo:[[0,C.copa],[46,'#4a6a3e'],[86,'#8aa074'],[120,C.luz],[999,'#a8bc8a']],copa:C.copa,copaHi:C.copaHi,lejos:C.selvaLejos,lejos2:C.selvaLejos2,
    tronco:C.tronco,troncoHi:C.troncoHi,troncoDk:C.troncoDk,liana:C.liana,hoja:C.hoja,bruma:C.brumaSelva},
  noche:{cielo:[[0,'#0c1418'],[46,'#16262a'],[86,'#2c4448'],[120,'#4a6870'],[999,'#5a787a']],copa:'#0e1a16',copaHi:'#16261e',lejos:'#3e5a60',lejos2:'#4e6c70',
    tronco:'#2a3a34',troncoHi:'#44584e',troncoDk:'#1e2a26',liana:'#2a4436',hoja:'#2e5040',bruma:'#9ab0b8'}};
const SV=a=>a&&a.hora==='noche'?SELVA.noche:SELVA.dia;
const PAL_PIEDRA={c:C.medio,dk:C.medioDk,hi:C.medioHi,musgo:C.musgo};
const PAL_ORO={c:C.oroMedio,dk:C.oroMedioDk,hi:C.oroMedioHi,musgo:null};

// ---------- definición ----------
const def={
  pix:1,nat:'dia',semilla:1010,paso:'pixel',
  atm:{col:C.polvo,fuerza:0.06,pie:0},
  luzPersonajes:{calida:'#ff9a40',lado:1,fria:'#fff0b0'},
  sombra:'#0a0806',
  oscPersonajes:0,
  halosAltos:{col:C.polvo,a:0.6,r:30},
  ambientes:{base:{oscuridad:0.06,oscCol:'#0a0806',luces:1},
    // el templo es adentro: la hora casi no se nota; la selva de noche se enfría un poco
    dia:{luces:0.8,oscuridad:0},amanecer:{luces:1},tarde:{luces:1},
    noche:{luces:1,oscuridad:0.06},
    limpio:{reemplazar:true,tintes:[['screen','#5a6a3a',0.16]],oscuridad:0,luces:0.7}},
  capas:[
    // 1 · SELVA: luz verde bajo el dosel (también fija cuánto se ve la selva y cuánto el templo en este cuadro)
    {id:'selva cielo',cielo:true,segunAmb:true,ancho:W,y:-40,alto:G+40,dibujar(g,w,h,R,c,a){const S=SV(a);
      P.escalones(g,w,h,S.cielo.map(([y,col])=>[Math.min(y,h),col]),4);
      if(S===SELVA.noche){P.disc(g,250,34,7,'#c8d8dc');P.disc(g,252,33,6,'#dce8ea');} // luna entre las copas
      for(let i=0;i<40;i++){const x=Math.floor(hsh(i*2.1)*w),y=Math.floor(hsh(i*5.7)*30)+20;P.disc(g,x,y,6+Math.floor(hsh(i)*8),hsh(i*9)<0.5?S.copa:S.copaHi);}},
      vivo(){const d=ESC_def();if(!d)return;const k=kT(),gk=kOro();
        for(const c of d.capas){if(c.id==='selva cielo')continue;c.alfa=c.id.startsWith('selva')?1-k:c.id.startsWith('oro')?k*gk:k;}}},
    // 2 · selva lejana: troncos en la niebla y un templo escalonado a lo lejos
    {id:'selva lejos',par:0.2,segunAmb:true,ancho:300,y:0,alto:G,pie:'auto',dibujar(g,w,h,R,c,a){const S=SV(a);
      for(let i=0;i<5;i++)P.R(g,150+i*10,112-i*8,110-i*20,8,S.lejos2); // templo escalonado lejano, chico
      P.R(g,194,68,22,4,S.lejos2);P.R(g,200,64,10,4,S.lejos2);
      for(let i=0;i<9;i++){const x=Math.floor(hsh(i*7.7)*w),ww=5+Math.floor(hsh(i*1.3)*6);P.R(g,x,0,ww,h,S.lejos);P.R(g,x,0,1,h,S.lejos2);}
      P.cresta(g,w,h-30,6,4,S.lejos,2);}},
    // 3 · selva cercana: troncos grandes, lianas y helechos; la FACHADA del templo con el engranaje (una sola vez)
    {id:'selva medio',par:0.5,segunAmb:true,ancho:340,y:0,alto:G,pie:'auto',niebla:0.05,dibujar(g,w,h,R,c,a){const S=SV(a);
      for(const[x,ww]of[[30,22],[230,16]]){P.R(g,x,0,ww,h,S.troncoDk);P.R(g,x+2,0,ww-5,h,S.tronco);P.R(g,x+2,0,2,h,S.troncoHi);
        for(let y=12;y<h;y+=18)P.R(g,x+5,y,ww-10,1,S.troncoDk);P.R(g,x-6,h-8,ww+12,8,S.troncoDk);}
      for(const[x0,x1,y0,s]of[[52,226,20,34],[246,340,34,20],[0,30,40,16]]){for(let x=x0;x<x1;x++){const t=(x-x0)/(x1-x0),y=Math.round(y0+Math.sin(t*Math.PI)*s);P.R(g,x,y,1,2,S.liana);}}
      for(let i=0;i<14;i++){const x=Math.floor(hsh(i*4.1)*w),y=Math.floor(hsh(i*6.3)*24);P.disc(g,x,y,4+Math.floor(hsh(i*2)*5),hsh(i*3)<0.5?S.hoja:S.liana);}
      for(let x=0;x<w;x+=9){if(hsh(x*0.7)<0.45)continue;for(let k=0;k<4;k++)P.line(g,x+4,h-2,x+k*3-2,h-10-Math.floor(hsh(x+k)*6),S.hoja);}
      // a la altura del cuerpo (y 110–150) los troncos no bajan de 0,13: velo de niebla de la selva SOLO sobre lo pintado (source-atop)
      g.save();g.globalCompositeOperation='source-atop';g.fillStyle=S.bruma;for(let y=84;y<h;y++){const u=Math.min(1,(y-84)/24),sm=u*u*(3-2*u);g.globalAlpha=0.62*sm;g.fillRect(0,y,w,1);}g.restore();},
      vivo(c2,ox,oy,c,a){
        if(c.alfa<0.02)return;if(a&&a.hora==='noche')luciernagas(c2,ox,oy,c);const X=Math.round(ox+FACHADA_X),Y=Math.round(oy+G-120);if(X<-130||X>VW+10)return;
        c2.globalAlpha=c.alfa;c2.drawImage(ESC_sprite(ESC_def(),'m10fachada',120,120,fachada),X,Y);
        // los 10 huecos brillan apenas (dorado); quietos con MOVIMIENTO REDUCIDO
        const p=ESC_reducido()?0.6:0.5+0.5*Math.sin(T*0.04);c2.save();c2.globalCompositeOperation='lighter';c2.imageSmoothingEnabled=true;
        for(const[hx,hy]of HUECOS(60,52,34)){c2.globalAlpha=c.alfa*(0.26+0.14*p);c2.drawImage(ESC_glow(C.oroHi),X+hx-6,Y+hy-6,12,12);}
        c2.restore();c2.globalAlpha=c.alfa*(0.5+0.3*p);c2.fillStyle=C.oro;for(const[hx,hy]of HUECOS(60,52,34))c2.fillRect(X+hx,Y+hy,1,1);c2.globalAlpha=1;}},
    // 4 · TEMPLO: la sala del fondo en penumbra, con aberturas arriba y haces de sol
    {id:'templo sala',par:0.25,ancho:300,y:-40,alto:G+40,pie:'auto',dibujar(g,w,h){
      P.escalones(g,w,h,[[0,C.sala],[50,C.sala],[90,'#26342e'],[130,C.salaHi],[170,C.lejosDk],[h,C.lejos]],4);
      // arcos lejanos
      for(let x=10;x<w;x+=58){P.R(g,x,96,40,h-96,C.lejosDk);P.R(g,x+8,110,24,h-110,'#2a3a32');P.disc(g,x+20,110,12,'#2a3a32');P.R(g,x,96,40,1,C.lejos);}
      P.R(g,0,92,w,4,C.lejos);
      // aberturas en el techo y sus haces
      for(const x of[70,214]){P.R(g,x-6,40,14,4,C.haz);P.R(g,x-8,44,18,2,'#a8a080');
        for(let y=46;y<h-10;y++){const t=(y-46)/(h-56),ww=Math.round(8+t*26);g.globalAlpha=0.16*(1-t*0.6);P.R(g,Math.round(x-3+t*10-ww/2),y,ww,1,C.haz);}g.globalAlpha=1;}}},
    // 5 · columnas y relieves de piedra, apagados (hoy competían con los personajes)
    {id:'templo columnas',par:0.5,ancho:256,y:0,alto:G,dibujar(g,w,h){sala(g,w,h,PAL_PIEDRA);},
      vivo(c2,ox,oy,c){antorchas(c2,ox,oy,c);}},
    // 6 · las mismas columnas en oro, que se prenden hacia el final
    {id:'oro columnas',par:0.5,ancho:256,y:0,alto:G,alfa:0,dibujar(g,w,h){sala(g,w,h,PAL_ORO);}},
    // 7 · bruma alta (de noche) y polvo dorado al pie (regla 2)
    Object.assign(ESC_brumaAlta(C.brumaSelva,0.22),{id:'selva bruma alta'}),
    Object.assign(ESC_brumaAlta(C.polvo,0.22),{id:'templo bruma alta'}),
    {id:'selva bruma',protegida:true,segunAmb:true,par:0.7,parY:1,ancho:W,y:98,alto:G-98+2,pie:'auto',niebla:0,nieblaPie:0,dibujar(g,w,h,R,c,a){niebla(g,w,h,SV(a).bruma,0.3);}},
    {id:'templo bruma',protegida:true,par:0.7,parY:1,ancho:W,y:98,alto:G-98+2,pie:'auto',niebla:0,nieblaPie:0,dibujar(g,w,h){niebla(g,w,h,C.polvo,0.32);}},
  ],
  // primer plano: columna rota y raíces en los costados, una cortina de lianas arriba
  frente:{par:1.4,parY:1.15,alfa:1,ancho:940,bordesAbajo:true,piezas:[
    {x:16,y:0,w:26,h:10,abajo:true,dibujar(g,w,h){P.R(g,0,3,20,h-3,C.frente);P.R(g,2,0,6,3,C.frente);P.R(g,12,1,6,2,C.frente);P.R(g,20,6,6,h-6,C.frente);}},
    {x:520,y:0,w:34,h:8,abajo:true,dibujar(g,w,h){for(let i=0;i<34;i+=3)P.R(g,i,Math.floor(hsh(i)*4),2,h,C.frente);}},
    {x:300,y:0,w:56,h:32,arriba:true,dibujar(g,w,h){P.R(g,0,0,w,3,C.frente);for(const[x0,l]of[[6,26],[16,18],[28,30],[40,14],[50,22]]){let x=x0;for(let y=3;y<l;y++){P.R(g,x,y,1,1,C.frente);if(y%6===0)x+=(x0%2?1:-1);}P.R(g,x-1,l,3,2,C.frente);}}},
  ],
    vivo(c2,d,par,ac){const dx=camX*(1-par),bot=Math.floor(camY+VH),x0=camX-dx-20,x1=camX+VW-dx+20;c2.globalAlpha=ac;c2.fillStyle=C.frente;
      for(let k=Math.floor(x0/30);k<=x1/30;k++){if(hsh(k*1.3)<0.45)continue;const X=Math.round(k*30+dx),borde=Math.min(X-camX,camX+VW-X),h=borde>VW*0.15?2:5;c2.fillRect(X,bot-h,14,h);c2.fillRect(X+3,bot-h-1,2,1);}
      c2.globalAlpha=1;}},
  // piso de mision10.js (pozos, rueda, techo, rayos); encima, en el templo, juntas en perspectiva y musgo
  piso(c2,x0,x1){
    if(LV.drawGround0)LV.drawGround0();
    const a=Math.max(x0,typeof M10_GATE==='number'?M10_GATE:640);if(a>=x1)return;
    const cx=Math.round(camX+VW/2);c2.globalAlpha=0.35;
    for(let x=Math.floor(a/24)*24;x<x1+24;x+=24)P.line(c2,x,G+2,cx+(x-cx)*1.8,H,'#3a362c');
    c2.globalAlpha=0.7;for(let x=Math.floor(a/16)*16;x<x1;x+=16)if(hsh(x*0.31)<0.3)P.R(c2,x+3,G,4+Math.floor(hsh(x)*4),1,C.musgo);
    c2.globalAlpha=1;
  },
  // el campamento de la banda en la selva: carpa y cajones VACÍOS (de las misiones anteriores), con etiquetas $
  extras(lv){
    const duro=x=>(lv.covers||[]).some(c=>x>c.x-6&&x<c.x+c.w+6)||lv.decor.some(o=>o.k!=='helecho'&&o.k!=='arbusto'&&x>o.x-8&&x<o.x+(o.k==='portal'?90:o.k==='cabezota'?36:20))||
      lv.platforms.some(p=>!p.roof&&!p.pyr&&x>p.x-4&&x<p.x+p.w+4)||(lv.crates||[]).some(c=>x>c.x-6&&x<c.x+20)||(lv.prisoners||[]).some(p=>!p.y&&x>p.x-10&&x<p.x+18);
    const busca=(x0,w,lim)=>{let x=x0;while(x<lim){let ok=true;for(let i=x;i<=x+w;i+=2)if(duro(i)){ok=false;break;}if(ok)return x;x+=2;}return -1;};
    const out=[];let x=busca(40,40,260);if(x>=0)out.push({x,k:'carpa'});
    for(const[x0,t]of[[100,0],[320,1],[420,2]]){const xx=busca(x0,22,Math.min(560,x0+140));if(xx>=0&&!out.some(o=>Math.abs(o.x-xx)<44))out.push({x:xx,k:'cajonVacio',t});}
    return out;
  },
  luces(lv){return lv.decor.filter(o=>o.k==='antorcha'||o.k==='brasero').map(o=>({x:o.x+5,y:o.k==='antorcha'?G-59:G-28,r:o.k==='antorcha'?56:48,col:C.antorcha,fuerza:0.6,tipo:'fuego'}));},
  decor(o,d){
    if(o.k==='carpa'){const x=Math.round(o.x);ESC_sombraContacto(d,x+20,40,G,0.55);
      ctx.drawImage(ESC_sprite(d,'m10carpa',42,28,(s)=>{for(let y=0;y<24;y++){const ww=Math.round(4+y*1.5);P.R(s,21-(ww>>1)-1,4+y,ww+2,1,C.tinta);P.R(s,21-(ww>>1),4+y,ww,1,y<1?C.lonaHi:y%6===5?C.lonaDk:C.lona);}
        P.R(s,20,0,2,28,C.tinta);P.R(s,20,1,1,26,'#8a6a4a');P.R(s,17,14,8,14,C.interior);P.R(s,17,14,8,1,C.lonaDk);
        P.R(s,0,27,42,1,C.tinta);ESC_H.etiqueta(s,28,10);}),x,G-28);return true;}
    if(o.k==='cajonVacio'){const x=Math.round(o.x);ESC_sombraContacto(d,x+11,24,G,0.6);
      ctx.drawImage(ESC_sprite(d,'m10cajon'+o.t,24,18,(s)=>{
        P.R(s,0,4,22,14,C.tinta);P.R(s,1,5,20,13,C.mad);P.R(s,1,5,20,1,C.madHi);P.R(s,3,6,16,5,C.interior);P.R(s,3,6,16,1,'#2e2428'); // abierto y vacío
        P.R(s,1,15,20,2,C.madDk);P.line(s,3,12,19,16,C.madDk);
        if(o.t===1){P.R(s,16,0,8,4,C.tinta);P.R(s,17,1,6,2,C.mad);P.R(s,17,1,6,1,C.madHi);}         // tapa apoyada
        else if(o.t===2){P.R(s,5,8,10,2,'#2a2a34');P.R(s,9,8,2,2,'#8a8a98');}                       // correa suelta (era de la nave)
        if(o.t!==1)ESC_H.etiqueta(s,14,0);}),x,G-18);return true;}
    if(o.k==='cabezota'){const x=Math.round(o.x);ESC_sombraContacto(d,x+20,40,G,0.5); // cabeza de piedra medio enterrada, en Hondo y más clara (está detrás del jugador al arrancar)
      ctx.drawImage(ESC_sprite(d,'m10cabezota',46,36,(s)=>{P.oval(s,23,34,23,29,C.tinta);P.oval(s,23,34,22,28,'#9a9480');P.oval(s,26,34,18,26,'#a8a28c');P.R(s,1,6,2,28,'#b8b29a');
        P.oval(s,38,30,6,20,'#867e6a');P.R(s,0,30,46,6,C.tinta);P.R(s,1,30,44,5,'#8a846e');P.R(s,1,30,44,1,'#b8b29a');
        P.R(s,7,14,12,3,'#6e6858');P.R(s,27,14,12,3,'#6e6858');P.R(s,10,18,7,2,'#4e4a3e');P.R(s,29,18,7,2,'#4e4a3e');P.R(s,20,18,6,10,'#7e7866');P.R(s,15,30,16,2,'#6e6858');
        P.oval(s,17,4,10,3,C.musgo);P.R(s,37,22,6,10,C.musgo);P.R(s,38,22,5,1,C.hojaHi);}),x-3,G-36);
      return true;}
    return false; // el resto del decorado es de mision10.js
  },
  caja(c,d){return ESC_H.caja(c,d);},
  // la rama alta de la selva (gancho L.drawPlat): tronco que baja al piso, en Hondo y con niebla a la altura del cuerpo (≥ 0,13)
  plat(pl,d){
    if(!pl.roof&&!pl.pyr&&!pl.m10blk&&!pl.hi&&!pl.step&&pl.k!=='tronco'&&!pl.ar&&!pl.salaAr)return losa(pl,d);
    if(pl.hi!=='rama')return false;
    const x=Math.round(pl.x),y=Math.round(pl.y),w=Math.round(pl.w),S=SV(ESC.amb);
    ESC_sombraContacto(d,x-2,12,G,0.5);
    ctx.drawImage(ESC_sprite(d,'m10rama'+w+(S===SELVA.noche?'n':''),w+14,G+1,(g)=>{const tx=0;
      g.fillStyle=C.tinta;g.fillRect(tx,0,13,G);g.fillStyle='#5a4632';g.fillRect(tx+1,0,11,G);g.fillStyle='#7a6044';g.fillRect(tx+2,0,2,G);
      for(let yy=14;yy<G;yy+=19)g.fillRect(tx+5,yy,5,1);
      g.save();g.globalCompositeOperation='source-atop';g.fillStyle=S.bruma;for(let yy=84;yy<G;yy++){const u=Math.min(1,(yy-84)/24),sm=u*u*(3-2*u);g.globalAlpha=0.62*sm;g.fillRect(tx,yy,13,1);}g.restore();
      // la rama: tinta, madera y borde claro arriba, con hojas
      P.R(g,8,y-1,w+6,8,C.tinta);P.R(g,9,y,w+4,6,'#5e4a34');P.R(g,9,y,w+4,1,'#8a6e4a');P.R(g,9,y+5,w+4,1,'#46362a');}),x-8,0);
    ctx.fillStyle=C.hoja;for(let i=0;i<4;i++){const ox=x+6+i*11,oy=y-2;ctx.fillRect(ox-4,oy-1,9,3);ctx.fillStyle=C.hojaHi;ctx.fillRect(ox-3,oy-1,7,1);ctx.fillStyle=C.hoja;}
    return true;
  },
};
// luciérnagas de noche en la selva: 1 px con un halo chico; quietas y sin titilar con MOVIMIENTO REDUCIDO
function luciernagas(c2,ox,oy,c){
  const red=ESC_reducido();c2.save();c2.imageSmoothingEnabled=true;
  for(let i=0;i<16;i++){const lx=hsh(i*3.7)*340,ly=50+hsh(i*8.1)*90,X=Math.round(((lx+ox+(red?0:Math.sin(T/90+i)*6))%340+340)%340-10),Y=Math.round(oy+ly+(red?0:Math.sin(T/70+i*2)*4));
    const p=red?0.8:0.5+0.5*Math.sin(T/40+i*1.7);if(p<0.15)continue;
    for(let X2=X;X2<VW+10;X2+=340){c2.globalCompositeOperation='lighter';c2.globalAlpha=c.alfa*0.35*p;c2.drawImage(ESC_glow('#c8f070'),X2-4,Y-4,9,9);
      c2.globalCompositeOperation='source-over';c2.globalAlpha=c.alfa*p;c2.fillStyle='#e8ffa0';c2.fillRect(X2,Y,1,1);}}
  c2.restore();
}
function niebla(g,w,h,col,max){for(let y=0;y<h;y++){const u=Math.min(1,y/24),sm=u*u*(3-2*u),t=y/(h-1);g.globalAlpha=Math.min(0.7,max*sm+0.26*t);g.fillStyle=col;g.fillRect(0,y,w,1);}g.globalAlpha=1;}
// antorchas de pared: una por columna (lado derecho del capitel), con halo; sin parpadeo con MOVIMIENTO REDUCIDO
function antorchas(c2,ox,oy,c){
  if(c.alfa<0.02)return;
  ESC_cada(c,ox,40,30,x=>{const X=Math.round(x),Y=Math.round(oy+58),fl=ESC_reducido()?0:Math.sin(T/4+x)*0.5+Math.sin(T/6.7+x*2)*0.5;
    c2.globalAlpha=c.alfa;c2.fillStyle=C.tinta;c2.fillRect(X-2,Y,4,9);c2.fillStyle='#5a4428';c2.fillRect(X-1,Y+1,2,8);c2.fillRect(X-3,Y,6,2);
    c2.fillStyle=C.antorcha;c2.fillRect(X-1,Y-4-(fl>0.3?1:0),3,4);c2.fillStyle='#ffe0a0';c2.fillRect(X,Y-2,1,2);
    c2.save();c2.globalCompositeOperation='lighter';c2.imageSmoothingEnabled=true;c2.globalAlpha=c.alfa*(0.3+0.06*fl);c2.drawImage(ESC_glow(C.antorcha),X-26,Y-28,52,52);c2.restore();});
  ESC_cada(c,ox,170,30,x=>{const X=Math.round(x),Y=Math.round(oy+58);c2.globalAlpha=c.alfa;c2.fillStyle=C.tinta;c2.fillRect(X-2,Y,4,9);c2.fillStyle='#5a4428';c2.fillRect(X-1,Y+1,2,8);
    c2.fillStyle=C.antorcha;c2.fillRect(X-1,Y-4,3,4);c2.fillStyle='#ffe0a0';c2.fillRect(X,Y-2,1,2);
    c2.save();c2.globalCompositeOperation='lighter';c2.imageSmoothingEnabled=true;c2.globalAlpha=c.alfa*0.3;c2.drawImage(ESC_glow(C.antorcha),X-26,Y-28,52,52);c2.restore();});
  c2.globalAlpha=1;
}
// losa de piedra sobre dos pilas de piedras (antes M10_slab): en Hondo, piedra ≥ 0,05 a la altura del cuerpo y borde claro arriba (dorado en los salones de oro)
function losa(pl,d){const x=Math.round(pl.x),y=Math.round(pl.y),w=Math.round(pl.w),hh=G-y,oro=typeof M10_gold==='function'&&M10_gold(x)>0.5;
  for(const px of[x+6,x+w-6])ESC_sombraContacto(d,px,8,G,0.55);
  ctx.drawImage(ESC_sprite(d,'m10losa'+w+'x'+hh+(oro?'o':''),w+2,hh+1,(g)=>{
    for(const px of[3,w-9]){P.R(g,px,5,9,hh-5,C.tinta);for(let yy=6,k=0;yy<hh;yy+=6,k++){P.R(g,px+1,yy,7,5,k%2?'#8a846e':'#9a9480');P.R(g,px+1,yy,7,1,'#b4ae96');}}
    P.R(g,0,0,w+2,7,C.tinta);P.R(g,1,1,w,5,'#9a9480');P.R(g,1,1,w,1,oro?'#e8b84a':'#c8c2a8');P.R(g,1,5,w,1,'#7e7866');
    for(let i=5;i<w-3;i+=9)P.R(g,i,3,2,1,'#7e7866');
    if(hsh(x)<0.5)P.R(g,Math.round(w*0.6),0,6,1,C.musgo);}),x-1,y-1);
  return true;}
ESC_registrar(LV,def);
})();
