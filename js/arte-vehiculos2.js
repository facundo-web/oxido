'use strict';
// Óxido · Arte de los 2 vehículos nuevos (elegidos por Facu el 23 nov, hoja 29): RESORTE (buggy, con ruedas) y
// VENTARRÓN (hélice, vuela). Va ANTES de js/vehiculos2.js, que llama V2_ARTE[tipo](m, op) y usa V2_ARTE.TAM.
// Familia CHATARRA: los dos llevan la cabina de la CHATARRA entera (carrocería mostaza con luz arriba y sombra abajo, la
// franja negra y amarilla de 3 px, el caño que cruza con su bloque de giro, la cúpula con la cabeza del que maneja y la
// antena con la luz verde que titila; sin nadie, el visor oscuro como la CHATARRA estacionada).
// Estilo Hondo: píxeles enteros, tinta completa, el borde de luz de la misión (arte-luz.js: por dentro en el buggy, por
// fuera en la hélice), nada de rotate: ruedas en 4 cuadros, rotor y ventilador en 3, inclinación en 3 cuadros corridos
// (derecho · 1 px cada 6 columnas · 1 px cada 3), suspensión de 0 a 5 px enteros (baja el cuerpo, las ruedas quedan),
// sombra que se achica en escalones de 2 px, humo en bocanadas de 2–3 px que suben y se apagan en 2 escalones.
// Niveles: II suma placa, púa chica y el ojo ámbar fijo; III soldadura, placas oscuras, púas grandes y el ojo ámbar que
// titila (la hélice, además, una cápsula de cohetes abajo). Crecen con piezas, no se estiran.
// Prefijo AV2_.
const AV2_INK='#17141f';
const AV2_C={O1:'#c08a2e',O2:'#e0b050',O3:'#7a5418',HY:'#e8c040',HK:'#1d1a1c',M1:'#2a2a30',M2:'#3a3a42',M3:'#5a5a62',M4:'#7a7a84',M5:'#a0a4ae',
  NE:'#1a1a20',TU:'#3a3328',TI:'#24242a',TR:'#44444e',RU:'#8a3b2a',GL:'#9cc8b0',GLd:'#2e4440',GLl:'#e0f4ea',PI:'#efb88d',G1:'#7dff9a',G0:'#2a5a34',
  PU:'#9a9ea8',P2a:'#545a66',P2b:'#8a909c',P3a:'#3a3e48',P3b:'#6a707c',SO:'#b8703a',AM:'#ff9a3c',AMo:'#6a3a1a'};
// ---------- grilla con capas (z) y piezas fijas que no se corren (las ruedas) ----------
function AV2_grilla(w,h,ops,P){
  const W2=w+2*P,H2=h+2*P,g=new Array(W2*H2).fill(null),z=new Array(W2*H2).fill(-1),fi=new Array(W2*H2).fill(false);let zi=0,fijo=false;
  const set=(x,y,c)=>{x=Math.floor(x)+P;y=Math.floor(y)+P;if(x>=0&&y>=0&&x<W2&&y<H2){const i=y*W2+x;g[i]=c;z[i]=zi;fi[i]=fijo;}};
  for(const o of ops){const c=o[1];zi++;fijo=!!o.fijo;
    if(o[0]==='r'){for(let y=o[3];y<o[3]+o[5];y++)for(let x=o[2];x<o[2]+o[4];x++)set(x,y,c);}
    else if(o[0]==='e'){const[,,cx,cy,rx,ry]=o;for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++)
      if(((x+0.5-cx)/rx)**2+((y+0.5-cy)/ry)**2<=1)set(x,y,c);}
    else if(o[0]==='p'){const pts=o[2];let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const[a,b]of pts){x0=Math.min(x0,a);x1=Math.max(x1,a);y0=Math.min(y0,b);y1=Math.max(y1,b);}
      for(let y=Math.floor(y0);y<=y1;y++)for(let x=Math.floor(x0);x<=x1;x++){const X=x+0.5,Y=y+0.5;let ins=false;
        for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[xi,yi]=pts[i],[xj,yj]=pts[j];if((yi>Y)!==(yj>Y)&&X<(xj-xi)*(Y-yi)/(yj-yi)+xi)ins=!ins;}
        if(ins)set(x,y,c);}}
    else if(o[0]==='l'){const[,,x0,y0,x1,y1]=o,gr=o[6]||1,n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;
      for(let i=0;i<=n;i++){const X=Math.round(x0+(x1-x0)*i/n),Y=Math.round(y0+(y1-y0)*i/n);for(let a=0;a<gr;a++)for(let b=0;b<gr;b++)set(X+a,Y+b,c);}}
    else if(o[0]==='d'){for(const[x,y]of o[2])set(x,y,c);}}
  return{g,z,fi,W2,H2};
}
function AV2_correr(G,k,cx){if(!k)return G;const{g,z,fi,W2,H2}=G,n=new Array(W2*H2).fill(null),nz=new Array(W2*H2).fill(-1);
  for(let x=0;x<W2;x++){const dy=Math.round(k*(x-cx)/3);for(let y=0;y<H2;y++){const i=y*W2+x,c=g[i];if(!c)continue;const Y=fi[i]?y:y+dy;
    if(Y>=0&&Y<H2&&nz[Y*W2+x]<z[i]){n[Y*W2+x]=c;nz[Y*W2+x]=z[i];}}}
  return{...G,g:n};}
