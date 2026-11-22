'use strict';
// Óxido · Interfaz, menús y pantallas finales
// ================== íconos en pixel art ==================
// Cada ícono es una grilla de letras; '.' es transparente. Los colores salen de HUD_PAL (o de un pal propio).
const HUD_PAL={k:'#120c18',g:'#3a3a44',l:'#8c8e98',w:'#8a5a30',W:'#6b4423',G:'#55603a',H:'#7f8c52',y:'#e8c25a',
  r:'#b8401e',R:'#e06a3a',b:'#7ab8ff',m:'#d93a2b',c:'#96dce6',p:'#3d4a2c',P:'#5d6e40'};
const HUD_ICONS={
  pistol:['kkkkkkkkk.','klllllllkk','kgggggggk.','kkgkkkkk..','.kWWk.....','.kWWk.....','.kkkk.....'],
  heavy:['..kkkkk.........','kkkGGGGkkkkkkkkk','kWkGHHGllllllllk','kWkGGGGkkkkkkkkk','kWWkyykk........','.kkkyyk.........','....kk..........'],
  shotgun:['kkkk...kkkkkkkkk','kwwwkkkggggggggk','kWwwwwkgwwwwgggk','kkWWWkgkWWWWkkkk','...kkkk.kkkk....'],
  flame:['.kkk............','kRrrk...........','krrrkkkkkkkkkk..','krrrklllllllllkb','krrrkkgkkkkkkk..','kkkkkgWk........','....kkkk........'],
  rocket:['...kk...........','kkkkgkkkkkkkk...','kgGGGGGGGGGGkkk.','kgHHHHHHHHHHkmmk','kgGGGGGGGGGGkkk.','kkkkkWkkkkkkk...','....kkk.........'],
  grenade:['...kkk.','..kgkk.','.kkkkk.','kGHGGGk','kGGGGGk','kGGGGGk','.kkkkk.'],
  plane:['kk..........','kPk..kkkk...','kPPkkPPPPkkk','kpppppppppck','.kkkkpppkkk.','.....kkk....'],
  heart:['.kk.kk.','krRkrrk','krrrrrk','.krrrk.','..krk..','...k...'],
  shield:['kkkkk','kbcbk','kbbbk','kbbbk','.kbk.','..k..']
};
function hudPix(map,x,y,s=1,pal=HUD_PAL){
  for(let j=0;j<map.length;j++){const row=map[j];
    for(let i=0;i<row.length;i++){const ch=row[i];if(ch==='.')continue;ctx.fillStyle=pal[ch]||HUD_PAL[ch];ctx.fillRect(x+i*s,y+j*s,s,s);}}
}
const hudIW=(map,s=1)=>map[0].length*s,hudIH=(map,s=1)=>map.length*s;
function hudTW(s,size){return txtW(s,size);} // mide también los íconos ✕ ○ □ △ (base.js)
// tecla dibujada como una tecla chiquita ("S", "△", "L1", "LB"…). Se ensancha si el nombre es largo.
const keycapW=ch=>Math.max(7,Math.ceil(hudTW(ch,5))+3);
function keycap(ch,x,y,col='#ddd'){const w=keycapW(ch);ctx.fillStyle='#120c18';ctx.fillRect(x,y,w,7);ctx.fillStyle='#2a1f30';ctx.fillRect(x+0.5,y+0.5,w-1,6);
  ctx.fillStyle='#5a4a60';ctx.fillRect(x+0.5,y+6,w-1,0.5);txt(ch,x+w/2,y+1,5,col,'center',false);return w;}
function heart(x,y,on){hudPix(HUD_ICONS.heart,x,y,1,on?{r:'#ff4d4d',R:'#ffb0a0'}:{r:'#4a2730',R:'#5a3340'});}
// cabecita del personaje elegido (sale del mismo sprite del juego)
function hudHead(x,y){const img=(P?playerSet(P):charSet(charIdx,p1Col[charIdx])).idle[0];ctx.drawImage(img,0,0,14,8,x,y,14,8);}
// ================== insignia de medalla (una sola, sube de nivel) ==================
function hudStar(cx,cy,ro,ri,col){ctx.fillStyle=col;ctx.beginPath();
  for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?ri:ro;ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}ctx.fill();}
