'use strict';
// Óxido · M9 en estilo "Hondo" (notas/arte/guia.md). Va después de arte-jefes-m5.js, antes de juego.js.
// · EL CASERO (guardián): el marco del espejo y las manijas del ropero pasan de dorado a bronce apagado; el DIENTE
//   DORADO va EN el marco del espejo, arriba (donde colgaba), con su halo chico. Es lo único dorado.
// · La vajilla que va a tirar (tazas y platos en fila): la burbuja lisa semitransparente pasa a un anillo de píxeles de
//   1 px continuo, en blanco lila fantasma, que titila suave.
// Prefijo J9A_.
const J9A_red=()=>typeof MOV_reducido==='function'&&MOV_reducido();
// colores que cambian mientras se dibuja (el dorado del marco y de las manijas → bronce apagado)
const J9A_CAMBIA={'#a08040':'#6e5236','#c9a040':'#8a6a48'};
function J9A_conColores(fn){
  const p=Object.getPrototypeOf(ctx),d=Object.getOwnPropertyDescriptor(p,'fillStyle');if(!d||!d.set)return fn();
  Object.defineProperty(ctx,'fillStyle',{configurable:true,get(){return d.get.call(ctx);},set(v){d.set.call(ctx,typeof v==='string'&&J9A_CAMBIA[v.toLowerCase()]||v);}});
  try{return fn();}finally{delete ctx.fillStyle;}
}
const J9A_DIENTE=['.#.#.','#####','##.##','#####','.#.#.'];
function J9A_diente(x,y){
  x=Math.round(x);y=Math.round(y);
  ctx.fillStyle='#120c18';J9A_DIENTE.forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#')ctx.fillRect(x+i-1,y+j-1,3,3);});
  J9A_DIENTE.forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#'){ctx.fillStyle=i+j<=2?'#fff0b0':i+j>=6?'#7a5a1a':'#d8a83a';ctx.fillRect(x+i,y+j,1,1);}});
  ctx.fillStyle='#3a2a10';ctx.fillRect(x+2,y+2,1,1);
  if(typeof LUZ_halo==='function'){const lat=J9A_red()?0.36:0.3+0.1*Math.sin(T/40);LUZ_halo(x+2.5,y+2.5,8,'#ffd860',lat);}
}
if(typeof J9_drawCas==='function'){const J9A_cas0=J9_drawCas;J9_drawCas=function(b){
  const r=J9A_conColores(()=>J9A_cas0.call(this,b));
  try{
    if(b.state==='enter'&&b.t<40)return r;
    const fl=b.flash>0||(b.state==='dying'&&b.t<150&&(T>>2)%2),p=b.pc&&b.pc.find(o=>o.k==='espejo');
    if(!p||fl||(p.a!==undefined&&p.a<0.35))return r;
    const x=q(p.x),y=q(p.y);J9A_diente(x+5.5,y-3); // en el marco, arriba
  }catch(e){}
  return r;
};}
// burbuja de la vajilla en fila → anillo de píxeles de 1 px
function J9A_anillo(cx,cy,r,col){cx=Math.round(cx);cy=Math.round(cy);ctx.fillStyle=col; // círculo de punto medio: trazo continuo de 1 px
  let x=r,y=0,e=1-r;const p=(a,b)=>ctx.fillRect(cx+a,cy+b,1,1);
  while(x>=y){p(x,y);p(y,x);p(-y,x);p(-x,y);p(-x,-y);p(-y,-x);p(y,-x);p(x,-y);y++;if(e<0)e+=2*y+1;else{x--;e+=2*(y-x)+1;}}}
if(typeof J9_dish==='function'){const J9A_dish0=J9_dish;J9_dish=function(x,y,rot,cup,glow){
  if(glow)J9A_anillo(x,y,5,J9A_red()||(T>>3)%2?'#d8d0f0':'#a898c8'); // blanco lila fantasma (lejos del celeste del jugador 2)
  return J9A_dish0.call(this,x,y,rot,cup,false);
};}

