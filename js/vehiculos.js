'use strict';
// Óxido · Un vehículo por misión, con el arte de arte-vehiculos.js
// (Segundo programador. Va después de fusion-carga.js y antes de juego.js; necesita grillo.js, fusion.js y
//  arte-vehiculos.js cargados antes.)
//
// Todos usan el MISMO sistema que la CHATARRA (grillo.js): se suben con ↑, se bajan con ↓ + saltar, tienen blindaje
// propio, cañón con proyectiles contados (el ESPECIAL), combustible de vuelo y fusión I/II/III (fusion.js y la carga de
// fusion-carga.js). Cada uno cambia su forma de moverse y su ataque. Con CONTROLES SIMPLES: ↑ salta y, mantenido, vuela;
// DISPARAR ataca (y tira el especial cuando está listo); GRANADA, el especial; ↓ dos veces, bajarse.
//   M1 CHATARRA   la de siempre: salta y vuela con jetpack (no se toca)
//   M2 GAVIOTA    hidroavión: vuela bajo (techo ~80 px), baja planeando; doble ametralladora · ESPECIAL: bomba que cae
//   M3 LIBÉLULA   planea sobre el barro (el barro no la frena), sube con ↑ y baja despacio; aguijones rápidos ·
//                 ESPECIAL: embestida que atraviesa
//   M4 PLANEADOR  planea (cae muy despacio con ↑), motorcito débil y CORRIENTES DE ARENA que lo suben; ballesta ·
//                 ESPECIAL: bolsa de arena que cae
//   M5 FAROL      globo lento con foco que ilumina; tira en diagonal hacia abajo · ESPECIAL: fogonazo que encandila
//                 (los enemigos del cono no disparan unos segundos)
//   M6 TABLA      tabla de luz que flota, rápida, doble salto; discos de luz · ESPECIAL: abanico de 5 discos
//   M7 IMÁN       camina; con ↑ se pega a los techos (abajo de las plataformas) y sube por las paredes (los costados de
//                 las cajas y columnas); pernos · ESPECIAL: pulso imán que borra las balas enemigas cercanas
//   M8 PTERO      pájaro de chapa: cada toque de ↑ en el aire es un aletazo, mantenido planea; picotazos ·
//                 ESPECIAL: picada (cae en picada y pisotea)
//   M9 CAMPANA    campana voladora: suena al atacar; ondas de sonido que atraviesan (sirven con los fantasmas) ·
//                 ESPECIAL: ¡DONG! alrededor
//   M10 MONTACARGAS  de chatarra: plataforma con jaula y cadenas que SUBE y BAJA por dos guías (↑ la sube, ↓ la
//                 baja, queda a la altura que la dejes) y avanza sobre orugas cortas; la base siempre en el piso.
//                 Cañoncito · ESPECIAL: gancho con cadena que sale adelante, pega y vuelve (y trae lo que enganche).
//                 (Antes era una vagoneta sobre rieles: se cambió, junto con la rueda del templo armaba una escena
//                 conocida de una película.)
// Ganchos (envolviendo funciones de grillo.js y fusion.js; ningún archivo existente cambia): mechJet (vuelo), mechFire
// (ataque), mechCannon (especial), updMech (velocidad, posición del que maneja, embestidas), drawMech, drawMechHUD,
// enterMech, mechBreak, FU_fusionar (los carteles con el nombre), updEnemy (encandilados), ON_START/STEP/DRAW.
// window.VH_OFF = true: todas las misiones con la CHATARRA, como antes.
// Prefijo VH_.
const VH_NOM=['CHATARRA','GAVIOTA','LIBÉLULA','PLANEADOR','FAROL','TABLA','IMÁN','PTERO','CAMPANA','MONTACARGAS'];
const VH_EL=[0,0,0,1,1,0,1,1,0,1]; // masculino: "EL PLANEADOR", "DEL PLANEADOR"
// vuelo: 'jet' (↑ mantenido sube) · 'planeo' · 'tabla' · 'iman' · 'aleteo' · 'montacargas' (sube y baja la jaula; techo = altura máxima)
// sube: velocidad al subir · caida: velocidad máxima al bajar sin ↑ · techo: altura máxima sobre el piso · gasto: combustible por cuadro
// vel: multiplicador de velocidad · envion: 1 = responde al toque, menos = tarda en arrancar y frenar
// cd: cuadros entre disparos · esp: especial · espCd: cuadros entre especiales · flota: px que flota sobre el piso (dibujo)
const VH_DEF=[null,
  {vuelo:'jet',sube:1.7,caida:1.1,techo:80,gasto:0.8,vel:1.15,envion:0.25,cd:6,tiro:'doble',esp:'bomba',espCd:30,ayuda:'MANTENÉ ↑: VOLAR BAJO'},
  {vuelo:'jet',sube:1.5,caida:0.45,techo:90,gasto:1,vel:1.05,envion:0.3,cd:7,tiro:'aguijon',esp:'embestida',espCd:50,flota:4,sinBarro:true,ayuda:'MANTENÉ ↑: SUBIR · PLANEA SOLA'},
  {vuelo:'planeo',sube:0.7,caida:0.35,techo:120,gasto:1.4,vel:1.1,envion:0.2,cd:10,tiro:'ballesta',esp:'bomba',espCd:32,ayuda:'↑ EN EL AIRE: PLANEAR · BUSCÁ LAS CORRIENTES'},
  {vuelo:'jet',sube:0.85,caida:0.5,techo:115,gasto:0.5,vel:0.8,envion:0.06,cd:6,tiro:'abajo',esp:'destello',espCd:90,ayuda:'MANTENÉ ↑: INFLAR · TIRA HACIA ABAJO'},
  {vuelo:'tabla',vel:1.55,envion:0.18,cd:5,tiro:'disco',esp:'abanico',espCd:40,flota:5,ayuda:'↑ DOS VECES: DOBLE SALTO'},
  {vuelo:'iman',vel:1,envion:1,cd:8,tiro:'perno',esp:'pulso',espCd:60,ayuda:'↑ CERCA DE UN TECHO O UNA PARED: PEGARSE'},
  {vuelo:'aleteo',caida:0.7,gasto:30,vel:1.2,envion:0.2,cd:6,tiro:'pico',esp:'picada',espCd:45,ayuda:'TOCÁ ↑ EN EL AIRE: ALETEAR'},
  {vuelo:'jet',sube:1.3,caida:0.7,techo:100,gasto:0.8,vel:1,envion:0.25,cd:14,tiro:'onda',esp:'dong',espCd:60,ayuda:'MANTENÉ ↑: VOLAR · SUENA AL ATACAR'},
  {vuelo:'montacargas',sube:1.1,baja:1.6,techo:70,vel:0.95,envion:0.35,cd:9,tiro:'canon',esp:'gancho',espCd:45,ayuda:'MANTENÉ ↑: SUBIR LA JAULA · ↓: BAJARLA'}];
