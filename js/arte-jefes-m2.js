'use strict';
// Óxido · Jefes de M2 en estilo "Hondo" (notas/arte/guia.md). Va después de arte-jefes-m1.js, antes de juego.js.
// · LIBÉLULA DE HIERRO (jefe chico): redibujada en píxeles con la misma forma de jefes.js. Ojo de lente en 3 tonos de
//   rojo con brillo (ya no un disco liso), hélices dibujadas en 3 cuadros (ya no elipses transparentes), cuerpo con rampa
//   y óxido, y el reflector como halo de luz en el piso. Al caer: 90° exactos con un cuadro inclinado en el medio.
// · SARGENTO CENIZA (villano): capturado en píxeles con borde de luz; el diente dorado es el volante de la válvula de
//   su tanque (lo único dorado: la franja del tanque y la hebilla pasan a ámbar apagado).
// Prefijo J2_.
const J2_TINTA='#17141f';
const J2_red=()=>typeof MOV_reducido==='function'&&MOV_reducido();
function J2_lienzo(w,h,pinta){ // grilla de colores → lienzo con contorno de tinta automático de 1 px
  const grid=new Array(w*h).fill(null);
  pinta((x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<w&&y<h)grid[y*w+x]=c;});
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d');
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){let c=grid[y*w+x];
    if(!c)for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<w&&Y<h&&grid[Y*w+X]&&grid[Y*w+X]!==J2_TINTA){c=J2_TINTA;break;}}
    if(c){g.fillStyle=c;g.fillRect(x,y,1,1);}}
  return cv;
}
const J2_espejo=src=>{const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d');g.translate(src.width,0);g.scale(-1,1);g.drawImage(src,0,0);return c;};
// 90° exactos (k cuartos de vuelta): sin perder la grilla
function J2_cuarto(src,k){k=((k%4)+4)%4;if(!k)return src;const c=document.createElement('canvas');
  c.width=k%2?src.height:src.width;c.height=k%2?src.width:src.height;const g=c.getContext('2d');
  g.translate(c.width/2,c.height/2);g.rotate(k*Math.PI/2);g.drawImage(src,-src.width/2,-src.height/2);return c;}
// cuadro intermedio: inclinado con un corrimiento de 1 px cada 3 columnas (dir 1 o -1), sin girar
function J2_inclinar(src,dir){const w=src.width,h=src.height,ex=Math.ceil(w/3),c=document.createElement('canvas');c.width=w;c.height=h+ex;
  const g=c.getContext('2d');for(let x=0;x<w;x++){const dy=dir>0?Math.floor(x/3):Math.floor((w-1-x)/3);g.drawImage(src,x,0,1,h,x,dy,1,h);}return c;}
// ---------- LIBÉLULA DE HIERRO ----------
const J2_OX=2,J2_OY=5,J2_W=62,J2_H=26; // el lienzo: (0,0) de jefes.js cae en (J2_OX, J2_OY)
const J2_LIB=new Map();
function J2_libelula(f,ojo,fl){
  const k=f+'|'+ojo+'|'+(fl?1:0);let cv=J2_LIB.get(k);if(cv)return cv;
  const C=c=>fl?'#ffffff':c;
  cv=J2_lienzo(J2_W,J2_H,set0=>{const set=(x,y,c)=>set0(x+J2_OX,y+J2_OY,C(c));
    // cola segmentada (se angosta) y la punta roja
    for(let i=0;i<6;i++){const x0=Math.round(28+i*4.6),h=Math.max(2,Math.round(5-i*0.55)),y0=Math.round(8.5-h/2);
      for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+5;x++)set(x,y,y===y0?(i%2?'#4a5a6c':'#5a6c80'):i%2?'#2a3542':'#3a4a5a');}
    for(let y=8;y<10;y++)for(let x=55;x<57;x++)set(x,y,'#ff5a3c');
    // cuerpo: óvalo con rampa (luz arriba, sombra abajo), una juntura y manchas de óxido
    for(let y=3;y<=17;y++){const t=(y-10)/7,hw=Math.round(16*Math.sqrt(Math.max(0,1-t*t)));
      for(let x=18-hw;x<=18+hw;x++)set(x,y,y<=4?'#8aa0b4':y<=7?'#6a7e92':y>=15?'#2e3a46':y>=13?'#3a4856':'#4a5a6a');}
    for(let y=5;y<=13;y++)set(25,y,'#3a4856');
    for(const[x,y]of[[21,8],[22,8],[22,9],[30,11],[31,11],[12,13]])set(x,y,'#6a4a3e');
    for(let i=0;i<4;i++)for(let y=11;y<13;y++)for(let x=14+i*3;x<17+i*3;x++)set(x,y,i%2?'#1d1a1c':'#d9a43a'); // franja de peligro
    // cañones y el foco del reflector
    for(let y=16;y<19;y++)for(let x=12;x<20;x++)set(x,y,y===16?'#3a404a':'#1d222a');
    for(let x=6;x<13;x++){set(x,17,'#3a404a');set(x,18,'#1d222a');}
    set(17,17,'#fff0c0');set(18,17,'#fff0c0');set(19,17,'#c8b880');
    // ojo: lente con anillos (borde oscuro, rojo, rojo claro arriba a la izquierda), pupila y brillo
    for(let y=3;y<=15;y++)for(let x=-1;x<=11;x++){const dx=x-5,dy=y-9,d=Math.hypot(dx,dy);if(d>5.6)continue;
      let c=d>4.6?'#3a1210':d>3.6?'#8a2418':(dx+dy<-1?'#ff8a6a':'#ff5a3c');
      if(ojo==='blanco'&&d<=4.6)c='#ffffff';if(ojo==='apagado'&&d<=4.6)c=d>3.6?'#3a1a14':'#5a2a1a';set(x,y,c);}
    if(ojo!=='blanco'){set(5,9,'#2a0806');set(6,9,'#2a0806');set(5,10,'#2a0806');set(6,10,'#2a0806');set(3,6,'#ffe0d0');set(4,6,'#ffe0d0');set(3,7,'#ffe0d0');}
    // hélices: mástil, cubo y palas en 3 cuadros (larga y fina, media de 2 filas, de canto con estela)
    [[14,f],[28,(f+1)%3]].forEach(([hx,ff])=>{set(hx,2,'#2a3542');set(hx,3,'#2a3542');set(hx-1,1,'#1d222a');set(hx,1,'#1d222a');set(hx+1,1,'#1d222a');
      if(ff===0){for(let x=hx-13;x<=hx+13;x++)if(Math.abs(x-hx)>1)set(x,0,Math.abs(x-hx)>10?'#d0e4ee':'#9ab8c8');}
      else if(ff===1){for(let x=hx-9;x<=hx+9;x++)if(Math.abs(x-hx)>1){set(x,-1,'#b8d0dc');set(x,0,'#7a98a8');}}
      else{for(let x=hx-4;x<=hx+4;x++)if(Math.abs(x-hx)>1)set(x,0,'#9ab8c8');for(const s of[-1,1])for(let i=10;i<=13;i++)set(hx+s*i,0,'#6a8898');}});
  });
  if(J2_LIB.size>48)J2_LIB.clear();J2_LIB.set(k,cv);return cv;
}
const J2_GIRO=new Map();
if(typeof drawBoss2==='function'){const J2_lib0=drawBoss2;drawBoss2=function(b){
  try{
    const fl=b.flash>0,tele=b.mode==='tele',dying=b.state==='dying';
    const ojo=dying&&b.t>30?'apagado':tele&&(T>>1)%2?'blanco':'rojo',f=J2_red()?0:(b.t>>1)%3;
    // el reflector: luz en el piso (halo que suma luz) y el foco encendido
    if(!dying&&typeof LUZ_halo==='function'){const lx=b.x+(b.face>0?b.w-18:18);
      LUZ_halo(lx,GROUND-2,26,'#fff0c0',0.32);LUZ_halo(lx,b.y+17,6,'#fff0c0',0.4);}
    let cv=J2_libelula(f,ojo,fl);
    if(b.face>0){const k='e|'+f+'|'+ojo+'|'+fl;let e=J2_GIRO.get(k);if(!e){e=J2_espejo(cv);J2_GIRO.set(k,e);}cv=e;} // espejo antes que la luz: el borde cálido queda del lado de la luz
    const lu=!fl&&typeof LUZ_luz==='function'&&LUZ_luz();if(lu&&typeof LUZ_sprite==='function')cv=LUZ_sprite(cv,lu,{fuera:true});
    const X=Math.round(b.x),Y=Math.round(b.y);
    if(!b.rot){ctx.drawImage(cv,b.face>0?X+b.w-(J2_W-J2_OX):X-J2_OX,Y-J2_OY);return;}
    // cayendo: 90° exactos y, entre uno y otro, el cuadro inclinado (1 px cada 3 columnas); el humo y las chispas dan el giro
    const q=b.rot/(Math.PI/2),kq=Math.round(q),fr=q-kq,incl=Math.abs(fr)>0.25?Math.sign(fr):0;
    const k='g|'+kq+'|'+incl+'|'+b.face+'|'+f+'|'+ojo+'|'+fl;let g=J2_GIRO.get(k);
    if(!g){g=J2_cuarto(cv,kq);if(incl)g=J2_inclinar(g,incl);if(J2_GIRO.size>200)J2_GIRO.clear();J2_GIRO.set(k,g);}
    ctx.drawImage(g,Math.round(b.x+b.w/2-g.width/2),Math.round(b.y+b.h/2-g.height/2));
    if(typeof parts!=='undefined'){const cx=b.x+b.w/2,cy=b.y+b.h/2;
      if(b.t%3===0)parts.push({k:'smoke',x:cx+rand(-10,10),y:cy+rand(-4,4),vx:rand(-0.4,0.4),vy:rand(-0.9,-0.3),life:rand(18,30),maxl:30,size:rand(2,3.5)});
      if(b.t%7===0)parts.push({k:'fire',x:cx+rand(-14,14),y:cy+rand(-5,5),vx:rand(-1.2,1.2),vy:rand(-1.4,-0.4),life:rand(6,10),maxl:10,size:rand(1,1.8)});}
  }catch(e){return J2_lib0.call(this,b);}
};}

