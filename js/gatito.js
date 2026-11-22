'use strict';
// Óxido · Gatito amigo
// En cada misión hay un gatito encerrado en una jaulita. Se libera tocándola o disparándole.
// Se suma al grupo: te sigue, no dispara; se lanza sobre los enemigos que te disparan y los araña
// (de a poco: a los jefes les saca como mucho un 12 % por pelea y nunca les da el golpe final).
// Tiene una barrita de vida arriba: cada cosa le saca distinto (bala poco; fuego, explosión o jefe mucho).
// Se cura con comida para gato (latita o pescadito) que cae de cajas, de algunos enemigos o aparece cada tanto.
// Si se queda sin vida se vuelve un gatito ángel: flota cerca de quien lo rescató y araña drones (nunca los mata
// solo). El ángel dura hasta el final de la misión. El gato vivo pasa de misión con vos.

let gato=null,gatoJaula=null,gatoMarcas=[],gatoVigila=[],gatoHint=false,gatoComida=[],gatoComidaT=0,gatoReserva=0;
const CAT_MAXHP=100;
// contadores para las pruebas (rasguños y daño hecho)
const gatoStats={rasg:0,rasgJefe:0,dmgSold:0,dmgJefe:0,golpes:0,bajas:0,comidas:0,angel:0,angelRasg:0,angelDmg:0};
const CAT_G=0.34,CAT_W=12,CAT_H=8;
const CAT_COL={k:'#17141f',g:'#9aa0ad',G:'#5f6472',c:'#f1e4c6',o:'#e08a3c',e:'#a6f05a',n:'#ff8fa8',b:'#4fa84a',w:'#ffffff'};
// dónde está la jaulita en cada misión (y: piso sobre el que apoya). Si falta, se elige sola.
const CAT_SPOTS={
  0:{x:733,y:120},   // misión 1: arriba de la plataforma baja, después de las bolsas de arena
  1:{x:1846,y:GROUND}, // misión 2: en el muelle, pegada a la torreta
  2:{x:772,y:GROUND}   // misión 3: en la orilla del charco de barro de donde salen las criaturas
};

// ---------- lugar de la jaula ----------
function CAT_autoSpot(){
  const arenas=(L.arenas||[]).map(a=>[a.at-20,a.at+W+20]);
  const libre=x=>!arenas.some(([a,b])=>x>a&&x<b)&&!(L.prisoners||[]).some(p=>Math.abs(p.x-x)<40);
  const ideal=L.end*0.35;let best=null,bd=1e9;
  for(const pl of platforms){
    if(pl.hi||pl.step||pl.pyr||pl.roof||pl.y<96||pl.w<36)continue;
    const x=pl.x+pl.w/2-7;if(x<L.end*0.15||x>L.end*0.7||!libre(x))continue;
    const d=Math.abs(x-ideal);if(d<bd){bd=d;best={x,y:pl.y};}
  }
  if(best)return best;
  for(let x=ideal;x<L.end-400;x+=40)if(libre(x))return{x,y:GROUND};
  return{x:ideal,y:GROUND};
}
function CAT_mkCage(){
  const s=CAT_SPOTS[levelIdx]||CAT_autoSpot();
  return{x:s.x,y:s.y-14,w:16,h:14,st:'shut',t:0,ph:(s.x*13)|0};
}
function CAT_mk(x,y){
  return{x,y,w:CAT_W,h:CAT_H,vx:0,vy:0,face:1,onGround:false,plat:null,st:'follow',t:0,lives:1,hp:CAT_MAXHP,shown:CAT_MAXHP,inv:0,heartT:0,barB:0,owner:0,
    cd:60,tgt:null,n:0,nMax:16,jcd:0,dist:0,ax:0,ay:0,sx:0,sy:0,dur:0,arc:0,trail:[],blink:0,said:0};
}

// ---------- arranque de cada misión ----------
ON_START.push(function(carry){
  gatoMarcas=[];gatoVigila=[];gatoHint=false;gatoComida=[];gatoComidaT=0;gatoReserva=0;
  if(!carry||(gato&&!CAT_vivo()))gato=null; // el ángel no pasa de misión: hay que rescatar otro gato
  if(gato){ // pasa de misión con vos, con la vida que tenía
    const hp=gato.hp,own=gato.owner;gato=CAT_mk(26,GROUND-CAT_H);gato.hp=gato.shown=hp;gato.owner=own;gato.onGround=true;gato.heartT=150;gatoJaula=null;
  }else gatoJaula=CAT_mkCage();
});