const VH_ESP={gancho:'GANCHO',bomba:'BOMBA',embestida:'EMBESTIDA',destello:'FOGONAZO',abanico:'ABANICO',pulso:'PULSO IMÁN',picada:'PICADA',dong:'¡DONG!'};
const VH_ON=()=>!window.VH_OFF&&typeof AV_dibujar==='function';
const VH_t=m=>m&&m.tipo>0&&VH_DEF[m.tipo]?m.tipo:0;
const VH_d=m=>VH_DEF[VH_t(m)];
function VH_nombre(m){return VH_NOM[VH_t(m)]+['',' II',' III'][Math.max(0,Math.min(2,((m&&m.lvl)||1)-1))];}
const VH_conArt=(m,de)=>{const i=VH_t(m);return(de?(VH_EL[i]?'DEL ':'DE LA '):(VH_EL[i]?'EL ':'LA '))+VH_nombre(m);};
const VH_alArt=m=>(VH_EL[VH_t(m)]?'AL ':'A LA ')+VH_nombre(m); // "SUBIR AL PLANEADOR", "SUBIR A LA GAVIOTA"
// el dibujo nuevo del MONTACARGAS lo hace Arte (AV_DEF[9].montacargas); hasta que esté, uno propio de respaldo (VH_dibMonta)
const VH_artMonta=()=>typeof AV_DEF!=='undefined'&&AV_DEF[9]&&AV_DEF[9].montacargas;
const VH_MONTA={w:26,h:18};
const VH_tam=i=>i===9&&!VH_artMonta()?VH_MONTA:AV_TAM[i];
const VH_mult=m=>1+0.35*(((m&&m.lvl)||1)-1); // daño por nivel de fusión

// ---------- cada misión con su vehículo ----------
function VH_preparar(m,i){
  if(!VH_ON()||!i||!AV_TAM[i]||m.tipo===i)return;
  const t=VH_tam(i),b=m.y+m.h;m.tipo=i;m.w=t.w;m.h=t.h;m.y=b-m.h;m.vhv=0;m.vhF=0;m.vhAtk=0;m.vhAlt=0;m.vhBase=b;
}
ON_START.push(()=>{
  VH_ondas.length=0;VH_corr.length=0;
  for(const m of mechs)VH_preparar(m,levelIdx);
  // M3: el barro no frena a la LIBÉLULA
  if(L.speedMul&&!L.speedMul.vh){const s0=L.speedMul;L.speedMul=function(o){if(o&&VH_d(o)&&VH_d(o).sinBarro)return 1;return s0.apply(this,arguments);};L.speedMul.vh=1;}
  // M4: corrientes de arena (columnas que suben al PLANEADOR)
  if(VH_ON()&&mechs.some(m=>VH_t(m)===3))for(let x=420;x<LEVEL_END-500;x+=rand(300,420))VH_corr.push({x,w:30});
});

// ---------- piso, techo y pared ----------
function VH_piso(m){let y=GROUND;for(const pl of platforms)if(!pl.roof&&m.x+m.w>pl.x&&m.x<pl.x+pl.w&&pl.y>=m.y+m.h-1&&pl.y<y)y=pl.y;return y;}
const VH_solida=pl=>pl.box||pl.hi||pl.pyr;
const VH_abajoDe=pl=>pl.roof?pl.y+(pl.h||8):pl.y+4;

// ================== vuelo (mechJet: se llama antes de la gravedad, que suma 0,28) ==================
const VH_VY=v=>v-0.28; // para que después de la gravedad quede v
{const j0=mechJet;mechJet=function(m,want){
  const d=VH_d(m);if(!d||!VH_ON())return j0(m,want);
  const U=held('jump'),D=held('down'),alt=VH_piso(m)-(m.y+m.h);
  const recarga=()=>{m.fuel=Math.min(m.fmax,m.fuel+m.fmax/1200);};
  switch(d.vuelo){
  case 'jet':{
    if(m.jetLock&&m.fuel>=m.fmax*0.15)m.jetLock=false;
    if(U&&!D&&!m.jetLock&&m.fuel>0){
      m.fuel=Math.max(0,m.fuel-d.gasto);if(m.fuel<=0){m.jetLock=true;setBanner('¡SIN COMBUSTIBLE!',50);}
      m.onGround=false;m.plat=null;m.vy=VH_VY(alt>=d.techo?Math.max(0,alt-d.techo)*0.05:-d.sube);
      if(T%9===0)VH_soplo(m);return true;}
    recarga();if(!m.onGround&&!D)m.vy=Math.min(m.vy,VH_VY(d.caida));
    return false;}
  case 'planeo':{
    const c=VH_corr.find(c=>m.x+m.w>c.x&&m.x<c.x+c.w);
    if(c&&!m.onGround&&!D){m.vy=VH_VY(Math.max(-1.8,m.vy-0.25));if(T%6===0)dust(m.x+m.w/2,m.y+m.h+4,2);recarga();return true;} // corriente de arena: sube
    if(m.jetLock&&m.fuel>=m.fmax*0.15)m.jetLock=false;
    if(U&&!m.onGround&&!D){
      if(!m.jetLock&&m.fuel>0&&alt<d.techo){m.fuel=Math.max(0,m.fuel-d.gasto);if(m.fuel<=0)m.jetLock=true;m.vy=VH_VY(-d.sube);if(T%7===0)VH_soplo(m);return true;}
      m.vy=Math.min(m.vy,VH_VY(d.caida));return false;}
    recarga();if(!m.onGround&&!D)m.vy=Math.min(m.vy,VH_VY(1.3));return false;}
  case 'tabla':{
    if(m.onGround)m.vhSaltos=0;
    else if(tapped('jump')&&!D&&(m.vhSaltos||0)<1){m.vhSaltos=1;m.vy=-5.4;SFX.jump();for(let i=0;i<5;i++)parts.push({k:'p',x:m.x+m.w/2+rand(-8,8),y:m.y+m.h,vx:rand(-0.6,0.6),vy:rand(0.3,1),g:0,life:14,maxl:14,size:1,col:'#7ae0ff'});}
    if(!m.onGround&&U&&m.vy>0)m.vy=Math.min(m.vy,VH_VY(1.6)); // mantenido: cae más suave
    recarga();return false;}
  case 'iman':return VH_iman(m,U,D);
  case 'aleteo':{
    if(!m.onGround&&tapped('jump')&&!D&&m.fuel>=d.gasto){m.fuel-=d.gasto;m.vy=-3.3;VH_aleteo(m);}
    if(!m.onGround&&U&&!D)m.vy=Math.min(m.vy,VH_VY(d.caida));
    recarga();return false;}
  case 'montacargas':return VH_monta(m,U,D);
  default:recarga();return false;
  }
};}
function VH_soplo(m){const f=m.face;parts.push({k:'smoke',col:'210,210,220',x:m.x+m.w/2-f*m.w*0.4,y:m.y+m.h*0.6,vx:-f*rand(0.3,0.8),vy:rand(0.1,0.5),life:rand(18,28),maxl:28,size:rand(1.2,2.2)});}
function VH_aleteo(m){tone('triangle',300,180,0.08,0.04);noise(0.06,0.05,1400);
  for(let i=0;i<4;i++)parts.push({k:'smoke',col:'200,190,170',x:m.x+m.w/2+rand(-6,6),y:m.y+m.h,vx:rand(-0.6,0.6),vy:rand(0.4,1.1),life:16,maxl:16,size:1.5});}
