'use strict';
// Óxido · Jefes de la Misión 1 en estilo "Hondo" (va después de arte-luz.js y arte-vehiculos.js, antes de juego.js)
// · ESCARABAJO DE ÓXIDO (jefe chico, drawBoss de jefes.js): redibujado en píxeles con rampas de metal oxidado (luz arriba,
//   sombra abajo), orugas que avanzan en 4 cuadros, el ojo y el caño; con contorno y borde de luz (por dentro: pisa).
//   Se guarda por estado (cuadro de oruga, lado, destello, ráfaga).
// · DON BULÓN (villano, drawBulon): su dibujo se captura en vivo, pasa a píxeles enteros con contorno y borde de luz, y
//   lleva el DIENTE DORADO en el pecho (Guion, "El engranaje dorado"): engranaje de 5 px en rampa dorada de 3 tonos
//   con un halo chico que late lento (quieto con MOVIMIENTO REDUCIDO). Es lo más brillante del villano.
// · Brasas que suben de los tachos con fuego del escenario de M1 (ESC_lucesNivel, tipo 'fuego'), en píxeles.
// La mecánica es de Código: solo se cambia el dibujo. Prefijo J1_.
const J1_red=()=>typeof MOV_reducido==='function'&&MOV_reducido();
// ---------- Escarabajo de óxido (60 × 46, mirando a la izquierda como el de jefes.js) ----------
function J1_escarabajoOps(f,fl,ojo){
  const C=c=>fl?'#ffffff':c,o=[];
  // orugas: banda, ruedas con cubo y tacos de 2 px cada 4 que avanzan
  o.push(['r',C('#24232a'),3,35,54,11],['e',C('#24232a'),4,40.5,4,5.5],['e',C('#24232a'),56,40.5,4,5.5]);
  for(let i=0;i<6;i++){o.push(['e',C('#4a4854'),8.5+i*9,40.5,3.5,3.5],['e',C('#6a6874'),8.5+i*9,39.5,2,1.5],['r',C('#1d1c22'),8+i*9,40,1,1]);}
  for(let x=4+f;x<56;x+=4){o.push(['r',C('#15141a'),x,35,2,1],['r',C('#15141a'),x,45,2,1]);}
  // casco: trapecio con rampa de óxido (luz arriba, sombra abajo) y manchas
  o.push(['p',C('#7a3424'),[[0,34],[6,16],[56,16],[60,34]]],['p',C('#a8503a'),[[2,29],[6.5,18],[55.5,18],[58,29]]],
    ['r',C('#c86a48'),7,16,49,2],['r',C('#e0905e'),8,16,46,1],['r',C('#5a2418'),1,32,58,2]);
  o.push(['r',C('#6a3a2a'),14,22,5,3],['r',C('#6a3a2a'),40,26,7,2],['r',C('#8a4a32'),30,20,4,2]);
  // franja de peligro en bloques de 4
  for(let i=0;i<8;i++)o.push(['r',C(i%2?'#1d1a1c':'#d9a43a'),18+i*4,25,4,3]);
  // caño de adelante (abajo) y su boca
  o.push(['r',C('#2a2a30'),-4,27,9,4],['r',C('#45454e'),-4,27,9,1]);
  // torreta con rampa, caño grande y su freno de boca
  o.push(['r',C('#6e2e22'),18,4,26,13],['r',C('#9a4a32'),18,4,26,3],['r',C('#c86a48'),19,4,24,1],['r',C('#4a1e16'),18,15,26,2]);
  o.push(['r',C('#2a2a30'),-2,8,22,4],['r',C('#45454e'),-2,8,22,1],['r',C('#1c1c22'),-5,7,4,6]);
  // ojo rojo (blanco en ráfaga) y antena
  o.push(['r',ojo,22,8,4,3],['l',C('#2a2a30'),40,3,43,-5]);
  return J1_mover(o,J1_DX,J1_DY);
}
// el caño y la antena se salen de la caja: todo se corre para que entre en el lienzo (y se dibuja corrido al revés)
const J1_DX=6,J1_DY=8;
function J1_mover(ops,dx,dy){return ops.map(o=>{const t=o[0],c=o.slice();
  if(t==='r'){c[2]+=dx;c[3]+=dy;}else if(t==='e'){c[2]+=dx;c[3]+=dy;}else if(t==='l'){c[2]+=dx;c[3]+=dy;c[4]+=dx;c[5]+=dy;}
  else if(t==='p'||t==='d')c[2]=o[2].map(([x,y])=>[x+dx,y+dy]);return c;});}
