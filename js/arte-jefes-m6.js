'use strict';
// Óxido · M6 en estilo "Hondo" (notas/arte/guia.md). Va después de arte-jefes-m9.js, antes de juego.js.
// · MOSCARDÓN (jefe chico): capturado en píxeles con contorno y borde de luz por fuera (vuela), guardado por estado; se
//   inclina con un cuadro corrido 1 px cada 3 columnas y al caer gira en 90° exactos. La mira láser es una línea de
//   píxeles de 1 px (ya no una línea lisa).
// · PLACA MADRE (guardiana): monolito y pantallas pasados a la grilla de píxeles del juego (sin medios píxeles; los
//   transparentes de verdad —barrido, estática, haz— quedan). El DIENTE DORADO va en la pantalla del medio, entre los
//   ojos y la boca de la cara. Es lo único dorado.
// Usa J2_cuarto y J2_inclinar (arte-jefes-m2.js) y LUZ_capturar / LUZ_vivo (arte-luz.js). Prefijo J6A_.
const J6A_red=()=>typeof MOV_reducido==='function'&&MOV_reducido();
const J6A_GIRO=new Map();
function J6A_linea(x0,y0,ang,L,col){ctx.fillStyle=col;const dx=Math.cos(ang),dy=Math.sin(ang);let px=null,py=null;
  for(let i=0;i<L;i++){const x=Math.round(x0+dx*i),y=Math.round(y0+dy*i);if(x===px&&y===py)continue;ctx.fillRect(x,y,1,1);px=x;py=y;}}
if(typeof J6_drawDron==='function'&&typeof LUZ_capturar==='function'){const J6A_dron0=J6_drawDron;J6_drawDron=function(b){
  try{
    const fl=b.flash>0||(b.state==='dying'&&(T>>2)%2),ph2=b.hp<b.max*0.5,cx=b.x+b.w/2,bob=Math.round(Math.sin(b.t/9)*0.8),cy=b.y+b.h/2+bob;
    // mira láser: línea de píxeles
    if(b.mode==='miraT'&&b.aim!==null&&b.state==='fight'){const on=(T>>1)%2;J6A_linea(cx+b.face*6,b.y+b.h-1,b.aim,360,on?'#ff5a3c':'#ffb43a');}
    const aim=b.mode==='miraT'||b.mode==='mira',rot=[[-22],[22],[-18],[18]].map(([dx])=>Math.sin(b.hel+dx)>0?1:0).join('');
    const clave=['mos',fl?1:0,b.face,ph2?1:0,aim?(T>>1)%2:'n',(T>>3)%4,rot].join('|');
    const img=LUZ_capturar(clave,-36,-22,72,44,()=>J6A_dron0.call(this,{...b,x:-b.w/2,y:-b.h/2-Math.sin(b.t/9)*0.8,rot:0,mode:b.mode==='miraT'?'mira':b.mode}),{fuera:true});
    const a=b.rot||0,q=a/(Math.PI/2),kq=Math.round(q),fr=q-kq,incl=Math.abs(fr)>0.06?Math.sign(fr):0;
    if(!kq&&!incl){ctx.drawImage(img,Math.round(cx)-36,Math.round(cy)-22);return;}
    let g=J6A_GIRO.get(img);if(!g){g=new Map();J6A_GIRO.set(img,g);if(J6A_GIRO.size>300)J6A_GIRO.clear();}
    const k=kq+'|'+incl;let r=g.get(k);if(!r){r=J2_cuarto(img,kq);if(incl)r=J2_inclinar(r,incl);g.set(k,r);}
    ctx.drawImage(r,Math.round(cx-r.width/2),Math.round(cy-r.height/2));
  }catch(e){return J6A_dron0.call(this,b);}
};}
const J6A_DIENTE=['.#.#.','#####','##.##','#####','.#.#.'];
function J6A_diente(x,y){
  x=Math.round(x);y=Math.round(y);
  ctx.fillStyle='#120c18';J6A_DIENTE.forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#')ctx.fillRect(x+i-1,y+j-1,3,3);});
  J6A_DIENTE.forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#'){ctx.fillStyle=i+j<=2?'#fff0b0':i+j>=6?'#7a5a1a':'#d8a83a';ctx.fillRect(x+i,y+j,1,1);}});
  ctx.fillStyle='#3a2a10';ctx.fillRect(x+2,y+2,1,1);
  if(typeof LUZ_halo==='function'){const lat=J6A_red()?0.36:0.3+0.1*Math.sin(T/40);LUZ_halo(x+2.5,y+2.5,8,'#ffd860',lat);}
}
if(typeof J6_drawPlaca==='function'&&typeof LUZ_vivo==='function'){const J6A_placa0=J6_drawPlaca;J6_drawPlaca=function(b){
  LUZ_vivo('placa',Math.floor(b.A)-8,-24,W+16,GROUND+30,()=>J6A_placa0.call(this,b),{umbral:'suave',sinBorde:true});
  try{
    const dead=b.state==='dying';if(dead&&b.t>150)return; // se hunde
    if(b.flash>0&&b.phase===0&&(T>>1)%2)return;
    const x0=b.cx-J6_TW/2,top=GROUND-J6_TH;J6A_diente(x0+J6_TW/2-2.5,top+3+13-2.5); // en la pantalla del medio
  }catch(e){}
};}