// IMÁN: ↑ contra el costado de una caja o columna sube por la pared (primero); cerca de un techo, se pega abajo de la plataforma
function VH_iman(m,U,D){
  if(m.techo){const pl=m.techo;
    if(!U||D||m.x+m.w<pl.x-2||m.x>pl.x+pl.w+2){m.techo=null;m.vy=0.5;tone('square',300,120,0.06,0.03);return false;}
    m.y=VH_abajoDe(pl);m.vy=VH_VY(0);m.onGround=false;m.plat=null;return false;}
  if(m.pared){const pl=m.pared;
    if(!U||D){m.pared=null;return false;}
    if(m.y+m.h<=pl.y+1){m.pared=null;m.y=pl.y-m.h;m.vy=0;m.onGround=true;m.plat=pl;m.x=m.face>0?pl.x+2:pl.x+pl.w-m.w-2;return false;} // arriba: se para
    m.x=m.face>0?pl.x-m.w+3:pl.x+pl.w-3;m.vy=VH_VY(-1.3);m.onGround=false;m.plat=null;if(T%14===0)SFX.step();return false;}
  if(U&&!D){
    for(const pl of platforms){if(!VH_solida(pl))continue;
      const frente=m.face>0?m.x+m.w:m.x,lado=m.face>0?pl.x:pl.x+pl.w;
      if(Math.abs(frente-lado)<5&&m.y+m.h>pl.y+2&&m.y+m.h<=GROUND+1){m.pared=pl;tone('square',500,900,0.06,0.04);VH_chispas(lado,m.y+m.h/2);return false;}}
    for(const pl of platforms){if(VH_solida(pl))continue;const ab=VH_abajoDe(pl);
      if(m.x+m.w>pl.x+2&&m.x<pl.x+pl.w-2&&ab<=m.y+1&&m.y-ab<40){m.techo=pl;m.y=ab;m.vy=VH_VY(0);tone('square',500,900,0.06,0.04);VH_chispas(m.x+m.w/2,ab);return false;}}
  }
  return false;
}
// MONTACARGAS: la base va por el piso (baja si se termina la plataforma, nunca se sube sola a una más alta); la jaula
// sube con ↑ y baja con ↓ por las guías, y se queda a la altura que la dejes. No salta.
function VH_monta(m,U,D){
  const d=VH_DEF[9],x0=m.x,x1=m.x+m.w;
  if(m.vhBase==null)m.vhBase=m.y+m.h+(m.vhAlt||0);
  let piso=GROUND;for(const pl of platforms)if(!pl.roof&&x1>pl.x&&x0<pl.x+pl.w&&pl.y>=m.vhBase-1&&pl.y<piso)piso=pl.y;
  if(piso>m.vhBase){m.vhBaseV=Math.min(6.5,(m.vhBaseV||0)+0.28);m.vhBase=Math.min(piso,m.vhBase+m.vhBaseV);}else{if(m.vhBaseV>3)dust(m.x+m.w/2,piso,6);m.vhBaseV=0;m.vhBase=piso;}
  const antes=m.vhAlt||0,max=Math.min(d.techo,m.vhBase-m.h-8);
  if(U&&!D)m.vhAlt=Math.min(max,antes+d.sube);else if(D&&!U)m.vhAlt=Math.max(0,antes-d.baja);else m.vhAlt=Math.min(antes,max);
  if(m.vhAlt!==antes&&T%6===0)tone('square',m.vhAlt>antes?180:140,m.vhAlt>antes?220:110,0.05,0.02); // el motorcito de la cadena
  if(m.vhAlt!==antes&&T%10===0)VH_chispas(m.x+(T%20?2:m.w-2),m.y+m.h);
  const y=m.vhBase-m.h-m.vhAlt;m.vy=VH_VY(y-m.y);
  if(m.vhAlt>0.5){m.onGround=false;m.plat=null;}
  return m.vhAlt!==antes;
}
function VH_chispas(x,y){for(let i=0;i<5;i++)parts.push({k:'p',x,y,vx:rand(-1,1),vy:rand(-1,1),g:0,life:10,maxl:10,size:1,col:i%2?'#9ad0ff':'#fff'});}