// ---------- SARGENTO CENIZA ----------
const J2_DIENTE=['.#.#.','#####','##.##','#####','.#.#.'];
function J2_diente(x,y){
  x=Math.round(x);y=Math.round(y);
  ctx.fillStyle='#120c18';J2_DIENTE.forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#')ctx.fillRect(x+i-1,y+j-1,3,3);});
  J2_DIENTE.forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#'){ctx.fillStyle=i+j<=2?'#fff0b0':i+j>=6?'#7a5a1a':'#d8a83a';ctx.fillRect(x+i,y+j,1,1);}});
  ctx.fillStyle='#3a2a10';ctx.fillRect(x+2,y+2,1,1);
  if(typeof LUZ_halo==='function'){const lat=J2_red()?0.36:0.3+0.1*Math.sin(T/40);LUZ_halo(x+2.5,y+2.5,7,'#ffd860',lat);}
}
// la franja dorada del tanque y la hebilla del cinturón pasan a ámbar apagado (el diente es lo único dorado)
const J2_CAMBIA={'#d9a43a':'#8a5a3a'};
function J2_conColores(fn){
  const p=Object.getPrototypeOf(ctx),d=Object.getOwnPropertyDescriptor(p,'fillStyle');if(!d||!d.set)return fn();
  Object.defineProperty(ctx,'fillStyle',{configurable:true,get(){return d.get.call(ctx);},set(v){d.set.call(ctx,typeof v==='string'&&J2_CAMBIA[v.toLowerCase()]||v);}});
  try{return fn();}finally{delete ctx.fillStyle;}
}
if(typeof drawCeniza==='function'){const J2_cen0=drawCeniza;drawCeniza=function(b){
  if(typeof LUZ_vivo!=='function')return J2_cen0.call(this,b);
  const X=Math.round(b.x),Y=Math.round(b.y);
  LUZ_vivo('ceniza',X-18,Y-18,b.w+36,b.h+24,()=>J2_conColores(()=>J2_cen0.call(this,b)));
  if(b.flash>0||(b.state==='dying'&&(T>>2)%2))return;
  // el diente: volante de la válvula, arriba del tanque de la espalda
  const k=Math.round(b.kneel||0),lx=-1,ly=2+k,x=b.face<0?X+b.w-lx-5:X+lx;
  J2_diente(x,Y+ly);
};}
