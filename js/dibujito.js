'use strict';
// Óxido · Estilo "dibujito viejo" (ESTILO: DIBUJITO / LIMPIO en el menú del título, guardado en oxido-estilo)
// El lenguaje general de los dibujitos de los años 30 pasado a Óxido, encima del pixel art de siempre. No copia ningún
// juego: ni personajes, ni tipografía, ni carteles, ni paleta. Todo es sutil: el juego se tiene que leer igual.
// · Película (DIB_pelicula, la llama renderMain entre el mundo y el HUD): grano que cambia cada 3 cuadros, viñeta,
//   parpadeo leve de brillo, alguna raya vertical y motas sueltas. El HUD queda limpio encima.
// · Tinta que tiembla (DIB_tinta / DIB_sinTinta, desde drawWorld): una sombra de tinta de ±1 px que cambia de lado
//   cada 5 cuadros detrás de jugadores, jefes y soldados (en táctil, solo jugadores y jefes).
// · Rebote: el jugador se estira al saltar y caer y se aplasta al aterrizar; los soldados se hamacan al caminar,
//   todos al mismo compás.
// · Cartel de jefe: cuando entra un jefe (chico o villano), su nombre en una chapa que cae rebotando (en los dos estilos).
let estilo=store.get('oxido-estilo')==='limpio'?'limpio':'dibujito';
const dibOn=()=>estilo==='dibujito';
const estiloTxt=()=>'ESTILO: '+(dibOn()?'DIBUJITO':'LIMPIO');
function setEstilo(e){estilo=e==='limpio'?'limpio':'dibujito';store.set('oxido-estilo',estilo);}
// celulares y tablets: grano más liviano y sin tinta en los soldados
const DIB_LIVIANO=navigator.maxTouchPoints>0;
let DIB_f=0;
// ---------- película ----------
const DIB_GRANO=[11,23,37].map(seed=>{
  const c=document.createElement('canvas');c.width=W*2;c.height=Math.ceil(H*ZOOM_GRANDE)*2+4;
  const g=c.getContext('2d'),d=g.createImageData(c.width,c.height),r=mulberry32(seed);
  for(let i=0;i<d.data.length;i+=4){if(r()<0.55)continue;const cl=r()<0.5;d.data[i]=cl?255:24;d.data[i+1]=cl?244:16;d.data[i+2]=cl?220:10;d.data[i+3]=40+Math.floor(r()*120);}
  g.putImageData(d,0,0);return c;});
const DIB_VIN=(()=>{const c=document.createElement('canvas');c.width=128;c.height=96;const g=c.getContext('2d');
  const v=g.createRadialGradient(64,48,26,64,48,82);v.addColorStop(0,'rgba(20,10,4,0)');v.addColorStop(0.7,'rgba(20,10,4,0.16)');v.addColorStop(1,'rgba(14,6,2,0.5)');
  g.fillStyle=v;g.fillRect(0,0,128,96);return c;})();