// ---------- ayudas ----------
// vivo = rescatado y con vida (ni ángel ni subiendo); lo usan partida.js (logro MICHI A SALVO) y el bot
const CAT_vivo=()=>!!gato&&gato.st!=='angel'&&gato.st!=='ascend';
// el ángel sigue a quien rescató al gato (si no está, al que va adelante)
const CAT_lead=()=>{const o=gato&&gato.st==='angel'?players[gato.owner]:null;if(o&&!o.dead)return o;const p=typeof leadP==='function'?leadP():P;return p;};
function CAT_leadPos(){
  const p=CAT_lead();if(!p||p.dead)return null;
  if(p.ride){const m=p.ride;return{x:m.x+m.w/2,feet:m.y+m.h,face:p.face||1};}
  return{x:p.x+4,feet:p.y+p.h,face:p.face};
}
function CAT_meow(kind){
  if(kind==='sad'){tone('triangle',900,520,0.32,0.035);later(120,()=>tone('triangle',700,420,0.3,0.03));return;}
  if(kind==='hurt'){tone('sawtooth',1300,620,0.14,0.03);return;}
  tone('triangle',620,1050,0.08,0.03);later(70,()=>tone('triangle',1050,700,0.16,0.03));
}
function CAT_scratchSfx(big){noise(0.05,big?0.07:0.05,5200);later(35,()=>noise(0.04,big?0.05:0.035,4200));}
// el gato llega por tierra: nada que vuele, y solo lo que pisa el suelo o una plataforma a su alcance
function CAT_reach(e,g){
  if(!e||e.type==='drone'||e.air)return false;
  const feet=e.y+e.h;if(feet>GROUND+3)return false;
  const onFloor=feet>=GROUND-3||e.onGround||platforms.some(pl=>Math.abs(pl.y-feet)<=4&&e.x+e.w>pl.x&&e.x<pl.x+pl.w);
  return onFloor&&Math.abs(g.y+g.h-feet)<=74;
}
const CAT_alive=e=>e&&!e.gone&&hittable(e)&&!(isBoss(e)&&e.air)&&e.type!=='drone'&&onScreen(e,0);
const CAT_bossCap=e=>isBoss(e)&&(e.gatoDmg||0)>=(e.max||e.hp)*0.12;
// prioridad: el que está apuntando o disparando ahora; si no, el más cercano por tierra
function CAT_pick(g){
  let best=null,bs=1e9;const cx=g.x+6;
  for(const e of enemies){
    if(!hittable(e)||!onScreen(e,-4)||!CAT_reach(e,g)||CAT_bossCap(e))continue;
    const d=Math.abs(e.x+e.w/2-cx);if(d>230)continue;
    const busy=e.state==='aim'||(e.type==='turret'&&e.burst>0)||(isBoss(e)&&e.state==='fight');
    const sc=d-(busy?400:0);if(sc<bs){bs=sc;best=e;}
  }
  return best;
}
function CAT_anchor(g,e,first){
  // punto alrededor del cuerpo del enemigo (relativo a su esquina), alternando de lado
  if(first)return{ox:e.w/2-6,oy:-7};
  const side=g.n%2,half=Math.max(4,e.w/2);
  const ox=side?rand(half-4,e.w-5):rand(-6,half-8);
  return{ox,oy:rand(-8,Math.min(e.h-10,22))};
}
// cuánto le saca cada cosa (de 100): bala 14 · criaturas (garras, mordiscos, esporas, ondas) 24 · fuego 30 ·
// granada, bomba o misil 48 · obús de jefe 62 · manotazo de jefe 72. Con una bala no muere; con un golpe de jefe casi.
const CAT_DMG={bala:14,criatura:24,fuego:30,explosion:48,obus:62,jefe:72};
function CAT_dmgDe(b){
  if(b.blast)return b.blast>=20?CAT_DMG.obus:CAT_DMG.explosion;
  if(/fuego|flame|llama|fire/i.test(b.kind||''))return CAT_DMG.fuego;
  if(b.kind==='bullet'&&!b.upd)return CAT_DMG.bala;
  return CAT_DMG.criatura;
}
function CAT_hurt(g,amt){
  if(g.inv>0||!CAT_vivo()||g.st==='free')return;
  amt=amt||CAT_DMG.criatura;
  g.hp=Math.max(0,g.hp-amt);g.inv=amt>=40?70:45;g.heartT=200;g.barB=8;gatoStats.golpes++;
  parts.push({k:'txt',s:'¡MIAU!',x:g.x+6,y:g.y-8,life:40,maxl:40});
  for(let i=0;i<5;i++)parts.push({k:'p',x:g.x+6,y:g.y+3,vx:rand(-1.2,1.2),vy:rand(-1.8,-0.4),g:0.12,life:rand(16,26),maxl:26,size:1,col:'#c9ccd6'});
  if(g.hp<=0){CAT_alAngel(g);return;}
  CAT_meow('hurt');
  if(g.st==='scratch'||g.st==='pounce'||g.st==='dash'){g.st='hop';g.tgt=null;g.t=0;}
  g.cd=Math.max(g.cd,150);
  g.vy=-2.6;g.vx=-g.face*1.4;g.onGround=false;
}
function CAT_mark(x,y,big,oro){
  gatoMarcas.push({oro:!!oro,x,y,a:rand(-1.15,-0.55)*(Math.random()<0.5?1:-1),len:big?rand(12,17):rand(6,9),lw:big?1.5:1,life:big?40:26,max:big?40:26});
  if(gatoMarcas.length>40)gatoMarcas.shift();
}
function CAT_scratch(g,e){
  const big=isBoss(e)||e.w>24;g.n++;gatoStats.rasg++;
  const mx=clamp(g.x+6+g.face*5+rand(-3,3),e.x+1,e.x+e.w-1),my=clamp(g.y+4+rand(-3,5),e.y+1,e.y+e.h-2);
  CAT_mark(mx,my,big);
  if(big&&Math.random()<0.7)CAT_mark(e.x+rand(3,e.w-3),e.y+rand(3,Math.max(4,e.h-6)),true);
  for(let i=0;i<3;i++)parts.push({k:'p',x:mx,y:my,vx:rand(-1.4,1.4),vy:rand(-1.6,0),g:0.12,life:rand(8,14),maxl:14,size:1,col:i%2?'#ffffff':'#ffb3c6'});
  CAT_scratchSfx(big);
  let d;
  if(isBoss(e)){
    const cap=(e.max||e.hp)*0.12,done=e.gatoDmg||0;
    d=Math.min(Math.max(0.05,(e.max||e.hp)*0.0015),cap-done);
    if(e.hp-d<1)d=0; // el golpe final al villano es del jugador
    if(d>0){e.gatoDmg=done+d;gatoStats.dmgJefe+=d;gatoStats.rasgJefe++;}
  }else{d=0.3;gatoStats.dmgSold+=Math.min(d,Math.max(0,e.hp));}
  if(d>0){const wasHp=e.hp;killSrc='cat';dmg(e,d);killSrc=null;if(e.gone&&wasHp>0)gatoStats.bajas++;}
  if(g.n%5===1)tone('triangle',1500,1100,0.04,0.012);
  // a veces el jefe se lo saca de encima de un manotazo (saca mucho)
  if(isBoss(e)&&!e.air&&Math.random()<0.08){CAT_hurt(g,CAT_DMG.jefe);if(CAT_vivo()){g.st='hop';g.tgt=null;g.t=0;g.vy=-3.4;g.vx=-g.face*2.2;g.onGround=false;g.cd=200;}}
}


