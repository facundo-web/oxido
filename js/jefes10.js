'use strict';
// Óxido · Misión 10: jefe chico (EL TATÚ CAVADOR) y villano final del juego (EL CUSTODIO)
// Todo con prefijo J10_. Usa lo de mision10.js (M10_, techo, colores del templo).

const J10_sfx=(n,...a)=>{if(typeof SFX!=='undefined'&&SFX[n])SFX[n](...a);};
const J10={armado:false};
ON_START.push(()=>{J10.armado=false;});
function J10_custodioArmado(){return J10.armado;}
function J10_chips(x,y,n,cols){for(let i=0;i<n;i++)parts.push({k:'p',x:x+rand(-3,3),y,vx:rand(-1.6,1.6),vy:rand(-2.8,-0.6),g:0.17,life:rand(24,40),maxl:40,size:i%3?1:2,col:pick(cols||['#6a6252','#8a8070','#4a4438'])});}
function J10_hurtBox(box,n){for(const p of players)if(!p.dead&&overlap(hurtbox(p),box))withP(p,()=>hurtPlayer(n||1));}

// =====================================================================
// JEFE CHICO · EL TATÚ CAVADOR — la excavadora oxidada del jefe de los saqueadores
// Caparazón de bandas de chapa (como un tatú), orugas, mecha al frente, pala arriba y el saqueador en la cabina.
// · Palada: levanta la pala (tiembla) y tira piedras en arco; la sombra marca dónde caen.
// · Embestida: la mecha gira, larga humo negro y aparece una flecha en el piso; cruza la arena (saltala o subite).
// · Se entierra: se hunde, un montículo te sigue por el piso, se marca el lugar (grietas y anillo) y sale de abajo.
// Rabia al 50 %: más rápido, más piedras y el montículo corre más.
// =====================================================================
function J10_mkTatu(A){return{type:'j10Tatu',isBoss:true,A,x:A+226,y:GROUND+30,w:52,h:24,hp:120,max:120,state:'enter',t:0,mt:0,face:-1,flash:0,score:3500,
  mode:'move',cd:60,seq:0,rage:false,vx:0,vy:0,drill:0,shovel:0,mx:0,anim:0,tilt:0,touch:1,noPush:true,air:false,upd:J10_updTatu,draw:J10_drawTatu};}
