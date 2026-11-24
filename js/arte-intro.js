'use strict';
// Óxido · Arte de la INTRODUCCIÓN jugable de la Misión 1 (va ANTES de intro.js)
// Siete objetos inofensivos de la Zona Óxido, en pixel con contorno de tinta y chatarra, que enseñan un control cada
// uno: IN_ARTE={obstaculo, caja, dron, porton, barricada, blanco, senal}. Cada función dibuja en coordenadas del mundo
// (ctx ya con la cámara) dentro de la caja {x,y,w,h} del objeto o, con los campos que pasa intro.js:
//   obstaculo (22×14): montón bajo de cubiertas con una tabla de peligro: "saltame".
//   caja (18×20) + o.muro {x,w,yTop}: caja de práctica (con un blanco pintado) en un hueco del muro de chapa que sube
//        hasta arriba. o.hp 3..0 = abolladuras · o.flash.
//   dron (14×10): dron de práctica SIN armas, cara simpática y oxidado, con un cable que cuelga hasta o.cable {x,y}
//        (sostiene el portón). o.flash.
//   porton (14 × del piso hasta arriba): portón de chapa ondulada que sostiene el cable. o.abre 0..1: se levanta.
//   barricada (20×24) + o.muro: vigas cruzadas con una granada pintada ("esto necesita algo más grande"). o.golpe 0..1
//        tiembla y chispea sin romperse · o.rota: quedan los restos.
//   blanco (10×20): muñeco de lata en una estaca, con chapa brillante (las balas rebotan). o.caido 0..1: se cae.
//   senal (8×40): poste con farol de dos luces. o.on false = verde (zona segura) · true = roja (combate), con brillo.
// No son enemigos ni hacen daño. Prefijo IA_.
const IA_TINTA='#120c18';
// rasterizado a 1 px por unidad con contorno de tinta (como arte-vehiculos.js, propio para no depender del orden)
function IA_ras(w,h,ops,blanco){
  const P=2,W2=w+2*P,H2=h+2*P,px=new Array(W2*H2).fill(null);
  const set=(x,y,c)=>{x=Math.floor(x)+P;y=Math.floor(y)+P;if(x>=0&&y>=0&&x<W2&&y<H2)px[y*W2+x]=c;};
  for(const o of ops){const c=o[1];
    if(o[0]==='r'){for(let y=o[3];y<o[3]+o[5];y++)for(let x=o[2];x<o[2]+o[4];x++)set(x,y,c);}
    else if(o[0]==='e'){const[,,cx,cy,rx,ry]=o;for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++)
      if(((x+0.5-cx)/rx)**2+((y+0.5-cy)/ry)**2<=1)set(x,y,c);}
    else if(o[0]==='p'){const pts=o[2];let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const[a,b]of pts){x0=Math.min(x0,a);x1=Math.max(x1,a);y0=Math.min(y0,b);y1=Math.max(y1,b);}
      for(let y=Math.floor(y0);y<=y1;y++)for(let x=Math.floor(x0);x<=x1;x++){const X=x+0.5,Y=y+0.5;let ins=false;
        for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[xi,yi]=pts[i],[xj,yj]=pts[j];if((yi>Y)!==(yj>Y)&&X<(xj-xi)*(Y-yi)/(yj-yi)+xi)ins=!ins;}
        if(ins)set(x,y,c);}}
    else if(o[0]==='l'){const[,,x0,y0,x1,y1]=o,n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let i=0;i<=n;i++)set(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,c);}
    else if(o[0]==='d'){for(const[x,y]of o[2])set(x,y,c);}}
  const cv=document.createElement('canvas');cv.width=W2;cv.height=H2;const g=cv.getContext('2d');
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){const c=px[y*W2+x];
    if(c){g.fillStyle=blanco&&c!==IA_TINTA?'#ffffff':c;g.fillRect(x,y,1,1);}
    else if((x>0&&px[y*W2+x-1])||(x<W2-1&&px[y*W2+x+1])||(y>0&&px[(y-1)*W2+x])||(y<H2-1&&px[(y+1)*W2+x])){g.fillStyle=IA_TINTA;g.fillRect(x,y,1,1);}}
  return cv;
}
const IA_CACHE=new Map();
const IA_lienzo=(k,w,h,fops,bl)=>{const kk=k+(bl?'|b':'');let c=IA_CACHE.get(kk);if(!c){c=IA_ras(w,h,fops(),bl);IA_CACHE.set(kk,c);}return c;};
const IA_pon=(c,x,y)=>ctx.drawImage(c,Math.round(x)-2,Math.round(y)-2);
// muro de chapa remachada desde yTop hasta y1 (planchas de 12 de alto, una mancha de óxido cada tanto, siempre igual)
function IA_muro(m,y1){
  if(!m)return;const x=Math.round(m.x),w=Math.round(m.w),y0=Math.round(m.yTop);if(y1<=y0)return;
  ctx.fillStyle=IA_TINTA;ctx.fillRect(x-1,y0,w+2,y1-y0);
  for(let y=y0,i=0;y<y1;y+=12,i++){const h=Math.min(12,y1-y);
    ctx.fillStyle=i%2?'#5c5f70':'#676a7a';ctx.fillRect(x,y,w,h-1);
    ctx.fillStyle='#8a8e9a';ctx.fillRect(x,y,w,1);
    ctx.fillStyle='#3a3c48';ctx.fillRect(x,y+h-1,w,1);
    ctx.fillStyle='#c8ccd4';ctx.fillRect(x+1,y+2,1,1);ctx.fillRect(x+w-2,y+2,1,1);
    const r=hash(Math.floor(y/12)*7+x);if(r<0.55){ctx.fillStyle='#8a4a2a';ctx.fillRect(x+2+Math.floor(r*(w-6)),y+4,3,2+Math.floor(r*4));}}
}
// chispas sin estado (salen de t)
function IA_chispas(x,y,t,n){for(let i=0;i<n;i++){const h=hash(t*13+i*7),a=h*6.28,r=2+hash(t+i)*4;
  ctx.fillStyle=i%2?'#ffd25a':'#fff6c8';ctx.fillRect(Math.round(x+Math.cos(a)*r),Math.round(y+Math.sin(a)*r),1,1);}}
