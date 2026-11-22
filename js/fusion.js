'use strict';
// Óxido · Fusión de la CHATARRA (el Grillo en el código): CHATARRA II y CHATARRA III (mechNombre en grillo.js)
// Si llegás MANEJANDO un Grillo hasta el siguiente Grillo de la misión, se fusionan y sube de nivel (hasta 3):
//   nivel 2: más grande, más blindaje (18), mortero doble, más combustible del jetpack (15 s).
//   nivel 3: blindaje grueso con luces (24), mortero triple con proyectiles que buscan, y un pisotón que daña
//            alrededor cada vez que cae (no solo de muy alto). Jetpack 20 s.
// La fusión dura 1 s: destello, las dos máquinas se encastran, cartel corto "¡FUSIÓN!" y ruido de metal. Mientras
// dura, el que maneja no recibe daño. Bajarse del Grillo o que lo rompan pierde el nivel (vuelve a 1).
// Si llegás a pie, el siguiente Grillo es nivel 1 como siempre.
// Envuelve funciones de grillo.js (updMech, ejectMech, mechCannon, drawMech, drawMechHUD) sin cambiarlas por dentro.
// Prefijo FU_.
const FU_NIV=[null,{max:12,fmax:600,esc:1},{max:18,fmax:900,esc:1.14},{max:24,fmax:1200,esc:1.26}];
const FU_T=60;
const FU_nivel=m=>m.lvl||1;
function FU_aplicar(m,n){m.lvl=n;const d=FU_NIV[n];m.max=d.max;m.fmax=d.fmax;m.armor=Math.min(m.armor,m.max);m.fuel=Math.min(m.fuel,m.fmax);}
// cada Grillo arranca nivel 1
{const mk0=mkMech;mkMech=function(x){const m=mk0(x);m.lvl=1;return m;};}
function FU_fusionar(m,o){
  const n=Math.min(3,FU_nivel(m)+1);
  o.gone=true;o.fuDe={x:o.x,y:o.y,face:o.face};
  m.fus=FU_T;m.fusO=o.fuDe;FU_aplicar(m,n);m.armor=m.max;m.fuel=m.fmax;m.shells=Math.max(m.shells,12);
  const p=m.by||P;if(p)p.inv=Math.max(p.inv,FU_T+10);m.inv=Math.max(m.inv,FU_T+10);
  setBanner('¡FUSIÓN! '+mechNombre(m),70);
  // metal que encastra: golpes secos que suben y un cierre
  for(let i=0;i<4;i++)later(i*120,()=>{noise(0.12,0.22,1800-i*250);tone('square',180+i*70,90+i*40,0.1,0.05);});
  later(520,()=>{tone('square',520,1040,0.18,0.05);noise(0.3,0.25,900);});
  shake=Math.max(shake,4);
}
// ---------- actualización ----------
const FU_updMech0=updMech;
updMech=function(m){
  const aire=!m.onGround,vy=m.vy;
  FU_updMech0(m);
  if(!m.ride)return;
  if(m.fus>0){m.fus--;const p=m.by||P;if(p)p.inv=Math.max(p.inv,2);m.inv=Math.max(m.inv,2);
    if(m.fus%6===0)for(let i=0;i<4;i++)parts.push({k:'p',x:m.x+rand(0,m.w),y:m.y+rand(0,m.h),vx:rand(-1.5,1.5),vy:rand(-2,-0.5),g:0.1,life:16,maxl:16,size:1,col:i%2?'#fff6c8':'#9ad0ff'});}
  // fusión: el Grillo que manejás toca otro estacionado
  if(!m.fus&&FU_nivel(m)<3)for(const o of mechs)if(o!==m&&!o.ride&&!o.dying&&!o.gone&&overlap(m,o)){FU_fusionar(m,o);break;}
  // nivel 3: pisotón al caer, aunque sea de poco
  if(FU_nivel(m)>=3&&aire&&m.onGround&&vy>1.5)FU_pisoton(m);
};
function FU_pisoton(m){
  const cx=m.x+11,by=m.y+m.h;shake=Math.max(shake,3);noise(0.25,0.25,420);
  parts.push({k:'ring',x:cx,y:by-1,r:4,max:40,life:14,maxl:14,col:'255,210,120'});
  for(let i=0;i<10;i++)parts.push({k:'smoke',col:'200,160,120',x:cx+rand(-22,22),y:by-1,vx:(i%2?1:-1)*rand(0.6,2),vy:rand(-0.4,-0.1),life:rand(16,26),maxl:26,size:rand(1.5,3)});
  for(const e of enemies)if(!e.gone&&hittable(e)&&!isBoss(e)&&Math.abs(e.x+e.w/2-cx)<40&&e.y+e.h>by-30&&e.y<by+4){killSrc='grillo';dmg(e,2.5*dmgMul);killSrc=null;}
  for(const e of enemies)if(!e.gone&&isBoss(e)&&hittable(e)&&Math.abs(e.x+e.w/2-cx)<40+e.w/2){killSrc='grillo';dmg(e,1.5*dmgMul);killSrc=null;}
  for(const c of crates)if(!c.gone&&Math.abs(c.x+7-cx)<32&&Math.abs(c.y+c.h-by)<6)dmgCrate(c,3);
}
// bajarse o romperse: se pierde el nivel
const FU_ejectMech0=ejectMech;
ejectMech=function(m,broken){FU_ejectMech0(m,broken);if(FU_nivel(m)>1){FU_aplicar(m,1);}m.fus=0;};
// mortero doble (nivel 2) o triple que busca (nivel 3)
const FU_mechCannon0=mechCannon;
mechCannon=function(m){
  const n0=grens.length;FU_mechCannon0(m);
  const nv=FU_nivel(m);if(nv<2||grens.length===n0)return;
  const g0=grens[grens.length-1];
  const extra=nv===2?[0.82]:[0.7,1.3];
  for(const k of extra)grens.push({...g0,vx:g0.vx*k+(g0.mort?0:rand(-0.2,0.2)),vy:g0.vy*(g0.mort?1:0.9),t:0,whistle:false});
  if(nv>=3)for(let i=grens.length-1-extra.length;i<grens.length;i++){const g=grens[i];g.busca=true;const u=g.upd;g.upd=function(gg,...r){FU_busca(gg);return u(gg,...r);};}
};
// los del nivel 3 se corren de a poco hacia el enemigo más cercano mientras bajan
function FU_busca(g){
  if(g.vy<0)return;let best=null,bd=90;
  for(const e of enemies){if(!hittable(e))continue;const d=Math.abs(e.x+e.w/2-g.x);if(d<bd){bd=d;best=e;}}
  if(best)g.vx+=clamp((best.x+best.w/2-g.x)*0.02,-0.12,0.12);
  if(T%3===0)parts.push({k:'p',x:g.x,y:g.y,vx:0,vy:0,g:0,life:8,maxl:8,size:1,col:'#ff9a3c'});
}
// ---------- dibujo ----------
const FU_drawMech0=drawMech;
drawMech=function(m){
  const nv=FU_nivel(m),esc=FU_NIV[nv].esc;
  // la fusión: el otro Grillo se encastra desde donde estaba, con destellos
  if(m.fus>0&&m.fusO){const k=1-m.fus/FU_T,o=m.fusO,x=o.x+(m.x-o.x)*Math.min(1,k*1.6),y=o.y+(m.y-o.y)*Math.min(1,k*1.6);
    if(k<0.62){ctx.save();ctx.globalAlpha=0.75;FU_drawMech0({...m,x,y,face:o.face,ride:false,fus:0,dying:0,flash:(T>>1)%2?3:0,lvl:1});ctx.restore();}}
  if(esc!==1){const fx=m.x+m.w/2,fy=m.y+m.h;ctx.save();ctx.translate(fx,fy);ctx.scale(esc,esc);ctx.translate(-fx,-fy);}
  FU_drawMech0(m);
  if(esc!==1){
    // nivel 3: placas gruesas con luces que titilan
    if(nv>=3&&!m.dying){const x=m.x,y=m.y+(m.ride?0:4);ctx.fillStyle='#3a3f48';ctx.fillRect(q(x+3),q(y+5),16,2);ctx.fillStyle='#5a616c';ctx.fillRect(q(x+3),q(y+5),16,0.8);
      for(let i=0;i<3;i++){ctx.fillStyle=((T>>3)+i)%3===0?'#ff5a3c':(((T>>3)+i)%3===1?'#ffd25a':'#6fd0ff');ctx.fillRect(q(x+5+i*5),q(y+5.4),1.4,1.2);}}
    // nivel 2 y 3: estrellitas de nivel en el lomo
    if(!m.dying){ctx.fillStyle='#ffd25a';for(let i=0;i<nv-1;i++)ctx.fillRect(q(m.x+8+i*4),q(m.y+(m.ride?1:5)),2,2);}
    ctx.restore();}
  if(m.fus>0){const k=m.fus/FU_T;ctx.fillStyle=`rgba(255,250,220,${0.55*k*((T>>1)%2?1:0.5)})`;circle(m.x+m.w/2,m.y+m.h/2,22*(1.2-k*0.4));}
};
const FU_drawMechHUD0=drawMechHUD;
drawMechHUD=function(m){
  FU_drawMechHUD0(m);
  // nivel: tres estrellitas al lado del nombre (las que tenés, prendidas)
  const nv=FU_nivel(m),x0=W-6-hudTW(mechNombre(m),5)-24;
  for(let i=0;i<3;i++){const x=x0+i*6,on=i<nv;ctx.fillStyle='#120c18';ctx.fillRect(x-0.5,4.5,5,5);ctx.fillStyle=on?'#ffd25a':'#3a2a40';ctx.fillRect(x,5,4,4);
    if(on){ctx.fillStyle='#fff6c8';ctx.fillRect(x+1,5.5,1,1);}}
  if(m.fus>0)txt('¡FUSIÓN!',x0-4,4,5,(T>>2)%2?'#fff6c8':'#ffd25a','right');
};
// ---------- un segundo Grillo en cada misión (para que la fusión pueda pasar) ----------
// misiones con uno solo: se suma otro más adelante, lejos de torretas y de la arena del jefe
{const extra={1:2440,2:2470,3:2470,4:2470,5:2470,6:2470,7:2470,8:2470,9:2200};
  LEVELS.forEach((L,i)=>{if(L.mechs&&L.mechs.length<2&&extra[i]){L.mechs.push(extra[i]);L.mechs.sort((a,b)=>a-b);}});}