// ================== ataque (mechFire: cada cuadro con DISPARAR, si fireCd lo deja) ==================
// boca del caño en el mundo (AV_boca está en la caja mirando a la derecha)
function VH_boca(m){
  if(VH_t(m)===9&&!VH_artMonta())return{x:m.face>0?m.x+m.w+6:m.x-6,y:m.y+7};
  const i=VH_t(m),b=typeof AV_boca==='function'?AV_boca(i,m.lvl||1,m.aim||0):{x:m.w,y:m.h/2};
  if(m.techo)return{x:m.x+m.w/2+m.face*m.w/2,y:m.y+m.h-4};
  return{x:m.face>0?m.x+b.x:m.x+m.w-b.x,y:m.y+b.y};
}
function VH_bala(m,a,sp,o){const b=VH_boca(m),dx=Math.cos(a)*m.face,dy=Math.sin(a);tirosDisp++;
  pbul.push({x:b.x,y:b.y,vx:dx*sp,vy:dy*sp,k:'b',dmg:1,life:70,w:'grillo',sh:1,...o});return b;}
{const f0=mechFire;mechFire=function(m){
  const d=VH_d(m);if(!d||!VH_ON())return f0(m);
  if(m.fc>0&&m.fcO)return; // cargando la fusión (fusion-carga.js)
  if(m.vhF>0)return;m.vhF=d.cd;m.vhAtk=8;
  const mu=VH_mult(m),n=m.lvl||1,a=(m.aim||0)+rand(-0.04,0.04);let b;
  switch(d.tiro){
  case 'doble':b=VH_bala(m,a-0.03,6.6,{dmg:mu,heavy:true});VH_bala(m,a+0.03,6.6,{dmg:mu,heavy:true});if(n>=3)VH_bala(m,a+0.12,6.6,{dmg:mu,heavy:true});SFX.heavy();break;
  case 'aguijon':b=VH_bala(m,a,8.5,{dmg:1.2*mu,life:40});if(n>=2)VH_bala(m,a-0.15,8.5,{dmg:1.2*mu,life:40});tone('square',1500,900,0.04,0.025);break;
  case 'ballesta':b=VH_bala(m,a,6,{dmg:1.6*mu,heavy:true});if(n>=2)VH_bala(m,a+0.1,6,{dmg:1.6*mu,heavy:true});tone('triangle',700,300,0.07,0.04);break;
  case 'abajo':{const aa=(m.aim||0)<-0.2?m.aim:Math.max(0.55,m.aim||0);b=VH_bala(m,aa,5.5,{dmg:mu});if(n>=2)VH_bala(m,aa-0.25,5.5,{dmg:mu});SFX.shoot();break;}
  case 'disco':b=VH_bala(m,a+((T>>2)%2?0.05:-0.05),6.2,{dmg:mu,heavy:true,vhCol:'#7ae0ff'});if(n>=3)VH_bala(m,a-0.2,6.2,{dmg:mu,heavy:true});tone('sine',1200,1600,0.04,0.025);break;
  case 'perno':b=VH_bala(m,a,7,{dmg:1.4*mu});if(n>=2)VH_bala(m,a+0.12,7,{dmg:1.4*mu});tone('square',400,800,0.05,0.03);break;
  case 'pico':b=VH_bala(m,a,6.5,{dmg:1.1*mu,heavy:true});if(n>=2)VH_bala(m,a+0.1,6.5,{dmg:1.1*mu});tone('square',900,600,0.04,0.03);break;
  case 'onda':{const bo=VH_boca(m);VH_onda(bo.x,bo.y,m.face*3.2,Math.sin(m.aim||0)*3.2,1.6*mu,n>=2?11:8);b=bo;VH_campana(0.7);break;}
  case 'canon':b=VH_bala(m,a,6,{dmg:1.6*mu,heavy:true});kick(-m.face,0);m.vhv-=m.face*0.15;SFX.heavy();break;
  }
  if(b&&d.tiro!=='onda')parts.push({k:'flash',x:b.x,y:b.y,life:3,maxl:3,size:3});
};}
// la campana: suena (más fuerte en el especial)
function VH_campana(k){const v=vary(0.03);tone('sine',660*v,650*v,0.5*k,0.05*k);tone('sine',1320*v,1310*v,0.35*k,0.025*k);tone('triangle',990*v,980*v,0.25*k,0.02*k);}
// ondas de sonido: atraviesan y le pegan una vez a cada uno (fantasmas incluidos, si se les puede pegar)
const VH_ondas=[];
function VH_onda(x,y,vx,vy,dmg,r){tirosDisp++;VH_ondas.push({x,y,vx,vy,dmg,r0:3,r,t:0,life:42,hit:new Set(),sh:1});}
ON_STEP.push(()=>{
  for(const o of VH_ondas){o.t++;o.x+=o.vx;o.y+=o.vy;const r=o.r0+(o.r-o.r0)*Math.min(1,o.t/16);
    for(const e of enemies)if(hittable(e)&&!o.hit.has(e)&&overlapPt(e,o.x,o.y,r)){o.hit.add(e);if(!o.peg){o.peg=1;tirosPeg++;}killSrc='grillo';hitFrom={dir:Math.sign(o.vx)||1,pow:0.6,fl:1};dmg(e,isBoss(e)?o.dmg*0.8:o.dmg);hitFrom=null;killSrc=null;}
    for(const b of eproj)if(!b.gone&&b.kind==='bullet'&&Math.hypot(b.x-o.x,b.y-o.y)<r)b.gone=true;
    if(o.t>=o.life||o.x<camX-20||o.x>camX+VW+20)o.gone=true;}
  for(let i=VH_ondas.length;i--;)if(VH_ondas[i].gone)VH_ondas.splice(i,1);
});

