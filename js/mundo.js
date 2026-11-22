'use strict';
// Óxido · Física del suelo, fondos, plataformas, decorado y lluvia
// ================== física compartida ==================
function land(o,prevBottom,allowPlat){
  if(o.vy<0){o.onGround=false;return;}
  const b=o.y+o.h;
  if(b>=GROUND){o.y=GROUND-o.h;o.vy=0;o.onGround=true;o.plat=null;return;}
  if(allowPlat)for(const pl of platforms){
    if(o.x+o.w>pl.x&&o.x<pl.x+pl.w&&prevBottom<=pl.y+0.01&&b>=pl.y){o.y=pl.y-o.h;o.vy=0;o.onGround=true;o.plat=pl;return;}
  }
  o.onGround=false;o.plat=null;
}
// ================== render: fondos ==================
function ridge(arr,step,par,base,col){
  const n=arr.length,span=n*step,off=((camX*par)%span+span)%span,i0=Math.floor(off/step),fx=off-i0*step;
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(-1,H);let lx=0;
  for(let k=0;k<=Math.ceil(W/step)+1;k++){lx=k*step-fx;ctx.lineTo(lx,base-arr[(i0+k)%n]);}
  ctx.lineTo(lx,H);ctx.closePath();ctx.fill();
}
function drawBGDusk(){
  const g=ctx.createLinearGradient(0,0,0,GROUND);
  g.addColorStop(0,'#1f1633');g.addColorStop(0.45,'#6b2f4a');g.addColorStop(0.8,'#d0623f');g.addColorStop(1,'#f3a35c');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(255,214,140,0.22)';circle(236,96,32);
  ctx.fillStyle='#ffd58a';circle(236,96,21);
  ctx.fillStyle='rgba(208,98,63,0.85)';for(let i=0;i<4;i++)ctx.fillRect(210,100+i*5,52,1+i*0.6);
  ctx.fillStyle='rgba(255,190,160,0.18)';
  for(const c of CLOUDS){const x=((c.x-camX*0.04)%700+700)%700-60;ctx.beginPath();ctx.ellipse(x,c.y,c.w/2,3,0,0,7);ctx.fill();}
  ridge(MOUNT_FAR,20,0.08,124,'#7a3550');
  ridge(MOUNT_NEAR,26,0.18,134,'#4f2440');
  const span=900,off=((camX*0.4)%span+span)%span;
  for(const rep of [0,span])for(const b of RUINS){
    const x=b.x-off+rep;if(x>W||x+b.w<0)continue;const top=GROUND-b.h;
    ctx.fillStyle='#2e1b2c';ctx.beginPath();ctx.moveTo(x,GROUND);ctx.lineTo(x,top+b.cut);ctx.lineTo(x+b.w*0.4,top);
    ctx.lineTo(x+b.w*0.6,top+b.cut*0.6);ctx.lineTo(x+b.w,top+b.cut*0.2);ctx.lineTo(x+b.w,GROUND);ctx.fill();
    ctx.fillStyle='rgba(255,150,70,0.55)';for(const[wx,wy]of b.win)ctx.fillRect(x+wx,top+wy+b.cut,2,3);
    if(b.crane){ctx.strokeStyle='#2e1b2c';ctx.lineWidth=1.5;const cx=x+b.w*0.5;ctx.beginPath();ctx.moveTo(cx,top);ctx.lineTo(cx,top-38);ctx.lineTo(cx-30,top-34);ctx.moveTo(cx,top-38);ctx.lineTo(cx+10,top-36);ctx.stroke();
      ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(cx-24,top-35);ctx.lineTo(cx-24,top-18);ctx.stroke();}
  }
  ctx.fillStyle='rgba(240,140,90,0.10)';ctx.fillRect(0,90,W,GROUND-90);
}
function drawBGPort(){
  const SEA=118;
  const g=ctx.createLinearGradient(0,0,0,SEA);
  g.addColorStop(0,'#060a16');g.addColorStop(0.55,'#111d36');g.addColorStop(1,'#2a3a56');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  for(let i=0;i<40;i++){const h=hash(i*7+3);if((T>>4)%7===i%7&&h<0.2)continue;ctx.fillStyle=`rgba(220,230,255,${0.3+h*0.5})`;ctx.fillRect(((i*41-camX*0.02)%W+W)%W,hash(i*13)*70,0.8,0.8);}
  ctx.fillStyle='rgba(200,220,255,0.10)';circle(70,40,18);ctx.fillStyle='#e8eef5';circle(70,40,9);ctx.fillStyle='rgba(17,29,54,0.6)';circle(74,38,8);
  ctx.fillStyle='rgba(14,20,36,0.75)';
  for(const c of CLOUDS){const x=((c.x-camX*0.05)%700+700)%700-60;ctx.beginPath();ctx.ellipse(x,c.y-4,c.w/1.6,4,0,0,7);ctx.fill();}
  // ciudad lejana
  const off=((camX*0.1)%600+600)%600;
  for(const rep of [0,600])for(const b of CITY){const x=b.x-off+rep;if(x>W||x+b.w<0)continue;
    ctx.fillStyle='#0d1424';ctx.fillRect(x,SEA-b.h,b.w,b.h);
    for(let i=0;i<6;i++){const h=hash(b.s+i);if(h<0.55)continue;ctx.fillStyle=h>0.9?'#ffd27a':'rgba(255,200,120,0.6)';ctx.fillRect(x+2+h*(b.w-4),SEA-b.h+3+hash(b.s+i*3)*(b.h-6),1,1);}}
  // mar con reflejos
  ctx.fillStyle='#0b1628';ctx.fillRect(0,SEA,W,GROUND-SEA);
  for(let i=0;i<26;i++){const y=SEA+3+(i*1.43)%(GROUND-SEA-4),x=((i*67-camX*0.25+Math.sin(T/30+i)*4)%W+W)%W;
    ctx.fillStyle='rgba(120,160,210,0.16)';ctx.fillRect(x,y,8+hash(i)*14,0.7);}
  ctx.fillStyle='rgba(220,230,255,0.18)';for(let i=0;i<6;i++)ctx.fillRect(64+Math.sin(T/20+i)*3,SEA+3+i*5,12-i,0.8);
  // barco portacontenedores y grúas
  const so=((camX*0.25)%1000+1000)%1000;const sx=380-so;
  for(const x of [sx,sx+1000]){if(x>W||x+150<0)continue;ctx.fillStyle='#0a1120';ctx.fillRect(x,SEA-6,150,8);ctx.fillRect(x+120,SEA-22,18,16);
    for(let i=0;i<10;i++){ctx.fillStyle=['#2a1a20','#16202e','#22281a'][i%3];ctx.fillRect(x+6+i*11,SEA-14-(i%3)*4,10,8+(i%3)*4);}
    ctx.fillStyle=(T>>5)%2?'#ff4a3a':'#5a1a14';ctx.fillRect(x+128,SEA-24,1.5,1.5);}
  const co=((camX*0.35)%800+800)%800;
  ctx.strokeStyle='#070c18';ctx.lineWidth=2;
  for(const rep of [0,800])for(const c of CRANES){const x=c.x-co+rep;if(x>W+60||x<-80)continue;const top=SEA-c.h,mid=SEA-c.h*0.6;
    ctx.beginPath();ctx.moveTo(x,SEA);ctx.lineTo(x+8,mid);ctx.moveTo(x+26,SEA);ctx.lineTo(x+18,mid);ctx.moveTo(x-34,mid);ctx.lineTo(x+56,mid);
    ctx.moveTo(x+13,mid);ctx.lineTo(x+13,top);ctx.stroke();
    ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(x+13,top);ctx.lineTo(x-34,mid);ctx.moveTo(x+13,top);ctx.lineTo(x+56,mid);ctx.moveTo(x-20,mid);ctx.lineTo(x-20,mid+18);ctx.stroke();ctx.lineWidth=2;
    ctx.fillStyle='#070c18';ctx.fillRect(x+6,mid-6,14,7);
    ctx.fillStyle=(T>>5)%2?'#ff4a3a':'#5a1a14';ctx.fillRect(x+12,top-2,2,2);}
}
function drawGround(){
  if(L.drawGround){L.drawGround();return;} // gancho por misión
  const x0=Math.floor(camX)-10;
  if(L.theme==='port'){
    ctx.fillStyle='#262b33';ctx.fillRect(x0,GROUND,W+20,H-GROUND);
    ctx.fillStyle='#5a616c';ctx.fillRect(x0,GROUND,W+20,1.5);
    for(let x=Math.floor(camX/12)*12-12;x<camX+VW+12;x+=12){ctx.fillStyle='#c9a43a';ctx.fillRect(x,GROUND+3,6,1);ctx.fillStyle='#1d2128';ctx.fillRect(x,GROUND+5,0.6,H-GROUND-5);}
    for(let t=Math.floor(camX/40)-1;t<(camX+VW)/40+1;t++){const h=hash(t+77);if(h<0.5)continue;
      ctx.fillStyle='rgba(140,170,210,0.16)';ctx.beginPath();ctx.ellipse(t*40+h*20,GROUND+11,8+h*8,1.6,0,0,7);ctx.fill();
      const r=((T+t*13)%40)/40;ctx.strokeStyle=`rgba(180,210,240,${0.4*(1-r)})`;ctx.lineWidth=0.5;ctx.beginPath();ctx.ellipse(t*40+h*20,GROUND+11,r*5,r*1.2,0,0,7);ctx.stroke();}
    return;
  }
  ctx.fillStyle='#3b2620';ctx.fillRect(x0,GROUND,W+20,H-GROUND);
  ctx.fillStyle='#7a4a2e';ctx.fillRect(x0,GROUND,W+20,2);
  ctx.fillStyle='#a8693d';ctx.fillRect(x0,GROUND,W+20,0.75);
  for(let t=Math.floor(camX/12)-1;t<(camX+VW)/12+1;t++){
    const h=hash(t);if(h<0.55){ctx.fillStyle=h<0.2?'#5a3a2a':'#2c1b16';const s=1+Math.floor(h*10)%3;ctx.fillRect(t*12+h*8,GROUND+4+Math.floor(h*977)%16,s,s*0.7);}
  }
}
function drawDecor(d){
  if(L.drawDecor&&L.drawDecor(d))return; // gancho por misión: true = ya lo dibujó
  const x=d.x,g=GROUND;
  switch(d.k){
  case 'barrel':ctx.fillStyle=L.theme==='port'?'#2f5a6a':'#7d3b22';ctx.fillRect(x,g-12,8,12);ctx.fillStyle=L.theme==='port'?'#4a7e8e':'#a8552e';ctx.fillRect(x,g-12,8,1);ctx.fillRect(x,g-7,8,1);ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(x+6,g-12,2,12);break;
  case 'car':ctx.fillStyle='#4b2f2c';ctx.beginPath();ctx.moveTo(x,g);ctx.lineTo(x+2,g-9);ctx.lineTo(x+12,g-10);ctx.lineTo(x+18,g-17);ctx.lineTo(x+34,g-17);ctx.lineTo(x+40,g-10);ctx.lineTo(x+48,g-9);ctx.lineTo(x+49,g);ctx.fill();
    ctx.fillStyle='#1d1418';ctx.fillRect(x+20,g-15,6,5);ctx.fillRect(x+28,g-15,5,5);ctx.fillStyle='#6e4136';ctx.fillRect(x+2,g-9,46,1);ctx.fillStyle='#16121a';circle(x+10,g-1,3);circle(x+38,g-1,3);break;
  case 'sandbag':for(let r=0;r<3;r++)for(let i=0;i<4-r;i++){ctx.fillStyle=(i+r)%2?'#8b7350':'#a08860';ctx.beginPath();ctx.ellipse(x+5+i*9+r*4.5,g-3-r*5,5,3,0,0,7);ctx.fill();}break;
  case 'pylon':ctx.strokeStyle='#2a1a25';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,g);ctx.lineTo(x+8,g-70);ctx.lineTo(x+16,g);
    for(let i=1;i<6;i++){const y=g-i*12,w=8*(1-i*12/70);ctx.moveTo(x+8-w,y);ctx.lineTo(x+8+w,y-12);}
    ctx.moveTo(x-6,g-56);ctx.lineTo(x+22,g-56);ctx.moveTo(x-2,g-64);ctx.lineTo(x+18,g-64);ctx.stroke();break;
  case 'sign':ctx.fillStyle='#3a2a20';ctx.fillRect(x+5,g-20,2,20);ctx.fillStyle='#d9a43a';ctx.fillRect(x,g-25,12,8);
    ctx.fillStyle='#1f1a17';for(let i=0;i<4;i++)ctx.fillRect(x+1+i*3,g-24,1.2,6);break;
  case 'tire':ctx.fillStyle='#1b1a1f';circle(x+5,g-4,5);ctx.fillStyle='#3b2620';circle(x+5,g-4,2);break;
  case 'lamp':{
    ctx.fillStyle='rgba(255,220,150,0.07)';ctx.beginPath();ctx.moveTo(x+6,g-46);ctx.lineTo(x-10,g);ctx.lineTo(x+26,g);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,220,150,0.12)';ctx.beginPath();ctx.ellipse(x+8,g+1,16,2,0,0,7);ctx.fill();
    ctx.fillStyle='#1a1e26';ctx.fillRect(x,g-48,2,48);ctx.fillRect(x,g-48,8,2);
    ctx.fillStyle=(hash(x)>0.8&&(T>>3)%9===0)?'#5a4a30':'#ffe2a0';ctx.fillRect(x+5,g-46,3,1.5);break;}
  case 'bollard':ctx.fillStyle='#1a1e26';ctx.fillRect(x,g-6,6,6);ctx.fillRect(x-1,g-8,8,2.5);ctx.fillStyle='#3a404c';ctx.fillRect(x,g-8,8,0.8);break;
  case 'coil':ctx.strokeStyle='#7a5a3a';ctx.lineWidth=1.5;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(x+8,g-2-i*1.6,8-i*1.5,2.4,0,0,7);ctx.stroke();}break;
  }
}
function drawPlatforms(){
  for(const pl of platforms){
    if(pl.x>camX+VW||pl.x+pl.w<camX)continue;
    if(L.drawPlat&&L.drawPlat(pl))continue; // gancho por misión
    if(pl.roof){dibTunelFondo(pl);continue;}
    if(pl.pyr){dibEscalon(pl);continue;}
    if(pl.hi){dibAlta(pl);continue;}
    if(pl.box){
      ctx.fillStyle=pl.box;ctx.fillRect(pl.x,pl.y,pl.w,GROUND-pl.y);
      ctx.fillStyle='rgba(0,0,0,0.38)';ctx.fillRect(pl.x,pl.y,pl.w,GROUND-pl.y);
      ctx.fillStyle='rgba(0,0,0,0.25)';for(let x=pl.x+2;x<pl.x+pl.w-1;x+=3)ctx.fillRect(x,pl.y+4,1,GROUND-pl.y-6);
      ctx.fillStyle='rgba(0,0,0,0.45)';ctx.fillRect(pl.x+pl.w-9,pl.y+5,1,GROUND-pl.y-7);ctx.fillRect(pl.x+pl.w-5,pl.y+5,1,GROUND-pl.y-7);
      ctx.fillStyle=pl.box;ctx.fillRect(pl.x,pl.y,pl.w,3);ctx.fillStyle='rgba(255,255,255,0.35)';ctx.fillRect(pl.x,pl.y,pl.w,0.8);
      ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(pl.x,pl.y+3,pl.w,0.8);
      continue;
    }
    const port=L.theme==='port';
    ctx.fillStyle=port?'#20262e':'#3a2219';ctx.fillRect(pl.x+4,pl.y+4,3,GROUND-pl.y-4);ctx.fillRect(pl.x+pl.w-7,pl.y+4,3,GROUND-pl.y-4);
    ctx.strokeStyle=port?'#20262e':'#3a2219';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pl.x+6,pl.y+6);ctx.lineTo(pl.x+pl.w-6,GROUND-2);ctx.moveTo(pl.x+pl.w-6,pl.y+6);ctx.lineTo(pl.x+6,GROUND-2);ctx.stroke();
    ctx.fillStyle=port?'#4a5260':'#8c4a2b';ctx.fillRect(pl.x,pl.y,pl.w,4);
    ctx.fillStyle=port?'#7a8494':'#c9773f';ctx.fillRect(pl.x,pl.y,pl.w,1);
    ctx.fillStyle='#2a150e';ctx.fillRect(pl.x,pl.y+4,pl.w,1);
    ctx.fillStyle=port?'#2a2f38':'#5a2d1a';for(let x=pl.x+3;x<pl.x+pl.w-2;x+=8)ctx.fillRect(x,pl.y+2,1,1);
  }
}
function drawRain(){
  ctx.strokeStyle='rgba(170,200,235,0.32)';ctx.lineWidth=0.6;ctx.beginPath();
  for(let i=0;i<90;i++){const x=((i*53.7+T*1.6-camX*0.3)%(W+30)+W+30)%(W+30)-15,y=((i*97.3+T*6.5)%(H+20))-10;ctx.moveTo(x,y);ctx.lineTo(x-1.6,y+6);}
  ctx.stroke();
  if(lightning>0){ctx.fillStyle=`rgba(210,225,255,${(lightning%4<2?0.35:0.15)*lightning/12})`;ctx.fillRect(0,0,W,H);}
}

