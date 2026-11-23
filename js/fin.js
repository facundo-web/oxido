'use strict';
// Óxido · Caer y terminar: dos pantallas cortas que sirven para superarse
// A) ¡CAÍSTE! (estado 'over', si quedan continuaciones): hasta dónde llegaste en la misión (barrita con tu punto y una
//    marca de tu mejor intento), UN consejo según lo que te ganó (consejos.js), UNA meta próxima escrita entera (si
//    hay), y dos botones grandes: CONTINUAR (con lo que conservás) y TERMINAR.
// B) FIN DEL JUEGO (estado 'fin': sin continuaciones o al elegir TERMINAR): puntos contra tu récord, hasta dónde
//    llegaste contra tu mejor, la meta próxima y los botones OTRA VEZ / MENÚ. Las estadísticas, detrás de VER DETALLE.
//    Si el puntaje entra en el ranking, antes se escribe el nombre (historial.js) y después se vuelve acá.
// Reglas: nada en 0 ni datos que no cambian nada; textos enteros; todo con mouse; el fondo tapa el mundo y el HUD.
// Teclas: ← → eligen, ENTER/✕ confirma, ESC: TERMINAR (en A) o MENÚ (en B). Respeta TEXTO GRANDE (TXT_k, si existe).
// Prefijo FIN_.
let FIN_sel=0,FIN_det=false,FIN_desde=0,FIN_dat=null;
// ---------- oferta de AYUDAS (Investigación, propuestas.md): 3 muertes en el mismo tramo ----------
// En ¡CAÍSTE! aparece "¿Querés una ayuda para este tramo?" con SÍ (prende DAÑO REDUCIDO; se cambia en PAUSA u OPCIONES)
// y NO (no vuelve a preguntar en esa partida). Con ayudas, la partida va a la tabla aparte (accesible.js, historial.js).
// FIN_sel: 0 CONTINUAR · 1 TERMINAR · 2 SÍ · 3 NO.
let FIN_muertes={},FIN_noAyuda=false,FIN_vivoAntes=[];
const FIN_tramoKey=()=>levelIdx+':'+(typeof PC_mis!=='undefined'&&PC_mis?PC_mis.tramos.length:0);
ON_STEP.push(()=>{players.forEach((p,i)=>{if(p.dead&&FIN_vivoAntes[i]){const k=FIN_tramoKey();FIN_muertes[k]=(FIN_muertes[k]||0)+1;}FIN_vivoAntes[i]=!p.dead;});});
const FIN_ofrece=()=>!FIN_noAyuda&&!(typeof AYUDAS_on==='function'&&AYUDAS_on())&&(FIN_muertes[FIN_tramoKey()]||0)>=3&&contQuedan()>0;
// partida nueva: se olvida todo (lo llama ON_START cuando arranca una partida, no una misión)
ON_EVENT.push(t=>{if(t==='gameStart'){FIN_muertes={};FIN_noAyuda=false;}});
const FIN_tk=()=>1; // TEXTO GRANDE lo aplica txt() (base.js); acá las distancias usan TXT_aj
const FIN_ACENTO='#ffe066',FIN_GRIS='#b9adc8',FIN_ROJO='#ff6b5b';
ON_START.push(c=>{if(!c&&!PC_cont)FIN_desde=levelIdx;});
// ---------- lo que se guarda para compararte con vos mismo ----------
function FIN_leer(k){try{return JSON.parse(store.get(k)||'{}')||{};}catch(e){return{};}}
function FIN_guardar(k,o){store.set(k,JSON.stringify(o));}
// avance dentro de la misión (0–1) y el tramo
function FIN_avance(){
  let x=0;for(const p of players){const o=p.ride||p;x=Math.max(x,o.x);}
  const arenas=L.arenas||[],fin=arenas.length?arenas[arenas.length-1].at+40:(L.end||LEVEL_END||1); // la arena del villano cierra la barra
  const fr=clamp(x/fin,0,1),tramo=PC_mis?(PC_mis.cur?PC_mis.cur.n:PC_mis.tramos.length):1+arenas.filter(a=>a.at<x-40).length; // el tramo de partida.js
  return{fr,tramo:Math.min(tramo,Math.max(1,arenas.length)),total:Math.max(1,arenas.length)};
}
// al caer: anota cuánto llegaste (y lo mejor de antes, para mostrarlo)
function FIN_anotar(){
  const a=FIN_avance(),k=difficulty+'|'+levelIdx,b=FIN_leer('oxido-mejor-avance'),antes=b[k]||null;
  if(!antes||a.fr>antes.fr){b[k]={fr:a.fr,tramo:a.tramo};FIN_guardar('oxido-mejor-avance',b);}
  // lo más lejos en toda la partida (vuelta, misión, tramo), por dificultad
  const n=vuelta*1000+levelIdx*10+a.tramo,g=FIN_leer('oxido-mejor-llegada'),gk=String(difficulty),gantes=g[gk]||0;
  if(n>gantes){g[gk]=n;FIN_guardar('oxido-mejor-llegada',g);}
  FIN_dat={...a,lvl:levelIdx,antes,gantes,n,meta:typeof metaProxima==='function'?metaProxima():null,consejo:typeof consejo==='function'?consejo():null};
}
const FIN_llegadaTxt=n=>{const v=Math.floor(n/1000),l=Math.floor(n%1000/10),t=n%10;return(v>1?'vuelta '+v+' · ':'')+'misión '+(l+1)+' · tramo '+t;};
// ---------- texto en renglones (sin cortar palabras) ----------
function FIN_renglones(s,max,size){const out=[];let cur='';for(const w of s.split(' ')){const t=cur?cur+' '+w:w;if(txtW(t,size)>max&&cur){out.push(cur);cur=w;}else cur=t;}if(cur)out.push(cur);return out;}
function FIN_parrafo(s,x,y,max,size,col,al){const r=FIN_renglones(s,max,size),lh=TXT_aj(size)+2;r.forEach((l,i)=>txt(l,x,y+i*lh,size,col,al||'center',false));return r.length*lh;} // el renglón se mide con el tamaño real (TEXTO GRANDE)
// ---------- botones grandes ----------
// en táctil, los botones van dentro de la franja que dejan libre la palanca y el rombo (OXIDO_TACTIL_LIBRE de
// publicar/web/tactil.js, ya en unidades del juego; el marco de los menús solo corre en vertical, así que las x sirven tal cual)
function FIN_franja(){const lb=typeof tactilLibre==='function'?tactilLibre():null;if(!lb)return{x0:24,x1:296,tactil:false};
  return{x0:Math.max(8,lb.x0+4),x1:Math.min(312,lb.x1-4),tactil:true};}
