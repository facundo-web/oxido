'use strict';
// Óxido · Daño, explosiones, proyectiles, partículas y premios
// ================== combate ==================
// hitFrom: de dónde vino el golpe que se está aplicando ({dir,pow,up}); lo arman las balas y las explosiones
// para empujar al enemigo y despedir el cuerpo; queda en null para los demás golpes
let hitFrom=null;
// killSrc: con qué arma se está pegando ahora (para el evento 'kill'); lo arman balas, granadas, avión, Grillo y gatito
let killSrc=null;
// cuenta un acierto para la puntería (una vez por proyectil del jugador)
function tiroPega(b){if(b&&b.sh&&!b.peg){b.peg=1;tirosPeg++;}}
function killEmit(e){const src=killSrc||(P&&P.ride?'grillo':P?P.weapon:'?'),b=isBoss(e);
  emit('kill',{type:e.type,boss:b&&!e.mini,mini:!!e.mini,name:b?(e.name||bossName()):(e.name||e.type),weapon:src,inMech:src==='grillo'});}
function dmg(e,n){
  if(!hittable(e))return;
  e.hp-=n;e.flash=4;
  if(hitFrom&&!isBoss(e))e.kbx=clamp((e.kbx||0)+hitFrom.dir*hitFrom.pow*0.55,-2.2,2.2); // retroceso de 1–4 px
  if(e.hp<=0)kill(e);else SFX.hit();
}
function kill(e){
  if(isBoss(e)){
    e.state='dying';e.t=0;e.vy=0;addScore(e.score,e.x+30,e.y);RC_soltar(e.score,e.x+e.w/2,e.y+e.h/2,e.mini?8:12);eproj.length=0;
    killEmit(e);
    for(const o of enemies)if(o!==e&&!o.gone&&o.type!=='turret')kill(o);
    SFX.bigboom();shake=8;freeze(4);stopMusic();return;
  }
  e.gone=true;kills++;killsBy[e.type]=(killsBy[e.type]||0)+1;addScore(e.score,e.x+e.w/2,e.y);RC_soltar(e.score,e.x+e.w/2,e.y+e.h/2);killEmit(e);
  if(e.onKill)e.onKill(e); // gancho: efecto de muerte propio (en vez del cadáver o la explosión)
  else if(e.type==='drone')droneDown(e);
  else if(e.type==='turret'){explodeFx(e.x+e.w/2,e.y+e.h/2,18);
    for(let i=0;i<6;i++)parts.push({k:'p',x:e.x+11,y:e.y+5,vx:rand(-1.8,1.8),vy:rand(-3.6,-1.6),g:0.18,life:rand(40,60),maxl:60,size:i%2?2:1.5,col:i%2?'#6f6a64':'#d9a43a'});}
  else{
    // el cuerpo sale despedido según el golpe: poco con bala, lejos y alto con explosión
    const h=hitFrom,dir=h?h.dir:-e.face,f=h?h.fl:1,fl=h&&h.up?{vx:dir*rand(1.3,1.7)*Math.min(h.pow,1.6),vy:-rand(3.4,3.9),vr:dir*rand(0.2,0.28)}
      :{vx:dir*1.2*f*rand(0.9,1.1),vy:-2.6-(f-1)*1.1,vr:dir*0.12*f};
    corpse(e.type==='grenadier'?SPR.g:e.type==='shield'?SPR.sh:SPR.e,e.x,e.y,e.face,fl);SFX.down();
    if(Math.random()<(e.type==='shield'?0.25:0.1))pickups.push({kind:pick(['H','S','F','R','G','E','+']),x:e.x,y:e.y,w:10,h:10,vy:-2.5,life:700});}
  if(e.arma)ARM_soltar(e); // armados.js: el soldado armado suelta la munición de su arma
  checkMedals(e);
}
function dmgCrate(c,n){
  c.hp-=n;c.flash=4;if(c.armored){SFX.ping();spark(c.x+8,c.y+8,'#cfd6e0');}else SFX.hit();
  if(c.hp<=0&&!c.gone){c.gone=true;addScore(c.armored?300:20,c.x+7,c.y);RC_soltar(c.armored?300:20,c.x+c.w/2,c.y+c.h/2,c.armored?6:2);if(c.armored){explodeFx(c.x+8,c.y+8,12);setBanner('¡COFRE ABIERTO!',60);emit('vaultOpen',{});}
    for(let i=0;i<10;i++)parts.push({k:'p',x:c.x+7,y:c.y+7,vx:rand(-2,2),vy:rand(-3,-0.5),g:0.18,life:rand(25,40),maxl:40,size:2,col:c.armored?(i%2?'#7d8794':'#3a404c'):(i%2?'#9a6a3a':'#6e4824')});
    pickups.push({kind:c.drop,x:c.x+2,y:c.y,w:10,h:10,vy:-2.5,life:900});}
}
function blast(x,y,r,d,bossMul=1){
  explodeFx(x,y,r);
  const keep=hitFrom;let n=0;
  for(const e of enemies){if(!hittable(e))continue;const cx=e.x+e.w/2,cy=e.y+e.h/2;if(Math.abs(cx-x)<r+e.w/2&&Math.abs(cy-y)<r+e.h/2){
    hitFrom={dir:cx>=x?1:-1,pow:1+r/40,fl:1.6,up:true};dmg(e,isBoss(e)?d*bossMul:d);n++;}}
  hitFrom=keep;
  for(const c of crates)if(!c.gone&&Math.abs(c.x+7-x)<r+7&&Math.abs(c.y+7-y)<r+7)dmgCrate(c,3);
  return n; // cuántos enemigos tocó (para la puntería del lanzamisiles)
}
function hurtPlayer(n=1){
  const p=P;if(p.dead||winT)return;
  if(p.ride){const m=p.ride;if(m.inv>0)return;m.armor-=n;m.inv=24;m.flash=5;SFX.hit();shake=Math.max(shake,2);if(m.armor<=0)mechBreak(m);return;}
  if(p.inv>0)return;
  if(p.shield>0){p.shield--;p.inv=45;SFX.shield();parts.push({k:'ring',x:p.x+4,y:p.y+9,r:6,max:16,life:12,maxl:12,col:'120,220,255'});
    if(!p.shield)setBanner('ESCUDO ROTO',50);return;}
  p.hp--;SFX.hurt();shake=Math.max(shake,4);freeze(3);p.inv=70;emit('hurt',{player:p.slot+1});
  if(p.hp<=0){p.dead=true;p.deadT=110;
    // 2 jugadores: si queda una vida la reserva para volver; si no, no descuenta (queda afuera)
    if(twoP()){p.back=lives>0;if(p.back)lives--;}else lives--;
    corpse(playerSet(p),p.x,p.y,p.face);dust(p.x+4,GROUND);}
}
// k: el premio levantado (k.amt: munición que soltó un soldado armado, armados.js)
function collect(kind,x,y,k){
  const rcAntes=RC_foto(),mun=k&&k.amt; // recolectar.js: lo que tenía antes, para que cada cosa vuele a su lugar del HUD
  SFX.pick();
  if(!mun){addScore(50,x+5,y);RC_soltar(50,x+5,y+5,1);} // los puntos también saltan en una chapita
  // pop de recolección: destello, aro y brillitos que suben
  parts.push({k:'flash',x:x+5,y:y+5,life:3,maxl:3,size:5});parts.push({k:'ring',x:x+5,y:y+5,r:3,max:12,life:10,maxl:10,col:'255,240,180'});
  for(let i=0;i<5;i++)parts.push({k:'p',x:x+5+rand(-4,4),y:y+5,vx:rand(-0.6,0.6),vy:rand(-1.8,-0.8),g:0.04,life:rand(16,24),maxl:24,size:1,col:i%2?'#fff':'#ffe08a'});
  const w=DROPMAP[kind];
  if(w){const tenia=P.weapons[w]>0,n=mun?k.amt:WEAPONS[w].ammo;P.weapons[w]=Math.min(WEAPONS[w].max,(P.weapons[w]||0)+n);
    // munición de un arma que ya tenías: no te cambia la que estás usando (salvo que tengas la pistola)
    if(!mun||!tenia||P.weapon==='pistol'){P.weapon=w;setBanner('¡'+WEAPONS[w].name+'!',mun?50:70);}
    if(mun)parts.push({k:'txt',s:'+'+n,x:x+5,y:y-6,life:40,maxl:40});}
  else if(kind==='G'){P.bombs=Math.min(40,P.bombs+10);setBanner('GRANADAS +10',60);}
  else if(kind==='E'){P.shield=3;setBanner('ESCUDO · AGUANTA 3 GOLPES',70);}
  else if(kind==='V'){setBanner(gainLife()?'¡VIDA EXTRA!':'VIDAS AL MÁXIMO · +1000',80);SFX.medal();}
  else if(kind==='A'){flares++;setBanner('APOYO AÉREO GRATIS · MANTENÉ '+airKey(),70);}
  else if(P.ride){P.ride.armor=P.ride.max;setBanner('BLINDAJE REPARADO',60);}
  else{P.hp=maxHp;setBanner('SALUD AL MÁXIMO',60);}
  RC_junto(kind,x,y,rcAntes);
}
// enemigos nuevos por tipo: ENEMY_MAKERS[t]=(x,y)=>enemigo (las misiones nuevas le agregan entradas)
const ENEMY_MAKERS={};
function spawn(it){
  const x=it.x==='R'?camX+VW+12:it.x==='L'?camX-20:it.x;
  const e=ENEMY_MAKERS[it.t]?ENEMY_MAKERS[it.t](x,it.y):it.t==='drone'?mkDrone(x,it.y??rand(28,60)):mkSoldier(x,it.y??GROUND-18,it.t);
  if(it.x==='L')e.face=1;
  const d=DIFF();e.hp=Math.max(1,Math.round(e.hp*d.ehp));e.cd*=d.fire;PC_escalar(e);ARM_armar(e);enemies.push(e);
}
function updProjectiles(){
  for(const b of pbul){
    if(b.gone)continue;
    if(b.k==='rocket'){
      const sp=Math.min(6.5,Math.hypot(b.vx,b.vy)*1.09+0.05);let a=Math.atan2(b.vy,b.vx);
      let tgt=null,bd=150;
      for(const e of enemies){if(!hittable(e))continue;const ex=e.x+e.w/2,ey=e.y+e.h/2,d=Math.hypot(ex-b.x,ey-b.y);
        if(d<bd&&Math.abs(angDiff(Math.atan2(ey-b.y,ex-b.x),a))<1.2){bd=d;tgt=[ex,ey];}}
      if(tgt)a+=clamp(angDiff(Math.atan2(tgt[1]-b.y,tgt[0]-b.x),a),-0.07,0.07);
      b.vx=Math.cos(a)*sp;b.vy=Math.sin(a)*sp;
      if(T%2===0)parts.push({k:'smoke',col:'190,180,170',x:b.x,y:b.y,vx:0,vy:-0.1,life:22,maxl:22,size:1.2});
    }
    if(b.k==='flame'){b.vx*=0.95;b.vy=b.vy*0.95-0.03;b.r+=0.22;}
    b.x+=b.vx;b.y+=b.vy;
    if(--b.life<=0||b.x<camX-10||b.x>camX+VW+10||b.y<-10){if(b.k==='rocket'&&b.life<=0)rocketBoom(b);b.gone=true;continue;}
    if(b.y>=GROUND){
      if(b.k==='rocket'){rocketBoom(b);continue;}
      if(b.k==='flame'){b.y=GROUND-1;b.vy=0;}
      else{b.gone=true;dust(b.x,GROUND,2);continue;}
    }
    if(b.k==='flame'){
      for(const e of enemies)if(hittable(e)&&!b.hit.has(e)&&overlapPt(e,b.x,b.y,b.r)){b.hit.add(e);tiroPega(b);killSrc='flame';hitFrom={dir:Math.sign(b.vx)||1,pow:0.25,fl:0.7};dmg(e,b.dmg*dmgMul);hitFrom=null;killSrc=null;}
      for(const c of crates)if(!c.gone&&!b.hit.has(c)&&overlapPt(c,b.x,b.y,b.r)){b.hit.add(c);dmgCrate(c,0.5);}
      for(const pr of prisoners)if(pr.state==='tied'&&overlapPt(pr,b.x,b.y,b.r))freePris(pr);
      continue;
    }
    // un disparo a la soga también libera al prisionero
    for(const pr of prisoners)if(pr.state==='tied'&&!b.ally&&overlapPt(pr,b.x,b.y,1.5)){freePris(pr);if(b.k==='rocket')rocketBoom(b);else b.gone=true;break;}
    if(b.gone)continue;
    for(const e of enemies){if(!hittable(e))continue;if(overlapPt(e,b.x,b.y,1.5)){
      // el escudero frena las balas que le llegan de frente
      // ...pero el escudo aguanta 8 impactos y se rompe
      if(e.type==='shield'&&e.shp>0&&b.k==='b'&&Math.sign(b.vx)===-e.face&&Math.abs(b.vx)>Math.abs(b.vy)*0.7){
        b.gone=true;tiroPega(b);e.sflash=4;spark(b.x,b.y,'#bfe6ff',Math.sign(b.vx));e.shp-=b.dmg;e.kbx=clamp((e.kbx||0)+Math.sign(b.vx)*0.25,-1,1);
        if(e.shp<=0){SFX.hit();noise(0.2,0.2,2500);setBanner('¡ESCUDO ROTO!',35);
          for(let i=0;i<8;i++)parts.push({k:'p',x:e.x+(e.face>0?8:-1),y:e.y+8,vx:e.face*rand(0.3,1.8),vy:rand(-2.5,-0.5),g:0.18,life:rand(25,40),maxl:40,size:1.5,col:i%2?'#7d8794':'#d9a43a'});}
        else SFX.ping();break;}
      if(b.k==='rocket'){tiroPega(b);rocketBoom(b);}else{const dir=Math.sign(b.vx)||(b.x<e.x+e.w/2?1:-1);tiroPega(b);killSrc=b.ally?'ally':b.w||'grillo';
        hitFrom={dir,pow:(b.pellet?0.9:b.heavy?0.8:1)*(Math.abs(b.vx)<Math.abs(b.vy)?0.3:1),fl:b.pellet?1.4:b.heavy?1.1:1};dmg(e,b.dmg*dmgMul);hitFrom=null;killSrc=null;b.gone=true;spark(b.x,b.y,undefined,dir);}break;}}
    if(b.gone)continue;
    for(const c of crates)if(!c.gone&&overlapPt(c,b.x,b.y,1.5)){if(b.k==='rocket')rocketBoom(b);else{dmgCrate(c,1);b.gone=true;spark(b.x,b.y,undefined,Math.sign(b.vx));}break;}
    if(b.gone)continue;
    for(const o of eproj)if(o.kind!=='bullet'&&!o.gone&&Math.abs(o.x-b.x)<o.r+2&&Math.abs(o.y-b.y)<o.r+2){o.gone=true;b.gone=true;tiroPega(b);explodeFx(o.x,o.y,9);addScore(10,o.x,o.y);RC_soltar(10,o.x,o.y,1);break;}
  }
  for(const g of grens){
    if(g.upd){g.upd(g);continue;} // granadas especiales (p. ej. del Grillo)
    g.t++;g.vy+=g.can?0.08:0.18;g.x+=g.vx;g.y+=g.vy;g.rot+=g.vx*0.3;
    let boom=g.t>150;
    if(g.x<camX-20||g.x>camX+VW+20){g.gone=true;continue;}
    if(g.y>=GROUND-2){g.y=GROUND-2;if(g.b<1){g.vy=-Math.abs(g.vy)*0.45;g.vx*=0.6;g.b++;}else boom=true;}
    for(const e of enemies)if(hittable(e)&&overlapPt(e,g.x,g.y,2)){boom=true;break;}
    for(const c of crates)if(!c.gone&&overlapPt(c,g.x,g.y,2)){boom=true;break;}
    if(boom){g.gone=true;killSrc=g.can?'grillo':'grenade';blast(g.x,g.y,g.can?22:28*(g.gr??(CH().grenadeR||1)),(g.can?7:6)*dmgMul);killSrc=null;}
  }
  // cajas de golpe de cada jugador (se calculan una vez por cuadro, antes de mover los proyectiles)
  const tg=players.map(p=>({p,hb:p.dead?null:hurtbox(p)})),k0=P;
  for(const b of eproj){
    if(b.gone)continue;
    if(b.upd){ // proyectiles enemigos especiales (p. ej. fuego): le pegan al jugador vivo más cercano
      let t=tg[0];if(tg.length>1){const n=nearestPlayer(b.x,b.y);t=tg.find(o=>o.p===n)||t;}
      usePlayer(t.p);b.upd(b,t.hb);usePlayer(k0);continue;}
    b.t++;b.vy+=b.g;b.x+=b.vx;b.y+=b.vy;
    if(coverBlocks(b)){b.gone=true;if(b.blast)explodeFx(b.x,b.y,b.blast);else spark(b.x,b.y,'#d9c8a0');continue;}
    const who=tg.find(({hb})=>hb&&b.x+b.r>hb.x&&b.x-b.r<hb.x+hb.w&&b.y+b.r>hb.y&&b.y-b.r<hb.y+hb.h);
    let hitP=!!who;
    if(b.kind==='bullet'){
      if(hitP){withP(who.p,()=>hurtPlayer(1));b.gone=true;}
      else if(b.y>GROUND||b.x<camX-20||b.x>camX+VW+20||b.y<-20)b.gone=true;
      else for(const a of allies)if(!a.gone&&overlapPt(a,b.x,b.y,b.r)){killAlly(a);b.gone=true;break;}
    }else{
      if(!hitP)for(const a of allies)if(!a.gone&&overlapPt(a,b.x,b.y,b.r)){hitP=true;break;}
      let boom=hitP||b.y>=GROUND-2||b.t>320;
      if(!boom)for(const pl of platforms)if(b.vy>0&&b.x>pl.x&&b.x<pl.x+pl.w&&b.y>=pl.y&&b.y-b.vy<pl.y){boom=true;break;}
      if(boom){b.gone=true;const y=Math.min(b.y,GROUND-2);explodeFx(b.x,y,b.blast);
        for(const a of allies)if(Math.hypot(a.x+4-b.x,a.y+9-y)<b.blast+4)killAlly(a);
        for(const {p,hb} of tg)if(hb){const d=Math.hypot(hb.x+hb.w/2-b.x,hb.y+hb.h/2-y);if(d<b.blast+(p.ride?10:4))withP(p,()=>hurtPlayer(2));}}
    }
  }
}
function updParts(){
  for(const p of parts){
    if(--p.life<=0){p.gone=true;continue;}
    switch(p.k){
    case 'fire':p.x+=p.vx;p.y+=p.vy;p.vx*=0.9;p.vy=p.vy*0.9-0.03;break;
    case 'smoke':p.x+=p.vx;p.y+=p.vy;p.size+=0.08;if(p.rise){p.vy-=0.006;p.vx*=0.985;}break;
    case 'ring':p.r+=(p.max-p.r)*0.3;break;
    case 'p':case 'shell':p.vy+=p.g;p.x+=p.vx;p.y+=p.vy;if(p.y>GROUND-1){p.y=GROUND-1;p.vy*=-0.35;p.vx*=0.6;}break;
    case 'spr':p.vy+=p.g;p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;
      if(p.y>GROUND-14){p.y=GROUND-14;
        // primer golpe contra el suelo: rebote chico y polvo
        if(!p.landed){p.landed=1;dust(p.x+7,GROUND,p.vy>3.5?6:4);if(p.vy>2){p.vy=-p.vy*0.28;p.vx*=0.6;p.vr*=0.6;break;}}
        p.vy=0;p.vx*=0.8;p.vr*=0.5;}break;
    case 'txt':{ // sube rápido y frena; posición en píxel entero para que se lea nítido
      if(p.fy===undefined)p.fy=p.y;const a=p.life/p.maxl;p.fy-=0.12+1.1*a*a*a;p.y=Math.round(p.fy);break;}
    }
  }
}
function drawPickup(k){
  if(k.draw){k.draw(k);return;} // premios con dibujo propio (munición de soldados: armados.js)
  if(k.life<150&&(T>>2)%2)return;
  const bob=k.vy===0?Math.sin(T/8):0,x=k.x,y=k.y+bob;
  ctx.fillStyle='#120c18';ctx.fillRect(x-0.5,y-0.5,11,11);ctx.fillStyle=PICKCOL[k.kind];ctx.fillRect(x,y,10,10);
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.fillRect(x,y,10,1);
  if(k.kind==='V'){ctx.fillStyle='#ff4d4d';ctx.fillRect(x+2,y+2,2,1);ctx.fillRect(x+5,y+2,2,1);ctx.fillRect(x+1,y+3,7,2);ctx.fillRect(x+2,y+5,5,1);ctx.fillRect(x+3,y+6,3,1);ctx.fillRect(x+4,y+7,1,1);
    if((T>>3)%2){ctx.fillStyle='#fff';ctx.fillRect(x+8,y+1,1,1);}}
  else if(k.kind==='+'){ctx.fillStyle='#d93a2b';ctx.fillRect(x+4,y+2,2,6);ctx.fillRect(x+2,y+4,6,2);}
  else txt(k.kind,x+5,y+1.5,7,'#fff','center',false);
}
function drawCrate(c){
  if(c.armored){drawVault(c);return;}
  const w=c.flash>0;ctx.fillStyle='#120c18';ctx.fillRect(c.x-0.5,c.y-0.5,15,15);
  ctx.fillStyle=w?'#fff':'#9a6a3a';ctx.fillRect(c.x,c.y,14,14);
  if(!w){ctx.fillStyle='#6e4824';ctx.fillRect(c.x,c.y,14,1.5);ctx.fillRect(c.x,c.y+12.5,14,1.5);ctx.fillRect(c.x,c.y,1.5,14);ctx.fillRect(c.x+12.5,c.y,1.5,14);
    ctx.save();ctx.beginPath();ctx.rect(c.x,c.y,14,14);ctx.clip();ctx.strokeStyle='#6e4824';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(c.x+14,c.y+14);ctx.stroke();ctx.restore();}
}
function shellLanding(b){let x=b.x,y=b.y,vx=b.vx,vy=b.vy;for(let i=0;i<300&&y<GROUND-2;i++){vy+=b.g;x+=vx;y+=vy;}return x;}
// cofre blindado: chapa remachada con candado; se va abollando a medida que le pegás
function drawVault(c){
  const w=c.flash>0,x=c.x,y=c.y,dmg=1-c.hp/c.max;
  ctx.fillStyle='#120c18';ctx.fillRect(x-0.5,y-0.5,17,17);
  ctx.fillStyle=w?'#fff':'#5a6270';ctx.fillRect(x,y,16,16);
  if(w)return;
  ctx.fillStyle='#7d8794';ctx.fillRect(x,y,16,2);ctx.fillStyle='#3a404c';ctx.fillRect(x,y+7,16,1.5);ctx.fillRect(x,y+14,16,2);
  ctx.fillStyle='#9aa4b0';for(const[rx,ry]of[[1.5,3.5],[13.5,3.5],[1.5,11],[13.5,11]])ctx.fillRect(x+rx,y+ry,1,1);
  ctx.fillStyle='#d9a43a';ctx.fillRect(x+6,y+5,4,5);ctx.fillStyle='#120c18';ctx.fillRect(x+7.5,y+7,1,2);
  ctx.strokeStyle='#d9a43a';ctx.lineWidth=0.8;ctx.beginPath();ctx.arc(x+8,y+5,1.5,Math.PI,0);ctx.stroke();
  ctx.fillStyle='#120c18';if(dmg>0.3)ctx.fillRect(x+3,y+3,1,3);if(dmg>0.55){ctx.fillRect(x+11,y+10,3,1);ctx.fillRect(x+12,y+9,1,1);}if(dmg>0.8){ctx.fillRect(x+4,y+11,1,3);ctx.fillRect(x+10,y+2,1,2);}
  if(nearAny(x+8,120)&&c.hp===c.max&&(T>>4)%3)txt('¡DISPARALE!',x+8,y-8,4,'#ffe08a','center');
}
