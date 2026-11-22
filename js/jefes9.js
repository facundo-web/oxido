'use strict';
// Óxido · Misión 9: jefe chico (LA LUMBRERA) y villano (EL CASERO)
// Todo con prefijo J9_. Usa lo de mision9.js (M9_, fantasmas, mansión).
// Igual que los fantasmas de la misión, los jefes pueden ponerse translúcidos: mientras lo están, su caja
// se corre lejos (x=-9999) y nada les pega; se ve el dibujo, pero las balas lo atraviesan.

const J9_sfx=(n,...a)=>{if(typeof SFX!=='undefined'&&SFX[n])SFX[n](...a);};
function J9_tang(b,on){if(on){b.x=b.bx;b.y=b.by;}else{b.x=-9999;b.y=M9_HIDE;}b.solid=on;}

// =====================================================================
// JEFE CHICO · LA LUMBRERA — una araña de cristal (candelabro de techo) poseída
// Cuelga de una cadena que se pierde arriba. Cinco velas lilas, lágrimas de cristal y una cara pálida en el globo.
// · Lágrimas: tiembla, los cristales brillan y se marcan rayas en el piso; tira cristales en arco a esas marcas.
// · Velas: las velas se avivan y larga un abanico de llamas lilas (se esquivan o se revientan a tiros).
// · Caída: se pone arriba tuyo, marca un círculo en el piso, la cadena cruje y cae; queda en el piso un rato.
// Rabia al 50 %: más cristales y llamas, y entre ataque y ataque se vuelve translúcida y cruza la arena.
// =====================================================================
function J9_mkLum(A){return{type:'j9Lum',isBoss:true,air:true,A,x:A+140,y:-60,bx:A+140,by:-60,w:40,h:24,cx:A+160,cy:-60,
  hp:130,max:130,state:'enter',t:0,mt:0,face:-1,flash:0,score:3500,mode:'hover',cd:60,seq:0,rage:false,marks:[],flare:0,shk:0,
  alpha:1,tx:0,vy:0,solid:true,noPush:true,touch:1,upd:J9_updLum,draw:J9_drawLum};}
