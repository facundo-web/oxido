'use strict';
// Óxido · La escena de apertura, en planos de cine (Dirección de Arte, 25 nov; guion: notas/guion/apertura.md).
// Mismos 10 s y mismos 6 planos que arma oliver.js (Código); acá va solo el DIBUJO de cada plano. Se engancha con una
// línea en oliver.js: APE_dibujar(plano, tp, t, oy, red) dibuja el plano y devuelve true (si falta, queda el dibujo viejo).
// Cómo: cada plano es una CÁMARA FIJA sobre una "foto" del escenario que ya existe (APE_foto: las capas, la niebla, el
// piso y el decorado de escenario-m10.js y escenario-m1.js, sin personajes, a la hora propia de la misión). La vista se
// arma chica, a 1 px por píxel del juego, con los sprites de siempre (OLI_, TAS_, los personajes), y se amplía ENTERA a
// ×2, ×3 o ×4 con vecino más cercano: todo queda con el mismo tamaño de píxel, nítido y sin rotate.
// Cada plano lleva lo de Hondo: fondo con capas y niebla (la foto), una luz cálida que se ve (el engranaje, el fuego del
// tacho, los faros) y un primer plano oscuro en los bordes (lianas o chatarra), más las bandas negras de 10 px.
// Va después de arte-oliver.js. Prefijo APE_.
const APE={err:null};
const APE_FOTOS=new Map();
// "foto" fija del escenario de una misión (capas, niebla, piso, decorado y plataformas; sin personajes), a 320 × 180
function APE_foto(lvl,cam,soloFondo){
  const k=lvl+'|'+cam+'|'+(soloFondo?1:0);let c=APE_FOTOS.get(k);if(c)return c;
  c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const s={ctx,L,camX,camY,VW,VH},cli=typeof CLI!=='undefined'?CLI:null,h0=cli&&cli.hora,c0=cli&&cli.clima,acc=typeof ACC!=='undefined'?ACC:null,m0=acc&&acc.mov;
  try{ctx=g;L=LEVELS[lvl];camX=cam;camY=0;VW=W;VH=H;ESC.amb=null;ESC.ambKey='';if(cli){cli.hora=null;cli.clima='despejado';}if(acc)acc.mov='completo'; // la hora propia de la misión; y la misma foto con MOVIMIENTO REDUCIDO (que cambia el paralaje)
    if(L.drawBG)L.drawBG();
    if(!soloFondo){g.save();g.translate(-cam,0);
      try{drawGround();}catch(e){}
      for(const d of L.decor||[])if(d.x>cam-60&&d.x<cam+W+10)try{drawDecor(d);}catch(e){}
      try{drawPlatforms();}catch(e){}
      g.restore();}
  }catch(e){APE.err=e;}
  finally{ctx=s.ctx;L=s.L;camX=s.camX;camY=s.camY;VW=s.VW;VH=s.VH;ESC.amb=null;ESC.ambKey='';if(cli){cli.hora=h0;cli.clima=c0;}if(acc)acc.mov=m0;}
  if(APE_FOTOS.size>8)APE_FOTOS.clear();APE_FOTOS.set(k,c);return c;
}
// el desarmadero de M1 con y sin la etiqueta VENDIDO (en la foto viene pegada: acá se le saca para los planos 3 y 4)
const APE_SX=6,APE_SY=()=>GROUND-52; // el cartel DESARMADERO en la foto: x 6–94, borde de arriba en GROUND−52
function APE_m1(vendido){
  const con=APE_foto(0,0);if(vendido)return con;let c=APE_FOTOS.get('m1sin');if(c)return c;
  c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),y=APE_SY(),R=(x,yy,w,h,col)=>{g.fillStyle=col;g.fillRect(x,yy,w,h);};
  g.drawImage(con,0,0);g.drawImage(con,96,y-14,40,14,53,y-14,40,14);             // el cielo de al lado tapa la etiqueta y el hilo
  R(APE_SX+74,y-4,8,4,'#17141f');                                               // la punta del poste
  R(APE_SX,y,88,15,'#17141f');R(APE_SX+1,y+1,86,13,'#8a4a34');R(APE_SX+1,y+1,86,1,'#c87a4a');for(let i=6;i<84;i+=11)R(APE_SX+i,y+10,1,3,'#76392f'); // el cartel, entero
  try{const t=pfLienzo('DESARMADERO','#e8d8b0');g.drawImage(t,APE_SX+Math.round((88-t.width)/2),y+3);}catch(e){}
  APE_FOTOS.set('m1sin',c);return c;
}
function APE_etiqueta(x,y){ // la etiqueta VENDIDO (la misma del portón), con su hilo
  let v=null;try{v=pfLienzo('VENDIDO','#5e462f');}catch(e){}const bw=(v?v.width:28)+6;
  ctx.fillStyle='#17141f';ctx.fillRect(x,y,bw,10);ctx.fillRect(x-2,y-4,2,1);ctx.fillStyle='#e8d8b0';ctx.fillRect(x+1,y+1,bw-2,8);if(v)ctx.drawImage(v,x+3,y+2);
  ctx.fillStyle='#d8c8a0';ctx.fillRect(x+1,y-1,1,1);ctx.fillRect(x,y-2,1,1);ctx.fillRect(x-1,y-3,1,1);return bw;
}
// ---------- la vista chica que se amplía entera ----------
const APE_OFF={};
function APE_capa(N,x0,y0,oy,fn){
  const vw=Math.ceil(W/N),vh=Math.ceil(H/N);let o=APE_OFF[N];
  if(!o){o=APE_OFF[N]=document.createElement('canvas');o.width=vw;o.height=vh;o.g=o.getContext('2d');}
  const g=o.g,c0=ctx,hl=typeof LUZ!=='undefined'&&LUZ.halos?LUZ.halos:null,nh=hl?hl.length:0;
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.imageSmoothingEnabled=false;g.clearRect(0,0,vw,vh);g.translate(-x0,-y0);
  try{ctx=g;fn(g,vw,vh);}catch(e){APE.err=e;}finally{ctx=c0;if(hl)hl.length=nh;} // los halos de arte-luz.js no se encolan acá: la luz va con APE_halo
  const s=ctx.imageSmoothingEnabled;ctx.imageSmoothingEnabled=false;ctx.drawImage(o,0,0,vw,vh,0,oy,vw*N,vh*N);ctx.imageSmoothingEnabled=s;
}
function APE_disco(x,y,r){x=Math.round(x);y=Math.round(y);for(let dy=-r;dy<=r;dy++){const w=Math.floor(Math.sqrt(r*r-dy*dy+r*0.6));ctx.fillRect(x-w,y+dy,2*w+1,1);}}
function APE_halo(x,y,r,rgb,a){ // luz en 3 discos de píxel que suman (se amplía con la vista: escalones nítidos)
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(${rgb},${(a/3).toFixed(3)})`;
  for(const k of[1,0.66,0.38])APE_disco(x,y,Math.max(1,Math.round(r*k)));ctx.restore();}
const APE_h=n=>{n=(Math.imul(n|0,2654435761))>>>0;return((n^(n>>>15))%1000)/1000;};
function APE_polvo(x,y,t,n,dir,col){for(let i=0;i<n;i++){const f=((t*1.2+i*13)%32)/32;if(f>0.85)continue;const s=f<0.4?2:3;
  ctx.fillStyle=col||(f<0.5?'#8a7a78':'#a89a96');ctx.fillRect(Math.round(x-dir*f*14-APE_h(i)*4),Math.round(y-2-f*8*APE_h(i+5)),s,s);}}
function APE_pj(ci,x,yPiso,f,corre,t,desf){ // uno de la familia, parado o corriendo (los sprites del juego)
  try{const n=corre?((t>>2)+(desf|0))%6:0;drawRig(charSet(ci,0),corre?{leg:'r'+n,ux:f?-1:1,uy:typeof RUN_BOB!=='undefined'?RUN_BOB[n]:0,lf:f}:{leg:'idle',ux:0,uy:(t>>5)%2,lf:f},f,Math.round(x)-7,Math.round(yPiso)-18);}catch(e){}
}
// ---------- el primer plano oscuro en los bordes y las bandas de cine (a tamaño de pantalla) ----------
function APE_marco(tipo,oy,t){
  const R=(x,y,w,h)=>ctx.fillRect(Math.round(x),Math.round(oy+y),w,h);
  if(tipo==='lianas'){ctx.fillStyle='#0b120d';
    for(const[x,l,k]of[[4,70,0],[14,104,1],[26,52,2],[40,30,3],[W-8,84,4],[W-20,58,5],[W-32,110,6],[W-46,36,7]]){
      const m=typeof MOV_reducido==='function'&&MOV_reducido()?0:Math.round(Math.sin(t/40+k)*1);
      R(x,0,2,l);for(let y=14+(k%3)*5;y<l;y+=17)R(x+(((y+k)>>2)%2?2:-4)+m,y,4,3);R(x-1+m,l,4,4);}
    for(let i=0;i<7;i++){R(0,10+i*4,48-i*7,4);R(W-(48-i*7),10+i*4,48-i*7,4);}                  // el follaje de arriba, en escalones
  }else{ctx.fillStyle='#0d0a12'; // chatarra: dos pilas en las esquinas de abajo y un caño
    for(const[x,w,h]of[[0,14,30],[14,10,22],[24,12,26],[36,10,14],[46,8,8],[W-10,10,16],[W-20,10,8],[W-28,8,4]])R(x,H-10-h,w,h+2); /* la de la derecha, baja: no tapa el tacho ni el camión */
    R(6,H-52,3,14);R(2,H-54,11,3);R(W-5,H-44,3,20);}
}
function APE_bandas(oy){ctx.fillStyle='#0b0a10';ctx.fillRect(0,oy,W,10);ctx.fillRect(0,oy+H-10,W,10);}
// ---------- los 6 planos ----------
function APE_dibujar(plano,tp,t,oy,red){
  if(typeof ESC==='undefined'||typeof LEVELS==='undefined'||typeof OLI_durmiendo!=='function')return false;
  try{
    const G=GROUND,ci=typeof charIdx==='number'?charIdx:0;
    if(plano<=1){ // 1 y 2 · la fachada del templo (M10) y el engranaje dorado
      const foto=APE_foto(9,340,true),Gx=180,Gy=G-68,roto=plano===1&&tp>=40,N=plano===0?4:3,x0=plano===0?Gx-40:Gx-38,y0=plano===0?Gy-22:Gy-30;
      APE_capa(N,x0,y0,oy,(g,vw,vh)=>{
        g.drawImage(foto,0,0);
        if(roto){ // el óxido AVANZA desde el hueco: celdas de 3 px, con el frente más oscuro
          const Rr=(tp-40)*1.7;for(let cy=y0-(y0%3);cy<y0+vh;cy+=3)for(let cx=x0-(x0%3);cx<x0+vw;cx+=3){
            const d=Math.hypot(cx+1-Gx,cy+1-Gy)+APE_h(cx*7+cy*13)*10-5;if(d<Rr-4){g.fillStyle='rgba(58,52,50,0.74)';g.fillRect(cx,cy,3,3);}else if(d<Rr){g.fillStyle='rgba(34,28,27,0.82)';g.fillRect(cx,cy,3,3);}}}
        else{ // haces de luz cálida en diagonal y el halo dorado que late
          g.save();g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,214,140,0.07)';
          for(const bx of[-30,-6,22])for(let y=0;y<vh;y+=2)g.fillRect(x0+bx+Math.floor(y/2)*2+20,y0+y,9,2);g.restore();
          APE_halo(Gx,Gy,20+(red?0:Math.round(Math.sin(t/14)*2)),'255,200,96',0.5);}
        if(plano===1){ // EL TASADOR, de perfil, con la palanca: una losa donde pisa, la base y el brazo en 3 cuadros
          const ly=Gy+21,px=Gx+38,k=Math.min(1,tp/36),fr=k<0.34?0:k<0.75?1:2,[dx,dy]=[[-6,-10],[0,-12],[7,-8]][fr];
          g.fillStyle='#17141f';g.fillRect(Gx+30,ly-1,60,8);g.fillStyle=roto?'#3a3634':'#5a5644';g.fillRect(Gx+31,ly,58,6);g.fillStyle=roto?'#55504c':'#8a8468';g.fillRect(Gx+31,ly,58,1);
          g.fillStyle='#17141f';g.fillRect(px-3,ly-5,8,5);g.fillStyle='#5a5e6a';g.fillRect(px-2,ly-4,6,4);
          const n=12;for(let i=0;i<=n;i++){const X=Math.round(px+dx*i/n),Y=Math.round(ly-4+dy*i/n);g.fillStyle='#17141f';g.fillRect(X-1,Y-1,4,4);}
          for(let i=0;i<=n;i++){const X=Math.round(px+dx*i/n),Y=Math.round(ly-4+dy*i/n);g.fillStyle='#8a8e9a';g.fillRect(X,Y,2,2);}
          g.fillStyle='#17141f';g.fillRect(px+dx-2,ly-4+dy-2,6,6);g.fillStyle='#ffb43a';g.fillRect(px+dx-1,ly-4+dy-1,4,4);
          try{TAS_dibujar(Gx+52,ly-1,{pose:'parado',cara:-1,t});}catch(e){}}
        if(!roto)OLI_engranajeGira(Gx,Gy,t,1);else OLI_engranajeRompe(Gx,Gy,tp-30,1);
        if(!roto&&!red)for(let i=0;i<9;i++){const f=((t*0.5+i*23)%90)/90;g.fillStyle=i%3?'#ffd88a':'#fff0c0';g.fillRect(Math.round(x0+APE_h(i*3)*vw+Math.sin((t+i*30)/25)*2),Math.round(y0+vh-f*vh),1,1);} // polvo dorado
      });
      APE_marco('lianas',oy,t);
      if(plano===1&&tp>=40){const u=tp-40; // CLAC: golpe de luz de 2 cuadros (con MOVIMIENTO REDUCIDO, un fundido claro suave)
        if(red){if(u<16){ctx.fillStyle=`rgba(255,244,214,${(0.26*(1-u/16)).toFixed(3)})`;ctx.fillRect(0,oy,W,H);}}
        else if(u<2){ctx.fillStyle=u<1?'rgba(255,248,224,0.9)':'rgba(255,240,200,0.5)';ctx.fillRect(0,oy,W,H);}}
    }else if(plano===2){ // 3 · la casa: OLIVER duerme sobre el cartel; para las orejas
      APE_capa(3,48,G-68,oy,g=>{g.drawImage(APE_m1(false),0,0);APE_fuego(t);
        OLI_collarPuesto(true);OLI_durmiendo(80,APE_SY()-1,{orejas:tp>45,cara:1});
        if(tp>45&&tp<70&&!red){g.fillStyle='#f4eee0';g.fillRect(90,APE_SY()-10-((tp-45)>>3),1,3);g.fillRect(93,APE_SY()-8-((tp-45)>>3),1,2);}}); // "oyó algo": dos rayitas
      APE_marco('chatarra',oy,t);
    }else if(plano===3){ // 4 · se lo llevan: llega el camión, la mano lo mete en la jaula y pegan VENDIDO
      const k=Math.min(1,tp/46),e=1-(1-k)*(1-k),cx=94+Math.round((1-e)*190),cerca=tp>=46&&tp<102,pegada=tp>=112;
      const camion=(jaulaLlena)=>{if(typeof AP_camion==='function')AP_camion(cx,G,false);OLI_jaula(cx+26,G-50,{largo:5,estado:'cerrada',vacia:!jaulaLlena,t:0});};
      if(!cerca)APE_capa(2,0,G-84,oy,g=>{g.drawImage(APE_m1(pegada&&tp>=114),0,0);APE_fuego(t);
        if(tp<46){OLI_collarPuesto(true);OLI_durmiendo(80,APE_SY()-1,{orejas:true,cara:1});
          g.save();g.globalCompositeOperation='lighter';for(let s=0;s<5;s++){g.fillStyle='rgba(255,236,170,0.07)';g.fillRect(cx-6-s*9,G-16-s,9,6+s*2);}g.restore(); // los faros
          if(k<1)for(const wx of[cx+10,cx+48])APE_polvo(wx,G,t,7,-1);}                                                     // frena con polvo
        camion(tp>=102);
        if(tp>=102){OLI_collarSuelto(112,G);}
        if(pegada&&tp<114){APE_etiqueta(57-1,APE_SY()-6+1);}                                                             // el golpe seco: entra 1 px corrida…
        if(pegada&&tp<122&&!red)for(let i=0;i<4;i++){g.fillStyle='#e8d8b0';g.fillRect(57+i*10+(i%2?(tp-112):-(tp-112)),APE_SY()-8-(tp-112)+i%2*14,1,1);}});
      else APE_capa(3,62,G-74,oy,g=>{g.drawImage(APE_m1(false),0,0);camion(tp>=92);
        const m=Math.min(1,(tp-46)/44),mx=80+(cx+26-80)*m,my=APE_SY()-6-Math.sin(m*Math.PI)*8+m*8;
        if(tp<92){OLI_collarPuesto(true);OLI_mano(mx,my,{oliver:true,t:tp,largo:30});}
        else{OLI_mano(cx+26,APE_SY()-6+8-(tp-92),{oliver:false,largo:30});                                               // lo soltó: la mano se va
          const u=tp-92,yy=Math.min(G,APE_SY()+6+u*u*0.35);OLI_collarSuelto(118-Math.min(6,u*0.6),yy);}                  // y el collar cae al piso
      });
      APE_marco('chatarra',oy,t);
    }else if(plano===4){ // 5 · la familia sale corriendo; el camión, chico y al fondo, se va
      APE_capa(2,0,G-84,oy,g=>{g.drawImage(APE_m1(true),0,0);APE_fuego(t);OLI_collarSuelto(112,G);});
      const cx=170+tp*tp*0.022;if(cx<W+30)APE_capa(1,0,0,oy,g=>{const y=164; /* a ×1: la mitad de tamaño que la familia; el piso de la vista ×2 queda en y 168 */
        if(typeof AP_camion==='function')AP_camion(cx,y,false);OLI_jaula(cx+26,y-50,{largo:5,estado:'cerrada',t:0});
        APE_polvo(cx+8,y,t,8,1);APE_polvo(cx-6,y-2,t+9,6,1);});
      APE_capa(2,0,G-84,oy,g=>{[ci,(ci+1)%3,(ci+2)%3].forEach((c,i)=>{const fin=104-i*20,x=Math.min(34-i*16+tp*1.7,fin);APE_pj(c,x,G,0,x<fin,t,i*2);});
        if(tp>26)try{globo((typeof TX!=='undefined'&&TX.historia&&TX.historia.apertura)||'¡OLIVER!',108,G-24,{t:tp-26,dur:120,grito:true});}catch(e){}});
      APE_marco('chatarra',oy,t);
    }else{ // 6 · el collar en el piso: entra la sombra, llega quien juega y lo levanta
      APE_capa(3,48,G-52,oy,g=>{g.drawImage(APE_m1(true),0,0);APE_fuego(t);
        const px=Math.min(100,52+tp*1.7),llego=px>=100,lev=tp>30,u=Math.min(1,(tp-30)/14);
        g.fillStyle='rgba(20,12,24,0.5)';g.fillRect(Math.round(px)-2,G,16,1);g.fillRect(Math.round(px),G+1,22,2);g.fillRect(Math.round(px)+4,G+3,24,1); // la sombra, larga hacia el collar (la luz viene del tacho)
        APE_pj(ci,px,G,0,!llego,t,0);
        const cxo=112,cyo=lev?G-u*9:G;OLI_collarSuelto(cxo-(lev?u*4:0),cyo);
        if(llego&&typeof OLI_brazo==='function'){let manga='#8f6c3b',piel='#efb88d';try{const pal=CHARS[ci].pal;manga=pal.v||manga;piel=pal.s||piel;}catch(e){}
          const k=lev?1:Math.min(1,(tp-28+6)/6);OLI_brazo(px+2,G-9,px+2+(cxo-(lev?u*4:0)-3-px-2)*Math.max(0,k),G-9+(cyo-3-(G-9))*Math.max(0,k),manga,piel);}
      });
      APE_marco('chatarra',oy,t);
    }
    APE_bandas(oy);
    return true;
  }catch(e){APE.err=e;return false;}
}
// el fuego del tacho de M1 (en la foto está quieto): llamas de píxel vivas y su luz cálida
function APE_fuego(t){const x=139,y=GROUND-12;try{if(typeof FX_llamas==='function')FX_llamas(x+1,y,8,0.6,3);}catch(e){}
  APE_halo(x+5,y-5,22+((t>>3)%2),'255,170,90',0.34);}
