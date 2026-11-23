'use strict';
// Óxido · ARPÓN, ZONA SECRETA y ENGRANAJES DORADOS. Prefijo AR_ (y ENG_ para los engranajes).
// ---------------------------------------------------------------------------------------------------------------
// ARPÓN: arma rara, 2 tiros. Aparece escondido una vez por misión, en uno de 2–3 lugares (L.arponSitios) y no en todas
//   las partidas (p 0,6). Va en la rueda como un gajo más (rueda.js lo muestra solo si lo tenés) y dispara con DISPARAR,
//   de a un tiro por toque. Solo se engancha en ARGOLLAS de metal oxidado: si apuntás cerca de una (ayuda generosa: hasta
//   ~50° de la puntería y AR_ALCANCE de distancia), el gancho la toma, la soga se tensa y te sube hasta la cornisa de la
//   argolla, parado arriba. Sin argolla cerca, el gancho sale derecho, no agarra nada y vuelve (el tiro se gasta igual).
//   Contra enemigos no hace daño: es una herramienta. En CONTROLES SIMPLES, GRANADA cerca de una argolla usa el arpón.
//   De a dos, el compañero sube colgado de la soga si está cerca (AR_COLGAR); si no, vale la regla de distancia o burbuja.
// ZONA SECRETA (L.secreta): una argolla alta (tipo 'secreto') que brilla y se ve desde abajo pero no se alcanza saltando,
//   ni con doble salto ni con el jetpack de la CHATARRA (techo de vuelo y = 8). Lleva a una sala corta con plataformas,
//   premios y el ENGRANAJE DORADO de la misión. Se pasa UNA vez: cuando el último sale, la argolla se parte y cae.
//   ARGOLLAS TRAMPA (tipo 'trampa'): 2–3 por misión, con premios chicos. Gastar ahí los 2 tiros deja sin el secreto.
// ENGRANAJES DORADOS: uno por misión, se guardan en 'oxido-engranajes' ({"2":1,...}, número de misión). Se ven en la
//   elección de personaje y en LOGROS (fila de 10, gris o dorado). Premios: 3 → CHATARRA DORADA (otro aspecto, se elige
//   en la elección de personaje con ↓ y ←/→), 6 → TUERCA (personaje nuevo), 10 → MISIÓN SECRETA 11 (se hace al final).
// Datos por misión: L.argollas [{x,y,tipo,premio}] (la cornisa se arma sola), L.secreta {x0,x1,top,piso:{x,y,w},plats,
//   premios,gear:{x,y}}, L.arponSitios [{x,y}]. Lo que usan otros: AR_disparar (armas.js fire), ENG_total(), ENG_tiene(n),
//   ENG_meta() (consejos/fin), AR_dorada() (la CHATARRA dorada).
WEAPONS.harpoon={name:'ARPÓN',cd:20,ammo:2,max:2};
WORDER.push('harpoon');WLETTER.harpoon='Q';
HUD_ICONS.harpoon=['.......kk.....','kkkkkkkklk....','kWWWWWWkllk...','kkkkkkkklk....','..kk...kk.....','..kk..........'];
const AR_ALCANCE=210,AR_COLGAR=40,AR_VEL=8;
const AR={ganchos:[],rotas:new Set(),secreto:false,salida:0,sitio:null};
// ================== engranajes dorados (historial) ==================
function ENG_leer(){try{const o=JSON.parse(store.get('oxido-engranajes')||'{}');return o&&typeof o==='object'?o:{};}catch(e){return{};}}
const ENG_tiene=n=>!!ENG_leer()[n];
const ENG_total=()=>Object.keys(ENG_leer()).filter(k=>ENG_leer()[k]).length;
const ENG_PREMIOS=[[3,'CHATARRA DORADA'],[6,'TUERCA'],[10,'MISIÓN SECRETA 11']];
function ENG_meta(){const n=ENG_total();for(const [k,s] of ENG_PREMIOS)if(n<k)return{faltan:k-n,premio:s};return null;}
function ENG_guardar(n){const o=ENG_leer();if(o[n])return false;o[n]=1;store.set('oxido-engranajes',JSON.stringify(o));return true;}
const AR_dorada=()=>ENG_total()>=3&&store.get('oxido-chatarra')==='dorada';
// ================== argollas y cornisas ==================
// cada argolla cuelga debajo de su cornisa (plataforma de 28) — la de la sala secreta cuelga del piso de la sala
for(const lv of LEVELS){
  for(const r of lv.argollas||[]){if(r.tipo==='secreto'&&lv.secreta)r.pl=lv.secreta.piso;
    else{r.pl={x:r.x-14,y:r.y-6,w:28,ar:true};lv.platforms.push(r.pl);}}
  if(lv.secreta){const S=lv.secreta;S.piso.salaAr=true;lv.platforms.push(S.piso);for(const q of S.plats||[]){q.salaAr=true;lv.platforms.push(q);}}
  // cornisas y plataformas de la sala: vigas sin patas (las comunes bajan postes hasta el piso)
  if(lv.argollas||lv.secreta){const d0=lv.drawPlat;lv.drawPlat=pl=>{if(!pl.ar&&!pl.salaAr)return d0?d0(pl):false;AR_dibViga(pl);return true;};}
}
function AR_dibViga(pl){
  if(pl.ar){ctx.strokeStyle='#2a2418';ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(pl.x+3,pl.y);ctx.lineTo(pl.x+pl.w/2,pl.y-14);ctx.lineTo(pl.x+pl.w-3,pl.y);ctx.moveTo(pl.x+pl.w/2,pl.y-14);ctx.lineTo(pl.x+pl.w/2,pl.y-60);ctx.stroke();}
  ctx.fillStyle='#4a5260';ctx.fillRect(pl.x,pl.y,pl.w,3);ctx.fillStyle='#2e3440';ctx.fillRect(pl.x,pl.y+3,pl.w,1.5);
  ctx.fillStyle='#7a8494';ctx.fillRect(pl.x,pl.y,pl.w,0.7);
  ctx.fillStyle='#1c2028';for(let x=pl.x+3;x<pl.x+pl.w-1;x+=6)ctx.fillRect(x,pl.y+1.2,0.8,0.8);
}
const AR_argollas=()=>(L.argollas||[]).filter(r=>!AR.rotas.has(r));
// la argolla que toma el gancho: cerca de la puntería (generoso) y a tiro
function AR_blanco(p){
  const c=pCenter(p),dir=p.aim==='up'?{x:0,y:-1}:p.aim==='down'?{x:0,y:1}:{x:p.face*0.7,y:-0.7};
  let best=null,bs=1e9;
  for(const r of AR_argollas()){const dx=r.x-c.x,dy=r.y-c.y,d=Math.hypot(dx,dy);if(d>AR_ALCANCE||d<6||dy>4)continue;
    const cos=(dx*dir.x+dy*dir.y)/d;if(cos<0.62&&!(p.aim!=='up'&&Math.abs(dx)<26))continue; // ~50°; o casi arriba
    const s=d*(2-cos);if(s<bs){bs=s;best=r;}}
  return best;
}
// disparo (armas.js fire lo llama): un tiro por toque
function AR_disparar(p,porBomba){
  if(!porBomba&&!tapped('shoot'))return;
  if(AR.ganchos.some(g=>g.p===p)||p.gancho)return;
  const r=AR_blanco(p),c=pCenter(p);
  p.weapons.harpoon--;
  const ang=r?Math.atan2(r.y-c.y,r.x-c.x):p.aim==='up'?-Math.PI/2:p.aim==='down'?Math.PI/2:(p.face>0?-0.6:-Math.PI+0.6);
  AR.ganchos.push({p,x:c.x,y:c.y-2,vx:Math.cos(ang)*AR_VEL,vy:Math.sin(ang)*AR_VEL,r,t:0,st:'va',ox:c.x,oy:c.y-2});
  try{tone('square',220,520,0.08,0.04);noise(0.05,0.05,1800);}catch(e){}
  kick(-Math.cos(ang)*1.2,-Math.sin(ang)*1.2);
  if(p.weapons.harpoon<=0){delete p.weapons.harpoon;if(p.weapon==='harpoon'){if(typeof simpleDe==='function'&&simpleDe(p.slot))simVolverArma(p);else nextWeapon();}
    later(30,()=>setBanner('SE TERMINÓ EL ARPÓN',60));}
  else setBanner('ARPÓN · QUEDA 1 TIRO',50);
}
// el gancho viaja; si llega a la argolla, empieza a tirar; si no, vuelve
function AR_ganchosUpd(){
  for(const g of AR.ganchos){g.t++;const p=g.p;
    if(p.dead||p.burbuja){g.gone=true;continue;}
    const c=pCenter(p);
    if(g.st==='va'){g.x+=g.vx;g.y+=g.vy;
      if(g.r&&Math.hypot(g.r.x-g.x,g.r.y-g.y)<AR_VEL+1){g.x=g.r.x;g.y=g.r.y;g.st='tira';AR_engancha(p,g);}
      else if(!g.r&&g.t>18)g.st='vuelve';}
    else if(g.st==='vuelve'){const dx=c.x-g.x,dy=c.y-g.y,d=Math.hypot(dx,dy);if(d<9){g.gone=true;withP(p,()=>AR_volverArma(p));}else{g.x+=dx/d*9;g.y+=dy/d*9;}}
    else if(g.st==='tira'&&!p.gancho)g.gone=true;}
  AR.ganchos=AR.ganchos.filter(g=>!g.gone);
}
function AR_engancha(p,g){
  const r=g.r;p.gancho={r,t:0,g};p.vx=p.vy=0;p.onGround=false;p.plat=null;p.mojado=false;
  try{tone('square',900,500,0.06,0.04);}catch(e){}
  for(let i=0;i<6;i++)parts.push({k:'p',x:r.x,y:r.y,vx:rand(-1,1),vy:rand(-1,0.4),g:0.1,life:14,maxl:14,size:1,col:'#ffd080'});
  // de a dos: el compañero cerca sube colgado de la soga
  const o=players.find(q=>q!==p&&!q.dead&&!q.burbuja&&!q.ride);
  if(o&&Math.abs(o.x-p.x)<AR_COLGAR&&Math.abs(o.y-p.y)<30){o.colgado={p,lado:o.x<p.x?-1:1};o.vx=o.vy=0;}
}
// lo tira hasta la cornisa: queda parado arriba
function AR_tirar(p){
  const G=p.gancho,r=G.r,pl=r.pl;G.t++;
  const tx=clamp(r.x-4,pl.x+1,pl.x+pl.w-9),ty=pl.y-18,dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy);
  const v=Math.min(5,1.5+G.t*0.25);
  if(d<=v||G.t>120){p.x=tx;p.y=ty;p.vy=0;p.onGround=true;p.plat=pl;p.gancho=null;dust(p.x+4,pl.y);AR_volverArma(p);
    if(r.tipo==='secreto'){AR.secreto=true;p.enSala=true;}
    for(const o of players)if(o.colgado&&o.colgado.p===p){o.colgado=null;o.x=clamp(tx+(o.x<tx?-9:9),pl.x+1,pl.x+pl.w-9);o.y=ty;o.vy=0;o.onGround=true;o.plat=pl;if(r.tipo==='secreto')o.enSala=true;}
    return;}
  p.x+=dx/d*v;p.y+=dy/d*v;p.face=dx>=0?1:-1;
}
// después de usar el arpón vuelve el arma de antes (el arpón no sirve para pelear)
function AR_volverArma(p){if(p.weapon==='harpoon'&&p.arUlt&&(p.arUlt==='pistol'||p.weapons[p.arUlt]>0))p.weapon=p.arUlt;}
ON_STEP.push(()=>{for(const p of players)if(p.weapon&&p.weapon!=='harpoon')p.arUlt=p.weapon;});
// ================== el jugador mientras tira la soga (o cuelga) ==================
{const up0=updPlayer;updPlayer=function(){
  const p=P;
  if(p&&!p.dead&&p.gancho){AR_tirar(p);if(p.inv>0)p.inv--;return;}
  if(p&&!p.dead&&p.colgado){const q=p.colgado.p;if(!q.gancho||q.dead){p.colgado=null;}else{p.x=q.x+p.colgado.lado*7;p.y=q.y+12;p.vy=0;if(p.inv>0)p.inv--;return;}}
  // controles simples: GRANADA cerca de una argolla usa el arpón
  if(p&&!p.dead&&!p.ride&&p.weapons.harpoon>0&&typeof simpleDe==='function'&&simpleDe(p.slot)&&tapped('bomb')&&AR_blanco(p)){
    AR_disparar(p,true);(inSlot?pressed2:pressed).bomb=false;}
  up0();};}