// ================== especial (mechCannon: GRANADA, con proyectiles contados) ==================
{const c0=mechCannon;mechCannon=function(m){
  const d=VH_d(m);if(!d||!VH_ON())return c0(m);
  if(m.fc>0&&m.fcO)return;
  m.shells--;m.canCd=d.espCd;m.recoil=3;m.vhAtk=12;const mu=VH_mult(m),n=m.lvl||1,cx=m.x+m.w/2,cy=m.y+m.h/2;
  switch(d.esp){
  case 'bomba':{const k=n>=3?3:n>=2?2:1;for(let i=0;i<k;i++)grens.push({x:cx-m.face*i*5,y:m.y+m.h,vx:m.vx*0.7+m.face*(0.5+i*0.3),vy:0.6,g:0.16,t:0,rot:Math.PI/2,mort:false,whistle:false,upd:grilloShellUpd,draw:grilloShellDraw});
    tone('square',300,120,0.12,0.04);break;}
  case 'gancho':m.vhGancho={len:0,max:n>=3?96:n>=2?82:70,sale:true,dir:m.face,hit:new Set(),lleva:null};tone('square',600,300,0.12,0.04);noise(0.15,0.06,2600);break;
  case 'embestida':m.vhDash=20;m.vhHit=new Set();m.inv=Math.max(m.inv,m.vhDash+6);noise(0.3,0.15,900);tone('sawtooth',120,420,0.25,0.05);break;
  case 'destello':{
    if(typeof FL_puede!=='function'||FL_puede())parts.push({k:'flash',x:m.face>0?m.x+m.w:m.x,y:cy+4,life:6,maxl:6,size:14});
    for(const e of enemies){if(e.gone||isBoss(e))continue;const dx=(e.x+e.w/2-cx)*m.face,dy=e.y+e.h/2-(cy+4);
      if(dx>0&&dx<130&&Math.abs(dy)<dx*0.6+20){e.vhCiego=Math.round(150*mu);e.flash=4;}}
    tone('sine',1800,600,0.3,0.05);break;}
  case 'abanico':for(let i=-2;i<=2;i++)VH_bala(m,(m.aim||0)+i*0.22,6,{dmg:1.4*mu,heavy:true});tone('sine',900,1800,0.15,0.04);break;
  case 'pulso':{let n2=0;for(const b of eproj)if(!b.gone&&Math.hypot(b.x-cx,b.y-cy)<64*(n>=2?1.25:1)){b.gone=true;n2++;spark(b.x,b.y,'#9ad0ff');}
    if(n2){addScore(10*n2,cx,m.y-6);if(typeof RC_soltar==='function')RC_soltar(10*n2,cx,m.y,Math.min(4,n2));}
    for(const k of pickups){const dx=cx-(k.x+5);if(Math.abs(dx)<90&&!k.gone){k.x+=dx*0.6;}}
    parts.push({k:'ring',x:cx,y:cy,r:4,max:64,life:16,maxl:16,col:'154,208,255'});tone('square',200,1200,0.25,0.05);break;}
  case 'picada':if(m.onGround){m.vy=-5;m.onGround=false;VH_aleteo(m);}else{m.vy=6.5;m.vhPicada=1;tone('sawtooth',900,200,0.35,0.05);}break;
  case 'dong':{const r=50*(n>=3?1.3:n>=2?1.15:1);killSrc='grillo';
    for(const e of enemies){if(!hittable(e))continue;if(Math.hypot(e.x+e.w/2-cx,e.y+e.h/2-cy)<r+e.w/2){hitFrom={dir:e.x+e.w/2>=cx?1:-1,pow:1.2,fl:1.4,up:true};dmg(e,(isBoss(e)?2.4:4)*mu);}}
    hitFrom=null;killSrc=null;for(const b of eproj)if(!b.gone&&Math.hypot(b.x-cx,b.y-cy)<r)b.gone=true;
    parts.push({k:'ring',x:cx,y:cy,r:6,max:r,life:18,maxl:18,col:'255,210,120'});parts.push({k:'ring',x:cx,y:cy,r:2,max:r*0.6,life:12,maxl:12,col:'255,240,200'});
    VH_campana(1.6);if(typeof MOV_reducido!=='function'||!MOV_reducido())shakeAt(cx,cy,3);
    if(typeof COMIC!=='undefined')try{COMIC.efecto('vhDong',{x:cx,y:m.y-10});}catch(e){}break;}
  }
};}
if(typeof COMIC!=='undefined')COMIC.registrar('vhDong',{tipo:'onomato',dur:30,crear:e=>{e.ang=0.1;},
  draw:e=>{const s='¡DONG!',w=pfW(s),k=e.t<3?1.3*e.t/3:e.t>e.dur-6?Math.max(0,(e.dur-e.t)/6):1;if(k<=0.02)return;
    ctx.save();ctx.translate(Math.round(e.x),Math.round(e.y-e.t*0.2));ctx.rotate(e.ang);ctx.scale(1.6*k,1.6*k);ctx.drawImage(pfLienzo(s,'#ffd25a','#120c18'),-w/2-1,-4);ctx.restore();}});

