'use strict';
// Óxido · M7 en estilo "Hondo" (notas/arte/guia.md). Va después de arte-jefes-m6.js, antes de juego.js.
// · EL REMENDÓN (jefe chico): capturado en píxeles con contorno y borde de luz por fuera, guardado por estado (brazo,
//   pinza y remachadora en 4 posiciones dibujadas); se inclina con el cuadro corrido 1 px cada 3 columnas. El rayo de
//   soldadura (blanco violeta), su aviso y la flecha son de píxeles; sombra de contacto pixelada. Cuerpo en naranja
//   de seguridad con las franjas negras en diagonal.
// · LA MARAÑA (villana): capturada en píxeles con contorno y borde de luz, conservando los brillos transparentes. El
//   DIENTE DORADO va en el centro del núcleo de anillos; los amarillos del núcleo y de los bulbos pasan a naranja claro,
//   así el diente es lo único dorado.
// Usa J2_cuarto / J2_inclinar (arte-jefes-m2.js) y J6A_conColores (arte-jefes-m6.js). Prefijo J7A_.
const J7A_red=()=>typeof MOV_reducido==='function'&&MOV_reducido();
const J7A_GIRO=new Map();
function J7A_linea(x0,y0,x1,y1,col,g){ctx.fillStyle=col;const n=Math.max(1,Math.round(Math.max(Math.abs(x1-x0),Math.abs(y1-y0)))),o=(g||1)>>1;
  for(let i=0;i<=n;i++)ctx.fillRect(Math.round(x0+(x1-x0)*i/n)-o,Math.round(y0+(y1-y0)*i/n)-o,g||1,g||1);}
