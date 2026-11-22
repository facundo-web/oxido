'use strict';
// Óxido · Misión 5: Ciudad sin luna (noche de lluvia, reflector en las nubes, murciélagos)
// Todo lo de este archivo usa el prefijo M5_ para no chocar con otros nombres globales.
// La acción que identifica la misión es el REFLECTOR: proyecta en las nubes la tuerca de Óxido desde que
// arranca; en la emboscada baja a la calle y encandila a los enemigos; el villano lo apaga y vuelve a
// prenderse en su fase de rabia, apuntándole al dirigible (ver jefes5.js).

// ================== datos de la misión ==================
const M5_LVL={name:'MISIÓN 5 · CIUDAD SIN LUNA',short:'5 · CIUDAD SIN LUNA',theme:'noche',end:3400,music:'l5',
  // bajas: toldos de negocio (m5:'toldo') y descansos de escalera de incendio (el resto)
  platforms:[{x:250,y:130,w:50,m5:'toldo'},{x:330,y:126,w:56,m5:'toldo'},{x:440,y:110,w:50},{x:700,y:124,w:70,m5:'toldo'},{x:830,y:100,w:56},{x:960,y:124,w:60,m5:'toldo'},
    {x:1150,y:126,w:50,m5:'toldo'},{x:1330,y:110,w:50},{x:1690,y:122,w:60,m5:'toldo'},{x:1790,y:102,w:50},
    {x:2220,y:124,w:56,m5:'toldo'},{x:2380,y:108,w:50},{x:2620,y:122,w:70,m5:'toldo'},{x:2760,y:104,w:60},{x:2830,y:126,w:56,m5:'toldo'},{x:2990,y:118,w:50},
    // altas: cornisas de azotea con gárgola (se llega encadenando las escaleras de incendio)
    {x:872,y:62,w:40,hi:'cornisa'},{x:1836,y:64,w:44,hi:'cornisa'},{x:2800,y:62,w:40,hi:'cornisa'},
    // pedestales de piedra en la arena del villano
    {x:3120,y:128,w:34,step:1},{x:3196,y:110,w:34,step:1}],
  // paso bajo el puente del tren elevado (el techo es plataforma)
  tunnels:[{x:1480,w:126,y:116,k:'tren'}],
  // "pirámide": andamio de una obra en construcción
  pyramids:[{x:1940,w:150,n:4,dy:24,inset:14,mats:['ladrillo','andamio','bolsas','andamio']}],
  // charcos (espejo de luces) y alcantarillas (largan vapor): solo decorado
  puddles:[{x:326,w:62},{x:686,w:78},{x:1232,w:70},{x:1630,w:56},{x:2410,w:64},{x:2540,w:70},{x:2900,w:64}],
  grates:[180,610,1060,1420,2140,2470,2960,3300],
  covers:[{x:600,w:26,h:14,k:'m5barrera',hp:12},{x:1112,w:24,h:15,k:'m5volqueta',hp:12},{x:1390,w:20,h:14,k:'m5tachos',hp:8},
    {x:1850,w:26,h:14,k:'m5barrera',hp:12},{x:2186,w:22,h:15,k:'m5volqueta',hp:12},{x:2500,w:24,h:14,k:'m5tachos',hp:8},
    {x:3030,w:22,h:15,k:'m5volqueta',hp:12},{x:3160,w:24,h:15,k:'m5barrera',hp:14}],
  crates:[{x:200,drop:'H'},{x:400,drop:'G'},{x:640,drop:'R'},{x:1010,drop:'E'},{x:1200,drop:'+'},{x:1420,drop:'F'},{x:1800,drop:'S'},
    {x:2300,drop:'G'},{x:2640,drop:'+'},{x:2975,drop:'R'},{x:3050,drop:'E'}],
  extraCrates:[{x:520,p:0.45},{x:884,y:62,p:0.7},{x:1848,y:64,p:0.6},{x:2812,y:62,p:0.6}],
  turrets:[1890,2720],mechs:[1740],
  prisoners:[{x:290,k:'ally'},{x:845,y:100,k:'item'},{x:1530,k:'item'},{x:1800,y:102,k:'ally'},{x:2010,y:60,k:'item'},
    {x:2300,k:'item'},{x:2775,y:104,k:'item'},{x:3010,k:'ally'}],
  extraPrisoners:[{x:1850,y:64,p:0.75,k:'ally'},{x:2580,p:0.4,k:'item'}],
  decor:[{x:40,k:'farol'},{x:120,k:'kiosco'},{x:206,k:'neon',v:0},{x:300,k:'hidrante'},{x:480,k:'farol'},{x:556,k:'tacho'},{x:650,k:'cabina'},{x:784,k:'farol'},
    {x:930,k:'neon',v:1},{x:1058,k:'tacho'},{x:1186,k:'farol'},{x:1310,k:'hidrante'},{x:1440,k:'neon',v:2},{x:1616,k:'farol'},
    {x:2118,k:'farol'},{x:2196,k:'kiosco'},{x:2352,k:'neon',v:0},{x:2480,k:'tacho'},{x:2690,k:'farol'},{x:2866,k:'neon',v:1},
    {x:2978,k:'hidrante'},{x:3070,k:'farol'},{x:3262,k:'gargola'},{x:3340,k:'farol'}],
  // 'bat' trae una bandada chica (1 + 1 o 2 compañeros). Reemplazan a una parte de los drones.
  events:[
    {at:20,spawn:[{t:'soldier',x:'R',d:70},{t:'soldier',x:'R',d:160}]},
    {at:110,spawn:[{t:'soldier',x:450,y:92}]},
    {at:240,spawn:[{t:'grenadier',x:'R'},{t:'soldier',x:'R',d:50},{t:'bat',x:'R',d:120}]},
    {at:400,spawn:[{t:'soldier',x:720,y:106},{t:'soldier',x:'R',d:40},{t:'drone',x:'R',d:90}]},
    {at:560,spawn:[{t:'soldier',x:845,y:82},{t:'bat',x:'R',d:30},{t:'soldier',x:'R',d:90}]},
    {at:700,spawn:[{t:'shield',x:'R'},{t:'grenadier',x:'R',d:60},{t:'soldier',x:'R',d:100}]},
    {at:1200,spawn:[{t:'soldier',x:1700,y:104},{t:'bat',x:'R',d:30}]},
    {at:1320,spawn:[{t:'grenadier',x:1800,y:84},{t:'drone',x:'R',d:40}]},
    // cofre blindado bajo el puente: al acercarte viene una oleada grande
    {at:1380,spawn:[{t:'shield',x:'R'},{t:'soldier',x:'L',d:30},{t:'grenadier',x:'R',d:60},{t:'bat',x:'L',d:90},{t:'soldier',x:1650,d:110},{t:'soldier',x:'R',d:130},{t:'soldier',x:'L',d:170}]},
    {at:1460,spawn:[{t:'shield',x:'R'},{t:'soldier',x:'R',d:40},{t:'drone',x:'R',d:90}]},
    {at:1820,spawn:[{t:'bat',x:'R'},{t:'soldier',x:2000,y:42,d:20},{t:'drone',x:'R',d:40},{t:'soldier',x:'R',d:70},{t:'shield',x:'R',d:120}]},
    {at:2260,spawn:[{t:'soldier',x:2560},{t:'soldier',x:2640,y:104},{t:'shield',x:'R',d:30}]},
    {at:2380,spawn:[{t:'soldier',x:2780,y:86},{t:'soldier',x:'R',d:20},{t:'bat',x:'R',d:80}]},
    {at:2520,spawn:[{t:'shield',x:'R'},{t:'soldier',x:'R',d:20},{t:'grenadier',x:'R',d:70},{t:'drone',x:'R',d:110}]},
    {at:2700,spawn:[{t:'bat',x:'R'},{t:'soldier',x:'R',d:30},{t:'grenadier',x:'R',d:90}]},
    {at:2620,spawn:[{t:'soldier',x:2995,y:100},{t:'bat',x:'L',d:40},{t:'soldier',x:'R',d:80}]},
    {at:2840,spawn:[{t:'shield',x:'R'},{t:'grenadier',x:'R',d:40},{t:'soldier',x:'R',d:90}]},
    {at:2960,spawn:[{t:'soldier',x:'R'},{t:'bat',x:'R',d:50},{t:'grenadier',x:'R',d:90},{t:'soldier',x:'L',d:130}]}],
  arenas:[
    // jefe chico a un tercio; después juego normal y una emboscada; el villano al final (nunca seguidos)
    {at:1100,mini:true},
    // emboscada: acá el reflector baja a la calle y encandila
    {at:2160,m5luz:true,waves:[
      [{t:'soldier',x:'R'},{t:'bat',x:'R',d:30},{t:'soldier',x:'L',d:60}],
      [{t:'drone',x:'R'},{t:'soldier',x:'L',d:20},{t:'grenadier',x:'R',d:60},{t:'bat',x:'L',d:90}],
      [{t:'shield',x:'R'},{t:'soldier',x:'L',d:30},{t:'bat',x:'R',d:50},{t:'drone',x:'R',d:110}]]},
    {at:3080,boss:true}],
  vaults:[{x:1572}],
  m5Built:true};
// niveles.js ya agregó los techos y escalones de las misiones que cargaron antes: acá van los de la 5
for(const t of M5_LVL.tunnels)M5_LVL.platforms.push({x:t.x,y:t.y,w:t.w,roof:t});
for(const p of M5_LVL.pyramids)for(let i=0;i<p.n;i++)
  M5_LVL.platforms.push({x:p.x+i*p.inset,y:GROUND-(i+1)*p.dy,w:p.w-2*i*p.inset,pyr:p,tier:i,mat:p.mats[i%p.mats.length]});
M5_LVL.events.sort((a,b)=>a.at-b.at);
LEVELS.push(M5_LVL);
// una bandada cuesta un poco más que un dron al sortear tipos (ver variarPartida)
NV_COSTO.bat=1.4;
COB_COL.m5barrera=['#6a6a72','#8a8a94'];COB_COL.m5volqueta=['#2e4a3a','#3e6450'];COB_COL.m5tachos=['#4a4e58','#6a707c'];
KILL_NAMES.push(['bat','murciélagos']);