// ================== estructuras: túneles, pirámides y plataformas altas ==================
// Túnel: el techo es una plataforma (se camina por arriba). Acá va el fondo oscuro, los pilares y la losa;
// el frente de la losa y la penumbra se vuelven a dibujar encima del jugador en drawForeground().
function dibTunelFondo(pl){
  const t=pl.roof,x=pl.x,y=pl.y,w=pl.w,th=9,iy=y+th,ih=GROUND-iy;
  if(t.k==='pier'){
    ctx.fillStyle='rgba(4,7,14,0.86)';ctx.fillRect(x+2,iy,w-4,ih);
    ctx.fillStyle='#0f141e';for(let i=0;i<w-8;i+=9)ctx.fillRect(x+4+i,iy,1,ih*0.5);      // vigas del fondo
    ctx.strokeStyle='#241c18';ctx.lineWidth=1.5;
    for(let px=x+6;px<x+w-4;px+=30){ctx.beginPath();ctx.moveTo(px,iy);ctx.lineTo(px+30>x+w-4?px:px+30,GROUND);ctx.stroke();}
    ctx.fillStyle='#2e241e';for(let px=x+4;px<x+w-2;px+=30){ctx.fillRect(px,iy,4,ih);ctx.fillStyle='#3e3128';ctx.fillRect(px,iy,1,ih);ctx.fillStyle='#2e241e';}
    ctx.fillStyle='rgba(120,160,210,0.10)';ctx.fillRect(x+2,GROUND-3,w-4,3);                 // agua que se cuela
    // barandas sobre el muelle (atrás del jugador)
    ctx.fillStyle='#1c1612';for(let px=x+2;px<x+w;px+=14)ctx.fillRect(px,y-7,1.5,7);ctx.fillRect(x,y-7,w,1.2);
  }else{
    const g=ctx.createLinearGradient(0,iy,0,GROUND);g.addColorStop(0,'rgba(18,8,12,0.92)');g.addColorStop(1,'rgba(52,26,26,0.78)');
    ctx.fillStyle=g;ctx.fillRect(x+3,iy,w-6,ih);
    ctx.fillStyle='rgba(255,150,70,0.07)';ctx.fillRect(x+3,GROUND-8,w-6,8);                  // luz del atardecer que entra por abajo
    ctx.fillStyle='rgba(160,80,60,0.35)';ctx.fillRect(x+30,iy+10,14,1);ctx.fillRect(x+33,iy+12,9,1);ctx.fillRect(x+w-40,iy+14,6,1);  // pintadas viejas
    for(const px of [x+2,x+w/2-4,x+w-12]){ctx.fillStyle='#5a3c36';ctx.fillRect(px,iy,10,ih);ctx.fillStyle='#7a5248';ctx.fillRect(px,iy,2,ih);
      ctx.fillStyle='#3a2420';ctx.fillRect(px+8,iy,2,ih);ctx.fillRect(px-1,iy,12,2);}
    // guardarraíl sobre la autopista (atrás del jugador)
    ctx.fillStyle='#6e5a50';for(let px=x+3;px<x+w-10;px+=12)ctx.fillRect(px,y-6,1.5,6);
    ctx.fillStyle='#a08a7a';ctx.fillRect(x,y-6,w-12,2);ctx.fillStyle='#5a463e';ctx.fillRect(x,y-4,w-12,0.8);
  }
  dibLosa(pl);
}
function dibLosa(pl){
  const t=pl.roof,x=pl.x,y=pl.y,w=pl.w;
  if(t.k==='pier'){
    ctx.fillStyle='#3a2c24';ctx.fillRect(x,y,w,8);
    ctx.fillStyle='#4e3c30';ctx.fillRect(x,y,w,1.2);
    ctx.fillStyle='#22180f';for(let i=6;i<w;i+=11)ctx.fillRect(x+i,y+1.5,0.8,3.5);
    ctx.fillStyle='#2a1e16';ctx.fillRect(x,y+5,w,3);ctx.fillStyle='#16100b';ctx.fillRect(x,y+8,w,1);
    ctx.fillStyle='#8a8f96';for(let i=4;i<w;i+=11)ctx.fillRect(x+i,y+6,1,1);                 // bulones
    for(let i=18;i<w-10;i+=44){ctx.fillStyle='#14141a';ctx.beginPath();ctx.ellipse(x+i,y+9,3.5,2.4,0,0,7);ctx.fill();}   // neumáticos de defensa
    return;
  }
  // losa de autopista con el borde derecho quebrado
  ctx.fillStyle='#7d6258';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w-3,y+4);ctx.lineTo(x+w+1,y+6);ctx.lineTo(x+w-6,y+9);ctx.lineTo(x,y+9);ctx.closePath();ctx.fill();
  ctx.fillStyle='#b08a72';ctx.fillRect(x,y,w,1.2);
  ctx.fillStyle='#5c443c';ctx.fillRect(x,y+6.5,w-6,2.5);
  ctx.fillStyle='#d9a43a';for(let i=8;i<w-14;i+=16)ctx.fillRect(x+i,y+3,6,1);                  // franja pintada
  ctx.fillStyle='#4a3430';ctx.fillRect(x+22,y+2,1,4);ctx.fillRect(x+23,y+4,3,1);ctx.fillRect(x+70,y+1,1,3);ctx.fillRect(x+71,y+3,2,1);  // grietas
  ctx.strokeStyle='#3a2a26';ctx.lineWidth=0.7;ctx.beginPath();                                 // hierros asomando
  ctx.moveTo(x+w-2,y+5);ctx.lineTo(x+w+4,y+9);ctx.moveTo(x+w-4,y+7);ctx.lineTo(x+w,y+13);ctx.moveTo(x+w-1,y+3);ctx.lineTo(x+w+5,y+2);ctx.stroke();
}
// Pirámide: cada escalón es una franja de dy px apoyada sobre el de abajo
function dibEscalon(pl){
  const x=pl.x,y=pl.y,w=pl.w,h=pl.pyr.dy,m=pl.mat;
  if(m.startsWith('box:')){
    const c=m.slice(4);ctx.fillStyle=c;ctx.fillRect(x,y,w,h);ctx.fillStyle='rgba(0,0,0,0.38)';ctx.fillRect(x,y,w,h);
    ctx.fillStyle='rgba(0,0,0,0.28)';for(let i=x+2;i<x+w-1;i+=3)ctx.fillRect(i,y+3,1,h-4);
    ctx.fillStyle=c;ctx.fillRect(x,y,w,2.5);ctx.fillStyle='rgba(255,255,255,0.32)';ctx.fillRect(x,y,w,0.8);
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(x+w-7,y+4,1,h-5);ctx.fillRect(x+w-4,y+4,1,h-5);
    ctx.fillStyle='rgba(255,255,255,0.18)';ctx.fillRect(x+4,y+6,Math.min(16,w-14),2);       // letras gastadas
  }else if(m==='pallet'){
    ctx.fillStyle='#24180f';ctx.fillRect(x,y,w,h);
    for(let r=0;r<h-3;r+=5){ctx.fillStyle=r?'#7a5e36':'#9a7a4a';ctx.fillRect(x,y+r,w,2.2);
      ctx.fillStyle='#5a4428';for(let i=x+3;i<x+w-3;i+=Math.max(8,(w-6)/3))ctx.fillRect(i,y+r+2.2,3,2.8);}
    ctx.fillStyle='rgba(255,255,255,0.18)';ctx.fillRect(x,y,w,0.8);
  }else if(m==='sheet'){
    ctx.fillStyle='#8c4a2b';ctx.fillRect(x,y,w,h);
    ctx.fillStyle='#5e2e1a';for(let i=x+1;i<x+w;i+=3)ctx.fillRect(i,y+2,1,h-2);
    ctx.fillStyle='rgba(60,20,10,0.5)';for(let i=0;i<w;i+=17){const hh=hash(i+x);ctx.fillRect(x+i+hh*8,y+3+hh*6,3+hh*4,2);}
    ctx.fillStyle='#c9773f';ctx.fillRect(x,y,w,1.5);
  }else if(m==='drum'){
    ctx.fillStyle='#2a150e';ctx.fillRect(x,y,w,h);
    for(let i=x+1;i<x+w-6;i+=9){ctx.fillStyle='#7d3b22';ctx.fillRect(i,y+1,8,h-1);ctx.fillStyle='#a8552e';ctx.fillRect(i,y+1,8,1);ctx.fillRect(i,y+h*0.45,8,1);
      ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(i+6,y+1,2,h-1);}
    ctx.fillStyle='#8c4a2b';ctx.fillRect(x,y,w,2);ctx.fillStyle='#c9773f';ctx.fillRect(x,y,w,0.8);
  }else{ // tablones
    ctx.fillStyle='#6a3e24';ctx.fillRect(x,y,w,h);
    ctx.fillStyle='#4a2a18';for(let r=4;r<h;r+=4)ctx.fillRect(x,y+r,w,0.8);
    ctx.fillStyle='#3a2014';for(let r=0;r<h;r+=4){const o=(r*7)%23;for(let i=x+o;i<x+w-2;i+=23)ctx.fillRect(i,y+r,0.8,4);}
    ctx.fillStyle='#b07040';ctx.fillRect(x,y,w,1.2);ctx.fillStyle='#d0b090';for(let i=x+3;i<x+w-2;i+=10)ctx.fillRect(i,y+2,0.8,0.8);
  }
  ctx.fillStyle='rgba(0,0,0,0.28)';ctx.fillRect(x+w-3,y,3,h);            // sombra del lado derecho
  ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(x,y+h-1,w,1);
}
// Plataformas altas: cartel oxidado (misión 1) o pasarela colgada de una grúa (misión 2)
function dibAlta(pl){
  const x=pl.x,y=pl.y,w=pl.w;
  if(pl.hi==='crane'){
    ctx.strokeStyle='#3a404c';ctx.lineWidth=0.7;ctx.beginPath();
    ctx.moveTo(x+2,y);ctx.lineTo(x+w/2,y-30);ctx.lineTo(x+w-2,y);ctx.moveTo(x+w/2,y-30);ctx.lineTo(x+w/2,-2);ctx.stroke();
    ctx.fillStyle='#d9a43a';ctx.fillRect(x+w/2-2,y-33,4,3);ctx.fillStyle='#1a1e26';ctx.fillRect(x+w/2-1,y-30,2,2);   // gancho
    ctx.fillStyle='#1a1e26';ctx.fillRect(x,y-6,w,1);for(let i=x;i<=x+w;i+=8)ctx.fillRect(Math.min(i,x+w-1),y-6,1,6);  // baranda
    ctx.fillStyle='#4a5260';ctx.fillRect(x,y,w,3);ctx.fillStyle='#7a8494';ctx.fillRect(x,y,w,0.8);
    ctx.fillStyle='#1a1e26';for(let i=x+2;i<x+w-1;i+=3)ctx.fillRect(i,y+1.2,1.2,1.2);                // rejilla
    ctx.fillStyle='#d9a43a';for(let i=0;i<w;i+=6)ctx.fillRect(x+i,y+3,3,1);ctx.fillStyle='#1a1e26';for(let i=3;i<w;i+=6)ctx.fillRect(x+i,y+3,3,1);
    ctx.fillStyle=(T>>5)%2?'#ff4a3a':'#5a1a14';ctx.fillRect(x+w-2,y-8,2,2);
    return;
  }
  // cartel: dos patas, panel despintado y pasarela arriba
  ctx.fillStyle='#2e1b2c';ctx.fillRect(x+8,y+24,3,GROUND-y-24);ctx.fillRect(x+w-11,y+24,3,GROUND-y-24);
  ctx.strokeStyle='#2e1b2c';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(x+10,y+40);ctx.lineTo(x+w-10,y+62);ctx.moveTo(x+w-10,y+40);ctx.lineTo(x+10,y+62);ctx.stroke();
  ctx.fillStyle='#3a2219';ctx.fillRect(x-1,y+3,w+2,22);
  ctx.fillStyle='#b8743a';ctx.fillRect(x+1,y+5,w-2,18);
  ctx.fillStyle='#e0a050';circle(x+w*0.3,y+15,5);ctx.fillStyle='#b8743a';ctx.fillRect(x+w*0.3-6,y+16,12,1);ctx.fillRect(x+w*0.3-6,y+18,12,1);
  ctx.fillStyle='#7a3550';ctx.fillRect(x+w*0.55,y+9,w*0.35,2);ctx.fillRect(x+w*0.55,y+13,w*0.25,2);
  ctx.fillStyle='rgba(60,25,15,0.55)';for(let i=4;i<w-2;i+=7){const hh=hash(i+x);ctx.fillRect(x+i,y+5,1,4+hh*12);}   // óxido chorreado
  ctx.fillStyle='rgba(30,10,20,0.35)';ctx.fillRect(x+w-14,y+5,12,10);                                // pedazo arrancado
  ctx.fillStyle='#8c4a2b';ctx.fillRect(x-2,y,w+4,3);ctx.fillStyle='#c9773f';ctx.fillRect(x-2,y,w+4,0.8);
  ctx.fillStyle='#ffd58a';ctx.fillRect(x+4,y+3,2,1);ctx.fillRect(x+w-6,y+3,2,1);                     // focos
}