// ================== el arpón escondido ==================
function AR_mkPremio(kind,x,y){return{kind,x:x-5,y:y-10,w:10,h:10,vy:0,life:1e9,eco:1,piso:y,draw:AR_drawPremio};}
function AR_drawPremio(k){
  const x=k.x+5,y=k.y+5+Math.sin(T/10)*1.2;
  if(k.kind==='Q'){ctx.fillStyle='rgba(255,210,120,0.18)';circle(x,y,8);ctx.save();ctx.translate(x,y);ctx.rotate(-0.5);
    ctx.fillStyle='#6b4423';ctx.fillRect(-6,-1,9,2);ctx.fillStyle='#8c8e98';ctx.fillRect(3,-1.5,3,3);ctx.fillRect(5,-3,1.2,2);ctx.fillRect(5,1,1.2,2);ctx.restore();
    if((T>>3)%2){ctx.fillStyle='#fff6c8';ctx.fillRect(q(x+5),q(y-6),1,1);}return;}
  if(k.kind==='Y'){const ya=ENG_tiene(levelIdx+1);AR_dibGear(x,y,5,T/30,ya?'#8a8a8a':'#f3c94a',ya?'#5a5a5a':'#b8892a');
    if(!ya){ctx.fillStyle=`rgba(255,220,120,${0.15+0.1*Math.sin(T/8)})`;circle(x,y,10);}}
}
function AR_dibGear(x,y,r,rot,c1,c2){
  ctx.fillStyle=c2;for(let i=0;i<8;i++){const a=rot+i*Math.PI/4;ctx.fillRect(x+Math.cos(a)*r-1.1,y+Math.sin(a)*r-1.1,2.2,2.2);}
  ctx.fillStyle=c1;circle(x,y,r-0.6);ctx.fillStyle=c2;circle(x,y,r*0.38);ctx.fillStyle='#fff6c8';ctx.fillRect(q(x-r*0.5),q(y-r*0.5),1,1);
}
ON_START.push(()=>{
  AR.ganchos=[];AR.rotas=new Set();AR.secreto=false;AR.salida=0;AR.sitio=null;
  for(const p of players){p.gancho=null;p.colgado=null;p.enSala=false;}
  const sit=L.arponSitios||[];
  if(sit.length&&(window.AR_FORZAR||Math.random()<0.6)){const s=window.AR_FORZAR&&window.AR_FORZAR.sitio!==undefined?sit[window.AR_FORZAR.sitio]:pick(sit);AR.sitio=s;pickups.push(AR_mkPremio('Q',s.x,s.y));}
  for(const r of L.argollas||[])if(r.premio)pickups.push({kind:r.premio,x:r.pl.x+9,y:r.pl.y-10,w:10,h:10,vy:0,life:1e9,eco:1,piso:r.pl.y});
  const S=L.secreta;if(S){for(const k of S.premios||[])pickups.push({kind:k.kind,x:k.x-5,y:k.y-10,w:10,h:10,vy:0,life:1e9,eco:1,piso:k.y});
    pickups.push(AR_mkPremio('Y',S.gear.x,S.gear.y));}
});
// recoger el arpón o el engranaje
{const co0=collect;collect=function(kind,x,y,k){
  if(kind==='Q'){P.weapons.harpoon=2;SFX.pick(); // no cambia el arma: el arpón no sirve para pelear (se elige en la rueda o con GRANADA en simples)
    setBanner(typeof simpleDe==='function'&&simpleDe(P.slot)?'¡ARPÓN! · GRANADA CERCA DE UNA ARGOLLA':'¡ARPÓN! · 2 TIROS · ELEGILO EN LA RUEDA (7)',120);
    parts.push({k:'ring',x:x+5,y:y+5,r:3,max:14,life:12,maxl:12,col:'255,220,150'});return;}
  if(kind==='Y'){const n=levelIdx+1,nuevo=ENG_guardar(n);SFX.medal();addScore(nuevo?3000:1000,x+5,y);
    parts.push({k:'ring',x:x+5,y:y+5,r:3,max:20,life:16,maxl:16,col:'255,220,120'});
    for(let i=0;i<14;i++)parts.push({k:'p',x:x+5,y:y+5,vx:rand(-1.6,1.6),vy:rand(-2.2,-0.4),g:0.06,life:30,maxl:30,size:1,col:i%2?'#fff6c8':'#f3c94a'});
    const tot=ENG_total(),m=ENG_meta();
    toast(nuevo?'¡ENGRANAJE DORADO!':'ENGRANAJE (YA LO TENÍAS)',tot+' de 10'+(m?' · faltan '+m.faltan+' para '+m.premio:''),'#f3c94a');
    if(nuevo)for(const [k2,s] of ENG_PREMIOS)if(tot===k2)later(150,()=>{toast('¡DESBLOQUEADO!',s,'#ffe08a');SFX.medal();});
    if(typeof emit==='function')emit('engranaje',{n,tot});return;}
  return co0(kind,x,y,k);};}