// lvl: 0 = todavía ninguna, 1 = BRONCE … 6 = LEYENDA. La forma se vuelve más vistosa con cada nivel.
function drawBadge(cx,cy,lvl,r=5){
  if(lvl<=0){ctx.fillStyle='rgba(18,12,24,0.7)';circle(cx,cy,r+0.7);ctx.strokeStyle='#5a4a60';ctx.lineWidth=0.8;ctx.setLineDash([1.2,1.2]);
    ctx.beginPath();ctx.arc(cx,cy,r-0.3,0,7);ctx.stroke();ctx.setLineDash([]);return;}
  const col=MEDALS[lvl-1].col;
  // cinta
  ctx.fillStyle='#120c18';ctx.fillRect(cx-3.5,cy-r-4.5,7,4.5);
  ctx.fillStyle='#d93a2b';ctx.fillRect(cx-2.5,cy-r-4,2.5,4);ctx.fillStyle='#2f5fb8';ctx.fillRect(cx,cy-r-4,2.5,4);
  // alas (platino en adelante)
  if(lvl>=4){ctx.fillStyle='#120c18';ctx.fillRect(cx-r-4,cy-2.5,r*2+8,4);ctx.fillStyle=col;ctx.fillRect(cx-r-3.5,cy-2,3,1);ctx.fillRect(cx+r+0.5,cy-2,3,1);
    ctx.fillRect(cx-r-2.5,cy-0.5,2,1);ctx.fillRect(cx+r+0.5,cy-0.5,2,1);}
  // laureles (oro en adelante)
  if(lvl>=3){ctx.fillStyle='#7dbf4a';for(let i=0;i<3;i++){const a=Math.PI*0.65+i*0.38;
    ctx.fillRect(cx+Math.cos(a)*(r+1.6)-0.6,cy+Math.sin(a)*(r+1.6)-0.6,1.3,1.3);ctx.fillRect(cx-Math.cos(a)*(r+1.6)-0.6,cy+Math.sin(a)*(r+1.6)-0.6,1.3,1.3);}}
  if(lvl===5){ // diamante: gema con facetas
    const d=r+1.5;ctx.fillStyle='#120c18';ctx.beginPath();ctx.moveTo(cx,cy-d-0.8);ctx.lineTo(cx+d+0.8,cy);ctx.lineTo(cx,cy+d+0.8);ctx.lineTo(cx-d-0.8,cy);ctx.fill();
    ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(cx,cy-d);ctx.lineTo(cx+d,cy);ctx.lineTo(cx,cy+d);ctx.lineTo(cx-d,cy);ctx.fill();
    ctx.fillStyle='#6fc8e8';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+d,cy);ctx.lineTo(cx,cy+d);ctx.fill();
    ctx.fillStyle='#fff';ctx.fillRect(cx-d*0.45,cy-d*0.3,1,1);
  }else if(lvl===6){ // leyenda: estrella con destello
    hudStar(cx,cy,r+2.6,r*0.55+0.9,'#120c18');hudStar(cx,cy,r+1.8,r*0.55,col);hudStar(cx,cy,r*0.6,r*0.3,'#ffd0f0');
    if((T>>4)%3===0){ctx.fillStyle='#fff';ctx.fillRect(cx+r,cy-r-1,1,3);ctx.fillRect(cx+r-1,cy-r,3,1);}
  }else{ // medalla redonda
    ctx.fillStyle='#120c18';circle(cx,cy,r+0.7);ctx.fillStyle=col;circle(cx,cy,r);
    if(lvl>=2){ctx.fillStyle='rgba(18,12,24,0.25)';circle(cx,cy,r-1.2);ctx.fillStyle=col;circle(cx,cy,r-1.8);}
    if(lvl>=2)hudStar(cx,cy+0.3,r*0.55,r*0.24,'rgba(18,12,24,0.45)');
    ctx.fillStyle='rgba(255,255,255,0.6)';ctx.fillRect(cx-r*0.55,cy-r*0.6,1,1);
  }
}
const bossShown=()=>bossRef&&!bossRef.gone&&bossRef.state!=='enter';
// ================== HUD en juego ==================
function drawHUD(){
  // --- arriba a la izquierda: insignia, puntos, vidas, corazones y bajas ---
  // la medalla nueva viaja desde donde cayó la baja (recolectar.js): hasta que llega, la insignia muestra la anterior
  const mv=RC_ver('md',medals),mj=RC_salto('md');RC_ancla('md',12,12);
  const fresh=toasts.length&&toasts[0].lvl&&mv>=toasts[0].lvl; // recién llegó: la insignia late
  if(fresh&&(T>>2)%2){ctx.fillStyle='rgba(255,255,255,0.35)';circle(12,12+mj,8);}
  drawBadge(12,12+mj,mv,5);
  const prev=mv?MEDALS[mv-1].at:0,next=mv<MEDALS.length?MEDALS[mv]:null;
  const pk=next?clamp((kills-prev)/(next.at-prev),0,1):1;
  ctx.fillStyle='#120c18';ctx.fillRect(4.5,20.5,15,3);ctx.fillStyle='#2a1f30';ctx.fillRect(5,21,14,2);
  ctx.fillStyle=next?next.col:MEDALS[MEDALS.length-1].col;ctx.fillRect(5,21,14*pk,2);
  // los números salen de RC_ver (recolectar.js): persiguen al valor real y suben de a poco cuando llega un premio
  txt(String(RC_ver('sc',score)).padStart(7,'0'),24,4+RC_salto('sc'),7,RC_luz('sc')?'#fff6c8':'#fff');RC_ancla('sc',49,8);
  const lj=RC_salto('lv');hudHead(59,3+lj);txt('×'+Math.max(0,RC_ver('lv',lives)),74,5+lj,5,lives>0?'#fff':'#ff6b5b');RC_ancla('lv',67,7);
  const hk='hp'+P.slot,hv=RC_ver(hk,P.hp),hj=RC_salto(hk);
  let hx=24;for(let i=0;i<maxHp;i++){heart(hx,13+(i===hv-1?hj:0),hv>i&&!P.dead);hx+=6;}
  RC_ancla(hk,24+6*clamp(hv,0,maxHp-1)+3,16);
  const sk0='sh'+P.slot,sv=RC_ver(sk0,P.shield),sj=RC_salto(sk0);
  hx+=2;RC_ancla(sk0,hx+sv*4+2,16);for(let i=0;i<sv;i++){hudPix(HUD_ICONS.shield,hx,13+(i===sv-1?sj:0));hx+=4;}
  txt(kills+' BAJAS',24,20.5,4,'#ffb0a0','left',false);
  // --- arriba a la derecha: armas, granadas y avión (en el Grillo manda drawMechHUD) ---
  if(P.ride){drawMechHUD(P.ride);drawAirChip(W-6,44);}
  else{
    const w=P.weapon,ak='am'+P.slot+w,ammo=w==='pistol'?'∞':String(RC_ver(ak,P.weapons[w])),low=w!=='pistol'&&P.weapons[w]<WEAPONS[w].ammo*0.2;
    const aw=hudTW(ammo,8),aj=RC_salto('am'+P.slot);txt(ammo,W-6,4+RC_salto(ak),8,low&&(T>>3)%2?'#ff6b5b':low?'#ff9a8a':RC_luz(ak)?'#fff6c8':'#fff','right');
    const map=HUD_ICONS[w],iw=hudIW(map),ih=hudIH(map),fx=W-6-aw-4-iw-4;
    ctx.fillStyle=RC_luz('am'+P.slot)?'rgba(255,240,180,0.45)':'rgba(243,201,105,0.2)';ctx.fillRect(fx,3+aj,iw+4,11);ctx.strokeStyle='#f3c969';ctx.lineWidth=1;ctx.strokeRect(fx+0.5,3.5+aj,iw+3,10);
    hudPix(map,fx+2,8.5-ih/2+aj,1,w==='flame'?{b:(T>>2)%2?'#7ab8ff':'#ff9a3c'}:HUD_PAL);RC_ancla('am'+P.slot,fx+2+iw/2,8.5);
    // las otras armas que tenés: chiquitas y apagadas, en el orden en que las recorre S
    const others=WORDER.filter(k=>k!==w&&(k==='pistol'||P.weapons[k]>0));
    let x=fx-1;ctx.globalAlpha=0.6;
    // cada iconito es también el lugar adonde vuela la munición de esa arma (recolectar.js)
    for(let i=others.length-1;i>=0;i--){const m=HUD_ICONS[others[i]],ok='am'+P.slot+others[i],oj=RC_salto(ok);x-=hudIW(m,0.75)+2;
      if(RC_luz(ok)){ctx.globalAlpha=1;ctx.fillStyle='rgba(255,240,180,0.35)';ctx.fillRect(x-1,7.5-hudIH(m,0.75)/2+oj,hudIW(m,0.75)+2,hudIH(m,0.75)+2);}
      ctx.globalAlpha=RC_luz(ok)?1:0.6;hudPix(m,x,8.5-hudIH(m,0.75)/2+oj,0.75);RC_ancla(ok,x+hudIW(m,0.75)/2,8.5);}
    ctx.globalAlpha=1;
    // la tecla de "cambiar arma" (S, △, Y…), si entra sin pisar la barra del jefe (x 100–220)
    const sk=btn('swap',P.slot),skw=keycapW(sk);
    if(others.length&&(!bossShown()||x-2-skw>=222))keycap(sk,x-2-skw,5,'#aaa');
    // granadas y avión
    const ax=drawAirChip(W-6,17);
    const gk='gr'+P.slot,gv=RC_ver(gk,P.bombs),gs=String(gv),gw=hudTW(gs,5),gj=RC_salto(gk);
    txt(gs,ax-6,18+gj,5,gv?(RC_luz(gk)?'#fff6c8':'#fff'):'#ff6b5b','right');
    if(!gv)ctx.globalAlpha=0.45;hudPix(HUD_ICONS.grenade,ax-6-gw-9,17+gj);ctx.globalAlpha=1;RC_ancla(gk,ax-6-gw-5.5,20.5);
  }
  // --- arriba al centro: barra del jefe o progreso de la misión ---
  if(bossShown()){
    const x=100,w=120;ctx.fillStyle='#120c18';ctx.fillRect(x-1,5,w+2,6);ctx.fillStyle='#4a2730';ctx.fillRect(x,6,w,4);
    ctx.fillStyle=bossRef.hp<bossRef.max*0.5&&bossRef.state==='fight'?'#ff5a3c':'#f3a35c';ctx.fillRect(x,6,w*Math.max(0,bossRef.hp)/bossRef.max,4);
    txt(bossName(),160,12,5,'#fff','center');
  }else{
    const x=120,w=80,pr=clamp(leadP().x/(LEVEL_END-60),0,1);
    ctx.fillStyle='rgba(18,12,24,0.7)';ctx.fillRect(x-1,7,w+2,3);ctx.fillStyle='#f3c969';ctx.fillRect(x,8,w*pr,1);
    ctx.fillStyle='#ff3b30';ctx.fillRect(x+w-1,6,3,5);ctx.fillStyle='#fff';ctx.fillRect(x+w*pr-1,6.5,2,4);
    txt((vuelta>1?'V'+vuelta+' · M':'MISIÓN ')+(levelIdx+1),160,12,4,vuelta>1?'#ffe08a':'#aaa','center',false);
  }
  // con el cartel de jefe a la vista (dibujito.js), el aviso grande va debajo para no pisarse
  if(banner&&banner.t>0&&state!=='pause'){const by=typeof DIB_jefe!=='undefined'&&DIB_jefe&&DIB_jefe.t<170?82:50;ctx.globalAlpha=Math.min(1,banner.t/20,(banner.max-banner.t+1)/8);txt(banner.s,W/2,by,11,'#ffe08a','center');ctx.globalAlpha=1;}
  if(goT>0&&(T>>4)%2)txt('¡ADELANTE! ▶',W-8,PC_aviso?100:78,9,'#fff','right'); // con el aviso de tramo, más abajo
  if(toasts.length){const t=toasts[0],a=Math.min(1,t.t/15,(170-t.t+1)/10);ctx.globalAlpha=a;
    const y=27;ctx.fillStyle='rgba(18,12,24,0.78)';ctx.fillRect(W/2-80,y,160,22);ctx.fillStyle=t.col;ctx.fillRect(W/2-80,y,160,1);
    if(t.lvl)drawBadge(W/2-67,y+13,t.lvl,6);
    else if(t.ico==='air')hudPix(HUD_ICONS.plane,W/2-73,y+8);
    else{ctx.fillStyle=t.col;circle(W/2-67,y+11,4);}
    txt(t.title,W/2-56,y+3,6,t.col,'left',false);txt(t.sub,W/2-56,y+12,5,'#ddd','left',false);ctx.globalAlpha=1;}
  const flags=[muted?'SONIDO: NO (M)':null,!muted&&!mus.on?'MÚSICA: NO (N)':null].filter(Boolean);
  if(flags.length)txt(flags[0],6,HC-10,5,'#ccc','left');
  if(twoP())withP(players[1],drawHUD2);
  for(const f of ON_HUD)f();
}
// HUD compacto del jugador 2: abajo a la derecha, sobre el piso (los avisos salen abajo al centro).
// Fila 1: número, cabecita, corazones y escudo. Fila 2: arma y munición, granadas (o el Grillo).
function drawHUD2(){
  const p=P,x0=W-80,y0=HC-23,col=P_COL[1];
  ctx.fillStyle='rgba(18,12,24,0.72)';ctx.fillRect(x0,y0,78,21);ctx.fillStyle=col;ctx.fillRect(x0,y0,78,1);
  ctx.fillStyle=col;ctx.fillRect(x0+3,y0+3,6,7);txt('2',x0+6,y0+3.5,5,'#120c18','center',false);
  if(p.dead){ctx.globalAlpha=0.4;}hudHead(x0+11,y0+3);ctx.globalAlpha=1;
  const hk='hp'+p.slot,hv=RC_ver(hk,p.hp),hj=RC_salto(hk),sk='sh'+p.slot,sv=RC_ver(sk,p.shield),sj=RC_salto(sk);
  let hx=x0+28;for(let i=0;i<maxHp;i++){heart(hx,y0+4+(i===hv-1?hj:0),hv>i&&!p.dead);hx+=6;}
  RC_ancla(hk,x0+28+6*clamp(hv,0,maxHp-1)+3,y0+7);
  hx+=1;RC_ancla(sk,hx+sv*4+2,y0+7);for(let i=0;i<sv&&!p.dead;i++){hudPix(HUD_ICONS.shield,hx,y0+4+(i===sv-1?sj:0));hx+=4;}
  const y2=y0+13;
  if(p.dead){
    if(p.out)txt('SIN VIDAS',x0+4,y2,5,'#ff8a7a','left',false);
    else txt('YA VUELVE…',x0+4,y2,5,'#ddd','left',false);
    return;
  }
  if(p.ride){const m=p.ride,ar=RC_ver('ar'+p.slot,m.armor),gj=RC_salto('gri'+p.slot);
    const nm=mechNombre(m);txt(nm,x0+4,y2+gj,Math.min(5,5*24/hudTW(nm,5)),RC_luz('gri'+p.slot)?'#fff6c8':'#f3c969','left',false);RC_ancla('gri'+p.slot,x0+13,y2+3);
    ctx.fillStyle='#120c18';ctx.fillRect(x0+29,y2+0.5,46,5);ctx.fillStyle='#4a2730';ctx.fillRect(x0+30,y2+1.5,44,3);
    ctx.fillStyle=m.armor<=m.max*0.3?'#ff5a3c':'#e8c040';ctx.fillRect(x0+30,y2+1.5,44*Math.max(0,ar)/m.max,3);
    return;}
  const w=p.weapon,map=HUD_ICONS[w],ak='am'+p.slot+w,ammo=w==='pistol'?'∞':String(RC_ver(ak,p.weapons[w])),low=w!=='pistol'&&p.weapons[w]<WEAPONS[w].ammo*0.2;
  const aj=RC_salto('am'+p.slot);
  hudPix(map,x0+4,y2+3.5-hudIH(map)/2+aj,1,w==='flame'?{b:'#ff9a3c'}:HUD_PAL);RC_ancla('am'+p.slot,x0+4+hudIW(map)/2,y2+3.5);
  txt(ammo,x0+6+hudIW(map),y2+RC_salto(ak),5,low?'#ff9a8a':RC_luz(ak)?'#fff6c8':'#fff','left',false);
  const gk='gr'+p.slot,gv=RC_ver(gk,p.bombs),gs=String(gv),gw=hudTW(gs,5),gj=RC_salto(gk);
  txt(gs,W-5,y2+gj,5,gv?(RC_luz(gk)?'#fff6c8':'#fff'):'#ff6b5b','right',false);
  if(!gv)ctx.globalAlpha=0.45;hudPix(HUD_ICONS.grenade,W-5-gw-9,y2+gj);ctx.globalAlpha=1;RC_ancla(gk,W-5-gw-5.5,y2+3.5);
}
// avión: ícono + cómo se pide (tecla 6 en el teclado; con joystick o en la pantalla, un iconito de rueda: se elige ahí)
// + cuántos gratis (o lo que cuesta). Devuelve la x donde empieza, para poner algo a la izquierda.
function hudRuedita(x,y,col){ctx.strokeStyle=col;ctx.lineWidth=0.8;ctx.beginPath();ctx.arc(x+3.5,y+3.5,2.8,0,7);ctx.stroke();
  ctx.fillStyle=col;for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3;ctx.fillRect(x+3.5+Math.cos(a)*2.8-0.5,y+3.5+Math.sin(a)*2.8-0.5,1,1);}ctx.fillRect(x+3,y+3,1,1);}
