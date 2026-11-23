'use strict';
// Óxido · Caminos en capas de la MISIÓN 2 (Puerto Ceniza), la misión de prueba. Prefijo CA2_. Usa caminos.js.
// ARRIBA: por los brazos de las grúas (contenedores colgados como escalones y la viga larga). Dos tramos: antes del
//   jefe chico (entrada en x≈520) y entre la emboscada y el villano (entrada en x≈2600; ningún escalón dentro de una arena). Armas y munición, soldados y drones.
// ABAJO: debajo del muelle, entre el jefe chico y la emboscada (x 1430–1900). Se entra por el hueco con luz y cartel
//   (x 1438) y se sale por el otro hueco (x 1846) nadando hasta la superficie y saltando. Vida extra, corazones, un
//   prisionero escondido entre los pilotes y minas atadas al fondo.
// MEDIO: el muelle de siempre; siempre se puede terminar. Todo se junta antes de cada jefe.
{
const L2=LEVELS[1],Y0=GROUND;
L2.caminos={yMin:-180,yMax:Y0+106,
  bajos:[{x0:1430,x1:1900,piso:Y0+98,sup:Y0+12}],
  huecos:[{x:1438,w:20,ent:true},{x:1846,w:22}],
  altos:[{x0:520,x1:1014,sube:510},{x0:2600,x1:2950,sube:2588}],
  minas:[{x:1494,y:Y0+60},{x:1562,y:Y0+40},{x:1640,y:Y0+78},{x:1730,y:Y0+48},{x:1806,y:Y0+66}],
  premios:[{x:1520,y:Y0+98,kind:'C'},{x:1604,y:Y0+98,kind:'V'},{x:1778,y:Y0+98,kind:'C'},
    {x:700,y:-12,kind:'G'},{x:2800,y:-12,kind:'G'}],
  cajas:[{x:744,y:-12,drop:'?'},{x:980,y:-10,drop:'?'},{x:2770,y:-12,drop:'?'},{x:2905,y:-22,drop:'?'}]};
// escalones (contenedores colgados) y vigas de las grúas
const G=(x,y,w,cuelga)=>({x,y,w,ca:'grua',cuelga:!!cuelga});
L2.platforms.push(
  G(520,108,28,1),G(556,78,28,1),G(592,48,30,1),G(630,18,30,1),G(668,-12,140),G(838,-22,80),G(944,-10,70),
  G(2600,108,26,1),G(2636,78,28,1),G(2672,48,28,1),G(2708,18,28,1),G(2744,-12,110),G(2880,-22,70));
// ARPÓN (arpon.js): tres lugares posibles (arriba de un contenedor, en el fondo del agua y en la viga de arriba)
L2.arponSitios=[{x:1345,y:110},{x:1660,y:Y0+98},{x:880,y:-22}];
// la ZONA SECRETA: una sala de chapa colgada sobre el muelle (x 1650–1820). Su argolla cuelga del piso, en y −54: desde
// el muelle no se llega ni con doble salto ni con la CHATARRA (techo de vuelo y = 8, y al bajarse en el techo el salto
// no pasa de y ≈ −41). Adentro: dos premios y el ENGRANAJE DORADO arriba de todo.
L2.secreta={x0:1650,x1:1820,top:-160,piso:{x:1650,y:-60,w:170},plats:[{x:1672,y:-92,w:30},{x:1730,y:-118,w:34},{x:1790,y:-90,w:26}],
  premios:[{x:1690,y:-60,kind:'H'},{x:1800,y:-90,kind:'C'}],gear:{x:1747,y:-118}};
// argollas: la secreta y tres TRAMPA con premios chicos (una justo antes de la secreta: si gastás ahí los dos tiros, no hay secreto)
L2.argollas=[{x:1700,y:-54,tipo:'secreto'},{x:300,y:46,tipo:'trampa',premio:'C'},{x:1566,y:50,tipo:'trampa',premio:'G'},{x:2990,y:46,tipo:'trampa',premio:'G'}];
// el prisionero escondido entre los pilotes (nunca amigo: da su premio)
L2.prisoners.push({x:1700,y:Y0+98,k:'item'});
// enemigos de arriba (soldados en las vigas y drones a esa altura; no disparan si nadie anda por arriba)
L2.events.push(
  {at:430,spawn:[{t:'soldier',x:760,y:-30},{t:'drone',x:'R',y:-50,d:50}]},
  {at:640,spawn:[{t:'soldier',x:880,y:-40},{t:'soldier',x:980,y:-28,d:30}]},
  {at:2500,spawn:[{t:'soldier',x:2800,y:-30},{t:'drone',x:'R',y:-50,d:60}]},
  {at:2640,spawn:[{t:'soldier',x:2910,y:-40},{t:'drone',x:'R',y:-58,d:40}]});
L2.events.sort((a,b)=>a.at-b.at);

// ================== dibujo ==================
// cielo de arriba y fondo de abajo (más allá de lo que pinta el fondo de la misión)
const bg0=L2.drawBG;
L2.drawBG=function(){
  const C=L2.caminos;
  ctx.fillStyle='#060a16';ctx.fillRect(0,C.yMin-2,W,-C.yMin+3);
  for(let i=0;i<34;i++){const h=hash(i*19+5);ctx.fillStyle=`rgba(220,230,255,${0.25+h*0.5})`;ctx.fillRect(((i*53-camX*0.02)%W+W)%W,C.yMin+hash(i*7)*(-C.yMin),0.8,0.8);}
  // arriba, el fondo acompaña a medias (la luna y la ciudad no quedan por debajo del jugador)
  const sube=camY<0?camY*0.6:0;
  ctx.save();ctx.translate(0,sube);bg0();ctx.restore();
  ctx.fillStyle='#10141b';ctx.fillRect(0,H-1+sube,W,C.yMax-H+2-sube);
};
// torres de las grúas (atrás de las vigas), del piso hasta arriba
const TORRES=[700,1000,2760,2930];window.CA2_TORRES=TORRES; // el escenario Hondo (escenario-m2.js) las dibuja a su manera
function CA2_torre(x){
  ctx.fillStyle='#2e2a20';ctx.fillRect(x,-44,2,Y0+44);ctx.fillRect(x+12,-44,2,Y0+44);
  ctx.strokeStyle='#2e2a20';ctx.lineWidth=0.8;ctx.beginPath();for(let y=-44;y<Y0;y+=14){ctx.moveTo(x+1,y);ctx.lineTo(x+13,y+14);ctx.moveTo(x+13,y);ctx.lineTo(x+1,y+14);}ctx.stroke();
  ctx.fillStyle='#3a3426';ctx.fillRect(x-4,-48,22,5);ctx.fillStyle='#ff5a3c';if((T>>5)%2)ctx.fillRect(x+6,-51,2,2);
}
// vigas y contenedores colgados
L2.drawPlat=(d0=>pl=>{
  if(pl.ca!=='grua')return d0?d0(pl):false;
  if(pl.cuelga){ // contenedor colgado de un cable
    ctx.strokeStyle='#1c1a14';ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(pl.x+4,pl.y);ctx.lineTo(pl.x+pl.w/2,pl.y-12);ctx.lineTo(pl.x+pl.w-4,pl.y);ctx.moveTo(pl.x+pl.w/2,pl.y-12);ctx.lineTo(pl.x+pl.w/2,-60);ctx.stroke();
    const c=['#8c3b2a','#2f6a8a','#b07a2a','#3a7a4a'][(pl.x/7|0)%4];
    ctx.fillStyle=c;ctx.fillRect(pl.x,pl.y,pl.w,12);ctx.fillStyle='rgba(0,0,0,0.3)';for(let x=pl.x+2;x<pl.x+pl.w-1;x+=3)ctx.fillRect(x,pl.y+2,1,9);
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillRect(pl.x,pl.y,pl.w,0.8);return true;}
  // viga de grúa: cordón de arriba, celosía y cordón de abajo
  ctx.fillStyle='#c9a43a';ctx.fillRect(pl.x,pl.y,pl.w,2);ctx.fillRect(pl.x,pl.y+6,pl.w,1.4);
  ctx.strokeStyle='#a8862a';ctx.lineWidth=0.8;ctx.beginPath();for(let x=pl.x;x<pl.x+pl.w-4;x+=8){ctx.moveTo(x,pl.y+2);ctx.lineTo(x+4,pl.y+6);ctx.lineTo(x+8,pl.y+2);}ctx.stroke();
  ctx.fillStyle='#fff0b0';ctx.fillRect(pl.x,pl.y,pl.w,0.6);
  ctx.fillStyle='#1c1a14';for(let x=pl.x+3;x<pl.x+pl.w;x+=10)ctx.fillRect(x,pl.y+0.6,0.8,0.8);
  return true;})(L2.drawPlat);
// piso: debajo del muelle (agua, pilotes, fondo) y los huecos de la tabla
const dg0=drawGround;
drawGround=function(){
  if(L!==L2){dg0();return;}
  const C=L2.caminos;
  if(!(typeof ESC_activo==='function'&&ESC_activo()))for(const x of TORRES)if(x>camX-20&&x<camX+VW+20)CA2_torre(x);
  dg0();
  // tierra firme debajo del muelle (donde no hay agua), hasta el fondo del mundo
  ctx.fillStyle='#1d2128';ctx.fillRect(Math.floor(camX)-10,H-1,VW+20,C.yMax-H+2);
  for(const b of C.bajos){if(b.x1<camX-10||b.x0>camX+VW+10)continue;
    if(L2.drawBajo&&L2.drawBajo(b))continue; // el escenario Hondo dibuja lo de abajo del muelle a su manera (escenario-base.js)
    const x0=b.x0,w=b.x1-b.x0;
    const g=ctx.createLinearGradient(0,GROUND,0,b.piso);g.addColorStop(0,'#123248');g.addColorStop(1,'#061019');
    ctx.fillStyle=g;ctx.fillRect(x0,GROUND+CA_DECK,w,b.piso-GROUND-CA_DECK);
    // haces de luz que bajan por los huecos
    for(const h of C.huecos){if(h.x<x0||h.x>b.x1)continue;ctx.fillStyle='rgba(180,220,255,0.07)';ctx.beginPath();ctx.moveTo(h.x,b.sup);ctx.lineTo(h.x+h.w,b.sup);ctx.lineTo(h.x+h.w+16,b.piso);ctx.lineTo(h.x-16,b.piso);ctx.closePath();ctx.fill();}
    // pilotes
    for(let x=x0+14;x<b.x1;x+=34){ctx.fillStyle='#1b2630';ctx.fillRect(x,GROUND+CA_DECK,5,b.piso-GROUND-CA_DECK);ctx.fillStyle='#24323e';ctx.fillRect(x,GROUND+CA_DECK,1,b.piso-GROUND-CA_DECK);
      ctx.fillStyle='rgba(60,110,70,0.5)';ctx.fillRect(x-1,b.piso-14-(x%7),7,3);}
    // fondo: barro y piedras
    ctx.fillStyle='#2a2418';ctx.fillRect(x0,b.piso,w,C.yMax-b.piso);ctx.fillStyle='#3a3220';ctx.fillRect(x0,b.piso,w,1.2);
    for(let x=x0+6;x<b.x1;x+=23){const h=hash(x);if(h<0.4)continue;ctx.fillStyle='#4a4232';ctx.beginPath();ctx.ellipse(x,b.piso+1,2+h*3,1.4,0,0,7);ctx.fill();}
    // paredes del tramo
    ctx.fillStyle='#14181e';ctx.fillRect(x0-3,GROUND,3,C.yMax-GROUND);ctx.fillRect(b.x1,GROUND,3,C.yMax-GROUND);
    // superficie del agua (se ve en los huecos) y una línea que se mueve
    ctx.strokeStyle='rgba(170,210,240,0.35)';ctx.lineWidth=0.6;ctx.beginPath();for(let x=x0;x<b.x1;x+=4){const y=b.sup+Math.sin(T/20+x/9)*0.6;if(x===x0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
    // tabla del muelle por debajo (grosor) con vigas
    ctx.fillStyle='#2b3038';ctx.fillRect(x0,GROUND+1.5,w,CA_DECK-1.5);ctx.fillStyle='#1d2128';for(let x=x0;x<b.x1;x+=12)ctx.fillRect(x,GROUND+1.5,0.8,CA_DECK-1.5);
  }
  // huecos: agujero en la tabla, bordes con franjas y la luz/cartel de la entrada
  for(const h of C.huecos){if(h.x+h.w<camX-30||h.x>camX+VW+30)continue;const b=CA_bajo(h.x+h.w/2);
    ctx.fillStyle='#08141e';ctx.fillRect(h.x,GROUND,h.w,(b?b.sup:GROUND+12)-GROUND);
    for(let i=0;i<2;i++){const ex=i?h.x+h.w-2:h.x;for(let y=0;y<3;y++){ctx.fillStyle=(y+i)%2?'#c9a43a':'#1c1a14';ctx.fillRect(ex,GROUND+y*2.4,2,2.4);}}
    if(h.ent)CA2_cartel(h.x-8,'↓','140,210,255',h.x+h.w/2);}
  // entradas de arriba: cartel con luz
  for(const a of C.altos){const x=a.sube;if(x<camX-30||x>camX+VW+30)continue;CA2_cartel(x+8,'↑','255,214,120',null);}
};
// cartel de entrada a un desvío: poste, tablero con marco, flecha grande que late y un cono de luz (al hueco o hacia arriba)
function CA2_cartel(x,flecha,col,luzX){
  const on=0.5+0.5*Math.sin(T/10),y=GROUND-44;
  if(luzX!==null){ctx.fillStyle=`rgba(${col},${0.10+0.08*on})`;ctx.beginPath();ctx.moveTo(x+4,y+16);ctx.lineTo(luzX+12,GROUND+2);ctx.lineTo(luzX-12,GROUND+2);ctx.closePath();ctx.fill();}
  else{ctx.fillStyle=`rgba(${col},${0.08+0.06*on})`;ctx.beginPath();ctx.moveTo(x-6,y);ctx.lineTo(x-22,y-60);ctx.lineTo(x+22,y-60);ctx.lineTo(x+6,y);ctx.closePath();ctx.fill();}
  ctx.fillStyle=`rgba(${col},${0.14*on})`;circle(x,y+7,16);
  ctx.fillStyle='#2a2e36';ctx.fillRect(x-1,y+14,2,GROUND-y-14);
  ctx.fillStyle='#0e1116';ctx.fillRect(x-11,y-2,22,17);ctx.strokeStyle=`rgb(${col})`;ctx.lineWidth=1;ctx.strokeRect(x-10.5,y-1.5,21,16);
  txt(flecha,x,y+(flecha==='↓'?-1+on*1.5:0.5-on*1.5),16,`rgb(${col})`,'center',false);
}
// el prisionero escondido: burbujitas que suben entre los pilotes (la pista)
ON_DRAW.push(()=>{if(L!==L2)return;for(const pr of prisoners){if(pr.y<GROUND||pr.state!=='tied'||pr.x<camX-20||pr.x>camX+VW+20)continue;
  for(let i=0;i<3;i++){const ph=((T+i*23)%70)/70;ctx.fillStyle=`rgba(200,235,255,${0.6*(1-ph)})`;ctx.fillRect(q(pr.x+5+Math.sin(ph*8+i)*1.5),q(pr.y-ph*40),1,1);}}});
}