// ================== estado ==================
// hash entero propio (el hash() de base.js pierde precisión con números grandes, como T)
const M5_h=n=>{n|=0;n=Math.imul(n^(n>>>16),0x45d9f3b);n=Math.imul(n^(n>>>16),0x45d9f3b);n^=n>>>16;return(n>>>0)/4294967296;};
const M5_sfx=n=>{if(typeof SFX!=='undefined'&&SFX[n])SFX[n]();};
// sl: reflector. mode 'sky' (nubes) · 'street' (barre la calle) · 'off' (lo apagó el villano) · 'boss' (apunta al dirigible)
//   a = intensidad del haz del cielo/jefe, k = cuánto bajó a la calle, gx = x del haz en la calle, tx/ty = blanco en el jefe
const M5={ev:null,fall:[],dive:null,diveCd:0,flash:0,bolt:null,nextBolt:200,train:-1,sl:{mode:'sky',t:0,a:1,k:0,gx:0}};
function M5_reset(){M5.ev=levelEvents;M5.fall=[];M5.dive=null;M5.diveCd=60;M5.flash=0;M5.bolt=null;M5.nextBolt=220;M5.train=-1;
  M5.sl={mode:'sky',t:0,a:1,k:0,gx:camX+W/2,ann:false};}
ON_START.push(()=>{if(L===M5_LVL)M5_reset();});
function M5_pc(){const r=P.ride;return r?{x:r.x+r.w/2,y:r.y+r.h/2}:{x:P.x+4,y:P.y+9};}

// ================== reflector ==================
// torre del reflector: muy lejos (casi no se mueve), siempre a la vista. Coordenadas de pantalla.
function M5_tower(){return{x:196-camX*0.04,y:50};}
function M5_sweep(){return Math.sin(T/230)*0.9+Math.sin(T/97)*0.14;}
function M5_spot(){const t=M5_tower();return{x:t.x+M5_sweep()*62,y:38};}
function M5_hexPath(x,y,r,rot){ctx.beginPath();for(let i=0;i<6;i++){const a=rot+i*Math.PI/3,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);}ctx.closePath();}
// emblema proyectado: círculo de luz con la TUERCA de Óxido (hexágono oscuro con el agujero iluminado)
function M5_nut(x,y,r,sy,rot,a,dark){
  if(a<=0.01)return;
  ctx.save();ctx.translate(x,y);ctx.scale(1,sy);
  ctx.fillStyle=`rgba(255,232,170,${0.09*a})`;circle(0,0,r*1.9);
  ctx.fillStyle=`rgba(255,238,190,${0.26*a})`;circle(0,0,r*1.35);
  ctx.fillStyle=`rgba(255,246,214,${0.40*a})`;circle(0,0,r*1.08);
  ctx.fillStyle=`rgba(${dark},${0.86*a})`;M5_hexPath(0,0,r*0.74,rot);ctx.fill();
  ctx.strokeStyle=`rgba(255,246,214,${0.22*a})`;ctx.lineWidth=0.7;M5_hexPath(0,0,r*0.56,rot);ctx.stroke();   // chaflán
  ctx.fillStyle=`rgba(255,248,224,${0.55*a})`;circle(0,0,r*0.3);
  ctx.restore();
}
// intensidad del reflector del cielo (titila cuando lo apagan)
function M5_slA(){const s=M5.sl;if(s.mode!=='off')return s.a;return s.t<34?((T>>1)%2?0.85:0.15)*(1-s.t/34):0;}