const IA_T=()=>typeof T==='number'?T:0;

const IN_ARTE={
  // 1 · montón bajo de cubiertas con una tabla a rayas de peligro arriba: se lee como "saltame"
  obstaculo(o){
    const c=IA_lienzo('obst',22,14,()=>{const op=[
      ['r','#1e1c22',1,10,20,4],['r','#2e2b34',1,10,20,1],          // cubierta de abajo
      ['r','#1e1c22',3,6,16,4],['r','#2e2b34',3,6,16,1],            // cubierta del medio
      ['d','#4a4652',[[3,12],[6,12],[9,12],[12,12],[15,12],[18,12],[5,8],[8,8],[11,8],[14,8],[17,8]]], // dibujo de la goma
      ['p','#8a6a3a',[[0,4],[22,2],[22,5],[0,6]]]];                 // tabla
      for(let i=0;i<5;i++)op.push(['p',i%2?'#1d1a1c':'#e8c040',[[i*4.4,4-i*0.4],[i*4.4+4.4,3.6-i*0.4],[i*4.4+4.4,5.6-i*0.4],[i*4.4,6-i*0.4]]]);
      op.push(['r','#7d8794',2,0,2,4],['r','#7d8794',18,0,2,3]);    // dos fierros que asoman
      return op;});
    IA_pon(c,o.x,o.y);
  },
  // 2 · caja de práctica en un hueco del muro (el muro sube hasta arriba de la pantalla)
  caja(o){
    IA_muro(o.muro,Math.round(o.y));
    if(o.rota){ // rota: el hueco queda libre; solo astillas chatas en el piso (nada que parezca pared ni caja)
      const c=IA_lienzo('caja-rota',18,20,()=>[
        ['r','#8a5a2a',0,18,5,2],['r','#b07a3a',6,19,6,1],['r','#6a4220',13,18,5,2],['d','#d8a060',[[2,18],[8,19],[15,18]]],['r','#f4e7c6',10,18,2,1]]);
      IA_pon(c,o.x,o.y);return;}
    const ab=Math.max(0,3-Math.round(o.hp??3)),fl=o.flash>0;
    const c=IA_lienzo('caja'+ab,18,20,()=>{const op=[
      ['r','#8a5a2a',0,0,18,20],['r','#b07a3a',1,1,16,18],
      ['r','#6a4220',0,0,18,2],['r','#6a4220',0,18,18,2],['r','#6a4220',0,0,2,20],['r','#6a4220',16,0,2,20],
      ['l','#6a4220',2,2,15,17],
      ['e','#f4e7c6',9,10,5,5],['e','#d93a2b',9,10,3.5,3.5],['e','#f4e7c6',9,10,2,2],['e','#d93a2b',9,10,1,1]]; // blanco pintado
      const ab0=[[4,5],[13,14],[12,4]];for(let i=0;i<ab;i++){const[x,y]=ab0[i];op.push(['r','#4a2e14',x,y,3,2],['r','#d8a060',x,y+2,3,1]);}
      if(ab>=3)op.push(['l','#3a2410',2,9,16,12]);                 // rajadura
      return op;},fl);
    IA_pon(c,o.x,o.y);
  },
  // 3 · dron de práctica: cara simpática, sin armas, con rayas de práctica y un cable que sostiene el portón
  dron(o){
    const t=IA_T(),x=Math.round(o.x),y=Math.round(o.y+Math.sin(t/12)),fl=o.flash>0;
    if(o.cable){ // cable con panza, desde abajo del dron hasta el portón
      const x0=x+7,y0=y+10,x1=o.cable.x,y1=o.cable.y,mx=(x0+x1)/2,my=Math.max(y0,y1)+6;
      ctx.lineWidth=2;ctx.strokeStyle=IA_TINTA;ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(mx,my,x1,y1);ctx.stroke();
      ctx.lineWidth=1;ctx.strokeStyle='#8a8e9a';ctx.stroke();ctx.fillStyle='#e8c040';ctx.fillRect(Math.round(x1)-1,Math.round(y1)-1,3,3);}
    const c=IA_lienzo('dron',14,10,()=>[
      ['r','#2a2a30',0,1,14,1],['r','#2a2a30',1,0,1,2],['r','#2a2a30',12,0,1,2],     // brazos de las hélices
      ['e','#7d8794',7,6,5,3.5],['r','#e8c040',3,8,8,1],['d','#1d1a1c',[[4,8],[7,8],[10,8]]],
      ['e','#f4e7c6',7,5.5,2.5,2],['r','#1a1a20',7,5,1,1],                             // ojo grande
      ['r','#1a1a20',5,8,1,1],['r','#1a1a20',9,8,1,1],                                 // sonrisa
      ['r','#8a4a2a',3,4,1,1],['r','#8a4a2a',11,6,1,1],                                // manchas de óxido
      ['r','#5c5f70',6,9,2,1]],fl);
    IA_pon(c,x,y);
    const r=(t>>1)%2?6:3;ctx.fillStyle='rgba(225,225,235,0.75)';ctx.fillRect(x+1.5-r/2,y-1,r,1);ctx.fillRect(x+12.5-r/2,y-1,r,1);
    if(fl)IA_chispas(x+7,y+5,t,4);
  },
  // 4 · portón de chapa ondulada: o.abre lo levanta (queda colgado arriba)
  porton(o){
    const x=Math.round(o.x),w=Math.round(o.w),top=Math.round(o.y),h=Math.round(o.h),k=Math.max(0,Math.min(1,o.abre||0));
    const alto=Math.max(4,Math.round(h*(1-k))),y1=top+alto;
    ctx.fillStyle=IA_TINTA;ctx.fillRect(x-1,top,w+2,alto+1);
    for(let i=0;i<w;i++){ctx.fillStyle=i%3===0?'#4a4c58':i%3===1?'#7d8794':'#5c5f70';ctx.fillRect(x+i,top,1,alto);} // ondas verticales
    ctx.fillStyle='#3a3c48';for(let y=y1-14;y>top;y-=16)ctx.fillRect(x,y,w,2);                                 // refuerzos
    for(let i=0;i<w;i+=4){ctx.fillStyle=(i/4)%2?'#1d1a1c':'#e8c040';ctx.fillRect(x+i,y1-3,Math.min(4,w-i),3);} // borde de peligro abajo
    ctx.fillStyle=IA_TINTA;ctx.fillRect(x-1,y1,w+2,1);
    if(k<1){ctx.fillStyle='#c8ccd4';ctx.fillRect(x+Math.floor(w/2)-1,y1-8,3,3);ctx.fillStyle=IA_TINTA;ctx.fillRect(x+Math.floor(w/2),y1-7,1,1);} // argolla del cable
  },
  // 5 · barricada de vigas cruzadas con una granada pintada: los tiros solo la hacen temblar y chispear
  barricada(o){
    IA_muro(o.muro,Math.round(o.y));
    const t=IA_T();
    if(o.rota){
      const c=IA_lienzo('barr-rota',20,24,()=>[
        ['p','#3a3c48',[[0,24],[4,21],[9,22],[13,20],[17,22],[20,24]]],['l','#8a4a2a',2,23,10,21],['l','#5c5f70',9,23,18,21], // restos chatos: se ve que se pasa
        ['r','#7d8794',4,22,3,1],['r','#8a6a3a',13,22,4,1]]);
      IA_pon(c,o.x,o.y);
      if((t>>2)%3===0){ctx.fillStyle='rgba(110,104,112,0.6)';ctx.fillRect(Math.round(o.x+8+Math.sin(t/7)*2),Math.round(o.y+12-(t%30)/3),3,3);}
      return;}
    const g=Math.max(0,Math.min(1,o.golpe||0)),dx=g>0?Math.round(Math.sin(t*1.7)*g*1.5):0;
    const c=IA_lienzo('barr',20,24,()=>[
      ['r','#3a3c48',0,0,20,24],['r','#4a4c58',1,1,18,22],
      ['p','#5c5f70',[[0,0],[4,0],[20,20],[20,24],[16,24],[0,4]]],['p','#5c5f70',[[16,0],[20,0],[20,4],[4,24],[0,24],[0,20]]], // vigas en X
      ['r','#c8ccd4',1,1,1,1],['r','#c8ccd4',18,1,1,1],['r','#c8ccd4',1,22,1,1],['r','#c8ccd4',18,22,1,1],                  // remaches
      ['e','#e8c040',10,12,5,5],['e','#1d1a1c',10,12.5,3.5,3.5],['r','#3a3c48',9,6,2,3],['r','#ffb35a',10,5,1,1],          // granada pintada en un círculo amarillo
      ['r','#e8c040',0,22,20,2],['d','#1d1a1c',[[2,22],[3,23],[6,22],[7,23],[10,22],[11,23],[14,22],[15,23],[18,22],[19,23]]]]);
    IA_pon(c,o.x+dx,o.y);
    if(g>0)IA_chispas(o.x+10+dx,o.y+10,t,Math.ceil(g*5));
  },
  // 6 · muñeco de lata en una estaca, con chapa brillante en el pecho (las balas rebotan). o.caido lo tumba hacia atrás
  blanco(o){
    const k=Math.max(0,Math.min(1,o.caido||0)),bx=o.x+5,by=o.y+o.h;
    const c=IA_lienzo('blanco',10,20,()=>[
      ['r','#6a4220',4,13,2,7],                                                   // estaca
      ['e','#7d8794',5,8,4.5,5],['r','#c8ccd4',2,6,6,4],['r','#ffffff',3,6,1,3],    // torso con chapa brillante
      ['e','#d93a2b',5,8,1.5,1.5],['e','#f4e7c6',5,8,0.7,0.7],                     // blanco chiquito
      ['e','#8a96a4',5,2,3,2.5],['r','#1a1a20',4,2,1,1],['r','#1a1a20',6,2,1,1],    // cabeza de lata con ojos de remache
      ['r','#8a4a2a',1,10,1,2],['r','#5c5f70',0,7,1,3],['r','#5c5f70',9,7,1,3]]);   // brazos cortos
    ctx.save();ctx.translate(bx,by);if(k)ctx.rotate(k*Math.PI/2);IA_pon(c,-5,-20);ctx.restore();
  },
  // 7 · poste con farol de dos luces: verde = zona segura, roja (con brillo que late) = empieza el combate
  senal(o){
    const x=Math.round(o.x),y=Math.round(o.y),on=!!o.on,t=IA_T();
    const c=IA_lienzo('senal',8,40,()=>[
      ['r','#3a3c48',3,12,2,28],['r','#5c5f70',3,12,1,28],['r','#2a2a30',1,37,6,3],  // poste y pie
      ['r','#2a2a30',0,0,8,13],['r','#3a3c48',1,1,6,11],                             // caja del farol
      ['r','#2a2a30',0,3,1,2],['r','#2a2a30',7,3,1,2],['r','#2a2a30',0,8,1,2],['r','#2a2a30',7,8,1,2], // viseras
      ['r','#e8c040',2,14,4,1],['r','#1d1a1c',2,15,4,1],['r','#e8c040',2,16,4,1]]);  // franja de peligro
    IA_pon(c,x,y);
    const luz=(cy,col,prendida)=>{ctx.fillStyle=prendida?col:'#1e1c22';ctx.fillRect(x+2,y+cy,4,3);
      if(prendida){ctx.fillStyle='rgba(255,255,255,0.6)';ctx.fillRect(x+2,y+cy,1,1);}};
    luz(2,'#7dff9a',!on);luz(7,'#ff3b30',on);
    if(on){const a=0.25+0.15*Math.sin(t/5);ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,80,60,${a.toFixed(2)})`;
      ctx.beginPath();ctx.arc(x+4,y+8.5,6+Math.sin(t/5),0,Math.PI*2);ctx.fill();ctx.restore();}
  }
};