const J1_ESC=new Map();
function J1_escarabajo(b){
  const f=(b.t>>2)%4,fl=b.flash>0,rafaga=b.burst>0&&(T>>2)%2,ojo=rafaga?'#ffffff':'#ff3b30';
  const clave=f+'|'+(fl?1:0)+'|'+(rafaga?1:0);let c=J1_ESC.get(clave);
  if(!c){c=typeof AV_ras==='function'?AV_ras(60+J1_DX,46+J1_DY,J1_escarabajoOps(f,fl,ojo),false):null;if(!c)return false;J1_ESC.set(clave,c);}
  const luz=typeof LUZ_luz==='function'&&LUZ_luz();const img=luz&&!fl&&typeof LUZ_sprite==='function'?LUZ_sprite(c,luz):c;
  ctx.save();ctx.translate(Math.round(b.x),Math.round(b.y));if(b.face>0){ctx.translate(b.w,0);ctx.scale(-1,1);} // espejo exacto
  ctx.drawImage(img,-3-J1_DX,-3-J1_DY);
  // la luz de la antena y el fogonazo del caño de abajo en ráfaga
  ctx.fillStyle=(T>>4)%2?'#ff3b30':'#5a1a14';ctx.fillRect(42,-7,2,2);
  if(b.burst>0&&b.bt>6&&(T>>1)%2){ctx.fillStyle='#ffef9a';ctx.fillRect(-4,28,2,2);}
  ctx.restore();
  if(!fl&&typeof LUZ_halo==='function'){const ex=b.face>0?b.x+b.w-24:b.x+24;LUZ_halo(ex,b.y+9.5,5,'#ff3b30',0.35);} // ojo
  return true;
}
if(typeof drawBoss==='function'){const J1_drawBoss0=drawBoss;drawBoss=function(b){
  if(typeof levelIdx==='number'&&levelIdx!==0)return J1_drawBoss0.call(this,b); // otras misiones que usen este tanque, como estaban
  try{if(J1_escarabajo(b))return;}catch(e){}
  return J1_drawBoss0.call(this,b);
};}
// ---------- Don Bulón: redibujado en píxeles (misma forma y mismas poses que jefes.js) + diente dorado ----------
// Piernas en tramos de 3 px con rodillas y tobillos de 3 × 3 y pies planos; torso con rampa (luz arriba, sombra abajo,
// manchas de óxido) como el ESCARABAJO; el ojo y los remaches en metal o ámbar apagado (#8a5a3a / #c0b0a0): el diente
// del pecho es lo único dorado. El cañón sube en ángulo calculado por píxel (sin rotate). Se dibuja en dos pasadas
// (tinta agrandada 1 px y color) y después LUZ_vivo le pone el borde de luz.
const J1_DIENTE=['.#.#.','#####','##.##','#####','.#.#.'];
function J1_diente(x,y){
  x=Math.round(x);y=Math.round(y);
  ctx.fillStyle='#120c18';J1_DIENTE.forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#')ctx.fillRect(x+i-1,y+j-1,3,3);});
  J1_DIENTE.forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#'){ctx.fillStyle=i+j<=2?'#fff0b0':i+j>=6?'#7a5a1a':'#d8a83a';ctx.fillRect(x+i,y+j,1,1);}});
  ctx.fillStyle='#3a2a10';ctx.fillRect(x+2,y+2,1,1);
  if(typeof LUZ_halo==='function'){const lat=J1_red()?0.4:0.32+0.12*Math.sin(T/40);LUZ_halo(x+2.5,y+2.5,8,'#ffd860',lat);}
}
// primitivas en píxeles enteros; con J1.tinta, cada una se dibuja agrandada 1 px en tinta
const J1={tinta:false,fl:false};
const J1_c=c=>J1.tinta?'#17141f':J1.fl?'#ffffff':c;
function J1_R(x,y,w,h,c){x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);if(w<=0||h<=0)return;ctx.fillStyle=J1_c(c);if(J1.tinta)ctx.fillRect(x-1,y-1,w+2,h+2);else ctx.fillRect(x,y,w,h);}
function J1_seg(x0,y0,x1,y1,g,c){const n=Math.max(1,Math.round(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));const o=Math.floor(g/2);
  for(let i=0;i<=n;i++){const x=Math.round(x0+(x1-x0)*i/n)-o,y=Math.round(y0+(y1-y0)*i/n)-o;J1_R(x,y,g,g,c);}}