// ================== murciélagos ==================
// Vuelan en zigzag sobre el jugador. De a uno por vez se tiran en picada: AVISO = se quedan quietos, abren
// las alas, chillan (ondas rojas) y en los últimos cuadros marcan con puntos rojos hacia dónde van.
// El punto se fija 12 cuadros antes de salir: moviéndote lo esquivás. Un tiro los baja. Bajo el reflector se
// encandilan: no se tiran.
const M5_WARN=40;
function M5_bat1(x){
  const y=24+Math.random()*34;
  return{type:'bat',air:true,x,y,baseY:y,w:12,h:8,hp:1,score:120,cd:80+Math.random()*60,t:0,st:'fly',vx:0,vy:0,seg:0,
    dx:x>camX+W/2?-1:1,dy:1,flap:Math.random()*6,side:Math.random()<0.5?-1:1,flash:0,seen:false,lock:null,m5lit:0,
    upd:M5_updBat,draw:M5_drawBat,onKill:M5_killBat};
}
// el del evento trae compañeros (bandada chica); los compañeros son 'm5bat1' para que no entren al sorteo de tipos
function M5_mkBat(x){
  const e=M5_bat1(x),side=x>=camX+W?'R':x<=camX-10?'L':x;
  const n=Math.random()<0.55?1:2;
  for(let k=1;k<=n;k++)spawnQ.push({t:'m5bat1',x:side,d:k*(10+(Math.random()*8|0))});
  return e;
}
ENEMY_MAKERS.bat=M5_mkBat;ENEMY_MAKERS.m5bat1=M5_bat1;
function M5_canDive(){const d=M5.dive;if(d&&!d.gone&&(d.st==='warn'||d.st==='dive'))return false;return M5.diveCd<=0;}
function M5_batHit(e){
  const box={x:e.x+2,y:e.y+1,w:8,h:6};
  for(const p of players)if(!p.dead&&overlap(hurtbox(p),box))withP(p,()=>hurtPlayer(1));
  for(const a of allies)if(!a.gone&&overlap(a,box))killAlly(a);
}
function M5_updBat(e){
  if(e.flash>0)e.flash--;e.t++;
  const pc=P.dead?null:M5_pc(),lit=e.m5lit>0;if(e.m5lit>0)e.m5lit--;
  if(e.kbx){e.x+=e.kbx;e.kbx*=0.5;if(Math.abs(e.kbx)<0.15)e.kbx=0;}
  switch(e.st){
  case 'fly':{
    e.flap+=lit?0.25:0.5;
    if(--e.seg<=0){e.seg=(16+Math.random()*14)|0;
      const ax=(pc?pc.x:camX+W/2)+e.side*(30+Math.random()*50);
      e.dx=Math.sign(ax-(e.x+6))||1;if(Math.random()<0.2)e.dx=-e.dx;
      e.dy=-e.dy;if(Math.random()<0.12)e.side=-e.side;
      if(Math.random()<0.25&&onScreen(e,0))M5_sfx('aleteo');}
    const sp=lit?0.35:1.25;
    e.vx+=(e.dx*sp-e.vx)*0.16;e.vy+=(e.dy*(lit?0.4:0.95)-e.vy)*0.22;
    e.x+=e.vx;e.y+=e.vy;
    if(e.y<e.baseY-12){e.y=e.baseY-12;e.dy=1;}else if(e.y>e.baseY+14){e.y=e.baseY+14;e.dy=-1;}
    // una vez que entra en pantalla no se escapa (siempre se le puede disparar)
    if(e.x>camX+4&&e.x<camX+W-16)e.seen=true;
    if(e.seen){if(e.x<camX+4){e.x=camX+4;e.dx=1;}else if(e.x>camX+W-16){e.x=camX+W-16;e.dx=-1;}}
    if(e.cd>0&&!lit)e.cd--;
    if(e.cd<=0&&pc&&e.seen&&!lit&&M5_canDive()){e.st='warn';e.t=0;e.vx=e.vy=0;e.lock=null;M5.dive=e;M5_sfx('chillido');}
    break;}
  case 'warn':
    e.flap+=0.12;e.x+=Math.sin(e.t*1.3)*0.3;
    if(lit){e.st='fly';e.cd=70;e.lock=null;M5.dive=null;break;}   // el reflector lo encandila: se arrepiente
    if(e.t===M5_WARN-12&&pc)e.lock={x:pc.x,y:Math.min(pc.y,GROUND-6)};
    if(e.t>=M5_WARN){
      const L0=e.lock||{x:pc?pc.x:e.x+6,y:pc?Math.min(pc.y,GROUND-6):GROUND-6};e.lock=L0;
      const dx=L0.x-(e.x+6),dy=L0.y-(e.y+4),d=Math.hypot(dx,dy)||1,sp=3.3;
      e.vx=dx/d*sp;e.vy=dy/d*sp;e.st='dive';e.t=0;M5_sfx('picada');}
    break;
  case 'dive':{
    e.x+=e.vx;e.y+=e.vy;
    if(e.t%2===0)parts.push({k:'p',x:e.x+6,y:e.y+4,vx:0,vy:0,g:0,life:8,maxl:8,size:1,col:'rgba(150,90,130,0.7)'});
    const L0=e.lock,rem=Math.hypot(L0.x-(e.x+6),L0.y-(e.y+4));
    M5_batHit(e);
    if(rem<3.5||e.y+4>=GROUND-4||e.t>70){e.st='rise';e.t=0;e.vy=-2.2;e.vx=(Math.sign(e.vx)||1)*1.4;}
    break;}
  case 'rise':
    e.flap+=0.6;e.vy=Math.min(-0.7,e.vy+0.04);e.x+=e.vx;e.vx*=0.98;e.y+=e.vy;
    if(e.t<8)M5_batHit(e);
    e.x=clamp(e.x,camX+4,camX+W-16);
    if(e.y<=e.baseY){e.st='fly';e.seg=0;e.cd=(110+Math.random()*60)*DIFF().fire;M5.diveCd=26;e.lock=null;}
    break;
  }
}
function M5_killBat(e){
  M5_sfx('murcimuere');
  M5.fall.push({x:e.x+6,y:e.y+4,vx:(e.kbx||0)*0.4+rand(-0.5,0.5),vy:-1.2,rot:0,vr:rand(0.2,0.35)*(Math.random()<0.5?-1:1),t:0,land:0});
  for(let i=0;i<5;i++)parts.push({k:'p',x:e.x+6,y:e.y+4,vx:rand(-1.2,1.2),vy:rand(-1.6,0),g:0.1,life:rand(14,24),maxl:24,size:1,col:i%2?'#3a2836':'#6a4a5a'});
  if(M5.dive===e)M5.dive=null;
  if(Math.random()<0.08)pickups.push({kind:pick(['H','S','F','R','G','E','+']),x:e.x,y:e.y,w:10,h:10,vy:-2.5,life:700});
}
function M5_drawBat(e){
  const cx=e.x+6,cy=e.y+4,fl=e.flash>0,C=c=>fl?'#fff':c;
  if(e.st==='dive'){
    ctx.save();ctx.translate(q(cx),q(cy));ctx.rotate(Math.atan2(e.vy,e.vx));
    ctx.fillStyle=C('#3a2434');ctx.beginPath();ctx.moveTo(3,0);ctx.lineTo(-8,-4.5);ctx.lineTo(-4,0);ctx.lineTo(-8,4.5);ctx.closePath();ctx.fill();
    ctx.fillStyle=C('#1a121c');ctx.beginPath();ctx.ellipse(0,0,3.4,2.1,0,0,7);ctx.fill();
    ctx.fillStyle=C('#1a121c');ctx.fillRect(-1.5,-3,1,1.5);ctx.fillRect(-1.5,1.5,1,1.5);
    ctx.fillStyle='#ff4a3a';ctx.fillRect(1.6,-1.2,1,1);ctx.fillRect(1.6,0.3,1,1);
    ctx.restore();return;}
  const spread=e.st==='warn';
  const a=spread?0:Math.sin(e.flap);
  for(const s of[-1,1]){ // alas: membrana con borde festoneado
    const tx=cx+s*(spread?9.5:7),ty=cy-1-(spread?2.5:a*4);
    ctx.fillStyle=C(spread?'#4e2c40':'#3a2638');ctx.beginPath();ctx.moveTo(cx+s*1.5,cy-1.5);ctx.lineTo(tx,ty);
    ctx.lineTo(cx+s*(spread?7.5:5.6),cy+1.5-a*1.6);ctx.lineTo(cx+s*(spread?5.2:4.2),cy+0.4-a);ctx.lineTo(cx+s*3.4,cy+2-a*0.6);ctx.lineTo(cx+s*1.5,cy+1.6);ctx.closePath();ctx.fill();
    if(!spread&&!fl){ctx.strokeStyle='#6e4a66';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(cx+s*1.5,cy-1.5);ctx.lineTo(tx,ty);ctx.stroke();}
    if(spread&&!fl){ctx.strokeStyle='#8a5068';ctx.lineWidth=0.5;ctx.beginPath();
      ctx.moveTo(cx+s*1.5,cy-1.5);ctx.lineTo(cx+s*7.5,cy+1.5);ctx.moveTo(cx+s*1.5,cy-1.5);ctx.lineTo(cx+s*5.2,cy+0.4);ctx.moveTo(cx+s*1.5,cy-1.5);ctx.lineTo(tx,ty);ctx.stroke();}
  }
  ctx.fillStyle=C('#1c1420');ctx.beginPath();ctx.ellipse(cx,cy,2.3,3,0,0,7);ctx.fill();
  ctx.beginPath();ctx.moveTo(cx-2.1,cy-1.8);ctx.lineTo(cx-1.7,cy-5);ctx.lineTo(cx-0.5,cy-2.6);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(cx+2.1,cy-1.8);ctx.lineTo(cx+1.7,cy-5);ctx.lineTo(cx+0.5,cy-2.6);ctx.closePath();ctx.fill();
  ctx.fillStyle=C('#4a3440');ctx.fillRect(cx-1,cy+0.6,2,1.4);
  if(fl)return;
  ctx.fillStyle=spread&&(T>>1)%2?'#fff2a0':'#ff3a2a';ctx.fillRect(q(cx-1.5),q(cy-1.3),1,1);ctx.fillRect(q(cx+0.5),q(cy-1.3),1,1);
  if(e.m5lit>0){ctx.fillStyle='#ffe08a';const r=T/5;ctx.fillRect(q(cx+Math.cos(r)*4),q(cy-6+Math.sin(r)),1,1);ctx.fillRect(q(cx-Math.cos(r)*4),q(cy-6-Math.sin(r)),1,1);}
  if(spread){
    ctx.fillStyle='#14080c';ctx.fillRect(cx-0.9,cy+0.3,1.8,1.2);ctx.fillStyle='#fff';ctx.fillRect(cx-0.9,cy+0.3,0.5,0.8);ctx.fillRect(cx+0.4,cy+0.3,0.5,0.8);
    // ondas del chillido
    ctx.lineWidth=0.6;for(let i=0;i<2;i++){const ph=((e.t+i*7)%14)/14,r=4+ph*7;ctx.strokeStyle=`rgba(255,110,100,${0.8*(1-ph)})`;
      ctx.beginPath();ctx.arc(cx,cy-1,r,-2.5,-0.64);ctx.stroke();}
    // hacia dónde se va a tirar (ya fijado)
    if(e.lock){const L0=e.lock,dx=L0.x-cx,dy=L0.y-cy;ctx.fillStyle=(T>>1)%2?'#ff5a4a':'#ffb0a0';
      for(let i=1;i<5;i++){const k=i/5;ctx.fillRect(q(cx+dx*k-0.5),q(cy+dy*k-0.5),1,1);}
      ctx.fillRect(q(L0.x-2),q(L0.y-2),1,1);ctx.fillRect(q(L0.x+1),q(L0.y-2),1,1);ctx.fillRect(q(L0.x-0.5),q(L0.y-0.5),1,1);ctx.fillRect(q(L0.x-2),q(L0.y+1),1,1);ctx.fillRect(q(L0.x+1),q(L0.y+1),1,1);}
  }
}
// murciélagos derribados: caen girando y quedan un rato en el piso
function M5_updFall(){
  for(const f of M5.fall){f.t++;
    if(!f.land){f.vy=Math.min(f.vy+0.18,4);f.x+=f.vx;f.y+=f.vy;f.rot+=f.vr;if(f.y>=GROUND-2){f.y=GROUND-2;f.land=f.t;f.rot=0.25;}}
  }
  M5.fall=M5.fall.filter(f=>!(f.land&&f.t-f.land>50)&&f.t<300);
}
function M5_drawFall(){
  if(L!==M5_LVL)return;
  for(const f of M5.fall){if(f.land&&(f.t-f.land>30)&&(T>>2)%2)continue;
    ctx.save();ctx.translate(q(f.x),q(f.y));ctx.rotate(f.rot);
    ctx.fillStyle='#2e2030';ctx.beginPath();ctx.moveTo(-1,0);ctx.lineTo(-6,2);ctx.lineTo(-4,-1);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(1,0);ctx.lineTo(6,2);ctx.lineTo(4,-1);ctx.closePath();ctx.fill();
    ctx.fillStyle='#1c1420';ctx.beginPath();ctx.ellipse(0,0,2,2.6,0,0,7);ctx.fill();
    ctx.fillStyle='#5a3a3a';ctx.fillRect(-1,-1,0.8,0.8);ctx.fillRect(0.4,-1,0.8,0.8);
    ctx.restore();}
}
ON_DRAW.push(M5_drawFall);

// ================== ganchos por cuadro ==================
function M5_mkBolt(){
  const pts=[];let x=30+Math.random()*260,y=8;const end=86+Math.random()*30;pts.push([x,y]);
  while(y<end){y+=7+Math.random()*7;x+=rand(-8,8);pts.push([x,y]);}
  const k=2+(Math.random()*2|0),br=[pts[k]];let bx=pts[k][0],by=pts[k][1];
  for(let i=0;i<3;i++){by+=6+Math.random()*5;bx+=(Math.random()<0.5?-1:1)*rand(4,9);br.push([bx,by]);}
  return{pts,br};
}
const M5_flashA=()=>{const f=M5.flash;if(f<=0)return 0;return f>8?1:f>6?0.35:f>4?0.85:f/8;};
M5_LVL.upd=function(){
  if(M5.ev!==levelEvents)M5_reset();
  if(M5.diveCd>0)M5.diveCd--;
  M5_updFall();
  // relámpagos (y trueno con demora)
  if(M5.flash>0)M5.flash--;
  if(--M5.nextBolt<=0&&!winT){M5.nextBolt=(300+Math.random()*320)|0;M5.flash=12;M5.bolt=M5_mkBolt();later(250+Math.random()*600,()=>M5_sfx('thunder'));}
  // tren lejano que cruza de vez en cuando
  if(M5.train<0){if(Math.random()<0.0025)M5.train=0;}else if(++M5.train>470)M5.train=-1;
  // vapor de las alcantarillas
  for(const g of M5_LVL.grates)if(g>camX-10&&g<camX+W+10&&Math.random()<0.07)
    parts.push({k:'smoke',col:'170,180,205',rise:1,x:g+rand(-5,5),y:GROUND,vx:rand(-0.12,0.12),vy:rand(-0.55,-0.3),life:rand(40,60),maxl:60,size:rand(1.6,3)});
  // chapoteo al caminar por los charcos
  for(const o of [...players.filter(p=>!p.dead&&!p.ride),...enemies.filter(e=>e.type==='soldier'||e.type==='grenadier'||e.type==='shield')]){
    if(!o.onGround||o.plat||Math.abs(o.vx||0)<0.2||(T+((o.x|0)&7))%10)continue;
    const cx=o.x+4;if(!M5_LVL.puddles.some(p=>cx>p.x&&cx<p.x+p.w))continue;
    for(let i=0;i<2;i++)parts.push({k:'p',x:cx-Math.sign(o.vx)*2,y:GROUND-1,vx:rand(-0.6,0.6),vy:rand(-1.5,-0.7),g:0.14,life:14,maxl:14,size:1,col:'#9ab0d8'});
  }
  // reflector: en la emboscada baja a la calle, barre y encandila
  for(const e of enemies)if(e.m5lit>0&&e.type!=='bat')e.m5lit--;   // (los murciélagos lo bajan en su upd)
  const sl=M5.sl;sl.t++;
  const amb=!!(lock&&lock.a&&lock.a.m5luz);
  if(sl.mode==='sky'&&amb){sl.mode='street';sl.t=0;sl.gx=camX+40;}
  else if(sl.mode==='street'&&!amb){sl.mode='sky';sl.t=0;}
  if(sl.mode==='street'){
    sl.k=Math.min(1,sl.k+0.025);
    if(sl.t===70){setBanner('¡EL REFLECTOR BARRE LA CALLE!',90);M5_sfx('reflector');}
    sl.gx=camX+W/2+Math.sin(sl.t/85)*118;
    if(sl.k>0.6)for(const e of enemies){if(e.gone||!(e.type==='bat'||e.type==='soldier'||e.type==='grenadier'||e.type==='shield'))continue;
      if(Math.abs(e.x+e.w/2-sl.gx)<20){e.m5lit=4;if(e.state==='walk'&&e.cd!==undefined)e.cd+=1;}}   // encandilados: no tiran
  }else sl.k=Math.max(0,sl.k-0.03);
  if(sl.mode==='boss')sl.a=Math.min(1,sl.a+0.03);
};