// la letra del título del botón (se achica si el botón es angosto) y el alto que necesita para su texto
function FIN_tsBoton(w,tit,tecla){let ts=8;while(ts>5&&txtW(tit,ts)+(tecla?txtW(tecla,4)+6:0)>w-6)ts--;return ts;}
function FIN_altoBoton(w,tit,sub,tecla){const ts=FIN_tsBoton(w,tit,tecla);return Math.max(sub?40:22,TXT_aj(ts)+8+(sub?FIN_renglones(sub,w-8,4).length*(TXT_aj(4)+2)+2:0));}
function FIN_boton(x,y,w,h,tit,sub,tecla,on,clic,sobre){
  ctx.fillStyle='#120c18';ctx.fillRect(x-1.5,y-1.5,w+3,h+3);
  ctx.fillStyle=on?FIN_ACENTO:'#2a1f30';ctx.fillRect(x,y,w,h);
  if(!on){ctx.strokeStyle='#5a4a60';ctx.lineWidth=1;ctx.strokeRect(x+0.5,y+0.5,w-1,h-1);}
  const ts=FIN_tsBoton(w,tit,tecla);
  txt(tit,x+w/2,y+(sub?4:(h-TXT_aj(ts))/2),ts,on?'#120c18':'#ffffff','center',!on);
  if(sub)FIN_parrafo(sub,x+w/2,y+6+TXT_aj(ts),w-8,4,on?'#3a2a40':FIN_GRIS);
  if(tecla)txt(tecla,x+w-3,y+2,4,on?'#3a2a40':'#7a6a80','right',false); // la tecla arriba a la derecha (no se pisa con el texto)
  zona(x,y,w,h,{sobre,clic});
}
// ---------- A) ¡CAÍSTE! ----------
function FIN_updCaiste(){
  overT++;
  if(overT===1){FIN_anotar();FIN_sel=0;}
  const quedan=contQuedan()>0;
  if(!quedan){if(overT>50)FIN_terminar();return;}      // sin continuaciones: directo a FIN DEL JUEGO (después de un momento)
  if(overT<=30)return;                                  // así un disparo apretado al caer no elige nada
  const of=FIN_ofrece();if(!of&&FIN_sel>1)FIN_sel=0;
  if(pressed.left||pressed.right){FIN_sel^=1;SFX.swap();}
  else if((pressed.up||pressed.down)&&of){FIN_sel=FIN_sel>1?0:2;SFX.swap();}
  else if(pressed.up||pressed.down){FIN_sel^=1;SFX.swap();}
  if(pressed.start||pressed.jump||pressed.shoot){if(FIN_sel===0)continuar();else if(FIN_sel===1)FIN_terminar();else FIN_ayuda(FIN_sel===2);}
  else if(pressed.back||pressed.quit)FIN_terminar();
}
function FIN_caiste(){
  if(!FIN_dat||FIN_dat.lvl!==levelIdx)FIN_anotar(); // datos de esta misión (aunque la pantalla se haya abierto de otra forma)
  dim(1);const d=FIN_dat,tk=FIN_tk();
  txt(TX.caiste.titulo,W/2,10,Math.round(16*tk),FIN_ROJO,'center');
  // 1 · hasta dónde llegaste en la misión, con la marca de tu mejor intento
  const bx=50,bw=220,y1=10+TXT_aj(16)+3,by=y1+TXT_aj(5)+5;  // todo baja según el tamaño real de la letra
  txt(tx(TX.caiste.donde,{n:levelIdx+1,t:d.tramo}),W/2,y1,5,'#ffffff','center',false);
  ctx.fillStyle='#120c18';ctx.fillRect(bx-1,by-1,bw+2,6);ctx.fillStyle='#3a2f40';ctx.fillRect(bx,by,bw,4);
  const ar=L.arenas||[],finB=ar.length?ar[ar.length-1].at+40:(L.end||1);
  for(const a of ar.slice(0,-1)){const ax=bx+bw*clamp((a.at+40)/finB,0,1);ctx.fillStyle='#5a4a60';ctx.fillRect(ax-0.5,by-2,1,8);} // dónde termina cada tramo
  ctx.fillStyle='#ffffff';ctx.fillRect(bx,by,bw*d.fr,4);
  const yo=bx+bw*d.fr;ctx.fillStyle='#ffffff';ctx.fillRect(yo-1.5,by-3,3,10);
  if(d.antes&&d.antes.fr>d.fr+0.01){const mx=bx+bw*d.antes.fr;ctx.fillStyle=FIN_ACENTO;ctx.fillRect(mx-0.5,by-4,1,12);
    txt(tx(TX.caiste.tuMejor,{t:d.antes.tramo}),mx,by+9,Math.round(4*tk),FIN_ACENTO,'center',false);}
  else if(d.antes)txt(TX.caiste.masLejos,W/2,by+9,Math.round(4*tk),FIN_ACENTO,'center',false);
  // 2 · un consejo, destacado
  let y=by+10+TXT_aj(4);
  if(d.consejo){const ts=6,lh=TXT_aj(ts)+2,r=FIN_renglones(d.consejo,250,ts),h=TXT_aj(4)+6+r.length*lh;
    ctx.fillStyle='rgba(255,224,102,0.12)';ctx.fillRect(26,y,268,h);ctx.fillStyle=FIN_ACENTO;ctx.fillRect(26,y,2,h);
    txt(TX.caiste.consejo,33,y+2,4,FIN_ACENTO,'left',false);r.forEach((l,i)=>txt(l,33,y+TXT_aj(4)+4+i*lh,ts,'#ffffff','left',false));y+=h+5;}
  // 2b · la oferta de ayuda (3 muertes en este tramo): ocupa el lugar de la meta
  if(FIN_ofrece()){const h=TXT_aj(6)+TXT_aj(4)+14,yy=y;ctx.fillStyle='rgba(125,255,154,0.10)';ctx.fillRect(26,yy,268,h);ctx.fillStyle='#7dff9a';ctx.fillRect(26,yy,2,h);
    txt(TX.caiste.ofrecerAyuda,33,yy+2,6,'#ffffff','left',false);
    txt(TX.caiste.ofrecerAyudaSub,33,yy+4+TXT_aj(6),4,'#c8c0d0','left',false);
    const bw2=34,bh2=TXT_aj(6)+4,xb=294-bw2*2-8,yb=yy+2;
    for(const [i,t] of [[2,TX.palabras.si],[3,TX.palabras.no]]){const xx=xb+(i-2)*(bw2+4),on=FIN_sel===i;ctx.fillStyle=on?'#7dff9a':'rgba(18,12,24,0.8)';ctx.fillRect(xx,yb,bw2,bh2);
      ctx.strokeStyle=on?'#ffffff':'#7dff9a';ctx.lineWidth=0.8;ctx.strokeRect(xx+0.5,yb+0.5,bw2-1,bh2-1);txt(t,xx+bw2/2,yb+2,6,on?'#120c18':'#7dff9a','center',false);
      zona(xx,yb,bw2,bh2,{sobre:()=>{FIN_sel=i;},clic:()=>{if(overT>30)FIN_ayuda(i===2);}});}
    y+=h+4;}
  // 3 · una meta próxima, solo si hay (no con la oferta de ayuda: no entra)
  else if(d.meta){txt(TX.caiste.meta,W/2,y,4,FIN_GRIS,'center',false);y+=TXT_aj(4)+2;y+=FIN_parrafo(d.meta,W/2,y,260,5,'#ffffff');}
  // 4 · dos botones grandes
  const quedan=contQuedan();if(quedan<=0){txt(TX.caiste.sinContinuar,W/2,128,Math.round(7*tk),FIN_ROJO,'center');return;}
  const v=DIFF().lives,fr=FIN_franja(),tot=fr.x1-fr.x0,angosto=tot<220,hechos=PC_mis?PC_mis.tramos.length:0,total=(L.arenas||[]).length;
  const vuelve=hechos>0&&hechos<total?tx(TX.caiste.alTramo,{t:hechos+1}):TX.caiste.alPrincipio; // CONTINUAR vuelve al último tramo cerrado (partida.js)
  const sub=tx(angosto?TX.caiste.contCorto:TX.caiste.contLargo,{adonde:vuelve,n:levelIdx+1,vidas:txPl(v,TX.palabras.vida,TX.palabras.vidas).toLowerCase(),quedan:quedan===1?TX.caiste.queda1:tx(TX.caiste.quedan,{n:quedan})});
  const w1=Math.round((tot-8)*0.62),w2=tot-8-w1,k1=fr.tactil?null:btn('ok'),k2=fr.tactil?null:btn('back');
  const hb=Math.max(FIN_altoBoton(w1,TX.caiste.continuar,sub,k1),FIN_altoBoton(w2,TX.caiste.terminar,null,k2)),by2=Math.min(Math.max(y+4,116),176-hb); // con TEXTO GRANDE el botón crece
  FIN_boton(fr.x0,by2,w1,hb,TX.caiste.continuar,sub,k1,FIN_sel===0,()=>{if(overT>30)continuar();},()=>{FIN_sel=0;});
  FIN_boton(fr.x0+w1+8,by2,w2,hb,TX.caiste.terminar,null,k2,FIN_sel===1,()=>{if(overT>30)FIN_terminar();},()=>{FIN_sel=1;});
}
function FIN_ayuda(si){
  if(si&&typeof ACC_poner==='function'){ACC_poner('ayDano',true);SFX.pick();setBanner(TX.caiste.botonAyuda,90);}
  else{FIN_noAyuda=true;SFX.swap();}
  FIN_sel=0;
}
// ---------- B) FIN DEL JUEGO ----------
// registra la partida (y el nombre si hay récord, en historial.js); después, la pantalla de fin
function FIN_terminar(){
  if(!FIN_dat)FIN_anotar();
  FIN_dat.puntos=score;FIN_dat.nuevo=newRecord;FIN_dat.record=record;FIN_dat.res=resumenPartida();
  FIN_dat.stats={pa:partida?{...partida}:null,kills,rescued,disp:partida?tirosDisp-partida.d0:0,peg:partida?tirosPeg-partida.p0:0};
  const sum=FIN_dat.res;saveRecord();
  if(partida&&!partida.ended){partida.ended=true;emit('gameOver',{summary:sum});}
  const alFin=()=>{state='fin';FIN_sel=0;FIN_det=false;overT=0;};
  if(typeof histGameEnd==='function'){let r=false;try{r=histGameEnd(sum,alFin);}catch(e){console.error('histGameEnd',e);}if(r)return;}
  alFin();
}
function FIN_updFin(){
  overT++;if(overT<=12)return;
  if(pressed.left||pressed.up){FIN_sel=(FIN_sel+2)%3;SFX.swap();}
  else if(pressed.right||pressed.down){FIN_sel=(FIN_sel+1)%3;SFX.swap();}
  if(pressed.start||pressed.jump||pressed.shoot)FIN_elegir(FIN_sel);
  else if(pressed.back||pressed.quit){if(FIN_det)FIN_det=false;else FIN_elegir(1);}
}
function FIN_elegir(i){
  if(i===2){FIN_det=!FIN_det;SFX.swap();return;}
  if(i===0){state='play';startLevel(FIN_desde,false);return;}  // OTRA VEZ: misma misión de arranque, mismos personajes
  state='title';T=0;
}
function FIN_fin(){
  dim(1);const d=FIN_dat||{},tk=FIN_tk();
  txt(TX.fin.titulo,W/2,10,Math.round(14*tk),'#ffffff','center');
  if(FIN_det){FIN_detalle();}
  else{
    // 1 · puntos contra tu récord
    let y=38; // lo que no hay no deja hueco: todo sube
    if(d.puntos>0){txt(tx(TX.fin.puntos,{n:d.puntos}),W/2,y-4,10,FIN_ACENTO,'center');y+=TXT_aj(10)+4;}
    const rs=d.nuevo?TX.fin.nuevoRecord:d.record>d.puntos&&d.puntos>0?tx(TX.fin.faltan,{n:d.record-d.puntos}):null;
    if(rs){txt(rs,W/2,y-4,5,d.nuevo?FIN_ACENTO:'#ffffff','center',false);y+=TXT_aj(5)+7;}
    // 2 · hasta dónde llegaste contra tu mejor
    if(d.n){txt(tx(TX.fin.llegaste,{donde:FIN_llegadaTxt(d.n)}),W/2,y,Math.round(5*tk),'#ffffff','center',false);y+=TXT_aj(5)+3;
      if(d.gantes>d.n){txt(tx(TX.fin.tuMejor,{donde:FIN_llegadaTxt(d.gantes)}),W/2,y,Math.round(5*tk),FIN_GRIS,'center',false);y+=TXT_aj(5)+3;}
      else if(d.gantes&&d.n>d.gantes){txt(TX.fin.loMasLejos,W/2,y,Math.round(5*tk),FIN_ACENTO,'center',false);y+=TXT_aj(5)+3;}}
    // 3 · la meta próxima
    if(d.meta){y+=4;txt(TX.fin.meta,W/2,y,4,FIN_GRIS,'center',false);FIN_parrafo(d.meta,W/2,y+TXT_aj(4)+2,260,Math.round(5*tk),'#ffffff');}
  }
  // 4 · botones: OTRA VEZ / MENÚ, y VER DETALLE chico abajo
  const fr=FIN_franja(),x0=fr.tactil?fr.x0:40,x1=fr.tactil?fr.x1:280,bw=(x1-x0-8)/2;
  FIN_boton(x0,122,bw,22,TX.fin.otraVez,null,fr.tactil?null:btn('ok'),FIN_sel===0,()=>FIN_elegir(0),()=>{FIN_sel=0;});
  FIN_boton(x0+bw+8,122,bw,22,TX.fin.menu,null,fr.tactil?null:btn('back'),FIN_sel===1,()=>FIN_elegir(1),()=>{FIN_sel=1;});
  const on=FIN_sel===2,lab=FIN_det?TX.fin.ocultarDetalle:TX.fin.verDetalle,lw=txtW(lab,Math.round(5*tk))+12;
  ctx.fillStyle=on?FIN_ACENTO:'rgba(255,255,255,0.08)';ctx.fillRect(W/2-lw/2,152,lw,10);
  txt(lab,W/2,153.5,Math.round(5*tk),on?'#120c18':FIN_GRIS,'center',false);
  zona(W/2-lw/2,152,lw,10,{sobre:()=>{FIN_sel=2;},clic:()=>FIN_elegir(2)});
}
// el detalle de la partida (solo lo que no está en 0)
function FIN_detalle(){
  const s=(FIN_dat&&FIN_dat.stats)||{},pa=s.pa,secs=pa?Math.round(pa.frames/60):0,f=[];
  const add=(k,v,ok)=>{if(ok)f.push([k,v]);};
  add(TX.fin.det.puntos,(FIN_dat.puntos||0).toLocaleString('es-AR'),FIN_dat.puntos>0);add(TX.fin.det.tiempo,PC_mmss(secs),secs>0);
  add(TX.fin.det.bajas,String(s.kills),s.kills>0);add(TX.fin.det.rescates,String(pa?pa.resc:s.rescued),(pa?pa.resc:s.rescued)>0);
  add(TX.fin.det.jefes,String(pa?pa.bosses:0),pa&&pa.bosses>0);add(TX.fin.det.misiones,String(pa?pa.wins:0),pa&&pa.wins>0);
  add(TX.fin.det.punteria,s.disp?Math.round(s.peg*100/s.disp)+'%':'',s.disp>20);add(TX.fin.det.continuaste,String(pa?pa.cont:0),pa&&pa.cont>0);
  if(!f.length){txt(TX.fin.vacio,W/2,60,5,FIN_GRIS,'center',false);return;}
  f.forEach(([k,v],i)=>{const c=i%2,r=i>>1,x0=c?170:36,x1=c?284:150,y=34+r*14;
    txt(k,x0,y,5,FIN_GRIS,'left',false);txt(v,x1,y,6,'#ffffff','right',false);});
}
