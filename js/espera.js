'use strict';
// Óxido · Animaciones de espera: si no tocás nada ~5 s, cada personaje se pone a hacer otra cosa.
//   FACU: se sienta en un banquito frente a una computadora y tipea (el monitor le ilumina la cara).
//   JOSÉ: se sienta a jugar en una tablet; la pantalla le ilumina la cara con un brillo que titila.
//   LAUTI: hace jueguitos con una pelota de fútbol.
// Cualquier botón la corta al instante (el disparo o el salto de ese cuadro se hace igual: esto solo dibuja).
// No arranca arriba del Grillo, en el aire, en el barro, con enemigos en pantalla ni al ganar. En pausa no corre.
// Cada jugador cuenta por separado. Tablet y computadora genéricas, sin marcas. Prefijo ES_.
const ES_ESPERA=300; // cuadros sin tocar nada (~5 s)
const ES_ACC=['left','right','up','down','jump','shoot','bomb','swap','air'];
function ES_quieto(p){
  if(p.dead||p.ride||!p.onGround||p.crouch||Math.abs(p.vx)>0.01||winT)return false;
  if(L.speedMul&&L.speedMul(p)<1)return false;                                   // barro, arena movediza…
  for(const e of enemies)if(!e.gone&&onScreen(e,0))return false;
  for(const a of ES_ACC)if(held(a)||tapped(a))return false;
  return true;
}
ON_STEP.push(()=>{
  if(state!=='play')return;
  eachPlayer(p=>{
    const antes=p.esT||0;
    p.esT=ES_quieto(p)?antes+1:0;
    if(antes>=ES_ESPERA&&!p.esT)dust(p.x+4+p.face*6,GROUND);                     // se cortó: guarda todo de golpe
    if(p.esT===ES_ESPERA)dust(p.x+4+p.face*7,p.y+18);
    if(p.esT>ES_ESPERA)ES_sonido(p,p.esT-ES_ESPERA);
  });
});
const ES_esperando=p=>(p.esT||0)>=ES_ESPERA;
// sonidos chiquitos (bien bajos, debajo de la música)
function ES_sonido(p,a){
  if(typeof tone!=='function')return;
  try{
    if(p.ci===2){if(a%34===1)tone('sine',180,120,0.05,0.025);}                   // pique de la pelota
    else if(p.ci===0){const k=a%90;if(k<56&&k%5===0&&Math.random()<0.8)tone('square',1800+Math.random()*600,1500,0.012,0.008);} // tecleo
    else if(p.ci===1){if(a%240===200)[1320,1760].forEach((f,i)=>later(i*60,()=>tone('square',f,f,0.04,0.012)));} // ganó un nivel
  }catch(e){}
}
// ---------- dibujo ----------
const ES_drawPlayer=drawPlayer;
drawPlayer=function(){
  const p=P;
  if(!ES_esperando(p)||p.dead||p.ride)return ES_drawPlayer();
  const a=p.esT-ES_ESPERA,f=p.face>0?0:1,set=playerSet(p),fc=p.face;
  if(p.ci===0)ES_facu(p,a,set,f,fc);else if(p.ci===1)ES_jose(p,a,set,f,fc);else ES_lauti(p,a,set,f,fc);
  if(p.shield>0){const al=0.45+Math.sin(T/6)*0.2;ctx.strokeStyle=`rgba(120,220,255,${al})`;ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(p.x+4,p.y+9,11,13,0,0,7);ctx.stroke();}
};
const ES_r=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(q(x),q(y),w,h);};
// luz que suma (ilumina sin tapar los rasgos)
function ES_glow(c,x,y,w,h){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=c;ctx.fillRect(q(x),q(y),w,h);ctx.restore();}
// x relativo al frente del personaje (fc=1 mira a la derecha)
const ES_fx=(p,dx,w=1)=>p.face>0?p.x+4+dx:p.x+4-dx-w;
// FACU: banquito, mesita, monitor de costado, teclado, taza humeante. Tipea en ráfagas y se rasca la barba.
function ES_facu(p,a,set,f,fc){
  const g=p.y+18;
  ES_r('#5a3a22',ES_fx(p,-4,7),g-4,7,1);ES_r('#3e2817',ES_fx(p,-3,1),g-3,1,3);ES_r('#3e2817',ES_fx(p,1,1),g-3,1,3); // banquito
  ctx.drawImage(set.crouch[f],q(p.x-3),q(p.y+1));                                                             // sentado
  // mesita
  ES_r('#6e4a2c',ES_fx(p,5,13),g-9,13,2);ES_r('#4a311c',ES_fx(p,6,1),g-7,1,7);ES_r('#4a311c',ES_fx(p,16,1),g-7,1,7);
  // monitor genérico: base, pie y pantalla vista de costado (gris, sin logo)
  ES_r('#2a2e36',ES_fx(p,10,5),g-10,5,1);ES_r('#2a2e36',ES_fx(p,12,1),g-13,1,3);ES_r('#3a404a',ES_fx(p,11,2),g-21,2,9);
  const fl=0.75+0.25*Math.sin(a/3)*Math.sin(a/7);                                                             // el brillo titila
  ES_r(`rgba(140,210,255,${0.9*fl})`,ES_fx(p,10,1),g-20,1,7);                                                // pantalla encendida
  // luz del monitor: cono suave hasta la cara y la cara iluminada
  ctx.fillStyle=`rgba(120,200,255,${0.10*fl})`;ctx.beginPath();
  ctx.moveTo(ES_fx(p,10),g-20);ctx.lineTo(ES_fx(p,10),g-13);ctx.lineTo(ES_fx(p,4),p.y+10);ctx.lineTo(ES_fx(p,4),p.y+5);ctx.fill();
  ES_glow(`rgba(110,170,230,${0.42*fl})`,ES_fx(p,2,3),p.y+5,3,4);
  // teclado y manos: tipea en ráfagas (56 de cada 90 cuadros); en la pausa se rasca la barba
  ES_r('#1e2128',ES_fx(p,6,4),g-10,4,1);
  const k=a%90,typing=k<56;
  if(typing){const h=(a>>1)%2;ES_r('#efb88d',ES_fx(p,6+h,1),g-11,1,1);ES_r('#efb88d',ES_fx(p,8-h,1),g-11+((a>>2)%2),1,1);}
  else ES_r('#efb88d',ES_fx(p,3,1),p.y+8+((a>>3)%2),1,1);
  // taza con vapor
  ES_r('#d8d2c4',ES_fx(p,14,2),g-12,2,3);
  for(let i=0;i<2;i++){const s=(a*0.25+i*6)%12;ctx.fillStyle=`rgba(230,230,240,${0.4-s/30})`;ctx.fillRect(q(ES_fx(p,15)+Math.sin((a+i*20)/8)*0.8),q(g-13-s),1,1);}
}
// JOSÉ: sentada, tablet en las manos a la altura de la cara; luz de colores que cambia según "el juego".
function ES_jose(p,a,set,f,fc){
  ctx.drawImage(set.crouch[f],q(p.x-3),q(p.y+3));
  const cols=['120,220,255','255,140,210','255,220,110','140,255,160'],ci=Math.floor(a/50)%4;
  const fl=0.7+0.3*Math.sin(a/2.3)*Math.sin(a/5.1);
  // tablet genérica (de costado): marco oscuro y el borde de la pantalla prendido
  const tx=ES_fx(p,5,2),ty=p.y+8;
  ES_r('#22252c',tx,ty,2,6);ES_r(`rgba(${cols[ci]},${0.95*fl})`,ES_fx(p,5,1),ty+1,1,4);
  // manos sosteniéndola y pulgares que tocan
  ES_r('#c98a5e',ES_fx(p,3,2),ty+4,2,1);ES_r('#c98a5e',ES_fx(p,4,1),ty+1+((a>>2)%3),1,1);
  // la pantalla le ilumina la cara
  ES_glow(`rgba(${cols[ci]},${0.5*fl})`,ES_fx(p,2,3),p.y+7,3,4);
  ctx.fillStyle=`rgba(${cols[ci]},${0.08*fl})`;ctx.beginPath();
  ctx.moveTo(tx+1,ty+1);ctx.lineTo(ES_fx(p,1),p.y+5);ctx.lineTo(ES_fx(p,1),p.y+12);ctx.lineTo(tx+1,ty+5);ctx.fill();
  // cada tanto gana un nivel: saltito de festejo y una estrellita
  const k=a%240;
  if(k>=200&&k<236){const s=k-200;ctx.fillStyle=`rgba(255,230,120,${1-s/36})`;
    const sx=p.x+4,sy=p.y+1-s*0.4;ctx.fillRect(q(sx-0.5),q(sy-1.5),1,3);ctx.fillRect(q(sx-1.5),q(sy-0.5),3,1);}
}
// pelota de fútbol (r ≈ 2,5): borde fino, cuerpo blanco con brillo y 3 manchas en el borde, a 120°, que giran con ang
function ES_pelota(x,y,ang){
  ctx.fillStyle='#2a2433';circle(x,y,2.6);
  ctx.fillStyle='#f6f4ee';circle(x,y,2.05);
  ctx.fillStyle='#cfcac0';ctx.fillRect(x-0.6,y+0.9,2,0.9);                  // sombreado abajo
  ctx.fillStyle='#17141f';
  // manchas pegadas al borde (como los gajos que se ven de costado), nunca en el centro: así no parece una cara
  for(let i=0;i<3;i++){const b=ang+i*2.094;ctx.fillRect(x+Math.cos(b)*1.7-0.6,y+Math.sin(b)*1.7-0.6,1.2,1.2);}
  ctx.fillStyle='#ffffff';ctx.fillRect(x-1.5,y-1.6,0.9,0.7);                 // brillo arriba a la izquierda
}
// LAUTI: de pie, jueguitos alternando pies; cada tanto la levanta más alto y la para con la cabeza.
function ES_lauti(p,a,set,f,fc){
  const per=34,n=Math.floor(a/per),t=a%per,alto=n%5===4;
  const pose=rigPose(p);
  if(t<5){pose.leg=n%2?'r0':'r3';pose.uy=0;}                                       // patea: una pierna arriba
  drawRig(set,pose,f,p.x-3,p.y);
  const top=alto?p.y-(p.card?0:4):p.y+4,foot=p.y+15; // en la tarjeta la alta sube menos, para no salirse del marco
  const k=t/per,by=foot-(foot-top)*4*k*(1-k),bx=ES_fx(p,alto?1:5+Math.sin(n*1.7)*1.2,0);
  // sombra en el piso: se achica y se aclara cuando la pelota sube
  const up=(foot-by)/Math.max(1,foot-top),sh=4.5-up*2.5;
  ctx.fillStyle='rgba(0,0,0,'+(0.32-up*0.14).toFixed(3)+')';ctx.fillRect(bx-sh/2,p.y+17.4,sh,1);
  // pelota de fútbol: blanca, borde oscuro fino y 3 manchas chicas lejos del centro que giran con cada patada
  ES_pelota(bx,by,n*2.1+(n%2?1:-1)*t*0.32);
}