function J10_rock(b,tx){
  const sx=b.x+b.w/2+b.face*18,sy=b.y-14,Tt=46,g=0.14;
  eproj.push({kind:'j10Piedra',x:sx,y:sy,vx:(tx-sx)/Tt,vy:(GROUND-3-sy-0.5*g*Tt*Tt)/Tt,g,r:2.6,t:0,tx,
    upd(o,hb){o.t++;o.vy+=o.g;o.x+=o.vx;o.y+=o.vy;
      if(hb&&overlapPt(hb,o.x,o.y,o.r)){hurtPlayer(1);o.gone=true;J10_chips(o.x,o.y,5);return;}
      if(o.y>=GROUND-3){o.gone=true;J10_sfx('m10Piedra');J10_chips(o.x,GROUND-2,6);dust(o.x,GROUND,3);}
      if(o.t>200)o.gone=true;},
    draw(o){ctx.fillStyle=`rgba(0,0,0,${0.18+0.25*Math.min(1,o.t/36)})`;ctx.beginPath();ctx.ellipse(o.tx,GROUND,4,1.2,0,0,7);ctx.fill();
      ctx.fillStyle='#6a5a44';circle(o.x,o.y,o.r);ctx.fillStyle='#8a7a60';ctx.fillRect(q(o.x-1.5),q(o.y-1.5),1.4,1.4);}});
}
function J10_updTatu(b){
  b.t++;b.mt++;b.anim++;if(b.flash>0)b.flash--;
  const A=b.A,pc=M10_pc(),ph2=b.hp<b.max*0.5,cx=b.x+b.w/2;
  if(b.state==='enter'){ // retumba bajo el piso y salta afuera rompiendo las baldosas
    if(b.t<56){shake=Math.max(shake,0.6+b.t/40);if(b.t%5===0)dust(A+252+rand(-16,16),GROUND,2);if(b.t%18===1)J10_sfx('m10Temblor');
      if(b.t===1)setBanner('¡ALGO CAVA BAJO EL PISO!',90);return;}
    if(b.t===56){b.y=GROUND-4;b.vy=-5;J10_sfx('m10Derrumbe');shake=6;J10_chips(cx,GROUND-2,16);dust(cx,GROUND,10);}
    b.vy+=0.3;b.y+=b.vy;b.tilt=-0.3*Math.sign(b.vy)*b.face;
    if(b.y>=GROUND-b.h&&b.vy>0){b.y=GROUND-b.h;b.tilt=0;b.state='intro';b.t=0;b.hp=0;shake=4;dust(cx,GROUND,8);J10_sfx('m10Motor');}
    return;}
  if(b.state==='intro'){bossIntro(b,50);b.face=pc.x<cx?-1:1;if(b.state==='fight'){b.cd=40;b.mode='move';}return;}
  if(b.state==='dying'){
    b.drill*=0.95;b.shovel*=0.95;b.y=GROUND-b.h;
    if(b.t%7===0)explodeFx(b.x+rand(4,b.w-4),b.y+rand(0,b.h),rand(7,12));
    if(b.t%3===0)parts.push({k:'smoke',col:'50,40,36',x:b.x+b.w/2-b.face*20,y:b.y-6,vx:rand(-0.3,0.3),vy:rand(-1,-0.4),life:40,maxl:40,size:rand(2,3.5)});
    if(b.t===60){J10_sfx('m10Grito');setBanner('¡EL SAQUEADOR SALE CORRIENDO!',80);}
    if(b.t>=130)bossDone(b);
    return;}
  if(ph2&&!b.rage){b.rage=true;setBanner('¡EL TATÚ RECALIENTA!',80);J10_sfx('m10Motor');shake=Math.max(shake,4);}
  if(T%3===0&&(ph2||b.mode==='cargaT'))parts.push({k:'smoke',col:ph2?'40,34,30':'70,64,58',x:b.x+b.w/2-b.face*20,y:b.y-10,vx:-b.face*0.3+rand(-0.2,0.2),vy:rand(-0.9,-0.4),life:30,maxl:30,size:rand(1.4,2.6)});
  if(T%24===0&&b.mode!=='bajo')J10_sfx('m10Motor');
  b.shovel*=b.mode==='palaT'?1:0.9;
  switch(b.mode){
  case 'move':{
    b.face=pc.x<cx?-1:1;b.drill*=0.9;
    const want=pc.x<A+W/2?pc.x+100:pc.x-100-b.w,tx=clamp(want,A+8,A+W-b.w-8),sp=ph2?1.1:0.7;
    b.x+=clamp(tx-b.x,-sp,sp);
    if(--b.cd<=0){
      const s=ph2?['carga','pala','cava','pala','carga']:['pala','carga','pala','cava'];
      const a=s[b.seq++%s.length];b.mt=0;
      if(a==='pala'){b.mode='palaT';J10_sfx('m10Pala');}
      else if(a==='carga'){b.mode='cargaT';J10_sfx('m10Taladro');}
      else{b.mode='cavaT';J10_sfx('m10Taladro');}
    }
    break;}
  case 'palaT':{const tel=ph2?20:30;b.shovel=Math.min(1,b.mt/tel);b.face=pc.x<cx?-1:1;
    if(b.mt%6===0)J10_chips(b.x+b.w/2+b.face*16,b.y-12,1,['#6a5a44','#8a7a60']);
    if(b.mt>=tel){const n=ph2?5:3;for(let i=0;i<n;i++)J10_rock(b,clamp(pc.x+(i-(n-1)/2)*24+rand(-6,6),A+10,A+W-10));
      J10_sfx('m10Pala');b.mode='rec';b.mt=0;b.shovel=1;}
    break;}
  case 'cargaT':{const tel=ph2?26:40;b.drill=Math.min(1,b.mt/tel);
    if(b.mt%8===0)J10_sfx('m10Taladro');
    if(b.mt>=tel){b.mode='carga';b.mt=0;b.vx=b.face*(ph2?3.8:3);J10_sfx('m10Motor');}
    break;}
  case 'carga':
    b.x+=b.vx;b.drill=1;if(b.mt%3===0)dust(b.x+(b.vx>0?0:b.w),GROUND,2);
    if(b.x<A+6||b.x>A+W-b.w-6){b.x=clamp(b.x,A+6,A+W-b.w-6);b.mode='frena';b.mt=0;shake=Math.max(shake,4);J10_sfx('m10Golpe');
      for(let i=0;i<6;i++)parts.push({k:'p',x:b.vx>0?b.x+b.w:b.x,y:GROUND-4,vx:-Math.sign(b.vx)*rand(0.5,2),vy:rand(-2,-0.5),g:0.15,life:20,maxl:20,size:1,col:pick(['#ffd27a','#fff'])});}
    break;
  case 'frena':b.drill*=0.92;if(b.mt>=26){b.face=-b.face;b.mode='rec';b.mt=0;}break;
  case 'cavaT':{b.drill=Math.min(1,b.mt/16);b.tilt=b.face*0.35*Math.min(1,b.mt/16);
    if(b.mt%3===0)dust(cx+b.face*20,GROUND,2);
    if(b.mt>=16)b.y=Math.min(GROUND+4,b.y+1.2);
    if(b.y>=GROUND+4){b.mode='bajo';b.mt=0;b.mx=cx;b.tilt=0;J10_sfx('m10Derrumbe');}
    break;}
  case 'bajo':{ // montículo que te sigue
    b.y=GROUND+30;const d=pc.x-b.mx,sp=ph2?2:1.5;b.mx=clamp(b.mx+clamp(d,-sp,sp),A+20,A+W-20);
    if(b.mt%4===0){dust(b.mx,GROUND,1);if(b.mt%12===0)J10_sfx('m10Rumor');}
    if(b.mt>=(ph2?70:90)||(Math.abs(d)<4&&b.mt>30)){b.mode='asomaT';b.mt=0;J10_sfx('m10Click');}
    break;}
  case 'asomaT':{b.y=GROUND+30;const tel=ph2?26:34;
    if(b.mt%4===0)J10_chips(b.mx+rand(-8,8),GROUND,1);shake=Math.max(shake,1);
    if(b.mt>=tel){b.mode='salto';b.mt=0;b.x=clamp(b.mx-b.w/2,A+4,A+W-b.w-4);b.y=GROUND-8;b.vy=-5.6;b.face=pc.x<b.mx?-1:1;
      J10_sfx('m10Derrumbe');shake=5;J10_chips(b.mx,GROUND-2,12);dust(b.mx,GROUND,8);
      J10_hurtBox({x:b.mx-16,y:GROUND-40,w:32,h:40},1);}
    break;}
  case 'salto':b.vy+=0.32;b.y+=b.vy;b.tilt=-0.25*b.face*Math.sign(b.vy);
    if(b.y>=GROUND-b.h&&b.vy>0){b.y=GROUND-b.h;b.tilt=0;b.mode='rec';b.mt=0;shake=Math.max(shake,3);dust(b.x+b.w/2,GROUND,6);J10_sfx('m10Golpe');}
    break;
  case 'rec':b.drill*=0.9;if(b.mt>=(ph2?24:40)){b.mode='move';b.cd=ph2?34:54;}break;
  }
  if(b.mode!=='bajo'&&b.mode!=='asomaT')b.x=clamp(b.x,A+2,A+W-b.w-2);
  if(b.y<GROUND)bossContact(b);
}
function J10_drawTatu(b){
  const fl=b.flash>0||(b.state==='dying'&&(T>>2)%2),C=c=>fl?'#fff':c,ph2=b.hp<b.max*0.5||b.state==='dying';
  const A=b.A;
  // abajo del piso: grietas que avanzan, montículo y aviso
  if(b.state==='enter'&&b.t<56){const x=A+252,k=b.t/56;ctx.strokeStyle='#1a1610';ctx.lineWidth=0.8;ctx.beginPath();
    for(let i=0;i<4;i++){const a=i*1.6;ctx.moveTo(x,GROUND);ctx.lineTo(x+Math.cos(a)*14*k,GROUND-0.5+Math.abs(Math.sin(a))*1.4);}ctx.stroke();return;}
  if(b.mode==='bajo'||b.mode==='asomaT'){
    const x=b.mx,tele=b.mode==='asomaT';
    ctx.fillStyle='#4a3a28';ctx.beginPath();ctx.ellipse(x,GROUND,12,tele?4:3,0,Math.PI,0);ctx.fill();
    ctx.fillStyle='#6a5a44';for(let i=-2;i<=2;i++)ctx.fillRect(x+i*4+((b.anim>>2)%2),GROUND-2.5+Math.abs(i)*0.6,1.6,1.2);
    if(tele){const on=(T>>2)%2,k=b.mt/(b.rage?26:34);ctx.strokeStyle=`rgba(255,140,50,${0.5+0.4*on})`;ctx.lineWidth=0.8;ctx.beginPath();ctx.ellipse(x,GROUND,20-k*8,3,0,0,7);ctx.stroke();
      ctx.fillStyle=`rgba(255,140,50,${0.08+0.12*k})`;ctx.fillRect(x-16,GROUND-40,32,40);}
    return;}
  if(b.y>=GROUND)return;
  ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.ellipse(b.x+b.w/2,GROUND,b.w*0.55,1.6,0,0,7);ctx.fill();
  // flecha de embestida en el piso
  if(b.mode==='cargaT'&&(T>>2)%2){const d=b.face,x0=d>0?b.x+b.w+6:b.x-6;ctx.fillStyle='rgba(255,90,40,0.8)';
    for(let i=0;i<3;i++){const x=x0+d*i*12;ctx.beginPath();ctx.moveTo(x+d*7,GROUND-3);ctx.lineTo(x,GROUND-6);ctx.lineTo(x,GROUND);ctx.fill();}}
  ctx.save();ctx.translate(q(b.x+b.w/2),q(b.y+b.h));if(b.tilt)ctx.rotate(b.tilt);if(b.face<0)ctx.scale(-1,1);
  const rust=['#8a4a2a','#a85a32','#7a3e24','#9a5230','#6a3620'];
  // orugas
  ctx.fillStyle=C('#2a2622');ctx.beginPath();ctx.ellipse(-4,-4,24,4.5,0,0,7);ctx.fill();
  ctx.fillStyle=C('#4a4440');const tr=(b.mode==='carga'||b.mode==='move')?(b.anim>>1)%4:0;for(let i=-26;i<20;i+=4)ctx.fillRect(i+tr,-8.2,2,1.2);
  for(const wx of[-20,-10,0,10]){ctx.fillStyle=C('#5a524a');circle(wx,-4,3);ctx.fillStyle=C('#2a2622');circle(wx,-4,1);}
  // caparazón de bandas
  for(let i=0;i<5;i++){const x0=-24+i*8;ctx.fillStyle=C(rust[i]);ctx.beginPath();ctx.ellipse(x0+4,-12,5.2,11-Math.abs(i-2)*1.2,0,Math.PI,0);ctx.fill();ctx.fillRect(x0,-12,8.4,4);
    if(!fl){ctx.fillStyle='#c87a42';ctx.fillRect(x0+1,-21+Math.abs(i-2)*1.2,6,0.8);ctx.fillStyle='#3a2014';ctx.fillRect(x0+3.5,-19+Math.abs(i-2)*1.2,0.9,0.9);ctx.fillRect(x0+3.5,-11,0.9,0.9);}}
  if(!fl){ctx.fillStyle='rgba(60,30,18,0.6)';ctx.fillRect(-14,-18,3,2);ctx.fillRect(4,-16,4,2);ctx.fillStyle='#5a7a5a';ctx.fillRect(-6,-20,2,1);}
  // caño de escape atrás
  ctx.fillStyle=C('#3a3430');ctx.fillRect(-26,-24,3,10);ctx.fillStyle=C('#1a1614');ctx.fillRect(-26.5,-25,4,1.5);
  // cabina con el saqueador (antiparras y pañuelo)
  ctx.fillStyle=C('#5a3a22');ctx.fillRect(-6,-28,12,8);ctx.fillStyle=C('#1a1614');ctx.fillRect(-4,-27,8,4);
  if(b.state!=='dying'||b.t<60){ctx.fillStyle=C('#c89a70');ctx.fillRect(-1,-31,5,4);ctx.fillStyle=C('#2a2a30');ctx.fillRect(-1,-30,5,1.2);
    ctx.fillStyle=C(ph2?'#ffd27a':'#7ad8ff');ctx.fillRect(2.4,-30,1,1);ctx.fillStyle=C('#b02a20');ctx.fillRect(-1,-27.6,5,1.4);ctx.fillStyle=C('#4a3a28');ctx.fillRect(-1.5,-32.5,6,1.6);}
  // pala arriba (se levanta para la palada)
  const sa=-0.2-b.shovel*1.1+(b.mode==='palaT'?Math.sin(T*1.4)*0.05:0);
  ctx.save();ctx.translate(8,-22);ctx.rotate(sa);ctx.fillStyle=C('#4a4440');ctx.fillRect(0,-1.2,16,2.4);
  ctx.fillStyle=C('#7a6a50');ctx.beginPath();ctx.moveTo(15,-4);ctx.lineTo(22,-4);ctx.lineTo(21,3);ctx.lineTo(15,2);ctx.fill();
  if(b.shovel>0.3){ctx.fillStyle='#6a5a44';ctx.fillRect(16,-6,5,2.4);}ctx.restore();
  // mecha al frente: cono que gira
  ctx.fillStyle=C('#5a524a');ctx.fillRect(18,-14,4,8);
  const dr=b.drill,sp=(T*dr*0.9)%3;
  ctx.fillStyle=C(dr>0.5&&(T>>1)%2?'#c8c0b0':'#8a8478');ctx.beginPath();ctx.moveTo(22,-15);ctx.lineTo(33+dr*2,-10);ctx.lineTo(22,-5);ctx.fill();
  if(!fl){ctx.strokeStyle='#3a3430';ctx.lineWidth=0.7;ctx.beginPath();for(let i=0;i<4;i++){const x=23+i*3+sp;ctx.moveTo(x,-14+i*1.2+sp*0.4);ctx.lineTo(x+1.6,-6-i*1.2-sp*0.4);}ctx.stroke();
    if(dr>0.6){ctx.fillStyle='rgba(255,210,120,0.5)';circle(34,-10,2+Math.random());}}
  ctx.restore();
  // el saqueador que se escapa
  if(b.state==='dying'&&b.t>=60){const k=b.t-60,x=b.x+b.w/2-k*2.2,y=GROUND-10-Math.max(0,12-Math.abs(k-6)*2);
    ctx.fillStyle='#c89a70';ctx.fillRect(x,y-4,4,4);ctx.fillStyle='#b02a20';ctx.fillRect(x,y,4,2);ctx.fillStyle='#4a3a28';ctx.fillRect(x,y+2,4,5);
    ctx.fillStyle='#2a2a30';ctx.fillRect(x+((k>>2)%2),y+7,1.4,3);ctx.fillRect(x+2.6-((k>>2)%2),y+7,1.4,3);}
}

