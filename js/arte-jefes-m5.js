'use strict';
// Óxido · M5 en estilo "Hondo" (notas/arte/guia.md). Va después de arte-jefes-m3.js, antes de juego.js.
// · Murciélagos de lata: las ondas del chillido (el aviso de que se van a tirar) pasan a arcos de píxeles de 1 px que se
//   apagan en 2 escalones (ya no un arco rojo liso).
// · LECHUZA BLINDADA (jefe chico): redibujada en píxeles con la misma forma de jefes5.js: fuselaje con rampa y óxido,
//   cabina, cejas de chapa, los dos focos como lentes, rotor en 3 cuadros. El haz del foco baja en escalones de 3 px
//   (suma luz, sin bordes suaves) y la marca roja del piso es un óvalo de píxeles. Inclinada: un cuadro dibujado con
//   corrimiento de 1 px cada 3 columnas; al caer, 90° exactos con ese cuadro en el medio.
// · DON NIEBLA (villano): capturado en píxeles con contorno y borde de luz. El DIENTE DORADO es el cubo del motor de la
//   góndola (la hélice del costado); la franja dorada de la góndola pasa a ámbar apagado. Es lo único dorado.
// Usa J2_cuarto, J2_inclinar, J2_espejo, J2_lienzo y J2_conColores de arte-jefes-m2.js. Prefijo J5A_.
const J5A_red=()=>typeof MOV_reducido==='function'&&MOV_reducido();

// ---------- murciélagos: arcos del chillido en píxeles ----------
function J5A_arco(cx,cy,r,a0,a1,col){
  const n=Math.max(6,Math.round(r*(a1-a0)*1.4));let px=null,py=null;ctx.fillStyle=col;
  for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,x=Math.round(cx+Math.cos(a)*r),y=Math.round(cy+Math.sin(a)*r);if(x===px&&y===py)continue;ctx.fillRect(x,y,1,1);px=x;py=y;}
}
if(typeof M5_drawBat==='function'){const J5A_bat0=M5_drawBat;M5_drawBat=function(e){
  if(e.st!=='warn')return J5A_bat0.call(this,e);
  const arc0=ctx.arc;let quedo=false;
  ctx.arc=function(x,y,r,a0,a1){
    if(a1-a0<6){const m=String(ctx.strokeStyle).match(/rgba?\(([^)]+)\)/),al=m?parseFloat(m[1].split(',')[3]??1):1;
      if(al>0.45)J5A_arco(x,y,Math.round(r),a0,a1,'#ff6a5a');else if(al>0.18)J5A_arco(x,y,Math.round(r),a0,a1,'#a83a34');return;}
    return arc0.apply(ctx,arguments);};
  try{return J5A_bat0.call(this,e);}finally{delete ctx.arc;quedo=true;}
};}