// ---------- muerte: gatito ángel ----------
function CAT_alAngel(g){
  g.hp=0;g.shown=0;g.st='ascend';g.t=0;g.tgt=null;g.trail=[];g.vy=0;g.vx=0;g.inv=0;g.heartT=0;gatoStats.angel++;
  // sonido corto y dulce, no triste: tres notas que suben
  tone('triangle',880,880,0.09,0.03);later(90,()=>tone('triangle',1175,1175,0.09,0.03));later(180,()=>tone('sine',1568,1760,0.28,0.03));
  for(const f of gatoComida)f.fade=f.fade||20; // la comida que quedaba se va
  gatoReserva=0;
}
// el ángel solo va contra lo que vuela (lo que el gato vivo no alcanzaba)
const CAT_volador=e=>e&&!e.gone&&hittable(e)&&!isBoss(e)&&(e.type==='drone'||e.air)&&onScreen(e,-4);
function CAT_updAngel(g,lp){
  if(g.cd>0)g.cd--;
  const bob=Math.sin(g.t*0.07)*3;
  if(g.tgt){ // vuela hasta el dron y lo araña una vez
    const e=g.tgt;
    if(!CAT_volador(e)){g.tgt=null;g.cd=60;return;}
    const tx=e.x+e.w/2-6,ty=e.y-2,dx=tx-g.x,dy=ty-g.y;
    g.x+=clamp(dx*0.18,-3,3);g.y+=clamp(dy*0.18,-3,3);g.face=Math.sign(e.x+e.w/2-g.x-6)||g.face;
    if(Math.abs(dx)<4&&Math.abs(dy)<5){
      // araña poquito: como mucho el 45 % de lo que le queda, así nunca lo mata solo
      const d=Math.min(e.hp*0.45,Math.max(0.3,(e.max||e.hp)*0.3));
      if(d>0.01){killSrc='cat';dmg(e,d);killSrc=null;gatoStats.angelRasg++;gatoStats.angelDmg+=d;}
      CAT_mark(e.x+e.w/2+rand(-2,2),e.y+e.h/2+rand(-2,2),false,'oro');CAT_mark(e.x+e.w/2+rand(-3,3),e.y+e.h/2,false,'oro');
      tone('triangle',1400,1900,0.05,0.016);
      g.tgt=null;g.cd=rand(150,210)|0; // espera un rato entre arañazos
    }
    return;
  }
  // flota cerca del jugador, detrás y un poco arriba, con vaivén suave
  if(lp){const tx=lp.x-lp.face*16-6,ty=lp.feet-30+bob;g.x+=(tx-g.x)*0.06;g.y+=(ty-g.y)*0.08;
    if(Math.abs(tx-g.x)>2)g.face=Math.sign(tx-g.x);}
  if(g.cd<=0){let best=null,bd=90;for(const e of enemies){if(!CAT_volador(e))continue;const d=Math.hypot(e.x+e.w/2-g.x-6,e.y+e.h/2-g.y-4);if(d<bd){bd=d;best=e;}}
    if(best){g.tgt=best;tone('sine',1200,1600,0.06,0.012);}}
}