// ================== la sala secreta: se pasa una vez ==================
ON_STEP.push(()=>{
  AR_ganchosUpd();
  const S=L.secreta;if(!S||!AR.secreto)return;
  for(const p of players){if(p.dead)continue;const o=p.ride||p,dentro=o.x+4>S.x0-8&&o.x+4<S.x1+8&&o.y+(o.h||18)<=S.piso.y+2;
    if(dentro)p.enSala=true;else if(p.enSala&&o.y>S.piso.y+12)p.enSala=false;}
  if(!players.some(p=>!p.dead&&p.enSala)&&!AR.rotas.has(AR_secretaArg())){const r=AR_secretaArg();if(r){AR.rotas.add(r);AR.salida=1;r.cae={x:r.x,y:r.y,vy:-1,rot:0};
    try{tone('square',600,180,0.25,0.05);noise(0.12,0.08,1400);}catch(e){}setBanner('SE PARTIÓ LA ARGOLLA · EL SECRETO QUEDÓ CERRADO',90);}}
});
const AR_secretaArg=()=>(L.argollas||[]).find(r=>r.tipo==='secreto');
// ================== dibujo ==================
// argollas: aro oxidado debajo de la cornisa; la secreta brilla con un haz que se ve desde abajo
function AR_dibArgolla(r){
  if(r.cae){const c=r.cae;c.vy+=0.18;c.y+=c.vy;c.rot+=0.2;if(c.y>GROUND+40)return;
    ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot);ctx.strokeStyle='#8a4a22';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,0,4,0.4,5.6);ctx.stroke();ctx.restore();return;}
  if(AR.rotas.has(r))return;
  const x=r.x,y=r.y;
  if(r.tipo==='secreto'){const on=0.5+0.5*Math.sin(T/14);
    const g=ctx.createLinearGradient(0,y,0,y+150);g.addColorStop(0,`rgba(255,220,130,${0.16+0.08*on})`);g.addColorStop(1,'rgba(255,220,130,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-3,y);ctx.lineTo(x+3,y);ctx.lineTo(x+16,y+150);ctx.lineTo(x-16,y+150);ctx.closePath();ctx.fill();
    for(let i=0;i<4;i++){const ph=((T*0.7+i*37)%150)/150;ctx.fillStyle=`rgba(255,240,190,${0.8*(1-ph)})`;ctx.fillRect(q(x+Math.sin(i*2+ph*6)*6),q(y+ph*150),1,1);}
    ctx.fillStyle=`rgba(255,220,120,${0.18+0.12*on})`;circle(x,y,9);}
  ctx.fillStyle='#3a2a1a';ctx.fillRect(x-1,r.pl.y,2,y-r.pl.y-3);
  ctx.strokeStyle='#2a1a10';ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(x,y+1,4,0,7);ctx.stroke();
  ctx.strokeStyle=r.tipo==='secreto'?'#d0904a':'#9a5a2a';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(x,y+1,4,0,7);ctx.stroke();
  ctx.fillStyle='#e0a060';ctx.fillRect(q(x-3),q(y-2),1,1);
}
// la sala: chapas remachadas, una ventana y una lámpara (atrás de todo, con el piso)
function AR_dibSala(S){
  if(S.x1<camX-20||S.x0>camX+VW+20)return;
  ctx.fillStyle='#1a1e26';ctx.fillRect(S.x0,S.top,S.x1-S.x0,S.piso.y-S.top);
  ctx.fillStyle='#232833';for(let x=S.x0;x<S.x1;x+=24)ctx.fillRect(x,S.top,1,S.piso.y-S.top);for(let y=S.top+16;y<S.piso.y;y+=20)ctx.fillRect(S.x0,y,S.x1-S.x0,1);
  ctx.fillStyle='#3a4250';for(let x=S.x0+4;x<S.x1;x+=12){ctx.fillRect(x,S.top+2,1,1);ctx.fillRect(x,S.piso.y-3,1,1);}
  ctx.fillStyle='#2e3440';ctx.fillRect(S.x0-4,S.top-6,S.x1-S.x0+8,6);ctx.fillRect(S.x0-4,S.top,4,S.piso.y-S.top-24);ctx.fillRect(S.x1,S.top,4,S.piso.y-S.top-24);
  const on=0.6+0.4*Math.sin(T/30);ctx.fillStyle=`rgba(255,210,120,${0.08*on})`;circle((S.x0+S.x1)/2,S.top+14,30);ctx.fillStyle='#ffe0a0';ctx.fillRect((S.x0+S.x1)/2-1,S.top+6,3,2);
}
ON_DRAW.push(()=>{for(const r of L.argollas||[])if(r.x>camX-30&&r.x<camX+VW+30)AR_dibArgolla(r);
  // la soga y el gancho
  for(const g of AR.ganchos){const c=pCenter(g.p),hx=c.x+g.p.face*4,hy=c.y-3;
    ctx.strokeStyle='#c8b48a';ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(hx,hy);
    const mx=(hx+g.x)/2,my=(hy+g.y)/2+(g.st==='tira'?0:6);ctx.quadraticCurveTo(mx,my,g.x,g.y);ctx.stroke();
    ctx.save();ctx.translate(g.x,g.y);ctx.rotate(Math.atan2(g.vy,g.vx));ctx.fillStyle='#8c8e98';ctx.fillRect(-2,-1,4,2);ctx.fillRect(1,-2.5,1.2,1.6);ctx.fillRect(1,0.9,1.2,1.6);ctx.restore();}
  for(const p of players)if(p.gancho){const r=p.gancho.r,c=pCenter(p);ctx.strokeStyle='#e8d4a8';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(c.x+p.face*3,c.y-3);ctx.lineTo(r.x,r.y);ctx.stroke();}
});
{const dg0=drawGround;drawGround=function(){if(L.secreta)AR_dibSala(L.secreta);dg0();};}
// el arpón en las manos
{const dgs0=drawGunShape;drawGunShape=function(w,ready){if(w!=='harpoon')return dgs0(w,ready);
  ctx.fillStyle='#6b4423';ctx.fillRect(-1,-1,9,2);ctx.fillStyle='#8c8e98';ctx.fillRect(8,-1.5,3,3);ctx.fillRect(10,-3,1.2,2);ctx.fillRect(10,1,1.2,2);
  ctx.fillStyle='#c8b48a';ctx.fillRect(2,0.5,4,1);};}