// =====================================================================
// VILLANO FINAL · EL CUSTODIO — guardián de piedra y oro que se arma con los bloques del altar
// Despierta: los bloques del piso vuelan a su lugar uno por uno, se prenden las vetas de oro y los ojos.
// FASE 1 (piedra):  · Puño: un puño sale volando, se para arriba tuyo con su sombra en el piso y cae: onda a los dos lados (saltala).
//                   · Derrumbe: pisa fuerte; sombras y polvo marcan dónde caen bloques del techo.
// FASE 2 (oro, al 66 %): se le cae la cáscara de piedra. Puños más rápidos y el
//                   · Rayo: se agacha, la gema del pecho brilla y una línea punteada marca la altura: agachate o subite a un escalón.
// FASE 3 (furia, al 33 %): se desarma. Un núcleo de oro flota con los bloques girando alrededor (le pegás al núcleo):
//                   · Bloques que vuelan: cada bloque brilla, marca una línea hacia vos y sale disparado.
//                   · Derrumbe más seguido y el núcleo baja a tirar el rayo (ahí queda bajito y expuesto).
// =====================================================================
// partes: lugar en el cuerpo (ox,oy desde el pie, centro en cx) y dónde están tiradas en el piso (sx desde A)
const J10_PARTS=[
  {n:'pieI',ox:-13,oy:-22,w:10,h:22,sx:110},{n:'pieD',ox:3,oy:-22,w:10,h:22,sx:132},
  {n:'cadera',ox:-15,oy:-30,w:30,h:8,sx:156},{n:'torso',ox:-17,oy:-54,w:34,h:24,sx:190},
  {n:'hombroI',ox:-27,oy:-56,w:11,h:10,sx:96},{n:'hombroD',ox:16,oy:-56,w:11,h:10,sx:230},
  {n:'brazoI',ox:-26,oy:-46,w:8,h:12,sx:244},{n:'brazoD',ox:18,oy:-46,w:8,h:12,sx:262},
  {n:'cabeza',ox:-9,oy:-72,w:18,h:16,sx:212}];
