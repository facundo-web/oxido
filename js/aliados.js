'use strict';
// Óxido · Prisioneros y amigos
// ================== prisioneros y amigos ==================
// Prisioneros atados: se liberan tocándolos o disparándoles a la soga. Algunos dan un premio y se van;
// otros se suman como amigos (máx. 2): pistolita de un tiro cada 2 segundos, mueren de un golpe.
function mkPris(p){return{x:p.x,y:(p.y??GROUND)-14,w:10,h:14,kind:p.k,state:'tied',t:0,join:false};}
function mkAlly(x,y){return{x,y,w:8,h:18,vx:0,vy:0,face:1,onGround:false,plat:null,cd:rand(30,120),anim:0,dist:0,lean:0,rec:0,ph:(Math.random()*600)|0};}
function freePris(pr){
  if(pr.state!=='tied')return;
  pr.state='freed';pr.t=0;rescued++;addScore(500,pr.x+5,pr.y-6);SFX.pick();
  for(let i=0;i<6;i++)parts.push({k:'p',x:pr.x+5,y:pr.y+8,vx:rand(-1.5,1.5),vy:rand(-2,-0.5),g:0.15,life:rand(20,30),maxl:30,size:1,col:'#b08a4a'});
  pr.join=pr.kind==='ally'&&allies.length+prisoners.filter(o=>o.join&&o.state==='freed').length<MAX_ALLIES;
  emit('rescue',{kind:pr.join?'ally':'prisoner'});
  if(pr.join){setBanner('¡UN AMIGO SE SUMA!',70);parts.push({k:'txt',s:'¡VAMOS!',x:pr.x+5,y:pr.y-10,life:50,maxl:50});}
  else{const k=pick(['H','S','F','R','G','E','+','A']);pickups.push({kind:k,x:pr.x,y:pr.y-4,w:10,h:10,vy:-3,life:900});
    setBanner('¡PRISIONERO LIBERADO!',60);parts.push({k:'txt',s:'¡GRACIAS!',x:pr.x+5,y:pr.y-10,life:50,maxl:50});}
}
function updPrisoners(){
  for(const pr of prisoners){
    pr.t++;
    if(pr.state==='tied'){
      if(!prisHint&&onScreen(pr,-20)){prisHint=true;setBanner('¡PRISIONERO! TOCALO PARA LIBERARLO',110);}
      if(touchAny(pr))freePris(pr);
    }else if(pr.state==='freed'){
      if(pr.t>=45){if(pr.join){const a=mkAlly(pr.x,pr.y-4);a.onGround=true;allies.push(a);pr.gone=true;}else pr.state='leave';}
    }else{pr.x-=2.2;const pb=pr.y+pr.h;pr.vy=Math.min((pr.vy||0)+0.32,6);pr.y+=pr.vy;land(pr,pb,true);if(pr.x<camX-20)pr.gone=true;}
  }
  prisoners=prisoners.filter(p=>!p.gone);
}
function killAlly(a){
  if(a.gone)return;a.gone=true;corpse(SPR.a,a.x,a.y,a.face);tone('sawtooth',400,90,0.25,0.05);
  parts.push({k:'txt',s:'¡AY!',x:a.x+4,y:a.y-6,life:40,maxl:40});setBanner('¡PERDISTE UN AMIGO!',60);
}
function updAllies(){
  allies.forEach((a,i)=>{
    if(!P.dead){const tx=P.x-P.face*(18+i*14),dx=tx-a.x;a.vx=Math.abs(dx)>6?Math.sign(dx)*Math.min(1.7,Math.abs(dx)*0.08+0.6):0;}else a.vx=0;
    let t=null,bd=170;
    for(const e of enemies){if(!hittable(e)||!onScreen(e,-4))continue;const d=Math.abs(e.x+e.w/2-a.x-4);if(d<bd){bd=d;t=e;}}
    if(t)a.face=t.x+t.w/2<a.x+4?-1:1;else if(a.vx)a.face=Math.sign(a.vx);
    const py=P.ride?P.ride.y+P.ride.h:P.y+P.h;
    if(a.onGround&&!P.dead&&py<a.y+a.h-20&&Math.abs(P.x-a.x)<50){a.vy=-6.1;a.onGround=false;}
    a.x=clamp(a.x+a.vx,camX+2,camX+W-10);
    const pb=a.y+a.h,wasAir=!a.onGround;a.vy=Math.min(a.vy+0.32,6);a.y+=a.vy;const vyA=a.vy;land(a,pb,true);
    animStep(a,wasAir,vyA);
    if(a.vx&&a.onGround)a.anim++;
    if(--a.cd<=0&&t){
      const sx=a.x+4+a.face*8,sy=a.y+9,air=t.type==='drone'||t.air;
      const ang=air?Math.atan2(t.y+t.h/2-sy,t.x+t.w/2-sx):(a.face>0?0:Math.PI);
      pbul.push({x:sx,y:sy,vx:Math.cos(ang)*5,vy:Math.sin(ang)*5,k:'b',dmg:1,life:60,ally:true});
      parts.push({k:'flash',x:sx,y:sy,life:3,maxl:3,size:3});tone('square',1100,400,0.05,0.025);a.cd=120;a.rec=1;
    }
  });
  allies=allies.filter(a=>!a.gone);
}
function drawPrisoner(pr){
  if(!onScreen(pr,20))return;
  const x=pr.x,y=pr.y,ph=(pr.x*7)|0;
  if(pr.state==='tied'){
    ctx.fillStyle='#5a3a22';ctx.fillRect(x+7,y-6,2.5,20);ctx.fillStyle='#7a5232';ctx.fillRect(x+7,y-6,2.5,1);
    // vaivén lento y, cada tanto, un forcejeo contra la soga
    const tt=(T+ph)%200,strug=tt<26,bob=Math.floor((T+ph)/36)%2;
    const dx=strug?(((tt>>2)&1)?1:-1)*0.75:0,dy=strug?((tt>>3)&1):bob;
    ctx.drawImage(SPR.a.crouch[1],q(x-2+dx),q(y-1+dy));
    ctx.fillStyle='#b08a4a';ctx.fillRect(x,y+7,10,1);ctx.fillRect(x+1,y+10,9,1);
    if(nearAny(x+5,110)&&(T>>4)%3){
      ctx.fillStyle='rgba(255,255,255,0.92)';ctx.fillRect(x-6,y-15,22,7);ctx.fillRect(x+3,y-8,2,2);
      txt('¡AYUDA!',x+5,y-14.2,4.2,'#120c18','center',false);
    }
  }else if(pr.state==='freed'){
    if(pr.t<20){const up=-Math.sin(pr.t/20*Math.PI)*8;ctx.drawImage(SPR.a.jump[0],q(x-2),q(y-4+up));}
    else{
      const uy=Math.floor((T+ph)/30)%2;
      drawRig(SPR.a,{leg:'idle',ux:0,uy},0,x-2,y-4);
      const wv=((pr.t>>3)&1);ctx.fillStyle='#e0a27a';ctx.fillRect(q(x+9),q(y-3-wv+uy),2,2);ctx.fillRect(q(x+9),q(y-1+uy),1,4);
    }
  }else{
    const n=Math.floor(pr.t*2.2/RUN_STEP)%6;
    drawRig(SPR.a,{leg:'r'+n,ux:-1,uy:RUN_BOB[n]},1,x-2,y-4);
  }
}
function drawAlly(a){
  const f=a.face>0?0:1,pose=rigPose(a,a.ph);
  drawRig(SPR.a,pose,f,a.x-3,a.y);
  const ux=pose.ux,uy=pose.uy;
  ctx.fillStyle='#2b2b33';ctx.fillRect(q((a.face>0?a.x+6:a.x-4)+ux-a.face*(a.rec||0)),q(a.y+9+uy),6,1.6);
  ctx.fillStyle='#4fa84a';ctx.fillRect(q(a.x+2.5+ux),q(a.y-4+uy+Math.sin(T/10)*0.6),3,1.5);ctx.fillRect(q(a.x+3.5+ux),q(a.y-2.5+uy+Math.sin(T/10)*0.6),1,1);
}