let DIB_raya=null,DIB_brillo=0;
function DIB_pelicula(){
  if(!dibOn())return;
  DIB_f++;
  const cw=cv.width,ch=cv.height,u=cw/W; // u = píxeles de pantalla por unidad del juego
  ctx.save();ctx.setTransform(1,0,0,1,0,0);
  // viñeta (suavizada: es un degradé chico estirado)
  ctx.imageSmoothingEnabled=true;ctx.drawImage(DIB_VIN,0,0,cw,ch);ctx.imageSmoothingEnabled=false;
  // grano: cambia cada 3 cuadros y se corre un poco, así no se ve como una textura quieta
  const gi=Math.floor(DIB_f/3),gr=DIB_GRANO[gi%3],ox=(gi*37)%7,oy=(gi*53)%5;
  ctx.globalAlpha=DIB_LIVIANO?0.07:0.11;ctx.drawImage(gr,ox,oy,gr.width-8,gr.height-6,0,0,cw,ch*(gr.height-6)/(HC*2));
  // parpadeo de brillo (muy leve)
  if(DIB_f%2===0)DIB_brillo=Math.random();
  ctx.globalAlpha=1;ctx.fillStyle=DIB_brillo<0.5?`rgba(255,238,205,${0.025*DIB_brillo})`:`rgba(12,6,2,${0.035*(DIB_brillo-0.5)})`;ctx.fillRect(0,0,cw,ch);
  // raya vertical de vez en cuando
  if(!DIB_raya&&Math.random()<1/260)DIB_raya={x:Math.random()*W,t:8+Math.floor(Math.random()*14),a:0.10+Math.random()*0.1};
  if(DIB_raya){const r=DIB_raya;r.x+=Math.random()*0.8-0.4;ctx.fillStyle=`rgba(255,246,225,${r.a})`;ctx.fillRect(Math.round(r.x*u),0,Math.max(1,Math.round(u*0.4)),ch);if(--r.t<=0)DIB_raya=null;}
  // motas de polvo (uno o dos cuadros)
  if(Math.random()<0.18){ctx.fillStyle='rgba(18,10,6,0.45)';const n=1+Math.floor(Math.random()*2);
    for(let i=0;i<n;i++){const s=u*(0.5+Math.random()*0.8);ctx.fillRect(Math.random()*cw,Math.random()*ch,s,s);}}
  ctx.restore();
}
// ---------- tinta que tiembla ----------
const DIB_DIRS=[[1,0],[0,1],[-1,1],[1,1],[-1,0],[1,-1],[0,-1]];
function DIB_tinta(fuerte){
  if(!dibOn()||(DIB_LIVIANO&&fuerte===0))return;
  const d=DIB_DIRS[Math.floor(T/5)%DIB_DIRS.length],k=Math.max(1,Math.round(SQ*(fuerte===2?0.5:0.35)));
  ctx.shadowColor='rgba(18,12,24,0.85)';ctx.shadowBlur=0;ctx.shadowOffsetX=d[0]*k;ctx.shadowOffsetY=d[1]*k;
}
function DIB_sinTinta(){ctx.shadowColor='rgba(0,0,0,0)';ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;}
// ---------- rebote ----------
// estirar (+) y aplastar (−) del jugador, desde los pies
function DIB_estira(p){
  if(p.crouch)return 0;
  if(!p.onGround)return Math.min(0.14,Math.abs(p.vy||0)*0.03);
  if(p.landT>0)return -0.17*(p.landT/7);
  return 0;
}
const DIB_drawPlayer0=drawPlayer;
drawPlayer=function(){
  const p=P;if(!dibOn()||p.dead||p.ride)return DIB_drawPlayer0();
  const s=DIB_estira(p);if(Math.abs(s)<0.01)return DIB_drawPlayer0();
  const fx=p.x+4,fy=p.y+18;ctx.save();ctx.translate(fx,fy);ctx.scale(1-s*0.5,1+s);ctx.translate(-fx,-fy);
  try{DIB_drawPlayer0();}finally{ctx.restore();}
};
// soldados: se hamacan al caminar, todos al mismo compás (~2 por segundo)
const DIB_drawSoldier0=drawSoldier;
drawSoldier=function(e){
  if(!dibOn()||e.dying||!e.onGround||Math.abs(e.vx||0)<0.05)return DIB_drawSoldier0(e);
  const a=Math.sin(T*Math.PI*2/30)*0.07,fx=e.x+e.w/2,fy=e.y+e.h;
  ctx.save();ctx.translate(fx,fy);ctx.rotate(a);ctx.translate(-fx,-fy);
  try{DIB_drawSoldier0(e);}finally{ctx.restore();}
};
// ---------- cartel de jefe ----------
let DIB_jefe=null,DIB_jefeRef=null;
ON_START.push(()=>{DIB_jefe=null;DIB_jefeRef=null;});
ON_STEP.push(()=>{
  if(bossRef&&bossRef!==DIB_jefeRef){DIB_jefeRef=bossRef;DIB_jefe={name:bossRef.name||bossName(),mini:!!bossRef.mini,t:0};
    if(banner&&banner.s==='¡PELIGRO!')banner=null;} // el cartel de la arena le deja lugar
  if(!bossRef)DIB_jefeRef=null;
  if(DIB_jefe&&++DIB_jefe.t>170)DIB_jefe=null;
});
// rebote de caída (0→1, pasándose y volviendo)
function DIB_rebote(k){const n=7.5625,d=2.75;
  if(k<1/d)return n*k*k;if(k<2/d){k-=1.5/d;return n*k*k+0.75;}if(k<2.5/d){k-=2.25/d;return n*k*k+0.9375;}k-=2.625/d;return n*k*k+0.984375;}
ON_HUD.push(()=>{
  const j=DIB_jefe;if(!j||state!=='play')return;
  const t=j.t,cx=W/2,y0=40,nm=j.name,w=Math.max(hudTW(nm,12)+34,110),h=30;
  let y=t<26?-h+(y0+h)*DIB_rebote(t/26):t<140?y0:y0-(y0+h+4)*Math.pow((t-140)/30,2);
  // al tocar fondo se aplasta un poquito (como una chapa de goma)
  const sq=t>=8&&t<34?Math.sin((t-8)/26*Math.PI)*0.08:0;
  ctx.save();ctx.translate(cx,y+h);ctx.scale(1+sq,1-sq);ctx.translate(-cx,-(y+h));
  const x=cx-w/2;
  ctx.fillStyle='#120c18';ctx.fillRect(x-1.5,y-1.5,w+3,h+3);
  ctx.fillStyle='#4a2c18';ctx.fillRect(x,y,w,h);ctx.fillStyle='#6b4423';ctx.fillRect(x+2,y+2,w-4,h-4);
  ctx.fillStyle='#8a5a30';ctx.fillRect(x+2,y+2,w-4,1.5);ctx.fillStyle='rgba(18,12,24,0.35)';ctx.fillRect(x+2,y+h-3.5,w-4,1.5);
  ctx.fillStyle='#f3c969';for(const[rx,ry]of[[x+4,y+4],[x+w-5,y+4],[x+4,y+h-5],[x+w-5,y+h-5]])ctx.fillRect(rx,ry,1.5,1.5);
  txt(j.mini?'¡CUIDADO!':'¡EL JEFE!',cx,y+3.5,5,'#f3c969','center',false);
  txt(nm,cx,y+11,12,'#ffe8b0','center');
  ctx.restore();
});