const J10_PH=[0.66,0.33];
function J10_mkCust(A){const cx=A+250;J10.armado=true;
  return{type:'j10Cust',isBoss:true,A,cx,x:cx-17,y:GROUND-72,w:34,h:72,hp:0,max:400,state:'enter',t:0,mt:0,face:-1,flash:0,score:15000,
    mode:'idle',cd:60,seq:0,phase:0,kneel:0,stomp:0,glow:0,told:0,beam:null,rain:[],
    fists:[J10_fist(-1),J10_fist(1)],orb:[],core:{x:cx,y:GROUND-42},touch:1,noPush:true,upd:J10_updCust,draw:J10_drawCust};}
function J10_fist(side){return{side,st:'rest',x:0,y:0,tx:0,t:0,vy:0};}
function J10_fistRest(b,f){const k=b.kneel*24;return{x:b.cx+(f.side<0?-22:22),y:GROUND-28+k};}
// onda de piedra por el piso (saltala)
function J10_wave(x,dir,sp,A){
  eproj.push({kind:'j10Onda',x,y:GROUND-2,dir,sp,A,t:0,
    upd(o){o.t++;o.x+=o.dir*o.sp;if(o.x<o.A-8||o.x>o.A+W+8||o.t>200){o.gone=true;return;}
      if(o.t%4===0)dust(o.x,GROUND,1);
      for(const p of players)if(!p.dead){const hb=hurtbox(p);if(hb.y+hb.h>=GROUND-4&&o.x>hb.x-2&&o.x<hb.x+hb.w+2)withP(p,()=>hurtPlayer(1));}},
    draw(o){const h=5+Math.sin(o.t/2)*1;ctx.fillStyle='rgba(232,184,74,0.35)';ctx.beginPath();ctx.ellipse(o.x,GROUND-h/2,4,h/2+1,0,0,7);ctx.fill();
      ctx.fillStyle='#8a8070';ctx.beginPath();ctx.moveTo(o.x-4,GROUND);ctx.lineTo(o.x,GROUND-h);ctx.lineTo(o.x+4,GROUND);ctx.fill();
      ctx.fillStyle='#e8b84a';ctx.fillRect(q(o.x-0.5),q(GROUND-h),1,1.5);}});
}
// bloque que cae del techo (la sombra la marca la lista b.rain)
function J10_fall(x){
  eproj.push({kind:'j10Bloque',x,y:M10_CEIL,vy:1,t:0,
    upd(o){o.t++;o.vy=Math.min(o.vy+0.3,7);o.y+=o.vy;
      J10_hurtBox({x:o.x-6,y:o.y-6,w:12,h:12},1);
      if(o.y>=GROUND-6){o.gone=true;J10_sfx('m10Piedra');J10_chips(o.x,GROUND-4,7);dust(o.x,GROUND,4);shake=Math.max(shake,2);}},
    draw(o){ctx.fillStyle='#6a6252';ctx.fillRect(q(o.x-6),q(o.y-6),12,12);ctx.fillStyle='#8a8070';ctx.fillRect(q(o.x-6),q(o.y-6),12,1);
      ctx.fillStyle='#e8b84a';ctx.fillRect(q(o.x-4),q(o.y-2),8,0.8);}});
}
function J10_startRain(b,n){
  const A=b.A,pc=M10_pc(),xs=[];
  for(let i=0;i<n;i++){let x,tries=0;do{x=clamp(pc.x+rand(-70,70)+(i===0?0:0),A+14,A+226);tries++;}while(tries<12&&xs.some(o=>Math.abs(o-x)<26));xs.push(x);}
  xs[0]=clamp(pc.x+rand(-6,6),A+14,A+226);
  for(const x of xs)b.rain.push({x,t:b.phase===2?38:46});
  J10_sfx('m10Temblor');
}
function J10_core(b){return{x:b.core.x-9,y:b.core.y-9,w:18,h:18};}
function J10_setBox(b){
  if(b.phase===2){const c=J10_core(b);b.x=c.x;b.y=c.y;b.w=c.w;b.h=c.h;}
  else{const k=b.kneel*24;b.x=b.cx-17;b.y=GROUND-72+k;b.w=34;b.h=72-k;}
}
function J10_beamY(b){return GROUND-17;}
function J10_gemPos(b){return b.phase===2?{x:b.core.x,y:b.core.y}:{x:b.cx-6,y:GROUND-42+b.kneel*25};}
function J10_updCust(b){
  b.t++;b.mt++;if(b.flash>0)b.flash--;
  const A=b.A,pc=M10_pc();
  // lluvia de bloques: sombras que crecen y caen
  for(const r of b.rain){r.t--;if(r.t%4===0)M10_dustFall(r.x,1);if(r.t<=0){J10_fall(r.x);r.gone=true;}}
  b.rain=b.rain.filter(r=>!r.gone);
  J10_updFists(b);
  if(b.phase===2)J10_updOrb(b);
  if(b.state==='enter'){ // los bloques vuelan a su lugar
    if(b.t===1){setBanner('¡EL ALTAR SE MUEVE!',100);J10_sfx('m10Temblor');}
    shake=Math.max(shake,0.8);
    if(b.t%10===0&&b.t<=J10_PARTS.length*10)J10_sfx('m10Ensamble');
    if(b.t>=J10_PARTS.length*10+30){b.state='intro';b.t=0;b.hp=0;}
    J10_setBox(b);return;}
  if(b.state==='intro'){
    const dur=90;
    if(b.t===1){setBanner(b.name,140);playMusic(SONGS.m10Jefe?'m10Jefe':'boss');shake=Math.max(shake,6);J10_sfx('m10Voz');}
    b.glow=Math.min(1,b.t/40);
    b.hp=Math.min(b.max,b.max*b.t/dur);
    if(b.t%4===0&&b.hp<b.max)tone('square',300+b.hp/b.max*500,300+b.hp/b.max*500,0.03,0.02);
    if(b.t>=dur){b.hp=b.max;b.state='fight';b.mt=0;b.cd=50;b.mode='idle';}
    J10_setBox(b);return;}
  if(b.state==='trans'){ // cambio de fase: no se le puede pegar
    b.kneel*=0.9;shake=Math.max(shake,2.5);
    if(b.t%6===0)J10_chips(b.cx+rand(-16,16),GROUND-rand(20,70),2,b.phase===1?['#6a6252','#8a8070']:['#c8963a','#e8b84a','#6a6252']);
    if(b.t%20===0)J10_sfx('m10Voz');
    if(b.phase===2&&b.t===40){J10_sfx('m10Crash');explodeFx(b.cx,GROUND-40,24);J10_makeOrb(b);}
    if(b.phase===2)b.core.y+=((GROUND-50)-b.core.y)*0.05;
    if(b.t>=90){b.state='fight';b.mt=0;b.cd=40;b.mode='idle';b.seq=0;}
    J10_setBox(b);return;}
  if(b.state==='dying'){
    if(b.t===1){setBanner('¡EL CUSTODIO SE APAGA!',120);J10_sfx('m10Voz');b.rain=[];b.beam=null;}
    b.glow=Math.max(0,1-b.t/160);b.kneel=Math.min(1,b.kneel+0.02);
    if(b.t%7===0)explodeFx(b.cx+rand(-24,24),GROUND-rand(6,80),rand(7,14));
    if(b.t%4===0)J10_chips(b.cx+rand(-20,20),GROUND-rand(10,70),2,['#e8b84a','#ffd27a','#6a6252']);
    for(const o of b.orb){o.vy=(o.vy||0)+0.25;o.y=Math.min(GROUND-5,o.y+o.vy);}
    if(b.t===150){shake=10;SFX.bigboom();for(let i=0;i<30;i++)parts.push({k:'smoke',col:pick(['232,184,74','200,170,120','120,100,70']),x:b.cx+rand(-30,30),y:GROUND-rand(4,90),vx:rand(-2,1),vy:rand(-1.4,-0.2),life:rand(40,70),maxl:70,size:rand(2,5)});}
    if(b.t>=200)bossDone(b);
    return;}
  // --- pelea ---
  const fr=b.hp/b.max;
  if(b.phase<2&&fr<J10_PH[b.phase]){
    b.phase++;b.state='trans';b.t=0;b.mode='idle';b.beam=null;b.kneel=0;for(const f of b.fists)if(f.st!=='rest')f.st='back';
    if(b.phase===1){setBanner('¡EL CUSTODIO SE ENCIENDE!',100);J10_sfx('m10Crash');shake=7;J10_chips(b.cx,GROUND-50,24,['#6a6252','#8a8070','#4a4438']);}
    else{setBanner('¡EL CUSTODIO SE DESARMA!',100);shake=8;b.core={x:b.cx,y:GROUND-42};}
    J10_setBox(b);return;}
  b.stomp*=0.85;
  switch(b.mode){
  case 'idle':
    b.kneel*=0.85;
    if(b.phase===2){b.core.x+=((b.A+225+Math.sin(b.t/90)*45)-b.core.x)*0.03;b.core.y+=((GROUND-46+Math.sin(b.t/40)*6)-b.core.y)*0.05;}
    if(--b.cd<=0){
      const S=[['puno','lluvia','puno','puno','lluvia'],['puno','rayo','lluvia','puno','rayo','puno'],['vuelo','lluvia','vuelo','rayo','vuelo']][b.phase];
      const a=S[b.seq++%S.length];b.mt=0;
      if(a==='puno'){const f=b.fists.find(f=>f.st==='rest');if(f){J10_launchFist(b,f);b.mode='puno';}else b.cd=10;}
      else if(a==='lluvia'){b.mode='lluviaT';}
      else if(a==='rayo'){b.mode='rayoT';J10_sfx('m10Rayo');if(b.told<1){b.told=1;setBanner('¡AGACHATE O SUBITE!',90);}}
      else if(a==='vuelo'){const o=b.orb.find(o=>o.st==='orb');if(o){J10_aimOrb(b,o);if(b.hp<b.max*0.18){const o2=b.orb.find(q=>q.st==='orb');if(o2){J10_aimOrb(b,o2);o2.t=-18;}}b.mode='vuelo';}else b.cd=10;}
    }
    break;
  case 'puno':
    // en fase 2 sale el otro puño enseguida
    if(b.phase>=1&&b.mt===28){const f=b.fists.find(f=>f.st==='rest');if(f)J10_launchFist(b,f);}
    if(b.mt>40&&b.fists.every(f=>f.st==='rest'||f.st==='back')){b.mode='idle';b.cd=b.phase?36:52;}
    break;
  case 'lluviaT':
    b.stomp=Math.min(1,b.mt/14);
    if(b.mt===16){shake=Math.max(shake,5);J10_sfx('m10Golpe');dust(b.cx-10,GROUND,6);J10_startRain(b,[3,4,5][b.phase]);}
    if(b.mt>=40){b.mode='idle';b.cd=b.phase===2?40:56;}
    break;
  case 'rayoT':{const tel=b.phase===2?36:44;
    if(b.phase===2){b.core.y+=((GROUND-17)-b.core.y)*0.12;}else b.kneel=Math.min(1,b.kneel+0.06);
    b.glow=1;if(b.mt%8===0)J10_sfx('m10Click');
    if(b.mt>=tel){b.mode='rayo';b.mt=0;J10_sfx('m10RayoSale');b.beam={t:0};}
    break;}
  case 'rayo':{
    const g=J10_gemPos(b),y=J10_beamY(b);b.beam.t++;
    J10_hurtBox({x:A,y:y-2.5,w:g.x-A,h:4.5},1);
    if(b.mt%3===0)parts.push({k:'p',x:A+rand(0,g.x-A),y,vx:rand(-0.5,0.5),vy:rand(-1,0.3),g:0.05,life:14,maxl:14,size:1,col:pick(['#fff3c0','#ffd23a'])});
    if(b.mt>=28){b.beam=null;b.mode='rec';b.mt=0;}
    break;}
  case 'vuelo':if(b.mt>30&&b.orb.every(o=>o.st==='orb')){b.mode='idle';b.cd=34;}break;
  case 'rec':b.kneel*=0.9;if(b.phase===2)b.core.y+=((GROUND-46)-b.core.y)*0.02;
    if(b.mt>=(b.phase===2?60:36)){b.mode='idle';b.cd=b.phase?30:46;}
    break;
  }
  J10_setBox(b);
  bossContact(b);
}
function J10_launchFist(b,f){const r=J10_fistRest(b,f);f.x=r.x;f.y=r.y;f.st='up';f.t=0;f.tx=M10_pc().x;J10_sfx('m10Puno');}
function J10_updFists(b){
  const A=b.A,fast=b.phase>=1;
  for(const f of b.fists){
    if(f.st==='rest')continue;
    f.t++;const pc=M10_pc();
    if(f.st==='up'){f.y+=(44-f.y)*0.12;f.x+=(f.tx-f.x)*0.08;if(f.t>=18){f.st='hover';f.t=0;}}
    else if(f.st==='hover'){const tel=fast?30:42;if(f.t<tel*0.6)f.tx=clamp(pc.x,A+16,A+226);
      f.x+=(f.tx-f.x)*0.18;f.y=44+Math.sin(f.t/3)*1.2;
      if(f.t%6===0)J10_sfx('m10Click');
      if(f.t>=tel){f.st='drop';f.t=0;f.vy=2;}}
    else if(f.st==='drop'){f.vy=Math.min(f.vy+0.7,9);f.y+=f.vy;
      J10_hurtBox({x:f.x-7,y:f.y-6,w:14,h:12},1);
      if(f.y>=GROUND-6){f.y=GROUND-6;f.st='stuck';f.t=0;shake=Math.max(shake,6);J10_sfx('m10Golpe');dust(f.x,GROUND,8);J10_chips(f.x,GROUND-2,8);
        J10_wave(f.x-8,-1,fast?2.4:2,A);J10_wave(f.x+8,1,fast?2.4:2,A);}}
    else if(f.st==='stuck'){if(f.t>=(fast?18:30)){f.st='back';f.t=0;}}
    else if(f.st==='back'){const r=J10_fistRest(b,f);f.x+=(r.x-f.x)*0.14;f.y+=(r.y-f.y)*0.14;if(f.t>=28||Math.hypot(r.x-f.x,r.y-f.y)<1){f.st='rest';}}
  }
}
// fase 3: bloques que giran alrededor del núcleo
function J10_makeOrb(b){b.orb=[];for(let i=0;i<6;i++)b.orb.push({i,st:'orb',x:b.cx,y:GROUND-40,tx:0,ty:0,vx:0,vy:0,t:0,w:i%2?10:12});for(const f of b.fists)f.st='gone';}
function J10_orbPos(b,o){const a=b.t*0.03+o.i/6*Math.PI*2;return{x:b.core.x+Math.cos(a)*26,y:b.core.y+Math.sin(a)*16};}
function J10_aimOrb(b,o){o.st='aim';o.t=0;const pc=M10_pc();o.tx=pc.x;o.ty=pc.y;J10_sfx('m10Click');}
function J10_updOrb(b){
  for(const o of b.orb){
    if(b.state==='dying')continue;
    if(o.st==='orb'){const p=J10_orbPos(b,o);o.x+=(p.x-o.x)*0.2;o.y+=(p.y-o.y)*0.2;continue;}
    o.t++;
    if(o.st==='aim'){const p=J10_orbPos(b,o);o.x+=(p.x-o.x)*0.2;o.y+=(p.y-o.y)*0.2;
      if(o.t<12){const pc=M10_pc();o.tx=pc.x;o.ty=pc.y;}
      if(o.t>=30){o.st='dash';o.t=0;const a=Math.atan2(o.ty-o.y,o.tx-o.x);o.vx=Math.cos(a)*4.6;o.vy=Math.sin(a)*4.6;J10_sfx('m10Puno');}}
    else if(o.st==='dash'){o.x+=o.vx;o.y+=o.vy;
      J10_hurtBox({x:o.x-o.w/2,y:o.y-o.w/2,w:o.w,h:o.w},1);
      if(o.y>=GROUND-o.w/2||o.x<b.A+4||o.x>b.A+W-4||o.t>90){o.y=Math.min(o.y,GROUND-o.w/2);o.st='crash';o.t=0;shake=Math.max(shake,3);J10_sfx('m10Piedra');J10_chips(o.x,o.y,6);dust(o.x,GROUND,3);}}
    else if(o.st==='crash'){if(o.t>=14){o.st='back';o.t=0;}}
    else if(o.st==='back'){const p=J10_orbPos(b,o);o.x+=(p.x-o.x)*0.1;o.y+=(p.y-o.y)*0.1;if(o.t>=36)o.st='orb';}
  }
}
// ---------- dibujo ----------
function J10_drawCust(b){
  const fl=b.flash>0,ph=b.phase,dy=b.state==='dying',A=b.A;
  const gold=ph>=1&&!(b.state==='trans'&&ph===1&&b.t<40);
  const S=gold?{b:'#b88a3a',l:'#e8c060',d:'#7a5a22'}:{b:'#7a7262',l:'#9a927e',d:'#4e4a3c'};
  const C=c=>fl?'#fff':c,glow=b.glow*(dy?Math.max(0,1-b.t/160):1),pulse=0.6+0.4*Math.sin(T/8);
  // sombras de la lluvia
  for(const r of b.rain){const k=1-r.t/46;ctx.fillStyle=`rgba(0,0,0,${0.2+0.35*k})`;ctx.beginPath();ctx.ellipse(r.x,GROUND,3+k*5,1.4,0,0,7);ctx.fill();
    if((T>>2)%2){ctx.strokeStyle='rgba(255,140,50,0.6)';ctx.lineWidth=0.6;ctx.beginPath();ctx.ellipse(r.x,GROUND,9-k*3,2,0,0,7);ctx.stroke();}}
  // rayo y su aviso
  if(b.mode==='rayoT'&&b.state==='fight'){const g=J10_gemPos(b),y=J10_beamY(b),on=(T>>2)%2;
    ctx.fillStyle=`rgba(255,220,120,${0.25+0.3*on})`;for(let x=A+2;x<g.x-6;x+=6)ctx.fillRect(x,y-0.4,3,0.8);
    ctx.fillStyle=`rgba(255,210,100,${0.08+0.06*on})`;ctx.fillRect(A,y-3,g.x-A,6);}
  if(b.beam&&b.mode==='rayo'){const g=J10_gemPos(b),y=J10_beamY(b),w=2.2+Math.sin(T*1.3)*0.6;
    ctx.fillStyle='rgba(255,200,90,0.35)';ctx.fillRect(A,y-w-2,g.x-A,w*2+4);ctx.fillStyle='#ffd23a';ctx.fillRect(A,y-w,g.x-A,w*2);ctx.fillStyle='#fff8d8';ctx.fillRect(A,y-0.7,g.x-A,1.4);
    ctx.fillStyle='rgba(255,240,190,0.7)';circle(g.x,g.y,5+Math.random()*2);}
  if(b.state==='enter'){J10_drawAssembly(b,S,C);return;}
  if(ph===2||(b.state==='trans'&&ph===2&&b.t>=40)){J10_drawCore(b,C,glow,pulse);J10_drawOrbs(b);J10_drawFists(b,S,C,glow);return;}
  J10_drawBody(b,S,C,glow,pulse,gold);
  J10_drawFists(b,S,C,glow);
}
function J10_blockAt(x,y,w,h,S,C,vein){
  ctx.fillStyle=C(S.b);ctx.fillRect(q(x),q(y),w,h);ctx.fillStyle=C(S.l);ctx.fillRect(q(x),q(y),w,1);ctx.fillStyle=C(S.d);ctx.fillRect(q(x+w-1),q(y),1,h);ctx.fillRect(q(x),q(y+h-1),w,1);
  if(vein>0){ctx.fillStyle=`rgba(255,200,90,${vein})`;ctx.fillRect(q(x+2),q(y+h*0.45),w-4,0.8);}
}
function J10_partRect(b,p){
  const k=b.kneel*24,leg=p.n==='pieI'||p.n==='pieD';
  if(leg){const h=p.h-k*0.9;return{x:b.cx+p.ox+(p.n==='pieI'?-k*0.25:k*0.25),y:GROUND-Math.max(2,h),w:p.w,h:Math.max(2,h)};}
  return{x:b.cx+p.ox,y:GROUND+p.oy+k,w:p.w,h:p.h};
}
function J10_drawBody(b,S,C,glow,pulse,gold){
  const vein=0.3+0.5*glow*pulse,stomp=b.stomp;
  for(const p of J10_PARTS){if(p.n==='cabeza')continue;
    const r=J10_partRect(b,p);let y=r.y;if(p.n==='pieI')y-=stomp*6;
    if((p.n==='brazoI'&&b.fists[0].st!=='rest')||(p.n==='brazoD'&&b.fists[1].st!=='rest')){J10_blockAt(r.x,y,r.w,r.h*0.6,S,C,vein);continue;}
    J10_blockAt(r.x,y,r.w,r.h,S,C,vein);}
  // gema del pecho
  const g=J10_gemPos(b),gc=b.mode==='rayoT'||b.mode==='rayo';
  ctx.fillStyle=C('#2a2016');circle(g.x,g.y,4.4);ctx.fillStyle=C(gc&&(T>>1)%2?'#fff3c0':'#c8402a');circle(g.x,g.y,3.2);
  if(gc||glow>0.5){ctx.fillStyle=`rgba(255,200,90,${gc?0.45:0.2*glow})`;circle(g.x,g.y,7);}
  // cabeza con máscara de oro
  const h=J10_partRect(b,J10_PARTS[8]);
  J10_blockAt(h.x,h.y,h.w,h.h,S,C,0);
  ctx.fillStyle=C('#e8b84a');ctx.fillRect(q(h.x+2),q(h.y+4),h.w-4,8);
  ctx.fillStyle=C(S.d);for(let i=0;i<3;i++)ctx.fillRect(q(h.x+3+i*5),q(h.y-3-((i%2)?1:3)),4,(i%2)?2:4);   // cresta escalonada
  const tele=b.mode!=='idle'&&b.mode!=='rec';
  const eye=glow<=0.05?'#3a2a16':tele&&(T>>1)%2?'#fff3c0':'#ff7a2a';
  ctx.fillStyle=C(eye);ctx.fillRect(q(h.x+4),q(h.y+6),3.5,2);ctx.fillRect(q(h.x+h.w-7.5),q(h.y+6),3.5,2);
  if(glow>0.05){ctx.fillStyle=`rgba(255,140,60,${0.25*glow})`;circle(h.x+6,h.y+7,4);circle(h.x+h.w-6,h.y+7,4);}
  ctx.fillStyle=C('#7a5a22');ctx.fillRect(q(h.x+5),q(h.y+10.5),h.w-10,1);
  if(!gold){ctx.fillStyle='rgba(70,110,50,0.7)';ctx.fillRect(q(h.x+1),q(h.y),5,1.5);ctx.fillRect(q(b.cx-15),q(GROUND-54+b.kneel*24),6,2);}
  // cambio de fase 1→2: cáscara de piedra que se cae
  if(b.state==='trans'&&b.phase===1&&b.t<40){ctx.strokeStyle='#1e1812';ctx.lineWidth=0.8;ctx.beginPath();const k=b.t/40;
    ctx.moveTo(b.cx-10,GROUND-70);ctx.lineTo(b.cx-4,GROUND-60+k*10);ctx.lineTo(b.cx-12,GROUND-40);ctx.moveTo(b.cx+8,GROUND-52);ctx.lineTo(b.cx+2,GROUND-30*k-20);ctx.stroke();}
}
function J10_drawFists(b,S,C,glow){
  for(const f of b.fists){if(f.st==='rest'||f.st==='gone')continue;
    if(f.st==='hover'||f.st==='up'){const k=Math.min(1,f.t/40);ctx.fillStyle=`rgba(0,0,0,${0.2+0.3*k})`;ctx.beginPath();ctx.ellipse(f.tx,GROUND,6+k*4,1.6,0,0,7);ctx.fill();
      if((T>>2)%2){ctx.strokeStyle='rgba(255,140,50,0.7)';ctx.lineWidth=0.6;ctx.beginPath();ctx.ellipse(f.tx,GROUND,12-k*4,2.2,0,0,7);ctx.stroke();}}
    J10_blockAt(f.x-7,f.y-6,14,12,S,C,0.6*glow);
    ctx.fillStyle=C(S.d);for(let i=0;i<3;i++)ctx.fillRect(q(f.x-5+i*4),q(f.y-6),0.8,5);
    if(f.st==='hover'){ctx.fillStyle=`rgba(255,200,90,${0.3+0.2*((T>>2)%2)})`;circle(f.x,f.y,9);}
  }
  // puños en reposo (pegados a los brazos)
  for(const f of b.fists){if(f.st!=='rest')continue;const r=J10_fistRest(b,f);J10_blockAt(r.x-7,r.y-6,14,12,S,C,0.4*glow);}
}
function J10_drawAssembly(b,S,C){
  const n=J10_PARTS.length;
  J10_PARTS.forEach((p,i)=>{
    const t0=i*10,k=M10_ease((b.t-t0)/22),lie=p.h>p.w;
    const sw=lie?p.h:p.w,sh=lie?p.w:p.h,sx=b.A+p.sx,sy=GROUND-sh;
    const tgt=J10_partRect(b,p);
    const x=sx+(tgt.x-sx)*k,y=sy+(tgt.y-sy)*k-Math.sin(k*Math.PI)*30,w=sw+(p.w-sw)*k,h=sh+(p.h-sh)*k;
    if(k>0&&k<1&&b.t%3===0)parts.push({k:'p',x:x+w/2,y:y+h,vx:rand(-0.3,0.3),vy:rand(0,0.6),g:0.05,life:16,maxl:16,size:1,col:'#e8b84a'});
    J10_blockAt(x,y,w,h,S,C,k>=1?0.6:0.2);
    if(p.n==='cabeza'&&k>=1){ctx.fillStyle='#e8b84a';ctx.fillRect(q(x+2),q(y+4),p.w-4,8);const on=b.t>n*10+10;ctx.fillStyle=on?'#ff7a2a':'#3a2a16';ctx.fillRect(q(x+4),q(y+6),3.5,2);ctx.fillRect(q(x+p.w-7.5),q(y+6),3.5,2);}
  });
}
function J10_drawCore(b,C,glow,pulse){
  const c=b.core,r=7+Math.sin(T/6)*0.8,dy=b.state==='dying';
  ctx.fillStyle=`rgba(255,200,90,${0.18+0.12*pulse})`;circle(c.x,c.y,16);
  ctx.fillStyle=C('#7a5a22');circle(c.x,c.y,r+1.5);ctx.fillStyle=C(dy&&(T>>2)%2?'#fff':'#e8b84a');circle(c.x,c.y,r);
  ctx.fillStyle=C('#fff3c0');circle(c.x-2,c.y-2,r*0.35);
  ctx.fillStyle=C('#c8402a');circle(c.x,c.y,2.2);
  // anillo de piedra que lo sostiene
  ctx.strokeStyle='#4e4a3c';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(c.x,c.y,r+4,3,T*0.02,0,7);ctx.stroke();
  if(b.mode==='rayoT'&&(T>>1)%2){ctx.fillStyle='rgba(255,240,190,0.6)';circle(c.x,c.y,r+3);}
}
function J10_drawOrbs(b){
  const S={b:'#b88a3a',l:'#e8c060',d:'#7a5a22'};
  for(const o of b.orb){
    if(o.st==='aim'){const on=(T>>2)%2;ctx.fillStyle=`rgba(255,120,50,${0.4+0.3*on})`;const dx=o.tx-o.x,dy=o.ty-o.y,d=Math.hypot(dx,dy)||1;
      for(let s=10;s<d;s+=7)ctx.fillRect(o.x+dx/d*s-0.6,o.y+dy/d*s-0.6,1.2,1.2);
      ctx.strokeStyle=`rgba(255,120,50,${0.5+0.3*on})`;ctx.lineWidth=0.7;ctx.beginPath();ctx.arc(o.tx,o.ty,5,0,7);ctx.stroke();}
    J10_blockAt(o.x-o.w/2,o.y-o.w/2,o.w,o.w,S,c=>c,o.st==='aim'?0.9:0.4);
    if(o.st==='aim'&&(T>>1)%2){ctx.fillStyle='rgba(255,240,190,0.5)';ctx.fillRect(q(o.x-o.w/2),q(o.y-o.w/2),o.w,o.w);}
  }
}
// barra del villano: marcas de las fases
ON_HUD.push(()=>{
  if(state!=='play'||!bossRef||bossRef.type!=='j10Cust'||typeof bossShown!=='function'||!bossShown())return;
  for(const k of J10_PH){const x=100+120*k;ctx.fillStyle='#120c18';ctx.fillRect(x-0.5,5,1.5,6);ctx.fillStyle='#ffe08a';ctx.fillRect(x,5,0.6,1);ctx.fillRect(x,10,0.6,1);}
});
// escombros del altar (el decorado 'escombros' de mision10.js los dibuja hasta que el CUSTODIO se arma)
function J10_drawRubble(A){
  const S={b:'#6a6252',l:'#8a8070',d:'#4a4438'};
  for(const p of J10_PARTS){const lie=p.h>p.w,w=lie?p.h:p.w,h=lie?p.w:p.h;J10_blockAt(A+p.sx,GROUND-h,w,h,S,c=>c,0.25+0.15*Math.sin(T/30+p.sx));}
}

// ===== registro en BOSSES (sin índice fijo: el de la misión) =====
BOSSES[M10_IDX]={mini:{name:'EL TATÚ CAVADOR',make:J10_mkTatu},villain:{name:'EL CUSTODIO',make:J10_mkCust,g:'★',col:'#e8b84a'}};