// ---------- pantalla de elegir personaje ----------
// Después de ~5 s sin tocar nada, las tres tarjetas hacen lo suyo (sin sonido: suena la música del título).
// Cualquier tecla o botón (de cualquier jugador) las vuelve a su pose al instante.
let ES_selT=0;
const ES_updSelect0=updSelect;
updSelect=function(){
  const algo=selT===1||Object.values(pressed).some(Boolean)||Object.values(pressed2).some(Boolean)||
    ES_ACC.some(a=>keys[a]||padState[a]||padSt2[a]);
  ES_selT=algo?0:ES_selT+1;
  return ES_updSelect0();
};
const ES_tar=CHARS.map((c,i)=>({ci:i,x:0,y:0,w:8,h:18,face:1,vx:0,vy:0,onGround:true,dist:0,lean:0,rec:0,shield:0,esT:0,slot:0,card:true}));
// dibuja la tarjeta i escalada ×3 con la esquina del sprite en (sx,sy); devuelve false si no está esperando
function ES_tarjeta(i,sx,sy){
  if(state!=='select'||ES_selT<ES_ESPERA)return false;
  const p=ES_tar[i],a=ES_selT-ES_ESPERA+i*23;          // cada uno arranca un poquito corrido
  p.esT=ES_ESPERA+a;p.x=i===0?-6:0;                   // FACU un poco a la izquierda para que entre la mesita
  const set=SPR.chars[i],keep=P;
  // a 2,5× (no 3×) para que el monitor y la pelota alta entren en la tarjeta sin tapar el nombre
  ctx.save();ctx.translate(q(sx)+21-4*2.5,q(sy)+8);ctx.scale(2.5,2.5);
  try{P=p;if(i===0)ES_facu(p,a,set,0,1);else if(i===1)ES_jose(p,a,set,0,1);else ES_lauti(p,a,set,0,1);}
  finally{P=keep;ctx.restore();}
  return true;
}