// colores de la cara y de los paneles (Dirección de Arte): ojos y boca en magenta neón #ff5ad0 con brillo #ffb0ec (la luz
// de la misión; el cian es del soldado y del jugador 2), y las ondas ámbar de los paneles en violeta #a890ff. Así el
// diente es lo único cálido y dorado del monolito. El borde cian de la pantalla real no cambia (dice cuál es la real).
function J6A_conColores(relleno,trazo,fn){
  const p=Object.getPrototypeOf(ctx),f=Object.getOwnPropertyDescriptor(p,'fillStyle'),t=Object.getOwnPropertyDescriptor(p,'strokeStyle');
  if(!f||!t||!f.set||!t.set)return fn();
  const map=(m,v)=>typeof v==='string'&&m[v.toLowerCase()]||v;
  // si ya hay un cambio de colores puesto (anidado), se encadena y después se devuelve tal cual
  const fa=Object.getOwnPropertyDescriptor(ctx,'fillStyle'),ta=Object.getOwnPropertyDescriptor(ctx,'strokeStyle'),fs=fa?fa.set:f.set,ts=ta?ta.set:t.set;
  Object.defineProperty(ctx,'fillStyle',{configurable:true,get(){return f.get.call(ctx);},set(v){fs.call(ctx,map(relleno,v));}});
  Object.defineProperty(ctx,'strokeStyle',{configurable:true,get(){return t.get.call(ctx);},set(v){ts.call(ctx,map(trazo,v));}});
  try{return fn();}finally{
    if(fa)Object.defineProperty(ctx,'fillStyle',fa);else delete ctx.fillStyle;
    if(ta)Object.defineProperty(ctx,'strokeStyle',ta);else delete ctx.strokeStyle;}
}
if(typeof J6_cara==='function'){const J6A_cara0=J6_cara;J6_cara=function(){const a=arguments;
  return J6A_conColores({'#ffb43a':'#ff5ad0','#ffe0a0':'#ffb0ec'},{'#3ad8ff':'#ff5ad0'},()=>J6A_cara0.apply(this,a));};}
if(typeof J6_drawPlaca==='function'){const J6A_placa1=J6_drawPlaca;J6_drawPlaca=function(b){const a=arguments;
  return J6A_conColores({},{'#ffb43a':'#a890ff'},()=>J6A_placa1.apply(this,a));};}
// la pantalla real (fase 2): borde blanco #f4eee0 de 1 px (no cian: se confunde con el soldado de M6 y con el jugador 2)
// y una esquina que late, así se distingue por la forma y el brillo, no por el color (quieta con MOVIMIENTO REDUCIDO)
if(typeof J6_pantallaFlota==='function'){const J6A_pant0=J6_pantallaFlota;J6_pantallaFlota=function(x,y,fake,warn){const a=arguments;
  if(fake)return J6A_pant0.apply(this,a);
  const r=J6A_conColores({'#3ad8ff':'#f4eee0','#1a6a9a':'#8a8478'},{'rgba(58,216,255,0.25)':'rgba(244,238,224,0.25)'},()=>J6A_pant0.apply(this,a));
  const on=J6A_red()||(T>>3)%2,X=Math.round(x),Y=Math.round(y);
  if(on&&!(warn&&(T>>1)%2)){ctx.fillStyle='#17141f';ctx.fillRect(X-15,Y-13,6,3);ctx.fillRect(X-15,Y-13,3,6);
    ctx.fillStyle='#ffffff';ctx.fillRect(X-14,Y-12,4,1);ctx.fillRect(X-14,Y-12,1,4);}
  return r;};}