// ---------- comida para gato ----------
// Latita o pescadito (diseño propio). Sale solo con el gato vivo: si le falta vida, de cajas (35 %), de enemigos (6 %)
// y cada ~25 s en el mapa; con la barrita llena, muy de vez en cuando. Como mucho 3 en el piso. Con la barrita llena
// queda en el piso hasta que la necesite. Si queda atrás y sale de pantalla no se pierde: se guarda (gatoReserva)
// y reaparece adelante, cayendo del cielo, la próxima vez que al gato le falte vida. La levanta el gato o un jugador.
const CAT_COMIDA_CURA=40;
function CAT_soltarComida(x,y,prob){
  if(!CAT_vivo()||gato.st==='free'||gatoComida.length>=3)return;
  const p=gato.hp<CAT_MAXHP?prob:prob*0.08;if(Math.random()>=p)return;
  CAT_ponerComida(x,y);
}
function CAT_ponerComida(x,y){ // y<0: cae del cielo y llega al piso (no a una plataforma alta)
  gatoComida.push({x:x-3,y:Math.min(y,GROUND-10),w:7,h:5,vy:-2.2,vx:rand(-0.4,0.4),onGround:false,k:Math.random()<0.5?'lata':'pez',t:0,fade:0,piso:y<0});
}
const CAT_comidaCerca=g=>gatoComida.find(f=>!f.fade&&f.onGround&&onScreen(f,-6)&&Math.abs(f.x-g.x)<150&&Math.abs(f.y+f.h-(g.y+g.h))<40)||null;
function CAT_comer(g,f,quien){
  f.fade=-1;gatoStats.comidas++;
  const antes=g.hp;g.hp=Math.min(CAT_MAXHP,g.hp+CAT_COMIDA_CURA);g.heartT=Math.max(g.heartT,90);
  // se suma como todo lo demás (recolectar.js): la comida vuela a la barrita, y la barrita sube cuando llega,
  // con el mismo golpecito, brillo y sonido de llegada
  if(typeof RC_vuela==='function'){RC_ancla('gato',HX(g.x+6),HY(g.y-5));RC_vuela('comida',HX(f.x+3),HY(f.y+2),'gato',null,g.hp-antes,{pop:6});}
  else g.barB=12;
  // ronroneo corto (o miau si la trajo un jugador)
  if(quien==='gato'){for(let i=0;i<4;i++)later(i*70,()=>noise(0.06,0.02,180));}else later(60,()=>CAT_meow());
}
function CAT_updComida(g){
  const vivo=CAT_vivo()&&g&&g.st!=='free';
  // cada tanto aparece una en el mapa (cae del cielo un poco adelante)
  if(vivo&&!lock&&g.hp<70&&++gatoComidaT>1500){gatoComidaT=0;CAT_soltarComida(camX+VW*0.7+rand(-30,30),-10,1);}
  // la que quedó atrás se guarda y vuelve adelante cuando hace falta (de a una, cada 2 s como mucho)
  for(const f of gatoComida)if(!f.fade&&f.x+f.w<camX-4){f.fade=-1;gatoReserva++;}
  if(vivo&&gatoReserva>0&&g.hp<CAT_MAXHP&&gatoComida.filter(f=>!f.fade).length<3&&T%120===0&&!CAT_comidaCerca(g)){
    gatoReserva--;CAT_ponerComida(camX+VW*0.6+rand(-20,20),-10);}
  for(const f of gatoComida){
    f.t++;if(f.fade>0&&--f.fade===0)f.fade=-1;
    if(!f.onGround){const pb=f.y+f.h;f.x+=f.vx;f.vy=Math.min(f.vy+0.18,5);f.y+=f.vy;land(f,pb,!f.piso);}
    if(!vivo||f.fade)continue;
    if(g.hp>=CAT_MAXHP)continue; // con la barrita llena queda en el piso
    if(overlap({x:g.x,y:g.y,w:g.w,h:g.h},f)){CAT_comer(g,f,'gato');continue;}
    for(const p of players){if(p.dead)continue;if(overlap(hurtbox(p),f)){CAT_comer(g,f,'jugador');break;}}
  }
  for(const f of gatoComida)if(f.y>=GROUND+20&&f.fade!==-1){f.fade=-1;if(vivo)gatoReserva++;} // si cae a un pozo, también se guarda
  gatoComida=gatoComida.filter(f=>f.fade!==-1);
}
// cajas y enemigos sueltan comida (envolviendo las funciones de combate.js, sin tocarlas)
{
  const k0=kill;kill=function(e){const was=e.gone,r=k0.apply(this,arguments);
    if(!was&&e.gone&&!isBoss(e))CAT_soltarComida(e.x+e.w/2,e.y+e.h/2,0.06);return r;};
  const c0=dmgCrate;dmgCrate=function(c){const was=c.gone,r=c0.apply(this,arguments);
    if(!was&&c.gone)CAT_soltarComida(c.x+c.w/2,c.y,0.35);return r;};
}
function CAT_drawComida(f,hud){
  if(!hud&&!onScreen(f,8))return;
  if(f.fade>0&&(f.fade>>1)%2)return;
  const x=q(f.x),y=q(f.y)+(f.onGround?Math.round(Math.sin(f.t*0.08)*0.5):0);
  if(!hud){ctx.fillStyle='rgba(0,0,0,0.25)';ctx.fillRect(x,q(f.y)+f.h,7,1);}
  if(f.k==='lata'){ctx.fillStyle='#17141f';ctx.fillRect(x-1,y-1,9,7); // latita: tapa plateada, etiqueta celeste con una espina de pescado
    ctx.fillStyle='#c8ced8';ctx.fillRect(x,y,7,5);ctx.fillStyle='#8a93a3';ctx.fillRect(x,y+4,7,1);
    ctx.fillStyle='#5fc3e4';ctx.fillRect(x,y+1,7,3);ctx.fillStyle='#ffffff';ctx.fillRect(x+1,y+2,5,1);ctx.fillRect(x+5,y+1,1,3);
  }else{ // pescadito: cuerpo naranja con panza clara, cola en V y ojito (contorno que sigue la forma)
    const R=[[1,1,4,3,'#ff9a3c'],[0,2,1,1,'#ff9a3c'],[5,2,1,1,'#e0702a'],[6,1,1,1,'#e0702a'],[6,3,1,1,'#e0702a'],[7,0,1,1,'#e0702a'],[7,4,1,1,'#e0702a']];
    ctx.fillStyle='#17141f';for(const[rx,ry,rw,rh]of R)ctx.fillRect(x+rx-1,y+ry-1,rw+2,rh+2);
    for(const[rx,ry,rw,rh,c]of R){ctx.fillStyle=c;ctx.fillRect(x+rx,y+ry,rw,rh);}
    ctx.fillStyle='#ffd08a';ctx.fillRect(x+1,y+3,4,1);ctx.fillStyle='#17141f';ctx.fillRect(x+1,y+2,1,1);
  }
  // brillito para que se note que se levanta
  if((f.t>>4)%3===0){ctx.fillStyle='rgba(255,255,255,0.9)';ctx.fillRect(x+6,y-2,1,1);}
}
// barrita de vida: verde, amarilla, roja; parpadea en el último tramo
function CAT_dibIcono(x,y){CAT_drawComida({x:Math.round(x)-3,y:Math.round(y)-2,h:5,t:0,fade:0,onGround:false,k:'lata'},true);} // en el HUD (pantalla)
function CAT_drawBar(g){
  const sal=typeof RC_salto==='function'?RC_salto('gato'):0,luz=typeof RC_luz==='function'&&RC_luz('gato');
  if(typeof RC_ancla==='function')RC_ancla('gato',HX(g.x+6),HY(g.y-5));
  const w=12,x=q(g.x),y=q(g.y-(g.st==='scratch'||g.st==='pounce'?6:5))+sal,ks=g.shown/CAT_MAXHP,k=Math.min(g.hp/CAT_MAXHP,ks+(g.shown<g.hp?0:1));
  if(k<0.2&&(T>>3)%2)return;
  ctx.fillStyle='#17141f';ctx.fillRect(x-1,y-1,w+2,3);
  ctx.fillStyle='#3a2a30';ctx.fillRect(x,y,w,1);
  const col=k>0.55?'#5ce36a':k>0.25?'#ffd23a':'#ff4a4a';
  // lo que se acaba de perder queda un instante en blanco; lo que se suma entra de a poco
  if(ks>k){ctx.fillStyle='#ffffff';ctx.fillRect(x,y,w*ks,1);}
  ctx.fillStyle=(g.barB>0&&(g.barB>>1)%2)||(luz&&(T>>1)%2)?'#ffffff':col;ctx.fillRect(x,y,w*Math.min(k,ks),1);
}
function CAT_drawAngel(g){
  const a=g.st==='ascend'?0.35+0.4*Math.min(1,g.t/30):0.55;
  // brillo suave alrededor
  ctx.fillStyle='rgba(255,246,200,'+(a*0.25).toFixed(3)+')';ctx.beginPath();ctx.arc(g.x+6,g.y+4,9,0,Math.PI*2);ctx.fill();
  // alitas que aletean
  const fl=(g.t>>3)%2;ctx.globalAlpha=a;ctx.fillStyle='#ffffff';
  const wx=g.face>0?g.x+1:g.x+7;ctx.fillRect(q(wx),q(g.y-fl),4,2);ctx.fillRect(q(wx+1),q(g.y-2-fl),3,2);ctx.fillRect(q(wx+2),q(g.y-3-fl),2,1);
  ctx.globalAlpha=1;
  CAT_drawPose(CAT_pose({st:'cage',vx:0,onGround:true,x:g.x,dist:0,t:g.t}),g.x,g.y,g.face,a);
  // aureola dorada
  const hx=g.face>0?g.x+7:g.x+1;ctx.globalAlpha=Math.min(1,a+0.25);ctx.strokeStyle='#ffd84a';ctx.lineWidth=0.8;
  ctx.beginPath();ctx.ellipse(hx+2,g.y-3.5,2.6,0.9,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
}

// ---------- jaula ----------
function CAT_free(){
  const c=gatoJaula;if(!c||c.st!=='shut')return;
  c.st='open';c.t=0;addScore(300,c.x+8,c.y-6);emit('rescue',{kind:'cat'});SFX.pick();CAT_meow();
  for(let i=0;i<8;i++)parts.push({k:'p',x:c.x+rand(0,16),y:c.y+rand(0,10),vx:rand(-1.8,1.8),vy:rand(-2.6,-0.6),g:0.16,life:rand(24,36),maxl:36,size:1.5,col:i%2?'#9aa0a8':'#6e4824'});
  parts.push({k:'txt',s:'¡MIAU!',x:c.x+8,y:c.y-10,life:50,maxl:50});
  const g=CAT_mk(c.x+2,c.y+3);g.st='free';g.vy=-4.2;g.vx=0.6;g.onGround=false;g.heartT=240;gato=g;
  let bd=1e9;players.forEach((p,i)=>{if(p.dead)return;const d=Math.abs(p.x-c.x);if(d<bd){bd=d;g.owner=i;}});
}
function CAT_updCage(){
  const c=gatoJaula;if(!c)return;c.t++;
  if(c.st==='shut'){
    if(!gatoHint&&onScreen(c,-30)){gatoHint=true;if(!banner||banner.t<=0)setBanner('¡UN GATITO! LLEGÁ O DISPARALE A LA JAULA',110);}
    if(touchAny(c)){CAT_free();return;}
    for(const b of pbul){
      if(b.gone||b.ally)continue;
      const r=b.k==='flame'?(b.r||2):1.5;
      if(overlapPt(c,b.x,b.y,r)){if(b.k==='rocket')rocketBoom(b);else if(b.k!=='flame')b.gone=true;CAT_free();return;}
    }
  }else if(c.t>90)gatoJaula=null;
}

// ---------- cada cuadro ----------
ON_STEP.push(function(){
  CAT_updCage();
  for(const m of gatoMarcas)m.life--;
  gatoMarcas=gatoMarcas.filter(m=>m.life>0);
  const g=gato;
  // explosiones de la vuelta anterior (granadas, obuses, bombas) que estallaron cerca
  if(g)for(const b of gatoVigila)if(b.gone&&Math.hypot(g.x+6-b.x,g.y+4-Math.min(b.y,GROUND-2))<(b.blast||12)+2)CAT_hurt(g,CAT_dmgDe(b));
  gatoVigila=eproj.filter(b=>b.blast&&!b.upd&&!b.gone);
  if(!g)return;
  g.t++;if(g.inv>0)g.inv--;if(g.heartT>0)g.heartT--;if(g.jcd>0)g.jcd--;if(--g.blink<-200)g.blink=6;
  // balas y proyectiles especiales que lo tocan
  CAT_updComida(g);
  if(CAT_vivo()&&g.st!=='free'){
    const hb={x:g.x+1,y:g.y+1,w:g.w-2,h:g.h-1};
    for(const b of eproj){
      if(b.gone||typeof b.x!=='number')continue;
      if(b.kind==='bullet'&&!b.upd){if(overlapPt(hb,b.x,b.y,b.r||1.5)){b.gone=true;CAT_hurt(g,CAT_dmgDe(b));}}
      else if(typeof b.y==='number'&&(b.upd||!b.blast)){const r=(b.r||b.rad||2)*0.6;if(overlapPt(hb,b.x,b.y,r))CAT_hurt(g,CAT_dmgDe(b));}
      if(!CAT_vivo())break;
    }
  }
  const lp=CAT_leadPos();
  // salta las ondas que van por el piso
  if(CAT_vivo()&&g.onGround&&(g.st==='follow'||g.st==='dash'||g.st==='hop'))for(const b of eproj)if(b.upd&&!b.gone&&b.y>GROUND-6&&Math.abs(b.x-g.x-6)<20){g.vy=-4.2;g.onGround=false;g.plat=null;break;}
  switch(g.st){
  case 'free':
    CAT_phys(g,true);
    if(g.t>34&&g.onGround){g.st='follow';g.cd=50;setBanner('¡UN GATITO SE SUMA!',70);}
    break;
  case 'ascend':{ // sube despacito con brillo y se vuelve ángel
    g.y-=0.55;g.vx=0;if(g.t%4===0)parts.push({k:'p',x:g.x+rand(0,12),y:g.y+rand(0,8),vx:rand(-0.3,0.3),vy:rand(-0.8,-0.2),g:0,life:rand(18,30),maxl:30,size:1,col:g.t%8<4?'#fff6c8':'#ffffff'});
    if(g.t>=56){g.st='angel';g.t=0;g.cd=60;setBanner('¡EL GATITO ES UN ÁNGEL! ARAÑA DRONES',90);}
    break;}
  case 'angel':CAT_updAngel(g,lp);break;
  case 'follow':case 'hop':{
    if(g.st==='hop'&&g.onGround&&g.t>8)g.st='follow';
    if(g.cd>0)g.cd--;
    if(g.st==='follow'&&g.cd<=0&&lp){const e=CAT_pick(g);if(e){g.st='dash';g.tgt=e;g.t=0;break;}}
    const fd=g.hp<CAT_MAXHP&&g.st==='follow'?CAT_comidaCerca(g):null;
    if(fd&&lp){ // tiene hambre y hay comida a la vista: va a buscarla
      const dx=fd.x+3-(g.x+6);g.vx=Math.abs(dx)>3?Math.sign(dx)*2.2:0;if(g.vx)g.face=Math.sign(g.vx);
      CAT_phys(g,true);break;}
    if(lp&&g.st==='follow'){
      const slot=12+allies.length*14+(players.length>1?10:0)+(bossRef&&bossRef.state==='fight'?22:0);
      const tx=lp.x-lp.face*slot-6,dx=tx-g.x;
      g.vx=Math.abs(dx)>5?Math.sign(dx)*Math.min(2.3,Math.abs(dx)*0.09+0.5):0;
      const feet=g.y+g.h;
      if(g.onGround&&!g.jcd&&lp.feet<feet-12&&Math.abs(lp.x-g.x-6)<70){
        g.vy=-Math.min(7,Math.sqrt(2*CAT_G*(feet-lp.feet+10)));g.onGround=false;g.plat=null;g.jcd=24;
        g.vx=Math.sign(lp.x-g.x-6||1)*1.6;
      }else if(g.onGround&&g.plat&&lp.feet>feet+12){
        const pl=g.plat;g.vx=(lp.x<pl.x+pl.w/2?-1:1)*1.8; // se baja por el borde
      }
      if(g.vx)g.face=Math.sign(g.vx);else if(Math.abs(lp.x-g.x-6)>4)g.face=Math.sign(lp.x-g.x-6);
    }else if(!lp)g.vx*=0.8;
    CAT_phys(g,true);
    break;}
  case 'dash':{
    const e=g.tgt;
    if(!CAT_alive(e)||CAT_bossCap(e)||g.t>220){g.st='follow';g.tgt=null;g.cd=40;break;}
    const ex=e.x+e.w/2,dx=ex-(g.x+6);g.face=Math.sign(dx)||g.face;
    g.vx=Math.sign(dx)*2.9;
    if(Math.abs(dx)<64&&g.onGround){ // se lanza
      const a=CAT_anchor(g,e,true);g.ax=a.ox;g.ay=a.oy;g.sx=g.x;g.sy=g.y;g.st='pounce';g.t=0;
      const ty=e.y+a.oy,dist=Math.hypot(e.x+a.ox-g.x,ty-g.y);
      g.dur=clamp(Math.round(dist/3.6),10,24);g.arc=10+Math.max(0,g.y-ty)*0.5;g.n=0;
      g.nMax=isBoss(e)?rand(14,20)|0:rand(9,13)|0;
      if(Math.random()<0.5)tone('triangle',800,1300,0.06,0.02);
      break;}
    CAT_phys(g,true);
    break;}
  case 'pounce':{
    const e=g.tgt;
    if(!CAT_alive(e)){g.st='hop';g.tgt=null;g.vy=-1;g.cd=40;g.t=0;CAT_phys(g,true);break;}
    const k=g.t/g.dur,tx=e.x+g.ax,ty=e.y+g.ay;
    g.x=g.sx+(tx-g.sx)*k;g.y=g.sy+(ty-g.sy)*k-g.arc*4*k*(1-k);g.vy=k<0.5?-2:2;g.onGround=false;
    g.face=Math.sign(e.x+e.w/2-g.x-6)||g.face;
    if(g.t>=g.dur){g.st='scratch';g.t=0;g.heartT=Math.max(g.heartT,60);}
    break;}
  case 'scratch':{
    const e=g.tgt;
    if(!CAT_alive(e)||CAT_bossCap(e)||g.n>=g.nMax){
      // salta para afuera y vuelve con el jugador un ratito
      const killed=!e||e.gone;
      g.st='hop';g.tgt=null;g.t=0;g.vy=-3;g.vx=-g.face*1.3;g.onGround=false;g.plat=null;
      g.cd=killed&&g.n<g.nMax?80:rand(130,190)|0;
      CAT_phys(g,true);break;}
    g.heartT=Math.max(g.heartT,40);
    if(g.t%6===0){const a=CAT_anchor(g,e,false);g.ax=a.ox;g.ay=a.oy;}
    const tx=e.x+g.ax,ty=e.y+g.ay;
    g.x+=(tx-g.x)*0.5;g.y+=(ty-g.y)*0.5-Math.abs(Math.sin(g.t*0.55))*0.8;
    g.face=Math.sign(e.x+e.w/2-g.x-6)||g.face;
    g.trail.push({x:g.x,y:g.y});if(g.trail.length>3)g.trail.shift();
    if(g.t%8===4)CAT_scratch(g,e);
    break;}
  }
  if(g.st!=='scratch'&&g.trail.length)g.trail.shift();
  // nunca se queda fuera de cuadro (salvo cuando huye)
  if(gato&&CAT_vivo()&&g.st!=='pounce'&&g.st!=='scratch')g.x=clamp(g.x,camX+2,camX+VW-g.w-2);
  // la barrita persigue a la vida real: baja rápido y sube de a poco (así se ve sumar al comer)
  // mientras la comida vuela, lo que suma queda retenido; al llegar, sube de a poco
  const vuela=typeof RC_vuelos!=='undefined'?RC_vuelos.filter(f=>f.anc==='gato').reduce((a,f)=>a+f.amt,0):0,meta=Math.max(0,g.hp-vuela);
  if(gato){if(g.shown>meta)g.shown=Math.max(meta,g.shown-2.5);else if(g.shown<meta)g.shown=Math.min(meta,g.shown+1.2);if(g.barB>0)g.barB--;g.lives=CAT_vivo()?1:0;}
});
function CAT_phys(g,clampIt){
  const pb=g.y+g.h,wasAir=!g.onGround;
  g.x+=g.vx;g.vy=Math.min(g.vy+CAT_G,6);g.y+=g.vy;land(g,pb,true);
  if(g.onGround&&Math.abs(g.vx)>0.05)g.dist+=Math.abs(g.vx);
  if(wasAir&&g.onGround&&g.st!=='flee')dust(g.x+6,g.y+g.h,1);
}

// ---------- dibujo ----------
// cada pose es una lista de rectángulos [x,y,w,h,color] mirando a la derecha, en una caja de 12×8 (pie en y=8)
const CAT_HEAD=(hx,hy,flat)=>[[hx,hy+1,4,4,'g'],...(flat?[[hx,hy+1,1,1,'G'],[hx+3,hy+1,1,1,'g']]:[[hx,hy,1,1,'o'],[hx+3,hy,1,1,'g']]),
  [hx+2,hy+2,1,1,'e'],[hx+3,hy+3,1,1,'n'],[hx+2,hy+4,2,1,'c']];
function CAT_pose(g){
  const st=g.st;
  if(st==='pounce'||st==='scratch'||(!g.onGround&&st!=='flee')){
    const up=st==='scratch'&&((g.t>>2)&1);
    return[[-2,3,3,1,'g'],[-2,3,1,1,'G'],[1,3,9,3,'g'],[3,3,1,2,'G'],[5,3,1,2,'G'],[2,5,6,1,'c'],
      ...CAT_HEAD(9,0,st==='scratch'),[9,5,3,1,'b'],
      [0,6,2,1,'g'],[2,6,1,1,'g'],
      ...(up?[[12,1,1,3,'g'],[13,0,1,1,'w'],[13,2,1,1,'w']]:[[10,6,3,1,'g'],[13,6,1,1,'w']])];
  }
  const moving=Math.abs(g.vx)>0.15&&g.onGround;
  if(!moving&&st!=='flee'){ // sentado: cola sobre el piso que se mueve de a ratos
    const tw=((T+((g.x*3)|0))>>5)%4===0;
    return[[0,7,4,1,'g'],tw?[0,5,1,2,'G']:[0,6,1,1,'G'],[2,3,6,5,'g'],[3,4,1,2,'G'],[5,4,1,2,'G'],[7,4,2,3,'c'],
      ...CAT_HEAD(7,-1,false),[7,4,3,1,'b'],[8,5,1,3,'g'],[8,7,1,1,'c'],[3,7,2,1,'c']];
  }
  const LEGS=[[1,3,8,10],[3,4,7,8],[2,4,7,9],[3,5,6,8]];
  const n=Math.floor(g.dist/3)%4,bob=n%2,lg=LEGS[n];
  const tail=st==='flee'?[[-1,-1,3,4,'g'],[-1,-1,1,1,'G'],[1,-1,1,1,'G']]:[[1,2,1,1,'g'],[0,1,1,1,'g'],[0,0,1,1,'G']];
  return[...tail,[2,3+bob,7,3,'g'],[4,3+bob,1,2,'G'],[6,3+bob,1,2,'G'],[3,5+bob,5,1,'c'],
    ...CAT_HEAD(8,bob,st==='flee'),[8,5+bob,3,1,'b'],
    ...lg.map(x=>[x,6,1,2,'g']),...lg.map(x=>[x,7,1,1,'c'])];
}
function CAT_drawPose(rects,x,y,f,alpha){
  const X=(rx,rw)=>f>0?x+rx:x+CAT_W-rx-rw;
  if(alpha!==undefined)ctx.globalAlpha=alpha;
  ctx.fillStyle=CAT_COL.k;
  for(const[rx,ry,rw,rh]of rects)ctx.fillRect(q(X(rx,rw)-1),q(y+ry-1),rw+2,rh+2);
  for(const[rx,ry,rw,rh,c]of rects){ctx.fillStyle=CAT_COL[c];ctx.fillRect(q(X(rx,rw)),q(y+ry),rw,rh);}
  if(alpha!==undefined)ctx.globalAlpha=1;
}
function CAT_heart(x,y,on){
  ctx.fillStyle='#17141f';ctx.fillRect(q(x-0.5),q(y-0.5),4,3.5);
  ctx.fillStyle=on?'#ff5a78':'#4a2f3a';ctx.fillRect(q(x),q(y),1,1);ctx.fillRect(q(x+2),q(y),1,1);ctx.fillRect(q(x),q(y+1),3,1);ctx.fillRect(q(x+1),q(y+2),1,1);
}
function CAT_drawCage(c){
  if(!onScreen(c,20))return;
  const sh=c.st==='shut'&&(T+c.ph)%170<18?(((T>>1)&1)?0.6:-0.6):0,x=c.x+sh,y=c.y;
  if(c.st==='shut'){
    ctx.fillStyle='rgba(30,22,26,0.8)';ctx.fillRect(x,y+2,16,10);
    // gatito sentado adentro, mirando hacia el jugador
    CAT_drawPose(CAT_pose({st:'cage',vx:0,onGround:true,x:c.x,dist:0,t:0}),x+2,y+3,-1);
    ctx.fillStyle='rgba(190,196,206,0.9)';for(let i=0;i<=16;i+=4)ctx.fillRect(q(x+i-0.35),q(y+2),0.7,10);
    ctx.fillStyle='#5a3a22';ctx.fillRect(x-1,y,18,2);ctx.fillRect(x-1,y+12,18,2);
    ctx.fillStyle='#7a5232';ctx.fillRect(x-1,y,18,0.8);ctx.fillRect(x-1,y+12,18,0.6);
    ctx.fillStyle='#2a2a30';ctx.fillRect(x+6,y-2,4,1);ctx.fillRect(x+6,y-2,1,2);ctx.fillRect(x+9,y-2,1,2);
    if(nearAny(x+8,120)&&(T>>4)%3){
      ctx.fillStyle='rgba(255,255,255,0.92)';ctx.fillRect(x-3,y-11,22,7);ctx.fillRect(x+7,y-4,2,2);
      txt('¡MIAU!',x+8,y-10.2,4.2,'#120c18','center',false);
    }
  }else{ // jaula abierta: queda la base y se desvanece
    ctx.globalAlpha=clamp(1-c.t/90,0,1);
    ctx.fillStyle='#5a3a22';ctx.fillRect(x-1,y+12,18,2);
    ctx.fillStyle='rgba(190,196,206,0.9)';ctx.fillRect(x+0.5,y+6,0.7,6);ctx.fillRect(x+15,y+8,0.7,4);
    ctx.globalAlpha=1;
  }
}
function CAT_drawMarks(){
  for(const m of gatoMarcas){
    const age=m.max-m.life,grow=clamp(age/4,0,1),a=clamp(m.life/(m.max*0.6),0,1);
    const ca=Math.cos(m.a),sa=Math.sin(m.a),nx=-sa,ny=ca,l=m.len*grow;
    for(let i=-1;i<=1;i++){
      const ox=m.x+nx*i*m.lw*2.2-ca*m.len/2,oy=m.y+ny*i*m.lw*2.2-sa*m.len/2;
      ctx.strokeStyle=m.oro?`rgba(255,210,80,${a*0.8})`:`rgba(255,120,160,${a*0.8})`;ctx.lineWidth=m.lw+0.8;
      ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+ca*l,oy+sa*l);ctx.stroke();
      ctx.strokeStyle=`rgba(255,255,255,${a})`;ctx.lineWidth=m.lw*0.6;
      ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+ca*l,oy+sa*l);ctx.stroke();
    }
  }
}
ON_DRAW.push(function(){
  if(gatoJaula)CAT_drawCage(gatoJaula);
  CAT_drawMarks();
  for(const f of gatoComida)CAT_drawComida(f);
  const g=gato;if(!g)return;
  if(g.st==='angel'||g.st==='ascend'){CAT_drawAngel(g);return;}
  // rastro de velocidad mientras araña
  g.trail.forEach((p,i)=>CAT_drawPose(CAT_pose(g),p.x,p.y,g.face,0.15+i*0.08));
  if(!(g.inv>0&&(g.inv>>2)%2))CAT_drawPose(CAT_pose(g),g.x,g.y,g.face);
  if(g.st==='scratch'&&(T>>1)%2){ctx.fillStyle='rgba(255,255,255,0.7)';const sx=g.face>0?g.x-3:g.x+g.w+1;ctx.fillRect(q(sx),q(g.y+2),2,0.6);ctx.fillRect(q(sx-1),q(g.y+5),3,0.6);}
  if(g.st!=='free')CAT_drawBar(g);
});