function drawAirChip(right,y){
  if(typeof simpleDe==='function'&&simpleDe(P.slot))return right; // controles simples: sin avión
  const fv=RC_ver('fl',flares),fj=RC_salto('fl'),free=fv>0,s=free?'×'+fv:'−1♥',sw=hudTW(s,5),ready=airReady(),k=airKey();
  txt(s,right,y+1+fj,5,free?(RC_luz('fl')?'#fff6c8':'#9ad0ff'):'#aaa','right',false);
  const kx=right-sw-2-(k?keycapW(k):7);if(k)keycap(k,kx,y,free?'#9ad0ff':'#aaa');else hudRuedita(kx,y,free?'#9ad0ff':'#aaa');
  const px=kx-14;ctx.globalAlpha=air?((T>>3)%2?1:0.4):ready?1:0.45;hudPix(HUD_ICONS.plane,px,y+fj);ctx.globalAlpha=1;RC_ancla('fl',px+6,y+3);
  return px;
}
function dim(a){ctx.fillStyle=`rgba(12,8,18,${a})`;cubrir();}
const CONTROLS_L_KB=[['← →','mover'],['↑','apuntar arriba sin frenar'],['↓','agacharse · aire: abajo'],['Z','disparar'],['X · ESPACIO','saltar · Chatarra: volar'],['C','granada / cañón'],['↓ + X','bajar de la Chatarra']];
const CONTROLS_R_KB=[['S · TAB','cambiar arma'],['mantenelo','rueda de armas y avión'],['1 … 6','arma directa · 6 avión'],['ESC/⌫ · P','pausa · volver'],['Q','salir (en pausa)'],['M · N','sonido · música'],['F','pantalla completa']];
// la misma tabla con los botones del joystick que se tocó último (btn en input.js)
function ctlRows(){const b=a=>btn(a);
  return[[['← →','mover'],['↑','apuntar arriba sin frenar'],['↓','agacharse · aire: abajo'],[b('shoot')+' '+b('r1')+' '+b('r2'),'disparar'],[b('jump'),'saltar · Chatarra: volar'],[b('bomb')+' '+b('l2'),'granada / cañón'],['↓ + '+b('jump'),'bajar de la Chatarra']],
    [[b('swap')+' tocar','cambiar arma'],[b('swap')+' mantener','rueda de armas y avión'],[b('air'),'igual que '+b('swap')],[b('opt')+' · '+b('back'),'pausa · volver'],[b('quit')+' dos veces','salir (en pausa)'],['teclado M · N','sonido · música'],['teclado F','pantalla completa']]];}