// ================== fondo ==================
const M5_R=mulberry32(55),M5_K=3;
function M5_canvas(w,h){const c=document.createElement('canvas');c.width=w*M5_K;c.height=h*M5_K;const g=c.getContext('2d');g.scale(M5_K,M5_K);return[c,g];}
// ciudad lejana: bloques, agujas, cúpulas y antenas con luz roja
const M5_FARW=640,M5_ANT=[];
const M5_FARB=[];{let x=0;while(x<M5_FARW){const w=12+M5_R()*26,h=40+M5_R()*62,k=M5_R();M5_FARB.push({x,w,h,k,s:(M5_R()*999)|0,ah:10+M5_R()*8});
  if(k>=0.4&&k<0.62)M5_ANT.push({x:x+w/2,y:GROUND-h-10-M5_R()*6,s:(M5_R()*99)|0});x+=w+1+M5_R()*6;}}
// torres góticas del medio: escalonadas, con agujas, ventanas en arco y gárgolas en las esquinas
const M5_MIDW=960,M5_DYN=[];let M5_CLOCK=null;
const M5_MIDB=[];{let x=0;while(x<M5_MIDW){const w=34+M5_R()*38,h=58+M5_R()*66;M5_MIDB.push({x,w,h,spire:M5_R()<0.55,rose:M5_R()<0.35,s:(M5_R()*999)|0});x+=w+5+M5_R()*18;}}
function M5_drawFarB(g,b,ox){
  const x=b.x+ox,top=GROUND-b.h;
  g.fillStyle='#0b0d18';g.fillRect(x,top,b.w,b.h);
  if(b.k<0.25){g.beginPath();g.moveTo(x+b.w*0.3,top);g.lineTo(x+b.w/2,top-12-b.ah);g.lineTo(x+b.w*0.7,top);g.fill();}
  else if(b.k<0.4){g.beginPath();g.ellipse(x+b.w/2,top,b.w*0.4,b.w*0.32,0,Math.PI,0);g.fill();g.fillRect(x+b.w/2-0.5,top-b.w*0.32-5,1,5);}
  else if(b.k<0.62){g.fillRect(x+b.w/2-0.5,top-b.ah,1,b.ah);g.fillRect(x+b.w/2-2,top-b.ah*0.6,4,1);}
  else g.fillRect(x+2,top-3,b.w-4,3);
  const r=mulberry32(b.s);g.fillStyle='rgba(214,170,100,0.38)';
  for(let yy=top+4;yy<GROUND-26;yy+=5)for(let xx=x+2;xx<x+b.w-2;xx+=4)if(r()<0.12)g.fillRect(xx,yy,1,1.4);
}
function M5_garg(g,x,y,d){ // gárgola en silueta (vista de lejos), d = hacia dónde mira
  g.save();g.translate(x,y);g.scale(d,1);
  g.beginPath();g.moveTo(-2,0);g.lineTo(-2,-3);g.lineTo(0,-5);g.lineTo(-1,-8);g.lineTo(2,-5);g.lineTo(4,-5);g.lineTo(6,-4);g.lineTo(5,-2.6);g.lineTo(3,-2.6);g.lineTo(3,0);g.closePath();g.fill();
  g.fillRect(4,-6.5,0.8,1.6);
  g.restore();
}
function M5_drawMidB(g,b,ox){
  const x=b.x+ox,cx=x+b.w/2,r=mulberry32(b.s);
  const lv=[{w:b.w,y:GROUND-b.h*0.55},{w:b.w*0.72,y:GROUND-b.h*0.82},{w:b.w*0.46,y:GROUND-b.h}];
  for(let i=0;i<3;i++){const l=lv[i],lx=cx-l.w/2;
    g.fillStyle='#121423';g.fillRect(lx,l.y,l.w,GROUND-l.y);
    g.fillStyle='#1c2034';g.fillRect(lx,l.y,1,GROUND-l.y);                     // borde con la luz de la ciudad
    g.fillStyle='#22263c';g.fillRect(lx-1,l.y,l.w+2,1.4);                      // cornisa
    for(let px=lx+4;px<lx+l.w-3;px+=9){g.fillStyle='#181b2c';g.fillRect(px,l.y+2,1,GROUND-l.y-2);}   // contrafuertes
    // ventanas en arco
    const top=l.y+4,bot=i===0?GROUND-16:lv[i-1].y-4;
    for(let yy=top;yy<bot;yy+=8)for(let xx=lx+2.5;xx<lx+l.w-3;xx+=4.5){
      const k=r();if(k<0.1){g.fillStyle='rgba(222,168,84,0.85)';}else if(k<0.2&&ox===0){g.fillStyle='#0a0b14';M5_DYN.push({x:xx,y:yy});}else g.fillStyle='#0a0b14';
      g.fillRect(xx,yy+1,2,3.4);g.fillRect(xx+0.5,yy,1,1);}
    // gárgolas en las esquinas del escalón
    if(i>0){g.fillStyle='#121423';M5_garg(g,lx-1,l.y+0.2,-1);M5_garg(g,lx+l.w+1,l.y+0.2,1);}
  }
  const t=lv[2],tl=cx-t.w/2;
  if(b.spire){g.fillStyle='#121423';g.beginPath();g.moveTo(tl+1,t.y);g.lineTo(cx,t.y-20-b.w*0.3);g.lineTo(tl+t.w-1,t.y);g.fill();
    g.fillRect(cx-0.4,t.y-28-b.w*0.3,0.8,9);
    for(const s of[-1,1]){g.beginPath();g.moveTo(cx+s*t.w/2,t.y);g.lineTo(cx+s*(t.w/2-1),t.y-8);g.lineTo(cx+s*(t.w/2-3),t.y);g.fill();}}
  else{g.fillStyle='#121423';for(let px=tl;px<tl+t.w-1;px+=3)g.fillRect(px,t.y-2,1.6,2);}
  if(b.rose){const ry=lv[1].y+7;g.fillStyle='#0a0b14';g.beginPath();g.arc(cx,ry,4,0,7);g.fill();
    if(!M5_CLOCK&&ox===0)M5_CLOCK={x:cx,y:ry};
    else{g.fillStyle='rgba(180,60,70,0.6)';g.beginPath();g.arc(cx,ry,3,0,7);g.fill();g.strokeStyle='#0a0b14';g.lineWidth=0.6;g.beginPath();g.moveTo(cx-3,ry);g.lineTo(cx+3,ry);g.moveTo(cx,ry-3);g.lineTo(cx,ry+3);g.stroke();}}
}
let M5_FAR=null,M5_MID=null;
function M5_build(){
  let c,g;
  [c,g]=M5_canvas(M5_FARW,GROUND);for(const b of M5_FARB){M5_drawFarB(g,b,0);if(b.x+b.w+10>M5_FARW)M5_drawFarB(g,b,-M5_FARW);}M5_FAR=c;
  [c,g]=M5_canvas(M5_MIDW,GROUND);for(const b of M5_MIDB){M5_drawMidB(g,b,0);if(b.x+b.w+10>M5_MIDW)M5_drawMidB(g,b,-M5_MIDW);}
  // bruma de la calle ya horneada en la franja (también tapa los huecos entre torres)
  const hz=g.createLinearGradient(0,108,0,GROUND);hz.addColorStop(0,'rgba(40,30,56,0)');hz.addColorStop(1,'rgba(58,40,66,0.55)');g.fillStyle=hz;g.fillRect(0,108,M5_MIDW,GROUND-108);
  M5_MID=c;
}
function M5_strip(img,span,par){const off=((camX*par)%span+span)%span;ctx.drawImage(img,-off,0,span,GROUND);if(span-off<W)ctx.drawImage(img,span-off,0,span,GROUND);return off;}
const M5_CLOUDS=Array.from({length:16},(_,i)=>({x:i*54+M5_R()*30,y:6+M5_R()*30,rx:28+M5_R()*30,ry:4.5+M5_R()*6}));
function M5_clouds(fl){
  const span=860;
  for(const c of M5_CLOUDS){const x=((c.x-T*0.04-camX*0.03)%span+span)%span-80;if(x<-c.rx||x>W+c.rx)continue;
    ctx.fillStyle=fl>0?`rgb(${14+70*fl|0},${18+74*fl|0},${34+90*fl|0})`:'#0e1222';ctx.beginPath();ctx.ellipse(x,c.y,c.rx,c.ry,0,0,7);ctx.fill();
    ctx.fillStyle='rgba(46,40,70,0.55)';ctx.beginPath();ctx.ellipse(x+3,c.y+c.ry*0.55,c.rx*0.8,c.ry*0.4,0,0,7);ctx.fill();}
}
function M5_drawBolt(fl){
  const b=M5.bolt;
  for(const [pts,w] of[[b.pts,1.2],[b.br,0.7]]){
    ctx.strokeStyle=`rgba(170,180,255,${0.45*fl})`;ctx.lineWidth=w*3;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
    ctx.strokeStyle=`rgba(245,248,255,${fl})`;ctx.lineWidth=w;ctx.stroke();}
}
// torre del reflector: alta y finita, con la lámpara arriba
function M5_drawTower(t){
  const x=t.x;
  ctx.fillStyle='#0d0f1c';ctx.fillRect(x-6,64,12,GROUND-64);ctx.fillRect(x-4,57,8,7);ctx.fillRect(x-7,63,14,2);
  ctx.fillStyle='#161a2c';ctx.fillRect(x-6,64,1,GROUND-64);
  ctx.fillStyle='rgba(222,168,84,0.6)';for(let y=72;y<GROUND-30;y+=9)ctx.fillRect(x-2,y,1,2);
  ctx.fillStyle='#2a2e40';ctx.fillRect(x-3.5,51,7,6);ctx.fillStyle='#3a3e52';ctx.fillRect(x-3.5,51,7,1);
  const a=M5.sl.mode==='off'?M5_slA():1;
  ctx.fillStyle=a>0.5?'#fff4d0':'#3a3426';ctx.fillRect(x-2.5,49.5,5,1.6);
  if(a>0.5){ctx.fillStyle='rgba(255,240,200,0.25)';circle(x,50,4);}
}
// tren elevado lejano: de vez en cuando cruza con las ventanas prendidas
function M5_trainBG(){
  const y=118,off=((camX*0.2)%46+46)%46;
  ctx.fillStyle='#0a0c17';ctx.fillRect(0,y,W,2.4);for(let x=-off;x<W+46;x+=46)ctx.fillRect(x,y,1.6,GROUND-y);
  ctx.fillStyle='#10131f';for(let x=-off;x<W+46;x+=46){ctx.beginPath();ctx.moveTo(x,y+2);ctx.lineTo(x+8,y+2);ctx.lineTo(x+1.6,y+8);ctx.fill();}
  if(M5.train>=0){const tx=-130+M5.train;
    for(let k=0;k<4;k++){const cx=tx+k*28;ctx.fillStyle='#161a2a';ctx.fillRect(cx,y-8,26,8);ctx.fillStyle='rgba(255,214,130,0.85)';for(let i=0;i<5;i++)ctx.fillRect(cx+2+i*5,y-6.5,3,2.5);}
    ctx.fillStyle='#fff4d0';ctx.fillRect(tx+110,y-5,2,2);ctx.fillStyle='rgba(255,240,200,0.12)';ctx.beginPath();ctx.moveTo(tx+112,y-5);ctx.lineTo(tx+150,y-10);ctx.lineTo(tx+150,y+2);ctx.closePath();ctx.fill();}
}
// haces del reflector: al cielo, al dirigible y bajando a la calle
function M5_beams(tw,sp,sa){
  const sl=M5.sl;
  if(sa>0.01){
    ctx.fillStyle=`rgba(255,238,190,${0.07*sa})`;ctx.beginPath();ctx.moveTo(tw.x-2.5,50);ctx.lineTo(sp.x-16,sp.y+3);ctx.lineTo(sp.x+16,sp.y+3);ctx.lineTo(tw.x+2.5,50);ctx.fill();
    ctx.fillStyle=`rgba(255,244,214,${0.07*sa})`;ctx.beginPath();ctx.moveTo(tw.x-1,50);ctx.lineTo(sp.x-7,sp.y+2);ctx.lineTo(sp.x+7,sp.y+2);ctx.lineTo(tw.x+1,50);ctx.fill();}
  if(sl.mode==='boss'&&sl.tx!==undefined&&sl.a>0.01){const bx=sl.tx-camX,by=sl.ty;
    ctx.fillStyle=`rgba(255,238,190,${0.09*sl.a})`;ctx.beginPath();ctx.moveTo(tw.x-2.5,50);ctx.lineTo(bx-6,by-13);ctx.lineTo(bx+6,by+13);ctx.lineTo(tw.x+2.5,50);ctx.fill();}
  // haz que baja a la calle (la parte de abajo se dibuja encima del mundo, en drawFx)
  if(sl.k>0.01){const gx=sl.gx-camX;ctx.fillStyle=`rgba(255,238,190,${0.06*sl.k})`;ctx.beginPath();ctx.moveTo(tw.x-2.5,50);ctx.lineTo(gx-22,GROUND);ctx.lineTo(gx+22,GROUND);ctx.lineTo(tw.x+2.5,50);ctx.fill();}
}
M5_LVL.drawBG=function(){
  if(!M5_FAR)M5_build();
  const g=ctx.createLinearGradient(0,0,0,GROUND);
  g.addColorStop(0,'#04050b');g.addColorStop(0.45,'#0d1122');g.addColorStop(0.8,'#1f1a30');g.addColorStop(1,'#3a2638');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const fl=M5_flashA();
  if(fl>0){ctx.fillStyle=`rgba(150,160,215,${0.5*fl})`;ctx.fillRect(0,0,W,GROUND);}
  M5_clouds(fl);
  // el reflector proyecta la tuerca en las nubes
  const sl=M5.sl,tw=M5_tower(),sa=(sl.mode==='boss'?0:M5_slA())*(1-sl.k),sp=M5_spot();
  M5_nut(sp.x,sp.y,15,0.5,M5_sweep()*0.35,sa,'14,14,26');
  if(fl>0&&M5.bolt)M5_drawBolt(fl);
  M5_strip(M5_FAR,M5_FARW,0.1);
  const offF=((camX*0.1)%M5_FARW+M5_FARW)%M5_FARW;
  for(const a of M5_ANT){const x=a.x-offF<-4?a.x-offF+M5_FARW:a.x-offF;if(x>W+4)continue;if(((T>>5)+a.s)%3===0){ctx.fillStyle='#ff3a30';ctx.fillRect(x-0.5,a.y-1,1.2,1.2);ctx.fillStyle='rgba(255,60,48,0.25)';circle(x,a.y-0.5,2.2);}}
  M5_trainBG();
  const off=M5_strip(M5_MID,M5_MIDW,0.32);
  M5_drawTower(tw);
  M5_beams(tw,sp,sa);
  // ventanas que se prenden y se apagan
  for(let i=0;i<M5_DYN.length;i++){const d=M5_DYN[i];let x=d.x-off;if(x<-4)x+=M5_MIDW;if(x>W+2)continue;
    if(M5_h(((T>>7)+i*13)|0)>0.45){ctx.fillStyle=i%5?'rgba(222,168,84,0.9)':'rgba(170,200,255,0.8)';ctx.fillRect(x,d.y+1,2,3.4);ctx.fillRect(x+0.5,d.y,1,1);}}
  // reloj de la torre
  if(M5_CLOCK){let x=M5_CLOCK.x-off;if(x<-6)x+=M5_MIDW;if(x<W+6){const y=M5_CLOCK.y;
    ctx.fillStyle='#d8c890';circle(x,y,3.4);ctx.strokeStyle='#121423';ctx.lineWidth=0.7;ctx.beginPath();
    const m=T/600,h=T/7200;ctx.moveTo(x,y);ctx.lineTo(x+Math.sin(m)*2.8,y-Math.cos(m)*2.8);ctx.moveTo(x,y);ctx.lineTo(x+Math.sin(h)*1.8,y-Math.cos(h)*1.8);ctx.stroke();}}
};

