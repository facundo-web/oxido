'use strict';
// Óxido · Rescates por contacto, con un gesto de rescate
// A los prisioneros y al gatito se los libera PASANDO por delante (tocándolos, a pie o en la CHATARRA, cualquiera de los
// dos jugadores). Las balas, granadas y explosiones ya no liberan: los atraviesan sin hacerles nada.
// El jugador no se frena: el gesto lo hace el prisionero (~0,5 s), con un destello en la mano del jugador y un "¡CLIC!"
// o "¡ZAS!" chico de la capa de cómic. Lo que lo ata depende del lugar:
//   soga (M1 y por defecto) · esposas (M2, M5, M6) · lianas (M3, M8) · vendas (M4, M10) · cadena con candado (M7, M9).
// El gatito: la puerta de la jaula se abre de golpe y sale de un salto.
// Prefijo RS_.
const RS_ATA={1:'esposas',4:'esposas',5:'esposas',2:'lianas',7:'lianas',3:'vendas',9:'vendas',6:'cadena',8:'cadena'};
const rsAta=()=>RS_ATA[levelIdx]||'soga';
const RS_SON={soga:'zasChico',lianas:'zasChico',vendas:'zasChico',esposas:'clic',cadena:'clic'};
// las dos onomatopeyas chicas del rescate (comic.js)
for(const[n,s]of[['clic','¡CLIC!'],['zasChico','¡ZAS!']])COMIC.registrar(n,{tipo:'onomato',dur:26,
  crear:e=>{e.ang=(Math.random()<0.5?-1:1)*0.12;e.w=pfW(s)+4;e.h=10;},
  draw:e=>{const k=e.t<3?1.2*e.t/3:e.t>e.dur-5?Math.max(0,(e.dur-e.t)/5):1;if(k<=0.02)return;const w=pfW(s);
    ctx.save();ctx.translate(Math.round(e.x),Math.round(e.y-e.t*0.2));ctx.rotate(e.ang);ctx.scale(k,k);
    ctx.drawImage(pfLienzo(s,'#ffffff','#120c18'),-w/2-1,-4);ctx.restore();}});
// al liberar: gesto, destello en la mano del que pasó y la onomatopeya
{const fp0=freePris;freePris=function(pr){if(pr.state!=='tied')return;fp0(pr);
  pr.ata=rsAta();pr.gt=0;pr.gx0=pr.x;pr.gy0=pr.y; // el gesto queda donde estaba atado, aunque él salga corriendo
  const p=nearestPlayer(pr.x+5,pr.y+7),o=p&&(p.ride||p);let hx=pr.x+5,hy=pr.y+7;
  if(o){hx=o.x+(o.w||8)/2+(p.face||1)*4;hy=o.y+(p.ride?10:9);RS_destellos.push({x:hx,y:hy,t:0});}
  // arriba del prisionero va su globito y adelante sigue corriendo el jugador: la onomatopeya va al costado de atrás
  const lado=hx<pr.x+5?1:-1;COMIC.efecto(RS_SON[pr.ata],{x:pr.x+5-lado*17,y:pr.y+3});
  if(pr.ata==='esposas'||pr.ata==='cadena')tone('square',1600,2400,0.03,0.03);else noise(0.08,0.06,3200);};}
// Arriba del que se libera aparece su globito ("¡GRACIAS!", "¡MIAU!"). Los números que flotan (+500 del rescate, +50 del
// premio que deja) subirían justo por ahí y se pisan: cerca de un rescate recién hecho, los puntos van en chapitas al HUD.
function RS_cercaDeRescate(x,y){
  for(const pr of prisoners)if(pr.gt!==undefined&&pr.gt<50&&Math.abs(x-(pr.gx0+5))<34&&y>pr.gy0-34&&y<pr.gy0+24)return true;
  const c=gatoJaula;return!!(c&&c.st!=='shut'&&c.t<50&&Math.abs(x-(c.x+8))<34&&y>c.y-34&&y<c.y+24);
}
ON_STEP.push(()=>{for(let i=parts.length;i--;){const pa=parts[i];if(pa.k!=='txt'||pa.rs||!/^\+\d+$/.test(pa.s))continue;pa.rs=1;
  if(!RS_cercaDeRescate(pa.x,pa.y))continue;parts.splice(i,1);const v=parseInt(pa.s.slice(1),10);
  if(v>0&&typeof RC_soltar==='function')RC_soltar(v,pa.x,pa.y+6);}});