const CONTROLS_L_TOUCH=[['palanca','mover · apuntar'],['palanca ↑','apuntar arriba sin frenar'],['palanca ↓','agacharse · aire: abajo'],['□','disparar (mantener)'],['✕','saltar · Chatarra: volar'],['○','granada / cañón']];
const CONTROLS_R_TOUCH=[['△ tocar','cambiar arma'],['△ mantener','rueda de armas y avión'],['↓ + ✕','bajar de la Chatarra'],['II','pausa']];
// franja libre de los controles en pantalla (publicar/web/tactil.js): {x0,x1,y0} en coordenadas del juego.
// Debajo de y0 la palanca ocupa x<x0 y el rombo x>x1; arriba de y0 está todo libre. null si no hay controles.
const tactilLibre=()=>onTouch()&&window.OXIDO_TACTIL_LIBRE||null;
// CONTROLES SIMPLES (simple.js): 1 jugador con flechas, Z y X; y de a 2 con un teclado, una columna cada uno
const CONTROLS_L_S1=[['← →','mover'],['↑','saltar · mantener: volar'],['↓','agacharse · ×2: bajar'],['Z','disparar (apunta solo)'],['X','granada']];
const CONTROLS_R_S1=[['ESC/⌫ · P','pausa · volver'],['Q','salir (en pausa)'],['M · N','sonido · música'],['F','pantalla completa']];
function drawSimples2(y,nota){
  const J=[[P_COL[0],'JUGADOR 1',[['A D','mover'],['W','saltar'],['S','agacharse · ×2 bajar'],['F','disparar'],['G','granada']]],
    [P_COL[1],'JUGADOR 2',[['← →','mover'],['↑','saltar'],['↓','agacharse · ×2 bajar'],[KB_NOMBRE.Period,'disparar'],[KB_NOMBRE.Comma,'granada']]]];
  ctx.fillStyle='rgba(18,12,24,0.8)';ctx.fillRect(30,y,260,58);
  J.forEach(([col,t,rows],i)=>{const x=34+i*130;ctx.fillStyle=col;ctx.fillRect(x,y+3,122,1);txt(t,x+61,y+5,6,col,'center',false);
    rows.forEach(([k,v],j)=>{txt(k,x+28,y+15+j*8,6,col,'right',false);txt(v,x+33,y+15.5+j*8,5,'#ddd','left',false);});});
  txt('Apuntan solos · ESC/⌫ o P: pausa',W/2,y+60,5,'#aaa','center',false);
  if(nota)txt('Algunos teclados no registran muchas teclas a la vez: si una no anda, soltá las otras.',W/2,y+68,4,'#8a7f92','center',false);
}
function drawControls(y){
  if(!onTouch()&&kb2On()){drawSimples2(y);return;}
  const s1=!onTouch()&&!onPad()&&controlesSimples;
  const [colL,colR]=onTouch()?[CONTROLS_L_TOUCH,CONTROLS_R_TOUCH]:onPad()?ctlRows():s1?[CONTROLS_L_S1,CONTROLS_R_S1]:[CONTROLS_L_KB,CONTROLS_R_KB];
  const lb=tactilLibre();
  if(!lb||y+60<=lb.y0){
    ctx.fillStyle='rgba(18,12,24,0.75)';ctx.fillRect(30,y,260,60);
    colL.forEach(([k,v],i)=>{txt(k,74,y+4+i*7.8,5,'#ffe08a','right',false);txt(v,79,y+4+i*7.8,5,'#ddd','left',false);});
    colR.forEach(([k,v],i)=>{txt(k,196,y+4+i*7.8,5,'#ffe08a','right',false);txt(v,201,y+4+i*7.8,5,'#ddd','left',false);});
    return;}
  // con controles en pantalla que tapan los costados: las dos columnas se juntan (y achican si hace falta) entre x0+4 y x1-4
  const x0=Math.max(30,lb.x0+4),x1=Math.min(290,lb.x1-4);
  const mk=c=>Math.max(...c.map(r=>hudTW(r[0],5))),mv=c=>Math.max(...c.map(r=>hudTW(r[1],5)));
  const wL=mk(colL)+4+mv(colL),wR=mk(colR)+4+mv(colR),gap=10,f=Math.min(1,(x1-x0-8)/(wL+gap+wR)),sz=5*f,dy=7.8*Math.max(0.85,f);
  const rows=Math.max(colL.length,colR.length),h=rows*dy+6;
  ctx.fillStyle='rgba(18,12,24,0.75)';ctx.fillRect(x0,y,x1-x0,h);
  const pad=(x1-x0-(wL+gap+wR)*f)/2,kL=x0+pad+mk(colL)*f,kR=x0+pad+(wL+gap)*f+mk(colR)*f;
  colL.forEach(([k,v],i)=>{txt(k,kL,y+4+i*dy,sz,'#ffe08a','right',false);txt(v,kL+4*f,y+4+i*dy,sz,'#ddd','left',false);});
  colR.forEach(([k,v],i)=>{txt(k,kR,y+4+i*dy,sz,'#ffe08a','right',false);txt(v,kR+4*f,y+4+i*dy,sz,'#ddd','left',false);});
}
function drawTitle(){
  dim(0.45);
  const g=ctx.createLinearGradient(0,24,0,62);g.addColorStop(0,'#ffe08a');g.addColorStop(1,'#e0582c');
  ctx.font='bold 38px ui-monospace,Menlo,Consolas,monospace';ctx.textAlign='center';ctx.textBaseline='top';
  ctx.lineJoin='round';ctx.lineWidth=5;ctx.strokeStyle='#120c18';ctx.strokeText('ÓXIDO',W/2,22);ctx.fillStyle=g;ctx.fillText('ÓXIDO',W/2,22);
  // menú vertical corto: ↑ ↓ elegir · ENTER o ✕ entrar
  const ops=tituloOps(),st=11,y0=78;
  ops.forEach((o,i)=>{const y=y0+i*st,on=i===tituloSel;
    if(on){const w=hudTW(o,8)+30;ctx.fillStyle='rgba(243,201,105,0.18)';ctx.fillRect(W/2-w/2,y-1.5,w,st-0.5);
      txt('▶',W/2-w/2+5+((T>>4)%2),y,8,'#ffe08a','left',false);}
    txt(o,W/2,y,8,on?'#ffe08a':'#aaa','center');});
  // una sola línea chica abajo, con los botones del control que se usó último (en táctil, entre la palanca y el rombo)
  const pie=(onTouch()?'palanca ↑ ↓':'↑ ↓')+' · '+btn('ok')+': ELEGIR';
  const lb=tactilLibre(),pw=lb&&H-12>=lb.y0?Math.min(290,lb.x1-4)-Math.max(30,lb.x0+4):999;
  txt(pie,lb&&pw<999?(Math.max(30,lb.x0+4)+Math.min(290,lb.x1-4))/2:W/2,H-12,Math.min(5,5*pw/hudTW(pie,5)),'#aaa','center');
  const rec=tituloRecord();if(rec)txt('RÉCORD '+String(rec).padStart(7,'0'),W-6,4,5,'#f3c969','right');
}
// OPCIONES: tamaño, música, sonido y controles (partida.js)
function drawOpciones(){
  dim(0.6);
  txt('OPCIONES',W/2,20,13,'#ffe08a','center');
  const f=opcFilas(),y0=52,st=14;
  f.forEach(([n,v],i)=>{const y=y0+i*st,on=i===opcSel;
    ctx.fillStyle=on?'rgba(243,201,105,0.16)':'rgba(18,12,24,0.6)';ctx.fillRect(70,y-2,180,12);
    if(on){ctx.strokeStyle='#f3c969';ctx.lineWidth=1;ctx.strokeRect(70.5,y-1.5,179,11);}
    if(v===null){txt(n,W/2,y,7,on?'#ffe08a':'#aaa','center');return;}
    txt(n,78,y+0.5,6,on?'#ffe08a':'#aaa','left');
    txt(v,212,y,7,'#fff','center');
    if(on){const b=(T>>4)%2?1:0;txt('◀',212-hudTW(v,7)/2-4-b,y,7,'#ffe08a','right',false);txt('▶',212+hudTW(v,7)/2+4+b,y,7,'#ffe08a','left',false);}});
  const pie=(onTouch()?'palanca ':'')+'↑ ↓ elegir · ← → o '+btn('ok')+' cambiar · '+btn('back')+' volver';
  const lb=tactilLibre(),pw=lb&&H-12>=lb.y0?Math.min(290,lb.x1-4)-Math.max(30,lb.x0+4):999;
  txt(pie,lb&&pw<999?(Math.max(30,lb.x0+4)+Math.min(290,lb.x1-4))/2:W/2,H-12,Math.min(5,5*pw/hudTW(pie,5)),'#aaa','center');
}
// ================== elegir personaje, misión y dificultad ==================
const DIFF_COL=['#7dff9a','#ffe08a','#ff6b5b'];
let selRow=0; // 0 = personaje · 3 = color · 1 = misión · 2 = dificultad (en pantalla van en ese orden)
const selRows=()=>[0,3,1,2];
const selLocked=i=>i>unlocked;
// candadito al lado del nombre de una misión bloqueada
function drawLock(x,y,col){ctx.fillStyle=col;ctx.fillRect(x,y+3,6,5);ctx.fillRect(x+1,y,1,3);ctx.fillRect(x+4,y,1,3);ctx.fillRect(x+2,y,2,1);ctx.fillStyle='#120c18';ctx.fillRect(x+2.5,y+4.5,1,2);}
let selNo=0; // temblor al querer entrar a una misión bloqueada
// parte un texto en renglones que entren en un ancho
function wrapTxt(s,size,maxW){const out=[];let line='';
  for(const w of s.split(' ')){const t=line?line+' '+w:w;if(line&&hudTW(t,size)>maxW){out.push(line);line=w;}else line=t;}
  if(line)out.push(line);return out;}
