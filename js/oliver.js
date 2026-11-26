'use strict';
// Óxido · OLIVER, el gato de la familia: apertura y rescate (Guion, notas/guion/apertura.md). Prefijos AP_ y OL_.
// Va después de arte-oliver.js (dibujos de Personajes, OLI_) y de historia.js, antes de juego.js.
// 1 · APERTURA (AP_): escena de 10 s al empezar una partida nueva desde la misión 1 (hud.js llama AP_empezar; juego.js
//     espera con AP_paso). Seis planos, un solo texto (TX.historia.apertura). Cualquier tecla, clic o toque la saltea.
// 2 · RESCATE (OL_): en la misión 1 de la primera vuelta la jaula de OLIVER cuelga alta en la arena de DON BULÓN (los
//     tiros no le hacen nada); maúlla cada tanto. Al caer el villano baja y se abre sola, y OLIVER se suma como el gato
//     de siempre (gatito.js). Cuando llega al lado de alguien, le ponen el collar rojo (gesto de 1 s).
// 3 · PLACA: desde la misión 2, OLIVER sentado al lado del engranaje; mueve la cola cuando llega el diente.
// El mimo (acariciarlo) está en gatito.js y no da vida. De M2 en adelante OLIVER arranca con vos (gatito.js, ON_START).

// ================== 2 · la jaula en la arena de DON BULÓN ==================
const OL={on:false,x:0,yG:0,largo:60,st:null,t:0,collar:true,gesto:null};
ON_START.push(carry=>{
  OL.gesto=null;OL.st=null;OL.t=0;
  OL.on=levelIdx===0&&(carry?vuelta:1)===1&&!(typeof gato!=='undefined'&&gato)&&!(typeof IN!=='undefined'&&IN.activa);
  OL.collar=!OL.on;if(typeof OLI_collarPuesto==='function')OLI_collarPuesto(OL.collar); // sin collar hasta que se lo devuelven
  if(!OL.on)return;const a=(L.arenas||[]).find(q=>q.boss);if(!a){OL.on=false;return;}
  OL.x=a.at+W-64;OL.yG=GROUND-176;OL.largo=60;OL.st='cuelga';
});
const OL_jaulaY=()=>OL.yG+OL.largo; // el techo de la jaula
ON_STEP.push(()=>{
  if(state!=='play')return;
  // el gesto del collar: OLIVER llegó al lado de alguien
  const g=typeof gato!=='undefined'?gato:null;
  if(OL.gesto){const G=OL.gesto;G.t++;G.p.sinArma=G.t<60&&!G.p.dead&&!(G.p.fireCd>0); /* sin el arma dibujada mientras dura (si dispara, vuelve) */if(g){g.oculto=true;const o=G.p; // OLIVER va pegado al personaje mientras dura (aunque camine)
      G.gx=o.x+4+G.lado*11;G.gy=o.y+o.h;g.x=G.gx-g.w/2;g.y=G.gy-g.h;g.vx=0;g.vy=0;}
    if(G.t===30){OL.collar=true;try{tone('sine',880,1320,0.12,0.04);}catch(e){}}
    if(G.t>=60||!g||G.p.dead){if(typeof OLI_collarPuesto==='function')OLI_collarPuesto(true);OL.collar=true;if(g)g.oculto=false;G.p.sinArma=false;OL.gesto=null;}}
  else if(!OL.collar&&g&&g.st==='follow'&&g.onGround&&typeof OLI_gesto==='function'){
    const p=players.find(q=>!q.dead&&!q.ride&&q.onGround&&Math.abs(q.x+4-(g.x+g.w/2))<30);
    if(p)OL.gesto={t:0,p,lado:g.x+g.w/2<p.x+4?-1:1,gx:g.x+g.w/2,gy:g.y+g.h};}
  if(!OL.on||!OL.st)return;OL.t++;
  const pelea=lock&&lock.a.boss&&bossRef&&!bossRef.gone&&bossRef.hp>0;
  if(OL.st==='cuelga'){
    if(pelea&&OL.t%420===200){try{CAT_meow();}catch(e){}parts.push({k:'txt',g:'habla',s:'¡MIAU!',x:OL.x,y:OL_jaulaY()-3,life:50,maxl:50});}
    if(typeof HIS_villano!=='undefined'&&HIS_villano){OL.st='baja';OL.t=0;} // cayó DON BULÓN
  }else if(OL.st==='baja'){
    if(OL.t>40)OL.largo+=1.4; // un momento después de la caída, baja
    if(OL_jaulaY()+OLI_JAULA.h>=GROUND-1){OL.largo=GROUND-1-OLI_JAULA.h-OL.yG;OL.st='abierta';OL.t=0;
      try{SFX.pick();CAT_meow();}catch(e){}addScore(300,OL.x,GROUND-30);emit('rescue',{kind:'cat'});
      const c=CAT_mk(OL.x-6,GROUND-CAT_H-3);c.st='free';c.vy=-3.6;c.vx=-0.7;c.onGround=false;c.heartT=240;gato=c;
      let bd=1e9;players.forEach((p,i)=>{if(p.dead)return;const d=Math.abs(p.x-OL.x);if(d<bd){bd=d;c.owner=i;}});}
  }else if(OL.st==='abierta'&&OL.t>150)OL.st=null;
});
ON_DRAW.push(()=>{
  if(OL.on&&OL.st&&typeof OLI_jaula==='function'&&OL.x>camX-30&&OL.x<camX+VW+30){
    if(OL.st==='abierta')ctx.globalAlpha=Math.max(0,Math.min(1,(150-OL.t)/30));
    try{OLI_jaula(OL.x,OL.yG,{largo:Math.round(OL.largo),estado:OL.st==='abierta'?'abierta':'cerrada',t:T});}catch(e){}
    ctx.globalAlpha=1;}
  if(OL.gesto){const G=OL.gesto;try{OLI_gesto(G.p,G.gx,G.gy,{tipo:'collar',t:G.t,agachado:false});}catch(e){}}
});