// ================== movimiento propio, embestidas y lo demás (updMech) ==================
{const u0=updMech;updMech=function(m){
  const d=VH_d(m);if(!d||!VH_ON())return u0(m);
  const x0=m.x;u0(m);if(!m.ride)return; // se bajó en este cuadro
  // velocidad propia con envión (el FAROL tarda en arrancar y frenar; la TABLA es rápida)
  const quiere=(m.x-x0)*d.vel;m.vhv+=(quiere-m.vhv)*d.envion;
  if(m.vhDash>0){m.vhDash--;m.vhv=m.face*4.2;VH_embiste(m);if(T%2===0)parts.push({k:'smoke',col:'220,220,230',x:m.x+m.w/2-m.face*m.w/2,y:m.y+m.h*0.6,vx:-m.face*0.6,vy:-0.1,life:14,maxl:14,size:1.6});}
  if(m.pared)m.vhv=0;
  else m.x=clamp(x0+m.vhv,camX+2-(typeof MC_margenIzq==='function'?MC_margenIzq():0),camX+VW-m.w-2+(typeof MC_margen==='function'?MC_margen():0));
  if(m.vhF>0)m.vhF--;if(m.vhAtk>0)m.vhAtk--;
  if(m.vhPicada&&m.onGround){m.vhPicada=0;stomp(m);}
  if(m.vhGancho)VH_gancho(m);
  // el que maneja va adentro
  P.x=m.x+m.w/2-4;P.y=m.y+m.h-18;P.vx=m.vhv;
};}
// el gancho del MONTACARGAS: sale de la jaula hacia adelante, pega una vez a cada uno y vuelve; si engancha un premio, lo trae
const VH_ganchoPunta=m=>{const g=m.vhGancho;return{x:(g.dir>0?m.x+m.w:m.x)+g.dir*g.len,y:m.y+m.h*0.55};};
function VH_gancho(m){
  const g=m.vhGancho;g.len+=g.sale?7:-8;if(g.sale&&g.len>=g.max)g.sale=false;
  const p=VH_ganchoPunta(m);
  if(g.sale){for(const e of enemies){if(!hittable(e)||g.hit.has(e)||!overlapPt(e,p.x,p.y,4))continue;g.hit.add(e);
      killSrc='grillo';hitFrom={dir:g.dir,pow:1.2,fl:1.2};dmg(e,(isBoss(e)?2:3)*VH_mult(m));hitFrom=null;killSrc=null;spark(p.x,p.y,'#cfd6e0',g.dir);g.sale=false;tone('square',260,140,0.06,0.04);}
    for(const c of crates)if(!c.gone&&overlapPt(c,p.x,p.y,3)){dmgCrate(c,3);g.sale=false;}
    if(!g.lleva)for(const k of pickups)if(!k.gone&&overlapPt(k,p.x,p.y,4)){g.lleva=k;g.sale=false;break;}}
  if(g.lleva&&!g.lleva.gone){g.lleva.x=p.x-5;g.lleva.y=p.y-5;g.lleva.vy=0;}
  if(!g.sale&&g.len<=0){m.vhGancho=null;tone('square',300,500,0.04,0.03);}
}
function VH_embiste(m){
  for(const e of enemies){if(!hittable(e)||m.vhHit.has(e)||!overlap(m,e))continue;m.vhHit.add(e);
    killSrc='grillo';hitFrom={dir:m.face,pow:1.6,fl:1.6,up:true};dmg(e,(isBoss(e)?2:3.5)*VH_mult(m));hitFrom=null;killSrc=null;shakeAt(e.x,e.y,2);}
  for(const c of crates)if(!c.gone&&overlap(m,c))dmgCrate(c,3);
}
// encandilados por el FAROL: no hacen nada mientras dura (salvo caer)
{const ue0=updEnemy;updEnemy=function(e){if(e.vhCiego>0&&!isBoss(e)){e.vhCiego--;if(e.flash>0)e.flash--;return;}return ue0(e);};}
// bajarse: se suelta del techo o la pared
{const e0=ejectMech;ejectMech=function(m,b){if(m){m.techo=null;m.pared=null;m.vhDash=0;m.vhv=0;m.vhGancho=null;m.vhAlt=0;m.vhBase=null;}return e0(m,b);};}

// ================== nombres en los carteles ==================
{const en0=enterMech;enterMech=function(m){en0(m);if(VH_t(m)&&VH_ON())setBanner('¡A BORDO '+VH_conArt(m,true)+'!',70);};}
{const mb0=mechBreak;mechBreak=function(m){mb0(m);if(VH_t(m)&&VH_ON())setBanner('¡'+VH_conArt(m)+' NO DA MÁS!',80);};}
{const fu0=FU_fusionar;FU_fusionar=function(m,o){const n0=m.lvl;fu0(m,o);if(VH_t(m)&&VH_ON()&&m.lvl!==n0)setBanner('¡FUSIÓN! '+VH_nombre(m),70);};}

// ================== dibujo ==================
const VH_corr=[];
ON_STEP.push(()=>{
  for(const e of enemies)if(e.vhCiego>0&&isBoss(e))e.vhCiego=0;});