// ================== suelo: calle mojada, charcos, alcantarillas ==================
const M5_NEON=[{c:'#ff7ac8',rgb:'255,79,176',s:'HOTEL'},{c:'#8af2ff',rgb:'79,232,255',s:'BAR'},{c:'#ffc860',rgb:'255,180,58',s:'24 H'}];
M5_LVL.drawGround=function(){
  const x0=Math.floor(camX)-10;
  ctx.fillStyle='#101119';ctx.fillRect(x0,GROUND,W+20,H-GROUND);
  ctx.fillStyle='#2c2e3a';ctx.fillRect(x0,GROUND,W+20,2);ctx.fillStyle='#4a4e62';ctx.fillRect(x0,GROUND,W+20,0.7);
  ctx.fillStyle='rgba(200,170,80,0.25)';for(let x=Math.floor(camX/24)*24-24;x<camX+W+24;x+=24)ctx.fillRect(x,GROUND+14,10,1);
  for(let t=Math.floor(camX/10)-1;t<(camX+W)/10+1;t++){const h=M5_h(t+500);if(h<0.4){ctx.fillStyle=h<0.12?'#1c1e2a':'#0a0b12';ctx.fillRect(t*10+h*7,GROUND+4+Math.floor(h*977)%17,1+h*3,0.8);}}
  // reflejos de faroles y neones sobre el asfalto mojado
  for(const d of M5_LVL.decor){if(d.x<camX-30||d.x>camX+W+30)continue;
    const c=d.k==='farol'?'255,214,140':d.k==='neon'?M5_NEON[d.v].rgb:null;if(!c)continue;const lx=d.k==='farol'?d.x+8:d.x+5;
    for(let i=0;i<6;i++){const w=7-i,wob=Math.sin(T/9+i*1.3+d.x)*1.2;ctx.fillStyle=`rgba(${c},${0.2-i*0.03})`;ctx.fillRect(lx+wob-w/2,GROUND+2.5+i*3.2,w,1.3);}}
  for(const p of M5_LVL.puddles)if(p.x<camX+W+4&&p.x+p.w>camX-4)M5_puddle(p.x,p.w);
  for(const g of M5_LVL.grates)if(g>camX-12&&g<camX+W+12)M5_grate(g);
  // pilares de las cornisas (detrás de todas las plataformas)
  for(const pl of platforms)if(pl.hi==='cornisa'&&pl.x<camX+W+10&&pl.x+pl.w>camX-10)M5_pier(pl);
  // salpicaduras de la lluvia
  ctx.fillStyle='rgba(170,190,225,0.7)';
  for(let i=0;i<18;i++){const s=T+i*5,slot=s>>3,ph=s&7;if(ph>4)continue;const sx=camX+M5_h(slot*37+i*11)*W;
    ctx.fillRect(sx-1-ph*0.4,GROUND-ph*0.6,0.8,0.8);ctx.fillRect(sx+0.6+ph*0.4,GROUND-ph*0.6,0.8,0.8);}
};
function M5_puddle(x,w){
  ctx.fillStyle='#0a1020';ctx.beginPath();ctx.ellipse(x+w/2,GROUND+2.6,w/2,2.6,0,0,7);ctx.fill();
  ctx.fillStyle='rgba(120,150,200,0.25)';ctx.fillRect(x+5,GROUND+1,w-10,0.6);
  for(let i=0;i<w/6-1;i++){const h=M5_h((x|0)+i*7);if(h<0.5)continue;const c=h>0.85?'255,79,176':h>0.7?'79,232,255':'255,214,140';
    ctx.fillStyle=`rgba(${c},${0.25+0.15*Math.sin(T/12+i)})`;ctx.fillRect(x+4+i*6+Math.sin(T/15+i)*0.8,GROUND+1.6+h*1.6,2+h*2,0.7);}
  ctx.lineWidth=0.5;
  for(let i=0;i<Math.max(1,w/22);i++){const h=M5_h((x|0)*3+i),ph=((T+h*200)%40)/40,px=x+6+h*(w-12);
    ctx.strokeStyle=`rgba(180,200,235,${0.6*(1-ph)})`;ctx.beginPath();ctx.ellipse(px,GROUND+2.4,1+ph*5,0.4+ph*1.2,0,0,7);ctx.stroke();}
}
function M5_grate(x){
  ctx.fillStyle='#1c1e28';ctx.beginPath();ctx.ellipse(x,GROUND+3,9,2.4,0,0,7);ctx.fill();
  ctx.fillStyle='#3a3e4c';ctx.beginPath();ctx.ellipse(x,GROUND+2.6,8,1.8,0,0,7);ctx.fill();
  ctx.fillStyle='#14161e';for(let i=-6;i<=6;i+=3)ctx.fillRect(x+i,GROUND+1.6,1.2,2);
  ctx.fillStyle=`rgba(255,140,60,${0.10+0.05*Math.sin(T/20+x)})`;ctx.beginPath();ctx.ellipse(x,GROUND+2.6,6,1.2,0,0,7);ctx.fill();
}
function M5_pier(pl){
  const cx=pl.x+pl.w/2,y=pl.y+6;
  ctx.fillStyle='#1a1c2a';ctx.fillRect(cx-5,y,10,GROUND-y);
  ctx.fillStyle='#24283a';ctx.fillRect(cx-5,y,1.2,GROUND-y);
  ctx.fillStyle='#12141e';for(let yy=y+3;yy<GROUND;yy+=4){ctx.fillRect(cx-5,yy,10,0.6);ctx.fillRect(cx-2+((yy>>2)%2)*4,yy-3.4,0.6,3.4);}
  ctx.strokeStyle='#2a2e3c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx-5,y+16);ctx.lineTo(pl.x+2,y);ctx.moveTo(cx+5,y+16);ctx.lineTo(pl.x+pl.w-2,y);ctx.stroke();
  ctx.fillStyle='rgba(222,168,84,0.7)';if((T>>6)%4)ctx.fillRect(cx-1,y+24,2,3);
}

