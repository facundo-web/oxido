'use strict';
// Óxido · M4 en estilo "Hondo" (notas/arte/guia.md). Va después de arte-jefes-m10.js, antes de juego.js.
// · CHACAL DE BRONCE (jefe chico): capturado en píxeles con contorno y borde de luz, conservando lo transparente; sus
//   dos toques dorados pasan a bronce.
// · REY POLVO (villano): capturado en píxeles con contorno y borde de luz. La corona pasa a BRONCE VIEJO APAGADO
//   (#8a6a3a / #5a4426) con la grieta oscura, y el DIENTE DORADO brilla adentro de la grieta: es lo único dorado. El
//   báculo, la orla del manto, el collar y los glifos del sarcófago pasan a bronce o madera apagados.
// Usa J6A_conColores (arte-jefes-m6.js) y LUZ_vivo (arte-luz.js). Prefijo J4A_.
const J4A_red=()=>typeof MOV_reducido==='function'&&MOV_reducido();
const J4A_REY={'#e0b040':'#8a6a3a','#c89030':'#5a4426','#e8c860':'#8a6a3a','#e8c050':'#7a5a32','#5a3a18':'#4a3018'};
const J4A_CHACAL={'#e8c050':'#b08850','#d8a040':'#a87a40'};
const J4A_DIENTE=['.##.','####','#.##','.##.']; // 4 × 4: en la corona chica se tiene que leer el bronce
function J4A_diente(x,y){
  x=Math.round(x);y=Math.round(y);
  ctx.fillStyle='#120c18';J4A_DIENTE.forEach((r,j)=>{for(let i=0;i<4;i++)if(r[i]==='#')ctx.fillRect(x+i-1,y+j-1,3,3);});
  J4A_DIENTE.forEach((r,j)=>{for(let i=0;i<4;i++)if(r[i]==='#'){ctx.fillStyle=i+j<=1?'#fff0b0':i+j>=5?'#7a5a1a':'#d8a83a';ctx.fillRect(x+i,y+j,1,1);}});
  if(typeof LUZ_halo==='function'){const lat=J4A_red()?0.3:0.24+0.08*Math.sin(T/30);LUZ_halo(x+2,y+2,8,'#ffd860',lat);}
}
// báculo: palo sólido de 2 px en madera (con tinta), aros de bronce y la gema arriba. Se dibuja adentro de la captura,
// antes del cuerpo (queda detrás, como la mano de atrás), y el báculo original (que salía punteado) se saltea.
function J4A_baculo(b){
  const cx=b.x+b.w/2,by=b.y+b.bob,f=b.face<0?-1:1,st=b.staff||0,a=-0.15-st*0.35,sn=Math.sin(a),cs=Math.cos(a);
  const P=y=>[cx+f*(-6+(-y*sn)),by+14+y*cs];
  const linea=(y0,y1,g,col)=>{const[x0,yy0]=P(y0),[x1,yy1]=P(y1),n=Math.max(1,Math.round(Math.hypot(x1-x0,yy1-yy0)));ctx.fillStyle=col;
    for(let i=0;i<=n;i++)ctx.fillRect(Math.round(x0+(x1-x0)*i/n)-(g>>1),Math.round(yy0+(yy1-yy0)*i/n)-(g>>1),g,g);};
  linea(-21,18,4,'#17141f');linea(-21,18,2,'#6a4a28');
  for(const yy of[-14,4]){const[x,y]=P(yy);ctx.fillStyle='#17141f';ctx.fillRect(Math.round(x)-2,Math.round(y)-2,5,4);ctx.fillStyle='#8a6a3a';ctx.fillRect(Math.round(x)-1,Math.round(y)-1,3,2);}
  const[gx,gy]=P(-24),X=Math.round(gx),Y=Math.round(gy);
  ctx.fillStyle='#17141f';ctx.fillRect(X-3,Y-4,7,9);ctx.fillStyle='#8a6a3a';ctx.fillRect(X-2,Y-3,5,7);ctx.fillStyle='#5a4426';ctx.fillRect(X-2,Y+3,5,1);
  ctx.fillStyle=st>0.3&&(T>>1)%2?'#d0ffe8':'#3ac08a';ctx.fillRect(X-1,Y-2,3,4);ctx.fillStyle='#d0ffe8';ctx.fillRect(X-1,Y-2,1,1);
  if(st>0.3&&typeof LUZ_halo==='function')LUZ_halo(X+0.5,Y,7,'#7affd0',0.3*st);
}
function J4A_sinBaculo(b,dib){ // saltea lo que dibuja el báculo original (desde su rotate hasta su restore)
  const ang=-0.15-(b.staff||0)*0.35,r0=ctx.rotate,s0=ctx.save,re0=ctx.restore,fr0=ctx.fillRect,fi0=ctx.fill;let d=0,salta=-1;
  ctx.save=function(){d++;return s0.apply(ctx,arguments);};
  ctx.restore=function(){if(salta>=0&&d<=salta)salta=-1;d--;return re0.apply(ctx,arguments);};
  ctx.rotate=function(x){if(salta<0&&Math.abs(x-ang)<1e-9)salta=d;return r0.apply(ctx,arguments);};
  ctx.fillRect=function(){if(salta>=0)return;return fr0.apply(ctx,arguments);};
  ctx.fill=function(){if(salta>=0)return;return fi0.apply(ctx,arguments);};
  try{return dib();}finally{ctx.save=s0;ctx.restore=re0;ctx.rotate=r0;ctx.fillRect=fr0;ctx.fill=fi0;}
}
const J4A_col=(m,fn)=>typeof J6A_conColores==='function'?J6A_conColores(m,{},fn):fn();
if(typeof J4_drawChacal==='function'&&typeof LUZ_vivo==='function'){const J4A_ch0=J4_drawChacal;J4_drawChacal=function(b){
  const X=Math.floor(b.x);
  LUZ_vivo('chacal',X-50,GROUND-70,b.w+100,78,()=>J4A_col(J4A_CHACAL,()=>J4A_ch0.call(this,b)),{umbral:'suave'});
};}
if(typeof J4_drawRey==='function'&&typeof LUZ_vivo==='function'){const J4A_rey0=J4_drawRey;J4_drawRey=function(b){
  const conBaculo=b.state!=='hide'&&!(b.state==='enter'&&b.t<104)&&!((b.crumb||0)>0.3);
  LUZ_vivo('rey',Math.floor(b.A)-8,GROUND-120,W+16,128,()=>J4A_col(J4A_REY,()=>{
    if(!conBaculo)return J4A_rey0.call(this,b);
    // el báculo va justo después del sarcófago y antes del cuerpo (como en el dibujo original)
    const sarco0=J4_bigSarco;J4_bigSarco=function(){const r=sarco0.apply(this,arguments);try{J4A_baculo(b);}catch(e){}return r;};
    try{return J4A_sinBaculo(b,()=>J4A_rey0.call(this,b));}finally{J4_bigSarco=sarco0;}}),{umbral:'suave'});
  try{
    if(b.crown){J4A_diente(b.crown.x-2,b.crown.y-4);return;} // la corona cayó: el diente va con ella
    if(b.state==='hide'||(b.state==='enter'&&b.t<104))return;
    if(b.flash>0&&(T>>1)%2)return;
    const out=b.state==='enter'||b.mode==='enterS'||b.mode==='dazed'?b.out:1;if(out<0.6)return;
    const cx=b.x+b.w/2,by=b.y+b.bob,cr=b.crumb||0;if(cr>0.05)return; // se está deshaciendo de arriba hacia abajo
    // en la grieta de la corona (corona: y −1.5 a −8 sobre la cabeza; grieta en x +1)
    const gx=cx+(b.face<0?-1.4:1.4),gy=by+2-4.5;
    ctx.fillStyle='#1a0e08';ctx.fillRect(Math.round(gx)-1,Math.round(gy)-4,3,8); // la grieta, abierta
    J4A_diente(gx-2,gy-2);
  }catch(e){}
};}