function selArrows(cx,y,half,size,canL,canR,on){
  if(!on)return;const b=(T>>4)%2?1:0;
  txt('◀',cx-half-b,y,size,canL?'#ffe08a':'#5a4a60','right',false);txt('▶',cx+half+b,y,size,canR?'#ffe08a':'#5a4a60','left',false);}
function selRowBox(y,h,on){
  ctx.fillStyle=on?'rgba(243,201,105,0.16)':'rgba(18,12,24,0.6)';ctx.fillRect(40,y,240,h);
  if(on){ctx.strokeStyle='#f3c969';ctx.lineWidth=1;ctx.strokeRect(40.5,y+0.5,239,h-1);}}
function drawSelect(){
  dim(0.55);
  const two=p2Pad>=0;
  txt(two?'ELIJAN SUS PERSONAJES':'ELEGÍ TU PERSONAJE',W/2,4,9,'#ffe08a','center');
  const cw=92,gap=8,x0=(W-(cw*3+gap*2))/2,y=17,ch=96,rowOn=selRow===0;
  CHARS.forEach((c,i)=>{
    const x=x0+i*(cw+gap),sel=i===charIdx;
    ctx.fillStyle=sel?'rgba(243,201,105,0.18)':'rgba(18,12,24,0.75)';ctx.fillRect(x,y,cw,ch);
    ctx.strokeStyle=sel?(rowOn?'#f3c969':'#a08850'):'#3a2a40';ctx.lineWidth=sel?1.5:1;ctx.strokeRect(x+0.5,y+0.5,cw-1,ch-1);
    const k=sel&&((T>>3)&1)?'run1':sel?'run2':'idle';
    if(!(typeof ES_tarjeta==='function'&&ES_tarjeta(i,x+cw/2-21,y+2))){const im=charSet(i,p1Col[i])[k][0];ctx.drawImage(im,q(x+cw/2-21),q(y+2+(18-im.height)*3),42,im.height*3);} // espera.js: animación de espera
    txt(c.name,x+cw/2,y+55,8,sel?'#ffe08a':'#fff','center');
    txt(c.desc,x+cw/2,y+64,5,'#ddd','center',false);
    const st=[['VIDA',c.hp/4],['VELOC.',c.speed/1.75],['SALTO',c.jump/6.6]];
    st.forEach(([n,v],j)=>{const yy=y+71+j*5;txt(n,x+6,yy,4,'#aaa','left',false);ctx.fillStyle='#2a1f30';ctx.fillRect(x+34,yy+1,cw-42,3);ctx.fillStyle=sel?'#f3c969':'#998';ctx.fillRect(x+34,yy+1,(cw-42)*v,3);});
    wrapTxt(c.perk,4,cw-8).slice(0,2).forEach((l,j)=>txt(l,x+cw/2,y+86+j*5,4,sel?'#ffe08a':'#998','center',false));
    // 2 jugadores: el elegido por el jugador 2 tiene marco celeste; cada tarjeta elegida lleva su número
    if(two&&i===p2Ci){ctx.strokeStyle=P_COL[1];ctx.lineWidth=1.5;ctx.strokeRect(x+2,y+2,cw-4,ch-4);
      if(i===charIdx){const im=charSet(i,p2Col[i]).idle[0];ctx.drawImage(im,q(x+cw-20),q(y+30+(18-im.height)*4/3),14,im.height*4/3);}}
    if(two){if(sel)selTag(x+3,y+3,1);if(i===p2Ci)selTag(x+cw-11,y+3,2);}
  });
  if(rowOn){const b=(T>>4)%2?1:0;txt('◀',x0-3-b,y+ch/2-5,8,'#ffe08a','right');txt('▶',x0+cw*3+gap*2+3+b,y+ch/2-5,8,'#ffe08a','left');}
  // color del personaje del jugador 1 (el del jugador 2, si repite personaje, va marcado con una rayita celeste)
  let ry=y+ch+3;
  {const on=selRow===3,cx=W/2+16,hw=(N_COL*10-4)/2,xc=cx-hw;selRowBox(ry,9,on);
    txt('COLOR',46,ry+2,5,on?'#ffe08a':'#aaa','left',false);
    for(let k=0;k<N_COL;k++){const x=xc+k*10;ctx.fillStyle='#120c18';ctx.fillRect(x-1,ry+1.5,8,6.5);ctx.fillStyle=colMuestra(charIdx,k);ctx.fillRect(x,ry+2,6,5.5);
      if(k===p1Col[charIdx]){ctx.strokeStyle=on?'#fff':'#c8b8a0';ctx.lineWidth=1;ctx.strokeRect(x-1.5,ry+1,9,7.5);}
      if(two&&p2Ci===charIdx&&p2Col[p2Ci]===k){ctx.fillStyle=P_COL[1];ctx.fillRect(x,ry+8,6,1);}}
    selArrows(cx,ry+1.5,hw+4,6,true,true,on);
    ry+=11;}
  // misión
  {const on=selRow===1,lk=selLocked(selLevel),sh=selNo>0?((selNo>>1)%2?2:-2):0;selRowBox(ry,10,on);
    txt('MISIÓN',46,ry+2.5,5,on?'#ffe08a':'#aaa','left',false);
    const s=LEVELS[selLevel].short,cx=W/2+16+sh,hw=hudTW(s,6)/2;
    txt(s,cx,ry+2,6,lk?'#6a5f72':'#fff','center');
    if(lk)drawLock(cx+hw+3,ry+1,selNo>0?'#ff6b5b':'#8a7f92');
    selArrows(W/2+16,ry+2,hw+(lk?12:4),6,selLevel>0,selLevel<LEVELS.length-1,on);
    txt((selLevel+1)+'/'+LEVELS.length,W-46,ry+2.5,4,'#8a7f92','right',false);
    ry+=12;
  }
  // dificultad
  {const on=selRow===2,d=DIFF();selRowBox(ry,16,on);
    txt('DIFICULTAD',46,ry+2.5,5,on?'#ffe08a':'#aaa','left',false);
    txt(d.name,W/2+16,ry+2,6,DIFF_COL[difficulty],'center');
    selArrows(W/2+16,ry+2,hudTW(d.name,6)/2+4,6,difficulty>0,difficulty<DIFFS.length-1,on);
    txt(d.desc,W/2+16,ry+9.5,4,'#ddd','center',false);
    ry+=18;}
  // jugador 1: botones de su último control (con su joystick, ✕ u OPTIONS juegan; ✕ en otro joystick suma al jugador 2)
  if(selLocked(selLevel))txt('BLOQUEADA · GANÁ LA MISIÓN '+selLevel+' PARA JUGARLA',W/2,ry+1,5,selNo>0?'#ff6b5b':'#c8b8a0','center');
  else txt(btn('up',0)+' '+btn('down',0)+' ELEGIR FILA · '+btn('left',0)+' '+btn('right',0)+' CAMBIAR · '+btn(onPad(0)?'jump':'start',0)+': JUGAR',W/2,ry+1,5,'#fff','center');
  txt(btn('back',0)+': volver',W/2,ry+9,4,'#aaa','center',false);
  // jugador 2: se suma con saltar (✕, A o B) en un joystick libre; sus botones salen de su joystick
  if(two)txt('JUGADOR 2: ← → ELEGIR · ↑ ↓ COLOR · '+btn('bomb',1)+' SALIR',W/2,ry+16,5,P_COL[1],'center');
  else if(padFree()&&(T>>5)%2===0)txt('JUGADOR 2: APRETÁ '+btn('jump','free')+' PARA SUMARTE',W/2,ry+16,5,P_COL[1],'center');
  else if(!padFree()&&!onTouch()&&(T>>5)%2===0)txt('JUGADOR 2 CON EL MISMO TECLADO: APRETÁ '+KB_NOMBRE.Period,W/2,ry+16,5,P_COL[1],'center');
  // recién entró el jugador 2 por teclado: las teclas de los dos (3 s o hasta que alguien apriete)
  if(kb2On()&&kb2Tarjeta>0){dim(0.9);txt('DE A 2 CON UN TECLADO',W/2,34,10,'#ffe08a','center');txt('controles simples',W/2,47,5,'#aaa','center',false);drawSimples2(58,true);
    ctx.fillStyle='#f3c969';ctx.fillRect(30,136,260*kb2Tarjeta/180,1);}
}
// número de jugador sobre la tarjeta elegida
function selTag(x,y,n){ctx.fillStyle='#120c18';ctx.fillRect(x-0.5,y-0.5,9,9);ctx.fillStyle=P_COL[n-1];ctx.fillRect(x,y,8,8);txt(String(n),x+4,y+1.2,6,'#120c18','center',false);}
// entrada de la pantalla de elegir personaje (la llama update() en juego.js)
function updSelect(){
  if(selT===1){selRow=0;p2Join=-1;}
  // jugador 2: entra con ✕ en un joystick libre, elige con ← →, sale con ○ o Create
  if(p2Join>=0){if(p2Pad<0){p2Pad=p2Join;p2Ci=charIdx===2?0:2;SFX.pick();}p2Join=-1;}
  else if(p2Pad>=0){
    if(kb2Tarjeta>0){kb2Tarjeta--;if(kb2Tarjeta<170&&(Object.values(pressed).some(Boolean)||Object.values(pressed2).some(Boolean))){kb2Tarjeta=0;clearPressed();}return;}
    const d2=pressed2.left?-1:pressed2.right?1:0;
    if(d2){p2Ci=(p2Ci+CHARS.length+d2)%CHARS.length;colFix(charIdx,p2Ci);SFX.swap();}
    // ↑ ↓: su color (salteando el del jugador 1 si repiten personaje)
    const c2=pressed2.up?-1:pressed2.down?1:0;
    if(c2){let c=p2Col[p2Ci];do{c=(c+N_COL+c2)%N_COL;}while(p2Ci===charIdx&&p1Col[charIdx]===c);p2Col[p2Ci]=c;colGuardar();SFX.swap();}
    if(pressed2.bomb||pressed2.back){p2Pad=-1;SFX.hit();}
  }
  const rows=selRows();let ri=rows.indexOf(selRow);if(ri<0){ri=0;selRow=rows[0];}
  if(pressed.up&&ri>0){selRow=rows[ri-1];SFX.swap();}
  else if(pressed.down&&ri<rows.length-1){selRow=rows[ri+1];SFX.swap();}
  const dx=pressed.left?-1:pressed.right?1:0;
  if(dx){
    if(selRow===0){charIdx=(charIdx+CHARS.length+dx)%CHARS.length;if(p2Pad>=0)colFix(charIdx,p2Ci);SFX.swap();}
    else if(selRow===3){let c=p1Col[charIdx];do{c=(c+N_COL+dx)%N_COL;}while(p2Pad>=0&&p2Ci===charIdx&&p2Col[p2Ci]===c);p1Col[charIdx]=c;colGuardar();SFX.swap();}
    else if(selRow===1){const n=clamp(selLevel+dx,0,LEVELS.length-1);if(n!==selLevel){selLevel=n;selNo=0;SFX.swap();}}
    else{const n=clamp(difficulty+dx,0,DIFFS.length-1);if(n!==difficulty){difficulty=n;store.set('oxido-dificultad',difficulty);SFX.swap();}}
  }
  if(selNo>0)selNo--;
  if(selT>8&&(pressed.start||pressed.shoot||pressed.jump)){
    if(selLocked(selLevel)){selNo=16;selRow=1;SFX.hit();}
    else{SFX.pick();startLevel(selLevel,false);}}
  else if(pressed.back){state='title';}
}
// ================== fin de juego y misión cumplida ==================
function drawEndBadge(y){
  const s=medals?'MEDALLA DE '+MEDALS[medals-1].name:'SIN MEDALLA TODAVÍA',sw=hudTW(s,5),x=W/2-(sw+16)/2;
  drawBadge(x+6,y+4,medals,5);txt(s,x+16,y+1.5,5,medals?MEDALS[medals-1].col:'#aaa','left');
}
function drawWho(y){const s=(players.length>1?players.map(p=>CHARS[p.ci].name).join(' + '):CH().name)+' · ',w1=hudTW(s,5),w2=hudTW(DIFF().name,5),x=W/2-(w1+w2)/2;
  txt(s,x,y,5,'#ddd','left');txt(DIFF().name,x+w1,y,5,DIFF_COL[difficulty],'left');}