// ================== capa de arriba: haz en la calle, encandilados, lluvia y relámpago ==================
function M5_rainNear(){
  ctx.strokeStyle='rgba(190,210,240,0.4)';ctx.lineWidth=0.8;ctx.beginPath();
  for(let i=0;i<26;i++){const x=((i*71.3+T*2.6-camX*0.6)%(W+40)+W+40)%(W+40)-20,y=((i*131.7+T*9)%(H+30))-15;ctx.moveTo(x,y);ctx.lineTo(x-2.6,y+10);}
  ctx.stroke();
}
M5_LVL.drawFx=function(){
  const sl=M5.sl,tw=M5_tower();
  if(sl.k>0.01){const gx=sl.gx-camX;
    ctx.save();ctx.globalCompositeOperation='lighter';
    ctx.fillStyle=`rgba(255,236,180,${0.06*sl.k})`;ctx.beginPath();ctx.moveTo(tw.x-6,96);ctx.lineTo(gx-22,GROUND+1);ctx.lineTo(gx+22,GROUND+1);ctx.lineTo(tw.x+6,96);ctx.fill();
    ctx.fillStyle=`rgba(255,240,200,${0.06*sl.k})`;ctx.beginPath();ctx.moveTo(tw.x-2,96);ctx.lineTo(gx-10,GROUND+1);ctx.lineTo(gx+10,GROUND+1);ctx.lineTo(tw.x+2,96);ctx.fill();
    ctx.restore();
    M5_nut(gx,GROUND+2,15,0.28,T/60,sl.k,'22,18,32');
    // estrellitas sobre los soldados encandilados
    ctx.fillStyle='#ffe08a';
    for(const e of enemies)if(e.m5lit>0&&e.type!=='bat'){const x=e.x+e.w/2-camX,y=e.y-4,r=T/5;ctx.fillRect(q(x+Math.cos(r)*4),q(y+Math.sin(r)),1,1);ctx.fillRect(q(x-Math.cos(r)*4),q(y-Math.sin(r)),1,1);}
  }
  if(sl.mode==='boss'&&sl.tx!==undefined)M5_nut(sl.tx-camX,sl.ty,12,0.72,T/80,sl.a,'34,22,40');
  // niebla baja
  for(let i=0;i<4;i++){const sp=W+180,x=((i*113-camX*0.6+T*0.15)%sp+sp)%sp-90,y=GROUND-4+Math.sin(T/70+i)*2;
    ctx.fillStyle='rgba(150,160,200,0.06)';ctx.beginPath();ctx.ellipse(x,y,70,7,0,0,7);ctx.fill();}
  drawRain();M5_rainNear();
  const fl=M5_flashA();if(fl>0){ctx.fillStyle=`rgba(210,220,255,${0.1*fl})`;ctx.fillRect(0,0,W,H);}
};

// ================== decorado ==================
M5_LVL.drawDecor=function(d){
  const x=d.x,g=GROUND;
  switch(d.k){
  case 'farol':{ // farol de hierro con farola de vidrio; algunos titilan; se ve la lluvia en la luz
    const on=!(M5_h(x|0)<0.3&&(M5_h(((T>>2)+x)|0)<0.12));
    if(on){ctx.fillStyle='rgba(255,220,150,0.07)';ctx.beginPath();ctx.moveTo(x+8,g-42);ctx.lineTo(x-8,g);ctx.lineTo(x+24,g);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(255,220,150,0.12)';ctx.beginPath();ctx.ellipse(x+8,g+1,16,2,0,0,7);ctx.fill();
      ctx.fillStyle='rgba(255,236,190,0.6)';for(let i=0;i<4;i++){const yy=g-38+((T*3+i*11+x)%36);ctx.fillRect(x+3+i*3+(yy-g+38)*0.05,yy,0.6,2);}}
    ctx.fillStyle='#16181f';ctx.fillRect(x,g-44,2,44);ctx.fillRect(x-1,g-3,4,3);ctx.fillRect(x,g-44,8,1.5);ctx.fillRect(x+1,g-42,1,4);
    ctx.fillStyle='#22252e';ctx.fillRect(x+5,g-47,6,1.5);ctx.fillRect(x+6,g-48.5,4,1.5);
    ctx.fillStyle=on?'#ffe2a0':'#4a4232';ctx.fillRect(x+6,g-45.5,4,4);ctx.fillStyle='#16181f';ctx.fillRect(x+7.6,g-45.5,0.8,4);ctx.fillRect(x+5.5,g-41.5,5,1);
    return true;}
  case 'neon':{ // cartel de neón en un poste; a veces una letra falla
    const n=M5_NEON[d.v],off=M5_h(((T>>2)+x*7)|0)<0.025;
    ctx.fillStyle='#16181f';ctx.fillRect(x+4,g-30,2,30);
    if(n.s==='HOTEL'){
      ctx.fillStyle='#14121a';ctx.fillRect(x,g-62,10,32);
      if(!off){ctx.fillStyle=`rgba(${n.rgb},0.2)`;ctx.fillRect(x-3,g-65,16,38);ctx.strokeStyle=n.c;ctx.lineWidth=0.6;ctx.strokeRect(x+0.5,g-61.5,9,31);}
      ctx.font='bold 6px ui-monospace,Menlo,monospace';ctx.textAlign='center';ctx.textBaseline='top';
      for(let i=0;i<5;i++){const bad=i===3&&(T>>3)%5===0;ctx.fillStyle=off||bad?'#3a2030':n.c;ctx.fillText(n.s[i],x+5,g-61+i*6);}
    }else{
      const w=n.s.length*5+6;ctx.fillStyle='#14121a';ctx.fillRect(x-1,g-40,w,10);
      if(!off){ctx.fillStyle=`rgba(${n.rgb},0.2)`;ctx.fillRect(x-4,g-43,w+6,16);ctx.strokeStyle=n.c;ctx.lineWidth=0.6;ctx.strokeRect(x-0.5,g-39.5,w-1,9);}
      ctx.font='bold 6px ui-monospace,Menlo,monospace';ctx.textAlign='left';ctx.textBaseline='top';
      ctx.fillStyle=off?'#20303a':n.c;ctx.fillText(n.s,x+2,g-38.5);
      if(n.s==='BAR'){const gx=x+w+1,on=!off&&(T>>5)%2;ctx.strokeStyle=on?'#ff4fb0':'#3a2030';ctx.lineWidth=0.7;ctx.beginPath();ctx.moveTo(gx,g-40);ctx.lineTo(gx+6,g-40);ctx.lineTo(gx+3,g-36);ctx.closePath();ctx.moveTo(gx+3,g-36);ctx.lineTo(gx+3,g-33);ctx.moveTo(gx+1,g-33);ctx.lineTo(gx+5,g-33);ctx.stroke();}
    }
    return true;}
  case 'hidrante':
    ctx.fillStyle='#5a1e1a';ctx.fillRect(x+1,g-8,6,8);ctx.fillRect(x,g-6,8,2);ctx.fillStyle='#8a3028';ctx.fillRect(x+1,g-8,6,1);ctx.fillRect(x+2,g-10,4,2);
    ctx.fillStyle='rgba(200,220,255,0.35)';ctx.fillRect(x+2,g-9,1,6);return true;
  case 'tacho': // tacho de basura con bolsas
    ctx.fillStyle='#2a2c34';ctx.beginPath();ctx.ellipse(x+14,g-2.5,5,3,0,0,7);ctx.fill();ctx.fillStyle='#3a3c46';ctx.fillRect(x+12,g-5,1,1);
    ctx.fillStyle='#3e424c';ctx.fillRect(x,g-11,9,11);ctx.fillStyle='#565c68';ctx.fillRect(x-1,g-12,11,1.6);ctx.fillRect(x+3,g-13.5,3,1.5);
    ctx.fillStyle='#2e3038';for(let i=1;i<9;i+=2.5)ctx.fillRect(x+i,g-10,0.6,9);return true;
  case 'cabina':{ // cabina de teléfono con la luz de adentro que parpadea
    const on=(T>>3)%17!==0;
    ctx.fillStyle='#14202a';ctx.fillRect(x,g-30,12,30);ctx.fillStyle='#22323e';ctx.fillRect(x,g-30,12,2);
    ctx.fillStyle=on?'rgba(200,230,210,0.45)':'rgba(40,60,60,0.5)';ctx.fillRect(x+2,g-26,8,18);
    ctx.fillStyle='#14202a';ctx.fillRect(x+5.6,g-26,0.8,18);ctx.fillStyle='#0a0e12';ctx.fillRect(x+6.5,g-21,3,4);
    if(on){ctx.fillStyle='rgba(200,230,210,0.08)';ctx.fillRect(x-4,g-1,20,2);}return true;}
  case 'kiosco': // puesto de diarios cerrado, con persiana
    ctx.fillStyle='#1e2a24';ctx.fillRect(x,g-22,26,22);ctx.fillStyle='#2e4036';ctx.fillRect(x-2,g-24,30,3);
    ctx.fillStyle='#3a3e46';ctx.fillRect(x+2,g-19,22,15);ctx.fillStyle='#2a2e36';for(let y=g-18;y<g-4;y+=2)ctx.fillRect(x+2,y,22,0.7);
    ctx.fillStyle='#8a8478';ctx.fillRect(x+27,g-4,6,4);ctx.fillStyle='#6a6458';ctx.fillRect(x+27,g-3,6,0.6);return true;
  case 'gargola':{ // gárgola grande sobre un pedestal: escupe el agua de la lluvia
    ctx.fillStyle='#24242e';ctx.fillRect(x,g-16,16,16);ctx.fillStyle='#34343f';ctx.fillRect(x-1,g-17,18,2);ctx.fillRect(x-1,g-2,18,2);
    M5_gargStone(x+6,g-17,1,1.5);
    const sx=x+6+15,sy=g-23;ctx.fillStyle='rgba(170,200,240,0.6)';
    for(let i=0;i<8;i++){const ph=((T*0.8+i*3)%23)/23;ctx.fillRect(sx+ph*5,sy+ph*ph*23,0.9,1.6);}
    ctx.fillStyle='rgba(170,200,240,0.3)';ctx.beginPath();ctx.ellipse(sx+5,g,4,1,0,0,7);ctx.fill();
    return true;}
  }
  return false;
};
// gárgola de piedra (de cerca)
function M5_gargStone(bx,by,d,s){
  ctx.save();ctx.translate(bx,by);ctx.scale(d*s,s);
  ctx.fillStyle='#2a2a36';ctx.beginPath();ctx.moveTo(-4,-4);ctx.lineTo(-7,-13);ctx.lineTo(-3,-9);ctx.lineTo(-1,-6);ctx.closePath();ctx.fill();
  ctx.fillStyle='#4a4a58';ctx.beginPath();ctx.moveTo(-5,0);ctx.quadraticCurveTo(-6,-7,0,-8);ctx.quadraticCurveTo(4,-8,5,-5);ctx.lineTo(4,0);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(3,-6);ctx.lineTo(8,-7);ctx.lineTo(10,-5);ctx.lineTo(9,-3);ctx.lineTo(6,-3.5);ctx.lineTo(4,-3);ctx.closePath();ctx.fill();
  ctx.fillRect(4,-9.5,1,2.5);ctx.fillRect(6,-9,1,2);
  ctx.fillStyle='#3a3a46';ctx.fillRect(1,-1.5,4,1.5);ctx.fillRect(5,-1,1,1.5);
  ctx.fillStyle='#6a6a78';ctx.fillRect(-3,-7,4,0.8);ctx.fillRect(4,-7,3,0.7);
  ctx.fillStyle='#14121c';ctx.fillRect(8,-4.4,2,1);ctx.fillStyle='#9a8a6a';ctx.fillRect(7,-6,0.8,0.8);
  ctx.restore();
}