ON_DRAW.push(()=>{
  if(!VH_ON())return;
  // corrientes de arena (M4)
  for(const c of VH_corr){if(c.x+c.w<camX||c.x>camX+VW)continue;
    for(let i=0;i<10;i++){const f=((T*0.9+i*23)%120)/120,y=GROUND-f*130,x=c.x+c.w/2+Math.sin(f*9+i)*c.w*0.4*(0.4+f);
      ctx.fillStyle=`rgba(230,200,140,${(0.55*(1-f)).toFixed(2)})`;ctx.fillRect(q(x),q(y),1.5,1.5);}
    ctx.fillStyle='rgba(230,200,140,0.12)';ctx.fillRect(c.x,GROUND-130,c.w,130);}
  // ondas de la CAMPANA
  for(const o of VH_ondas){const r=o.r0+(o.r-o.r0)*Math.min(1,o.t/16),a=1-o.t/o.life;
    ctx.strokeStyle=`rgba(255,220,140,${(0.85*a).toFixed(2)})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(o.x,o.y,r,-1.1,1.1);ctx.stroke();
    ctx.strokeStyle=`rgba(255,240,200,${(0.5*a).toFixed(2)})`;ctx.beginPath();ctx.arc(o.x-Math.sign(o.vx)*3,o.y,r*0.7,-1,1);ctx.stroke();}
  // encandilados: estrellitas que giran
  for(const e of enemies)if(e.vhCiego>0&&!e.gone)for(let i=0;i<3;i++){const a=T/8+i*2.1;ctx.fillStyle=i%2?'#ffe066':'#fff';ctx.fillRect(q(e.x+e.w/2+Math.cos(a)*5),q(e.y-3+Math.sin(a)*1.5),1.2,1.2);}
});
{const dm0=drawMech;drawMech=function(m){
  const i=VH_t(m);if(!i||!VH_ON())return dm0(m);
  if(!onScreen(m,40))return;
  const d=VH_DEF[i],n=m.lvl||1,esc=typeof FU_NIV!=='undefined'&&FU_NIV[n]?FU_NIV[n].esc:1,tam=VH_tam(i);
  const w=tam.w*esc,h=tam.h*esc,parado=!m.ride&&!m.dying;
  let y=m.y+m.h-h;if(d.flota&&!m.techo&&!m.pared)y-=d.flota*0.6+Math.round(Math.sin((T+m.x)/10)*0.8);
  if(parado)y+=1;
  const pose=m.dying||m.armor<m.max*0.3?'danado':m.vhAtk>0?'atacar':Math.abs(m.vhv||0)>0.2||Math.abs(m.vy)>0.4?'mover':'quieto';
  let rot=0,face=m.face;if(m.techo){rot=Math.PI;face=-m.face;}else if(m.pared){rot=-Math.PI/2*m.face;}
  const base=i===9?Math.max(0,(m.vhBase??(m.y+m.h))-(m.y+m.h)):0; // MONTACARGAS: lo que subió la jaula
  if(m.vhGancho)VH_dibGancho(m);
  if(i===9&&!VH_artMonta()){VH_dibMonta(m,{x:m.x+m.w/2-w/2,y,w,h,face,aim:m.aim},{nivel:n,pose,base,flash:m.flash>0||(m.dying>0&&(T>>2)%2),jinete:m.ride?(m.by||P):null});
    VH_subir(m,parado);return;}
  // la fusión: el otro se encastra desde donde estaba (como fusion.js con la CHATARRA)
  if(m.fus>0&&m.fusO){const k=1-m.fus/(typeof FU_T==='number'?FU_T:60),o=m.fusO,f=Math.min(1,k*1.6);
    if(k<0.62){ctx.save();ctx.globalAlpha=0.7;AV_dibujar(i,{x:o.x+(m.x-o.x)*f,y:o.y+(m.y-o.y)*f,w:tam.w,h:tam.h,face:o.face},{nivel:1,pose:'mover',t:T,flash:(T>>1)%2});ctx.restore();}}
  AV_dibujar(i,{x:m.x+m.w/2-w/2,y,w,h,face,rot,aim:m.techo||m.pared?0:m.aim},{nivel:n,pose,t:T,flash:m.flash>0||(m.dying>0&&(T>>2)%2),jinete:m.ride?(m.by||P):null,jet:m.jet,base});
  if(m.fus>0){const k=m.fus/(typeof FU_T==='number'?FU_T:60);ctx.fillStyle=`rgba(255,250,220,${(0.5*k*((T>>1)%2?1:0.5)).toFixed(3)})`;circle(m.x+m.w/2,m.y+m.h/2,(w*0.8)*(1.2-k*0.4));}
  VH_subir(m,parado);
};}
function VH_subir(m,parado){if(parado&&m.cool<=0&&players.some(p=>!p.ride&&!p.dead&&Math.abs(p.x+4-(m.x+m.w/2))<44))
  txt(btn('up')+' SUBIR '+VH_alArt(m),m.x+m.w/2,m.y-12+Math.sin(T/8)*1.5,6,'#ffe08a','center');}
// la cadena y el gancho
function VH_dibGancho(m){
  const g=m.vhGancho,p=VH_ganchoPunta(m),x0=g.dir>0?m.x+m.w:m.x;
  for(let x=0;x<g.len;x+=3){ctx.fillStyle='#120c18';ctx.fillRect(q(x0+g.dir*x-0.5),q(p.y-1),2.5,2);ctx.fillStyle=(x/3)%2?'#9aa0a8':'#cfd6e0';ctx.fillRect(q(x0+g.dir*x),q(p.y-0.5),1.5,1);}
  ctx.save();ctx.translate(q(p.x),q(p.y));ctx.scale(g.dir,1);
  ctx.fillStyle='#120c18';ctx.fillRect(-1,-3,4,6);ctx.fillRect(1,1,3,4);ctx.fillStyle='#cfd6e0';ctx.fillRect(0,-2,2,4);ctx.fillRect(2,2,1,2);ctx.fillStyle='#8a929e';ctx.fillRect(0,1,1,1);
  ctx.restore();
}
// dibujo de respaldo del MONTACARGAS (hasta que llegue el de Arte): base con orugas cortas en el piso, dos guías de
// perfil de acero, travesaño con cadenas y la jaula de barrotes; II y III suman chapas, púas y luces como los demás.
function VH_dibMonta(m,v,op){
  const C=c=>op.flash?'#ffffff':c,K='#120c18',n=op.nivel,x=Math.round(v.x),y=Math.round(v.y),w=Math.round(v.w),h=Math.round(v.h),pisoY=y+h+op.base;
  const mueve=op.pose==='mover',ph=mueve?(T>>2)%3:0;
  // orugas en el piso (un poco más anchas que la jaula)
  const bx=x-3,bw=w+6,by=pisoY-6;
  ctx.fillStyle=K;ctx.fillRect(bx-1,by-1,bw+2,8);ctx.fillStyle=C('#2a2a30');ctx.fillRect(bx,by,bw,6);
  ctx.fillStyle=C('#4a4a54');for(let k=ph;k<bw;k+=3)ctx.fillRect(bx+k,by,1.5,1);for(let k=(ph+1)%3;k<bw;k+=3)ctx.fillRect(bx+k,by+5,1.5,1);
  for(const cx of[bx+3.5,bx+bw/2,bx+bw-3.5]){ctx.fillStyle=C('#6a6f7a');circle(cx,by+3,2);ctx.fillStyle=K;circle(cx,by+3,0.7);}
  ctx.fillStyle=C('#7a5a3a');ctx.fillRect(bx+2,by-2,bw-4,2); // chasis oxidado
  // guías: dos perfiles de acero de la base hasta arriba de la jaula, con travesaño
  const gTop=y-6,gx=[x+1,x+w-3];
  for(const g of gx){ctx.fillStyle=K;ctx.fillRect(g-1,gTop-1,4,by-gTop+1);ctx.fillStyle=C('#5a5f6a');ctx.fillRect(g,gTop,2,by-gTop);ctx.fillStyle=C('#8a909c');ctx.fillRect(g,gTop,1,by-gTop);
    for(let yy=gTop+4;yy<by-2;yy+=6){ctx.fillStyle=K;ctx.fillRect(g,yy,2,1);}} // muescas
  ctx.fillStyle=K;ctx.fillRect(x-1,gTop-2,w+2,4);ctx.fillStyle=C('#7a5a3a');ctx.fillRect(x,gTop-1,w,2);
  // cadenas del travesaño a la jaula (cortas: la jaula cuelga)
  for(const cx of[x+5,x+w-6])for(let yy=gTop+1;yy<y;yy+=2){ctx.fillStyle=(yy>>1)%2?C('#9aa0a8'):C('#cfd6e0');ctx.fillRect(cx,yy,1,1.5);}
  // jaula: piso de chapa, marco y barrotes; adentro el que maneja
  ctx.fillStyle=K;ctx.fillRect(x-1,y-1,w+2,h+2);
  ctx.fillStyle='rgba(40,30,36,0.55)';ctx.fillRect(x,y,w,h-3);
  if(op.jinete&&typeof AV_cabeza==='function')AV_cabeza(op.jinete,x+Math.round(w/2)-2,y+h-10);
  ctx.fillStyle=C('#8a909c');for(let k=2;k<w-1;k+=4)ctx.fillRect(x+k,y,1,h-3);
  ctx.fillStyle=C('#5a5f6a');ctx.fillRect(x,y,w,2);ctx.fillRect(x,y,1.5,h);ctx.fillRect(x+w-1.5,y,1.5,h);
  ctx.fillStyle=C('#7a5a3a');ctx.fillRect(x,y+h-3,w,3);ctx.fillStyle=C('#a07848');ctx.fillRect(x,y+h-3,w,1);
  ctx.fillStyle=C('#ffd25a');for(let k=1;k<w;k+=6)ctx.fillRect(x+k,y+h-2,3,1); // franja de peligro
  // cañoncito en la jaula, del lado que mira
  const f=v.face,cx0=f>0?x+w:x,cy0=y+7;ctx.save();ctx.translate(cx0,cy0);ctx.scale(f,1);ctx.rotate(v.aim||0);
  ctx.fillStyle=K;ctx.fillRect(-1,-2,8,4);ctx.fillStyle=C('#2a2a30');ctx.fillRect(0,-1,7,2);if(op.pose==='atacar'&&(T>>1)%2){ctx.fillStyle='#ffd25a';ctx.fillRect(7,-1.5,2,3);}ctx.restore();
  // fusión II y III: chapas, púas arriba y luces rojas (III con ojos)
  if(n>=2){ctx.fillStyle=C(n>=3?'#3a3e48':'#545a66');ctx.fillRect(x+1,y+h-8,7,4);ctx.fillRect(x+w-8,y+h-8,7,4);
    ctx.fillStyle=C('#c8ccd4');for(let k=3;k<w-1;k+=(n>=3?4:7)){ctx.beginPath();ctx.moveTo(x+k-1.5,gTop-2);ctx.lineTo(x+k+1.5,gTop-2);ctx.lineTo(x+k,gTop-2-(n>=3?3:2));ctx.fill();}
    const lu=n>=3?[[x+2,by-1],[x+w-3,by-1],[x+w/2,gTop-1]]:[[x+w/2,gTop-1]];
    lu.forEach(([lx,ly],k)=>{const on=n<3||((T>>3)+k)%2===0;ctx.fillStyle=K;ctx.fillRect(lx-1,ly-1,3,3);ctx.fillStyle=on?'#ff3b30':'#5a1418';ctx.fillRect(lx,ly,1,1);});
    if(n>=3){ctx.fillStyle=(T>>2)%6?'#ff3b30':'#ffb0a0';ctx.fillRect(bx+(f>0?bw-6:2),by+2,2,1);ctx.fillRect(bx+(f>0?bw-3:5),by+2,2,1);}}
  // dañado: chispas
  if(op.pose==='danado'&&(T>>2)%3===0){ctx.fillStyle='#ffd25a';ctx.fillRect(x+hash(T>>2)*w,y+hash((T>>2)+5)*h,1.5,1.5);}
}
// ---------- HUD (arriba a la derecha, como el de la CHATARRA) ----------
{const dh0=drawMechHUD;drawMechHUD=function(m){
  const i=VH_t(m);if(!i||!VH_ON())return dh0(m);
  const d=VH_DEF[i],bx=W-56,bw=50,f=m.fuel/m.fmax,rs=P?P.slot:0,ar=RC_ver('ar'+rs,m.armor),gj=RC_salto('gri'+rs),nv=m.lvl||1,nom=VH_nombre(m);
  txt(nom,W-6,4+gj,5,RC_luz('gri'+rs)?'#fff6c8':'#f3c969','right');RC_ancla('gri'+rs,bx+bw/2,11);
  const x0=W-6-hudTW(nom,5)-24;
  for(let k=0;k<3;k++){const x=x0+k*6,on=k<nv;ctx.fillStyle='#120c18';ctx.fillRect(x-0.5,4.5,5,5);ctx.fillStyle=on?'#ffd25a':'#3a2a40';ctx.fillRect(x,5,4,4);}
  if(m.fus>0)txt('¡FUSIÓN!',x0-4,4,5,(T>>2)%2?'#fff6c8':'#ffd25a','right');
  ctx.fillStyle='#120c18';ctx.fillRect(bx-1,10,bw+2,6);ctx.fillStyle='#4a2730';ctx.fillRect(bx,11,bw,4);
  ctx.fillStyle=m.armor<=m.max*0.3?((T>>3)%2?'#ff5a3c':'#a02a1a'):'#e8c040';ctx.fillRect(bx,11,bw*Math.max(0,ar)/m.max,4);
  const sl=P?P.slot:0;
  if(d.vuelo==='montacargas'){const a=(m.vhAlt||0)/d.techo;
    ctx.fillStyle='#120c18';ctx.fillRect(bx-1,16.5,bw+2,4.5);ctx.fillStyle='#2a2430';ctx.fillRect(bx,17.5,bw,2.5);
    ctx.fillStyle='#ffd25a';ctx.fillRect(bx,17.5,bw*a,2.5);txt('ALTURA',bx-3,16.5,4,'#ffd25a','right',false);}
  else if(d.vuelo!=='iman'&&d.vuelo!=='tabla'){
    ctx.fillStyle='#120c18';ctx.fillRect(bx-1,16.5,bw+2,4.5);ctx.fillStyle='#1c2a38';ctx.fillRect(bx,17.5,bw,2.5);
    ctx.fillStyle=m.jetLock?((T>>3)%2?'#ff5a3c':'#7a2a1a'):f<0.2?'#ff9a3c':'#6fd0ff';ctx.fillRect(bx,17.5,bw*f,2.5);
    txt(d.vuelo==='aleteo'?'ALAS':'VUELO',bx-3,16.5,4,m.jetLock||f<0.2?'#ff9a3c':'#9ad0ff','right',false);}
  txt(VH_ESP[d.esp]+' '+m.shells+' ('+btn('bomb',sl)+')',W-6,22.5,5,m.shells?'#fff':'#ff6b5b','right');
  txt(d.ayuda.replace(/↑/g,btn('jump',sl)),W-6,28.5,4,'#aaa','right',false); // la ayuda dice ↑ por "saltar": va la tecla real (Pruebas, U)
  txt('↓+'+btn('jump',sl)+': BAJAR',W-6,33.5,4,'#aaa','right',false);
};}