function AV2_pintar(G,blanco){ // tinta afuera; el borde de luz lo pone arte-luz.js (LUZ_sprite) con la luz de la misión
  const{g,W2,H2}=G,cv=document.createElement('canvas');cv.width=W2;cv.height=H2;const x2=cv.getContext('2d');
  const at=(x,y)=>x>=0&&y>=0&&x<W2&&y<H2?g[y*W2+x]:null;
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){const c=g[y*W2+x];
    if(c){x2.fillStyle=blanco&&c!==AV2_INK?'#ffffff':c;x2.fillRect(x,y,1,1);}
    else if(at(x-1,y)||at(x+1,y)||at(x,y-1)||at(x,y+1)){x2.fillStyle=AV2_INK;x2.fillRect(x,y,1,1);}}
  return cv;
}
const AV2_espejo=src=>{const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d');g.translate(src.width,0);g.scale(-1,1);g.drawImage(src,0,0);return c;};
// ---------- piezas compartidas ----------
// LA CABINA DE LA CHATARRA, corrida a (tx, ty). j = {casco, cuello} del que maneja o null (visor cerrado)
function AV2_cabina(o,tx,ty,n,t,j){
  const P=(x,y)=>[x+tx,y+ty],C=AV2_C;
  o.push(['r',C.TU,tx-2,ty+6,3,2]);
  o.push(['p',C.O1,[P(2,4),P(17,3),P(22,8),P(20,15),P(3,16),P(0,10)]],['r',C.O2,tx+3,ty+4,13,1],['r',C.O3,tx+3,ty+14,17,2]);
  for(let i=0;i<4;i++)o.push(['r',i%2?C.HK:C.HY,tx+4+i*3,ty+11,3,2]);
  o.push(['r',C.O3,tx+17,ty+9,1,4],['d',C.O3,[P(5,6),P(19,12),P(8,14)]]);
  o.push(['r',C.NE,tx+5,ty+6,5,5],['r',C.M1,tx+7,ty+7,15,2],['r',C.M2,tx+7,ty+7,15,1],['r',C.NE,tx+21,ty+6,3,4],['r',C.TU,tx+11,ty+7,1,2]);
  for(let y=-5;y<=0;y++)for(let x=-5;x<=5;x++){const d=Math.hypot(x+0.5,y+0.5);if(d<=5.2)o.push(['d',d>4.1?C.GL:C.GLd,[P(14+x,6+y)]]);}
  if(j)o.push(['r',j.casco,tx+12,ty+1,4,2],['r',C.PI,tx+12,ty+3,4,2],['d','#1a1a1a',[P(14,3)]],['r',j.cuello,tx+12,ty+5,4,1]);
  else o.push(['r',C.NE,tx+11,ty+2,6,3]);                                                     // sin nadie: el visor oscuro
  o.push(['d',C.GLl,[P(17,2),P(16,1)]]);
  o.push(['l',C.M1,tx+4,ty+4,tx+3,ty-4],['r',AV2_INK,tx+1,ty-7,4,4],['r',(t>>4)%2?C.G1:C.G0,tx+2,ty-6,2,2]); // antena con la luz verde
  if(n>=2)o.push(['r',C.P2a,tx+1,ty+8,3,3],['r',C.P2b,tx+1,ty+8,3,1]);
  if(n>=3)o.push(['l',C.SO,tx+3,ty+13,tx+19,ty+13],['r',C.P3a,tx+15,ty+9,4,2],['r',C.P3b,tx+15,ty+9,4,1]);
  if(n>=2)o.push(['r',n>=3&&(t>>3)%2?C.AMo:C.AM,tx+18,ty+10,2,1]);                           // ojo ámbar: II fijo, III titila
}
function AV2_rueda(o,cx,cy,r,fr,lejos){
  const i0=o.length,C=AV2_C;
  o.push(['e',lejos?'#1a1a1e':C.TI,cx,cy,r,r],['e',lejos?C.M3:C.M4,cx,cy,r-2,r-2],['e',lejos?C.M1:C.M2,cx,cy,r-3.2,r-3.2]);
  const a0=fr*Math.PI/6;
  for(let k=0;k<6;k++){const a=a0+k*Math.PI/3;o.push(['d',lejos?C.M1:C.TR,[[Math.floor(cx+Math.cos(a)*(r-0.6)),Math.floor(cy+Math.sin(a)*(r-0.6))]]]);}
  if(!lejos){for(let k=0;k<3;k++){const a=a0+k*2*Math.PI/3;o.push(['l',C.M5,Math.floor(cx),Math.floor(cy),Math.floor(cx+Math.cos(a)*(r-2.2)),Math.floor(cy+Math.sin(a)*(r-2.2))]);}
    o.push(['r',C.O1,Math.floor(cx)-1,Math.floor(cy)-1,2,2],['d',C.O3,[[Math.floor(cx),Math.floor(cy)]]]);}
  for(let i=i0;i<o.length;i++)o[i].fijo=true;
}
function AV2_resorte(o,x,y0,y1){for(let y=y0;y<=y1;y++)o.push(['r',(y-y0)%3===2?AV2_C.O3:AV2_C.O1,x,y,3,1]);}
function AV2_pua(o,x,y,d,s){const c=AV2_C.PU;
  if(d==='u')o.push(['p',c,[[x-2,y+0.5],[x+2,y+0.5],[x,y-s]]]);else if(d==='d')o.push(['p',c,[[x-2,y-0.5],[x+2,y-0.5],[x,y+s]]]);
  else if(d==='f')o.push(['p',c,[[x-0.5,y-2],[x-0.5,y+2],[x+s,y]]]);else o.push(['p',c,[[x+0.5,y-2],[x+0.5,y+2],[x-s,y]]]);}
// ---------- los dos (mirando a la derecha) ----------
// caja: {bx, by} = esquina de arriba a la izquierda de la caja de golpe en coordenadas del dibujo; piso = abajo de la caja
const AV2_DEF={
  // RESORTE · el buggy: y = 0 es el piso (todo negativo hacia arriba)
  ruedas:{w:46,h:44,y0:-44,caja:{bx:1,by:-26,w:40,h:26},escapes:[[1,-34],[4,-33]],ruedasX:[8,33],chispa:40,boca:{x:36,y:-29},
    ops(s,n,t,fr,j){const o=[],Y=y=>y+s,C=AV2_C;
      AV2_rueda(o,11,-6,6,fr,true);AV2_rueda(o,36,-6,6,fr,true);
      AV2_rueda(o,8,-6,6,fr,false);AV2_rueda(o,33,-6,6,fr,false);
      o.push(['r',C.O3,1,Y(-17),14,2],['r',C.O3,26,Y(-17),14,2]);
      o.push(['r',C.M2,1,Y(-20),39,3],['r',C.M3,1,Y(-20),39,1],['d',C.M1,[[4,Y(-19)],[13,Y(-19)],[22,Y(-19)],[31,Y(-19)]]]);
      AV2_resorte(o,7,Y(-17),-10);AV2_resorte(o,32,Y(-17),-10);
      o.push(['r',C.M2,0,Y(-27),8,7],['r',C.M4,0,Y(-27),8,1]);for(let i=0;i<2;i++)o.push(['r',C.M3,1,Y(-25+2*i),6,1]);
      o.push(['r',C.M1,1,Y(-33),2,6],['r',C.M1,4,Y(-32),2,5],['r',C.M3,1,Y(-33),2,1],['r',C.M3,4,Y(-32),2,1]);
      AV2_cabina(o,12,Y(-36),n,t,j);
      o.push(['r',C.M2,40,Y(-22),3,9],['r',C.M4,40,Y(-22),1,9]);AV2_pua(o,43,Y(-20),'f',3);AV2_pua(o,43,Y(-15),'f',3);
      if(n>=2){o.push(['r',C.P2a,3,Y(-30),4,2],['r',C.P2b,3,Y(-30),4,1]);AV2_pua(o,43,Y(-17),'f',2);}
      if(n>=3){AV2_pua(o,10,Y(-20),'u',3);AV2_pua(o,29,Y(-20),'u',3);o.push(['l',C.SO,2,Y(-18),39,Y(-18)]);AV2_pua(o,43,Y(-12),'f',4);}
      return o;}},
  // VENTARRÓN · la hélice: y = 0 arriba (el rotor), patines abajo en y = 28
  vuela:{w:44,h:30,y0:0,caja:{bx:9,by:8,w:26,h:21},escapes:[[9,14]],boca:{x:33,y:15},centro:{x:22,y:16},
    ops(s,n,t,fr,j){const o=[],C=AV2_C,r=fr%3;
      o.push(['r',C.M2,22,2,2,8]);
      const pal=(x0,x1)=>{const a=Math.min(x0,x1),w=Math.abs(x1-x0);o.push(['r',C.M3,a,0,w,2],['r',C.M4,a,0,w,1],['r',C.O1,x1<x0?x1:x1-2,0,2,2]);};
      if(r===0){pal(20,3);pal(26,43);}else if(r===1){pal(20,8);pal(26,32);}else{pal(20,15);pal(26,31);}
      o.push(['r',C.M1,19,-1,8,3],['r',C.O1,21,-1,4,1]);
      o.push(['r',C.M3,0,15,11,3],['r',C.M4,0,15,11,1]);
      for(let y=-4;y<=4;y++)for(let x=-4;x<=4;x++){const d=Math.hypot(x,y);if(d>3&&d<=4.4)o.push(['d',C.M2,[[3+x,12+y]]]);}
      const ang=[0,Math.PI/3,2*Math.PI/3][r];o.push(['l',C.M4,3-Math.round(Math.cos(ang)*3),12-Math.round(Math.sin(ang)*3),3+Math.round(Math.cos(ang)*3),12+Math.round(Math.sin(ang)*3)],['r',C.O1,2,11,2,2]);
      AV2_cabina(o,10,8,n,t,j);
      o.push(['l',C.M2,16,24,14,28],['l',C.M2,29,24,31,28],['r',C.M2,11,28,23,1],['r',C.M2,34,27,2,1]);
      if(n>=2){AV2_pua(o,35,22,'f',2);o.push(['r',C.P2a,0,17,5,2],['r',C.P2b,0,17,5,1]);}
      if(n>=3){AV2_pua(o,36,28,'f',3);AV2_pua(o,35,18,'f',4);o.push(['r',C.M2,15,25,10,3],['r',C.M4,15,25,10,1],['r',C.RU,25,25,2,3]);}
      return o;}}
};
const AV2_P=16;
const AV2_K=v=>{const a=Math.abs(v||0);return a<0.34?0:(a<0.75?0.5:1)*Math.sign(v);}; // 3 cuadros de inclinación
const AV2_CACHE=new Map();
function AV2_sprite(tipo,s,n,t,fr,k,j,flash,cara){
  const d=AV2_DEF[tipo],jk=j?j.casco+j.cuello:'-',clave=[tipo,s,n,fr,k,jk,flash?1:0,cara,(t>>4)%2,n>=3?(t>>3)%2:0].join('|');
  let c=AV2_CACHE.get(clave);if(c)return c;
  const dy=-d.y0,mov=o=>{const q=o.slice();q.fijo=o.fijo;if(q[0]==='r'||q[0]==='e')q[3]+=dy;else if(q[0]==='l'){q[3]+=dy;q[5]+=dy;}else q[2]=q[2].map(([a,b])=>[a,b+dy]);return q;};
  c=AV2_pintar(AV2_correr(AV2_grilla(d.w,d.h,d.ops(s,n,t,fr,j).map(mov),AV2_P),k,d.w/2+AV2_P),flash);
  if(cara<0)c=AV2_espejo(c); // primero se espeja y después va la luz: el lado de la luz es del mundo, no del vehículo
  if(AV2_CACHE.size>400)AV2_CACHE.clear();AV2_CACHE.set(clave,c);return c;
}
function AV2_conLuz(c,tipo,flash){ // arte-luz.js guarda el resultado por lienzo y por luz de la misión
  if(flash||typeof LUZ_sprite!=='function'||typeof LUZ_luz!=='function'||(typeof LUZ!=='undefined'&&!LUZ.on))return c;
  const l=LUZ_luz();return l?LUZ_sprite(c,l,{fuera:tipo==='vuela'}):c;}
// ---------- efectos (en píxeles enteros) ----------
const AV2_h=n=>{n=(n*2654435761)>>>0;return((n^(n>>>15))%1000)/1000;};
function AV2_bocanadas(x,y,t,rapido){ // 3 bocanadas de 2–3 px que suben y se apagan en 2 escalones
  for(let i=0;i<3;i++){const f=((t*(rapido?1.5:0.8)+i*15)%45)/45;if(f>0.8)continue;
    const s=f<0.35?2:3,cx=Math.round(x-f*5+(i-1)),cy=Math.round(y-f*14);
    ctx.fillStyle=f<0.4?'#6a6470':'#8e8896';ctx.fillRect(cx,cy,s,s);}}
function AV2_polvo(x,y,t,n,lejos){for(let i=0;i<n;i++){const f=((t*1.3+i*11)%30)/30,s=f<0.5?2:1;if(f>0.8&&i%2)continue;
  ctx.fillStyle=f<0.4?'#a88a60':'#c8aa80';ctx.fillRect(Math.round(x-f*lejos-AV2_h(i)*3),Math.round(y-1-f*7*AV2_h(i+3)),s,s);}}
function AV2_tierra(x,y,t,dir){for(let i=0;i<9;i++){const f=((t*1.6+i*7)%22)/22;ctx.fillStyle=i%3?'#6a4a30':'#8a6a44';
  ctx.fillRect(Math.round(x-dir*f*16*(0.5+AV2_h(i))),Math.round(y-2-f*12*AV2_h(i+2)+f*f*10),i%4?1:2,i%4?1:2);}}
function AV2_chispas(x,y,t,dir){for(let i=0;i<6;i++){const f=((t*2+i*7)%14)/14;ctx.fillStyle=i%3?'#ffb040':'#fff6c8';
  ctx.fillRect(Math.round(x-dir*f*12*AV2_h(i+t%5)),Math.round(y-2-f*7*AV2_h(i+1)+f*f*6),1,1);}}
function AV2_sombra(x,yPiso,w,alto){ // óvalo de 3 px que se achica en escalones de 2 px por lado con la altura
  if(alto>56)return;const paso=Math.floor(alto/8),ww=w+2-paso*4;if(ww<4)return;
  ctx.fillStyle='rgba(20,12,24,0.55)';ctx.fillRect(Math.round(x+(w-ww)/2),Math.round(yPiso),ww,1);ctx.fillRect(Math.round(x+(w-ww)/2)+1,Math.round(yPiso)-1,ww-2,3);}
function AV2_jinete(rd){if(!rd)return null;let casco='#4f6a2c',cuello='#d93a2b';try{casco=playerHelmet(rd);}catch(e){}try{cuello=CHARS[rd.ci].pal.r;}catch(e){}return{casco,cuello};}
// x, y de pantalla de un punto del dibujo (mirando a la derecha) para una caja m
function AV2_punto(tipo,m,px,py){const d=AV2_DEF[tipo],cj=d.caja,rx=px-cj.bx,ry=py-cj.by;return{x:m.x+(m.face<0?m.w-rx:rx),y:m.y+ry};}
function AV2_dibujar(tipo,m,op){
  const d=AV2_DEF[tipo],cj=d.caja,n=Math.max(1,Math.min(3,op.nivel||1)),t=op.t|0,cara=m.face<0?-1:1,k=AV2_K(op.inclina);
  const s=tipo==='ruedas'?Math.max(0,Math.min(5,op.susp|0)):0,alto=Math.max(0,op.altura|0),v=op.v||0;
  // cuadro de rueda: según lo que avanzó (trabado al derrapar) · rotor: gira montado, quieto estacionado
  const fr=tipo==='ruedas'?(op.derrape?1:((Math.floor(Math.abs(m.x)/2.5)%4)+4)%4):(op.jinete||m.ride?(t>>1)%3:0);
  const c=AV2_conLuz(AV2_sprite(tipo,s,n,t,fr,k,AV2_jinete(op.jinete),!!op.flash,cara),tipo,!!op.flash);
  const piso=m.y+m.h+alto,top=m.y-(cj.by-d.y0)-AV2_P;
  const X=cara>0?m.x-AV2_P-cj.bx:m.x-(c.width-AV2_P-(cj.bx+cj.w));
  AV2_sombra(m.x+(m.w-d.w)/2,piso,d.w,alto);
  const dyK=xx=>Math.round(k*(xx-d.w/2)/3);
  // atrás: humo (bocanadas) del escape y polvo
  if(!op.flash){
    if(tipo==='ruedas'){const vel=Math.abs(v)>0.3;
      for(const[ex,ey]of d.escapes){const p=AV2_punto(tipo,m,ex,ey+s+dyK(ex));AV2_bocanadas(p.x,p.y,t+ex*7,vel);}
      if(alto===0&&(vel||op.derrape))for(const rx of d.ruedasX){const p=AV2_punto(tipo,m,rx,0);AV2_polvo(p.x,piso,t,op.derrape?12:5,(op.derrape?14:8)*(v>=0?1:-1));}
      if(alto===0&&s>=3)for(const rx of d.ruedasX){const p=AV2_punto(tipo,m,rx,0);AV2_polvo(p.x-2,piso,t,8,10);AV2_polvo(p.x+2,piso,t+7,6,-10);} // al caer
    }else{
      if(n>=3)for(const[ex,ey]of d.escapes){const p=AV2_punto(tipo,m,ex,ey+dyK(ex));AV2_bocanadas(p.x,p.y,t,true);}
      if((op.jinete||m.ride)&&alto>0&&alto<24){const p=AV2_punto(tipo,m,22,0);AV2_polvo(p.x+8,piso,t,4,10);AV2_polvo(p.x-8,piso,t+5,4,-10);} // el viento del rotor levanta polvo
    }
  }
  ctx.drawImage(c,Math.round(X),Math.round(top));
  if(!op.flash&&tipo==='ruedas'&&op.derrape&&alto===0){const p=AV2_punto(tipo,m,8,0),q2=AV2_punto(tipo,m,d.chispa,0);AV2_tierra(p.x,piso,t,cara);AV2_chispas(q2.x,piso,t,cara);}
}
// ---------- el contrato con vehiculos2.js ----------
// TAM: caja de golpe (nivel I): la carrocería, donde pegan y donde va sentado el que maneja. Las ruedas y los patines van
// en el borde de abajo (m.y + m.h = piso). La antena, el rotor y las chimeneas se salen de la caja.
// BOCA: punta del caño (relativa a la caja, mirando a la derecha). En la hélice, CENTRO es de donde pueden salir los
// tiros en 8 direcciones (el centro de la cabina).
const V2_ARTE={
  TAM:{ruedas:{w:AV2_DEF.ruedas.caja.w,h:AV2_DEF.ruedas.caja.h},vuela:{w:AV2_DEF.vuela.caja.w,h:AV2_DEF.vuela.caja.h}},
  BOCA:{ruedas:{x:AV2_DEF.ruedas.boca.x-AV2_DEF.ruedas.caja.bx,y:AV2_DEF.ruedas.boca.y-AV2_DEF.ruedas.caja.by},
        vuela:{x:AV2_DEF.vuela.boca.x-AV2_DEF.vuela.caja.bx,y:AV2_DEF.vuela.boca.y-AV2_DEF.vuela.caja.by}},
  CENTRO:{vuela:{x:AV2_DEF.vuela.centro.x-AV2_DEF.vuela.caja.bx,y:AV2_DEF.vuela.centro.y-AV2_DEF.vuela.caja.by}},
  ruedas(m,op){try{AV2_dibujar('ruedas',m,op||{});}catch(e){}},
  vuela(m,op){try{AV2_dibujar('vuela',m,op||{});}catch(e){}}
};