// ================== plataformas ==================
M5_LVL.drawPlat=function(pl){
  if(pl.roof){M5_trenBack(pl);return true;}
  if(pl.pyr){M5_tier(pl);return true;}
  if(pl.hi==='cornisa'){M5_cornisa(pl);return true;}
  if(pl.step){M5_pedestal(pl);return true;}
  if(pl.m5==='toldo'){M5_toldo(pl);return true;}
  M5_escalera(pl);return true;
};
// gotas que caen de un borde
function M5_drips(x,w,y,n,s){
  ctx.fillStyle='rgba(170,200,240,0.65)';
  for(let i=0;i<n;i++){const h=M5_h(s+i*17),ph=(T+h*400)%60,yy=y+ph*1.6;if(yy>=GROUND)continue;ctx.fillRect(x+3+h*(w-6),yy,0.7,1.6);}
}
// descanso de escalera de incendio: rejilla, baranda, ménsulas y la escalera que baja a la vereda
function M5_escalera(pl){
  const x=pl.x,y=pl.y,w=pl.w,lft=M5_h(x|0)<0.5,lx=lft?x+3:x+w-9;
  ctx.fillStyle='#262a34';ctx.fillRect(lx,y+3,1,GROUND-y-11);ctx.fillRect(lx+5,y+3,1,GROUND-y-11);
  for(let yy=y+6;yy<GROUND-9;yy+=4)ctx.fillRect(lx,yy,6,0.8);
  ctx.strokeStyle='#22262e';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+2,y+3);ctx.lineTo(x+2,y+9);ctx.lineTo(x+9,y+3);ctx.moveTo(x+w-2,y+3);ctx.lineTo(x+w-2,y+9);ctx.lineTo(x+w-9,y+3);ctx.stroke();
  ctx.fillStyle='#3a404c';for(let px=x;px<=x+w-1;px+=6)ctx.fillRect(px,y-8,1,8);ctx.fillRect(x,y-8,w,1);ctx.fillRect(x,y-4,w,0.6);
  ctx.fillStyle='#2e323c';ctx.fillRect(x,y,w,3);ctx.fillStyle='#646c7c';ctx.fillRect(x,y,w,0.9);
  ctx.fillStyle='#16181e';for(let i=2;i<w-1;i+=3)ctx.fillRect(x+i,y+1.3,1,1);
  M5_drips(x,w,y+3,2,x|0);
}
// toldo de negocio a rayas sobre dos parantes, con el agua que chorrea del volado
function M5_toldo(pl){
  const x=pl.x,y=pl.y,w=pl.w,v=(M5_h((x|0)+3)*3)|0,c=[['#8c2a34','#d8ccb0'],['#1e5a5a','#d0c8b0'],['#5a3a6a','#d0c4b4']][v];
  ctx.fillStyle='#22242c';ctx.fillRect(x+2,y,1.2,GROUND-y);ctx.fillRect(x+w-3.2,y,1.2,GROUND-y);
  ctx.fillStyle='rgba(255,214,150,0.06)';ctx.fillRect(x+3,y+8,w-6,GROUND-y-8);
  for(let i=0;i<w;i+=5){ctx.fillStyle=c[(i/5)%2];ctx.fillRect(x+i,y,Math.min(5,w-i),3.2);}
  ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(x,y+2.4,w,0.8);
  for(let i=0;i<w;i+=5){ctx.fillStyle=c[(i/5)%2];ctx.fillRect(x+i,y+3.2,Math.min(5,w-i),3);ctx.beginPath();ctx.arc(x+i+2.5,y+6.2,2.5,0,Math.PI);ctx.fill();}
  ctx.fillStyle='rgba(255,255,255,0.25)';ctx.fillRect(x,y,w,0.7);
  M5_drips(x,w,y+8,3,(x|0)+9);
}
// cornisa de azotea con gárgola que escupe agua
function M5_cornisa(pl){
  const x=pl.x,y=pl.y,w=pl.w;
  ctx.fillStyle='#3e3e4c';ctx.fillRect(x-2,y,w+4,6);ctx.fillStyle='#62626e';ctx.fillRect(x-2,y,w+4,1);
  ctx.fillStyle='#2a2a36';ctx.fillRect(x-2,y+4,w+4,1);for(let i=0;i<w+3;i+=3)ctx.fillRect(x-1+i,y+6,1.6,1.6);
  ctx.fillStyle='#3a3a46';for(let i=0;i<w;i+=8)ctx.fillRect(x+i,y-4,5,4);   // almenas bajitas
  M5_gargStone(x+w-1,y,1,1);
  const sx=x+w+9,sy=y-4;ctx.fillStyle='rgba(170,200,240,0.55)';
  for(let i=0;i<10;i++){const ph=((T*0.9+i*5)%50)/50,yy=sy+ph*ph*(GROUND-sy);ctx.fillRect(sx+ph*4,yy,0.8,1.8);}
  ctx.fillStyle='rgba(170,200,240,0.3)';ctx.beginPath();ctx.ellipse(sx+4,GROUND,3,0.8,0,0,7);ctx.fill();
}
// pedestal de piedra (arena del villano)
function M5_pedestal(pl){
  const x=pl.x,y=pl.y,w=pl.w;
  ctx.fillStyle='#2a2a36';ctx.fillRect(x+2,y+3,w-4,GROUND-y-3);
  ctx.fillStyle='#3e3e4c';ctx.fillRect(x,y,w,4);ctx.fillStyle='#62626e';ctx.fillRect(x,y,w,1);
  ctx.fillStyle='#20202a';for(let yy=y+8;yy<GROUND;yy+=6)ctx.fillRect(x+2,yy,w-4,0.7);ctx.fillRect(x+w/2,y+4,0.7,GROUND-y-4);
  ctx.fillStyle='#34343f';ctx.fillRect(x-1,GROUND-3,w+2,3);
}
// escalones del andamio de la obra
function M5_tier(pl){
  const x=pl.x,y=pl.y,w=pl.w,h=pl.pyr.dy,m=pl.mat;
  if(m==='ladrillo'){
    ctx.fillStyle='#2a1612';ctx.fillRect(x,y,w,h);
    for(let r=0;r<h-4;r+=3.5){const o=(r/3.5)%2?3:0;for(let i=x+o;i<x+w-2;i+=6.5){ctx.fillStyle=M5_h((i*7+r*13)|0)<0.5?'#7a3a2a':'#8c4a34';ctx.fillRect(i,y+r+0.5,5.8,3);}}
    ctx.fillStyle='#6a5030';ctx.fillRect(x,y+h-4,w,4);ctx.fillStyle='#3a2a18';for(let i=x+4;i<x+w;i+=10)ctx.fillRect(i,y+h-3,3,3);
  }else if(m==='andamio'){
    ctx.fillStyle='rgba(16,14,24,0.85)';ctx.fillRect(x,y+3,w,h-3);
    ctx.strokeStyle='#7a8290';ctx.lineWidth=0.9;ctx.beginPath();
    const cols=[x+1,x+w/2,x+w-1];for(const c of cols){ctx.moveTo(c,y+3);ctx.lineTo(c,y+h);}
    ctx.moveTo(x+1,y+h-1);ctx.lineTo(x+w-1,y+h-1);ctx.moveTo(x+1,y+3);ctx.lineTo(x+w/2,y+h-1);ctx.moveTo(x+w/2,y+3);ctx.lineTo(x+w-1,y+h-1);ctx.stroke();
    ctx.fillStyle='#8a6a3a';ctx.fillRect(x-1,y,w+2,3);ctx.fillStyle='#a8844a';ctx.fillRect(x-1,y,w+2,0.8);ctx.fillStyle='#5a4424';for(let i=x+5;i<x+w;i+=12)ctx.fillRect(i,y+0.8,0.6,2.2);
    if(pl.tier===3){const on=(T>>4)%2;ctx.fillStyle=on?'#ffa030':'#5a3410';ctx.fillRect(x+w/2-1,y-3,2,2);if(on){ctx.fillStyle='rgba(255,160,48,0.2)';circle(x+w/2,y-2,4);}}
    else{const lx=x+w*0.3;ctx.fillStyle='#2a2c34';ctx.fillRect(lx,y+3,0.6,4);ctx.fillStyle='#ffe2a0';ctx.fillRect(lx-1,y+7,2,1.5);ctx.fillStyle='rgba(255,220,150,0.08)';ctx.beginPath();ctx.moveTo(lx,y+8);ctx.lineTo(lx-8,y+h);ctx.lineTo(lx+8,y+h);ctx.fill();}
  }else{ // bolsas de cemento
    ctx.fillStyle='#1e1e22';ctx.fillRect(x,y,w,h);
    for(let r=0;r<4;r++){const n=Math.floor(w/9);for(let i=0;i<n;i++){ctx.fillStyle=(i+r)%2?'#8a8a86':'#a4a49a';ctx.beginPath();ctx.ellipse(x+4.5+i*9+(r%2)*2,y+3+r*6,4.8,3,0,0,7);ctx.fill();
      ctx.fillStyle='#8a3a2a';ctx.fillRect(x+3+i*9+(r%2)*2,y+2.6+r*6,3,0.8);}}
  }
  ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(x+w-3,y,3,h);
  ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(x,y+h-1,w,1);
}
// puente del tren elevado: columnas de acero remachadas, lamparita colgada; arriba, las vías
function M5_viga(x,y,w){
  ctx.fillStyle='#2e323e';ctx.fillRect(x,y,w,9);
  ctx.fillStyle='#565c6c';ctx.fillRect(x,y,w,1.6);ctx.fillStyle='#22252e';ctx.fillRect(x,y+7,w,2);
  ctx.strokeStyle='#3e4452';ctx.lineWidth=0.8;ctx.beginPath();for(let i=x;i<x+w-6;i+=8){ctx.moveTo(i,y+6.5);ctx.lineTo(i+4,y+2);ctx.lineTo(i+8,y+6.5);}ctx.stroke();
  ctx.fillStyle='#7a8090';for(let i=x+2;i<x+w;i+=4)ctx.fillRect(i,y+1.6,0.7,0.7);
  ctx.fillStyle='#3a2a20';for(let i=x+1;i<x+w-1;i+=5)ctx.fillRect(i,y-1,2.5,1);
  ctx.fillStyle='#8a90a0';ctx.fillRect(x,y-1.8,w,0.7);
}
function M5_trenBack(pl){
  const x=pl.x,y=pl.y,w=pl.w,iy=y+9,ih=GROUND-iy;
  const g=ctx.createLinearGradient(0,iy,0,GROUND);g.addColorStop(0,'rgba(4,4,10,0.95)');g.addColorStop(1,'rgba(16,16,30,0.85)');
  ctx.fillStyle=g;ctx.fillRect(x+3,iy,w-6,ih);
  const lx=x+w/2+12,on=(T>>2)%29!==0&&(T>>2)%31!==0;
  if(on){ctx.fillStyle='rgba(255,220,150,0.07)';ctx.beginPath();ctx.moveTo(lx,iy+8);ctx.lineTo(lx-22,GROUND);ctx.lineTo(lx+22,GROUND);ctx.fill();
    ctx.fillStyle='rgba(255,220,150,0.14)';ctx.beginPath();ctx.ellipse(lx,GROUND,18,1.6,0,0,7);ctx.fill();}
  for(const px of [x+2,x+w/2-14,x+w-12]){ctx.fillStyle='#3a3e4a';ctx.fillRect(px,iy,10,ih);ctx.fillStyle='#565c6c';ctx.fillRect(px,iy,1.5,ih);
    ctx.fillStyle='#262932';ctx.fillRect(px+8,iy,2,ih);ctx.fillRect(px-1,GROUND-3,12,3);ctx.fillStyle='#7a8090';for(let yy=iy+3;yy<GROUND-4;yy+=6){ctx.fillRect(px+2.5,yy,0.8,0.8);ctx.fillRect(px+6,yy,0.8,0.8);}}
  ctx.fillStyle='#22252e';ctx.fillRect(lx,iy,0.6,7);ctx.fillStyle=on?'#ffe2a0':'#4a4232';ctx.fillRect(lx-1.2,iy+7,2.6,2);
  M5_viga(x,y,w);
}
M5_LVL.drawTunnelFront=function(t){
  if(t.k!=='tren')return false;
  const iy=t.y+9;
  ctx.fillStyle='rgba(4,4,14,0.32)';ctx.fillRect(t.x,iy,t.w,GROUND-iy);
  const g=ctx.createLinearGradient(0,iy,0,iy+12);g.addColorStop(0,'rgba(0,0,8,0.5)');g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.fillRect(t.x,iy,t.w,12);
  M5_drips(t.x,t.w,iy,5,(t.x|0)+31);
  M5_viga(t.x,t.y,t.w);
  return true;
};