// ================== coberturas ==================
// Muros bajos que frenan las balas enemigas (las del jugador pasan). Las explosiones las van rompiendo.
let coberturas=[],techos=[],cobLvl=null,cobMinY=GROUND;
const COB_COL={sandbags:['#8b7350','#a08860'],concrete:['#8a7a72','#a8988c'],tires:['#1b1a1f','#2e2c33'],container:['#8c3b2a','#a8503a'],
  bollard:['#1a1e26','#3a404c'],lowbox:['#2f6a8a','#4a86a6'],pallets:['#7a5e36','#9a7a4a']};
function armarCoberturas(){
  cobLvl=L;
  coberturas=(L.covers||[]).map(c=>({...c,top:GROUND-c.h,vida:c.hp||Infinity,max:c.hp||Infinity,fl:0}));
  techos=(L.tunnels||[]).map(t=>({x:t.x,y:t.y,w:t.w,th:9,k:t.k}));
  cobMinY=Math.min(GROUND,...coberturas.map(c=>c.top),...techos.map(t=>t.y));
}
function romperCobertura(c){
  const col=COB_COL[c.k]||['#888','#aaa'];SFX.hit();
  for(let i=0;i<14;i++)parts.push({k:'p',x:c.x+rand(0,c.w),y:c.top+rand(0,c.h),vx:rand(-1.8,1.8),vy:rand(-3,-0.6),g:0.18,life:rand(25,45),maxl:45,size:rand(1,2.5),col:col[i%2]});
  dust(c.x+c.w/2,GROUND,8);
}
function golpeCobertura(c,b){
  c.fl=T+4;
  if(c.vida===Infinity)return;
  c.vida-=b.blast?(b.blast>=20?6:3):0.1;
  if(c.vida<=0)romperCobertura(c);
}
// ¿una cobertura frena este proyectil enemigo? Se llama por cada proyectil en cada cuadro: sale rápido.
function coverBlocks(b){
  if(cobLvl!==L)armarCoberturas();
  if(b.y<cobMinY)return false;
  for(const c of coberturas){
    if(c.vida<=0||b.x<c.x||b.x>c.x+c.w||b.y<c.top)continue;
    golpeCobertura(c,b);return true;
  }
  for(const t of techos){
    if(b.x<t.x||b.x>t.x+t.w||b.y<t.y||b.y>t.y+t.th)continue;
    if(b.kind==='bullet')return true;                                       // balas de arriba o de abajo: las frena la losa
    if(b.vy<0){b.vy=Math.abs(b.vy)*0.3;b.vx*=0.6;b.y=t.y+t.th+1;spark(b.x,b.y,'#d9c8a0');return false;} // rebota contra el techo
    if(b.y-b.vy>=t.y)return true;                                           // entró de costado; si cae de arriba explota sobre el techo
  }
  return false;
}
function drawCover(){
  if(cobLvl!==L)armarCoberturas();
  for(const c of coberturas){
    if(c.x>camX+VW||c.x+c.w<camX)continue;
    const x=c.x,w=c.w,top=c.top,h=c.h,col=COB_COL[c.k]||['#888','#aaa'];
    if(L.drawCover&&L.drawCover(c)){if(T<c.fl){ctx.fillStyle='rgba(255,240,210,0.55)';ctx.fillRect(c.x,c.top,c.w,c.h);}continue;} // gancho por misión
    if(c.vida<=0){ // escombro bajo, ya no frena nada
      ctx.fillStyle=col[0];ctx.beginPath();ctx.moveTo(x-2,GROUND);ctx.lineTo(x+w*0.3,GROUND-4);ctx.lineTo(x+w*0.6,GROUND-2.5);ctx.lineTo(x+w*0.8,GROUND-4.5);ctx.lineTo(x+w+2,GROUND);ctx.fill();
      ctx.fillStyle=col[1];ctx.fillRect(x+w*0.3-1,GROUND-4,3,1);continue;}
    switch(c.k){
    case 'sandbags':{const rows=Math.round(h/4.6);
      for(let r=0;r<rows;r++){const n=Math.max(1,Math.floor((w-r*3)/8.5));const ox=x+(w-n*8.5)/2+4.25;
        for(let i=0;i<n;i++){ctx.fillStyle=(i+r)%2?col[0]:col[1];ctx.beginPath();ctx.ellipse(ox+i*8.5,GROUND-2.6-r*4.6,4.6,2.8,0,0,7);ctx.fill();
          ctx.fillStyle='rgba(0,0,0,0.22)';ctx.fillRect(ox+i*8.5-3,GROUND-1.2-r*4.6,6,0.8);}}
      break;}
    case 'concrete':{ // barrera de hormigón de dos tramos, con franjas despintadas
      ctx.fillStyle=col[0];ctx.beginPath();ctx.moveTo(x,GROUND);ctx.lineTo(x,GROUND-4);ctx.lineTo(x+3,top+2);ctx.lineTo(x+4,top);ctx.lineTo(x+w-4,top);ctx.lineTo(x+w-3,top+2);ctx.lineTo(x+w,GROUND-4);ctx.lineTo(x+w,GROUND);ctx.fill();
      ctx.fillStyle=col[1];ctx.fillRect(x+4,top,w-8,1.2);ctx.fillRect(x,GROUND-4,w,0.8);
      ctx.fillStyle='rgba(0,0,0,0.22)';ctx.fillRect(x+w-4,top+2,2,h-2);ctx.fillRect(x+w/2,top+1,0.8,h-1);
      ctx.save();ctx.beginPath();ctx.rect(x+3,top+3,w-6,3);ctx.clip();
      for(let i=-4;i<w;i+=6){ctx.fillStyle='#c9773f';ctx.beginPath();ctx.moveTo(x+i,top+6);ctx.lineTo(x+i+3,top+3);ctx.lineTo(x+i+6,top+3);ctx.lineTo(x+i+3,top+6);ctx.fill();}
      ctx.restore();
      ctx.fillStyle='#5e504a';ctx.fillRect(x+6,top+9,2,1);ctx.fillRect(x+w-9,top+11,1,2);ctx.fillRect(x+4,GROUND-2,3,2);ctx.fillRect(x+w-7,GROUND-2,3,2);
      break;}
    case 'tires':{const n=Math.round(h/4.7);
      for(let r=0;r<n;r++){const yy=GROUND-4.7*(r+1),ox=(r%2)*1.5;ctx.fillStyle=col[0];ctx.fillRect(x+ox,yy+0.3,w-1.5,4.4);
        ctx.fillStyle=col[1];for(let i=x+ox+1;i<x+ox+w-2;i+=2.5)ctx.fillRect(i,yy+1,1,3);ctx.fillStyle='#3b2620';ctx.fillRect(x+ox+w*0.35,yy+0.3,w*0.25,1);}
      break;}
    case 'container':
      ctx.fillStyle=col[0];ctx.fillRect(x,top,w,h);ctx.fillStyle='rgba(0,0,0,0.3)';for(let i=x+2;i<x+w-1;i+=3)ctx.fillRect(i,top+2,1,h-3);
      ctx.fillStyle=col[1];ctx.fillRect(x,top,w,1.5);ctx.fillStyle='#2a150e';ctx.fillRect(x+w-6,top+2,1,h-3);ctx.fillRect(x+w-3,top+2,1,h-3);
      ctx.fillStyle='rgba(60,20,10,0.55)';ctx.fillRect(x+5,top+5,7,4);ctx.fillRect(x+w*0.5,top+9,6,3);
      break;
    case 'bollard':
      ctx.fillStyle=col[0];ctx.fillRect(x+2,top+3,w-4,h-3);ctx.fillRect(x,top,w,3.5);ctx.fillRect(x+1,GROUND-2,w-2,2);
      ctx.fillStyle=col[1];ctx.fillRect(x,top,w,0.9);ctx.fillRect(x+3,top+4,1,h-6);
      ctx.fillStyle='#d9a43a';ctx.fillRect(x+2,top+7,w-4,1.5);
      ctx.strokeStyle='#7a5a3a';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x+w/2,top+10,w/2,1.4,0,0,7);ctx.stroke();
      break;
    case 'lowbox':
      ctx.fillStyle=col[0];ctx.fillRect(x,top,w,h);ctx.fillStyle='rgba(0,0,0,0.38)';ctx.fillRect(x,top,w,h);
      ctx.fillStyle='rgba(0,0,0,0.3)';for(let i=x+2;i<x+w-1;i+=3)ctx.fillRect(i,top+2,1,h-3);
      ctx.fillStyle=col[0];ctx.fillRect(x,top,w,2);ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillRect(x,top,w,0.8);
      ctx.fillStyle='#d9a43a';ctx.fillRect(x+3,top+5,5,1);
      break;
    case 'pallets':
      ctx.fillStyle='#24180f';ctx.fillRect(x,top,w,h);
      for(let r=0;r<h-2;r+=3.5){ctx.fillStyle=r?col[0]:col[1];ctx.fillRect(x+(r%7?1:0),top+r,w-1,1.8);ctx.fillStyle='#5a4428';ctx.fillRect(x+2,top+r+1.8,2.5,1.7);ctx.fillRect(x+w/2-1,top+r+1.8,2.5,1.7);ctx.fillRect(x+w-4.5,top+r+1.8,2.5,1.7);}
      break;
    }
    if(c.vida<c.max*0.5){ctx.fillStyle='rgba(20,10,10,0.55)';ctx.fillRect(x+w*0.25,top+1,1,h*0.5);ctx.fillRect(x+w*0.25,top+h*0.5,3,1);ctx.fillRect(x+w*0.7,top,2,2);}
    if(T<c.fl){ctx.fillStyle='rgba(255,240,210,0.55)';ctx.fillRect(x,top,w,h);}
  }
}
// Encima del jugador: frente de la losa de cada túnel y la penumbra de adentro
function drawForeground(){
  if(cobLvl!==L)armarCoberturas();
  for(const t of techos){
    if(t.x>camX+VW||t.x+t.w<camX)continue;
    if(L.drawTunnelFront&&L.drawTunnelFront(t))continue; // gancho por misión
    const iy=t.y+t.th,port=t.k==='pier';
    ctx.fillStyle=port?'rgba(2,4,12,0.34)':'rgba(24,8,16,0.30)';ctx.fillRect(t.x,iy,t.w,GROUND-iy);
    const g=ctx.createLinearGradient(0,iy,0,iy+12);g.addColorStop(0,port?'rgba(0,0,0,0.45)':'rgba(20,6,10,0.45)');g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.fillRect(t.x,iy,t.w,12);
    if(port){ // farol colgado
      const lx=t.x+t.w/2,on=!((T>>3)%23===0);
      ctx.fillStyle='#1a1e26';ctx.fillRect(lx,iy,0.8,5);ctx.fillRect(lx-2,iy+5,5,2);
      if(on){ctx.fillStyle='#ffe2a0';ctx.fillRect(lx-1,iy+7,3,1.2);
        ctx.fillStyle='rgba(255,220,150,0.08)';ctx.beginPath();ctx.moveTo(lx-1,iy+8);ctx.lineTo(lx-20,GROUND);ctx.lineTo(lx+21,GROUND);ctx.lineTo(lx+2,iy+8);ctx.fill();
        ctx.fillStyle='rgba(255,220,150,0.12)';ctx.beginPath();ctx.ellipse(lx+0.5,GROUND,18,1.8,0,0,7);ctx.fill();}
    }
    dibLosa({x:t.x,y:t.y,w:t.w,roof:t});
  }
}