// ---------- LA LUMBRERA (jefe chico): araña de cristal redibujada en píxeles ----------
// Misma forma y mismas poses que jefes9.js, dibujada en dos pasadas (tinta agrandada 1 px y color): cadena de eslabones,
// corona y globo de bronce apagado con rampa (luz arriba, sombra abajo), la cara adentro del globo, brazos de 2 px con
// articulaciones de 3 × 3, velas con llama violeta en 3 tonos (con halo), cristales de píxel que se mecen de a 1 px y
// los avisos del piso en escalones (sin óvalos ni líneas lisas).
const J9L={tinta:false,fl:false};
const J9L_c=c=>J9L.tinta?'#17141f':J9L.fl?'#ffffff':c;
function J9L_R(x,y,w,h,c){x=Math.round(x);y=Math.round(y);if(w<=0||h<=0)return;ctx.fillStyle=J9L_c(c);if(J9L.tinta)ctx.fillRect(x-1,y-1,w+2,h+2);else ctx.fillRect(x,y,w,h);}
function J9L_ovalo(cx,cy,rx,ry,col){for(let dy=-ry;dy<=ry;dy++){const t=dy/(ry+0.5),w=Math.round(rx*Math.sqrt(Math.max(0,1-t*t)));if(w>0)J9L_R(cx-w,cy+dy,2*w,1,typeof col==='function'?col(dy):col);}}
function J9L_curva(x0,y0,x1,y1,x2,y2,g,c){const n=14;for(let i=0;i<=n;i++){const u=i/n,v=1-u;J9L_R(v*v*x0+2*v*u*x1+u*u*x2-(g>>1),v*v*y0+2*v*u*y1+u*u*y2-(g>>1),g,g,c);}}
const J9L_BR=['#9a7a54','#6e5236','#4a3622'];
function J9L_cuerpo(b,X,Y){
  const rage=b.rage;
  // cadena que se pierde arriba
  for(let cy=Y-2,i=0;cy>-6;cy-=4,i++)J9L_R(X-1+(i%2),cy-3,2,3,i%2?'#5a5060':'#4a4050');
  // corona
  J9L_R(X-4,Y,8,3,J9L_BR[1]);J9L_R(X-1,Y-2,2,3,J9L_BR[1]);if(!J9L.tinta){J9L_R(X-4,Y,8,1,J9L_BR[0]);J9L_R(X-4,Y+2,8,1,J9L_BR[2]);}
  // brazos curvos (2 px) con articulaciones de 3 × 3
  for(const s of[-1,1]){J9L_curva(X+s*6,Y+12,X+s*14,Y+18,X+s*18,Y+10,2,J9L_BR[1]);J9L_curva(X+s*5,Y+14,X+s*9,Y+20,X+s*10,Y+14,2,J9L_BR[1]);
    for(const[jx,jy]of[[6,12],[14,17],[5,14]]){J9L_R(X+s*jx-1,Y+jy-1,3,3,J9L_BR[2]);if(!J9L.tinta)J9L_R(X+s*jx-1,Y+jy-1,2,1,J9L_BR[0]);}}
  // globo: marco de bronce con rampa y el vidrio con la cara
  J9L_ovalo(X,Y+10,8,7,dy=>dy<-4?J9L_BR[0]:dy>3?J9L_BR[2]:J9L_BR[1]);
  if(!J9L.tinta){const v=rage?['#f4ecff','#e8d8ff','#c8b4e8']:['#f4f8fc','#dfe8f0','#b8c8d8'];J9L_ovalo(X,Y+10,6,5,dy=>dy<-2?v[0]:dy>2?v[2]:v[1]);
    if(!J9L.fl){const mo=b.mode==='velT'||b.mode==='lagT'?1:0;ctx.fillStyle='#2a1f3a';ctx.fillRect(X-3,Y+8,2,3);ctx.fillRect(X+2,Y+8,2,3);
      ctx.fillStyle=rage||mo?((T>>1)%2?'#ffffff':M9_CEL):M9_CEL;ctx.fillRect(X-3,Y+8,1,1);ctx.fillRect(X+2,Y+8,1,1);
      ctx.fillStyle='#2a1f3a';ctx.fillRect(X-1,Y+12,3,1+mo);ctx.fillStyle='#ffffff';ctx.fillRect(X-4,Y+6,2,1);}}
  // velas: platito, vela con sombra a la derecha
  for(const[vx,vy]of[[-18,10],[-10,14],[10,14],[18,10],[0,1]]){J9L_R(X+vx-2,Y+vy-1,4,2,J9L_BR[1]);J9L_R(X+vx-1,Y+vy-5,2,4,'#efe6d2');if(!J9L.tinta){J9L_R(X+vx,Y+vy-5,1,4,'#c8bca8');J9L_R(X+vx-2,Y+vy-1,4,1,J9L_BR[0]);}}
  // cristales colgando: hilo de 1 px y gota de 3 × 5 que se mece de a 1 px
  for(let i=-3;i<=3;i++){const lx=X+i*5,ly=Y+17-Math.abs(i)+(i%2?2:0),sw=Math.round(Math.sin(T/9+i)*0.6*(1+b.shk*2));
    J9L_R(lx,ly-3,1,3,'#8a96a8');const brilla=b.mode==='lagT'&&(T+i)%4<2;
    J9L_R(lx+sw,ly,1,1,brilla?'#ffffff':'#e8f0f8');J9L_R(lx+sw-1,ly+1,3,2,brilla?'#ffffff':'#e8f0f8');J9L_R(lx+sw,ly+3,1,1,brilla?'#ffffff':'#e8f0f8');J9L_R(lx+sw,ly+4,1,1,brilla?'#ffffff':'#8a7aa8');
    if(!J9L.tinta&&!brilla)J9L_R(lx+sw-1,ly+1,1,1,'#d8d0f0');}
}
function J9L_llamas(b,X,Y){
  if(J9L.fl||b.state==='dying')return;const f=1+b.flare*1.6+(b.rage?0.4:0);
  [[-18,10],[-10,14],[10,14],[18,10],[0,1]].forEach(([vx,vy],i)=>{const x=X+vx,fy=Y+vy-5,h=Math.max(3,Math.round(4*f)),bl=b.flare>0.6&&(T>>1)%2;
    const off=J9A_red()?0:((T>>3)+i)%3===1?1:0;
    const wb=Math.max(3,1+2*Math.round(f));for(let r=0;r<h;r++){const t=r/h,w=t<0.4?wb:t<0.75?Math.max(1,wb-2):1,xx=x-(w>>1)+(r>h/2?off:0);ctx.fillStyle=bl?'#ffffff':t<0.3?'#f0e0ff':t<0.7?'#b48cff':'#7a50c8';ctx.fillRect(xx,fy-1-r,w,1);}
    if(typeof LUZ_halo==='function')LUZ_halo(x,fy-2,6*f,'#b48cff',0.25+0.25*b.flare);});
}
function J9L_avisos(b){
  if(b.mode==='lagT'){const p=Math.min(1,b.mt/(b.rage?26:38)),on=(T>>2)%2;
    for(const m of b.marks){const x=Math.round(m);ctx.fillStyle=`rgba(216,208,240,${0.15+0.35*p+(on?0.1:0)})`;ctx.fillRect(x-3,GROUND-1,6,1);ctx.fillRect(x-5,GROUND,10,1);ctx.fillRect(x-3,GROUND+1,6,1);
      ctx.fillStyle=`rgba(232,240,248,${0.3+0.5*p})`;for(let yy=GROUND-10;yy<GROUND-2;yy+=3)ctx.fillRect(x,yy,1,2);}} // columna en escalones
  if(b.mode==='caidaT'||b.mode==='caida'){const p=b.mode==='caida'?1:Math.min(1,b.mt/(b.rage?30:44)),on=(T>>2)%2,x=Math.round(b.tx),R=Math.round(10+p*14),A=Math.round(26-p*6);
    ctx.fillStyle=`rgba(185,140,255,${0.12+0.25*p+(on?0.08:0)})`;ctx.fillRect(x-Math.round(R*0.7),GROUND-2,Math.round(R*1.4),1);ctx.fillRect(x-R,GROUND-1,2*R,2);ctx.fillRect(x-Math.round(R*0.7),GROUND+1,Math.round(R*1.4),1);
    ctx.fillStyle=`rgba(232,220,255,${0.4+0.5*p})`;const a7=Math.round(A*0.7);ctx.fillRect(x-a7,GROUND-3,2*a7,1);ctx.fillRect(x-a7,GROUND+2,2*a7,1);ctx.fillRect(x-A,GROUND-2,A-a7,1);ctx.fillRect(x+a7,GROUND-2,A-a7,1);
    ctx.fillRect(x-A,GROUND+1,A-a7,1);ctx.fillRect(x+a7,GROUND+1,A-a7,1);ctx.fillRect(x-A-1,GROUND-1,1,2);ctx.fillRect(x+A,GROUND-1,1,2);}
}
if(typeof J9_drawLum==='function'){const J9L_lum0=J9_drawLum;J9_drawLum=function(b){
  try{
    const fl=b.flash>0||(b.state==='dying'&&(T>>2)%2),sh=b.shk?Math.round(Math.sin(T*2.1)*b.shk):0,X=Math.round(b.cx)+sh,Y=Math.round(b.cy);
    J9L_avisos(b);
    ctx.save();ctx.globalAlpha=b.alpha;
    J9L.fl=fl;J9L.tinta=true;J9L_cuerpo(b,X,Y);J9L.tinta=false;J9L_cuerpo(b,X,Y);J9L_llamas(b,X,Y);J9L.fl=false;
    ctx.restore();ctx.globalAlpha=1;
  }catch(e){J9L.tinta=false;J9L.fl=false;return J9L_lum0.call(this,b);}
};}