function J9_lumBox(b){b.bx=b.cx-20;b.by=b.cy;}
function J9_shard(sx,sy,tx,Tt){const g=0.14;eproj.push({kind:'j9Cristal',x:sx,y:sy,vx:(tx-sx)/Tt,vy:(GROUND-3-sy-0.5*g*Tt*Tt)/Tt,g,r:1.8,t:0,tx,upd:J9_shardUpd,draw:J9_shardDraw});}
function J9_shardUpd(o,hb){
  o.t++;o.vy+=o.g;o.x+=o.vx;o.y+=o.vy;
  if(hb&&overlapPt(hb,o.x,o.y,o.r)){hurtPlayer(1);o.gone=true;M9_glint(o.x,o.y,4);J9_sfx('m9Cristal');return;}
  if(o.y>=GROUND-3){o.gone=true;J9_sfx('m9Cristal');
    for(let i=0;i<6;i++)parts.push({k:'p',x:o.x,y:GROUND-2,vx:rand(-1.4,1.4),vy:rand(-1.8,-0.4),g:0.15,life:rand(14,22),maxl:22,size:1,col:i%2?'#e8fbff':M9_CEL});
    if(hb&&Math.abs(hb.x+hb.w/2-o.x)<6&&hb.y+hb.h>GROUND-6)hurtPlayer(1);}
  if(o.t>200)o.gone=true;
}
function J9_shardDraw(o){
  const k=Math.min(1,o.t/40);ctx.fillStyle=`rgba(159,227,255,${0.15+0.35*k})`;ctx.beginPath();ctx.ellipse(o.tx,GROUND,4,1.1,0,0,7);ctx.fill();
  ctx.save();ctx.translate(q(o.x),q(o.y));ctx.rotate(Math.atan2(o.vy,o.vx)+Math.PI/2);
  ctx.fillStyle='rgba(159,227,255,0.35)';ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(2.4,0);ctx.lineTo(0,4);ctx.lineTo(-2.4,0);ctx.closePath();ctx.fill();
  ctx.fillStyle='#e8fbff';ctx.beginPath();ctx.moveTo(0,-3);ctx.lineTo(1.4,0);ctx.lineTo(0,3);ctx.lineTo(-1.4,0);ctx.closePath();ctx.fill();
  ctx.restore();
}
// llama lila de vela: lenta, se revienta a tiros
function J9_flame(x,y,a,sp){eproj.push({kind:'j9Llama',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:2,t:0,upd:J9_flameUpd,draw:J9_flameDraw});}
function J9_flameUpd(o,hb){
  o.t++;o.x+=o.vx;o.y+=o.vy;
  if(o.t%3===0)parts.push({k:'p',x:o.x,y:o.y,vx:0,vy:-0.3,g:0,life:10,maxl:10,size:1,col:o.t%2?'#d8b8ff':'#fff'});
  if(hb&&overlapPt(hb,o.x,o.y,o.r)){hurtPlayer(1);o.gone=true;return;}
  if(o.y>=GROUND-1||o.t>260||o.x<camX-20||o.x>camX+VW+20){o.gone=true;M9_mist(o.x,Math.min(o.y,GROUND-2),2,'200,170,240');}
}
function J9_flameDraw(o){
  ctx.fillStyle='rgba(185,140,255,0.3)';circle(o.x,o.y,o.r+2);
  ctx.fillStyle='#b48cff';ctx.beginPath();ctx.moveTo(o.x-2,o.y+1);ctx.quadraticCurveTo(o.x-1.4,o.y-2.6,o.x+Math.sin(o.t/3)*0.6,o.y-4);ctx.quadraticCurveTo(o.x+1.6,o.y-2.4,o.x+2,o.y+1);ctx.quadraticCurveTo(o.x,o.y+2.6,o.x-2,o.y+1);ctx.fill();
  ctx.fillStyle='#fff';circle(o.x,o.y,0.9);
}
function J9_updLum(b){
  b.t++;b.mt++;if(b.flash>0)b.flash--;
  const A=b.A,rage=b.hp<b.max*0.5,pc=M9_pc();
  if(b.state==='enter'){ // baja desde arriba con la cadena
    J9_lumBox(b);J9_tang(b,true);b.cx=A+190;b.cy=Math.min(36,-60+b.t*1.6);J9_lumBox(b);b.x=b.bx;b.y=b.by;
    if(b.t%9===0)J9_sfx('m9Cadena');if(b.t%5===0)M9_glint(b.cx+rand(-16,16),b.cy+20,1);
    if(b.cy>=36){b.state='intro';b.t=0;b.hp=0;J9_sfx('m9Cristal');}return;}
  if(b.state==='intro'){bossIntro(b,50);if(b.state==='fight'){b.cd=40;b.mode='hover';}return;}
  if(b.state==='dying'){
    J9_tang(b,true);b.alpha=1;b.vy=Math.min(b.vy+0.15,4);b.cy=Math.min(GROUND-b.h,b.cy+b.vy);J9_lumBox(b);b.x=b.bx;b.y=b.by;b.shk=1;
    if(b.cy>=GROUND-b.h&&!b.landed){b.landed=1;shake=Math.max(shake,6);J9_sfx('m9Golpe');J9_sfx('m9Rompe');
      for(let i=0;i<16;i++)parts.push({k:'p',x:b.cx+rand(-18,18),y:GROUND-6,vx:rand(-2,2),vy:rand(-2.6,-0.6),g:0.15,life:rand(20,34),maxl:34,size:1,col:pick(['#e8fbff',M9_CEL,'#c9a040'])});}
    if(b.t%8===0)explodeFx(b.cx+rand(-18,18),b.cy+rand(0,b.h),rand(7,12));
    if(b.t%6===0)J9_sfx('m9Cristal');
    if(b.t>=120)bossDone(b);
    return;}
  if(rage&&!b.rage){b.rage=true;setBanner('¡LA LUMBRERA SE ENCIENDE!',80);J9_sfx('m9Farol');shake=Math.max(shake,4);}
  if(b.t%50===0)J9_sfx('m9Cadena');
  b.flare*=0.9;b.shk*=0.9;
  const hoverY=34+Math.sin(b.t/24)*3;
  switch(b.mode){
  case 'hover':{
    J9_tang(b,true);b.alpha=Math.min(1,b.alpha+0.1);
    const tx=clamp(pc.x+(pc.x<A+W/2?40:-40),A+30,A+W-30);b.cx+=clamp(tx-b.cx,-1,1)*(rage?1.3:0.9);b.cy+=(hoverY-b.cy)*0.08;
    if(--b.cd<=0){
      const s=rage?['lagrimas','fase','velas','caida','fase','lagrimas','velas']:['lagrimas','velas','caida','velas','lagrimas','caida'];
      const a=s[b.seq++%s.length];b.mt=0;
      if(a==='lagrimas'){const n=rage?5:3;b.marks=[];for(let i=0;i<n;i++)b.marks.push(clamp(pc.x+(i-(n-1)/2)*30+rand(-4,4),A+10,A+W-10));b.mode='lagT';J9_sfx('m9Cristal');}
      else if(a==='velas'){b.mode='velT';J9_sfx('m9Farol');}
      else if(a==='caida'){b.mode='caidaT';b.tx=clamp(pc.x,A+24,A+W-24);J9_sfx('m9Cadena');}
      else{b.mode='fase';b.tx=b.cx<A+W/2?A+W-60:A+60;J9_sfx('m9Aparece');}
    }
    break;}
  case 'lagT':{const tel=b.rage?26:38;b.shk=1;b.cy+=(hoverY-b.cy)*0.08;
    if(b.mt%4===0)M9_glint(b.cx+rand(-16,16),b.cy+22,1);if(b.mt%10===0)J9_sfx('m9Cristal');
    if(b.mt>=tel){for(const m of b.marks)J9_shard(b.cx+rand(-12,12),b.cy+22,m,44);b.marks=[];b.mode='rec';b.mt=0;J9_sfx('m9Rompe');}
    break;}
  case 'velT':{const tel=b.rage?20:30;b.flare=Math.min(1,b.mt/tel);b.cy+=(hoverY-b.cy)*0.08;
    if(b.mt>=tel){const n=b.rage?5:3,sx=b.cx,sy=b.cy+12,base=Math.atan2(pc.y-sy,pc.x-sx);
      for(let i=0;i<n;i++)J9_flame(sx,sy,base+(i-(n-1)/2)*0.3,1.5);J9_sfx('m9Llama');b.mode='rec';b.mt=0;}
    break;}
  case 'caidaT':{const tel=b.rage?30:44;b.shk=0.6;
    b.cx+=clamp(b.tx-b.cx,-2.2,2.2);b.cy+=(24-b.cy)*0.1;
    if(b.mt%8===0)J9_sfx('m9Cadena');
    if(b.mt>=tel&&Math.abs(b.tx-b.cx)<2){b.mode='caida';b.mt=0;b.vy=0.5;}
    break;}
  case 'caida':
    b.vy=Math.min(b.vy+0.35,6);b.cy+=b.vy;
    if(b.cy>=GROUND-b.h){b.cy=GROUND-b.h;b.mode='low';b.mt=0;shake=Math.max(shake,6);J9_sfx('m9Golpe');J9_sfx('m9Rompe');dust(b.cx,GROUND,8);
      const box={x:b.cx-26,y:GROUND-26,w:52,h:26};for(const p of players)if(!p.dead&&overlap(hurtbox(p),box))withP(p,()=>hurtPlayer(1));
      for(let i=0;i<10;i++)parts.push({k:'p',x:b.cx+rand(-18,18),y:GROUND-4,vx:rand(-1.8,1.8),vy:rand(-2.2,-0.6),g:0.15,life:rand(16,26),maxl:26,size:1,col:i%2?'#e8fbff':M9_CEL});}
    break;
  case 'low':if(b.mt>=(b.rage?34:46)){b.mode='rise';b.mt=0;J9_sfx('m9Cadena');}break;
  case 'rise':b.cy+=(hoverY-b.cy)*0.06;if(b.mt>=40){b.mode='rec';b.mt=10;}break;
  case 'fase':{ // translúcida: cruza la arena sin que nada le pegue
    J9_tang(b,false);b.alpha=Math.max(0.3,b.alpha-0.08);
    b.cx+=clamp(b.tx-b.cx,-3,3);b.cy+=(hoverY-b.cy)*0.08;
    if(b.mt%3===0)parts.push({k:'p',x:b.cx+rand(-16,16),y:b.cy+rand(4,22),vx:0,vy:-0.2,g:0,life:16,maxl:16,size:1,col:M9_LILA});
    if(Math.abs(b.tx-b.cx)<2&&b.mt>20){b.mode='rec';b.mt=14;J9_tang(b,true);J9_sfx('m9Solido');M9_glint(b.cx,b.cy+12,6);}
    break;}
  case 'rec':b.alpha=Math.min(1,b.alpha+0.1);b.cy+=(hoverY-b.cy)*0.08;if(b.mt>=(b.rage?22:34)){b.mode='hover';b.cd=b.rage?30:46;}break;
  }
  b.cx=clamp(b.cx,A+22,A+W-22);J9_lumBox(b);
  if(b.solid){b.x=b.bx;b.y=b.by;bossContact(b);}
}
function J9_drawLum(b){
  const fl=b.flash>0||(b.state==='dying'&&(T>>2)%2),C=c=>fl?'#fff':c,cx=q(b.cx),y=q(b.cy),sh=b.shk?Math.sin(T*2.1)*b.shk:0,rage=b.rage;
  // marcas de los cristales que van a caer
  if(b.mode==='lagT'){const p=Math.min(1,b.mt/(rage?26:38)),on=(T>>2)%2;
    for(const m of b.marks){ctx.fillStyle=`rgba(159,227,255,${0.15+0.35*p+(on?0.1:0)})`;ctx.beginPath();ctx.ellipse(m,GROUND,5,1.4,0,0,7);ctx.fill();
      ctx.fillStyle=`rgba(232,251,255,${0.3+0.5*p})`;ctx.fillRect(m-0.4,GROUND-10,0.8,8);}}
  if(b.mode==='caidaT'||b.mode==='caida'){const p=b.mode==='caida'?1:Math.min(1,b.mt/(rage?30:44)),on=(T>>2)%2;
    ctx.fillStyle=`rgba(185,140,255,${0.12+0.25*p+(on?0.08:0)})`;ctx.beginPath();ctx.ellipse(b.tx,GROUND,10+p*14,2.4,0,0,7);ctx.fill();
    ctx.strokeStyle=`rgba(232,220,255,${0.4+0.5*p})`;ctx.lineWidth=0.7;ctx.beginPath();ctx.ellipse(b.tx,GROUND,26-p*6,3,0,0,7);ctx.stroke();}
  ctx.save();ctx.globalAlpha=b.alpha;
  // cadena que se pierde arriba
  ctx.fillStyle=C('#4a4050');for(let cy=y-2;cy>-6;cy-=4){ctx.fillRect(cx-1+(((cy>>2)%2)?0.5:0),cy-3,2,3);}
  ctx.translate(cx+sh,y);
  // corona y globo central con la cara
  ctx.fillStyle=C('#a08040');ctx.fillRect(-4,0,8,3);ctx.fillRect(-1,-2,2,3);
  ctx.fillStyle=C('#c9a040');ctx.beginPath();ctx.ellipse(0,10,8,7,0,0,7);ctx.fill();
  ctx.fillStyle=fl?'#fff':rage?'#e8d8ff':'#dfe8f0';ctx.beginPath();ctx.ellipse(0,10,6,5.6,0,0,7);ctx.fill();
  if(!fl){ // cara pálida adentro del globo
    const mo=b.mode==='velT'||b.mode==='lagT'?1:0;
    ctx.fillStyle='#2a1f3a';ctx.beginPath();ctx.ellipse(-2.2,8.6,1,1.6,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(2.2,8.6,1,1.6,0,0,7);ctx.fill();
    ctx.fillStyle=rage||mo?((T>>1)%2?'#fff':M9_CEL):M9_CEL;ctx.fillRect(-2.6,8.4,0.8,0.8);ctx.fillRect(1.8,8.4,0.8,0.8);
    ctx.fillStyle='#2a1f3a';ctx.beginPath();ctx.ellipse(0,12.6,1.4,0.6+mo*0.8,0,0,7);ctx.fill();}
  // brazos curvos con velas
  ctx.strokeStyle=C('#a08040');ctx.lineWidth=1.3;ctx.beginPath();
  for(const s of[-1,1]){ctx.moveTo(s*6,12);ctx.quadraticCurveTo(s*14,18,s*18,10);ctx.moveTo(s*5,14);ctx.quadraticCurveTo(s*9,20,s*10,14);}ctx.stroke();
  const candles=[[-18,10],[-10,14],[10,14],[18,10],[0,1]];
  candles.forEach(([vx,vy],i)=>{
    ctx.fillStyle=C('#c9a040');ctx.fillRect(vx-2,vy-1,4,1.4);
    ctx.fillStyle=C('#efe6d2');ctx.fillRect(vx-1,vy-5,2,4);
    if(!fl&&b.state!=='dying'){const f=1+b.flare*1.6+(rage?0.4:0),fy=vy-5;
      ctx.fillStyle=`rgba(185,140,255,${0.25+0.3*b.flare})`;circle(vx,fy-1.6*f,2.4*f);
      ctx.fillStyle=b.flare>0.6&&(T>>1)%2?'#fff':'#b48cff';ctx.beginPath();ctx.moveTo(vx-1*f,fy);ctx.quadraticCurveTo(vx,fy-3.6*f,vx+Math.sin(T/4+i)*0.5,fy-4*f);ctx.quadraticCurveTo(vx+0.5,fy-2*f,vx+1*f,fy);ctx.fill();}});
  // lágrimas de cristal colgando
  for(let i=-3;i<=3;i++){const lx=i*5,ly=17+Math.abs(i)*-1+(i%2?2:0),sw=Math.sin(T/9+i)*0.6*(1+b.shk*2);
    ctx.strokeStyle=C('rgba(200,220,230,0.8)');ctx.lineWidth=0.4;ctx.beginPath();ctx.moveTo(lx,ly-3);ctx.lineTo(lx+sw,ly);ctx.stroke();
    ctx.fillStyle=fl?'#fff':b.mode==='lagT'&&(T+i)%4<2?'#ffffff':'#bfe8f8';ctx.beginPath();ctx.moveTo(lx+sw,ly);ctx.lineTo(lx+sw+1.2,ly+2.4);ctx.lineTo(lx+sw,ly+4.6);ctx.lineTo(lx+sw-1.2,ly+2.4);ctx.closePath();ctx.fill();}
  ctx.restore();ctx.globalAlpha=1;
}

// =====================================================================
// VILLANO · EL CASERO — el dueño de la mansión, que se arma con sus propios muebles
// Patas de mesa, un ropero de cuerpo, un espejo ovalado de cabeza (con su cara de fantasma adentro) y dos sillas
// de puños. Alrededor de la cabeza le gira la vajilla.
// · Vajilla: los platos se alinean y brillan; después los tira de a uno, en arco (se revientan a tiros).
// · Sillazo: una silla sube arriba tuyo, se marcan franjas en el piso y la estampa contra las baldosas.
// · Se desarma: los muebles se meten en la pared de la mansión y en el piso (translúcidos: no se les puede
//   pegar), salen sábanas, y después todo vuelve volando a un círculo marcado en el piso y se arma de un golpe.
// Rabia al 50 %: más platos, dos sillazos seguidos y se desarma más seguido.
// =====================================================================
const J9_PARTS=[ // pieza, posición de casa (relativa al centro y al piso), tamaño
  {k:'patas',hx:-12,hy:-10,w:24,h:10},{k:'ropero',hx:-13,hy:-42,w:26,h:32},{k:'espejo',hx:-8,hy:-62,w:16,h:19},
  {k:'sillaL',hx:-30,hy:-44,w:12,h:14},{k:'sillaR',hx:18,hy:-44,w:12,h:14}];
function J9_mkCas(A){
  const cx=A+214,b={type:'j9Cas',isBoss:true,A,cx,x:cx-13,y:GROUND-62,bx:cx-13,by:GROUND-62,w:26,h:62,hp:0,max:320,state:'enter',t:0,mt:0,face:-1,flash:0,score:12000,
    mode:'idle',cd:60,seq:0,phase:0,door:0,plates:[],ch:[],marks:[],tx:cx,solid:true,dim:0,touch:1,noPush:true,told:0,
    pc:J9_PARTS.map(p=>({...p,x:0,y:0,a:1,ox:0,oy:0,sx:0,sy:0})),upd:J9_updCas,draw:J9_drawCas};
  const door={x:3245,y:GROUND-24};
  for(const p of b.pc){p.x=door.x-p.w/2;p.y=door.y-p.h/2;p.a=0;}
  for(let i=0;i<4;i++)b.plates.push({a:i*Math.PI/2,cup:i%2,st:'orb'});
  return b;
}
function J9_casBox(b){b.bx=b.cx-13;b.by=GROUND-62;}
function J9_home(b,p){return{x:b.cx+p.hx,y:GROUND+p.hy};}
function J9_plate(sx,sy,tx,Tt,cup){const g=0.12;eproj.push({kind:'j9Plato',x:sx,y:sy,vx:(tx-sx)/Tt,vy:(GROUND-4-sy-0.5*g*Tt*Tt)/Tt,g,r:2.4,t:0,cup,tx,upd:J9_plateUpd,draw:J9_plateDraw});J9_sfx('m9Plato');}
function J9_plateUpd(o,hb){
  o.t++;o.vy+=o.g;o.x+=o.vx;o.y+=o.vy;
  if(hb&&overlapPt(hb,o.x,o.y,o.r)){hurtPlayer(1);o.gone=true;J9_sfx('m9Rompe');return;}
  if(o.y>=GROUND-4){o.gone=true;J9_sfx('m9Rompe');for(let i=0;i<7;i++)parts.push({k:'p',x:o.x,y:GROUND-3,vx:rand(-1.6,1.6),vy:rand(-2.2,-0.5),g:0.15,life:rand(16,26),maxl:26,size:1,col:i%2?M9_HUESO:M9_LILA});}
  if(o.t>220)o.gone=true;
}
function J9_plateDraw(o){
  const k=Math.min(1,o.t/36);ctx.fillStyle=`rgba(185,163,216,${0.15+0.3*k})`;ctx.beginPath();ctx.ellipse(o.tx,GROUND,4,1.1,0,0,7);ctx.fill();
  J9_dish(o.x,o.y,o.t*0.4,o.cup,false);
}
function J9_dish(x,y,rot,cup,glow){
  if(glow){ctx.fillStyle='rgba(159,227,255,0.3)';circle(x,y,4.6);}
  ctx.save();ctx.translate(q(x),q(y));ctx.rotate(rot);
  if(cup){ctx.fillStyle=M9_HUESO;ctx.fillRect(-2,-1.6,4,3.4);ctx.strokeStyle=M9_HUESO;ctx.lineWidth=0.7;ctx.beginPath();ctx.arc(2.4,0,1.2,-1.4,1.4);ctx.stroke();
    ctx.fillStyle=M9_LILA;ctx.fillRect(-2,-1.6,4,0.7);}
  else{ctx.fillStyle=M9_LILA;ctx.beginPath();ctx.ellipse(0,0,3.2,1.5,0,0,7);ctx.fill();ctx.fillStyle=M9_HUESO;ctx.beginPath();ctx.ellipse(0,-0.2,2.4,1,0,0,7);ctx.fill();}
  ctx.restore();
}
// sillazo: una silla sube arriba del blanco y cae
function J9_chair(b,k,tx,tel){b.ch.push({k,tx:clamp(tx,b.A+14,b.A+W-14),st:'up',t:0,tel,y:0});}
function J9_updChairs(b){
  for(const c of b.ch){c.t++;const p=b.pc.find(o=>o.k===c.k);
    if(c.st==='up'){const h=J9_home(b,p),k=Math.min(1,c.t/18);p.ox=(c.tx-6-h.x)*k;p.oy=(GROUND-96-h.y)*k+Math.sin(T/5)*1.5;
      if(c.t%10===0)J9_sfx('m9Puertas');
      if(c.t>=c.tel){c.st='fall';c.t=0;c.vy=1;}}
    else if(c.st==='fall'){c.vy=Math.min(c.vy+0.6,8);p.oy+=c.vy;const h=J9_home(b,p);
      if(h.y+p.oy+p.h>=GROUND){p.oy=GROUND-p.h-h.y;c.st='hit';c.t=0;shake=Math.max(shake,4);J9_sfx('m9Golpe');dust(c.tx,GROUND,6);
        for(let i=0;i<6;i++)parts.push({k:'p',x:c.tx+rand(-8,8),y:GROUND-1,vx:rand(-1.4,1.4),vy:rand(-2,-0.6),g:0.15,life:rand(16,26),maxl:26,size:1,col:pick(['#8a5a3a','#5a3424',M9_LILA])});}}
    else if(c.st==='hit'){
      if(c.t<=8){const box={x:c.tx-11,y:GROUND-20,w:22,h:20};for(const pl of players)if(!pl.dead&&overlap(hurtbox(pl),box))withP(pl,()=>hurtPlayer(1));
        for(const a of allies)if(!a.gone&&overlap(a,box))killAlly(a);}
      if(c.t>=20){c.st='back';c.t=0;}}
    else if(c.st==='back'){p.ox*=0.82;p.oy*=0.82;if(c.t>=22){p.ox=0;p.oy=0;c.gone=true;}}
  }
  b.ch=b.ch.filter(c=>!c.gone);
}
function J9_updCas(b){
  b.t++;b.mt++;if(b.flash>0)b.flash--;
  const A=b.A,pc=M9_pc(),ph=b.phase;
  J9_updChairs(b);
  for(const pl of b.plates)if(pl.st==='orb')pl.a+=ph?0.06:0.04;
  if(b.state==='enter'){ // la mansión se despierta: se prenden las ventanas y los muebles salen volando por la puerta
    J9_tang(b,false);
    if(b.t===1){setBanner('¡LA MANSIÓN SE DESPIERTA!',110);J9_sfx('m9Risa');}
    M9.mansion=Math.min(40,Math.floor(b.t/5));if(b.t%5===0&&b.t<100)J9_sfx('m9Cristal');
    shake=Math.max(shake,0.8);
    if(b.t===40){J9_sfx('m9Puertas');J9_sfx('m9Desarma');}
    if(b.t>40)b.pc.forEach((p,i)=>{const k=M9_ease((b.t-40-i*8)/50),h=J9_home(b,p),d={x:3245-p.w/2,y:GROUND-24-p.h/2};
      p.x=d.x+(h.x-d.x)*k;p.y=d.y+(h.y-d.y)*k-Math.sin(k*Math.PI)*30;p.a=Math.min(1,k*1.5);});
    if(b.t>=130){b.pc.forEach(p=>{p.a=1;});b.state='intro';b.t=0;b.hp=0;J9_sfx('m9Rearma');J9_sfx('m9Golpe');shake=6;dust(b.cx,GROUND,8);}
    return;}
  if(b.state==='intro'){
    J9_casBox(b);J9_tang(b,true);
    const dur=80;
    if(b.t===1){setBanner(b.name,130);playMusic(SONGS.m9Casero?'m9Casero':'boss');shake=Math.max(shake,5);J9_sfx('m9Risa');}
    b.hp=Math.min(b.max,b.max*b.t/dur);b.door=Math.max(0,Math.sin(b.t/10))*0.6;
    if(b.t%4===0&&b.hp<b.max)tone('square',300+b.hp/b.max*500,300+b.hp/b.max*500,0.03,0.02);
    if(b.t>=dur){b.hp=b.max;b.state='fight';b.mt=0;b.cd=50;b.mode='idle';}
    J9_placeParts(b);return;}
  if(b.state==='dying'){
    J9_casBox(b);J9_tang(b,true);
    if(b.t===1){setBanner('¡EL CASERO SE DESARMA PARA SIEMPRE!',120);J9_sfx('m9Muere');J9_sfx('m9Risa');b.ch=[];
      b.pc.forEach(p=>{p.vx=rand(-1.6,1.6);p.vy=rand(-3,-1);p.fall=1;});}
    b.dim=Math.min(1,b.t/150);
    for(const p of b.pc){if(!p.fall)continue;p.vy+=0.18;p.x+=p.vx;p.y+=p.vy;if(p.y+p.h>=GROUND){p.y=GROUND-p.h;p.vy*=-0.25;p.vx*=0.6;}}
    for(const pl of b.plates)if(pl.st==='orb'){pl.st='fall';pl.x=b.cx+Math.cos(pl.a)*16;pl.y=GROUND-56+Math.sin(pl.a)*5;pl.vy=-1;}
    for(const pl of b.plates)if(pl.st==='fall'){pl.vy+=0.2;pl.y+=pl.vy;if(pl.y>=GROUND-3){pl.st='gone';J9_sfx('m9Rompe');for(let i=0;i<5;i++)parts.push({k:'p',x:pl.x,y:GROUND-3,vx:rand(-1.4,1.4),vy:rand(-2,-0.5),g:0.15,life:20,maxl:20,size:1,col:M9_HUESO});}}
    if(b.t%10===0)explodeFx(b.cx+rand(-20,20),GROUND-rand(6,60),rand(7,12));
    if(b.t%12===0)M9.mansion=Math.max(0,M9.mansion-1);
    if(b.t===150){shake=8;SFX.bigboom();M9_mist(b.cx,GROUND-30,12);}
    if(b.t>=190){M9.mansion=0;bossDone(b);}
    return;}
  // --- pelea ---
  if(!b.phase&&b.hp<b.max*0.5){b.phase=1;b.seq=0;setBanner('¡EL CASERO PIERDE LA PACIENCIA!',90);J9_sfx('m9Risa');shake=Math.max(shake,5);if(b.mode==='idle')b.cd=40;}
  b.door*=0.9;
  switch(b.mode){
  case 'idle':{
    J9_casBox(b);J9_tang(b,true);
    const want=pc.x<b.cx?pc.x+56:pc.x-56,tx=clamp(want,A+44,A+W-40);b.cx+=clamp(tx-b.cx,-0.4,0.4);
    if(--b.cd<=0){
      const s=ph?['silla','vajilla','desarme','silla','vajilla','desarme']:['vajilla','silla','vajilla','desarme','silla'];
      const a=s[b.seq++%s.length];b.mt=0;
      if(a==='vajilla'){b.mode='vajT';b.n=ph?6:4;while(b.plates.filter(p=>p.st==='orb').length<b.n)b.plates.push({a:rand(0,6),cup:b.plates.length%2,st:'orb'});J9_sfx('m9Puertas');}
      else if(a==='silla'){const tel=ph?30:42;J9_chair(b,pc.x<b.cx?'sillaL':'sillaR',pc.x,tel);
        if(ph)J9_chair(b,pc.x<b.cx?'sillaR':'sillaL',pc.x+(pc.x>A+W/2?-48:48),tel+20);b.mode='silla';}
      else{b.mode='desarme';J9_sfx('m9Desarma');if(b.told<1){b.told=1;setBanner('¡SE METE EN LAS PAREDES!',80);}
        b.pc.forEach(p=>{const h=J9_home(b,p);p.sx=h.x;p.sy=h.y;p.dx=pick([b.A+rand(20,W-20)]);p.dy=rand(40,GROUND-30);p.floor=Math.random()<0.4;if(p.floor)p.dy=GROUND+6;});}
    }
    break;}
  case 'vajT':{const tel=ph?20:30;b.door=1;
    let i=0;for(const pl of b.plates)if(pl.st==='orb'){pl.st='line';}
    for(const pl of b.plates)if(pl.st==='line'){pl.lx=b.cx-((b.n-1)*7)/2+i*7;pl.ly=GROUND-78;i++;}
    if(b.mt%8===0)M9_glint(b.cx,GROUND-78,1);
    if(b.mt>=tel){b.mode='vaj';b.mt=0;b.k=0;}
    break;}
  case 'vaj':{
    if(b.mt%(ph?8:11)===0){const pl=b.plates.find(p=>p.st==='line');
      if(pl){pl.st='gone';J9_plate(pl.lx,pl.ly,clamp(pc.x+rand(-10,10),A+8,A+W-8),ph?38:46,pl.cup);}
      else{b.plates=b.plates.filter(p=>p.st!=='gone');while(b.plates.length<4)b.plates.push({a:rand(0,6),cup:b.plates.length%2,st:'orb'});b.mode='rec';b.mt=0;}}
    break;}
  case 'silla':if(!b.ch.length){b.mode='rec';b.mt=0;}break;
  case 'desarme':{ // los muebles se meten en la pared y en el piso
    J9_tang(b,false);const k=M9_ease(b.mt/30);
    for(const p of b.pc){p.ox=0;p.oy=0;p.x=p.sx+(p.dx-p.sx)*k;p.y=p.sy+(p.dy-p.sy)*k-Math.sin(k*Math.PI)*16;p.a=1-k*0.75;}
    if(b.mt===30){const n=ph?3:2;for(let i=0;i<n;i++)if(M9_n('m9Sabana')<3)M9_sabAt(clamp(pc.x+(i%2?60:-60)+rand(-10,10),A+20,A+W-30),i===1);J9_sfx('m9Risa');}
    if(b.mt>=30){b.mode='lejos';b.mt=0;}
    break;}
  case 'lejos':{ // translúcido, adentro de las paredes; después marca dónde se va a armar
    J9_tang(b,false);
    for(const p of b.pc){p.x+=Math.sin(T/30+p.hx)*0.3;p.a=p.floor?0.15:0.25;}
    if(b.mt===(ph?60:80)){b.tx=clamp(pc.x,A+40,A+W-40);J9_sfx('m9Rearma');for(const p of b.pc){p.sx=p.x;p.sy=p.y;}}
    if(b.mt>(ph?60:80)){const tel=ph?32:44,k=M9_ease((b.mt-(ph?60:80))/tel);
      for(const p of b.pc){const h={x:b.tx+p.hx,y:GROUND+p.hy};p.x=p.sx+(h.x-p.sx)*k;p.y=p.sy+(h.y-p.sy)*k;p.a=0.25+0.75*k;}
      if(k>=1){b.cx=b.tx;J9_casBox(b);J9_tang(b,true);b.mode='rec';b.mt=0;shake=Math.max(shake,6);J9_sfx('m9Golpe');dust(b.cx,GROUND,10);M9_glint(b.cx,GROUND-40,8);
        const box={x:b.cx-18,y:GROUND-34,w:36,h:34};for(const pl of players)if(!pl.dead&&overlap(hurtbox(pl),box))withP(pl,()=>hurtPlayer(1));}}
    break;}
  case 'rec':J9_casBox(b);J9_tang(b,true);if(b.mt>=(ph?26:40)){b.mode='idle';b.cd=ph?34:50;}break;
  }
  if(b.mode!=='desarme'&&b.mode!=='lejos')J9_placeParts(b);
  if(b.solid){b.x=b.bx;b.y=b.by;bossContact(b);}
}
// cada pieza en su lugar, con un vaivén (y las sillas donde las mande el sillazo)
function J9_placeParts(b){
  for(const p of b.pc){const h=J9_home(b,p),bob=p.k==='patas'?0:Math.sin(T/16+p.hx*0.3)*(p.k.startsWith('silla')?1.6:0.8);
    p.x=h.x+(p.ox||0);p.y=h.y+bob+(p.oy||0);p.a=Math.min(1,(p.a||0)+0.1);}
}
function J9_drawPart(b,p,fl){
  const C=c=>fl?'#fff':c,x=q(p.x),y=q(p.y),dim=b.dim,under=p.floor&&(b.mode==='desarme'||b.mode==='lejos');
  if(under&&p.y+p.h>GROUND-1){const r=((T+p.hx*3)%24)/24;ctx.strokeStyle=`rgba(185,163,216,${0.5-r*0.4})`;ctx.lineWidth=0.6;
    ctx.beginPath();ctx.ellipse(p.x+p.w/2,GROUND,4+r*10,1+r*1.2,0,0,7);ctx.stroke();}
  ctx.save();ctx.globalAlpha=p.a*(1-dim*0.3);
  if(under){ctx.beginPath();ctx.rect(camX-40,-40,W+80,GROUND+40);ctx.clip();}
  switch(p.k){
  case 'patas':
    ctx.fillStyle=C('#4a2e22');ctx.fillRect(x,y,24,2.4);ctx.fillStyle=C('#5a3a2e');ctx.fillRect(x,y,24,0.8);
    for(const lx of[3,19]){ctx.fillStyle=C('#3a2218');ctx.fillRect(x+lx,y+2,2,8);ctx.fillRect(x+lx-0.6,y+4,3.2,1.6);ctx.fillRect(x+lx-0.4,y+8.4,2.8,1.6);}
    break;
  case 'ropero':{
    ctx.fillStyle=C('#2a1812');ctx.fillRect(x-1,y-2,28,3);ctx.fillStyle=C('#5a3a2e');ctx.fillRect(x-1,y-2,28,0.8);
    ctx.fillStyle=C('#3a2420');ctx.fillRect(x,y+1,26,31);
    const op=b.door;
    if(!fl){ctx.fillStyle='#0a0610';ctx.fillRect(x+2,y+3,22,27);
      // adentro: ojos que brillan en la oscuridad
      if(op>0.1){ctx.fillStyle=`rgba(159,227,255,${op})`;ctx.fillRect(x+9,y+12,2,1.2);ctx.fillRect(x+15,y+12,2,1.2);}}
    for(const s of[0,1]){const dw=11*(1-op*0.7),dx=s?x+24-dw:x+2;
      ctx.fillStyle=C('#4a2e26');ctx.fillRect(dx,y+3,dw,27);ctx.fillStyle=C('#5a3a2e');ctx.fillRect(dx+1,y+5,dw-2,10);ctx.fillRect(dx+1,y+17,dw-2,11);
      ctx.fillStyle=C('#3a2218');ctx.fillRect(dx+1.6,y+5.6,dw-3.2,8.8);ctx.fillRect(dx+1.6,y+17.6,dw-3.2,9.8);
      ctx.fillStyle=C('#c9a040');ctx.fillRect(s?dx+1:dx+dw-2,y+16,1,2);}
    break;}
  case 'espejo':{
    ctx.fillStyle=C('#a08040');ctx.beginPath();ctx.ellipse(x+8,y+9.5,8,9.5,0,0,7);ctx.fill();
    ctx.fillStyle=C('#c9a040');ctx.fillRect(x+6,y-1.4,4,2);
    ctx.fillStyle=fl?'#fff':'#141a28';ctx.beginPath();ctx.ellipse(x+8,y+9.5,6,7.6,0,0,7);ctx.fill();
    if(!fl){ // la cara del casero: larga, ojos hundidos, bigote finito
      const g=(1-dim)*(0.7+0.3*Math.sin(T/12)),atk=b.mode==='vajT'||b.mode==='vaj'||b.ch.length>0||b.state==='intro';
      ctx.fillStyle=`rgba(185,163,216,${0.55*g})`;ctx.beginPath();ctx.ellipse(x+8,y+10,4.4,6.4,0,0,7);ctx.fill();
      ctx.fillStyle=`rgba(239,230,210,${0.5*g})`;ctx.beginPath();ctx.ellipse(x+8,y+9,3.4,5,0,0,7);ctx.fill();
      ctx.fillStyle='#1a1028';ctx.beginPath();ctx.ellipse(x+6.2,y+8,1,1.6,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(x+9.8,y+8,1,1.6,0,0,7);ctx.fill();
      ctx.fillStyle=b.phase&&(T>>1)%2?'#fff':M9_CEL;ctx.fillRect(x+5.8,y+7.8,0.8,0.8);ctx.fillRect(x+9.4,y+7.8,0.8,0.8);
      ctx.fillStyle='rgba(90,70,120,0.9)';ctx.fillRect(x+5.6,y+11.4,2,0.6);ctx.fillRect(x+8.4,y+11.4,2,0.6);
      ctx.fillStyle='#1a1028';ctx.beginPath();ctx.ellipse(x+8,y+13.4,1.4,atk?1.4:0.4,0,0,7);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.18)';ctx.fillRect(x+3.6,y+4,1,5);}
    break;}
  case 'sillaL':case 'sillaR':{
    const s=p.k==='sillaL'?1:-1,ox=s>0?0:12;ctx.translate(x+ox,y);ctx.scale(s,1);
    ctx.fillStyle=C('#5a3424');ctx.fillRect(0,0,2,14);ctx.fillRect(0,7,11,2);ctx.fillRect(9,9,2,5);ctx.fillRect(2,9,1.4,5);
    ctx.fillStyle=C('#7a4a30');ctx.fillRect(2,1,1.4,6);ctx.fillRect(0,0,4,1.2);ctx.fillRect(0,3.4,2.6,0.8);
    ctx.fillStyle=C('#8a2a3a');ctx.fillRect(2.4,6,8.4,1.4);
    break;}
  }
  ctx.restore();
}
function J9_drawCas(b){
  if(b.state==='enter'&&b.t<40)return;
  const fl=b.flash>0||(b.state==='dying'&&b.t<150&&(T>>2)%2);
  // marcas: sillazo y lugar donde se va a armar
  for(const c of b.ch)if(c.st==='up'){const p=Math.min(1,c.t/c.tel),on=(T>>2)%2;
    ctx.fillStyle=`rgba(185,163,216,${0.12+0.3*p+(on?0.08:0)})`;ctx.fillRect(c.tx-11,GROUND-2,22,2);
    ctx.fillStyle=`rgba(239,230,210,${0.4+0.5*p})`;for(let i=-11;i<11;i+=5)ctx.fillRect(c.tx+i,GROUND-1,2.5,1);
    ctx.fillStyle=`rgba(185,163,216,${0.05+0.12*p})`;ctx.fillRect(c.tx-11,GROUND-26,22,24);}
  if(b.mode==='lejos'&&b.mt>(b.phase?60:80)){const tel=b.phase?32:44,p=Math.min(1,(b.mt-(b.phase?60:80))/tel),on=(T>>2)%2;
    ctx.fillStyle=`rgba(159,227,255,${0.12+0.3*p+(on?0.08:0)})`;ctx.beginPath();ctx.ellipse(b.tx,GROUND,12+p*8,2.6,0,0,7);ctx.fill();
    ctx.strokeStyle=`rgba(232,251,255,${0.4+0.5*p})`;ctx.lineWidth=0.7;ctx.beginPath();ctx.ellipse(b.tx,GROUND,26-p*6,3.2,0,0,7);ctx.stroke();}
  // niebla del cuerpo (lo que une los muebles)
  if(b.mode!=='desarme'&&b.mode!=='lejos'&&b.state!=='enter'&&b.dim<0.9){
    const a=(1-b.dim)*(0.16+0.06*Math.sin(T/10));ctx.fillStyle=`rgba(185,163,216,${a})`;
    ctx.beginPath();ctx.ellipse(b.cx,GROUND-34,20,32,0,0,7);ctx.fill();
    ctx.strokeStyle=`rgba(185,163,216,${a*2})`;ctx.lineWidth=0.8;ctx.beginPath();
    for(const s of[-1,1]){const p=b.pc.find(o=>o.k===(s<0?'sillaL':'sillaR'));ctx.moveTo(b.cx+s*12,GROUND-36);ctx.quadraticCurveTo(b.cx+s*18,GROUND-48+Math.sin(T/8)*2,p.x+6,p.y+7);}ctx.stroke();}
  const order=['patas','ropero','espejo','sillaL','sillaR'];
  for(const k of order)J9_drawPart(b,b.pc.find(p=>p.k===k),fl);
  // vajilla que gira alrededor de la cabeza o en fila antes de tirarla
  if(b.state!=='dying')for(const pl of b.plates){
    if(pl.st==='orb'&&b.mode!=='desarme'&&b.mode!=='lejos'&&b.state!=='enter'){const hx=b.cx+Math.cos(pl.a)*17,hy=GROUND-54+Math.sin(pl.a)*5;
      if(Math.sin(pl.a)<0)J9_dish(hx,hy,Math.sin(T/10+pl.a)*0.3,pl.cup,false);else J9_dish(hx,hy,Math.sin(T/10+pl.a)*0.3,pl.cup,false);}
    else if(pl.st==='line')J9_dish(pl.lx+Math.sin(T*1.7)*0.4,pl.ly,0,pl.cup,true);}
  else for(const pl of b.plates)if(pl.st==='fall')J9_dish(pl.x,pl.y,T*0.3,pl.cup,false);
}

// ===== registro en BOSSES (sin índice fijo: el de la misión) =====
BOSSES[M9_IDX]={mini:{name:'LA LUMBRERA',make:J9_mkLum},villain:{name:'EL CASERO',make:J9_mkCas,g:'C',col:'#b9a3d8'}};