// la CHATARRA dorada: mismo dibujo con un filtro dorado
{const dm0=drawMech;drawMech=function(m){if(!AR_dorada()){dm0(m);return;}const f=ctx.filter;ctx.filter='sepia(1) saturate(2.6) hue-rotate(-8deg) brightness(1.18)';try{dm0(m);}finally{ctx.filter=f;}};}
// ================== engranajes en la elección de personaje y en LOGROS ==================
function ENG_fila(cx,y,s,marca){
  const o=ENG_leer(),w=10*(s*2+3);let x=cx-w/2+s;
  for(let n=1;n<=10;n++){const ya=!!o[n];AR_dibGear(x+s,y,s,ya?T/60:0,ya?'#f3c94a':'#4a4452',ya?'#b8892a':'#2e2a34');
    if(n===marca){ctx.strokeStyle='#fff6c8';ctx.lineWidth=0.6;ctx.beginPath();ctx.arc(x+s,y,s+1.8,0,7);ctx.stroke();} // la de la misión elegida
    x+=s*2+3;}
}
{const ds0=drawSelect;drawSelect=function(){ds0();
  const n=ENG_total();if(!n)return;
  ENG_fila(44,6,2.2,selLevel+1); // arriba a la izquierda, al lado del título; marcado el de la misión elegida
  if(n>=3){const d=store.get('oxido-chatarra')==='dorada';txt('CHATARRA '+(d?'DORADA':'CLÁSICA')+' (C)',W-5,3,4,d?'#f3c94a':'#aaa','right',false);
    zona(W-80,1,76,9,{clic:()=>{store.set('oxido-chatarra',d?'clasica':'dorada');SFX.swap();}});}};}
// teclas: en la elección de personaje, con 3 engranajes, C cambia el aspecto de la CHATARRA
addEventListener('keydown',e=>{if(state!=='select'||e.code!=='KeyC'||ENG_total()<3)return;store.set('oxido-chatarra',store.get('oxido-chatarra')==='dorada'?'clasica':'dorada');try{SFX.swap();}catch(err){}});
// en LOGROS, arriba a la izquierda: los 10 engranajes y cuántos van
{const hd0=histDraw;histDraw=function(){hd0();if(state!=='logros')return;
  const n=ENG_total();ENG_fila(41,7,2);txt(n+'/10',78,4.5,4,n?'#f3c94a':'#6a5f72','left',false);};}
