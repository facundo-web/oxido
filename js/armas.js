'use strict';
// Óxido · Armas del jugador: datos, disparo y dibujo
// ================== armas ==================
const WEAPONS={
  pistol:{name:'PISTOLA',cd:11},
  heavy:{name:'AMETRALLADORA',cd:4,ammo:200,max:400},
  shotgun:{name:'ESCOPETA',cd:24,ammo:24,max:60},
  flame:{name:'LANZALLAMAS',cd:3,ammo:180,max:360},
  rocket:{name:'LANZAMISILES',cd:28,ammo:16,max:40}
};
const WORDER=['pistol','heavy','shotgun','flame','rocket'];
const WLETTER={pistol:'P',heavy:'H',shotgun:'S',flame:'F',rocket:'R'};
const DROPMAP={H:'heavy',S:'shotgun',F:'flame',R:'rocket'};
const PICKCOL={H:'#3c7a3a',S:'#7a4a2a',F:'#b8401e',R:'#3a5a8a',G:'#8a6a2a',E:'#2a8a9a','+':'#e8e2d6',V:'#d9a43a',A:'#3a6a9a',C:'#3a2030'};
// ================== disparo del jugador ==================
// puntería: cada proyectil del jugador suma un disparo; si pega en un enemigo (combate.js: tiroPega) suma un acierto
let tirosDisp=0,tirosPeg=0;
function fire(){
  if(P.weapon==='harpoon'){if(typeof AR_disparar==='function')AR_disparar(P);return;} // arpón: herramienta, un tiro por toque (arpon.js)
  const p=P,w=p.weapon,cx=p.x+4,bd=playerSet(p).dy||0;let sx,sy,dx,dy; // bd: el dibujo baja si las piernas son más cortas
  if(p.aim==='up'){sx=cx+p.face*2;sy=p.y-4+bd;dx=0;dy=-1;}
  else if(p.aim==='down'){sx=cx+p.face;sy=p.y+20;dx=0;dy=1;}
  else{sx=cx+p.face*11;sy=p.crouch?p.y+13:p.y+9+bd;dx=p.face;dy=0;}
  const ang=Math.atan2(dy,dx);
  const bx=dy===0?cx+p.face*3:sx; // a quemarropa también pega
  // agachado: tiro bajo, con un poco más de alto para pegarle a lo que anda pegado al piso (combate.js)
  const bajo=p.crouch&&dy===0;
  const shot=(a,sp,o)=>{tirosDisp++;pbul.push({x:bx,y:sy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,...o,w,sh:1,own:p.slot,bajo});};
  if(typeof partida!=='undefined'&&partida&&!partida.armas[w]){partida.armas[w]=1;emit('weaponUse',{w});}
  switch(w){
  case 'pistol':shot(ang,6,{k:'b',dmg:1,life:70});SFX.shoot();break;
  case 'heavy':shot(ang+rand(-0.07,0.07),6.5,{k:'b',dmg:1,life:70,heavy:true});SFX.heavy();break;
  case 'shotgun':for(let i=0;i<6;i++)shot(ang+rand(-0.3,0.3),rand(5,6.5),{k:'b',dmg:1,life:rand(15,21),pellet:true});
    SFX.shotgun();shake=Math.max(shake,1.2);kick(-dx*1.6,-dy*1.6);break;
  case 'flame':{const a=ang+rand(-0.12,0.12);tirosDisp++;pbul.push({x:sx,y:sy,vx:Math.cos(a)*4.1+p.vx,vy:Math.sin(a)*4.1,k:'flame',dmg:0.9,life:28,maxl:28,hit:new Set(),r:2,w,sh:1,own:p.slot});
    if(T%4===0)SFX.flame();break;}
  case 'rocket':shot(ang,1.6,{k:'rocket',life:110});SFX.rocket();kick(-dx*1.8,-dy*1.8);shake=Math.max(shake,1);
    // contrafuego: fogonazo y humo por detrás del tubo
    parts.push({k:'flash',x:cx-dx*7,y:sy,life:3,maxl:3,size:3});
    for(let i=0;i<4;i++)parts.push({k:'smoke',col:'190,185,180',x:cx-dx*(6+i*2),y:sy+(dy?0:rand(-1,1)),vx:-dx*rand(0.3,0.8),vy:rand(-0.35,-0.1)-dy*0.4,life:rand(20,32),maxl:32,size:rand(1.5,2.5)});break;
  }
  p.rec=Math.max(p.rec||0,{pistol:0.6,heavy:1.1,shotgun:3,flame:0.35,rocket:3.5}[w]);
  if(w!=='flame'&&w!=='rocket'){
    // fogonazo con forma: bola chica + lengua hacia adelante (y abanico en la escopeta)
    const fl=w==='shotgun'?7:w==='heavy'?(T%2?6:4):4;
    parts.push({k:'flash',x:sx,y:sy,life:3,maxl:3,size:w==='shotgun'?4.5:w==='heavy'?3.5:3});
    parts.push({k:'tracer',x:sx,y:sy,x2:sx+Math.cos(ang)*fl,y2:sy+Math.sin(ang)*fl,life:2,maxl:2});
    if(w==='shotgun'){for(const da of[-0.5,0.5])parts.push({k:'tracer',x:sx,y:sy,x2:sx+Math.cos(ang+da)*4,y2:sy+Math.sin(ang+da)*4,life:2,maxl:2});
      for(let i=0;i<3;i++)parts.push({k:'smoke',col:'200,195,190',x:sx+dx*i*2,y:sy+dy*i*2,vx:dx*rand(0.2,0.5),vy:rand(-0.35,-0.15),life:rand(22,34),maxl:34,size:rand(1.2,2)});}
    else if(w==='heavy'&&T%6===0)parts.push({k:'smoke',col:'200,195,190',x:sx,y:sy,vx:dx*0.3,vy:-0.25,life:20,maxl:20,size:1.2});
  }
  if(w==='pistol'||w==='heavy'||w==='shotgun')parts.push({k:'shell',x:cx,y:p.y+8,vx:-p.face*rand(0.6,1.3),vy:rand(-2.3,-1.2),g:0.18,life:rand(45,60),maxl:60,col:w==='shotgun'?'#d93a2b':'#e8c25a'});
  if(w!=='pistol'){p.weapons[w]--;if(p.weapons[w]<=0){delete p.weapons[w];if(typeof simpleDe==='function'&&simpleDe(p.slot))simVolverArma(p);else{nextWeapon();if(p.weapon==='harpoon')nextWeapon();}setBanner('SIN MUNICIÓN',50);}}
}
function prevWeapon(){ // la anterior que tengas (L1, deslizar a la izquierda sobre △)
  const i=WORDER.indexOf(P.weapon),n=WORDER.length;
  for(let k=1;k<=n;k++){const w=WORDER[(i-k+n*2)%n];if(w==='pistol'||P.weapons[w]>0){P.weapon=w;return;}}
}
function nextWeapon(){
  const i=WORDER.indexOf(P.weapon);
  for(let k=1;k<=WORDER.length;k++){const w=WORDER[(i+k)%WORDER.length];if(w==='pistol'||P.weapons[w]>0){P.weapon=w;return;}} // (sin munición, armas.js fire salta el arpón: no sirve para pelear)
}
function rocketBoom(b){b.gone=true;const k=killSrc;killSrc='rocket';if(blast(b.x,b.y,22,5*dmgMul))tiroPega(b);killSrc=k;}
// ================== render: entidades ==================
// arma en las manos: se dibuja hacia +x y se rota/espeja según la puntería
function drawGunShape(w,ready){
  switch(w){
  case 'pistol':ctx.fillStyle='#2b2b33';ctx.fillRect(0,-1,8,2);break;
  case 'heavy':ctx.fillStyle='#3b3f2a';ctx.fillRect(0,-1.5,11,3);ctx.fillStyle='#e07a2c';ctx.fillRect(8,-1.5,2,1);break;
  case 'shotgun':ctx.fillStyle='#6b4423';ctx.fillRect(-3,-1,4,2.2);ctx.fillStyle='#2b2b33';ctx.fillRect(0,-1.2,12,1.8);ctx.fillStyle='#8a5a30';ctx.fillRect(5,0.4,3,1.4);break;
  case 'flame':ctx.fillStyle='#b8401e';ctx.fillRect(-3,-2.5,4,5);ctx.fillStyle='#4a4a52';ctx.fillRect(0,-1,10,2);
    if((T>>1)%2){ctx.fillStyle='#7ab8ff';ctx.fillRect(10,-0.5,1.2,1);}else{ctx.fillStyle='#ff9a3c';ctx.fillRect(10,-0.6,1.5,1.2);}break;
  case 'rocket':ctx.fillStyle='#55603a';ctx.fillRect(-4,-2,14,4);ctx.fillStyle='#2a2a30';ctx.fillRect(8,-2,2,4);ctx.fillRect(-4,-2,1,4);
    if(ready){ctx.fillStyle='#d93a2b';ctx.fillRect(10,-1.5,2,3);}break;
  }
  ctx.fillStyle='#efb88d';ctx.fillRect(1,-0.5,2,2);
}