// ================== 3 · OLIVER en la placa de misión cumplida (desde la misión 2) ==================
ON_HUD.push(()=>{
  if(state!=='play'||typeof MC==='undefined'||!MC||!MC.ganada||levelIdx<1||typeof OLI_sentado!=='function'||typeof HIS_GEAR==='undefined')return;
  const llega=HIS_SALE+HIS_VUELO,d=MC.t-llega,cola=d>=0&&d<70&&(d>>3)%2?1:0; // mueve la cola cuando llega el diente
  ctx.globalAlpha=Math.min(1,MC.t/12);try{OLI_sentado(HIS_GEAR.x-24,HIS_GEAR.y+15,{cola,cara:1});}catch(e){}ctx.globalAlpha=1;
});

// ================== 1 · la escena de apertura ==================
// Tiempos en cuadros (60 por segundo): 6 planos, 600 en total.
const AP={on:false,t:0},AP_P=[0,90,210,300,450,540,600];
ON_START.push(()=>{AP.on=false;}); // cada misión que arranca la apaga; hud.js la prende después, solo en partida nueva desde M1
function AP_empezar(){AP.on=true;AP.t=0;for(const k in pressed)pressed[k]=false;}
function AP_fin(){AP.on=false;for(const k in pressed)pressed[k]=false;}
// juego.js: mientras dura, el juego espera. Cualquier tecla (o clic, o toque) la saltea.
function AP_paso(){
  if(!AP.on)return false;AP.t++;
  if(AP.t>12&&(Object.keys(pressed).some(k=>pressed[k])||(typeof RA_m!=='undefined'&&RA_m.abajo)||AP.toque)){AP_fin();return true;}
  AP.toque=false;const t=AP.t;
  try{ // sonido: tic-tac, CLAC, motor, frenada
    if(t<AP_P[1]&&t%30===1)tone('square',t%60===1?1500:1100,900,0.03,0.02);
    if(t===AP_P[1]+40){noise(0.25,0.3,1800);tone('square',180,60,0.3,0.08);}
    if(t===AP_P[3]+50){noise(0.3,0.12,900);}
    if(t===AP_P[3]+100)CAT_meow();
    if(t>=AP_P[3]&&t<AP_P[5]&&t%8===0)tone('sawtooth',70,60,0.12,0.015);
  }catch(e){}
  if(t>=AP_P[6])AP_fin();
  return true;
}
addEventListener('pointerdown',()=>{if(AP.on)AP.toque=true;});
const AP_R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
function AP_pj(ci,x,yPiso,f,corre,t){ // un personaje de la familia (parado o corriendo)
  try{const n=corre?(t>>2)%4:0;drawRig(charSet(ci,0),corre?{leg:'r'+n,ux:f?1:-1,uy:typeof RUN_BOB!=='undefined'?RUN_BOB[n]:0}:{leg:'idle',ux:0,uy:0},f,x-4,yPiso-18);}
  catch(e){AP_R(x-3,yPiso-18,7,18,'#17141f');AP_R(x-2,yPiso-17,5,16,['#8f6c3b','#74bde8','#e8e0d0'][ci%3]);}
}
function AP_camion(x,yPiso,jaula){ // el camión de la banda, de costado (dibujo simple; el del escenario va en su capa)
  const y=yPiso;AP_R(x-1,y-27,62,24,'#17141f');AP_R(x,y-26,40,20,'#3e3654');AP_R(x,y-26,40,2,'#57507a');AP_R(x+40,y-20,20,14,'#4e4668');AP_R(x+46,y-18,10,6,'#9ad0ff');
  AP_R(x+2,y-30,34,5,'#17141f');AP_R(x+3,y-29,32,3,'#6a5a48'); // lona
  AP_R(x+14,y-27,6,2,'#ffd070');if(typeof LUZ_halo==='function'&&ctx!==CTX0)LUZ_halo(x+17,y-26,8,'#f0a830',0.5); // el brillo dorado bajo la lona
  for(const wx of[x+6,x+44]){AP_R(wx-1,y-8,11,9,'#17141f');AP_R(wx,y-7,9,7,'#2a2a30');AP_R(wx+3,y-5,3,3,'#8a8e9a');}
  if(jaula&&typeof OLI_jaula==='function')try{OLI_jaula(x+26,y-50,{largo:5,estado:'cerrada',t:AP.t});}catch(e){}
}
function AP_porton(oy,vendido){ // el portón DESARMADERO al amanecer
  for(let i=0;i<6;i++)AP_R(0,oy+i*22,W,22,['#2a2448','#3e3260','#6a4a78','#a8688a','#e09a7a','#f6c890'][i]);
  AP_R(0,oy+132,W,H-132,'#2a2230');AP_R(0,oy+132,W,1,'#5a4a50');
  for(const x of[84,196]){AP_R(x-1,oy+70,8,63,'#17141f');AP_R(x,oy+71,6,61,'#5a4038');AP_R(x,oy+71,1,61,'#7a5a4a');}
  AP_R(77,oy+56,134,18,'#17141f');AP_R(78,oy+57,132,16,'#8a4a2a');AP_R(78,oy+57,132,1,'#b3683a');
  pxTxt('DESARMADERO',144,oy+62,'#f4e7c6','center');
  for(let x=96;x<190;x+=9){AP_R(x,oy+76,2,56,'#17141f');} // reja
  if(vendido){AP_R(165,oy+46,40,13,'#17141f');AP_R(166,oy+47,38,11,'#e8d8b0');pxTxt('VENDIDO',185,oy+50,'#3a2a1a','center');}
}
// se dibuja encima de todo (HUD incluido): es una pantalla aparte
ON_HUD.push(()=>{
  if(!AP.on)return;const t=AP.t,oy=Math.round((HC-H)/2),red=typeof MOV_reducido==='function'&&MOV_reducido();
  const plano=AP_P.findIndex((p,i)=>t<AP_P[i+1]),tp=t-AP_P[Math.max(0,plano)],dur=AP_P[plano+1]-AP_P[plano];
  ctx.fillStyle='#0b0a10';cubrir();
  const sac=!red&&plano===1&&tp>=40&&tp<52?((tp%2)?1:-1):0;ctx.save();ctx.translate(sac,0);
  if(typeof APE_dibujar==='function'&&APE_dibujar(plano,tp,t,oy,red)){/* arte-apertura.js (Personajes): los planos de cine; si falla, queda el dibujo de reserva de abajo */}
  else if(plano<=1){ // 1 y 2 · la pared del templo y el engranaje
    const gris=plano===1&&tp>=40;
    for(let i=0;i<9;i++)AP_R(0,oy+i*20,W,20,gris?(i%2?'#3a3a40':'#34343a'):(i%2?'#6a4a2a':'#5e4226'));
    for(let x=0;x<W;x+=40)for(let i=0;i<9;i++)AP_R(x+(i%2?20:0),oy+i*20,1,20,gris?'#2a2a30':'#4a3018');
    if(!gris&&typeof LUZ_halo==='function'){ctx.fillStyle='rgba(255,200,110,0.16)';ctx.beginPath();ctx.arc(W/2,oy+86,58,0,7);ctx.fill();}
    AP_R(W/2-34,oy+52,68,68,'#17141f');AP_R(W/2-32,oy+54,64,64,gris?'#2a2a30':'#3a2812'); // el nicho
    try{if(plano===0)OLI_engranajeGira(W/2,oy+86,t,2);else if(tp<40)OLI_engranajeGira(W/2,oy+86,t,2);else OLI_engranajeRompe(W/2,oy+86,tp-40+10,2);}catch(e){}
    if(plano===1){ // EL TASADOR, de perfil, tira de la palanca
      const px=W/2+70,baja=Math.min(1,tp/36);AP_R(px,oy+124,3,24,'#17141f');ctx.save();ctx.translate(px+1,oy+126);ctx.rotate(-0.9+baja*1.5);AP_R(-1,-22,3,22,'#8a8e9a');AP_R(-3,-26,7,5,'#d93a2b');ctx.restore();
      try{TAS_dibujar(px+22,oy+150,{cara:-1,t});}catch(e){AP_R(px+16,oy+118,12,32,'#17141f');}
      AP_R(0,oy+150,W,H-150,gris?'#26262c':'#3a2812');}
    else AP_R(0,oy+150,W,H-150,'#3a2812');
  }else{ // 3 a 6 · la casa
    AP_porton(oy,plano>=4||(plano===3&&tp>110));const piso=oy+132;
    if(plano===2){try{OLI_collarPuesto(true);OLI_durmiendo(150,oy+56,{orejas:tp>45,cara:1});}catch(e){}}
    if(plano===3){ // frena el camión; una mano mete a OLIVER en la jaula
      const k=Math.min(1,tp/50),e=1-(1-k)*(1-k),cx=W+10-(W-170)*e; // la mano va antes que el camión: el brazo sale de la pantalla (largo) y el camión lo tapa al llegar (Personajes)
      if(tp<40)try{OLI_collarPuesto(true);OLI_durmiendo(150,oy+56,{orejas:true,cara:1});}catch(e2){}
      else if(tp<=105){const m=(tp-40)/65,mx=160+(cx+26-160)*m,my=oy+44-Math.sin(m*Math.PI)*10+m*30;try{OLI_collarPuesto(false);OLI_mano(mx,my,{oliver:true,t:tp,largo:60});}catch(e2){}}
      AP_camion(cx,piso,tp>105);}
    if(plano>=4){ // el camión se va; la familia sale corriendo
      const tt=plano===4?tp:90+tp,cx=180+tt*tt*0.02;if(cx<W+20)AP_camion(cx,piso,true);
      const ci=typeof charIdx==='number'?charIdx:0,orden=[ci,(ci+1)%3,(ci+2)%3];
      if(plano===4){orden.forEach((c,i)=>{const x=Math.min(120+i*-16+tp*1.6,196-i*18);AP_pj(c,x,piso,1,x<196-i*18,t);});
        if(tp>30)try{globo((TX.historia&&TX.historia.apertura)||'¡OLIVER!',196,piso-22,{t:tp-30,dur:120,grito:true});}catch(e){}}
      else{ // 6 · el collar en el piso; quien juega lo levanta
        const lev=tp>30;orden.slice(1).forEach((c,i)=>AP_pj(c,178-i*18,piso,1,false,t));AP_pj(ci,214,piso,1,false,t);
        try{if(!lev)OLI_collarSuelto(228,piso);else OLI_collarSuelto(220,piso-10-Math.min(6,(tp-30)/3));}catch(e){}}
    }
  }
  ctx.restore();
  // entra y sale con un fundido corto; entre planos, un corte (con movimiento reducido, fundido)
  const f=Math.max(t<10?1-t/10:0,t>AP_P[6]-12?(t-(AP_P[6]-12))/12:0,red&&tp<8&&plano>0?1-tp/8:0);
  if(f>0){ctx.fillStyle=`rgba(11,10,16,${f.toFixed(2)})`;cubrir();}
  AP_R(0,0,W,oy,'#0b0a10');AP_R(0,oy+H,W,HC-oy-H+1,'#0b0a10');
  if(t>40)pxTxt(onTouch()?'TOCÁ PARA SALTEAR':'CUALQUIER TECLA: SALTEAR',onTouch()?W/2:W-6,oy+H-9,'rgba(244,238,224,0.55)',onTouch()?'center':'right'); // en táctil, al centro (entre la palanca y el rombo)
  if(typeof OLI_collarPuesto==='function')OLI_collarPuesto(OL.collar); // deja el collar como va en el juego
});
