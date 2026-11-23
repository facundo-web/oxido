'use strict';
// Óxido · Escenario de la misión 9, Ciudad embrujada (estilo "Hondo", luna llena). Del Ilustrador de escenarios.
// Va DESPUÉS de js/escenario-base.js y de js/mision9.js / jefes9.js (envuelve los ganchos de M9_LVL; con ?esc=0 queda como antes).
// Guía: notas/arte/guia.md · ficha: notas/arte/fichas/escenarios.md (M9 e "Historia").
// Las fachadas de ladrillo de la calle, el decorado que reacciona a los fantasmas (faroles que titilan, carteles, persianas,
// relojes), las plataformas y las coberturas son de mision9.js y siguen igual: este escenario pone el fondo (cielo con
// luna llena, tejados y campanario, el tranvía), apaga y simplifica las fachadas (ladrillo más oscuro, menos detalle),
// la bruma gris azulada (NO lila: el soldado de M9 es lila), la luz de los faroles y la Historia.
// Historia: la casa de antigüedades con la vidriera rota y el almohadón vacío con la etiqueta VENDIDO, las huellas de patas
// de silla en la vereda hacia la mansión y el camión de mudanzas de la banda (momento "LA MUDANZA").
(()=>{
const P=ESC_px,G=GROUND,LV=M9_LVL;
const C={
  cielo:[[0,'#1a1428'],[40,'#241c34'],[80,'#3a2e4a'],[112,'#5a4a6a']],
  luna:'#efe8d8',lunaDk:'#d0c8b8',lejos:'#6a5a7a',lejosDk:'#5a4c6a',lejos2:'#4e4260',lejos2Dk:'#40364e',
  niebla:'#6e7488',bruma:'#8f98c0',tinta:'#17141f',frente:'#06050a',gas:'#ffc070',gasC:'#ffe0a0',
  fachada:'#2e2430',
};
const CIELOS={noche:C.cielo,tarde:[[0,'#24203a'],[60,'#4a3a52'],[100,'#8a6a6a'],[112,'#a07a6a']],amanecer:[[0,'#1e2040'],[60,'#3a3a5a'],[100,'#8a7a8a'],[112,'#b09a9a']],dia:[[0,'#4a4a6a'],[60,'#6a6a86'],[100,'#9a98ac'],[112,'#b0aec0']]};
const Y0=-40,LUNA={x:150,y:54};
const hsh=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
// tejados: casas con techo a dos aguas, chimeneas y un campanario
function tejados(g,w,R,base,col,dk,campanario){
  let x=0;while(x<w){const bw=18+Math.floor(R()*26),bh=10+Math.floor(R()*22);
    P.R(g,x,base-bh,bw,bh+40,col);for(let i=0;i<Math.floor(bw/2);i++)P.R(g,x+i,base-bh-i,bw-2*i,1,col);
    if(R()<0.5)P.R(g,x+Math.floor(bw*0.7),base-bh-Math.floor(bw*0.35)-6,3,8,dk);
    if(R()<0.25)P.R(g,x+3,base-bh+4,2,3,'#c8a070');x+=bw+Math.floor(R()*4);}
  if(campanario){const cx=Math.floor(w*0.4);P.R(g,cx,base-58,14,58,col);P.R(g,cx+3,base-50,8,8,dk);P.R(g,cx+5,base-48,4,6,'#c8b890');
    for(let i=0;i<9;i++)P.R(g,cx+7-Math.floor(i*0.8),base-58-i*2,Math.max(1,Math.floor(i*1.6)),2,col);P.R(g,cx+6,base-78,2,4,dk);}
}
// camión de mudanzas de la banda (Historia): caja alta con la puerta abierta y una rampa
function mudanza(s){const ink=C.tinta,t=typeof pfLienzo==='function'?pfLienzo('MUDANZAS','#2a2030'):null,tw=t?t.width:34,bw=Math.max(44,tw+16);
  P.R(s,0,4,bw+16,28,ink);P.R(s,1,5,bw,24,'#544868');P.R(s,1,5,bw,1,'#7a6e8e');for(let i=12;i<bw;i+=6)P.R(s,i,18,1,10,'#30283a');
  P.R(s,2,8,8,18,'#1a1622');P.R(s,3,10,3,14,'#2a2430'); // puerta de atrás abierta
  P.R(s,bw+2,12,14,18,'#3a3044');P.R(s,bw+8,14,7,6,'#5a6a90');P.R(s,0,28,bw+18,4,'#2a2430');for(const wx of[10,bw+4])P.disc(s,wx,32,4,ink);
  P.R(s,11,7,tw+4,9,ink);P.R(s,12,8,tw+2,7,'#c8a070');if(t)s.drawImage(t,13,8);}
// ventanas con vela: en cada edificio, una del primer piso y una del segundo (misma grilla que mision9.js); 4 o 5 a la vista
let VELAS=null;
function velas(){if(VELAS)return VELAS;VELAS=[];if(typeof M9_BLD==='undefined')return VELAS;
  M9_BLD.forEach((b,i)=>{if(b.mansion)return;const oy=14,hh=G-b.top+14,pisos=[],cols=[];
    for(let wy=oy+9;wy<hh-34;wy+=22)pisos.push(wy);for(let wx=7;wx+8<=b.w-5;wx+=18)cols.push(wx);if(!pisos.length||!cols.length)return;
    // una ventana en el primer piso y otra en el segundo, en columnas distintas
    for(let k=0;k<Math.min(2,pisos.length);k++){const wy=pisos[pisos.length-1-k],wx=cols[(i*7+k*3)%cols.length];VELAS.push({x:b.x+wx,y:b.top-(b.pad||14)+wy,s:i*13+k*5});}});
  return VELAS;}
const BRUMA_PIE={noche:0.63,lluvia:1.02,amanecer:0.63,tarde:0.63,dia:0.63,otra:0.63}; // fuerza de la meseta de bruma al pie (se ajusta midiendo)
const def={
  halosAltos:{col:C.bruma,a:0.92,r:20,plano:true,alto:40}, // de noche, luz suave detrás de las plataformas altas (regla de Arte)
  pix:1,nat:'noche',semilla:99,paso:'pixel',
  atm:{col:C.niebla,fuerza:0.03,pie:0},
  luzPersonajes:{calida:'#ffc070',lado:-1,fria:'#c8c0ff'},
  sombra:'#05040a',
  oscPersonajes:0.3,
  ambientes:{
    base:{oscuridad:0.14,oscCol:'#04030a'},
    amanecer:{tinte:'#c0a0b0',tinteA:0.1,modo:'overlay',luces:0.6,oscuridad:0.06},
    dia:{tinte:'#a8a8c0',tinteA:0.2,modo:'screen',luces:0.3,oscuridad:0},
    tarde:{tinte:'#c09070',tinteA:0.1,modo:'overlay',luces:0.8,oscuridad:0.08},
    limpio:{reemplazar:true,tintes:[['screen','#4a4a7a',0.22]],oscuridad:0,luces:0.6},
  },
  capas:[
    // 1 · cielo: escalones, luna llena con halo frío, nubes finas que la cruzan
    {id:'cielo',cielo:true,segunAmb:true,ancho:W,y:Y0,alto:G-Y0+4,luces:[{x:LUNA.x,y:LUNA.y-Y0,r:36,col:'#c8c0ff',fuerza:0.24,tipo:'ventana'}],
      dibujar(g,w,h,R,c,a){const hz=a&&CIELOS[a.hora]?a.hora:'noche',st=CIELOS[hz].map(([y,col])=>[y-Y0,col]);st.unshift([0,st[0][1]]);P.escalones(g,w,h,st,4);
        if(hz==='noche')for(let i=0;i<40;i++){g.fillStyle=hsh(i*9)<0.3?'#d8d0f0':'#6a5a8a';g.fillRect(Math.floor(hsh(i*3.1)*w),Math.floor(hsh(i*7.3)*70)-Y0,1,1);}
        if(hz!=='dia'){P.disc(g,LUNA.x,LUNA.y-Y0,11,C.luna);P.R(g,LUNA.x-4,LUNA.y-Y0-3,3,2,C.lunaDk);P.R(g,LUNA.x+2,LUNA.y-Y0+2,4,3,C.lunaDk);P.R(g,LUNA.x-3,LUNA.y-Y0+5,2,2,C.lunaDk);}
        for(let i=0;i<4;i++){const y=20+i*14+Math.floor(hsh(i)*6)-Y0,x=Math.floor(hsh(i*4)*240)-20;P.R(g,x,y,60+Math.floor(hsh(i*2)*50),3,'#1e1830');P.R(g,x+6,y+3,40,1,'#3a3050');}}},
    // 2 · lejos: tejados y el campanario
    {id:'lejos',par:0.08,ancho:640,y:70,alto:G-70,pie:'auto',nieblaPie:0,dibujar(g,w,h,R){tejados(g,w,R,54,C.lejos,C.lejosDk,true);P.banda(g,w,26,58,C.niebla,0,0.32);}},
    // 3 · lejos 2: más techos y el cable del tranvía (el tranvía de mision9.js pasa por acá)
    {id:'lejos 2',par:0.2,ancho:720,y:80,alto:G-80,pie:'auto',nieblaPie:0,dibujar(g,w,h,R){tejados(g,w,R,60,C.lejos2,C.lejos2Dk,false);P.banda(g,w,30,64,C.niebla,0,0.3);},
      vivo(){if(typeof M9_drawTram==='function'&&typeof M9!=='undefined'&&M9.tram)try{M9_drawTram();}catch(e){}}},
    // 4 · bruma al pie (regla 2): gris azulado, nunca lila (el soldado de M9 es lila)
    {id:'bruma',par:0.7,parY:1,ancho:W,y:88,alto:G-88+2,pie:'auto',niebla:0,nieblaPie:0,segunAmb:true,dibujar(g,w,h,R,c,a){/* bruma al pie en MESETA (guía §9): 0 en y 88, llena en y 110 y pareja hasta el piso; 0,13–0,16 en la franja de los personajes */const A=a&&a.hora==='noche'?BRUMA_PIE.noche*(a.clima==='lluvia'||a.clima==='tormenta'?BRUMA_PIE.lluvia:1):(a&&BRUMA_PIE[a.hora]!=null?BRUMA_PIE[a.hora]:BRUMA_PIE.otra);g.fillStyle=C.bruma;for(let y=0;y<h;y++){const u=Math.min(1,y/22),sm=u*u*(3-2*u);g.globalAlpha=A*sm;g.fillRect(0,y,w,1);}g.globalAlpha=1;}},
  ],
  // primer plano: rejas de hierro y lápidas en los costados, ramas secas en las esquinas de arriba; abajo, reja baja (vivo)
  frente:{par:1.4,parY:1.15,alfa:1,ancho:900,piezas:[
    {x:30,y:0,w:40,h:36,abajo:true,dibujar(g,w,h){P.R(g,0,6,w,2,C.frente);P.R(g,0,h-4,w,4,C.frente);for(let i=1;i<w;i+=5){P.R(g,i,4,2,h-4,C.frente);P.R(g,i,1,2,3,C.frente);P.R(g,i-1,3,4,1,C.frente);}}},
    {x:470,y:0,w:22,h:20,abajo:true,dibujar(g,w,h){P.R(g,2,6,18,14,C.frente);for(let i=0;i<5;i++)P.R(g,2+i,6-i,18-2*i,1,C.frente);P.R(g,9,8,4,1,'#1a1824');P.R(g,10,7,2,4,'#1a1824');}},
    {x:240,y:0,w:60,h:30,arriba:true,dibujar(g,w,h){P.R(g,0,0,w,3,C.frente);P.line(g,0,2,w-10,10,C.frente,2);P.line(g,20,6,30,20,C.frente);P.line(g,40,8,52,24,C.frente);P.line(g,30,14,24,26,C.frente);}},
  ],
    vivo(c2,d,par,ac){const dx=camX*(1-par),bot=Math.floor(camY+VH),x0=camX-dx-20,x1=camX+VW-dx+20;c2.globalAlpha=ac;c2.fillStyle=C.frente;
      for(let k=Math.floor(x0/5);k<=x1/5;k++){if(hsh(Math.floor(k/9)*3.1)<0.35)continue;const X=Math.round(k*5+dx),borde=Math.min(X-camX,camX+VW-X),h=borde>VW*0.15?4:9;
        c2.fillRect(X,bot-h,1,h);c2.fillRect(X-1,bot-h,3,1);}
      c2.globalAlpha=1;}},
  // piso: las fachadas y la calle de mision9.js, más oscuras y con menos detalle; huellas de patas de silla hacia la mansión
  piso(c2,x0,x1,d){
    if(LV.drawGround0)LV.drawGround0();
    // bruma al pie POR ENCIMA de las fachadas (y por debajo de la capa de juego): de 0 en y 60 (sin borde) a 84 % en el piso. La calle queda
    // en niebla iluminada; el ladrillo pierde detalle abajo, donde compite con los personajes, y lo guarda arriba
    // arranca en 0 en y 90 con curva suave (smoothstep, sin corte), llega a la meta en y 110 y sigue subiendo hasta el piso
    // y, de noche, un velo tenue más arriba (y 56–90) para que el fondo de los que están en las plataformas no baje de 0,12
    {const a=ESC.amb||{},A=a.hora==='noche'?BRUMA_PIE.noche*(a.clima==='lluvia'||a.clima==='tormenta'?BRUMA_PIE.lluvia:1):(BRUMA_PIE[a.hora]!=null?BRUMA_PIE[a.hora]:BRUMA_PIE.otra);
      c2.fillStyle=C.bruma;for(let y=88;y<G;y++){const u=Math.min(1,(y-88)/22),sm=u*u*(3-2*u);c2.globalAlpha=A*sm;c2.fillRect(x0,y,x1-x0,1);}} // meseta (guía §9)
    c2.globalAlpha=1;
    for(const v of velas())if(v.x>x0-10&&v.x<x1+10){const f=ESC_reducido()?0:((T>>3)+v.s)%6===0?1:0;
      c2.fillStyle=C.gas;c2.fillRect(v.x,v.y,8,11);c2.fillStyle='#4e424e';c2.fillRect(v.x+3,v.y,1,11);c2.fillRect(v.x,v.y+5,8,1);c2.fillStyle=C.gasC;c2.fillRect(v.x+5,v.y+7-f,1,3);}
    // las huellas de las patas de silla, de a pares, rumbo a la mansión (x > 2400)
    c2.fillStyle='#1a1622';for(let x=Math.max(x0,2380)-(Math.max(x0,2380)%14);x<Math.min(x1,3060);x+=14){const y=G+6+((x/14)%2?2:0);c2.fillRect(x,y,1,1);c2.fillRect(x+4,y,1,1);c2.fillRect(x+1,y+3,1,1);c2.fillRect(x+5,y+3,1,1);}
  },
  extras(lv){
    const duro=x=>(lv.covers||[]).some(c=>x>c.x-6&&x<c.x+c.w+6)||lv.decor.some(o=>x>o.x-8&&x<o.x+22)||(lv.tunnels||[]).some(t=>x>t.x-8&&x<t.x+t.w+8)||
      (lv.pyramids||[]).some(p=>x>p.x-8&&x<p.x+p.w+8)||lv.platforms.some(p=>!p.roof&&!p.pyr&&!p.ar&&!p.salaAr&&x>p.x-4&&x<p.x+p.w+4)||(lv.crates||[]).some(c=>x>c.x-4&&x<c.x+18)||(lv.prisoners||[]).some(p=>!p.y&&x>p.x-8&&x<p.x+16);
    const busca=(x0,w,lim)=>{let x=x0;while(x<lim){let ok=true;for(let i=x;i<=x+w;i+=2)if(duro(i)){ok=false;break;}if(ok)return x;x+=2;}return -1;};
    const out=[],a=busca(400,40,1000);if(a>=0)out.push({x:a,k:'antiguedades'});let m=busca(1500,78,2300);if(m<0)m=busca(1200,78,2900);if(m>=0)out.push({x:m,k:'mudanza'});
    return out;
  },
  luces(lv){return velas().map(v=>({x:v.x+4,y:v.y+5,r:12,col:C.gas,fuerza:0.5,tipo:'fuego'})).concat(lv.decor.filter(o=>o.k==='farol').map(o=>({x:o.x+3,y:G-43,r:44,col:C.gas,tipo:'farol',
    // los faroles titilan cuando un fantasma se pone sólido cerca (mision9.js): la luz los sigue
    get fuerza(){return typeof M9!=='undefined'&&M9.flick>0&&hash((o.x|0)+(T>>1))<0.5?0:0.6;}})));},
  decor(o,d){
    const g=G,x=Math.round(o.x),spr=(k,w,h,fn,dx,dy)=>ctx.drawImage(ESC_sprite(d,k,w,h,fn),x+dx,g+dy);
    switch(o.k){
    case 'antiguedades':ESC_sombraContacto(d,x+20,40,g,0.4);
      spr('antiguedades',42,34,(s)=>{const ink=C.tinta;P.R(s,0,0,42,34,ink);P.R(s,1,1,40,33,'#54465a');P.R(s,1,1,40,6,'#5a4a3a');
        const t=typeof pfLienzo==='function'?pfLienzo('ANTIGUO','#c8b890'):null;if(t){s.globalAlpha=0.75;s.drawImage(t,Math.round((42-t.width)/2),1);s.globalAlpha=1;}
        // vidriera rota: vidrio oscuro con la grieta y el almohadón vacío con su etiqueta VENDIDO
        P.R(s,4,9,34,20,'#2e2c46');P.line(s,10,9,18,18,'#8a8aa8');P.line(s,18,18,14,28,'#8a8aa8');P.line(s,18,18,26,12,'#8a8aa8');
        P.R(s,20,22,14,5,ink);P.R(s,21,23,12,3,'#6a2a4a');P.R(s,21,23,12,1,'#8a4a6a');
        P.R(s,28,16,1,6,'#d8c8a0');P.R(s,24,13,10,4,ink);P.R(s,25,14,8,2,'#e8d8b0');P.R(s,26,14,1,2,'#3a2a1a');P.R(s,28,14,1,2,'#3a2a1a');P.R(s,30,14,2,2,'#3a2a1a');
        P.R(s,0,29,42,5,'#2a2230');},-1,-34);return true;
    case 'mudanza':ESC_sombraContacto(d,x+30,60,g,0.6);spr('mudanza',80,36,mudanza,-1,-34);return true;
    }
    return false; // el resto del decorado (faroles, carteles, persianas, relojes, hidrantes) reacciona a los fantasmas: es de mision9.js
  },
  caja(c,d){return ESC_H.caja(c,d);},
};
ESC_registrar(LV,def);
})();