const RS_destellos=[];
ON_STEP.push(()=>{for(const d of RS_destellos)d.t++;for(let i=RS_destellos.length;i--;)if(RS_destellos[i].t>10)RS_destellos.splice(i,1);
  for(const pr of prisoners)if(pr.gt!==undefined)pr.gt++;});
ON_START.push(()=>{RS_destellos.length=0;});
ON_DRAW.push(()=>{
  for(const d of RS_destellos){const k=1-d.t/10;ctx.fillStyle=`rgba(255,250,210,${k})`;ctx.fillRect(q(d.x-0.5),q(d.y-2.5),1,5);ctx.fillRect(q(d.x-2.5),q(d.y-0.5),5,1);
    ctx.fillStyle=`rgba(255,255,255,${k*0.6})`;circle(d.x,d.y,1.5+d.t*0.25);}
  for(const pr of prisoners)if(pr.state!=='tied'&&pr.gt!==undefined&&pr.gt<32)RS_gesto(pr);
});
// lo que lo ata, mientras está atado (lo llama drawPrisoner en aliados.js, en vez de la soga de siempre)
function RS_atado(x,y){
  const a=rsAta();
  if(a==='soga'){ctx.fillStyle='#b08a4a';ctx.fillRect(x,y+7,10,1);ctx.fillRect(x+1,y+10,9,1);return;}
  if(a==='esposas'){ctx.fillStyle='#8a929e';ctx.fillRect(x+2,y+8,2.4,2.4);ctx.fillRect(x+6,y+8,2.4,2.4);ctx.fillStyle='#5a616c';ctx.fillRect(x+4.4,y+9,1.6,0.8);
    ctx.fillStyle='#120c18';ctx.fillRect(x+2.7,y+8.7,1,1);ctx.fillRect(x+6.7,y+8.7,1,1);return;}
  if(a==='lianas'){ctx.fillStyle='#3e6a24';ctx.fillRect(x,y+6,10,1.4);ctx.fillRect(x+1,y+9.5,9,1.4);ctx.fillStyle='#6a9a3a';ctx.fillRect(x+2,y+5.5,1.5,1);ctx.fillRect(x+7,y+10.5,1.5,1);return;}
  if(a==='vendas'){ctx.fillStyle='#e8dcc0';ctx.fillRect(x,y+6,10,2);ctx.fillRect(x+1,y+9.5,9,2);ctx.fillStyle='#b8a888';ctx.fillRect(x+3,y+6,0.6,2);ctx.fillRect(x+6,y+9.5,0.6,2);return;}
  if(a==='cadena'){ctx.fillStyle='#7a828e';for(let i=0;i<5;i++)ctx.fillRect(x+i*2,y+8+(i%2)*0.6,1.6,1);ctx.fillStyle='#d9a43a';ctx.fillRect(x+4,y+9.5,2.4,2);ctx.fillStyle='#120c18';ctx.fillRect(x+4.8,y+10.2,0.8,0.8);
    ctx.strokeStyle='#8a929e';ctx.lineWidth=0.6;ctx.beginPath();ctx.arc(x+5.2,y+9.5,0.9,Math.PI,0);ctx.stroke();}
}
// el gesto al liberarlo (~0,5 s): lo que lo ataba se va según lo que era
function RS_gesto(pr){
  const t=pr.gt,x=pr.gx0??pr.x,y=pr.gy0??pr.y,k=t/32,a=1-k;
  ctx.save();ctx.globalAlpha=Math.max(0,a);
  switch(pr.ata){
  case 'soga': // la soga se desata: dos puntas que caen haciendo ondas
    ctx.strokeStyle='#b08a4a';ctx.lineWidth=0.9;for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(x+5,y+8);
      for(let i=1;i<=6;i++)ctx.lineTo(x+5+s*i*1.6*(1+k),Math.min(y+13.5,y+8+i*0.9*(1+k*2)+Math.sin(t*0.6+i)*0.8));ctx.stroke();}break; // las puntas quedan en el piso
  case 'esposas': // las esposas saltan para los costados
    for(const s of[-1,1]){const ex=x+5+s*(2+t*0.7),ey=y+8-t*0.9+t*t*0.06;ctx.strokeStyle='#8a929e';ctx.lineWidth=0.8;ctx.beginPath();ctx.arc(ex,ey,1.4,t*0.3,t*0.3+Math.PI*1.6);ctx.stroke();}break;
  case 'lianas': // las lianas se cortan y caen en pedazos
    ctx.fillStyle='#3e6a24';for(let i=0;i<5;i++){const ex=x+1+i*2+(i%2?1:-1)*t*0.25,ey=y+7+i%2*3+t*t*0.05;ctx.fillRect(ex,ey,2,1.2);}
    if(t<6){ctx.fillStyle='#ffffff';ctx.fillRect(x-1+t*2,y+7,3,0.6);}break;
  case 'vendas': // las vendas se desenrollan en espiral hacia arriba
    ctx.strokeStyle='#e8dcc0';ctx.lineWidth=1.4;ctx.beginPath();for(let i=0;i<=14;i++){const ang=i*0.55+t*0.25,r=1+i*0.45*(0.4+k);ctx.lineTo(x+5+Math.cos(ang)*r,y+8-i*0.6*(1+k*2)+Math.sin(ang)*r*0.4);}ctx.stroke();break;
  case 'cadena': // el candado se abre y la cadena cae
    ctx.fillStyle='#d9a43a';ctx.fillRect(x+4,y+9.5+t*0.3,2.4,2);ctx.strokeStyle='#8a929e';ctx.lineWidth=0.6;ctx.beginPath();ctx.arc(x+5.2,y+9.5-Math.min(2,t*0.4)+t*0.3,0.9,Math.PI,0);ctx.stroke();
    ctx.fillStyle='#7a828e';for(let i=0;i<5;i++)ctx.fillRect(x+i*2+(i-2)*t*0.15,y+8+t*t*0.05+i%2,1.6,1);break;
  }
  ctx.restore();
}
// ---------- la jaula del gatito: la puerta se abre de golpe ----------
let RS_puerta=null;
{const cf0=CAT_free;CAT_free=function(){const c=gatoJaula;if(!c||c.st!=='shut')return;cf0();
  RS_puerta={x:c.x+15,y:c.y+2,vx:2.2,vy:-2.4,rot:0,t:0};const p=nearestPlayer(c.x+8,c.y+7),o=p&&(p.ride||p),lado=o&&o.x+(o.w||8)/2>c.x+8?-1:1;COMIC.efecto('clic',{x:c.x+8-lado*24,y:c.y+6});tone('square',1400,2200,0.03,0.03);};}
ON_STEP.push(()=>{const d=RS_puerta;if(!d)return;d.t++;d.vy+=0.22;d.x+=d.vx;d.y+=d.vy;d.rot+=0.35;if(d.y>GROUND-2){d.y=GROUND-2;d.vx*=0.6;d.vy*=-0.3;}if(d.t>60)RS_puerta=null;});
ON_START.push(()=>{RS_puerta=null;});
ON_DRAW.push(()=>{const d=RS_puerta;if(!d)return;ctx.save();ctx.globalAlpha=Math.min(1,(60-d.t)/15);ctx.translate(d.x,d.y);ctx.rotate(d.rot);
  ctx.fillStyle='#5a3a22';ctx.fillRect(-1,-5,2,10);ctx.fillStyle='rgba(190,196,206,0.9)';for(let i=-4;i<=4;i+=2.5)ctx.fillRect(-0.4,i,0.8,1.6);ctx.restore();});