// ---------- LECHUZA BLINDADA ----------
const J5A_OX=15,J5A_OY=4,J5A_W=70,J5A_H=26;
const J5A_LEC=new Map();
function J5A_poly(set,pts,colY){
  let y0=1e9,y1=-1e9;for(const[,y]of pts){y0=Math.min(y0,y);y1=Math.max(y1,y);}
  for(let y=Math.floor(y0);y<=Math.ceil(y1);y++){const Y=y+0.5,xs=[];
    for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[xi,yi]=pts[i],[xj,yj]=pts[j];if((yi>Y)!==(yj>Y))xs.push(xi+(Y-yi)*(xj-xi)/(yj-yi));}
    xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2)for(let x=Math.round(xs[k]);x<Math.round(xs[k+1]);x++)set(x,y,typeof colY==='function'?colY(y,x):colY);}
}
function J5A_lechuza(f,ojo,fl,ph2,pod){
  const k=[f,ojo,fl?1:0,ph2?1:0,pod?1:0].join('|');let cv=J5A_LEC.get(k);if(cv)return cv;
  const C=c=>fl?'#ffffff':c;
  cv=J2_lienzo(J5A_W,J5A_H,set0=>{const set=(x,y,c)=>set0(x+J5A_OX,y+J5A_OY,C(c));
    // cola: botalón, aleta, luz y rotor chico
    for(let y=6;y<10;y++)for(let x=-12;x<8;x++)set(x,y,y===6?'#3a404a':'#2c3038');
    J5A_poly(set,[[-14,9.5],[-10,0],[-7,6]],'#2c3038');
    for(let y=6;y<10;y++)for(let x=-12;x<-9;x++)set(x,y,'#8c3b2a');
    const tr=[5,3,1][f];for(let i=0;i<tr;i++)set(-12,2+((5-tr)>>1)+i,'#a8b4c8');
    // rotor principal: mástil, cubo y palas en 3 cuadros
    for(let y=-1;y<3;y++)for(let x=24;x<28;x++)set(x,y,'#22252c');
    if(f===0){for(let x=-3;x<56;x++)if(x<23||x>28)set(x,-2,Math.abs(x-26)>24?'#d0dce8':'#a8b4c8');}
    else if(f===1){for(let x=6;x<46;x++)if(x<23||x>28){set(x,-3,'#c0ccd8');set(x,-2,'#8894a8');}}
    else{for(let x=18;x<35;x++)if(x<23||x>28)set(x,-2,'#a8b4c8');for(const s of[-1,1])for(let i=14;i<=20;i++)set(26+s*i,-2,'#6a7488');}
    // fuselaje con rampa (luz arriba, sombra abajo), junturas, óxido y la franja de peligro
    J5A_poly(set,[[6,4],[20,3],[36,2],[44,2.5],[49,4.5],[51.5,8],[52,11],[51,14],[48,16.5],[40,17],[10,17],[7,15],[5.5,10]],
      y=>y<=3?'#5a6270':y<=5?'#4a525e':y>=15?'#1e2128':y>=13?'#262a32':'#2c3038');
    for(let y=9;y<16;y++){set(14,y,'#22252c');set(24,y,'#22252c');}
    for(const[x,y]of[[9,8],[10,8],[19,11],[29,6],[30,6]])set(x,y,'#5a3a30');
    for(let i=0;i<5;i++)for(let y=14;y<16;y++)for(let x=12+i*3;x<15+i*3;x++)set(x,y,i%2?'#1d1a1c':'#d9a43a');
    // cabina con el piloto y un brillo
    J5A_poly(set,[[32,4],[40,4],[44,5],[46,9],[34,9]],'#1a2430');for(let x=37;x<40;x++)set(x,5,'#a0c8dc');for(let y=6;y<9;y++){set(35,y,'#0a0c10');set(36,y,'#0a0c10');}
    // cejas de chapa y penachos
    J5A_poly(set,[[40,7],[46,9.5],[52,7.5],[51,9.5],[46,11],[40,9]],'#3a404a');
    J5A_poly(set,[[38,3],[39,-2],[41,3]],'#2c3038');J5A_poly(set,[[43,3.5],[45,-1],[46,4]],'#2c3038');
    // los dos focos: lentes con anillo oscuro, color del foco y brillo
    const base=ojo==='muerto'?['#2a1e14','#3a2a1a','#3a2a1a']:ojo==='rojo1'?['#5a1410','#ff4a3a','#ff8a7a']:ojo==='rojo2'?['#7a3a34','#ffd0c0','#fff0e8']:['#6a4a1a','#ffd27a','#fff0c0'];
    for(const[ex,ey,r]of[[45,12.5,3.2],[50.5,12,2.6]])for(let y=Math.floor(ey-r);y<=Math.ceil(ey+r);y++)for(let x=Math.floor(ex-r);x<=Math.ceil(ex+r);x++){
      const d=Math.hypot(x+0.5-ex,y+0.5-ey);if(d>r+0.2)continue;set(x,y,d>r-0.9?'#120c18':d>r-1.8?base[0]:(x+0.5-ex+y+0.5-ey<-0.5?base[2]:base[1]));}
    if(ojo!=='muerto'){set(44,11,'#ffffff');set(50,11,'#ffffff');}
    // patines y lanzacohetes
    for(let y=17;y<20;y++){set(14,y,'#1a1c22');set(34,y,'#1a1c22');}for(let x=10;x<40;x++)set(x,19,'#1a1c22');set(40,18,'#1a1c22');set(41,18,'#1a1c22');
    for(let y=15;y<18;y++){for(let x=20;x<31;x++)set(x,y,y===15?'#3a3e48':'#22252c');set(31,y,pod?'#ff4a3a':'#5a1a14');}
    if(ph2){set(18,6,'#120c18');set(19,6,'#120c18');set(18,7,'#120c18');set(30,12,'#120c18');set(31,12,'#120c18');}
  });
  if(J5A_LEC.size>64)J5A_LEC.clear();J5A_LEC.set(k,cv);return cv;
}
// haz del foco en escalones de 3 px (suma luz) y la marca del piso como óvalo de píxeles
function J5A_haz(x0,y0,sx,sy,col,a,red){
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(${col},${a})`;
  const n=Math.max(1,Math.round((sy-y0)/3));
  for(let i=0;i<n;i++){const t=(i+0.5)/n,cx=x0+(sx-x0)*t,hw=Math.round(2+12*t),y=Math.round(y0+i*3);ctx.fillRect(Math.round(cx)-hw,y,2*hw,Math.min(3,Math.round(sy)-y));}
  ctx.restore();
  const X=Math.round(sx),Y=Math.round(sy);ctx.fillStyle=`rgba(${col},${red?0.45:0.25})`;ctx.fillRect(X-10,Y-2,20,1);ctx.fillRect(X-14,Y-1,28,2);ctx.fillRect(X-10,Y+1,20,1);
  if(red){ctx.fillStyle=`rgb(${col})`;ctx.fillRect(X-10,Y-3,20,1);ctx.fillRect(X-10,Y+2,20,1);ctx.fillRect(X-14,Y-2,4,1);ctx.fillRect(X+10,Y-2,4,1);ctx.fillRect(X-14,Y+1,4,1);ctx.fillRect(X+10,Y+1,4,1);ctx.fillRect(X-15,Y-1,1,2);ctx.fillRect(X+14,Y-1,1,2);}
}
const J5A_GIRO=new Map();
if(typeof J5_drawLechuza==='function'&&typeof J2_lienzo==='function'){const J5A_lec0=J5_drawLechuza;J5_drawLechuza=function(b){
  try{
    const fl=b.flash>0||(b.state==='dying'&&(T>>2)%2),fight=b.state==='fight';
    if(fight&&(b.mode==='foco'||b.mode==='focoLock'||b.mode==='rafaga')||b.state==='intro'){
      const e=J5_eyes(b),sx=b.mode==='foco'||b.state==='intro'?b.spot:b.lock?b.lock.x:b.spot,red=b.mode==='focoLock'||b.mode==='rafaga',sy=b.lock&&red?b.lock.y:GROUND;
      J5A_haz(e.x,e.y,sx,sy,red?((T>>1)%2?'255,70,60':'255,140,120'):'255,240,190',red?0.16:0.09,red);
      if(typeof LUZ_halo==='function')LUZ_halo(sx,sy-2,22,red?'#ff6a5a':'#fff0c0',red?0.3:0.25);}
    if(fight&&b.mode==='ras'){const X=Math.round(b.x+b.w/2);ctx.fillStyle='rgba(20,20,30,0.35)';ctx.fillRect(X-22,GROUND-1,44,1);ctx.fillRect(X-30,GROUND,60,1);ctx.fillRect(X-22,GROUND+1,44,1);}
    if(fight&&b.mode==='rasT'&&(T>>2)%2){const d=-b.dir,x0=d>0?b.x+b.w+6:b.x-6,y0=GROUND-12;ctx.fillStyle='#ff3b30';
      for(let i=0;i<4;i++){const x=Math.round(x0+d*i*14);ctx.fillRect(x,y0-2,1,1);ctx.fillRect(x+d,y0-1,1,1);ctx.fillRect(x+2*d,y0,1,1);ctx.fillRect(x+d,y0+1,1,1);ctx.fillRect(x,y0+2,1,1);}}
    const red=fight&&(b.mode==='focoLock'||b.mode==='rafaga'),ojo=b.state==='dying'?'muerto':red?((T>>1)%2?'rojo1':'rojo2'):'ambar';
    const f=J5A_red()?0:(T>>1)%3,pod=fight&&b.mode==='cohetesT'&&(T>>2)%2;
    let cv=J5A_lechuza(f,ojo,fl,!!b.ph2,!!pod);
    if(b.face<0){const k='e|'+f+'|'+ojo+'|'+fl+'|'+!!b.ph2+'|'+!!pod;let m=J5A_GIRO.get(k);if(!m){m=J2_espejo(cv);J5A_GIRO.set(k,m);}cv=m;}
    const lu=!fl&&typeof LUZ_luz==='function'&&LUZ_luz();if(lu&&typeof LUZ_sprite==='function')cv=LUZ_sprite(cv,lu,{fuera:true});
    const a=(b.tilt||0)+(b.rot||0),q=a/(Math.PI/2),kq=Math.round(q),fr=q-kq,incl=Math.abs(fr)>0.06?Math.sign(fr):0;
    if(!kq&&!incl){ctx.drawImage(cv,b.face<0?Math.round(b.x)+b.w-(J5A_W-J5A_OX):Math.round(b.x)-J5A_OX,Math.round(b.y)-J5A_OY);return;}
    let g=J5A_GIRO.get(cv);if(!g){g=new Map();J5A_GIRO.set(cv,g);}const gk=kq+'|'+incl;let img=g.get(gk);
    if(!img){img=J2_cuarto(cv,kq);if(incl)img=J2_inclinar(img,incl);g.set(gk,img);}
    if(J5A_GIRO.size>300)J5A_GIRO.clear();
    ctx.drawImage(img,Math.round(b.x+b.w/2-img.width/2),Math.round(b.y+b.h/2-img.height/2));
  }catch(e){return J5A_lec0.call(this,b);}
};}

// ---------- DON NIEBLA ----------
const J5A_DIENTE=['.#.#.','#####','##.##','#####','.#.#.'];
function J5A_diente(x,y){
  x=Math.round(x);y=Math.round(y);
  ctx.fillStyle='#120c18';J5A_DIENTE.forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#')ctx.fillRect(x+i-1,y+j-1,3,3);});
  J5A_DIENTE.forEach((r,j)=>{for(let i=0;i<5;i++)if(r[i]==='#'){ctx.fillStyle=i+j<=2?'#fff0b0':i+j>=6?'#7a5a1a':'#d8a83a';ctx.fillRect(x+i,y+j,1,1);}});
  ctx.fillStyle='#3a2a10';ctx.fillRect(x+2,y+2,1,1);
  if(typeof LUZ_halo==='function'){const lat=J5A_red()?0.36:0.3+0.1*Math.sin(T/40);LUZ_halo(x+2.5,y+2.5,8,'#ffd860',lat);}
}
if(typeof J5_drawNiebla==='function'){const J5A_nie0=J5_drawNiebla;J5_drawNiebla=function(b){
  if(typeof LUZ_vivo!=='function')return J5A_nie0.call(this,b);
  const fl=b.flash>0||(b.state==='dying'&&(T>>2)%2);
  // la columna roja de la garra (luz transparente) va aparte: en la captura se perdería
  const c=b.claw,g=J5_gond(b);
  if(b.state==='fight'&&b.mode==='garra'&&c&&c.st==='aim'){const s=J5_surf(c.x,g.y+10),k=Math.min(1,c.t/40);ctx.fillStyle=`rgba(255,60,48,${0.08+0.08*k})`;ctx.fillRect(Math.round(c.x-5),Math.round(g.y+8),10,Math.round(s-g.y-8));}
  const X=Math.floor(b.x),Y=Math.floor(b.y);
  const dib=()=>J5A_nie0.call(this,b);
  LUZ_vivo('niebla',X-44,Y-12,b.w+88,Math.max(60,GROUND-Y+16),()=>typeof J2_conColores==='function'?J2_conColores(dib):dib());
  if(fl||b.state==='dying')return;
  // el diente: cubo del motor de la hélice del costado de la góndola (sigue la inclinación del dirigible)
  const a=(b.tilt||0)*(b.face<0?-1:1)*-1,lx0=24,ly0=33.5,lx=b.face<0?b.w-lx0:lx0,dx=lx-b.w/2,dy=ly0-20;
  const px=b.x+b.w/2+dx*Math.cos(a)-dy*Math.sin(a),py=b.y+20+dx*Math.sin(a)+dy*Math.cos(a);
  J5A_diente(px-2.5,py-2.5);
};}