// cristales que caen (peligro): blanco frío #e8f0f8, brillo lila #d8d0f0 y la punta de adelante 1 px más oscura
// (#8a7aa8), lejos del celeste del jugador 2. Apuntan hacia donde van: 8 direcciones, giradas en 90° exactos y guardadas.
const J9C_FORMA={recta:['.b.','bhb','bhb','bbb','.b.','.t.'],diag:['hb...','bhb..','.bbb.','..bbt','...tt']};
const J9C_COL={b:'#e8f0f8',h:'#d8d0f0',t:'#8a7aa8'};
const J9C=new Map();
function J9C_sprite(d){ // d: 0 = derecha, 2 = abajo, … (de a 45°)
  let c=J9C.get(d);if(c)return c;
  const diag=d%2===1,f=diag?J9C_FORMA.diag:J9C_FORMA.recta,w=f[0].length,h=f.length;
  let base=J2_lienzo(w+2,h+2,set=>f.forEach((r,j)=>{for(let i=0;i<w;i++)if(r[i]!=='.')set(i+1,j+1,J9C_COL[r[i]]);}));
  const k=diag?(((d-1)/2)|0):((((d-2)/2)%4)+4)%4; // recta apunta abajo (d=2); diagonal, abajo a la derecha (d=1)
  c=J2_cuarto(base,k);J9C.set(d,c);return c;
}
if(typeof J9_shardDraw==='function'&&typeof J2_lienzo==='function'){const J9C_0=J9_shardDraw;J9_shardDraw=function(o){
  try{
    const k=Math.min(1,o.t/40),x=Math.round(o.tx);ctx.fillStyle=`rgba(216,208,240,${0.15+0.35*k})`;ctx.fillRect(x-2,GROUND-1,4,1);ctx.fillRect(x-4,GROUND,8,1);ctx.fillRect(x-2,GROUND+1,4,1);
    const d=((Math.round(Math.atan2(o.vy,o.vx)/(Math.PI/4))%8)+8)%8,img=J9C_sprite(d);
    ctx.drawImage(img,Math.round(o.x-img.width/2),Math.round(o.y-img.height/2));
  }catch(e){return J9C_0.call(this,o);}
};}