function J1_poly(pts,colY){ // relleno por filas; colY(y) da el color de cada fila (para la rampa)
  let y0=1e9,y1=-1e9;for(const[,y]of pts){y0=Math.min(y0,y);y1=Math.max(y1,y);}
  for(let y=Math.floor(y0);y<=Math.ceil(y1);y++){const Y=y+0.5,xs=[];
    for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[xi,yi]=pts[i],[xj,yj]=pts[j];if((yi>Y)!==(yj>Y))xs.push(xi+(Y-yi)*(xj-xi)/(yj-yi));}
    xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2){const a=Math.round(xs[k]),b=Math.round(xs[k+1]);if(b>a)J1_R(a,y,b-a,1,typeof colY==='function'?colY(y):colY);}}}
function J1_disco(cx,cy,r,c){cx=Math.round(cx);cy=Math.round(cy);for(let dy=-r;dy<=r;dy++){const w=Math.floor(Math.sqrt(r*r-dy*dy+r*0.6));J1_R(cx-w,cy+dy,2*w+1,1,c);}}
function J1_bulonPx(b){
  const dead=b.state==='dying',sq=Math.round(b.sq||0);
  const tele=b.mode==='stompT'||b.mode==='shellsT'||b.mode==='flyT'||b.mode==='dropT'||b.mode==='lock';
  const jets=!dead&&(b.mode==='rise'||b.mode==='hover'||b.mode==='lock'||b.mode==='descend'||(b.state==='enter'&&b.t>=60));
  const walkPh=(b.anim||0)*0.24;
  // patas (la de atrás más oscura): cadera, rodilla, tobillo y pie plano; rodilla hacia adelante
  const legs=[[15,13,'#4a2a22','#5e3428'],[29,31,'#7a3a2c','#a0573e']];
  legs.forEach(([hx,fx0,c1,c2],i)=>{
    const hy=30+sq;let fx=fx0,fy=56;
    if(jets||(!b.onGround&&b.state==='fight')){fy=50;fx=fx0+(i?2:-2);}
    else{const s=Math.sin(walkPh+(i?Math.PI:0));if(b.mode==='walk'){fx+=s*4;fy-=Math.max(0,Math.cos(walkPh+(i?Math.PI:0)))*2*((b.anim||0)>0?1:0);}
      if(i===1&&b.lift>0){fy=56-b.lift;fx+=b.lift*0.3;}}
    const ax=fx,ay=fy-5,dx=ax-hx,dy=ay-hy,l=Math.hypot(dx,dy)||1,seg=15,bend=Math.sqrt(Math.max(0,seg*seg-l*l/4));
    const kx=(hx+ax)/2+dy/l*bend,ky=(hy+ay)/2-dx/l*bend;
    J1_seg(hx,hy,kx,ky,3,c1);J1_seg(kx,ky,ax,ay,3,c2);
    J1_R(kx-1,ky-1,3,3,'#8a5a3a');J1_R(kx-1,ky-1,2,1,'#c0b0a0');                 // rodilla 3 × 3 (metal)
    J1_R(ax-1,ay-1,3,3,'#6a5a50');                                                   // tobillo 3 × 3
    J1_R(fx-7,fy-4,14,4,'#24181a');J1_R(fx-6,fy-4,12,1,'#5a3a30');J1_R(fx+6,fy-3,3,3,'#3a2a24');J1_R(fx-9,fy-2,2,2,'#3a2a24'); // pie plano
    if(jets&&!J1.tinta){const f=5+((T>>1)%2)*3;for(let r=0;r<f;r++){const w=Math.max(1,Math.round(8*(1-r/f)));J1_R(fx-w/2,fy+r,w,1,r<f*0.4?'#fff3b0':'#ff8a2a');}}
  });
  // brazo de atrás con pinza
  const pin=Math.round(Math.abs(Math.sin(b.t/12))*2);
  J1_seg(7,15+sq,2,25+sq,3,'#4a2a22');J1_seg(2,25+sq,4,32+sq,3,'#4a2a22');
  J1_seg(4,32+sq,-pin,37+sq,2,'#6a6a72');J1_seg(4,32+sq,8+pin,37+sq,2,'#6a6a72');
  // chimenea
  J1_R(2,-6+sq,6,17,'#2a2a30');J1_R(1,-8+sq,8,3,'#3a3a44');if(!J1.tinta)J1_R(3,-7+sq,4,1,b.mode==='flyT'&&(T>>1)%2?'#ffb43a':'#120c18');
  // torso con rampa: luz arriba, cuerpo, sombra abajo
  J1_poly([[5,12+sq],[37,9+sq],[42,17+sq],[41,33+sq],[9,37+sq],[3,24+sq]],y=>y<=12+sq?'#e0905e':y<=15+sq?'#c86a48':y>=33+sq?'#5a2418':y>=30+sq?'#7a3424':'#a8503a');
  if(!J1.tinta){
    J1_R(12,15+sq,4,2,'#6a3a2a');J1_R(26,33+sq,5,1,'#6a3a2a');J1_R(34,25+sq,3,2,'#8a4a32');            // manchas de óxido
    for(let i=0;i<7;i++)J1_R(11+i*4,27+sq,4,3,i%2?'#1d1a1c':'#d9a43a');                                 // franja de peligro
    for(let i=0;i<3;i++)J1_R(12,19+i*2+sq,9,1,'#4a1810');                                               // rejilla
    J1_R(25,19+sq,3,3,tele&&(T>>2)%2?'#ff3b30':'#5a1a14');                                              // lámpara de aviso
    J1_R(31,17+sq,5,8,'#120c18');const fu=Math.max(0,Math.min(1,b.fuel/b.fmax)),hf=Math.round(6*fu);
    J1_R(32,18+sq+6-hf,3,hf,fu<0.34?((T>>3)%2?'#ff5a3c':'#a02a1a'):'#7dff9a');                          // combustible
  }
  // hombrera de atrás
  J1_R(0,8+sq,11,9,'#7a2a1c');J1_R(1,8+sq,9,2,'#a8402a');J1_R(0,16+sq,11,1,'#4a1810');
  // cabeza con rampa, rejilla y antenas
  J1_R(14,sq,16,11,'#8c3b2a');J1_R(14,sq,16,2,'#c06040');J1_R(14,9+sq,16,2,'#5a2418');
  if(!J1.tinta)for(let i=0;i<3;i++)J1_R(16+i*3,8+sq,1,2,'#3a1a12');
  J1_seg(16,sq,14,-8+sq,1,'#2a2a30');J1_seg(21,sq,23,-7+sq,1,'#2a2a30');
  if(!J1.tinta){const ab=(T>>4)%2;J1_R(13,-10+sq,2,2,dead?'#2a5a34':ab?'#7dff9a':'#2a5a34');J1_R(22,-9+sq,2,2,dead?'#2a5a34':ab?'#2a5a34':'#7dff9a');}
  // el ojo: lente de metal con iris ámbar apagado que mira al jugador (rojo cuando avisa un ataque)
  J1_disco(26,6+sq,4,'#3a2a24');
  if(!J1.tinta){const ey=Math.max(-1,Math.min(1,Math.round(((typeof P!=='undefined'&&P?P.y:GROUND)-(b.y+5))/40)));
    J1_disco(26,6+sq,3,'#c0b0a0');J1_disco(27,6+sq+ey,2,dead?'#3a1a0a':tele&&(T>>1)%2?'#ff3b30':'#8a5a3a');J1_R(27,6+sq+ey,1,1,'#120c18');J1_R(24,3+sq,1,1,'#ffffff');}
  // brazo de adelante: cañón que sube (ángulo calculado por píxel)
  const a=-(b.raise||0)*0.35,cs=Math.cos(a),sn=Math.sin(a),ox=38,oy=14+sq,rot=(x,y)=>[ox+x*cs-y*sn,oy+x*sn+y*cs];
  J1_seg(...rot(0,0),...rot(3,7),3,'#4a2a22');
  J1_poly([rot(-3,6),rot(16,6),rot(16,13),rot(-3,13)],y=>'#2a2a30');
  J1_poly([rot(-3,6),rot(16,6),rot(16,7),rot(-3,7)],y=>'#45454e');
  J1_poly([rot(14,5),rot(18,5),rot(18,14),rot(14,14)],y=>'#1a1a20');
  if(!J1.tinta){J1_poly([rot(2,6),rot(4.5,6),rot(4.5,13),rot(2,13)],y=>'#c04a30');const[mx,my]=rot(17,9.5);J1_R(mx-1,my-2,2,5,b.mode==='shellsT'&&(T>>1)%2?'#ffef9a':'#3a1a12');}
  // hombrera de adelante (los remaches, metal)
  J1_R(32,7+sq,13,10,'#c04a30');J1_R(33,7+sq,11,2,'#e06a48');J1_R(34,15+sq,10,2,'#6e2418');
  if(!J1.tinta){J1_R(35,11+sq,1,1,'#c0b0a0');J1_R(42,11+sq,1,1,'#c0b0a0');}
}
if(typeof drawBulon==='function'){const J1_bulon0=drawBulon;drawBulon=function(b){
  if(typeof LUZ_vivo!=='function')return J1_bulon0.call(this,b);
  const dead=b.state==='dying',fl=b.flash>0||(dead&&(T>>2)%2);
  // sombra y marca de caída mientras vuela (en el mundo, en píxeles)
  if(!dead&&b.y+b.h<GROUND-6&&b.y>-60){const cx=b.x+b.w/2,s=Math.max(0.35,Math.min(1,1-(GROUND-b.y-b.h)/150));
    if(typeof LUZ_sombra==='function')LUZ_sombra(cx,GROUND,28+20*s,0);
    if(b.mode==='lock'||b.mode==='slam'||(b.state==='enter'&&b.t>=60)){const on=(T>>2)%2;ctx.fillStyle=on?'#ff3b30':'#8a1a14';const xl=Math.round(b.x),xr=Math.round(b.x+b.w);
      ctx.fillRect(xl,GROUND-4,7,2);ctx.fillRect(xl,GROUND-4,2,4);ctx.fillRect(xr-7,GROUND-4,7,2);ctx.fillRect(xr-2,GROUND-4,2,4);
      if(on){ctx.fillRect(Math.round(cx)-1,GROUND-8,2,3);ctx.fillRect(Math.round(cx),GROUND-4,1,1);}}}
  const X=Math.round(b.x),Y=Math.round(b.y),x0=X-26,y0=Y-24;
  LUZ_vivo('bulon',x0,y0,b.w+52,b.h+56,()=>{
    ctx.save();ctx.translate(X,Y);if(b.face<0){ctx.translate(b.w,0);ctx.scale(-1,1);}
    J1.fl=fl;J1.tinta=true;J1_bulonPx(b);J1.tinta=false;J1_bulonPx(b);J1.fl=false;
    ctx.restore();});
  if(dead||fl||b.y<-60)return;
  const sq=Math.round(b.sq||0),lx=19,ly=19+sq,x=b.face<0?X+b.w-lx-5:X+lx;J1_diente(x,Y+ly); // el diente dorado, en el pecho
};}
// ---------- brasas de los tachos (M1) ----------
ON_STEP.push(()=>{
  if(typeof levelIdx!=='number'||levelIdx!==0||typeof state==='undefined'||state!=='play'||T%5)return;
  try{if(!(typeof ESC_activo==='function'&&ESC_activo()&&typeof ESC_lucesNivel==='function'))return;
    const d=ESC_def(),vista=typeof ESC_enVista==='function'?ESC_enVista(ESC_lucesNivel(d),10):[];
    for(const[l]of vista){if(l.tipo!=='fuego'||Math.random()<0.35)continue;
      parts.push({k:'p',x:l.x+rand(-2,2),y:l.y-6,vx:rand(-0.15,0.15),vy:rand(-0.7,-0.35),g:-0.004,life:rand(28,46),maxl:46,size:1,col:Math.random()<0.5?'#ffb46a':'#ff7a2a'});}
  }catch(e){}
});
// ---------- CHATARRA (vehículo de M1, y de todas las misiones donde aparezca): captura en vivo con contorno y borde ----------
// Las patas se mueven todo el tiempo: se captura cada cuadro (como DON BULÓN), con lo rudo de II y III incluido.
if(typeof drawMech==='function'){const J1_mech0=drawMech;drawMech=function(m){
  if(typeof LUZ_vivo!=='function'||!m||m.fus>0||(typeof VH_t==='function'&&VH_t(m)))return J1_mech0.call(this,m); // los vehículos nuevos ya traen su borde
  if(typeof onScreen==='function'&&!onScreen(m,30))return;
  const esc=typeof FU_NIV!=='undefined'&&FU_NIV[m.lvl||1]?FU_NIV[m.lvl||1].esc:1;
  const x0=Math.floor(m.x)-24,y0=Math.floor(m.y)-30,w=m.w*esc+48,h=Math.max(m.h*esc+44,(GROUND+6)-y0);
  LUZ_vivo('chatarra',x0,y0,w,Math.min(h,240),()=>J1_mech0.call(this,m));
};}