function J7A_disco(cx,cy,r,col){cx=Math.round(cx);cy=Math.round(cy);ctx.fillStyle=col;for(let dy=-r;dy<=r;dy++){const w=Math.floor(Math.sqrt(r*r-dy*dy+r*0.6));ctx.fillRect(cx-w,cy+dy,2*w+1,1);}}
function J7A_rayo(b){
  if(!b.beam||!(b.mode==='sweep'||b.mode==='sweepT'))return;const t=J7_torch(b),bx=Math.round(b.beam.x),G=GROUND;
  if(b.mode==='sweep'){J7A_linea(t.x,t.y,bx,G-1,'rgba(168,144,255,0.6)',5);J7A_linea(t.x,t.y,bx,G-1,'#e8e0ff',3);J7A_linea(t.x,t.y,bx,G-1,'#ffffff',1);
    J7A_disco(bx,G-2,4,'rgba(168,144,255,0.5)');J7A_disco(bx,G-2,2,'#ffffff');
    ctx.fillStyle='rgba(255,140,60,0.5)';ctx.fillRect(Math.min(bx,bx-b.beam.dir*16),G-1,16,1);
    if(typeof LUZ_halo==='function')LUZ_halo(bx,G-3,14,'#c8b8ff',0.4);}
  else{const on=(T>>2)%2,d=b.beam.dir;
    ctx.fillStyle=`rgba(168,144,255,${0.35+0.3*on})`;const n=Math.round(Math.hypot(bx-t.x,G-1-t.y));for(let i=0;i<n;i+=3){const u=i/n;ctx.fillRect(Math.round(t.x+(bx-t.x)*u),Math.round(t.y+(G-1-t.y)*u),1,2);}
    J7A_disco(bx,G-1,1,on?'#f4f0ff':'#a890ff');
    const rr=Math.round(6-((T%20)/20)*4);ctx.fillStyle='rgba(168,144,255,0.85)';ctx.fillRect(bx-rr,G-3,2*rr,1);ctx.fillRect(bx-rr,G+1,2*rr,1);ctx.fillRect(bx-rr-1,G-2,1,3);ctx.fillRect(bx+rr,G-2,1,3);
    // flecha de hacia dónde va a correr, en píxeles
    ctx.fillStyle='#c8b8ff';const ax=bx+d*7;for(let i=0;i<5;i++)ctx.fillRect(d>0?ax+i:ax-i,G-8+i/2+0.5|0,1,5-i);ctx.fillRect(d>0?bx+3:bx-7,G-7,4,1);}
}
// cuerpo en naranja de seguridad (no compite con el diente) y la llama del soplete en blanco violeta (no celeste)
const J7A_CUERPO={'#c8a040':'#d87a30','#e0c060':'#f0a050','#8a6a20':'#8a4420','#6a5020':'#6a3418','#4a3a18':'#4a2410','#e0f4ff':'#f4f0ff','#5aa8ff':'#a890ff'};
if(typeof J7_drawDron==='function'&&typeof LUZ_capturar==='function'){const J7A_dron0=J7_drawDron;J7_drawDron=function(b){
  try{
    J7A_rayo(b);
    if(typeof LUZ_sombra==='function'&&b.y+b.h<GROUND)LUZ_sombra(b.x+b.w/2,GROUND,22,0);
    const fl=b.flash>0||(b.state==='dying'&&(T>>2)%2),ph2=b.hp<b.max*0.5||b.state==='dying',tele=b.mode==='sweepT'||b.mode==='rivetT'||b.mode==='grateT';
    const arm=Math.round((b.arm||0)*3)/3,claw=Math.round((b.claw||0)*3)/3,gun=b.gun>0.5?((T>>1)%3):0,ojo=b.state==='dying'?'m':(tele||ph2)?((T>>1)%2):'v';
    const clave=['rem',fl?1:0,b.face,ph2?1:0,ojo,arm,claw,gun,b.gun>0.5&&(T>>1)%2?1:0,(T>>1)%2,ph2&&(T>>2)%3===0?1:0].join('|');
    const sx=Math.sin(T*0.9+5),proxy={...b,x:0,y:0,tilt:0,beam:null,mode:b.mode==='sweep'||b.mode==='sweepT'?'hover':b.mode,arm,claw,gun:b.gun>0.5?1:0};
    const dib=()=>J7A_dron0.call(this,proxy);
    const img=LUZ_capturar(clave,-20,-16,68,50,()=>typeof J6A_conColores==='function'?J6A_conColores(J7A_CUERPO,{},dib):dib(),{fuera:true});
    const a=b.tilt||0,q=a/(Math.PI/2),kq=Math.round(q),fr=q-kq,incl=Math.abs(fr)>0.06?Math.sign(fr):0,X=Math.round(b.x),Y=Math.round(b.y);
    if(!kq&&!incl){ctx.drawImage(img,X-20,Y-16);return;}
    let g=J7A_GIRO.get(img);if(!g){g=new Map();J7A_GIRO.set(img,g);if(J7A_GIRO.size>300)J7A_GIRO.clear();}
    const k=kq+'|'+incl;let r=g.get(k);if(!r){r=J2_cuarto(img,kq);if(incl)r=J2_inclinar(r,incl);g.set(k,r);}
    ctx.drawImage(r,Math.round(b.x+b.w/2-r.width/2),Math.round(b.y+b.h/2-r.height/2));
  }catch(e){return J7A_dron0.call(this,b);}
};}
const J7A_DIENTE=['.#.#.','#####','##.##','#####','.#.#.'];
function J7A_diente(x,y){
  x=Math.round(x);y=Math.round(y);
  ctx.fillStyle='#120c18';J7A_DIENTE.forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#')ctx.fillRect(x+i-1,y+j-1,3,3);});
  J7A_DIENTE.forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#'){ctx.fillStyle=i+j<=2?'#fff0b0':i+j>=6?'#7a5a1a':'#d8a83a';ctx.fillRect(x+i,y+j,1,1);}});
  ctx.fillStyle='#3a2a10';ctx.fillRect(x+2,y+2,1,1);
  if(typeof LUZ_halo==='function'){const lat=J7A_red()?0.36:0.3+0.1*Math.sin(T/40);LUZ_halo(x+2.5,y+2.5,9,'#ffd860',lat);}
}
if(typeof J7_drawMar==='function'&&typeof LUZ_vivo==='function'){const J7A_mar0=J7_drawMar;J7_drawMar=function(b){
  const dib=()=>J7A_mar0.call(this,b),cambio=()=>typeof J6A_conColores==='function'?J6A_conColores({'#ffd27a':'#ffa860','#d9a43a':'#8a5a3a'},{},dib):dib();
  LUZ_vivo('marana',Math.floor(b.A)-10,M7_DUCT-6,W+20,GROUND-M7_DUCT+12,cambio,{umbral:'suave'});
  try{
    if(b.state==='enter'&&b.t<4)return;if(b.flash>0&&(T>>1)%2)return;if(b.dim>0.8)return;
    const g=b.state==='enter'?b.grow:1,cx=b.A+286,cy=GROUND-50,sh=b.shud?Math.sin(T*1.7)*1.2*b.shud:0,s=1+b.swell*0.45;
    const nx=cx+sh+((cx-2)-cx)*g,ny=GROUND+((cy+2)-GROUND)*g;if(g<0.5)return;
    J7A_diente(nx-2.5,ny-2.5); // en el centro del núcleo de anillos
  }catch(e){}
};}