// tabla de dos columnas de "etiqueta  valor" (fin del juego)
function endPairs(rows,y,dy){rows.forEach(([k,v,col],i)=>{const c=i%2,r=i>>1,x0=c?170:28,x1=c?292:150;
  txt(k,x0,y+r*dy,5,'#aaa','left',false);txt(v,x1,y+r*dy,5,col||'#fff','right',false);});}
const KILL_NAMES=[['soldier','soldados'],['grenadier','granaderos'],['shield','escuderos'],['drone','drones'],['turret','torretas'],['mudling','criaturas']];
function drawEnd(){
  dim(state==="over"?0.74:0.66);
  const pad7=n=>String(n).padStart(7,'0'),pa=partida;
  if(state==='over'){
    txt('FIN DEL JUEGO',W/2,5,14,'#ff6b5b','center');
    drawWho(22);
    const tr=PC_mis?(PC_mis.cur?PC_mis.cur.n:PC_mis.tramos.length):1;
    txt('LLEGASTE A: VUELTA '+vuelta+' · MISIÓN '+(levelIdx+1)+' · TRAMO '+tr,W/2,31,6,'#ffe08a','center');
    const disp=pa?tirosDisp-pa.d0:0,peg=pa?tirosPeg-pa.p0:0,secs=pa?Math.round(pa.frames/60):0;
    endPairs([['PUNTOS',pad7(score),'#ffe08a'],['TIEMPO',PC_mmss(secs)],
      ['BAJAS',String(kills),'#ffb0a0'],['MISIONES GANADAS',String(pa?pa.wins:0)],
      ['RESCATES',String(pa?pa.resc:rescued),'#9fe8a0'],['PUNTERÍA',disp?Math.round(peg*100/disp)+'%':'—'],
      ['JEFES VENCIDOS',String(pa?pa.bosses:0)],['CONTINUACIONES',(pa?pa.cont:0)+' de '+PC_MAX_CONT]],42,8.5);
    drawEndBadge(80);
    txt(newRecord?'¡NUEVO RÉCORD!':'RÉCORD '+pad7(record),W/2,92,6,newRecord?'#7dff9a':'#f3c969','center');
    const left=contQuedan(),ready=overT>45;
    ctx.fillStyle='rgba(18,12,24,0.8)';ctx.fillRect(36,106,248,46);ctx.fillStyle=left>0?'#7dff9a':'#ff6b5b';ctx.fillRect(36,106,248,1);
    if(left>0){
      txt('¿CONTINUAR?',W/2,110,8,'#7dff9a','center');
      txt('Volvés al principio de la MISIÓN '+(levelIdx+1)+' con '+DIFF().lives+(DIFF().lives===1?' vida':' vidas'),W/2,121,5,'#ddd','center',false);
      txt('y la mitad de los puntos ('+pad7(Math.floor(score/2))+') · '+(left===1?'queda 1':'quedan '+left),W/2,128,5,'#ddd','center',false);
      txt(btn('ok')+': continuar  ·  '+(onTouch()?'mantener ':'')+btn('back')+': terminar',W/2,139,7,ready?'#fff':'#5a4a60','center');
    }else{
      txt('NO QUEDAN CONTINUACIONES',W/2,114,7,'#ff8a7a','center');
      txt(btn('ok')+' o '+(onTouch()?'mantener ':'')+btn('back')+': terminar',W/2,134,7,ready?'#fff':'#5a4a60','center');
    }
    return;
  }
  // misión cumplida: desglose por tramo y bonus de la misión
  const mis=(vuelta>1?'V'+vuelta+' · ':'')+'MISIÓN '+(levelIdx+1);
  txt(lastLevel()?'¡VUELTA '+vuelta+' COMPLETA!':'¡'+mis+' CUMPLIDA!',W/2,5,12,'#ffe08a','center');
  drawWho(20);
  const tr=PC_mis?PC_mis.tramos:[],cols=[['TRAMO',22,'left'],['BAJAS',124,'right'],['RESC.',152,'right'],['TIEMPO',184,'right'],['PUNT.',212,'right'],['RACHA',240,'right'],['SIN DAÑO',266,'center'],['BONUS',300,'right']];
  ctx.fillStyle='rgba(18,12,24,0.7)';ctx.fillRect(16,29,288,9+tr.length*8.5);
  cols.forEach(([k,x,al])=>txt(k,x,31,4,'#aaa',al,false));
  tr.forEach((t,i)=>{const y=39+i*8.5,v=[t.n+' · '+t.kind,String(t.kills),String(t.resc+t.cat),PC_mmss(t.secs),t.pct===null?'—':t.pct+'%',String(t.best),t.hurt?'—':'SÍ','+'+t.bonus];
    cols.forEach(([k,x,al],j)=>txt(v[j],x,y,5,j===6&&!t.hurt?'#7dff9a':j===7&&t.bonus?'#7dff9a':j===0?'#ffe08a':'#fff',al,false));});
  let y=41+tr.length*8.5;
  ctx.fillStyle='#3a2a40';ctx.fillRect(22,y-1,278,0.6);
  const st=stats;
  endPairs([['Bonus tramos','+'+st.tram,'#7dff9a'],['Bonus tiempo ('+PC_mmss(st.secs)+')','+'+st.tb],
    ['Rescates y amigos','+'+st.rb,'#9fe8a0'],['Vidas y salud','+'+st.lb],
    ['Medalla ('+(medals?MEDALS[medals-1].name:'ninguna')+')','+'+st.mb]],y+2,7.5);
  y+=25;
  const by={};for(const t of tr)for(const k in t.by)by[k]=(by[k]||0)+t.by[k];
  const nk=tr.reduce((s,t)=>s+t.kills,0),parts2=KILL_NAMES.filter(([k])=>by[k]).map(([k,n])=>by[k]+' '+n);
  const jefes=tr.reduce((s,t)=>s+t.bosses,0),others=Object.keys(by).filter(k=>!KILL_NAMES.some(([q])=>q===k)).reduce((s,k)=>s+by[k],0)-jefes;
  if(jefes)parts2.push(jefes+(jefes===1?' jefe':' jefes'));if(others>0)parts2.push(others+' otros');
  txt('BAJAS EN LA MISIÓN: '+nk+(parts2.length?' · '+parts2.join(' · '):''),W/2,y,4,'#ffb0a0','center',false);
  y+=8;
  txt('MISIÓN +'+Math.max(0,score-(PC_mis?PC_mis.score0:0)),22,y+1,6,'#ddd','left');
  txt('TOTAL '+pad7(score),300,y,8,'#ffe08a','right');
  drawEndBadge(y+13);
  txt(newRecord?'¡NUEVO RÉCORD!':'RÉCORD '+pad7(record),W/2,y+25,6,newRecord?'#7dff9a':'#f3c969','center');
  if(overT>45)txt(btn('ok')+': seguir a la '+(lastLevel()?'VUELTA '+(vuelta+1):'MISIÓN '+(levelIdx+2))+'  ·  '+(onTouch()?'mantener ':'')+btn('back')+': terminar',W/2,H-14,6,'#fff','center');
}