// ================== coberturas propias ==================
M5_LVL.drawCover=function(c){
  if(c.vida<=0)return false;
  const x=c.x,w=c.w,top=c.top,h=c.h;
  switch(c.k){
  case 'm5barrera':{ // barrera de hormigón con franjas reflectivas
    ctx.fillStyle='#5a5a62';ctx.beginPath();ctx.moveTo(x,GROUND);ctx.lineTo(x+3,top+5);ctx.lineTo(x+5,top);ctx.lineTo(x+w-5,top);ctx.lineTo(x+w-3,top+5);ctx.lineTo(x+w,GROUND);ctx.closePath();ctx.fill();
    ctx.fillStyle='#7a7a84';ctx.fillRect(x+5,top,w-10,1);
    ctx.save();ctx.beginPath();ctx.rect(x+3,top+4,w-6,4);ctx.clip();for(let i=-4;i<w;i+=6){ctx.fillStyle=(i/6|0)%2?'#e8e0d0':'#d86a2a';ctx.beginPath();ctx.moveTo(x+i,top+8);ctx.lineTo(x+i+3,top+4);ctx.lineTo(x+i+6,top+4);ctx.lineTo(x+i+3,top+8);ctx.fill();}ctx.restore();
    break;}
  case 'm5volqueta':{ // contenedor de basura con la tapa entreabierta
    ctx.fillStyle='#2e4a3a';ctx.fillRect(x,top+2,w,h-4);ctx.fillStyle='#3e6450';ctx.fillRect(x,top+2,w,1);
    ctx.fillStyle='#1e3428';for(let i=x+3;i<x+w-2;i+=4)ctx.fillRect(i,top+4,0.8,h-8);
    ctx.fillStyle='#24382c';ctx.save();ctx.translate(x,top+2);ctx.rotate(-0.12);ctx.fillRect(0,-1.5,w,1.8);ctx.restore();
    ctx.fillStyle='#14161c';circle(x+3,GROUND-1.5,1.5);circle(x+w-3,GROUND-1.5,1.5);
    ctx.fillStyle='rgba(255,79,176,0.5)';ctx.fillRect(x+4,top+7,5,0.8);ctx.fillRect(x+6,top+6,0.8,3);   // grafiti
    break;}
  case 'm5tachos':
    for(let i=0;i<2;i++){const dx=x+i*(w/2),dw=w/2-1;ctx.fillStyle=i?'#4a4e58':'#5a5e68';ctx.fillRect(dx,top+1,dw,h-1);
      ctx.fillStyle='#6a707c';ctx.fillRect(dx-0.5,top,dw+1,1.4);ctx.fillStyle='#363a42';for(let k=1.5;k<dw;k+=2.5)ctx.fillRect(dx+k,top+2,0.5,h-3);}
    break;
  default:return false;
  }
  if(c.vida<c.max*0.5){ctx.fillStyle='rgba(10,10,14,0.55)';ctx.fillRect(x+w*0.25,top+1,1,h*0.5);ctx.fillRect(x+w*0.7,top,2,2);}
  return true;
};
